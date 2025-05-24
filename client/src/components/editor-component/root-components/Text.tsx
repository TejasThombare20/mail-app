import clsx from "clsx";
import { Bold, GripVertical, Italic, Trash, Type, Underline } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "../../ui-component/Badge";
import {
  EditorElement,
  useEditor,
} from "../../../providers/email-editor/editor-provider";

type Props = {
  element: EditorElement;
};

const TextComponent = (props: Props) => {
  const { dispatch, state } = useEditor();
  const textRef = useRef<HTMLSpanElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleDeleteElement = () => {
    dispatch({
      type: "DELETE_ELEMENT",
      payload: { elementDetails: props.element },
    });
  };
  const styles = props.element.styles;

  const handleOnClickBody = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({
      type: "CHANGE_CLICKED_ELEMENT",
      payload: {
        elementDetails: props.element,
      },
    });
    if (!state.editor.liveMode) {
      setIsEditing(true);
    }
  };

  useEffect(() => {
    if (isEditing && textRef.current && !state.editor.liveMode) {
      textRef.current.focus();
    }
  }, [isEditing, state.editor.liveMode]);

  useEffect(() => {
    if (state.editor.selectedElement.id !== props.element.id) {
      setIsEditing(false);
    }
  }, [state.editor.selectedElement.id, props.element.id]);

  const isEmpty =
    (!Array.isArray(props.element.content) &&
      !props.element?.content?.innerText) ||
    (!Array.isArray(props.element.content) &&
      props.element.content?.innerText?.trim() === "");


  return (
    <div
      style={styles}
      className={clsx(
        "mx-1 w-[80%]  min-h-6 relative text-[16px] transition-all group",
        {
          "border-[1px] border-blue-500":
            state.editor.selectedElement.id === props.element.id,
          "hover:border-[1px] hover:border-blue-300 hover:bg-blue-50/30":
            !state.editor.liveMode &&
            state.editor.selectedElement.id !== props.element.id,
          "cursor-text": !state.editor.liveMode,
        }
      )}
      onClick={handleOnClickBody}
    >
      {/* Empty state with icon */}
      {isEmpty && !isEditing && !state.editor.liveMode ? (
        <div className=" w-full flex border border-blue-400  flex-col justify-center items-center p-2 gap-2">
          <Type size={16} className="text-gray-500" />
          <span className="text-gray-500">Text</span>
        </div>
      ) : (
        <span
          ref={textRef}
          className="focus:outline-none block p-2"
          contentEditable={!state.editor.liveMode && isEditing}
          onBlur={(e) => {
            const spanElement = e.target as HTMLSpanElement;
            dispatch({
              type: "UPDATE_ELEMENT",
              payload: {
                elementDetails: {
                  ...props.element,
                  content: {
                    innerText: spanElement.innerText,
                  },
                },
              },
            });
          }}
        >
          {!Array.isArray(props.element.content) &&
            props.element.content.innerText}
        </span>
      )}
      {state.editor.selectedElement.id === props.element.id && !state.editor.liveMode && (
        <div
          className={clsx(
            "absolute -right-[8px] top-1/2 -translate-y-1/2 bg-blue-300 p-1 text-white rounded-l-md shadow-sm cursor-grab opacity-0 transition-opacity",
            {
              "group-hover:opacity-100":
                state.editor.selectedElement.id !== props.element.id,
              "opacity-100":
                state.editor.selectedElement.id === props.element.id,
            }
          )}
        >
          <GripVertical size={16} />
        </div>
      )}
      {state.editor.selectedElement.id === props.element.id &&
        !state.editor.liveMode && (
          <div className="absolute flex items-center gap-1 p-1 z-[50] -bottom-8 right-0 bg-white border border-gray-200 rounded shadow-md">
            <button
              className="p-1 hover:bg-gray-100 rounded"
              onClick={(e) => {
                e.stopPropagation()
                // Handle bold action
              }}
            >
              <Bold size={14} />
            </button>
            <button
              className="p-1 hover:bg-gray-100 rounded"
              onClick={(e) => {
                e.stopPropagation()
                // Handle italic action
              }}
            >
              <Italic size={14} />
            </button>
            <button
              className="p-1 hover:bg-gray-100 rounded"
              onClick={(e) => {
                e.stopPropagation()
                // Handle underline action
              }}
            >
              <Underline size={14} />
            </button>
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <button
              className="p-1 hover:bg-red-100 text-red-500 rounded"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteElement()
              }}
            >
              <Trash size={14} />
            </button>
          </div>
        )}
    </div>
  );
};

export default TextComponent;
