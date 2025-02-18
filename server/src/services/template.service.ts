import { AttachmentRepository } from "../repository/attachment.repository";
import { TemplateRepository } from "../repository/template.repository";
import { ITemplate } from "../types/template.types";


export class TemplateService {
  constructor(
    private templateRepository: TemplateRepository,
    private attachmentRepository: AttachmentRepository
  ) {}

  async createTemplate(
    templateData: Omit<ITemplate, "id" | "created_at" | "updated_at">
  ): Promise<ITemplate> {
    console.log({ templateData });

    if (templateData.attachments?.length > 0) {
      const attachments = await this.attachmentRepository.findByIds(
        templateData.attachments
      );

      if (!attachments){
        throw new Error("Unbable to find attachments");
      }

      if (attachments.length !== templateData.attachments.length) {
        throw new Error("One or more attachment IDs are invalid");
      }
    }

    console.log("Hello")

    return this.templateRepository.createTemplate(templateData);
  }

  async getUserTemplates(userId: string): Promise<ITemplate[]> {
    return this.templateRepository.getUserTemplates(userId);
  }

  async getTemplateById(templateId: string): Promise<ITemplate | null> {
    return this.templateRepository.getTemplateById(templateId);
  }
}
