import { db, profiles, appointments, messages, documents } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export const DEMO_PATIENT_ID = "demo_patient_001";
export const DEMO_DOCTOR_ID = "demo_doctor_001";
export const DEMO_DOCTOR_2_ID = "demo_doctor_002";
export const DEMO_COOKIE = "demo_uid";

const DEMO_USERS = new Set([DEMO_PATIENT_ID, DEMO_DOCTOR_ID, DEMO_DOCTOR_2_ID]);

export function isDemoUser(id: string | null | undefined): boolean {
  return !!id && DEMO_USERS.has(id);
}

const SAMPLE_DOC_DATA_URL =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
      <rect width="600" height="800" fill="#fdf6ee"/>
      <rect x="40" y="40" width="520" height="720" rx="16" fill="#ffffff" stroke="#d6c9ba" stroke-width="2"/>
      <text x="300" y="120" text-anchor="middle" font-family="sans-serif" font-size="28" fill="#b35136" font-weight="700">Sample Medical Record</text>
      <text x="300" y="170" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#6b6159">Demo Document — Not real medical data</text>
      <line x1="80" y1="220" x2="520" y2="220" stroke="#d6c9ba"/>
      <text x="80" y="270" font-family="sans-serif" font-size="18" fill="#3d3633">Patient: Ramesh Kumar</text>
      <text x="80" y="305" font-family="sans-serif" font-size="14" fill="#6b6159">Age: 42 · Village: Anand Nagar</text>
      <text x="80" y="360" font-family="sans-serif" font-size="16" fill="#3d3633" font-weight="600">Diagnosis</text>
      <text x="80" y="390" font-family="sans-serif" font-size="14" fill="#6b6159">Mild hypertension. Advised lifestyle changes and</text>
      <text x="80" y="412" font-family="sans-serif" font-size="14" fill="#6b6159">low-dose medication for 30 days.</text>
      <text x="80" y="470" font-family="sans-serif" font-size="16" fill="#3d3633" font-weight="600">Vitals</text>
      <text x="80" y="500" font-family="sans-serif" font-size="14" fill="#6b6159">BP: 142/92 mmHg · Pulse: 78 bpm · Temp: 98.6°F</text>
      <text x="80" y="600" font-family="sans-serif" font-size="14" fill="#b35136" font-style="italic">— Dr. Sharma, General Medicine</text>
    </svg>`,
  ).toString("base64");

export async function seedDemoData(): Promise<void> {
  try {
    // Profiles (idempotent)
    await db
      .insert(profiles)
      .values([
        {
          id: DEMO_PATIENT_ID,
          role: "patient",
          name: "Ramesh Kumar",
          language: "en",
          village: "Anand Nagar",
        },
        {
          id: DEMO_DOCTOR_ID,
          role: "doctor",
          name: "Dr. Sharma",
          language: "en",
          specialty: "General Medicine",
        },
        {
          id: DEMO_DOCTOR_2_ID,
          role: "doctor",
          name: "Dr. Priya Iyer",
          language: "en",
          specialty: "Pediatrics",
        },
      ])
      .onConflictDoNothing({ target: profiles.id });

    // Appointments — only seed if none exist for this patient
    const existingAppts = await db
      .select()
      .from(appointments)
      .where(eq(appointments.patientId, DEMO_PATIENT_ID));
    if (existingAppts.length === 0) {
      const now = new Date();
      const inTwoDays = new Date(now);
      inTwoDays.setDate(now.getDate() + 2);
      inTwoDays.setHours(10, 0, 0, 0);
      const inFiveDays = new Date(now);
      inFiveDays.setDate(now.getDate() + 5);
      inFiveDays.setHours(15, 0, 0, 0);
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      lastWeek.setHours(11, 0, 0, 0);

      await db.insert(appointments).values([
        {
          patientId: DEMO_PATIENT_ID,
          doctorId: DEMO_DOCTOR_ID,
          startsAt: inTwoDays,
          status: "accepted",
          reason: "Persistent headache and high blood pressure check-up",
        },
        {
          patientId: DEMO_PATIENT_ID,
          doctorId: DEMO_DOCTOR_2_ID,
          startsAt: inFiveDays,
          status: "pending",
          reason: "Child's recurring fever",
        },
        {
          patientId: DEMO_PATIENT_ID,
          doctorId: DEMO_DOCTOR_ID,
          startsAt: lastWeek,
          status: "completed",
          reason: "General check-up — vitals and BP",
        },
      ]);
    }

    // Messages between demo patient and demo doctor
    const existingMsgs = await db
      .select()
      .from(messages)
      .where(eq(messages.senderId, DEMO_DOCTOR_ID));
    if (existingMsgs.length === 0) {
      const now = Date.now();
      const m = (offset: number, sender: string, recipient: string, body: string) => ({
        senderId: sender,
        recipientId: recipient,
        body,
        createdAt: new Date(now - offset),
      });
      await db.insert(messages).values([
        m(
          1000 * 60 * 60 * 26,
          DEMO_PATIENT_ID,
          DEMO_DOCTOR_ID,
          "Namaste doctor, I have been getting headaches every evening.",
        ),
        m(
          1000 * 60 * 60 * 25,
          DEMO_DOCTOR_ID,
          DEMO_PATIENT_ID,
          "Namaste Ramesh ji. How long has this been happening? Any other symptoms?",
        ),
        m(
          1000 * 60 * 60 * 24,
          DEMO_PATIENT_ID,
          DEMO_DOCTOR_ID,
          "About 5 days. Sometimes I feel dizzy too.",
        ),
        m(
          1000 * 60 * 60 * 23,
          DEMO_DOCTOR_ID,
          DEMO_PATIENT_ID,
          "Please measure your BP if possible. Avoid salty food. We will discuss in our appointment.",
        ),
        m(
          1000 * 60 * 60 * 2,
          DEMO_PATIENT_ID,
          DEMO_DOCTOR_ID,
          "BP was 145/95 today morning.",
        ),
        m(
          1000 * 60 * 60 * 1,
          DEMO_DOCTOR_ID,
          DEMO_PATIENT_ID,
          "Thank you. We will start a low-dose medication. See you in 2 days.",
        ),
      ]);
    }

    // Documents
    const existingDocs = await db
      .select()
      .from(documents)
      .where(eq(documents.patientId, DEMO_PATIENT_ID));
    if (existingDocs.length === 0) {
      await db.insert(documents).values([
        {
          patientId: DEMO_PATIENT_ID,
          name: "Last visit prescription.svg",
          mimeType: "image/svg+xml",
          sizeBytes: 1800,
          dataUrl: SAMPLE_DOC_DATA_URL,
          note: "Prescription from last week's check-up",
        },
        {
          patientId: DEMO_PATIENT_ID,
          name: "Blood test report.svg",
          mimeType: "image/svg+xml",
          sizeBytes: 1800,
          dataUrl: SAMPLE_DOC_DATA_URL,
          note: "Routine blood work — January",
        },
      ]);
    }

    logger.info("Demo data seeded");
  } catch (err) {
    logger.error({ err }, "Failed to seed demo data");
  }
}
