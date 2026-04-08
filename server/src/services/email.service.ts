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
  extractReceiverNameFromEmail,
  isValidEmail,
} from "../utils/validate-email";
import { AttachmentRepository } from "../repository/attachment.repository";
import { Attachment, EmailAttachment } from "../types/attachment.types";
import { AttachmentService } from "./attachment.service";
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import pool from '../config/database';

// Helper function to add delay between emails
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
    recipients: string[],
    local_variables: Array<{ key: string; description: string; id: string; recipient_email?: string; value?: string }>,
    global_variables: Array<{ key: string; value: string; id: string }>
  ) {
    const gmail = await this.getGmailClient(userId);

    const template = await this.templateRepository.getTemplateById(
      templateId,
      userId
    );

    if (!template) {
      throw new Error("Template not found");
    }

    // Load attachments from template
    let attachements: (EmailAttachment | null)[] = [];
    if (template.attachments?.length > 0) {
      const attachmentsData = await this.attahcmentRepository.findByIds(
        template?.attachments
      );
      if (!attachmentsData) {
        logger.error("Unable to find attachments", { templateId });
        throw new Error("Failed to laod attachments");
      }
      if (attachmentsData.length !== template.attachments.length) {
        logger.error("One or more attachment IDs are invalid", { templateId });
        throw new Error("One or more attachment IDs are invalid");
        return;
      }

      const bufferedAttachmentsData = await Promise.all(
        attachmentsData.map((attachment) =>
          this.attachmentService.getAttachmentBase64(attachment, userId)
        )
      );

      attachements = bufferedAttachmentsData;
    }

    // If no template attachments and DEFAULT_ATTACHMENT_ENABLED is true, attach the default local PDF
    if (attachements.length === 0 && process.env.DEFAULT_ATTACHMENT_ENABLED === 'true') {
      try {
        const attachmentDir = process.env.DEFAULT_ATTACHMENT_DIR;
        const attachmentFileName = process.env.DEFAULT_ATTACHMENT_FILE_NAME!;

        if (!attachmentFileName) {
          throw new Error('DEFAULT_ATTACHMENT_FILE_NAME env variable is not set');
        }

        const pdfPath = path.join(process.cwd(), attachmentDir!, attachmentFileName);
        const pdfContent = fs.readFileSync(pdfPath);

        const localPdfAttachment: EmailAttachment = {
          filename: attachmentFileName,
          content: pdfContent.toString('base64'),
          mimeType: 'application/pdf',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          file_url: `file://${pdfPath}`,
        };

        attachements.push(localPdfAttachment);
        logger.info("Default  attachment added", { pdfPath });
      } catch (error) {
        logger.error("Failed to load default attachment", { error });
      }
    }

    // Create session record
    const session = await this.historyRepository.createSession({
      user_id: userId,
      template_id: templateId,
      subject: subject,
      global_variables: global_variables,
      total_emails: recipients.length,
    });

    const emailStatuses: EmailStatus[] = [];
    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      let personalizedHtml = template?.html_content;
      let personalizedSubject = subject;

      if (!isValidEmail(recipient) || !(await checkMXRecord(recipient))) {
        logger.warn("Invalid email detected", { recipient });
        emailStatuses.push({ email: recipient, status: "invalid" });
        failedCount++;

        // Log the invalid email
        await this.historyRepository.createEmailLog({
          session_id: session.id,
          user_id: userId,
          template_id: templateId,
          recipient_email: recipient,
          local_variables: [],
          global_variables: global_variables,
          subject: subject,
          status: "invalid",
        });
        continue;
      }

      // Replace global variables in both HTML and subject
      global_variables.forEach(({ key, value }) => {
        const regex = new RegExp(`{{${key}}}`, "g");
        personalizedHtml = personalizedHtml.replace(regex, String(value));
        personalizedSubject = personalizedSubject.replace(regex, String(value));
      });

      // Find per-recipient local variables (those with recipient_email and value set)
      const recipientLocalVars = local_variables.filter(
        (v) => v.recipient_email && v.recipient_email === recipient && v.value
      );

      if (recipientLocalVars.length > 0) {
        // Use per-recipient local variable values for replacement in HTML and subject
        recipientLocalVars.forEach(({ key, value }) => {
          const regex = new RegExp(`{{${key}}}`, "g");
          personalizedHtml = personalizedHtml.replace(regex, String(value));
          personalizedSubject = personalizedSubject.replace(regex, String(value));
        });
      } else {
        // Fallback: extract receiver name from email for {{receiver_name}}
        const receiverName = extractReceiverNameFromEmail(recipient);
        const nameRegex = new RegExp(`{{receiver_name}}`, "g");
        personalizedHtml = personalizedHtml.replace(nameRegex, receiverName);
        personalizedSubject = personalizedSubject.replace(nameRegex, receiverName);

        // Also apply any generic local variables (without recipient_email)
        local_variables
          .filter((v) => !v.recipient_email)
          .forEach(({ key, value }) => {
            if (value) {
              const regex = new RegExp(`{{${key}}}`, "g");
              personalizedHtml = personalizedHtml.replace(regex, String(value));
              personalizedSubject = personalizedSubject.replace(regex, String(value));
            }
          });
      }

      // Create per-recipient email log with "pending" status
      const recipientVarsForLog = recipientLocalVars.length > 0
        ? recipientLocalVars
        : local_variables.filter((v) => !v.recipient_email || v.recipient_email === recipient);

      const emailLog = await this.historyRepository.createEmailLog({
        session_id: session.id,
        user_id: userId,
        template_id: templateId,
        recipient_email: recipient,
        local_variables: recipientVarsForLog,
        global_variables: global_variables,
        subject: personalizedSubject,
        status: "pending",
      });

      const emailBody = createEmailBody(
        recipient,
        personalizedSubject,
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
          emailStatuses.push({ email: recipient, status: "sent" });
          sentCount++;

          await this.historyRepository.updateEmailLogStatus(emailLog.id, "sent");

          // Upsert into sent_email_records
          try {
            const firstName = recipientLocalVars.find((v) => v.key === "receiver_name")?.value
              || extractReceiverNameFromEmail(recipient);
            const companyName = global_variables.find((v) => v.key === "company_name")?.value || null;

            await pool.query(
              `INSERT INTO sent_email_records (first_name, email, company_name, sent_at)
               VALUES ($1, $2, $3, NOW())
               ON CONFLICT (email) DO UPDATE
                 SET first_name = EXCLUDED.first_name,
                     company_name = COALESCE(EXCLUDED.company_name, sent_email_records.company_name),
                     sent_at = EXCLUDED.sent_at`,
              [firstName, recipient, companyName]
            );
          } catch (recordErr) {
            logger.error("Failed to upsert sent_email_record", { recipient, error: recordErr });
          }
        } else {
          emailStatuses.push({ email: recipient, status: "failed" });
          failedCount++;
          await this.historyRepository.updateEmailLogStatus(emailLog.id, "failed");
        }
        logger.info("Email sent successfully", { recipient, messageId: response?.data?.id });
      } catch (emailError) {
        logger.error("Error while sending email", { recipient, error: emailError });
        emailStatuses.push({ email: recipient, status: "failed" });
        failedCount++;

        try {
          await this.historyRepository.updateEmailLogStatus(emailLog.id, "failed");
        } catch (dbError) {
          logger.error("DB update failed for recipient", { recipient, error: dbError });
        }
      }

      // Add a delay between sending emails (2.5 seconds)
      if (recipients.indexOf(recipient) < recipients.length - 1) {
        await delay(2500);
      }
    }

    // Update session with final counts and status
    const finalStatus = sentCount === recipients.length
      ? "completed"
      : failedCount === recipients.length
        ? "failed"
        : "completed";
    await this.historyRepository.updateSessionStatus(session.id, finalStatus, sentCount, failedCount);

    return emailStatuses;
  }
}
