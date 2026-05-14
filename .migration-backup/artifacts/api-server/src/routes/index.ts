import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "../vms/auth";
import visitsRouter from "../vms/visits";
import usersRouter from "../vms/users";
import departmentsRouter from "../vms/departments";
import designationsRouter from "../vms/designations";
import mobileRouter from "../vms/mobile";
import settingsRouter from "../vms/settings";

const router: IRouter = Router();

router.use(healthRouter);

router.use("/v1/auth", authRouter);
router.use("/v1/visits", visitsRouter);
router.use("/v1/users", usersRouter);
router.use("/v1/departments", departmentsRouter);
router.use("/v1/designations", designationsRouter);
router.use("/v1/mobile", mobileRouter);
router.use("/v1/settings", settingsRouter);

export default router;
