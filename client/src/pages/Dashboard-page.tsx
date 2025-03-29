import React from 'react'
import EmailTemplateEditor from '../components/Email-template-editor'
import EmailTemplateForm from '../components/Email-template-form'
import { EmailTemplate } from '../types/template-types';
import SendEmailForm from '../components/Send-Email-form';
import { Sidebar } from '../components/Left-sidebar';
import { Outlet } from 'react-router-dom';

const DashboardPage = () => {

  // const emailTemplate: EmailTemplate = {
  //   name: "Welcome Email",
  //   category: "Onboarding",
  //   attachments: [],
  //   json_data : {}
  // };

  const onSubmit = () => {

  }


  return (
    <div className="flex h-screen">
    <Sidebar />
    <main className=" w-full flex-1 overflow-y-auto p-1 mx-1 ">
      <Outlet  />
    </main>
    </div>
  )
}

export default DashboardPage