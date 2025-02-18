import React from "react";
import { Card, CardContent } from "./ui-component/Card";
import { Button } from "./ui-component/Button";
import { File, X } from "lucide-react";
import { Attachment } from "../types/attachment.type";

interface AttachmentListProps {
  selectedAttachments: Attachment[];
  onRemoveAttachment: (attachment: Attachment) => void;
}

export const AttachmentList = ({
  selectedAttachments,
  onRemoveAttachment,
}: AttachmentListProps) => {
  if (selectedAttachments.length === 0) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {selectedAttachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative p-4 border rounded-lg hover:bg-gray-50"
            >
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => onRemoveAttachment(attachment)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-3 mt-4">
                <File className="h-5 w-5 text-gray-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{attachment.file_name}</p>
                  <p className="text-sm text-gray-500">
                    {attachment.file_size}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
