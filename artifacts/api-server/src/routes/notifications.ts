import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, notifications } from "@workspace/db";
import { ListNotificationsResponse } from "@workspace/api-zod";
import { requireAuth, type AuthedRequest } from "../lib/auth";

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(notifications.createdAt);
  rows.reverse();
  res.json(
    ListNotificationsResponse.parse(
      rows.slice(0, 50).map((n) => ({
        id: n.id,
        kind: n.kind as "chat" | "appointment" | "emergency" | "system",
        title: n.title,
        body: n.body,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt,
      })),
    ),
  );
});

router.delete(
  "/notifications",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthedRequest).userId;
    await db
      .update(notifications)
      .set({ read: true })
      .where(
        and(eq(notifications.userId, userId), eq(notifications.read, false)),
      );
    res.sendStatus(204);
  },
);

export default router;
