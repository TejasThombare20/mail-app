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
 *    - Portal link: URL to job posting, LinkedIn post, or career portal (MANDATORY)
 *    - Sender email / --from (optional) — defaults to "iamtejasthombare18@gmail.com".
 *      Do NOT ask the user for the sender email if not provided; use the default.
 *    - Role (optional, defaults to "SDE")
 *    - Template type (optional, defaults to 1)
 *    - Custom subject (optional, has a sensible defcault)
 *
 *    TEMPLATE SELECTION:
 *    The system supports 3 email templates. Do NOT explicitly ask the user which one to use.
 *    Instead, infer from context or mention the options naturally:
 *      - Template 1 (DEFAULT): "Referral Request" — Cold email asking someone for a referral
 *      - Template 2: "Direct Hiring Manager" — Message to a hiring manager after their LinkedIn post
 *      - Template 3: "Team Member Indirect" — Outreach to a team member to forward resume
 *
 *    If the user doesn't specify, use Template 1 by default.
 *    If needed, mention available templates as: "I can use template 1 (referral),
 *    template 2 (direct to manager), or template 3 (to team member). Which fits best?"
 *
 *    FIRST NAMES — DO NOT ASK THE USER:
 *    Claude Code must infer each recipient's first name from their email address
 *    using LLM reasoning. For example:
 *      - "thombaretejas44@gmail.com"  → "Tejas"
 *      - "john.doe@company.com"       → "John"
 *      - "alice_smith99@gmail.com"    → "Alice"
 *    Extract the human-readable name portion, capitalize it properly, and use it
 *    as the firstName field. Never prompt the user for first names.
 *
 *    COMMON PITFALLS TO AVOID:
 *      - Single initial + surname patterns: "vsingh@company.com" or "djoshi@company.com"
 *        These follow the pattern of single letter + surname. The initial (v, d, etc.) is
 *        NOT the first name. Use an empty string "" instead since we cannot extract the actual first name.
 *      - Known surnames in isolation: If email only has a surname (Singh, Joshi, Patel, etc.),
 *        without a first name portion, use an empty string "".
 *
 *    If the email address does not contain a recognizable human name
 *    (e.g., "otherfaltuwork23@gmail.com", "xyz123@gmail.com", "noreply@co.com",
 *    "st@company.com", "vsingh@company.com", "djoshi@company.com"),
 *    use an empty string "" as the firstName.
 *    The send email API will automatically remove empty placeholder values from the
 *    template, so greetings like "Hi {{receiver_name}}" become just "Hi" when
 *    the name is empty — keeping the email clean and natural.
 *
 * 2. BUILD THE COMMAND:
 *    cd /home/tejas/Documents/agentic-ai/mail-app/server
 *    npx ts-node src/scripts/send-emails.ts \
 *      --data '<JSON array of {email, firstName}>' \
 *      --company "<company name>" \
 *      --portalLink "<URL to job posting or LinkedIn post>" \
 *      --from "<sender email>" \
 *      [--template <1|2|3>] \
 *      [--role "<role>"] \
 *      [--subject "<custom subject>"]
 *
 * 3. IMPORTANT NOTES:
 *    - The --data JSON MUST be valid JSON. Each entry needs "email" and "firstName".
 *    - The --portalLink is mandatory and should be a clickable URL.
 *    - The --subject supports template variables: {{receiver_name}}, {{company_name}},
 *      {{ROLE}}, {{portal_link}}. These get replaced per-recipient.
 *    - The server automatically sanitizes non-ASCII characters (em-dashes,
 *      smart quotes, etc.) to their ASCII equivalents before sending, so
 *      encoding issues (like Ã¢Â€Â" garbled text) are handled automatically.
 *    - The server must be running (default: http://localhost:3000).
 *    - The script auto-generates a JWT token by looking up the --from user in the DB.
 *    - There is a 2.5-second delay between each email to avoid rate limiting.
 *    - Timeout is 5 minutes for large batches.
 *
 * ─────────────────────────────
 * TEMPLATE IDS (Configure in .env or update hardcoded values):
 * ─────────────────────────────
 *   TEMPLATE_ID_1: Referral Request (generic) — Default
 *   TEMPLATE_ID_2: Direct Hiring Manager Outreach
 *   TEMPLATE_ID_3: Team Member Indirect Referral
 *
 * ─────────────────────────────
 * ARGUMENTS REFERENCE:
 * ─────────────────────────────
 *
 *   MANDATORY:
 *   ──────────
 *   --data         JSON array of recipients. Format: '[{"email":"alice@google.com","firstName":"Alice"}]'
 *   --company      Company name used for {{company_name}} variable. e.g., "Google"
 *   --portalLink   URL to job posting, LinkedIn post, or career portal. e.g., "https://linkedin.com/jobs/view/123"
 *   --from         Sender's email (must exist in the users table). e.g., "me@gmail.com"
 *
 *   OPTIONAL:
 *   ──────────
 *   --template     Template type: 1 (default), 2, or 3
 *   --subject      Email subject line with template vars.
 *                  Default: "Hi {{receiver_name}} - Referral Request for {{company_name}} {{ROLE}} Role"
 *   --role         Role name for {{ROLE}} variable. Default: "SDE"
 *
 * ─────────────────────────────
 * EXAMPLE INVOCATIONS:
 * ─────────────────────────────
 *
 *   # Template 1 (Referral Request) with 2 recipients:
 *   npx ts-node src/scripts/send-emails.ts \
 *     --data '[{"email":"john@acme.com","firstName":"John"},{"email":"jane@acme.com","firstName":"Jane"}]' \
 *     --company "Acme Corp" \
 *     --portalLink "https://acme.careers/job/sde-1" \
 *     --from "iamtejasthombare@gmail.com" \
 *     --role "SDE-2"
 *
 *   # Template 2 (Direct to Hiring Manager):
 *   npx ts-node src/scripts/send-emails.ts \
 *     --data '[{"email":"alice@google.com","firstName":"Alice"}]' \
 *     --company "Google" \
 *     --portalLink "https://linkedin.com/posts/alice-hiring-post" \
 *     --from "iamtejasthombare@gmail.com" \
 *     --template 2 \
 *     --role "SDE"
 *
 *   # Template 3 (To Team Member):
 *   npx ts-node src/scripts/send-emails.ts \
 *     --data '[{"email":"bob@microsoft.com","firstName":"Bob"}]' \
 *     --company "Microsoft" \
 *     --portalLink "https://microsoft.careers/job/sde-engineer" \
 *     --from "iamtejasthombare@gmail.com" \
 *     --template 3 \
 *     --role "SDE-3"
 *
 * ─────────────────────────────
 * ENVIRONMENT VARIABLES:
 * ─────────────────────────────
 *   Reads .env from server root (DB creds, JWT_SECRET, etc.)
 *   TEMPLATE_ID_1 — Template UUID for Referral Request (default)
 *   TEMPLATE_ID_2 — Template UUID for Direct Hiring Manager
 *   TEMPLATE_ID_3 — Template UUID for Team Member Indirect
 *   SEND_EMAIL_SERVER_URL  — Override the server URL (default: http://localhost:PORT)
 *
 * ─────────────────────────────
 * WHAT THE SCRIPT DOES:
 * ─────────────────────────────
 *   1. Parses and validates CLI arguments
 *   2. Selects the appropriate template based on --template flag (defaults to 1)
 *   3. Connects to PostgreSQL to look up the sender user
 *   4. Generates a short-lived JWT auth token
 *   5. Builds the API payload with per-recipient local variables and global variables
 *   6. Calls POST /api/email/:templateId with the auth cookie
 *   7. Prints the API response and exits
 * ============================================================================
 */

import dotenv from "dotenv";
import path from "path";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import axios from "axios";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ── CONFIG ──────────────────────────────────────────────────────────────────
// Template IDs for different scenarios
// Update these after creating templates in the DB and setting up env vars
const TEMPLATE_IDS = {
  1: process.env.TEMPLATE_ID_1 || "f0e7d259-ff8b-4b87-bece-3dec1ef74f01", // Referral Request (DEFAULT)
  2: process.env.TEMPLATE_ID_2 || "0966bc15-89ea-4f14-8dcc-d2689983dc0b", // Direct Hiring Manager
  3: process.env.TEMPLATE_ID_3 || "102c2224-a673-40fd-a70c-ab8999047ff0", // Team Member Indirect
};

const SERVER_URL = process.env.SEND_EMAIL_SERVER_URL || `http://localhost:${process.env.PORT || 8000}`;
const ROLE_DEFAULT = "SDE";
const FROM_DEFAULT = "iamtejasthombare18@gmail.com";
const TEMPLATE_DEFAULT = 1; // Default to Template 1 (Referral Request)

// Per-template default subjects
const SUBJECT_DEFAULTS: Record<number, string> = {
  1: "Hi {{receiver_name}} - Referral Request for {{company_name}} {{ROLE}} Role",
  2: "Hi {{receiver_name}} - {{ROLE}} Role at {{company_name}}  — Saw Your Post",
  3: "Hi {{receiver_name}} - {{ROLE}} Opening on Your Team at {{company_name}}",
};

// Template descriptions for user reference
const TEMPLATE_DESCRIPTIONS: Record<number, { name: string; description: string }> = {
  1: {
    name: "Referral Request",
    description: "Cold email asking someone for a referral (when you don't know them directly)"
  },
  2: {
    name: "Direct Hiring Manager",
    description: "Message to a hiring manager after seeing their LinkedIn post about an opening"
  },
  3: {
    name: "Team Member Indirect",
    description: "Outreach to a team member (not hiring manager) to forward your resume"
  }
};

// ── TYPES ───────────────────────────────────────────────────────────────────
interface RecipientEntry {
  email: string;
  firstName: string;
}

interface ParsedArgs {
  data: RecipientEntry[];
  company: string;
  portalLink: string;
  subject: string;
  role: string;
  template: number;
  from: string;
}

// ── HELPERS ─────────────────────────────────────────────────────────────────
function parseArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  let dataStr = "";
  let company = "";
  let portalLink = "";
  let subject = "";
  let role = ROLE_DEFAULT;
  let template = TEMPLATE_DEFAULT;
  let from = FROM_DEFAULT;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--data" && args[i + 1]) {
      dataStr = args[++i];
    } else if (args[i] === "--company" && args[i + 1]) {
      company = args[++i];
    } else if (args[i] === "--portalLink" && args[i + 1]) {
      portalLink = args[++i];
    } else if (args[i] === "--subject" && args[i + 1]) {
      subject = args[++i];
    } else if (args[i] === "--role" && args[i + 1]) {
      role = args[++i];
    } else if (args[i] === "--template" && args[i + 1]) {
      const templateNum = parseInt(args[++i], 10);
      if (![1, 2, 3].includes(templateNum)) {
        console.error("Error: --template must be 1, 2, or 3.");
        process.exit(1);
      }
      template = templateNum;
    } else if (args[i] === "--from" && args[i + 1]) {
      from = args[++i];
    }
  }

  // If no custom subject was provided, use the template-specific default
  if (!subject) {
    subject = SUBJECT_DEFAULTS[template];
  }

  if (!dataStr) {
    console.error("Error: --data is required.\nFormat: --data '[{\"email\":\"...\",\"firstName\":\"...\"},...]'");
    process.exit(1);
  }
  if (!company) {
    console.error("Error: --company is required.");
    process.exit(1);
  }
  if (!portalLink) {
    console.error("Error: --portalLink is required (URL to job posting, LinkedIn post, or career portal).");
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
    // firstName can be empty — the API will remove empty placeholders from the template
    if (entry.firstName === undefined || entry.firstName === null) {
      entry.firstName = "";
    }
  }

  return { data, company, portalLink, subject, role, template, from };
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
  const { data, company, portalLink, subject, role, template, from } = parseArgs();

  const templateId = TEMPLATE_IDS[template as keyof typeof TEMPLATE_IDS];
  const templateInfo = TEMPLATE_DESCRIPTIONS[template];

  console.log(`\nSend Emails Script`);
  console.log(`──────────────────────────────────`);
  console.log(`Template        : ${template} - ${templateInfo.name}`);
  console.log(`Description     : ${templateInfo.description}`);
  console.log(`Template ID     : ${templateId}`);
  console.log(`From            : ${from}`);
  console.log(`Company         : ${company}`);
  console.log(`Portal Link     : ${portalLink}`);
  console.log(`Role            : ${role}`);
  console.log(`Subject         : ${subject}`);
  console.log(`Recipients      : ${data.length}`);
  data.forEach((d) => console.log(`  - ${d.firstName || "(no name)"} <${d.email}>`));
  console.log(`──────────────────────────────────\n`);

  // Check if template ID is configured
  if (templateId.includes("_HERE") || templateId === "REPLACE_WITH_YOUR_TEMPLATE_ID") {
    console.error(`Error: Template ${template} ID is not configured. Please set TEMPLATE_ID_${template} in your .env or update the hardcoded value in the script.`);
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
      { key: "portal_link", value: portalLink, id: "global_portal" },
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
      `${SERVER_URL}/api/email/${templateId}`,
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
