import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import EmailEditor, { EditorRef } from "react-email-editor";
import { Card, CardContent, CardHeader, CardTitle } from "./ui-component/Card";
import { Label } from "./ui-component/Label";
import { Input } from "./ui-component/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui-component/Select";
import { Button } from "./ui-component/Button";
import { EmailTemplate } from "../types/template-types";
import { Attachment } from "../types/attachment.type";
import { AttachmentSidebar } from "./Attachment-sidebar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui-component/Form";
import { Paperclip } from "lucide-react";
import { AttachmentList } from "./Attachmenet-List";



export const emailTemplateSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    category: z.string().min(1, "Category is required"),
    attachments: z.array(z.object({
      id: z.string(),
      file_name: z.string(),
      file_type: z.string(),
      file_size: z.string(),
      json_data : z.object(),
      html_content : z.string(),
      uploaded_at: z.string(),
    }))
  });
  
 type EmailTemplateFormData = z.infer<typeof emailTemplateSchema>;

interface EmailTemplateFormProps {
    template?: EmailTemplate;
    onSubmit: (data: EmailTemplateFormData) => void;
  }

const EmailTemplateForm = ({ template, onSubmit }: EmailTemplateFormProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const emailEditorRef = useRef<EditorRef | null>(null);

  const form = useForm<EmailTemplateFormData>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      name: template?.name || "",
      category: template?.category || "",
      attachments: template?.attachments || []
    }
  });

  // Mock attachments data - replace with API call
  const availableAttachments: Attachment[] = [
    {
      id: "1",
      file_name: "terms.pdf",
      file_type: "application/pdf",
      file_size: "245KB",
      uploaded_at: "2024-02-18T10:30:00"
    },
    {
      id: "2",
      file_name: "logo.png",
      file_type: "image/png",
      file_size: "50KB",
      uploaded_at: "2024-02-18T11:20:00"
    }
  ];

  const handleAttachmentToggle = (attachment: Attachment) => {
    const currentAttachments = form.getValues("attachments");
    const isSelected = currentAttachments.some(a => a.id === attachment.id);
    
    const newAttachments = isSelected
      ? currentAttachments.filter(a => a.id !== attachment.id)
      : [...currentAttachments, attachment];
    
    form.setValue("attachments", newAttachments, { shouldDirty: true });
  };

  const handleSubmit = async (data: EmailTemplateFormData) => {
    if (emailEditorRef.current && emailEditorRef?.current?.editor) {
      emailEditorRef?.current?.editor.exportHtml((data: { design: object, html: string }) => {
        onSubmit({
          ...form.getValues(),
          html: data.html,
          design: data.design
        });
      });
    }
  };

  useEffect(() => {
    const subscription = form.watch(() => {
      setIsFormDirty(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);
  
    const onReady = () => {
      if (template && emailEditorRef.current) {
        // Load existing template design if editing
        // emailEditorRef.current?.editor?.loadDesign(template?.design);
      }
    };
  
    return (
        <div className="container mx-auto p-6 space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>{template ? 'Edit Template' : 'Create New Template'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
  
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="transactional">Transactional</SelectItem>
                          <SelectItem value="newsletter">Newsletter</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
  
                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsSidebarOpen(true)}
                    className="w-full"
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    Select Attachments
                  </Button>
  
                  <AttachmentList
                    selectedAttachments={form.getValues("attachments")}
                    onRemoveAttachment={handleAttachmentToggle}
                  />
                </div>
  
                <div className="h-[600px] border rounded-lg">
                  <EmailEditor
                    ref={emailEditorRef}
                    onReady={() => {
                      if (template && template.design) {
                        //@
                        emailEditorRef.current?.editor?.loadDesign(template.design );
                      }
                    }}
                  />
                </div>
  
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={template && !isFormDirty}
                  >
                    {template ? 'Update Template' : 'Save Template'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
  
        <AttachmentSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          attachments={availableAttachments}
          selectedAttachments={form.getValues("attachments")}
          onAttachmentToggle={handleAttachmentToggle}
        />
      </div>
    );
  };
  
  export default EmailTemplateForm;