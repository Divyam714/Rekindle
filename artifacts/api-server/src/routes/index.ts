import { Router } from "express";
import healthRouter from "./health";
import conciergeRouter from "./concierge";
import usersRouter from "./users";

const router = Router();

router.use("/health", healthRouter);
router.use("/concierge", conciergeRouter);
router.use("/users", usersRouter);

export default router;