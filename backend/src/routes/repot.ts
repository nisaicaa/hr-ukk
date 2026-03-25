// src/routes/reportRoutes.ts

import express from "express"
import {hrReport,financeReport,adminReport} from "../controllers/repotController"

const router = express.Router()

router.get("/hr",hrReport)

router.get("/finance",financeReport)

router.get("/admin",adminReport)

export default router 