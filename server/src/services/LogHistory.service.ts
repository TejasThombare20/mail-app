import { HistoryRepository } from "../repository/history.repository";
import { EmailLog } from "../types/historyLogs.types";
import logger from "../utils/logger";

export class LogHistoryService {
  constructor(private historyRepository: HistoryRepository) {}

  async getEmailLogs(
    user_id: string,
    last_sent_at: string | null
  ): Promise<EmailLog[] | null> {
    try {
      const emailLogsData = await this.historyRepository.getUserLogs(
        user_id,
        last_sent_at
      );

      if (!emailLogsData) {
        return null;
      }
      return emailLogsData;
    } catch (error) {
      logger.error("Error in getUserLogs service method", { error });
      return null;
    }
  }
}
