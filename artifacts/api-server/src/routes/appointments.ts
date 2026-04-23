import { Router, type IRouter } from "express";
import { and, eq, inArray, or } from "drizzle-orm";
import { db, profiles, appointments, notifications } from "@workspace/db";
import {
  CreateAppointmentBody,
  UpdateAppointmentStatusBody,
  ListAppointmentsResponse,
  GetAppointmentSummaryResponse,
} from "@workspace/api-zod";
import {
  requireAuth,
  getOrCreateProfile,
  type AuthedRequest,
} from "../lib/auth";

const router: IRouter = Router();

async function profilesByIds(ids: string[]) {
  if (!ids.length) return new Map<string, typeof profiles.$inferSelect>();
  const rows = await db
    .select()
    .from(profiles)
    .where(inArray(profiles.id, ids));
  return new Map(rows.map((r) => [r.id, r]));
}

function toApi(
  appt: typeof appointments.$inferSelect,
  patient: typeof profiles.$inferSelect | undefined,
  doctor: typeof profiles.$inferSelect | undefined,
) {
  return {
    id: appt.id,
    doctorId: appt.doctorId,
    patientId: appt.patientId,
    doctorName: doctor?.name || "Doctor",
    patientName: patient?.name || "Patient",
    doctorSpecialty: doctor?.specialty ?? null,
    startsAt: appt.startsAt,
    status: appt.status as
      | "pending"
      | "accepted"
      | "rejected"
      | "completed"
      | "cancelled",
    reason: appt.reason,
    createdAt: appt.createdAt,
  };
}

router.get("/appointments", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const me = await getOrCreateProfile(userId);
  const where =
    me.role === "doctor"
      ? eq(appointments.doctorId, userId)
      : eq(appointments.patientId, userId);
  const rows = await db
    .select()
    .from(appointments)
    .where(where)
    .orderBy(appointments.startsAt);
  const ids = Array.from(
    new Set(rows.flatMap((r) => [r.patientId, r.doctorId])),
  );
  const map = await profilesByIds(ids);
  res.json(
    ListAppointmentsResponse.parse(
      rows.map((r) => toApi(r, map.get(r.patientId), map.get(r.doctorId))),
    ),
  );
});

router.post("/appointments", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const me = await getOrCreateProfile(userId);
  if (me.role !== "patient") {
    res.status(403).json({ error: "Only patients can book appointments" });
    return;
  }
  const parsed = CreateAppointmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db
    .insert(appointments)
    .values({
      patientId: userId,
      doctorId: parsed.data.doctorId,
      startsAt: parsed.data.startsAt,
      reason: parsed.data.reason,
      status: "pending",
    })
    .returning();

  // Notify the doctor
  await db.insert(notifications).values({
    userId: parsed.data.doctorId,
    kind: "appointment",
    title: "New appointment request",
    body: `${me.name || "A patient"} requested an appointment for ${created.reason}`,
    link: "/doctor/appointments",
  });

  const map = await profilesByIds([userId, parsed.data.doctorId]);
  res
    .status(201)
    .json(
      toApi(created, map.get(userId), map.get(parsed.data.doctorId)),
    );
});

router.patch(
  "/appointments/:appointmentId/status",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthedRequest).userId;
    const raw = req.params.appointmentId;
    const id = Array.isArray(raw) ? raw[0] : raw;
    if (!id) {
      res.status(400).json({ error: "appointmentId required" });
      return;
    }
    const parsed = UpdateAppointmentStatusBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [appt] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));
    if (!appt) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    // Only the assigned doctor can change status (patient can cancel)
    const isDoctor = appt.doctorId === userId;
    const isPatient = appt.patientId === userId;
    if (!isDoctor && !isPatient) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (isPatient && parsed.data.status !== "cancelled") {
      res.status(403).json({ error: "Patients can only cancel" });
      return;
    }

    const [updated] = await db
      .update(appointments)
      .set({ status: parsed.data.status })
      .where(eq(appointments.id, id))
      .returning();

    // Notify the patient
    await db.insert(notifications).values({
      userId: appt.patientId,
      kind: "appointment",
      title: `Appointment ${parsed.data.status}`,
      body: `Your appointment was ${parsed.data.status}.`,
      link: "/patient/appointments",
    });

    const map = await profilesByIds([appt.patientId, appt.doctorId]);
    res.json(toApi(updated, map.get(appt.patientId), map.get(appt.doctorId)));
  },
);

router.get(
  "/appointments/summary",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthedRequest).userId;
    const me = await getOrCreateProfile(userId);
    const where =
      me.role === "doctor"
        ? eq(appointments.doctorId, userId)
        : eq(appointments.patientId, userId);
    const rows = await db.select().from(appointments).where(where);
    const now = new Date();
    let upcoming = 0;
    let pending = 0;
    let completed = 0;
    for (const r of rows) {
      if (r.status === "pending") pending++;
      else if (r.status === "completed") completed++;
      if (
        (r.status === "accepted" || r.status === "pending") &&
        r.startsAt.getTime() > now.getTime()
      )
        upcoming++;
    }
    res.json(
      GetAppointmentSummaryResponse.parse({
        upcoming,
        pending,
        completed,
        total: rows.length,
      }),
    );
  },
);

export default router;
