import { Response } from "express";
import multer from "multer";
import { AttachmentService } from "../services/attachment.service";
import { AuthRequest } from "../middleware/auth.middleware";

export class AttachmentController {
  constructor(private attachmentService: AttachmentService) {
    // this.upload = multer({
    //   storage: multer.memoryStorage(),
    //   limits: {
    //     fileSize: 1 * 1024 * 1024, // 5MB limit
    //   }
    // });
  }

  uploadAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }
    
      const attachment = await this.attachmentService.uploadAttachment(
        req.file,
        req.user!.userId
      );

      if (!attachment) {
       throw Error("failed to store the attachement ")
      }

      res.status(201).json(attachment);
    } catch (error) {
        console.log("error", error);
      res.status(500).json({ error: "Failed to upload attachment" });
    }
  };

  deleteAttachment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const attachmentId = req.params.id;
      await this.attachmentService.deleteAttachment(attachmentId);
      res.status(200).json({ message: "Attachment deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete attachment" });
    }
  };
}
