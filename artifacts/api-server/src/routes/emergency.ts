import { Router, type IRouter } from "express";
import { eq, inArray } from "drizzle-orm";
import { db, profiles, emergencies, notifications } from "@workspace/db";
import {
  TriggerEmergencyBody,
  ListActiveEmergenciesResponse,
} from "@workspace/api-zod";
import {
  requireAuth,
  getOrCreateProfile,
  type AuthedRequest,
} from "../lib/auth";

const router: IRouter = Router();

router.post("/emergency", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const me = await getOrCreateProfile(userId);
  const parsed = TriggerEmergencyBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [created] = await db
    .insert(emergencies)
    .values({
      patientId: userId,
      note: parsed.data.note ?? null,
      resolved: false,
    })
    .returning();

  // Notify all doctors
  const docs = await db
    .select()
    .from(profiles)
    .where(eq(profiles.role, "doctor"));
  if (docs.length) {
    await db.insert(notifications).values(
      docs.map((d) => ({
        userId: d.id,
        kind: "emergency",
        title: "EMERGENCY ALERT",
        body: `${me.name || "A patient"}${me.village ? ` (${me.village})` : ""} needs urgent help.`,
        link: "/doctor",
      })),
    );
  }

  res.status(201).json({
    id: created.id,
    patientId: created.patientId,
    patientName: me.name || "Patient",
    village: me.village,
    note: created.note,
    createdAt: created.createdAt,
    resolved: created.resolved,
    resolvedAt: created.resolvedAt,
  });
});

router.get(
  "/emergency/active",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthedRequest).userId;
    const me = await getOrCreateProfile(userId);
    if (me.role !== "doctor") {
      res.status(403).json({ error: "Doctors only" });
      return;
    }
    const rows = await db
      .select()
      .from(emergencies)
      .where(eq(emergencies.resolved, false))
      .orderBy(emergencies.createdAt);
    const ids = Array.from(new Set(rows.map((r) => r.patientId)));
    const profRows = ids.length
      ? await db.select().from(profiles).where(inArray(profiles.id, ids))
      : [];
    const map = new Map(profRows.map((p) => [p.id, p]));
    res.json(
      ListActiveEmergenciesResponse.parse(
        rows.map((r) => {
          const p = map.get(r.patientId);
          return {
            id: r.id,
            patientId: r.patientId,
            patientName: p?.name || "Patient",
            village: p?.village ?? null,
            note: r.note,
            createdAt: r.createdAt,
            resolved: r.resolved,
            resolvedAt: r.resolvedAt,
          };
        }),
      ),
    );
  },
);

router.post(
  "/emergency/:emergencyId/resolve",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthedRequest).userId;
    const me = await getOrCreateProfile(userId);
    if (me.role !== "doctor") {
      res.status(403).json({ error: "Doctors only" });
      return;
    }
    const raw = req.params.emergencyId;
    const id = Array.isArray(raw) ? raw[0] : raw;
    if (!id) {
      res.status(400).json({ error: "emergencyId required" });
      return;
    }
    const [updated] = await db
      .update(emergencies)
      .set({ resolved: true, resolvedAt: new Date(), resolvedBy: userId })
      .where(eq(emergencies.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    const [p] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, updated.patientId));
    res.json({
      id: updated.id,
      patientId: updated.patientId,
      patientName: p?.name || "Patient",
      village: p?.village ?? null,
      note: updated.note,
      createdAt: updated.createdAt,
      resolved: updated.resolved,
      resolvedAt: updated.resolvedAt,
    });
  },
);

export default router;
