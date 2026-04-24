import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import doctorsRouter from "./doctors";
import appointmentsRouter from "./appointments";
import chatRouter from "./chat";
import documentsRouter from "./documents";
import symptomsRouter from "./symptoms";
import emergencyRouter from "./emergency";
import notificationsRouter from "./notifications";
import demoRouter from "./demo";

const router: IRouter = Router();

router.use(healthRouter);
router.use(demoRouter);
router.use(profileRouter);
router.use(doctorsRouter);
router.use(appointmentsRouter);
router.use(chatRouter);
router.use(documentsRouter);
router.use(symptomsRouter);
router.use(notificationsRouter);
router.use(emergencyRouter);

export default router;
