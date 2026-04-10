# Email Template System — Setup Summary ✓

## What Was Done

### 1. ✅ Created 3 Email Templates with HTML

All templates include proper placeholders:
- **Template 1:** Referral Request (Generic cold outreach)
- **Template 2:** Direct Hiring Manager (Message to hiring manager)
- **Template 3:** Team Member Indirect (Outreach to team member)

Each template has:
- ✓ Proper HTML formatting
- ✓ Mandatory placeholders: `{{receiver_name}}`, `{{company_name}}`, `{{portal_link}}`
- ✓ Optional placeholders: `{{ROLE}}` (defaults to "SDE")
- ✓ Professional styling & responsive design

### 2. ✅ Updated send-emails.ts Script

**New Features:**
- ✓ Support for `--template` flag (1, 2, or 3)
- ✓ Mandatory `--portalLink` parameter (URL to job posting)
- ✓ Replaced `--jobId` with `{{portal_link}}` in global variables
- ✓ Template selection with smart defaults (Template 1 if not specified)
- ✓ Console output shows template name & description
- ✓ Template ID configuration via environment variables

**New Arguments:**
```bash
--template <1|2|3>      # Select which template (defaults to 1)
--portalLink <URL>      # MANDATORY - URL to job posting or LinkedIn post
```

**Environment Variables:**
```
TEMPLATE_ID_1=...       # Referral Request
TEMPLATE_ID_2=...       # Direct Hiring Manager
TEMPLATE_ID_3=...       # Team Member Indirect
```

### 3. ✅ Enhanced email.service.ts Documentation

Added comprehensive documentation at the top of the file:
- ✓ Template descriptions with use cases
- ✓ Placeholder reference table
- ✓ Decision flowchart for template selection
- ✓ When to use each template
- ✓ Empty placeholder handling explanation

### 4. ✅ Created Setup & Reference Guides

**[EMAIL_TEMPLATES_SETUP.md](EMAIL_TEMPLATES_SETUP.md)**
- Complete Postman cURL commands for all 3 templates
- Step-by-step setup instructions
- Environment variable configuration
- Example commands for each template
- Troubleshooting guide

**[TEMPLATE_QUICK_REFERENCE.md](TEMPLATE_QUICK_REFERENCE.md)**
- Visual overview of all 3 templates
- Decision tree for template selection
- Quick command examples
- Placeholder reference
- Important notes & tips

---

## Files Modified & Created

### Modified Files
1. **[server/src/scripts/send-emails.ts](server/src/scripts/send-emails.ts)**
   - Added template support with 3 templates
   - Updated parseArgs() to handle template selection
   - Added portalLink as mandatory parameter
   - Added template descriptions

2. **[server/src/services/email.service.ts](server/src/services/email.service.ts)**
   - Added 150+ lines of documentation
   - Template descriptions with use cases
   - Decision flowchart for template selection
   - Placeholder reference guide
   - Empty placeholder handling explanation

### Created Files
1. **[EMAIL_TEMPLATES_SETUP.md](EMAIL_TEMPLATES_SETUP.md)** (Complete setup guide)
   - Postman cURL commands for all 3 templates
   - Step-by-step instructions
   - Example commands
   - Troubleshooting guide

2. **[TEMPLATE_QUICK_REFERENCE.md](TEMPLATE_QUICK_REFERENCE.md)** (Quick reference)
   - Visual template overview
   - Decision tree
   - Command examples
   - Parameter reference table

3. **[/home/tejas/.claude/projects/-home-tejas-Documents-agentic-ai-mail-app/memory/email_template_setup.md](../memory/email_template_setup.md)** (Memory for future sessions)
   - System overview for future reference

---

## How to Use

### Step 1: Create Templates in Database
Run the Postman cURLs from [EMAIL_TEMPLATES_SETUP.md](EMAIL_TEMPLATES_SETUP.md):
```bash
# Create Template 1
curl --location 'http://localhost:3000/api/templates' ...

# Create Template 2
curl --location 'http://localhost:3000/api/templates' ...

# Create Template 3
curl --location 'http://localhost:3000/api/templates' ...
```

### Step 2: Configure Environment Variables
Add to `.env`:
```
TEMPLATE_ID_1=<ID_from_step_1>
TEMPLATE_ID_2=<ID_from_step_2>
TEMPLATE_ID_3=<ID_from_step_3>
```

### Step 3: Use the Script

**Example 1: Template 1 (Default - Referral Request)**
```bash
npx ts-node src/scripts/send-emails.ts \
  --data '[{"email":"john@acme.com","firstName":"John"}]' \
  --company "Acme Corp" \
  --portalLink "https://acme.careers/job/sde-1" \
  --role "SDE-1"
```

**Example 2: Template 2 (Direct to Hiring Manager)**
```bash
npx ts-node src/scripts/send-emails.ts \
  --data '[{"email":"alice@google.com","firstName":"Alice"}]' \
  --company "Google" \
  --portalLink "https://linkedin.com/posts/alice-hiring" \
  --template 2 \
  --role "SDE"
```

**Example 3: Template 3 (To Team Member)**
```bash
npx ts-node src/scripts/send-emails.ts \
  --data '[{"email":"bob@microsoft.com","firstName":"Bob"}]' \
  --company "Microsoft" \
  --portalLink "https://microsoft.careers/job/123" \
  --template 3 \
  --role "SDE-2"
```

---

## Template Comparison

| Feature | Template 1 | Template 2 | Template 3 |
|---------|-----------|-----------|-----------|
| **Use Case** | Generic referral request | Hiring manager direct | Team member indirect |
| **Tone** | Polite, brief | Professional, direct | Friendly, helpful |
| **Key Phrase** | "would you be open to referring me?" | "I came across your LinkedIn post" | "would you mind forwarding my resume" |
| **Recipient** | Anyone | Hiring manager | Team member |
| **{{receiver_name}}** | ✓ | ✓ | ✓ |
| **{{company_name}}** | ✓ | ✓ | ✓ |
| **{{ROLE}}** | ✓ | ✓ | ✓ |
| **{{portal_link}}** | ✓ | ✓ | ✓ |

---

## Key Features

✅ **Smart Defaults**
- Template 1 used if --template not specified
- Role defaults to "SDE"
- Sender defaults to "iamtejasthombare18@gmail.com"

✅ **Auto First Name Extraction**
- Email: "john.doe@acme.com" → First name: "John"
- Single initial (v, d) treated as unknown → empty string

✅ **Empty Placeholder Cleanup**
- "Hi {{receiver_name}}" → "Hi" (if name empty)
- Fixes surrounding whitespace automatically

✅ **Rate Limiting & Safety**
- 2.5 second delay between emails
- 5 minute timeout for large batches
- MX record validation for each recipient

✅ **Non-ASCII Character Handling**
- Em-dashes (—) → Regular dashes (-)
- Smart quotes ("") → Regular quotes ("")

---

## Mandatory Parameters

| Parameter | Type | Example |
|-----------|------|---------|
| `--data` | JSON | `[{"email":"x@y.com","firstName":"John"}]` |
| `--company` | String | `"Google"` |
| `--portalLink` | URL | `"https://linkedin.com/..."` |

(--from is optional, defaults to "iamtejasthombare18@gmail.com")

---

## Next Steps

1. ✋ Run the 3 Postman cURLs to create templates
2. ✋ Extract template IDs from responses
3. ✋ Add TEMPLATE_ID_1, TEMPLATE_ID_2, TEMPLATE_ID_3 to .env
4. ✅ Use the script with --template flag (1, 2, or 3)

Once you provide the template IDs, I can update the .env configuration for you!

---

## Documentation Files

- [EMAIL_TEMPLATES_SETUP.md](EMAIL_TEMPLATES_SETUP.md) — Detailed setup with cURLs
- [TEMPLATE_QUICK_REFERENCE.md](TEMPLATE_QUICK_REFERENCE.md) — Quick reference guide
- [send-emails.ts](server/src/scripts/send-emails.ts) — Script with template support (line 1-120 has instructions)
- [email.service.ts](server/src/services/email.service.ts) — Service with template documentation (line 1-150 has guide)
