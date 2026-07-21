import { Router, type IRouter } from "express";
import healthRouter from "./health";
import strategyRouter from "./strategy";
import playbooksRouter from "./playbooks";
import foco360Router from "./foco360";

const router: IRouter = Router();

router.use(healthRouter);
router.use(strategyRouter);
router.use(playbooksRouter);
router.use(foco360Router);

export default router;
