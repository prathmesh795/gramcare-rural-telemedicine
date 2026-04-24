import { getAuth } from "@clerk/express";
import { type Request, type Response, type NextFunction } from "express";
import { db, profiles } from "@workspace/db";
import { eq } from "drizzle-orm";
import { DEMO_COOKIE, isDemoUser } from "./demo";

export interface AuthedRequest extends Request {
  userId: string;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // Demo mode: if a valid demo cookie is present, use it instead of Clerk
  const demoUid = (req as Request & { cookies?: Record<string, string> })
    .cookies?.[DEMO_COOKIE];
  if (demoUid && isDemoUser(demoUid)) {
    (req as AuthedRequest).userId = demoUid;
    next();
    return;
  }
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as AuthedRequest).userId = userId;
  next();
}

export async function getOrCreateProfile(userId: string) {
  const [existing] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId));
  if (existing) return existing;
  const [created] = await db
    .insert(profiles)
    .values({ id: userId, role: "unset", name: "", language: "en" })
    .returning();
  return created;
}

export async function requireRole(
  userId: string,
  role: "patient" | "doctor",
): Promise<boolean> {
  const profile = await getOrCreateProfile(userId);
  return profile.role === role;
}
