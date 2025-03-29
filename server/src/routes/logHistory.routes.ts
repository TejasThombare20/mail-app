import { Router } from "express";
import { LogHistoryController } from "../controllers/logHistory.controller";
import { authMiddleware } from "../middleware/auth.middleware";



export const createLogHistoryRouter = (logHistoryController: LogHistoryController): Router => {
  const router = Router();

  router.get('/:last_sent_at?',authMiddleware, logHistoryController.getUserEmailLogs);

  return router;
};