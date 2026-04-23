import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profiles } from "@workspace/db";
import { UpdateMyProfileBody, GetMyProfileResponse } from "@workspace/api-zod";
import { requireAuth, getOrCreateProfile, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

function toApi(p: typeof profiles.$inferSelect) {
  return {
    id: p.id,
    role: p.role as "patient" | "doctor" | "unset",
    name: p.name,
    language: p.language as "en" | "hi",
    specialty: p.specialty,
    village: p.village,
  };
}

router.get("/me", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const profile = await getOrCreateProfile(userId);
  res.json(GetMyProfileResponse.parse(toApi(profile)));
});

router.patch("/me", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const parsed = UpdateMyProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await getOrCreateProfile(userId);
  const updates: Partial<typeof profiles.$inferInsert> = {};
  if (parsed.data.role !== undefined) updates.role = parsed.data.role;
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.language !== undefined) updates.language = parsed.data.language;
  if (parsed.data.specialty !== undefined)
    updates.specialty = parsed.data.specialty ?? null;
  if (parsed.data.village !== undefined)
    updates.village = parsed.data.village ?? null;

  const [updated] = await db
    .update(profiles)
    .set(updates)
    .where(eq(profiles.id, userId))
    .returning();
  res.json(GetMyProfileResponse.parse(toApi(updated)));
});

export default router;
