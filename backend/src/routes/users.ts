import { Router } from "express";

import {
  listUsers,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/usersController";

const router = Router();

router.get("/", listUsers);

router.post("/", createUser);

router.put("/:id", updateUser);

router.delete("/:id", deleteUser);

export default router;