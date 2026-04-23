import { Router, type IRouter } from "express";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { db, profiles, messages, notifications } from "@workspace/db";
import {
  SendChatMessageBody,
  ListChatMessagesResponse,
  ListChatThreadsResponse,
} from "@workspace/api-zod";
import {
  requireAuth,
  getOrCreateProfile,
  type AuthedRequest,
} from "../lib/auth";

const router: IRouter = Router();

router.get("/chat/threads", requireAuth, async (req, res): Promise<void> => {
  const userId = (req as AuthedRequest).userId;
  const rows = await db
    .select()
    .from(messages)
    .where(or(eq(messages.senderId, userId), eq(messages.recipientId, userId)))
    .orderBy(desc(messages.createdAt));

  const byOther = new Map<
    string,
    {
      lastMessage: string;
      lastMessageAt: Date;
      unread: number;
    }
  >();
  for (const m of rows) {
    const other = m.senderId === userId ? m.recipientId : m.senderId;
    const existing = byOther.get(other);
    if (!existing) {
      byOther.set(other, {
        lastMessage: m.body,
        lastMessageAt: m.createdAt,
        unread: m.recipientId === userId && !m.readAt ? 1 : 0,
      });
    } else if (m.recipientId === userId && !m.readAt) {
      existing.unread += 1;
    }
  }

  const ids = Array.from(byOther.keys());
  const profileRows = ids.length
    ? await db.select().from(profiles).where(inArray(profiles.id, ids))
    : [];
  const profMap = new Map(profileRows.map((p) => [p.id, p]));

  const threads = Array.from(byOther.entries()).map(([otherId, t]) => {
    const p = profMap.get(otherId);
    return {
      otherUserId: otherId,
      otherUserName: p?.name || "User",
      otherUserRole: (p?.role || "unset") as "patient" | "doctor" | "unset",
      lastMessage: t.lastMessage,
      lastMessageAt: t.lastMessageAt,
      unreadCount: t.unread,
    };
  });
  threads.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());

  res.json(ListChatThreadsResponse.parse(threads));
});

router.get(
  "/chat/threads/:otherUserId/messages",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthedRequest).userId;
    const raw = req.params.otherUserId;
    const otherUserId = Array.isArray(raw) ? raw[0] : raw;
    if (!otherUserId) {
      res.status(400).json({ error: "otherUserId required" });
      return;
    }

    const rows = await db
      .select()
      .from(messages)
      .where(
        or(
          and(
            eq(messages.senderId, userId),
            eq(messages.recipientId, otherUserId),
          ),
          and(
            eq(messages.senderId, otherUserId),
            eq(messages.recipientId, userId),
          ),
        ),
      )
      .orderBy(messages.createdAt);

    // Mark received as read
    await db
      .update(messages)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(messages.senderId, otherUserId),
          eq(messages.recipientId, userId),
        ),
      );

    res.json(
      ListChatMessagesResponse.parse(
        rows.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          recipientId: m.recipientId,
          body: m.body,
          createdAt: m.createdAt,
        })),
      ),
    );
  },
);

router.post(
  "/chat/threads/:otherUserId/messages",
  requireAuth,
  async (req, res): Promise<void> => {
    const userId = (req as AuthedRequest).userId;
    const raw = req.params.otherUserId;
    const otherUserId = Array.isArray(raw) ? raw[0] : raw;
    if (!otherUserId) {
      res.status(400).json({ error: "otherUserId required" });
      return;
    }
    const parsed = SendChatMessageBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const me = await getOrCreateProfile(userId);
    const [created] = await db
      .insert(messages)
      .values({
        senderId: userId,
        recipientId: otherUserId,
        body: parsed.data.body,
      })
      .returning();

    await db.insert(notifications).values({
      userId: otherUserId,
      kind: "chat",
      title: `New message from ${me.name || "User"}`,
      body: parsed.data.body.slice(0, 80),
      link: `/chat/${userId}`,
    });

    res.status(201).json({
      id: created.id,
      senderId: created.senderId,
      recipientId: created.recipientId,
      body: created.body,
      createdAt: created.createdAt,
    });
  },
);

export default router;
