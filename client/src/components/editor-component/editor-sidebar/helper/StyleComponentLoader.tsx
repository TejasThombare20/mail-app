import React, { useState } from "react";
import { motion } from "framer-motion";
import { useEditor } from "src/providers/email-editor/editor-provider";
import { Button } from "src/components/ui-component/Button";
import { X } from "lucide-react";
import TextComponentStyles from "../../root-components/contents/Text-Component";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "src/components/ui-component/Sheet";

interface ElementStylePanelProps {
  onClose?: () => void;
}

const StyleComponentLoader = () => {
  const [open, setOpen] = useState(true);

  const { state, dispatch } = useEditor();
  const selectedElement = state.editor.selectedElement;

  if (!selectedElement.id || !selectedElement.type) {
    return null;
  }

  const handleSheetToggle = (isOpen: boolean) => {
    setOpen(isOpen);

    if(!isOpen){
        dispatch({
            type: "CHANGE_CLICKED_ELEMENT",
            payload: {},
        });
    }
  };

  const renderStylePanel = () => {
    switch (selectedElement.type) {
      case "text":
        return <TextComponentStyles />;
      //   case 'link':
      //     return <LinkElementStyles element={selectedElement} />;
      //   case 'container':
      //   case '2Col':
      //   case '__body':
      //     return <ContainerElementStyles element={selectedElement} />;
      default:
        return (
          <div className="p-4">
            No style options available for this element type.
          </div>
        );
    }
  };
  return (
    <Sheet open={open} onOpenChange={handleSheetToggle} modal={false}>
    {/* // <Sheet open={true} modal={false}> */}
      <SheetContent
        onInteractOutside={(e) => e.preventDefault()}
        showX={true}
        side="right"
        className="mt-[97px] w-96  shadow-lg p-0 border-l overflow-hidden"
      >
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-sm font-medium">
              {selectedElement.name} Styles
            </SheetTitle>
          </div>
        </SheetHeader>
        <div className="overflow-y-auto h-[calc(100%-57px)]">
          {renderStylePanel()}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StyleComponentLoader;
