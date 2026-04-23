import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  // Clerk user id
  id: text("id").primaryKey(),
  role: text("role").notNull().default("unset"), // patient | doctor | unset
  name: text("name").notNull().default(""),
  language: text("language").notNull().default("en"), // en | hi
  specialty: text("specialty"),
  village: text("village"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: text("patient_id").notNull(),
    doctorId: text("doctor_id").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("pending"),
    reason: text("reason").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    patientIdx: index("appt_patient_idx").on(t.patientId),
    doctorIdx: index("appt_doctor_idx").on(t.doctorId),
  }),
);

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    senderId: text("sender_id").notNull(),
    recipientId: text("recipient_id").notNull(),
    body: text("body").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    senderIdx: index("msg_sender_idx").on(t.senderId),
    recipientIdx: index("msg_recipient_idx").on(t.recipientId),
  }),
);

export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: text("patient_id").notNull(),
    name: text("name").notNull(),
    mimeType: text("mime_type").notNull(),
    sizeBytes: integer("size_bytes").notNull().default(0),
    dataUrl: text("data_url").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    patientIdx: index("doc_patient_idx").on(t.patientId),
  }),
);

export const emergencies = pgTable("emergencies", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: text("patient_id").notNull(),
  note: text("note"),
  resolved: boolean("resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  resolvedBy: text("resolved_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    link: text("link"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdx: index("notif_user_idx").on(t.userId),
  }),
);
