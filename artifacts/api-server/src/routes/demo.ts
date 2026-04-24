import { Router, type IRouter } from "express";
import {
  DEMO_COOKIE,
  DEMO_DOCTOR_ID,
  DEMO_PATIENT_ID,
  isDemoUser,
} from "../lib/demo";

const router: IRouter = Router();

const DEMO_COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

router.post("/demo/login", (req, res): void => {
  const role = (req.body?.role as string) || "patient";
  const userId = role === "doctor" ? DEMO_DOCTOR_ID : DEMO_PATIENT_ID;
  res.cookie(DEMO_COOKIE, userId, DEMO_COOKIE_OPTS);
  res.json({ userId, role: role === "doctor" ? "doctor" : "patient" });
});

router.post("/demo/logout", (_req, res): void => {
  res.clearCookie(DEMO_COOKIE, { path: "/" });
  res.json({ ok: true });
});

router.get("/demo/me", (req, res): void => {
  const demoUid = (req as typeof req & { cookies?: Record<string, string> })
    .cookies?.[DEMO_COOKIE];
  if (!demoUid || !isDemoUser(demoUid)) {
    res.json({ active: false });
    return;
  }
  res.json({
    active: true,
    userId: demoUid,
    role: demoUid === DEMO_DOCTOR_ID ? "doctor" : "patient",
  });
});

export default router;
