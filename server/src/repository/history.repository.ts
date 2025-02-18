import { Pool } from "pg";
import { v4 as uuidv4 } from 'uuid';

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
        uuidv4()
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

  // async updateRecipientStatus(historyId: number, email: string, status: string) {
  //   await this.pool.query(
  //     `UPDATE email_logs
  //      SET receiver_emails = jsonb_set(
  //        receiver_emails,
  //        '{' || (
  //          SELECT array_position(
  //            ARRAY(
  //              SELECT jsonb_array_elements(receiver_emails)->>'email'
  //            ),
  //            $1
  //          ) - 1 || ',status}',
  //          '"' || $2 || '"'
  //        ),
  //        true
  //      ),
  //      last_updated = NOW()
  //      WHERE id = $3`,
  //     [email, status, historyId]
  //   );
  // }

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
}
