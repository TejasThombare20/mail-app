import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import { Attachment } from "../types/attachment.types";

export class AttachmentRepository {
  constructor(private pool: Pool) {} // Replace 'any' with your database client type

  async create(
    attachment: Omit<Attachment, "id" | "uploaded_at">
  ): Promise<Attachment | null> {
    try {
      const result = await this.pool.query(
        `INSERT INTO attachments (file_name, file_url, file_type, file_size, user_id, filepath, expires_at, id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8 )
         RETURNING *`,
        [
          attachment.file_name,
          attachment.file_url,
          attachment.file_type,
          attachment.file_size,
          attachment.user_id,
          attachment.filepath,
          attachment.expires_at,
          uuidv4(),
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.log("error while creating attachment", error);
      return null;
    }
  }

  async findById(id: string): Promise<Attachment | null> {
    const result = await this.pool.query(
      "SELECT * FROM attachments WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  }

  async findByIds(ids: string[]): Promise<Attachment[] | null> {
    try {
      if (ids.length === 0) return [];
      const result = await this.pool.query(
        "SELECT * FROM attachments WHERE id = ANY($1::uuid[])",
        [ids]
      );
      return result?.rows;
    } catch (error) {
      console.log("error while finding attachments by ids", error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      "DELETE FROM attachments WHERE id = $1 RETURNING id",
      [id]
    );
    if (!result) {
      return false;
    }
    return true;
  }
}
