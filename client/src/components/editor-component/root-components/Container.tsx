import clsx from "clsx";
import React, { useState } from "react";
import { v4 } from "uuid";
import Recursive from "./recursive";
import { GripVertical, LayoutGrid, Trash } from "lucide-react";
import {
  EditorElement,
  useEditor,
} from "../../../providers/email-editor/editor-provider";
import { defaultStyles, EditorBtns } from "../../../lib/constants";

type Props = { element: EditorElement };

const Container = ({ element }: Props) => {
  const { id, content, name, styles, type } = element;
  const { dispatch, state } = useEditor();
  const [showPartitionMenu, setShowPartitionMenu] = useState(false);

  const handleOnDrop = (e: React.DragEvent, type: string) => {
    e.stopPropagation();
    const componentType = e.dataTransfer.getData("componentType") as EditorBtns;

    console.log("componentType",componentType);

    switch (componentType) {
      case "text":
        dispatch({
          type: "ADD_ELEMENT",
          payload: {
            containerId: id,
            elementDetails: {
              content: { innerText: "Text Element" },
              id: v4(),
              name: "Text",
              styles: {
                color: "black",
                ...defaultStyles,
              },
              type: "text",
            },
          },
        });
        break;
      case "link":
        dispatch({
          type: "ADD_ELEMENT",
          payload: {
            containerId: id,
            elementDetails: {
              content: {
                innerText: "Link Element",
                href: "#",
              },
              id: v4(),
              name: "Link",
              styles: {
                color: "black",
                ...defaultStyles,
              },
              type: "link",
            },
          },
        });
        break;
        case "container":
          dispatch({
            type: "ADD_ELEMENT",
            payload: {
              containerId: id,
              elementDetails: {
                content: [],
                id: v4(),
                name: "Container",
                styles: { ...defaultStyles },
                type: "container",
              },
            },
          });
          break;
      //   case "2Col":
      //     dispatch({
      //       type: "ADD_ELEMENT",
      //       payload: {
      //         containerId: id,
      //         elementDetails: {
      //           content: [
      //             {
      //               content: [],
      //               id: v4(),
      //               name: "Container",
      //               styles: { ...defaultStyles, width: "100%" },
      //               type: "container",
      //             },
      //             {
      //               content: [],
      //               id: v4(),
      //               name: "Container",
      //               styles: { ...defaultStyles, width: "100%" },
      //               type: "container",
      //             },
      //           ],
      //           id: v4(),
      //           name: "Two Columns",
      //           styles: { ...defaultStyles, display: "flex" },
      //           type: "2Col",
      //         },
      //       },
      //     });
      //     break;
      // }
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

    const handleDeleteElement = () => {
      dispatch({
        type: "DELETE_ELEMENT",
        payload: {
          elementDetails: element,
        },
      });
    };

    const partitionContainer = (distribution: string, columns: number) => {
      setShowPartitionMenu(false);

      // Parse distribution into percentages
      const widths = distribution.split("-").map((part) => `${part}%`);

      // Prepare child containers
      const childContainers = [];

      // If there are existing children, we need to put them in the first column
      const existingContent = Array.isArray(content) ? [...content] : [];

      // Create columns
      for (let i = 0; i < columns; i++) {
        childContainers.push({
          content: i === 0 ? existingContent : [], // Put existing content in first column
          id: v4(),
          name: "Container",
          styles: {
            ...defaultStyles,
            width: widths[i],
            padding: "4px",
            margin: "0px",
          },
          type: "container",
        });
      }

      // Update the container
      dispatch({
        type: "UPDATE_ELEMENT",
        payload: {
          elementDetails: {
            ...element,
            // content: childContainers,
            styles: {
              ...styles,
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
            },
          },
        },
      });
    };

    const isSelectedElement =
      state.editor.selectedElement.id === id && !state.editor.liveMode;
    const isEmpty = Array.isArray(content) && content.length === 0;

    return (
      <div
        style={styles}
        className={clsx("relative  flex flex-col justify-center items-center", {
          "max-w-full w-full": type == 'container', 
          "min-h-10 h-fit": type === "container",
          "border-2 border-blue-500": isSelectedElement && !state.editor.liveMode,
          "border hover:border-blue-400 not-has-[.child:hover]:hover:border-blue-400 has-[.child:hover]:hover:border-transparent ":
            !state.editor.liveMode && !isSelectedElement,
        })}
        onDrop={(e) => handleOnDrop(e, id)}
        onDragOver={handleDragOver}
        draggable={type !== "__body"}
        onClick={handleOnClickBody}
        onDragStart={(e) => handleDragStart(e, "container")}
      >
        <div
          className={clsx(
            "absolute right-0 bottom-0 bg-blue-500 text-white text-xs py-1 px-2 opacity-0 transition-opacity",
            {
              "hover:opacity-100":
                !state.editor.liveMode && !isSelectedElement,
            }
          )}
        >
          {name}
        </div>

        {isEmpty && !state.editor.liveMode ? (
          <div className=" w-full flex justify-center items-center border-2 border-blue-400 ">
          <div className=" w-[400px] border-spacing-1 border-blue-400 text-center content-center bg-blue-200  h-20 my-4 ">
            drag element from right side
          </div>
          </div>
        ) : (
          Array.isArray(content) &&
          content.map((childElement) => (
            <Recursive key={childElement.id} element={childElement} />
          ))
        )}

        {isSelectedElement && type !== "__body" && (
          <div className="absolute flex items-center gap-1 p-1 -bottom-8 right-0 bg-white border border-gray-200 rounded shadow-md">
            <div className="w-px h-4 bg-gray-200 mx-1"></div>
            <button
              className="p-1 hover:bg-red-100 text-red-500 rounded"
              onClick={handleDeleteElement}
            >
              <Trash size={14} />
            </button>
          </div>
        )}

        { !state.editor.liveMode && (
          <div
            className={clsx(
              "absolute right-0 top-1/2 -translate-y-1/2 bg-primary p-1 text-white rounded-l-md shadow-sm cursor-grab opacity-0 transition-opacity",
              {
                "hover:opacity-100": !isSelectedElement,
                "opacity-100": isSelectedElement,
              }
            )}
          >
            <GripVertical size={16} />
          </div>
        )}
      </div>
    );
  };


export default Container;
