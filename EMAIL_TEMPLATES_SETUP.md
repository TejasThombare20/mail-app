# Email Templates Setup Guide

## Overview
This document provides complete instructions for setting up 3 email templates in your Mail-App API and configuring the send-emails script to use them.

---

## Step 1: Get Your Auth Token

First, you need an `auth_token` from your Mail-App. Sign in to the app and extract the `auth_token` from the browser cookies, or generate one via your authentication endpoint.

```bash
# Example: Extract from browser DevTools → Application → Cookies
auth_token=YOUR_TOKEN_HERE
```

---

## Step 2: Create Templates via Postman

Execute these cURL commands in order. Replace `YOUR_AUTH_TOKEN` with your actual token and `http://localhost:3000` with your server URL if different.

### Template 1: Referral Request (Default)

```bash
curl --location 'http://localhost:3000/api/templates' \
  --header 'Content-Type: application/json' \
  --header 'Cookie: auth_token=YOUR_AUTH_TOKEN' \
  --data '{
    "name": "Referral Request - Generic",
    "description": "Cold email asking for a referral from someone you don'\''t know directly",
    "category": "job-referral",
    "html_content": "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>Referral Email Template</title>\n</head>\n<body style=\"margin: 0; padding: 0; background-color: #ffffff;\">\n  <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n    <tr>\n      <td style=\"padding: 20px 24px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #222222;\">\n\n        <p style=\"margin: 0 0 16px 0;\">\n          Hello <strong>{{receiver_name}}</strong>,\n        </p>\n\n        <p style=\"margin: 0 0 16px 0;\">\n          Apologies for the cold email — I'\''ll keep it brief.\n        </p>\n\n        <p style=\"margin: 0 0 16px 0;\">\n          I'\''m <strong>Tejas</strong>, an <strong>SDE-1</strong> at <strong>Interface.ai</strong> with 2 years of experience (including internship) at <strong>YC-backed</strong> and well-funded startups, including one backed by <strong>WhatsApp'\''s co-founder</strong>. I studied at <strong>IIIT Gwalior</strong> and have a strong background in distributed systems, open-source contributions, and problem solving (<strong>Knight</strong> on LeetCode, <strong>1880+</strong> rating).\n        </p>\n\n        <p style=\"margin: 0 0 16px 0;\">\n          I noticed <strong>{{company_name}}</strong> is hiring for the <strong>{{ROLE}}</strong> role and feel my experience could be a good fit. If you'\''re comfortable, would you be open to referring me? I'\''ve attached my resume so you can take a look — no worries at all if it doesn'\''t feel right.\n        </p>\n\n        <p style=\"margin: 0 0 4px 0;\">\n          Really appreciate you reading this far. Thanks!\n        </p>\n\n        <p style=\"margin: 0; line-height: 1.5;\">\n          Tejas Thombare\n        </p>\n\n      </td>\n    </tr>\n  </table>\n</body>\n</html>",
    "local_variables": [
      { "key": "receiver_name", "id": "local_receiver_name", "description": "Recipient first name" }
    ],
    "global_variables": [
      { "key": "company_name", "id": "global_company_name", "description": "Target company name" },
      { "key": "ROLE", "id": "global_role", "description": "Job role title (e.g. SDE, SDE-2)", "value": "SDE" }
    ]
  }'
```

**Response:** You'll get a JSON response with `id` field. Save this as `TEMPLATE_ID_1`.

---

### Template 2: Direct Hiring Manager Outreach

```bash
curl --location 'http://localhost:3000/api/templates' \
  --header 'Content-Type: application/json' \
  --header 'Cookie: auth_token=YOUR_AUTH_TOKEN' \
  --data '{
    "name": "Direct Hiring Manager Outreach",
    "description": "Message to a hiring manager after seeing their LinkedIn post about an opening",
    "category": "job-referral",
    "html_content": "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>Direct Hiring Manager Email</title>\n</head>\n<body style=\"margin: 0; padding: 0; background-color: #ffffff;\">\n  <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n    <tr>\n      <td style=\"padding: 20px 24px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #222222;\">\n\n        <p style=\"margin: 0 0 16px 0;\">\n          Hi <strong>{{receiver_name}}</strong>,\n        </p>\n\n        <p style=\"margin: 0 0 16px 0;\">\n          I came across your <a href=\"{{portal_link}}\" style=\"color: #0066cc; text-decoration: none;\">LinkedIn post</a> about the <strong>{{ROLE}}</strong> opening on your team at <strong>{{company_name}}</strong>, and I'\''d love to be considered for the role.\n        </p>\n\n        <p style=\"margin: 0 0 16px 0;\">\n          A bit about me — I'\''m <strong>Tejas</strong>, currently an <strong>SDE-1</strong> at <strong>Interface.ai</strong> with 2 years of experience (including internship) at <strong>YC-backed</strong> and well-funded startups, including one backed by <strong>WhatsApp'\''s co-founder</strong>. I studied at <strong>IIIT Gwalior</strong> and have a strong background in distributed systems, open-source contributions, and problem solving (<strong>Knight</strong> on LeetCode, <strong>1880+</strong> rating).\n        </p>\n\n        <p style=\"margin: 0 0 16px 0;\">\n          I'\''ve attached my resume for your review. Would be happy to share more details or hop on a quick call at your convenience.\n        </p>\n\n        <p style=\"margin: 0 0 4px 0;\">\n          Thanks so much for reading this far!\n        </p>\n\n        <p style=\"margin: 0; line-height: 1.5;\">\n          Best,<br />\n          Tejas Thombare\n        </p>\n\n      </td>\n    </tr>\n  </table>\n</body>\n</html>",
    "local_variables": [
      { "key": "receiver_name", "id": "local_receiver_name", "description": "Recipient first name" }
    ],
    "global_variables": [
      { "key": "company_name", "id": "global_company_name", "description": "Target company name" },
      { "key": "ROLE", "id": "global_role", "description": "Job role title (e.g. SDE, SDE-2)", "value": "SDE" },
      { "key": "portal_link", "id": "global_portal_link", "description": "URL to LinkedIn post or job portal" }
    ]
  }'
```

**Response:** Save the `id` as `TEMPLATE_ID_2`.

---

### Template 3: Team Member Indirect Referral

```bash
curl --location 'http://localhost:3000/api/templates' \
  --header 'Content-Type: application/json' \
  --header 'Cookie: auth_token=YOUR_AUTH_TOKEN' \
  --data '{
    "name": "Team Member Indirect Referral",
    "description": "Outreach to a team member (not hiring manager) to help forward resume to the right person",
    "category": "job-referral",
    "html_content": "<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>Team Member Referral Email</title>\n</head>\n<body style=\"margin: 0; padding: 0; background-color: #ffffff;\">\n  <table role=\"presentation\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" border=\"0\">\n    <tr>\n      <td style=\"padding: 20px 24px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.6; color: #222222;\">\n\n        <p style=\"margin: 0 0 16px 0;\">\n          Hi <strong>{{receiver_name}}</strong>,\n        </p>\n\n        <p style=\"margin: 0 0 16px 0;\">\n          Apologies for the cold email — I'\''ll keep it brief.\n        </p>\n\n        <p style=\"margin: 0 0 16px 0;\">\n          I recently came across an opening for the <strong>{{ROLE}}</strong> role on your team at <strong>{{company_name}}</strong> and felt my background could be a strong fit.\n        </p>\n\n        <p style=\"margin: 0 0 16px 0;\">\n          I'\''m <strong>Tejas</strong>, an <strong>SDE-1</strong> at <strong>Interface.ai</strong> with 2 years of experience (including internship) at <strong>YC-backed</strong> and well-funded startups, including one backed by <strong>WhatsApp'\''s co-founder</strong>. I studied at <strong>IIIT Gwalior</strong> and have a strong background in distributed systems, open-source contributions, and problem solving (<strong>Knight</strong> on LeetCode, <strong>1880+</strong> rating).\n        </p>\n\n        <p style=\"margin: 0 0 16px 0;\">\n          Since you'\''re on the team, I thought you might be the right person to reach out to. If my profile seems like a fit, would you mind forwarding my resume to the hiring manager or pointing me to the best way to apply? You can check it out <a href=\"{{portal_link}}\" style=\"color: #0066cc; text-decoration: none;\">here</a> or I'\''ve attached it for your convenience.\n        </p>\n\n        <p style=\"margin: 0 0 16px 0;\">\n          Completely understand if you'\''d rather not — no pressure at all.\n        </p>\n\n        <p style=\"margin: 0 0 4px 0;\">\n          Thanks so much for your time!\n        </p>\n\n        <p style=\"margin: 0; line-height: 1.5;\">\n          Best,<br />\n          Tejas Thombare\n        </p>\n\n      </td>\n    </tr>\n  </table>\n</body>\n</html>",
    "local_variables": [
      { "key": "receiver_name", "id": "local_receiver_name", "description": "Recipient first name" }
    ],
    "global_variables": [
      { "key": "company_name", "id": "global_company_name", "description": "Target company name" },
      { "key": "ROLE", "id": "global_role", "description": "Job role title (e.g. SDE, SDE-2)", "value": "SDE" },
      { "key": "portal_link", "id": "global_portal_link", "description": "URL to job posting or career portal" }
    ]
  }'
```

**Response:** Save the `id` as `TEMPLATE_ID_3`.

---

## Step 3: Configure Environment Variables

Add the template IDs to your `.env` file in the server directory:

```bash
# Email Template IDs (obtained from API responses above)
TEMPLATE_ID_1=YOUR_TEMPLATE_ID_1_HERE
TEMPLATE_ID_2=YOUR_TEMPLATE_ID_2_HERE
TEMPLATE_ID_3=YOUR_TEMPLATE_ID_3_HERE

# Optional: Override server URL if not localhost:3000
SEND_EMAIL_SERVER_URL=http://localhost:3000
```

---

## Step 4: Update send-emails.ts (Already Done ✓)

The script has been updated to:
- Support `--template` flag (1, 2, or 3)
- Require `--portalLink` parameter (mandatory)
- Default to Template 1 if not specified
- Show template name and description in console output
- Support new global variable `{{portal_link}}`

---

## Step 5: Use the send-emails Script

### Example 1: Template 1 (Referral Request) - DEFAULT

```bash
cd /home/tejas/Documents/agentic-ai/mail-app/server

npx ts-node src/scripts/send-emails.ts \
  --data '[
    {"email":"john@acme.com","firstName":"John"},
    {"email":"jane@acme.com","firstName":"Jane"}
  ]' \
  --company "Acme Corp" \
  --portalLink "https://acme.careers/jobs/sde-1" \
  --role "SDE-1" \
  --from "iamtejasthombare@gmail.com"
```

### Example 2: Template 2 (Direct Hiring Manager)

```bash
cd /home/tejas/Documents/agentic-ai/mail-app/server

npx ts-node src/scripts/send-emails.ts \
  --data '[{"email":"alice.smith@google.com","firstName":"Alice"}]' \
  --company "Google" \
  --portalLink "https://linkedin.com/posts/alice-hiring-post" \
  --template 2 \
  --role "SDE-2" \
  --from "iamtejasthombare@gmail.com"
```

### Example 3: Template 3 (Team Member Indirect)

```bash
cd /home/tejas/Documents/agentic-ai/mail-app/server

npx ts-node src/scripts/send-emails.ts \
  --data '[{"email":"bob.johnson@microsoft.com","firstName":"Bob"}]' \
  --company "Microsoft" \
  --portalLink "https://microsoft.careers/job/sde-engineer" \
  --template 3 \
  --role "SDE-3" \
  --from "iamtejasthombare@gmail.com"
```

---

## Template Selection Guide

| Scenario | Template | Key Phrase |
|----------|----------|-----------|
| Cold email to someone you don't know well | **Template 1** ✓ | "would you be open to referring me?" |
| Direct outreach to hiring manager after their LinkedIn post | **Template 2** | "I came across your LinkedIn post" |
| Outreach to team member to forward your resume | **Template 3** | "would you mind forwarding my resume to the hiring manager" |

---

## Placeholder Reference

### Available Placeholders (All Templates)

| Placeholder | Type | Example | Required |
|-------------|------|---------|----------|
| `{{receiver_name}}` | Local | "John", "Alice" | Yes (auto-extracted from email) |
| `{{company_name}}` | Global | "Google", "Microsoft" | **Mandatory** |
| `{{ROLE}}` | Global | "SDE", "SDE-2" | Optional (defaults to "SDE") |
| `{{portal_link}}` | Global | "https://linkedin.com/..." | **Mandatory** |
| `{{JOB_ID}}` | Global | "(job id JOB-456)" | No (Template 1 only) |

### Empty Placeholder Handling

The email service automatically:
- Removes empty placeholders from the template
- Cleans up surrounding whitespace
- Fixes punctuation spacing

**Example:**
```
Before: "Hi {{receiver_name}}, welcome to {{company_name}}"
After:  "Hi, welcome to Google" (if receiver_name is empty)
```

---

## Troubleshooting

### Template ID not found error
**Solution:** Make sure you've created all 3 templates via the Postman cURLs and updated your `.env` file with the correct IDs.

### "portal_link is required" error
**Solution:** Always include the `--portalLink` flag when running the script. This is the URL to the job posting or LinkedIn post.

### Invalid template number
**Solution:** Use only 1, 2, or 3 for the `--template` flag. Defaults to 1 if not specified.

### Email not received
**Solution:**
1. Verify the server is running at the correct URL
2. Check that auth_token is valid and user exists in DB
3. Confirm recipient email is valid (MX record check)
4. Review email logs in `email_logs` table

---

## API Response Example

```json
{
  "success": true,
  "message": "Emails queued successfully",
  "session_id": "sess_abc123",
  "total_recipients": 2,
  "sent": 2,
  "failed": 0,
  "statuses": [
    { "email": "john@acme.com", "status": "sent" },
    { "email": "jane@acme.com", "status": "sent" }
  ]
}
```

---

## Notes

- **Delay between emails:** 2.5 seconds (to avoid rate limiting)
- **Timeout:** 5 minutes per batch
- **Attachments:** Automatically added if `DEFAULT_ATTACHMENT_ENABLED=true` in .env
- **Non-ASCII characters:** Automatically sanitized (em-dashes → regular dashes, smart quotes → regular quotes)
- **Default sender:** `iamtejasthombare18@gmail.com` (can be overridden with `--from`)
