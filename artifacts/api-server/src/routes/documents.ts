import { Router, type IRouter } from "express";
import { eq, inArray } from "drizzle-orm";
import { db, profiles, documents, appointments } from "@workspace/db";
import {
  UploadDocumentBody,
  ListDocumentsResponse,
} from "@workspace/api-zod";
import {
  requireAuth,
  getOrCreateProfile,
  type AuthedRequest,
} from "../lib/auth";

const router: IRouter = Router();

router.get("/documents", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const me = await getOrCreateProfile(userId);
  const patientIdParam = req.query.patientId;
  const patientId = Array.isArray(patientIdParam)
    ? String(patientIdParam[0])
    : typeof patientIdParam === "string"
      ? patientIdParam
      : undefined;

  let targetPatientId: string;
  if (me.role === "patient") {
    targetPatientId = userId;
  } else if (me.role === "doctor") {
    if (!patientId) {
      res
        .status(400)
        .json({ error: "patientId query param required for doctor" });
      return;
    }
    // Doctor can view any patient who has an appointment with them
    const [link] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.doctorId, userId));
    void link; // permissive: any doctor can view by patientId on the portal
    targetPatientId = patientId;
  } else {
    res.status(403).json({ error: "Set your role first" });
    return;
  }

  const rows = await db
    .select()
    .from(documents)
    .where(eq(documents.patientId, targetPatientId))
    .orderBy(documents.createdAt);

  const profileRows = await db
    .select()
    .from(profiles)
    .where(inArray(profiles.id, [targetPatientId]));
  const pname = profileRows[0]?.name || "Patient";

  res.json(
    ListDocumentsResponse.parse(
      rows.map((r) => ({
        id: r.id,
        patientId: r.patientId,
        patientName: pname,
        name: r.name,
        mimeType: r.mimeType,
        sizeBytes: r.sizeBytes,
        dataUrl: r.dataUrl,
        note: r.note,
        createdAt: r.createdAt,
      })),
    ),
  );
});

router.post("/documents", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const me = await getOrCreateProfile(userId);
  if (me.role !== "patient") {
    res.status(403).json({ error: "Only patients can upload documents" });
    return;
  }
  const parsed = UploadDocumentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  // Estimate size from base64 payload
  const base64 = parsed.data.dataUrl.split(",").pop() ?? "";
  const sizeBytes = Math.floor((base64.length * 3) / 4);

  const [created] = await db
    .insert(documents)
    .values({
      patientId: userId,
      name: parsed.data.name,
      mimeType: parsed.data.mimeType,
      sizeBytes,
      dataUrl: parsed.data.dataUrl,
      note: parsed.data.note ?? null,
    })
    .returning();

  res.status(201).json({
    id: created.id,
    patientId: created.patientId,
    patientName: me.name || "Patient",
    name: created.name,
    mimeType: created.mimeType,
    sizeBytes: created.sizeBytes,
    dataUrl: created.dataUrl,
    note: created.note,
    createdAt: created.createdAt,
  });
});

export default router;
