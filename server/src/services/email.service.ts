import { google } from "googleapis";
import { gmail_v1 } from "googleapis";
import { OAuth2Client } from "google-auth-library";
import { TokenRepository } from "../repository/token.repository";
import { TemplateRepository } from "../repository/template.repository";
import { HistoryRepository } from "../repository/history.repository";
import { EmailStatus } from "../types/template.types";
import {
  checkMXRecord,
  convertTailwindHtmlToSendableEmail,
  createEmailBody,
  extractReceiverNameFromEmail,
  isValidEmail,
} from "../utils/validate-email";
import { AttachmentRepository } from "../repository/attachment.repository";
import { Attachment, EmailAttachment } from "../types/attachment.types";
import { AttachmentService } from "./attachment.service";
import fs from 'fs';
import path from 'path';

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
    local_variables: Array<{ key: string; description: string; id: string }>,
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
        console.log("Unable to find attachments");
        throw new Error("Failed to laod attachments");
      }
      if (attachmentsData.length !== template.attachments.length) {
        console.log("One or more attachment IDs are invalid");
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

    // For local environment, add the local PDF attachment
    try {
      // Try multiple possible paths
      const possiblePaths = [
        path.join(process.cwd(), 'src', 'media', 'Tejas_Thombare_IIIT_Gwalior.pdf'),
        path.join(process.cwd(), '..', 'server', 'src', 'media', 'Tejas_Thombare_IIIT_Gwalior.pdf'),
        '/Users/tejas/Documents/web-dev/mailGenie/mail-app/server/src/media/Tejas_Thombare_IIIT_Gwalior.pdf',
        path.resolve(__dirname, '..', 'media', 'Tejas_Thombare_IIIT_Gwalior.pdf')
      ];
      
      let pdfPath: string | null = null;
      let fileFound = false;
      
      // Try each path until we find one that works
      for (const testPath of possiblePaths) {
        console.log('Trying path:', testPath);
        try {
          fs.accessSync(testPath, fs.constants.R_OK);
          pdfPath = testPath;
          fileFound = true;
          console.log('Found PDF at:', pdfPath);
          break;
        } catch (err) {
          console.log('Path not accessible:', testPath);
        }
      }
      
      if (!fileFound || !pdfPath) {
        throw new Error('Could not find PDF file in any of the expected locations');
      }
      
      const pdfContent = fs.readFileSync(pdfPath);
      const base64Content = pdfContent.toString('base64');
      
      const localPdfAttachment: EmailAttachment = {
        filename: 'Tejas_Thombare_IIIT_Gwalior.pdf',
        content: base64Content,
        mimeType: 'application/pdf',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        file_url: `file://${pdfPath}`
      };
      
      attachements.push(localPdfAttachment);
      console.log('PDF attachment added successfully');
    } catch (error) {
      console.error('Failed to load local PDF attachment:', error);
    }

    // Create history record with initial status
    const historyRecord = await this.historyRepository.create({
      user_id: userId,
      template_id: templateId,
      global_variables: global_variables,
      receiver_emails: recipients.map((email) => ({
        email: email,
        status: "queued",
        variables: local_variables,
      })),
      subject: subject,
      status: "pending",
    });

    const emailStatuses: EmailStatus[] = [];

    for (const recipient of recipients) {
      let personalizedHtml = template?.html_content;

      if (!isValidEmail(recipient) || !(await checkMXRecord(recipient))) {
        console.log(`Invalid email detected: ${recipient}`);
        emailStatuses.push({ email: recipient, status: "invalid" });
        continue;
      }

      // Extract receiver name from email
      const receiverName = extractReceiverNameFromEmail(recipient);

      // Replace global variables
      global_variables.forEach(({ key, value }) => {
        personalizedHtml = personalizedHtml.replace(
          new RegExp(`{{${key}}}`, "g"),
          String(value)
        );
      });

      // local_variables.forEach(({ description, id, key }) => {
      //   personalizedHtml = personalizedHtml.replace(
      //     new RegExp(`{{${key}}}`, "g"),
      //     String(description)
      //   );
      // });
      // Note: Local variables replacement is commented out as we're now using the receiver_name extraction instead

      // Replace {{receiver_name}} placeholder with extracted name
      personalizedHtml = personalizedHtml.replace(
        new RegExp(`{{receiver_name}}`, "g"),
        receiverName
      );

      const HTML = `
      <div><div class="relative p-4 transition-all group h-full overflow-scroll " draggable="false"><div class="items-center border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80 absolute -top-[23px] -left-[1px] rounded-none rounded-t-lg hidden">Body</div><div class="p-[2px] w-full m-[5px] relative text-[16px] transition-all !border-blue-500 !border-solid" style="color: rgb(217, 32, 211); background-position: center center; object-fit: cover; background-repeat: no-repeat; text-align: left; opacity: 1; font-family: &quot;Courier New&quot;, monospace; font-size: 50px; line-height: 2; padding: 10px; font-weight: bold;"><span contenteditable="false">Welcome from client side ....&nbsp;</span></div></div></div>
      `;

      const testEmail = convertTailwindHtmlToSendableEmail(HTML);

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
            email: recipient,
            status: "sent",
            variables: local_variables,
          });

          // Update individual recipient status
          await this.historyRepository.updateRecipientStatus(
            historyRecord.id,
            recipient,
            "sent"
          );
        } else {
          emailStatuses.push({
            email: recipient,
            status: "failed",
            variables: local_variables,
          });

          // Update individual recipient status
          await this.historyRepository.updateRecipientStatus(
            historyRecord.id,
            recipient,
            "failed"
          );
        }
        console.log(`response of email ${recipient}`, response?.data);

        console.log("db updated");
      } catch (emailError) {
        console.error(`Error while sending email to ${recipient}:`, emailError);

        emailStatuses.push({
          email: recipient,
          status: "failed",
          variables: local_variables,
        });

        try {
          await this.historyRepository.updateRecipientStatus(
            historyRecord.id,
            recipient,
            "failed"
          );
        } catch (dbError) {
          console.error(`DB update failed for ${recipient}:`, dbError);
        }
      }
      
      // Add a delay between sending emails (2.5 seconds)
      if (recipients.indexOf(recipient) < recipients.length - 1) {
        await delay(2500);
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
