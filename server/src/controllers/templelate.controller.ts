import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { TemplateService } from "../services/template.service";
import { EmailService } from "../services/email.service";
export class TemplateController {
  constructor(
    private templateService: TemplateService,
    private emailService: EmailService
  ) {}

  createTemplate = async (req: AuthRequest, res: Response): Promise<void> => { 
    try {
      const { name, json_data, html_content, category ,attachments } = req.body;
      const template = await this.templateService.createTemplate({
        user_id: req.user!.userId,
        name,
        json_data: json_data,
        html_content: html_content,
        attachments: attachments,
        category,
      });
      res.status(201).json(template);
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Failed to create template" });
    }
  };

  getUserTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const templates = await this.templateService.getUserTemplates(req.user!.userId);
      res.status(200).json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  };

  sendEmail = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { recipients, variables , subject } = req.body;
      const templateId = req.params.id;


      if (!templateId){
        res.status(400).json({ error: 'Template ID is required' });
        return;
      }

      if (!recipients || !recipients?.length) {
        res.status(400).json({ error: 'at least one receipts required Recipients are required' });
        return;
      }
      
      await this.emailService.sendEmail(
        req.user!.userId,
        templateId,
        subject,
        recipients,
        variables,
      );
      
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  };
}
