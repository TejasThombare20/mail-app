import dns from "dns";
import { EmailAttachment } from "../types/attachment.types";

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export async function checkMXRecord(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  return new Promise((resolve) => {
    dns.resolveMx(domain, (err, addresses) => {
      resolve(!err && addresses.length > 0);
    });
  });
}

export  function createEmailBody(
  recipient: { email: string; variables: Record<string, any> },
  subject: string,
  personalizedHtml: string,
  attachmentsData: (EmailAttachment | null)[]
): string {
  let emailBody = `To: ${recipient.email}\r\n` +
    `Subject: ${subject}\r\n` +
    "MIME-Version: 1.0\r\n" +
    "Content-Type: multipart/mixed; boundary=boundary123\r\n" +
    "\r\n" +
    "--boundary123\r\n" +
    "Content-Type: text/html; charset=\"UTF-8\"\r\n" +
    "Content-Transfer-Encoding: 7bit\r\n" +
    "\r\n" +
    personalizedHtml + "\r\n";

  if (attachmentsData.length !=  0) {
    for (const attachment of attachmentsData) {
      if (!attachment) continue;
      emailBody +=
        "--boundary123\r\n" +
        `Content-Type: ${attachment.mimeType}; name="${attachment.filename}"\r\n` +
        `Content-Disposition: attachment; filename="${attachment.filename}"\r\n` +
        "Content-Transfer-Encoding: base64\r\n" +
        "\r\n" +
        attachment.content + "\r\n";
    }
  }
  
  emailBody += "--boundary123--";
  return emailBody;
}

