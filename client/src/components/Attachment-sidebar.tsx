import { Attachment } from '../types/attachment.type';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui-component/Sheet';
import { ScrollArea } from './ui-component/Scroll-Area';
import { Checkbox } from './ui-component/Checkbox';
import { File } from 'lucide-react';


interface AttachmentSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  attachments: Attachment[];
  selectedAttachments: Attachment[];
  onAttachmentToggle: (attachment: Attachment) => void;
}

export const AttachmentSidebar = ({
  isOpen,
  onClose,
  attachments,
  selectedAttachments,
  onAttachmentToggle
}: AttachmentSidebarProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[400px]">
        <SheetHeader>
          <SheetTitle>Select Attachments</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          <div className="space-y-4">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center space-x-4 p-2 hover:bg-gray-100 rounded-lg"
              >
                <Checkbox
                  checked={selectedAttachments.some(a => a.id === attachment.id)}
                  onCheckedChange={() => onAttachmentToggle(attachment)}
                />
                <File className="h-5 w-5 text-gray-500" />
                <div className="flex-1">
                  <p className="font-medium">{attachment.file_name}</p>
                  <p className="text-sm text-gray-500">
                    {attachment.file_size} • {new Date(attachment.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};