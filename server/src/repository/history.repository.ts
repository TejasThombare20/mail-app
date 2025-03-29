import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import { EmailLog } from "../types/historyLogs.types";

export class HistoryRepository {
  constructor(private pool: Pool) {}

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
          (user_id, template_id, global_variables, receiver_emails, subject, status, id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
      [
        data.user_id,
        data.template_id,
        JSON.stringify(data.global_variables),
        JSON.stringify(data.receiver_emails),
        data.subject,
        data.status,
        uuidv4(),
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
    await this.pool.query(
      `UPDATE email_logs
       SET receiver_emails = (
            SELECT jsonb_agg(
            CASE    
                WHEN item->>'email' = $1 
                THEN jsonb_set(item, '{status}', to_jsonb($2::text))
                ELSE item
            END
        )
        FROM jsonb_array_elements(receiver_emails) AS item
        )
    WHERE id = $3;`,
      [email, status, historyId]
    );
  }

  async getUserLogs (user_id: string, last_sent_at : string | null = null) : Promise<EmailLog[] | null>{
    try {
      const query = `
        SELECT 
            el.id,
            el.user_id,
            el.template_id,
            t.name AS template_name,
            el.global_variables,
            el.receiver_emails,
            el.subject,
            el.status,
            el.sent_at,
            el.last_updated
        FROM email_logs el
        LEFT JOIN templates t ON el.template_id = t.id
        WHERE el.user_id = $1
        AND ($2::timestamp IS NULL OR el.sent_at < $2)
        ORDER BY el.sent_at DESC
        LIMIT 10;
    `;
      const values = [user_id,last_sent_at ? new Date(last_sent_at).toISOString() : null];
      const result = await this.pool.query(query, values);
      return result.rows 
    } catch (error) {
      console.log("error while fetching user email logs" , error);
      return null;
    }
  };
}
