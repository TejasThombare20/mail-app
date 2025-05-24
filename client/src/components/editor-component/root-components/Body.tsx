import clsx from "clsx";
import React from "react";
import { v4 } from "uuid";
import Recursive from "./recursive";
import {
  EditorElement,
  useEditor,
} from "../../../providers/email-editor/editor-provider";
import { defaultStyles, EditorBtns } from "../../../lib/constants";

type Props = { element: EditorElement };

const Body = ({ element }: Props) => {
  const { id, content, name, styles, type } = element;
  const { dispatch, state } = useEditor();


  const handleOnDrop = (e: React.DragEvent, type: string) => {
    e.stopPropagation();
    const componentType = e.dataTransfer.getData("componentType") as EditorBtns;

    console.log("componentType",componentType);

    switch (componentType) {

        case "container":
          dispatch({
            type: "ADD_ELEMENT",
            payload: {
              containerId: id,
              elementDetails: {
                content: [],
                id: v4(),
                name: "Row",
                styles: { ...defaultStyles },
                type: "container",
              },
            },
          });
          break;
    
    }
  }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
    };

    const handleDragStart = (e: React.DragEvent, type: string) => {
      if (type === "__body") return;
      e.dataTransfer.setData("componentType", type);
    };

    const handleOnClickBody = (e: React.MouseEvent) => {
      e.stopPropagation();
      dispatch({
        type: "CHANGE_CLICKED_ELEMENT",
        payload: {
          elementDetails: element,
        },
      });
    };


    const isSelectedElement =
      state.editor.selectedElement.id === id && !state.editor.liveMode;
    const isEmpty = Array.isArray(content) && content.length === 0;

    return (
      <div
        style={styles}
        className={clsx("relative py-1 px-3 transition-all group", {
          "h-full": true,
          "overflow-auto": type === "__body",
          "border-2 border-yellow-400": isSelectedElement && type === "__body",
          "border border-dashed border-gray-300 hover:border-blue-300":
            !state.editor.liveMode && !isSelectedElement,
        })}
        onDrop={(e) => handleOnDrop(e, id)}
        onDragOver={handleDragOver}
        draggable={type !== "__body"}
        onClick={handleOnClickBody}
        onDragStart={(e) => handleDragStart(e, "container")}
      >

        {isEmpty && !state.editor.liveMode ? (
          <div className ={
            clsx("w-full flex justify-center items-center border border-blue-500 ", {

            })
          }
          >
          <div  className=" w-[500px] border-spacing-1  border border-dashed border-blue-400 text-center content-center bg-blue-200  h-20">
            Add Row
          </div>
          </div>
        ) : (
          Array.isArray(content) &&
          content.map((childElement) => (
            <Recursive key={childElement.id} element={childElement} />
          ))
        )}
      </div>
    );
  };


export default Body;
