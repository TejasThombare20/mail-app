import { variable } from "./template.types";



export interface receiver_emails {
    email: string;
    status : string;
    variables : variable[]
}

export  type EmailLog = {
    id: string;
    user_id: string;
    template_id: string;
    template_name: string;
    global_variables: variable[]; 
    receiver_emails: receiver_emails[]; 
    subject: string;
    status: string;
    sent_at: Date;
    last_updated: Date;
  };