import { useState } from "react";
import { useEditor } from "src/providers/email-editor/editor-provider";
import TextComponentStyles from "../../root-components/styles-pannel/Text-Component";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "src/components/ui-component/Sheet";
import ContentComponentStyles from "../../root-components/styles-pannel/Content-Component";


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
        case 'container':
          return <ContentComponentStyles />;
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
      <SheetContent
        onInteractOutside={(e) => e.preventDefault()}
        showX={true}
        side="right" 
        className="mt-[97px] shadow-lg p-0 border-l flex flex-col h-[calc(100vh-97px)] "
      >
        <SheetHeader className="p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-sm font-medium">
              {selectedElement.name} Styles
            </SheetTitle>
          </div>
        </SheetHeader>
        <div className="flex-grow h-[calc(100vh-200px)]">
          {renderStylePanel()}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StyleComponentLoader;
