import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "../vms/auth.js";
import visitsRouter from "../vms/visits.js";
import usersRouter from "../vms/users.js";
import departmentsRouter from "../vms/departments.js";
import designationsRouter from "../vms/designations.js";

const router: IRouter = Router();

router.use(healthRouter);

router.use("/v1/auth", authRouter);
router.use("/v1/visits", visitsRouter);
router.use("/v1/users", usersRouter);
router.use("/v1/departments", departmentsRouter);
router.use("/v1/designations", designationsRouter);

export default router;
