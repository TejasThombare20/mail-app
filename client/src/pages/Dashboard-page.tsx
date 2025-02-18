import React from 'react'
import EmailTemplateEditor from '../components/Email-template-editor'
import EmailTemplateForm from '../components/Email-template-form'
import { EmailTemplate } from '../types/template-types';

const Dashboard = () => {

  const emailTemplate: EmailTemplate = {
    name: "Welcome Email",
    category: "Onboarding",
    attachments: [],
    html: "<h1>Welcome to our platform!</h1>",
    design: {},
  };

  const onSubmit = () => {

  }


  return (
    // <div><EmailTemplateEditor/></div>
    <div><EmailTemplateForm 
          template={emailTemplate}
          onSubmit={onSubmit}
    /></div>
  )
}

export default Dashboard