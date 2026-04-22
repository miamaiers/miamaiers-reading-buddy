import { Router, type IRouter } from "express";
import healthRouter from "./health";
import readingBuddyRouter from "./readingBuddy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(readingBuddyRouter);

export default router;
