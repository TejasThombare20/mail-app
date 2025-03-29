import { GlobalTemplateVariable, TemplateVariable } from "./template-types";


export interface receiver_emails {
    email: string;
    status : string;
    variables : TemplateVariable[]
}

export  interface getEmailLogsApiResponse {
    id: string;
    user_id: string;
    template_id: string;
    template_name: string;
    global_variables: GlobalTemplateVariable[]; 
    receiver_emails: receiver_emails[]; 
    subject: string;
    status: string;
    sent_at: string;
    last_updated: Date;
  };