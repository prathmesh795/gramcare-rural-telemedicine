import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, profiles, appointments } from "@workspace/db";
import {
  ListDoctorsResponse,
  ListDoctorSlotsResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router: IRouter = Router();

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
  "/doctors/:doctorId/slots",
  requireAuth,
  async (req, res): Promise<void> => {
    const raw = req.params.doctorId;
    const doctorId = Array.isArray(raw) ? raw[0] : raw;
    if (!doctorId) {
      res.status(400).json({ error: "doctorId required" });
      return;
    }

    // Generate slots for next 14 days, 9:00-17:00, hourly
    const now = new Date();
    const slots: { startsAt: Date; available: boolean }[] = [];
    for (let day = 0; day < 14; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() + day);
      for (let hour = 9; hour < 17; hour++) {
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

    // Mark unavailable slots from existing appointments
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
