import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profiles, appointments, type AvailabilityDay } from "@workspace/db";
import {
  ListDoctorsResponse,
  ListDoctorSlotsResponse,
  GetMyAvailabilityResponse,
  UpdateMyAvailabilityBody,
} from "@workspace/api-zod";
import {
  requireAuth,
  getOrCreateProfile,
  type AuthedRequest,
} from "../lib/auth";

const router: IRouter = Router();

function defaultAvailability(): AvailabilityDay[] {
  // Mon-Fri 9-17
  return [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
    weekday,
    enabled: weekday >= 1 && weekday <= 5,
    startHour: 9,
    endHour: 17,
  }));
}

function normalizeAvailability(
  raw: AvailabilityDay[] | null | undefined,
): AvailabilityDay[] {
  const base = defaultAvailability();
  if (!raw || !Array.isArray(raw)) return base;
  const map = new Map<number, AvailabilityDay>(
    base.map((d) => [d.weekday, d]),
  );
  for (const d of raw) {
    if (
      typeof d?.weekday === "number" &&
      d.weekday >= 0 &&
      d.weekday <= 6 &&
      typeof d.startHour === "number" &&
      typeof d.endHour === "number"
    ) {
      map.set(d.weekday, {
        weekday: d.weekday,
        enabled: !!d.enabled,
        startHour: Math.max(0, Math.min(23, Math.floor(d.startHour))),
        endHour: Math.max(1, Math.min(24, Math.floor(d.endHour))),
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.weekday - b.weekday);
}

router.get("/doctors", requireAuth, async (_req, res): Promise<void> => {
  const docs = await db
    .select()
    .from(profiles)
    .where(eq(profiles.role, "doctor"));
  res.json(
    ListDoctorsResponse.parse(
      docs.map((d) => ({
        id: d.id,
        name: d.name || "Doctor",
        specialty: d.specialty || "General Medicine",
      })),
    ),
  );
});

router.get(
  "/doctor/me/availability",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthedRequest).userId;
    const profile = await getOrCreateProfile(userId);
    if (profile.role !== "doctor") {
      res.status(403).json({ error: "Only doctors can set availability" });
      return;
    }
    res.json(
      GetMyAvailabilityResponse.parse({
        days: normalizeAvailability(profile.availability),
      }),
    );
  },
);

router.put(
  "/doctor/me/availability",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthedRequest).userId;
    const profile = await getOrCreateProfile(userId);
    if (profile.role !== "doctor") {
      res.status(403).json({ error: "Only doctors can set availability" });
      return;
    }
    const parsed = UpdateMyAvailabilityBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    // Validate startHour < endHour per day
    for (const d of parsed.data.days) {
      if (d.startHour >= d.endHour) {
        res.status(400).json({
          error: `Day ${d.weekday}: startHour must be less than endHour`,
        });
        return;
      }
    }
    const next = normalizeAvailability(parsed.data.days);
    await db
      .update(profiles)
      .set({ availability: next })
      .where(eq(profiles.id, userId));
    res.json(GetMyAvailabilityResponse.parse({ days: next }));
  },
);

router.get(
  "/doctors/:doctorId/slots",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = req.params.doctorId;
    const doctorId = Array.isArray(raw) ? raw[0] : raw;
    if (!doctorId) {
      res.status(400).json({ error: "doctorId required" });
      return;
    }

    const [doctor] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, doctorId));
    const availability = normalizeAvailability(doctor?.availability);
    const byDay = new Map(availability.map((d) => [d.weekday, d]));

    // Generate slots for next 14 days using the doctor's weekly availability
    const now = new Date();
    const slots: { startsAt: Date; available: boolean }[] = [];
    for (let day = 0; day < 14; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      const cfg = byDay.get(date.getDay());
      if (!cfg || !cfg.enabled) continue;
      for (let hour = cfg.startHour; hour < cfg.endHour; hour++) {
        const slotDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          hour,
          0,
          0,
          0,
        );
        if (slotDate.getTime() <= now.getTime()) continue;
        slots.push({ startsAt: slotDate, available: true });
      }
    }

    const booked = await db
      .select()
      .from(appointments)
      .where(eq(appointments.doctorId, doctorId));
    const bookedSet = new Set(
      booked
        .filter((a) => a.status !== "rejected" && a.status !== "cancelled")
        .map((a) => a.startsAt.getTime()),
    );
    const final = slots.map((s) => ({
      startsAt: s.startsAt,
      available: !bookedSet.has(s.startsAt.getTime()),
    }));

    res.json(ListDoctorSlotsResponse.parse(final));
  },
);

export default router;
