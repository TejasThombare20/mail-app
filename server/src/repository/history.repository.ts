import { Pool } from "pg";
import { EmailSession, EmailLogEntry } from "../types/historyLogs.types";
import logger from "../utils/logger";

export class HistoryRepository {
  constructor(private pool: Pool) {}

  // ── Session methods ──────────────────────────────────────────────

  async createSession(data: {
    user_id: string;
    template_id: string;
    subject: string;
    global_variables: Record<string, any>;
    total_emails: number;
  }): Promise<{ id: string }> {
    const result = await this.pool.query(
      `INSERT INTO email_sessions
          (user_id, template_id, subject, global_variables, total_emails, status, started_at)
       VALUES ($1, $2, $3, $4, $5, 'in_progress', NOW())
       RETURNING id`,
      [
        data.user_id,
        data.template_id,
        data.subject,
        JSON.stringify(data.global_variables),
        data.total_emails,
      ]
    );
    return result.rows[0];
  }

  async updateSessionStatus(
    sessionId: string,
    status: string,
    sentCount: number,
    failedCount: number
  ) {
    await this.pool.query(
      `UPDATE email_sessions
       SET status = $1,
           sent_count = $2,
           failed_count = $3,
           completed_at = NOW()
       WHERE id = $4`,
      [status, sentCount, failedCount, sessionId]
    );
  }

  // ── Per-recipient email log methods ──────────────────────────────

  async createEmailLog(data: {
    session_id: string;
    user_id: string;
    template_id: string;
    recipient_email: string;
    local_variables: Record<string, any>;
    global_variables: Record<string, any>;
    subject: string;
    status: string;
  }): Promise<{ id: number }> {
    const result = await this.pool.query(
      `INSERT INTO email_logs
          (session_id, user_id, template_id, recipient_email, local_variables, global_variables, subject, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        data.session_id,
        data.user_id,
        data.template_id,
        data.recipient_email,
        JSON.stringify(data.local_variables),
        JSON.stringify(data.global_variables),
        data.subject,
        data.status,
      ]
    );
    return result.rows[0];
  }

  async updateEmailLogStatus(logId: number, status: string) {
    await this.pool.query(
      `UPDATE email_logs
       SET status = $1, last_updated = NOW()
       WHERE id = $2`,
      [status, logId]
    );
  }

  // ── Query methods ────────────────────────────────────────────────

  async getUserSessions(
    user_id: string,
    last_started_at: string | null = null
  ): Promise<EmailSession[] | null> {
    try {
      // Fetch sessions with template name
      const sessionQuery = `
        SELECT
            es.id,
            es.user_id,
            es.template_id,
            t.name AS template_name,
            es.subject,
            es.global_variables,
            es.total_emails,
            es.sent_count,
            es.failed_count,
            es.status,
            es.started_at,
            es.completed_at,
            es.created_at
        FROM email_sessions es
        LEFT JOIN templates t ON es.template_id = t.id
        WHERE es.user_id = $1
        AND ($2::timestamp IS NULL OR es.started_at < $2)
        ORDER BY es.started_at DESC
        LIMIT 10;
      `;
      const values = [
        user_id,
        last_started_at ? new Date(last_started_at).toISOString() : null,
      ];
      const sessionResult = await this.pool.query(sessionQuery, values);
      const sessions: EmailSession[] = sessionResult.rows;

      if (sessions.length === 0) return sessions;

      // Fetch email logs for all these sessions in one query
      const sessionIds = sessions.map((s) => s.id);
      const logsResult = await this.pool.query(
        `SELECT id, session_id, recipient_email, local_variables, status, sent_at, last_updated
         FROM email_logs
         WHERE session_id = ANY($1)
         ORDER BY sent_at ASC`,
        [sessionIds]
      );

      // Group logs by session_id
      const logsBySession: Record<string, EmailLogEntry[]> = {};
      for (const log of logsResult.rows) {
        if (!logsBySession[log.session_id]) {
          logsBySession[log.session_id] = [];
        }
        logsBySession[log.session_id].push(log);
      }

      // Attach logs to sessions
      for (const session of sessions) {
        session.email_logs = logsBySession[session.id] || [];
      }

      return sessions;
    } catch (error) {
      logger.error("Error while fetching user email sessions", { error });
      return null;
    }
  }

  // ── Dashboard stats ──────────────────────────────────────────────

  async getDashboardStats(user_id: string): Promise<{
    summary: {
      total_sessions: number;
      total_emails_sent: number;
      total_emails_failed: number;
      completed_sessions: number;
      failed_sessions: number;
      in_progress_sessions: number;
    };
    sessions: Array<{
      id: string;
      subject: string;
      template_name: string | null;
      status: string;
      total_emails: number;
      sent_count: number;
      failed_count: number;
      started_at: Date;
      completed_at: Date | null;
      created_at: Date;
      duration_seconds: number | null;
      recipient_companies: string[];
    }>;
  } | null> {
    try {
      // Summary stats
      const summaryResult = await this.pool.query(
        `SELECT
           COUNT(*)::int AS total_sessions,
           COALESCE(SUM(sent_count), 0)::int AS total_emails_sent,
           COALESCE(SUM(failed_count), 0)::int AS total_emails_failed,
           COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_sessions,
           COUNT(*) FILTER (WHERE status = 'failed')::int AS failed_sessions,
           COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress_sessions
         FROM email_sessions
         WHERE user_id = $1`,
        [user_id]
      );

      // Per-session details with template name and recipient companies
      const sessionsResult = await this.pool.query(
        `SELECT
           es.id,
           es.subject,
           t.name AS template_name,
           es.status,
           es.total_emails,
           es.sent_count,
           es.failed_count,
           es.started_at,
           es.completed_at,
           es.created_at,
           CASE
             WHEN es.completed_at IS NOT NULL AND es.started_at IS NOT NULL
             THEN EXTRACT(EPOCH FROM (es.completed_at - es.started_at))::int
             ELSE NULL
           END AS duration_seconds,
           COALESCE(
             ARRAY(
               SELECT DISTINCT ser.company_name
               FROM email_logs el
               JOIN sent_email_records ser ON ser.email = el.recipient_email
               WHERE el.session_id = es.id
                 AND ser.company_name IS NOT NULL
                 AND ser.company_name != ''
             ),
             '{}'
           ) AS recipient_companies
         FROM email_sessions es
         LEFT JOIN templates t ON es.template_id = t.id
         WHERE es.user_id = $1
         ORDER BY es.started_at DESC`,
        [user_id]
      );

      return {
        summary: summaryResult.rows[0],
        sessions: sessionsResult.rows,
      };
    } catch (error) {
      logger.error("Error fetching dashboard stats", { error });
      return null;
    }
  }

  // ── Legacy compat methods (kept for any existing callers) ────────

  async create(data: {
    user_id: string;
    template_id: string;
    global_variables: Record<string, any>;
    receiver_emails: Array<{
      email: string;
      status: string;
      variables: Record<string, any>;
    }>;
    subject: string;
    status: string;
  }) {
    const result = await this.pool.query(
      `INSERT INTO email_logs
          (user_id, template_id, global_variables, subject, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.user_id,
        data.template_id,
        JSON.stringify(data.global_variables),
        data.subject,
        data.status,
      ]
    );
    return result.rows[0];
  }

  async updateStatus(historyId: number, status: string) {
    await this.pool.query(
      `UPDATE email_logs
       SET status = $1, last_updated = NOW()
       WHERE id = $2`,
      [status, historyId]
    );
  }

  async updateRecipientStatus(
    historyId: number,
    email: string,
    status: string
  ) {
    // Now updates by log id and recipient email
    await this.pool.query(
      `UPDATE email_logs
       SET status = $1, last_updated = NOW()
       WHERE session_id = (SELECT session_id FROM email_logs WHERE id = $2 LIMIT 1)
         AND recipient_email = $3`,
      [status, historyId, email]
    );
  }

  async getUserLogs(
    user_id: string,
    last_sent_at: string | null = null
  ): Promise<EmailSession[] | null> {
    // Redirect to the new session-based query
    return this.getUserSessions(user_id, last_sent_at);
  }
}
