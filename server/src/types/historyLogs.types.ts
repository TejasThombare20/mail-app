import { variable } from "./template.types";

// Represents a single email_sessions row
export interface EmailSession {
  id: string;
  user_id: string;
  template_id: string;
  template_name?: string;
  subject: string;
  global_variables: variable[];
  total_emails: number;
  sent_count: number;
  failed_count: number;
  status: string;
  started_at: Date;
  completed_at: Date | null;
  created_at: Date;
  // Joined from email_logs
  email_logs?: EmailLogEntry[];
}

// Represents a single per-recipient email_logs row
export interface EmailLogEntry {
  id: number;
  session_id: string;
  user_id: string;
  template_id: string;
  recipient_email: string;
  local_variables: variable[];
  global_variables: variable[];
  subject: string;
  status: string;
  sent_at: Date;
  last_updated: Date;
}

// Keep backward compat alias
export type EmailLog = EmailSession;
