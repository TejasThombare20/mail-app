import { Pool } from "pg";
import { v4 as uuidv4 } from 'uuid';
import { ITemplate } from "../types/template.types";

export class TemplateRepository {
    constructor(private pool: Pool) {}
  
    async createTemplate(template: Omit<ITemplate, 'id' | 'created_at' | 'updated_at'>): Promise<ITemplate> {
      const query = `
        INSERT INTO templates (user_id, name, json_data, html_content, attachments, category, id )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const values = [
        template?.user_id,
        template?.name,
        template?.json_data,
        template?.html_content,
        template?.attachments,
        template?.category,
        uuidv4()
      ];
      const result = await this.pool.query(query, values);
      return result.rows[0];
    }
  
    async getUserTemplates(userId: string): Promise<ITemplate[]> {
      const query = 'SELECT * FROM templates WHERE user_id = $1 ORDER BY created_at DESC';
      const result = await this.pool.query(query, [userId]);
      return result.rows;
    }

    async getTemplateById(id: string): Promise<ITemplate | null> {
      try {
      const result = await this.pool.query(
         `SELECT * FROM templates WHERE id = $1;`,
        [id]
      );
      
      if (!result.rows[0]) return null;
      
      const template = result.rows[0];
      template.attachments = template.attachments[0] ? template.attachments : [];
      
      return template;

    } catch (error) {
      console.log("error while getting template by id", error);
      return null;
    }
    }


    async updateTemplate(
      id: number,
      template: Partial<{
        name: string;
        subject: string;
        html_content: string;
        attachment_ids: number[];
      }>
    ): Promise<ITemplate | null> {
      const setClause = Object.entries(template)
        .map(([key, _], index) => `${key} = $${index + 2}`)
        .join(', ');
  
      const result = await this.pool.query(
        `UPDATE templates 
         SET ${setClause}
         WHERE id = $1
         RETURNING *`,
        [id, ...Object.values(template)]
      );
      
      return result.rows[0] || null;
    }
  }
  

  
  