/**
 * ============================================================================
 * send-emails.ts — CLI Script to Send Bulk Emails via the Mail-App API
 * ============================================================================
 *
 * INSTRUCTIONS FOR CLAUDE CODE — FOLLOW THESE STRICTLY:
 * ─────────────────────────────────────────────────────
 * When the user asks you to "send emails" or "run the send email script",
 * follow these steps:
 *
 * 1. GATHER INFORMATION from the user:
 *    - Recipient list: emails (MANDATORY)
 *    - Company name (MANDATORY)
 *    - Sender email / --from (optional) — defaults to "iamtejasthombare18@gmail.com".
 *      Do NOT ask the user for the sender email if not provided; use the default.
 *    - Role (optional, defaults to "SDE")
 *    - Job ID (optional, defaults to empty string)
 *    - Custom subject (optional, has a sensible default)
 *
 *    FIRST NAMES — DO NOT ASK THE USER:
 *    Claude Code must infer each recipient's first name from their email address
 *    using LLM reasoning. For example:
 *      - "thombaretejas44@gmail.com"  → "Tejas"
 *      - "john.doe@company.com"       → "John"
 *      - "alice_smith99@gmail.com"    → "Alice"
 *    Extract the human-readable name portion, capitalize it properly, and use it
 *    as the firstName field. Never prompt the user for first names.
 *    If the email address does not contain a recognizable human name
 *    (e.g., "otherfaltuwork23@gmail.com", "xyz123@gmail.com", "noreply@co.com"),
 *    use a warm, friendly default like "Dude" as the firstName.
 *    This keeps the greeting natural and appropriate even when no name is available.
 *
 * 2. BUILD THE COMMAND:
 *    cd /home/tejas/Documents/agentic-ai/mail-app/server
 *    npx ts-node src/scripts/send-emails.ts \
 *      --data '<JSON array of {email, firstName}>' \
 *      --company "<company name>" \
 *      --from "<sender email>" \
 *      [--role "<role>"] \
 *      [--jobId "<job id>"] \
 *      [--subject "<custom subject>"]
 *
 * 3. IMPORTANT NOTES:
 *    - The --data JSON MUST be valid JSON. Each entry needs "email" and "firstName".
 *    - The --subject supports template variables: {{receiver_name}}, {{company_name}},
 *      {{ROLE}}, {{JOB_ID}}. These get replaced per-recipient.
 *    - Use plain ASCII characters in --subject. Avoid Unicode em-dashes (—),
 *      smart quotes, etc. Use a regular hyphen (-) or double-hyphen (--) instead
 *      to prevent encoding issues (Ã¢Â€Â" garbled text) in received emails.
 *    - The server must be running (default: http://localhost:3000).
 *    - The script auto-generates a JWT token by looking up the --from user in the DB.
 *    - There is a 2.5-second delay between each email to avoid rate limiting.
 *    - Timeout is 5 minutes for large batches.
 *
 * ─────────────────────────────
 * ARGUMENTS REFERENCE:
 * ─────────────────────────────
 *
 *   MANDATORY:
 *   ──────────
 *   --data     JSON array of recipients. Format: '[{"email":"alice@google.com","firstName":"Alice"}]'
 *   --company  Company name used for {{company_name}} variable. e.g., "Google"
 *   --from     Sender's email (must exist in the users table). e.g., "me@gmail.com"
 *
 *   OPTIONAL:
 *   ──────────
 *   --subject  Email subject line with template vars.
 *              Default: "Hi {{receiver_name}} - Referral Request for {{company_name}} {{ROLE}} Role"
 *   --role     Role name for {{ROLE}} variable. Default: "SDE"
 *   --jobId    Job ID for {{JOB_ID}} variable. Default: "" (empty, placeholder removed)
 *
 * ─────────────────────────────
 * EXAMPLE INVOCATIONS:
 * ─────────────────────────────
 *
 *   # Basic usage with 2 recipients:
 *   npx ts-node src/scripts/send-emails.ts \
 *     --data '[{"email":"john@acme.com","firstName":"John"},{"email":"jane@acme.com","firstName":"Jane"}]' \
 *     --company "Acme Corp" \
 *     --from "iamtejasthombare@gmail.com" \
 *     --role "SDE-2"
 *
 *   # With custom subject (NOTE: use ASCII hyphens, NOT em-dashes):
 *   npx ts-node src/scripts/send-emails.ts \
 *     --data '[{"email":"alice@google.com","firstName":"Alice"}]' \
 *     --company "Google" \
 *     --from "iamtejasthombare@gmail.com" \
 *     --role "SDE" \
 *     --jobId "JOB-456" \
 *     --subject "Hi {{receiver_name}} - Referral for {{company_name}} {{ROLE}} ({{JOB_ID}})"
 *
 * ─────────────────────────────
 * ENVIRONMENT VARIABLES:
 * ─────────────────────────────
 *   Reads .env from server root (DB creds, JWT_SECRET, etc.)
 *   SEND_EMAIL_TEMPLATE_ID — Override the default template UUID
 *   SEND_EMAIL_SERVER_URL  — Override the server URL (default: http://localhost:PORT)
 *
 * ─────────────────────────────
 * WHAT THE SCRIPT DOES:
 * ─────────────────────────────
 *   1. Parses and validates CLI arguments
 *   2. Connects to PostgreSQL to look up the sender user
 *   3. Generates a short-lived JWT auth token
 *   4. Builds the API payload with per-recipient local variables and global variables
 *   5. Calls POST /api/email/:templateId with the auth cookie
 *   6. Prints the API response and exits
 * ============================================================================
 */

import dotenv from "dotenv";
import path from "path";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import axios from "axios";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ── CONFIG ──────────────────────────────────────────────────────────────────
// Hardcode your template ID here so the script always uses the same template.
// Override via SEND_EMAIL_TEMPLATE_ID env var if needed.
const TEMPLATE_ID = process.env.SEND_EMAIL_TEMPLATE_ID || "f0e7d259-ff8b-4b87-bece-3dec1ef74f01";
const SERVER_URL = process.env.SEND_EMAIL_SERVER_URL || `http://localhost:${process.env.PORT || 8000}`;
const SUBJECT_DEFAULT = "Hi {{receiver_name}} - Referral Request for {{company_name}} {{ROLE}} Role";
const ROLE_DEFAULT = "SDE";
const JOB_ID_DEFAULT = "";
const FROM_DEFAULT = "iamtejasthombare18@gmail.com";

// ── TYPES ───────────────────────────────────────────────────────────────────
interface RecipientEntry {
  email: string;
  firstName: string;
}

// ── HELPERS ─────────────────────────────────────────────────────────────────
function parseArgs(): { data: RecipientEntry[]; company: string; subject: string; role: string; jobId: string; from: string } {
  const args = process.argv.slice(2);
  let dataStr = "";
  let company = "";
  let subject = SUBJECT_DEFAULT;
  let role = ROLE_DEFAULT;
  let jobId = JOB_ID_DEFAULT;
  let from = FROM_DEFAULT;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--data" && args[i + 1]) {
      dataStr = args[++i];
    } else if (args[i] === "--company" && args[i + 1]) {
      company = args[++i];
    } else if (args[i] === "--subject" && args[i + 1]) {
      subject = args[++i];
    } else if (args[i] === "--role" && args[i + 1]) {
      role = args[++i];
    } else if (args[i] === "--jobId" && args[i + 1]) {
      jobId = 'jobId:'+ args[++i];  
    } else if (args[i] === "--from" && args[i + 1]) {
      from = args[++i];
    }
  }

  if (!dataStr) {
    console.error("Error: --data is required.\nFormat: --data '[{\"email\":\"...\",\"firstName\":\"...\"},...]'");
    process.exit(1);
  }
  if (!company) {
    console.error("Error: --company is required.");
    process.exit(1);  
  }

  let data: RecipientEntry[];
  try {
    data = JSON.parse(dataStr);
  } catch {
    console.error("Error: --data must be valid JSON.");
    process.exit(1);
  }

  // Validate each entry
  for (const entry of data) {
    if (!entry.email || !entry.email.includes("@")) {
      console.error(`Error: Invalid or missing email: ${JSON.stringify(entry)}`);
      process.exit(1);
    }
    if (!entry.firstName || entry.firstName.trim().length === 0) {
      console.error(`Error: Missing firstName for ${entry.email}. Every recipient must have a first name.`);
      process.exit(1);
    }
  }

  return { data, company, subject, role, jobId, from };
}

/**
 * Generates a short-lived JWT token by looking up the user by email in the DB.
 * This avoids needing to pass auth cookies manually.
 */
async function generateAuthToken(pool: Pool, fromEmail: string): Promise<{ token: string; userId: string }> {
  const result = await pool.query<{ id: string; email: string }>(
    "SELECT id, email FROM users WHERE email = $1 LIMIT 1",
    [fromEmail]
  );
  if (!result.rowCount || result.rowCount === 0) {
    throw new Error(`No user found with email '${fromEmail}'. Please sign in via the app first.`);
  }

  const user = result.rows[0];
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" }
  );

  return { token, userId: user.id };
}

// ── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  const { data, company, subject, role, jobId, from } = parseArgs();

  console.log(`\nSend Emails Script`);
  console.log(`──────────────────────────────────`);
  console.log(`Template ID : ${TEMPLATE_ID}`);
  console.log(`From        : ${from}`);
  console.log(`Company     : ${company}`);
  console.log(`Role        : ${role}`);
  console.log(`Job ID      : ${jobId || "(not provided)"}`);
  console.log(`Subject     : ${subject}`);
  console.log(`Recipients  : ${data.length}`);
  data.forEach((d) => console.log(`  - ${d.firstName} <${d.email}>`));
  console.log(`──────────────────────────────────\n`);

  if (TEMPLATE_ID === "REPLACE_WITH_YOUR_TEMPLATE_ID") {
    console.error("Error: Please set SEND_EMAIL_TEMPLATE_ID in your .env or hardcode it in the script.");
    process.exit(1);
  }

  const dbPool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
  });

  try {
    const { token } = await generateAuthToken(dbPool, from);

    // Build per-recipient local_variables with recipient_email and value
    const local_variables = data.map((entry, idx) => ({
      key: "receiver_name",
      description: "Recipient first name",
      id: `local_${idx}`,
      recipient_email: entry.email,
      value: entry.firstName,
    }));

    const global_variables = [
      { key: "company_name", value: company, id: "global_company" },
      { key: "ROLE", value: role, id: "global_role" },
      { key: "JOB_ID", value: jobId, id: "global_jobid" },
    ];

    const recipients = data.map((d) => d.email);

    const payload = {
      recipients,
      local_variables,
      global_variables,
      subject,
    };

    console.log("Calling send email API...\n");

    const response = await axios.post(
      `${SERVER_URL}/api/email/${TEMPLATE_ID}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: `auth_token=${token}`,
        },
        timeout: 300000, // 5 min timeout for large batches
      }
    );

    console.log("API Response:", JSON.stringify(response.data, null, 2));
    console.log("\nDone!");
  } catch (err: any) {
    if (err.response) {
      console.error("API Error:", err.response.status, JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Error:", err.message);
    }
    process.exit(1);
  } finally {
    await dbPool.end();
  }
}

main();
