import { Router } from "express";
import { login} from "../controllers/authController";
import { UserRole } from "@prisma/client";

const router = Router();

router.post("/login", login);

export default router;
