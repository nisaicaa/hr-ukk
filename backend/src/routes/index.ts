import { Router } from "express";
import auth from "./auth";
import users from "./users";
import employees from "./employees";
import attendance from "./attendance";
import leave from "./leave";
import overtime from "./overtime";
import payroll from "./payroll";
import logs from "./logs";
import repot from "./repot";

const router = Router();

router.use("/auth", auth);
router.use("/users", users);
router.use("/employees", employees);
router.use("/attendance", attendance);
router.use("/leave", leave);
router.use("/overtime", overtime);
router.use("/payroll", payroll);
router.use("/logs", logs);
router.use("/reports", repot);

export default router;
