import { MediaStorage } from "../config/media-storage";
import { AttachmentRepository } from "../repository/attachment.repository";
import { Attachment, EmailAttachment, UploadedFile } from "../types/attachment.types";
import axios from "axios";

export class AttachmentService {
  constructor(
    private attachmentRepository: AttachmentRepository,
    private mediaStorage: MediaStorage
  ) {}

  async uploadAttachment(
    file: UploadedFile,
    userId: string
  ): Promise<Attachment | null> {
    try {
      const mediaStorageData = await this.mediaStorage.uploadFile(file, userId);

      if (!mediaStorageData) {
        throw new Error("Failed to upload attachment on cloud storage");
      }

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      const attachment = await this.attachmentRepository.create({
        file_name: file.originalname,
        file_url: mediaStorageData.signedUrl,
        file_type: file.mimetype,
        file_size: file.size,
        user_id: userId,
        filepath: mediaStorageData.filePath,
        expires_at: expiresAt,
      });

      if (!attachment) {
        return null;
      }

      return attachment;
    } catch (error) {
      console.log("error", error);
      return null;
    }
  }

  async getAttachmentsByIds(ids: string[]): Promise<Attachment[] | null> {
    const attachments = this.attachmentRepository.findByIds(ids);

    if (!attachments) {
      return null;
    }

    return attachments;
  }

  async deleteAttachment(id: string): Promise<void> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) {
      throw new Error("Attachment not found");
    }

    const isDeletedSuccessful = await this.mediaStorage.deleteFile(
      attachment.file_url
    );

    if (!isDeletedSuccessful) {
      console.log("Failed to delete attachment from cloud storage");
      return;
    }

    const isDeletedSuccessfromDB = await this.attachmentRepository.delete(id);

    if (!isDeletedSuccessfromDB) {
      console.log("Failed to delete attachment from database");
    }
    return;
  }

  async getAttachmentBase64(attachment: Attachment) : Promise<EmailAttachment | null> {
    
    if (new Date(attachment.expires_at) < new Date()) {
      console.log(
        `URL expired for file: ${attachment.file_name}, regenerating...`
      );
      const signUrl = await this.mediaStorage.generateSignedUrl(
        attachment.filepath
      );

      if (!signUrl) {
        console.log("Failed to generate new  signed URL");
        return null;
      }
      attachment.file_url = signUrl;
    }

    try {
      const response = await axios.get(attachment.file_url, {
        responseType: "arraybuffer",
      });

      if (!response.data) {
        console.log("Failed to fetch attachment data");
        return null;
      }

      return {
        filename: attachment.file_name,
        content: Buffer.from(response.data).toString("base64"),
        mimeType:
          response.headers["content-type"] || "application/octet-stream",
      };
    } catch (error) {
      console.error(
        `Error fetching attachment ${attachment.file_name}:`,
        error
      );
      return null;
    }
  }
}
