# Email Templates — Quick Reference

## 3 Email Templates Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ Template 1: REFERRAL REQUEST (DEFAULT)                          │
├─────────────────────────────────────────────────────────────────┤
│ Use: Cold email asking someone for a referral                   │
│ Example: "would you be open to referring me?"                   │
│ Key: Works for anyone, unknown or known                          │
│ Default: Used if --template flag not specified                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Template 2: DIRECT HIRING MANAGER                               │
├─────────────────────────────────────────────────────────────────┤
│ Use: Message to hiring manager after their LinkedIn post        │
│ Example: "I came across your LinkedIn post about the opening"   │
│ Key: Direct, professional, enthusiastic tone                    │
│ When: You found them via their public job posting               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Template 3: TEAM MEMBER INDIRECT                                │
├─────────────────────────────────────────────────────────────────┤
│ Use: Outreach to team member to forward your resume             │
│ Example: "would you mind forwarding my resume to the..."        │
│ Key: Friendly, asks for help without pressure                   │
│ When: You know someone at the company (not the hiring manager)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## How to Choose

**Decision Tree:**
```
Is recipient a HIRING MANAGER?
  ├─ YES, with public job post → Use Template 2
  └─ NO, team member? → Use Template 3
                    NO → Use Template 1 (cold outreach)
```

---

## Command Examples

### Template 1 (Default) — Referral Request
```bash
npx ts-node src/scripts/send-emails.ts \
  --data '[{"email":"john@acme.com","firstName":"John"}]' \
  --company "Acme Corp" \
  --portalLink "https://acme.careers/job/sde-1" \
  --role "SDE-1"
```

### Template 2 — Direct to Hiring Manager
```bash
npx ts-node src/scripts/send-emails.ts \
  --data '[{"email":"alice@google.com","firstName":"Alice"}]' \
  --company "Google" \
  --portalLink "https://linkedin.com/posts/alice-hiring-post" \
  --template 2 \
  --role "SDE"
```

### Template 3 — To Team Member
```bash
npx ts-node src/scripts/send-emails.ts \
  --data '[{"email":"bob@microsoft.com","firstName":"Bob"}]' \
  --company "Microsoft" \
  --portalLink "https://microsoft.careers/sde-role" \
  --template 3 \
  --role "SDE-2"
```

---

## Mandatory Parameters

| Parameter | Example | Notes |
|-----------|---------|-------|
| `--data` | `[{"email":"x@y.com","firstName":"John"}]` | JSON array, can have multiple recipients |
| `--company` | `Google` | Global variable, same for all recipients |
| `--portalLink` | `https://linkedin.com/...` | URL to job posting, LinkedIn post, or portal |

## Optional Parameters

| Parameter | Default | Notes |
|-----------|---------|-------|
| `--template` | `1` | Choose 1, 2, or 3 |
| `--role` | `SDE` | Job role name |
| `--from` | `iamtejasthombare@gmail.com` | Sender email (must exist in DB) |
| `--subject` | "Hi {{receiver_name}} - ..." | Can use template variables |

---

## Placeholders

All templates support these:

| Placeholder | Type | Example | Auto? |
|-------------|------|---------|-------|
| `{{receiver_name}}` | Local | "John", "Alice" | ✓ Extracted from email |
| `{{company_name}}` | Global | "Google" | — Provided by you |
| `{{ROLE}}` | Global | "SDE-2" | — Provided by you (defaults to "SDE") |
| `{{portal_link}}` | Global | "https://..." | — Provided by you |

---

## Important Notes

✓ **Auto First Name Extraction:** If you don't provide firstName in JSON, it's auto-extracted from email  
✓ **Empty Cleanup:** The service removes empty placeholders and fixes whitespace  
✓ **Rate Limiting:** 2.5 second delay between emails  
✓ **Attachments:** Resume auto-attached if `DEFAULT_ATTACHMENT_ENABLED=true`  
✓ **Non-ASCII:** Special characters auto-sanitized (em-dashes → regular dashes)  

---

## Files Updated

- ✅ [send-emails.ts](server/src/scripts/send-emails.ts) — Added template support
- ✅ [email.service.ts](server/src/services/email.service.ts) — Added template documentation
- ✅ [EMAIL_TEMPLATES_SETUP.md](EMAIL_TEMPLATES_SETUP.md) — Complete setup guide with Postman cURLs

---

## Next Steps (For You)

1. Run the 3 Postman cURLs from [EMAIL_TEMPLATES_SETUP.md](EMAIL_TEMPLATES_SETUP.md)
2. Get the template IDs from API responses
3. Add to `.env`:
   ```
   TEMPLATE_ID_1=YOUR_ID_HERE
   TEMPLATE_ID_2=YOUR_ID_HERE
   TEMPLATE_ID_3=YOUR_ID_HERE
   ```
4. Test with one of the command examples above
