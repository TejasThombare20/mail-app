import { google } from "googleapis";
import { gmail_v1 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { TokenRepository } from "../repository/token.repository";
import { TemplateRepository } from "../repository/template.repository";
import { HistoryRepository } from "../repository/history.repository";
import { EmailStatus } from "../types/template.types";
import {
  checkMXRecord,
  createEmailBody,
  isValidEmail,
} from "../utils/validate-email";
import { AttachmentRepository } from "../repository/attachment.repository";
import { Attachment, EmailAttachment } from "../types/attachment.types";
import { AttachmentService } from "./attachment.service";

export class EmailService {
  private oauth2Client: OAuth2Client;
  constructor(
    private tokenRepository: TokenRepository,
    private templateRepository: TemplateRepository,
    private historyRepository: HistoryRepository,
    private attahcmentRepository: AttachmentRepository,
    private attachmentService: AttachmentService
  ) {
    this.oauth2Client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    });
  }

  async refreshAccessToken(userId: string): Promise<string> {
    const userToken = await this.tokenRepository.getUserToken(userId);
    if (!userToken?.refresh_token) {
      throw new Error("No refresh token available");
    }

    try {
      this.oauth2Client.setCredentials({
        refresh_token: userToken.refresh_token,
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();

      // Update tokens in database
      await this.tokenRepository.saveUserToken(
        userId,
        credentials.access_token!,
        new Date(credentials.expiry_date!),
        userToken.refresh_token // Keep existing refresh token
      );

      return credentials.access_token!;
    } catch (error) {
      throw new Error("Failed to refresh access token");
    }
  }

  private async getGmailClient(userId: string): Promise<gmail_v1.Gmail> {
    try {
      const userToken = await this.tokenRepository.getUserToken(userId);

      // Check if token is expired or will expire in the next 5 minutes
      const isExpired =
        new Date(userToken?.token_expiry!) <=
        new Date(Date.now() + 5 * 60 * 1000);

      if (isExpired) {
        const newAccessToken = await this.refreshAccessToken(userId);
        this.oauth2Client.setCredentials({ access_token: newAccessToken });
      } else {
        this.oauth2Client.setCredentials({
          access_token: userToken?.google_token,
        });
      }

      return google.gmail({ version: "v1", auth: this.oauth2Client });
    } catch (error) {
      throw new Error("Failed to initialize Gmail client");
    }
  }

  async sendEmail(
    userId: string,
    templateId: string,
    subject: string,
    recipients: Array<{ email: string; variables: Record<string, any> }>,
    globalVariables: Record<string, any>
  ) {
    const gmail = await this.getGmailClient(userId);
    const template = await this.templateRepository.getTemplateById(templateId);
    console.log("template", template);
    if (!template) {
      throw new Error("Template not found");
    }

    let attachements: (EmailAttachment | null)[] = [];
    if (template.attachments?.length > 0) {
      const attachmentsData = await this.attahcmentRepository.findByIds(
        template?.attachments
      );
      if (!attachmentsData) {
        console.log("Unable to find attachments");
        return;
      }
      if (attachmentsData.length !== template.attachments.length) {
        console.log("One or more attachment IDs are invalid");
        return;
      }

      console.log("attachmentsData",attachmentsData)

      const bufferedAttachmentsData = await Promise.all(
        attachmentsData.map((attachment) =>
          this.attachmentService.getAttachmentBase64(attachment)
        )
      );

      attachements = bufferedAttachmentsData;
    }

    // Create history record with initial status
    const historyRecord = await this.historyRepository.create({
      user_id: userId,
      template_id: templateId,
      global_variables: globalVariables,
      receiver_emails: recipients.map((r) => ({
        email: r?.email,
        status: "queued",
        variables: r?.variables,
      })),
      subject: subject,
      status: "pending",
    });

    const emailStatuses: EmailStatus[] = [];

    for (const recipient of recipients) {
      let personalizedHtml = template?.html_content;

      if (
        !isValidEmail(recipient.email) ||
        !(await checkMXRecord(recipient.email))
      ) {
        console.log(`Invalid email detected: ${recipient.email}`);
        emailStatuses.push({ email: recipient.email, status: "invalid" });
        continue;
      }

      // Replace global variables
      Object.entries(globalVariables).forEach(([key, value]) => {
        personalizedHtml = personalizedHtml.replace(
          new RegExp(`{{${key}}}`, "g"),
          String(value)
        );
      });

      // Replace recipient-specific variables
      Object.entries(recipient.variables).forEach(([key, value]) => {
        personalizedHtml = personalizedHtml.replace(
          new RegExp(`{{${key}}}`, "g"),
          String(value)
        );
      });

      // const encodedMessage = Buffer.from(
      //   `To: ${recipient?.email}\r\n` +
      //     `Subject: ${subject}\r\n` +
      //     "Content-Type: text/html; charset=utf-8\r\n" +
      //     "MIME-Version: 1.0\r\n" +
      //     "\r\n" +
      //     personalizedHtml
      // )
      //   .toString("base64")
      //   .replace(/\+/g, "-")
      //   .replace(/\//g, "_");
      const emailBody = createEmailBody(
        recipient,
        subject,
        personalizedHtml,
        attachements
      );

      // Encode the entire message
      const encodedMessage = Buffer.from(emailBody)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

      try {
        const response = await gmail.users.messages.send({
          userId: "me",
          requestBody: { raw: encodedMessage },
        });

        if (response?.status === 200) {
          emailStatuses.push({
            email: recipient?.email,
            status: "sent",
            variables: recipient?.variables,
          });
          // Update individual recipient status
          await this.historyRepository.updateRecipientStatus(
            historyRecord.id,
            recipient.email,
            "sent"
          );
        } else {
          emailStatuses.push({
            email: recipient.email,
            status: "failed",
            variables: recipient.variables,
          });

          // Update individual recipient status
          await this.historyRepository.updateRecipientStatus(
            historyRecord.id,
            recipient.email,
            "failed"
          );
        }
        console.log(`response of email ${recipient?.email}`, response?.data);

        console.log("db updated");
      } catch (emailError) {
        console.error(
          `Error while sending email to ${recipient?.email}:`,
          emailError
        );

        emailStatuses.push({
          email: recipient?.email,
          status: "failed",
          variables: recipient?.variables,
        });

        try {
          await this.historyRepository.updateRecipientStatus(
            historyRecord.id,
            recipient?.email,
            "failed"
          );
        } catch (dbError) {
          console.error(`DB update failed for ${recipient?.email}:`, dbError);
        }
      }
    }
    // Update overall history status
    const finalStatus = emailStatuses.every((s) => s.status === "sent")
      ? "sent"
      : "failed";
    await this.historyRepository.updateStatus(historyRecord.id, finalStatus);

    return emailStatuses;
  }
}
