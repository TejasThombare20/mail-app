import { useState } from "react";
import { v4 } from "uuid";
import { Accordion } from "src/components/ui-component/Accordian";
import { EditorElement, useEditor } from "src/providers/email-editor/editor-provider";
import AccordianHOC from "./helper/Accordian-HOC";
import { BORDER_STYLES, COLUMN_LAYOUTS } from "src/lib/constants";
import NumberInput from "../../editor-style-component/NumberInput";
import ColorPicker from "../../editor-style-component/ColorPicker";
import { Label } from "src/components/ui-component/Label";
import { Tabs, TabsList, TabsTrigger } from "src/components/ui-component/Tabs";
import { Button } from "src/components/ui-component/Button";
import { Plus, Trash2, Upload } from "lucide-react";
import OptionsPicker from "../../editor-style-component/OptionsPicker";
import { Input } from "src/components/ui-component/Input";
import { Switch } from "src/components/ui-component/Switch";

const ContentComponentStyles = () => {
  const { dispatch, state } = useEditor();
  const [activeTab, setActiveTab] = useState("column-1");

  const element = state.editor.selectedElement;

  // Extract current column information from element
  const columnCount = Array.isArray(element.content)
    ? element.content.length
    : 0;

  // Get the active column index (0-based)
  const activeColumnIndex = parseInt(activeTab.split("-")[1]) - 1;


  const handleLayoutChange = (layout: {
    label: string;
    value: string;
    columns: string[];
  }) => {
    const { columns } = layout;

    // Collect all existing content
    let allExistingContent : EditorElement[] | {
      href?: string;
      innerText?: string;
      src?: string;
  } = element.content;
    // if (Array.isArray(element.content) && element.content.length > 0) {
    //   // Gather all content from all existing columns
    //   allExistingContent = element.content.flatMap(col => 
    //     Array.isArray(col.content) ? col.content : []
    //   );
    // } 
    console.log("element content",element.content);
    console.log("allExistingContent",allExistingContent);

    // Create content array with appropriate column widths
    const updatedContent : EditorElement[] = columns.map((width: string, index: number) => {
      return {
        id: v4(),
        type: "container",
        name  : 'column',
        styles: {
          width: width,
          // padding: "8px",
          height: "100%", // Ensure column takes full height
          boxSizing: "border-box",
        },
        // Put all existing content in the first column, leave others empty
        content: index === 0 ? allExistingContent : [],
        isDraggable: false, // Disable dragging for column containers
      };
    });

    dispatch({
      type: "UPDATE_ELEMENT", 
      payload: {
        elementDetails: {
          ...element,
          content: updatedContent,
          styles: {
            ...element.styles,
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          },
        },
      },
    });
  };

  // const handleLayoutChange = (layout: {
  //   label: string;
  //   value: string;
  //   columns: string[];
  // }) => {
  //   const { columns } = layout;

  //   // Create content array with appropriate column widths
  //   const updatedContent : EditorElement  = columns.map((width: string, index: number) => {
  //     // Preserve existing content if available
  //     const existingColumn =
  //       Array.isArray(element.content) && element.content[index];

   
  //     return {
  //       id: existingColumn?.id || `column-${Date.now()}-${index}`,
  //       name: `Column ${index + 1}`,
  //       type: "container",
  //       styles: {
  //         width: width,
  //         padding: "8px",
  //         ...(existingColumn?.styles || {}),
  //       },
  //       content: existingColumn?.content || [],
  //     };
  //   });

  //   if (updatedContent && Array.isArray(updatedContent)) {
  //     dispatch({
  //       type: "UPDATE_ELEMENT", 
  //       payload: {
  //         elementDetails: {
  //           ...element,
  //           content: updatedContent,
  //           styles: {
  //             ...element.styles,
  //             display: "flex",
  //             flexDirection: "row",
  //             flexWrap: "wrap",
  //           },
  //         },
  //       },
  //     });
  //   }
  // };

  const handleStyleChange = (e: {
    target: {
      id: string;
      value: string | number | Record<string, number>;
    };
  }) => {
    const styleProperty = e.target.id;
    const value = e.target.value;

    if (activeTab === "container") {
      // Update container styles
      dispatch({
        type: "UPDATE_ELEMENT",
        payload: {
          elementDetails: {
            ...element,
            styles: {
              ...element.styles,
              [styleProperty]: value,
            },
          },
        },
      });
    } else {
      // Update column styles
      // const updatedContent = [...element.content];
      // updatedContent[activeColumnIndex] = {
      //   ...updatedContent[activeColumnIndex],
      //   styles: {
      //     ...updatedContent[activeColumnIndex].styles,
      //     [styleProperty]: value,
      //   },
      // };

      // dispatch({
      //   type: "UPDATE_ELEMENT",
      //   payload: {
      //     elementDetails: {
      //       ...element,
      //       content: updatedContent,
      //     },
      //   },
      // });
    }
  };

  // const handleDeleteColumn = (index: number) => {

  //   if(!Array.isArray(element.content)) return ;

  //   if (Array.isArray(element.content) && element.content?.length <= 1) return;

    

  //   const updatedContent =  element.content.filter(
  //     (_: any, i: number) => i !== index
  //   );

  //   // Recalculate widths to redistribute the space
  //   const equalWidth = Math.floor(100 / updatedContent.length);
  //   updatedContent.forEach((col: any, i: number) => {
  //     col.styles.width =
  //       i === updatedContent.length - 1
  //         ? `${100 - equalWidth * (updatedContent.length - 1)}%`
  //         : `${equalWidth}%`;
  //   });

  //   dispatch({
  //     type: "UPDATE_ELEMENT",
  //     payload: {
  //       elementDetails: {
  //         ...element,
  //         content: updatedContent,
  //       },
  //     },
  //   });

  //   // Update active tab if needed
  //   if (index === activeColumnIndex) {
  //     setActiveTab("column-1");
  //   } else if (index < activeColumnIndex) {
  //     setActiveTab(`column-${activeColumnIndex}`);
  //   }
  // };


  const handleDeleteColumn = (index: number) => {
    if(!Array.isArray(element.content)) return;

    if (Array.isArray(element.content) && element.content?.length <= 1) return;
    
    // Get content from the column being deleted
    const contentToPreserve = element.content[index].content || [];
    
    // Remove the column
    const updatedContent = element.content.filter(
      (_: any, i: number) => i !== index
    );

    // If there's content to preserve, add it to the first column
    if ( Array.isArray(contentToPreserve) && contentToPreserve.length > 0 && Array.isArray(updatedContent) &&  updatedContent.length > 0 && Array.isArray(updatedContent[0]?.content)) {
      updatedContent[0].content = [
        ...(updatedContent[0]?.content || []),
        ...contentToPreserve
      ];
    }

    // Recalculate widths to redistribute the space proportionally
    const totalWidth = 100;
    const equalWidth = Math.floor(totalWidth / updatedContent.length);
    const remainder = totalWidth - (equalWidth * updatedContent.length);
    
    updatedContent.forEach((col: any, i: number) => {
      // Add remainder to last column to ensure total equals 100%
      col.styles.width = i === updatedContent.length - 1
        ? `${equalWidth + remainder}%`
        : `${equalWidth}%`;
    });

    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        elementDetails: {
          ...element,
          content: updatedContent,
        },
      },
    });

    // Update active tab if needed
    if (index === activeColumnIndex) {
      setActiveTab("column-1");
    } else if (index < activeColumnIndex) {
      setActiveTab(`column-${activeColumnIndex}`);
    }
  };

  // const handleInsertColumn = (index: number) => {
  //   if (!Array.isArray(element.content)) return 
  //   const updatedContent = [...element.content];

  //   // Redistribute widths
  //   const equalWidth = Math.floor(100 / (updatedContent.length + 1));

  //   updatedContent.forEach((col: any, i: number) => {
  //     col.styles.width = `${equalWidth}%`;
  //   });

  //   // Create new column with equal width
  //   const newColumn = {
  //     id: `column-${Date.now()}`,
  //     name: `Column ${updatedContent.length + 1}`,
  //     type: "container",
  //     styles: {
  //       width: `${equalWidth}%`,
  //       padding: "8px",
  //     },
  //     content: [],
  //   };

  //   // Insert at the specified position
  //   // updatedContent.splice(index + 1, 0, newColumn);

  //   dispatch({
  //     type: "UPDATE_ELEMENT",
  //     payload: {
  //       elementDetails: {
  //         ...element,
  //         content: updatedContent,
  //       },
  //     },
  //   });

  //   // Select the newly inserted column
  //   setActiveTab(`column-${index + 2}`);
  // };

  const handleInsertColumn = (index: number) => {
    if (!Array.isArray(element.content)) return;
    const updatedContent = [...element.content];
    
    // Calculate new width distribution proportionally
    const totalColumns = updatedContent.length + 1;
    const equalWidth = Math.floor(100 / totalColumns);
    const remainder = 100 - (equalWidth * totalColumns);
    
    // Update widths of existing columns
    updatedContent.forEach((col: any) => {
      col.styles.width = `${equalWidth}%`;
    });

    // Create new column
    const newColumn : EditorElement = {
      id: v4(),
      type: "container",
      name  :  "column",
      styles: {
        width: `${equalWidth + remainder}%`, 
        padding: "8px",
        height: "100%",
        boxSizing: "border-box",
      },
      content: [],
    };

    // Insert at the specified position
    updatedContent.splice(index + 1, 0, newColumn);

    dispatch({
      type: "UPDATE_ELEMENT",
      payload: {
        elementDetails: {
          ...element,
          content: updatedContent,
        },
      },
    });

    // Select the newly inserted column
    setActiveTab(`column-${index + 2}`);
  };

  // Handle background image upload (mock implementation)
  const handleImageUpload = () => {
    // In a real implementation, this would handle file selection and upload
    const imageUrl = prompt("Enter image URL (for demo purposes):");
    if (imageUrl) {
      dispatch({
        type: "UPDATE_ELEMENT",
        payload: {
          elementDetails: {
            ...element,
            styles: {
              ...element.styles,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            },
          },
        },
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    // In a real implementation, this would handle file upload
    const imageUrl = prompt("Enter image URL (for demo purposes):");
    if (imageUrl) {
      dispatch({
        type: "UPDATE_ELEMENT",
        payload: {
          elementDetails: {
            ...element,
            styles: {
              ...element.styles,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            },
          },
        },
      });
    }
  };

  return (
    <div className="h-full overflow-y-scroll p-4">
      <Accordion
        type="multiple"
        defaultValue={[
          "columns",
          "column-properties",
          "row-properties",
          "responsive-design",
        ]}
      >
        {/* Column Layout Section */}
        <AccordianHOC value="columns" title="Columns">
          <div className="grid grid-cols-2 gap-2">
            {COLUMN_LAYOUTS.map((layout) => (
              <div
                key={layout.value}
                className="border rounded p-2 cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => handleLayoutChange(layout)}
              >
                <div className="flex h-8 w-full">
                  {layout.columns.map((width, index) => (
                    <div
                      key={index}
                      className="relative h-full border-r last:border-r-0 bg-gray-200"
                      style={{ width }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-xs opacity-0 bg-blue-50/80 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                        {width}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-xs mt-1 text-center">{layout.label}</div>
              </div>
            ))}
          </div>
        </AccordianHOC>

        {/* Column Properties Section */}
        <AccordianHOC value="column-properties" title="Column Properties">
          <div className="space-y-4">
            {columnCount > 0 ? (
              <>
                <div className="flex overflow-x-auto pb-2 mb-4">
                  <Tabs>
                  <TabsList className="h-auto">
                    {Array.from({ length: columnCount }).map((_, index) => (
                      <TabsTrigger
                        key={`column-${index + 1}`}
                        value={`column-${index + 1}`}
                        className="flex items-center gap-2 px-3 py-1"
                        onClick={() => setActiveTab(`column-${index + 1}`)}
                      >
                        Column {index + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  </Tabs>
                </div>

                <div className="flex justify-between mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteColumn(activeColumnIndex)}
                    disabled={columnCount <= 1}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Column
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleInsertColumn(activeColumnIndex)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Insert Column
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Background Color
                      </Label>
                      <ColorPicker
                        id="backgroundColor"
                        // value={
                        //   element.content[activeColumnIndex]?.styles
                        //     ?.backgroundColor || ""
                        // }
                        value=""
                        onChange={handleStyleChange}
                        label=""
                      />
                    </div>
                    <NumberInput
                      id="padding"
                      label="Padding"
                      // value={
                      //   element.content[activeColumnIndex]?.styles?.padding ||
                      //   "8px"
                      // }
                      value=""
                      onChange={handleStyleChange}
                      min={0}
                      max={100}
                      unit="px"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Border Style
                      </Label>
                      <OptionsPicker
                        // value={
                        //   element.content[activeColumnIndex]?.styles
                        //     ?.borderStyle || "none"
                        // }
                        value="none"
                        label=""
                        options={BORDER_STYLES}
                        placeHolder="Select border style"
                        onChange={(value) =>
                          handleStyleChange({
                            target: { id: "borderStyle", value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">
                        Border Color
                      </Label>
                      <ColorPicker
                        id="borderColor"
                        // value={
                        //   element.content[activeColumnIndex]?.styles
                        //     ?.borderColor || ""
                        // }
                        value="#FFFFF"
                        onChange={handleStyleChange}
                        label=""
                      />
                    </div>
                  </div>

                  <NumberInput
                    id="borderWidth"
                    label="Border Width"
                    // value={
                    //   element.content[activeColumnIndex]?.styles
                    //     ?.borderWidth || "0px"
                    // }
                    value=""
                    onChange={handleStyleChange}
                    min={0}
                    max={10}
                    unit="px"
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-20 border rounded border-dashed">
                <p className="text-sm text-muted-foreground">
                  No columns available
                </p>
              </div>
            )}
          </div>
        </AccordianHOC>
        <AccordianHOC title="Row Properties" value="row-properties">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">
                  Background Color
                </Label>
                <ColorPicker
                  id="backgroundColor"
                  value={element.styles?.backgroundColor || ""}
                  onChange={(e) =>
                    handleStyleChange({
                      target: {
                        id: "backgroundColor",
                        value: e.target.value,
                      },
                    })
                  }
                  label=""
                />
              </div>
              <NumberInput
                id="padding"
                label="Padding"
                value={element.styles?.padding || "8px"}
                onChange={(e) =>
                  handleStyleChange({
                    target: { id: "padding", value: e.target.value },
                  })
                }
                min={0}
                max={100}
                unit="px"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Background Image
              </Label>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={handleImageUpload}
                  className="flex items-center justify-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload Image
                </Button>

                <div
                  className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-6 w-6 text-gray-400" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop image here
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">
                    Image URL
                  </Label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={
                      element.styles?.backgroundImage?.replace(
                        /url\(['"](.+)['"]\)/,
                        "$1"
                      ) || ""
                    }
                    onChange={(e) =>
                      handleStyleChange({
                        target: {
                          id: "backgroundImage",
                          value: e.target.value
                            ? `url('${e.target.value}')`
                            : "",
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </AccordianHOC>

        {/* Row Properties Section */}

        {/* Responsive Design Section */}
        <AccordianHOC title="Responsive Design" value="responsive-design">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Hide on Desktop</Label>
              <Switch
                disabled
                aria-label="Toggle desktop visibility"
                // pressed={element.styles?.display === "none"}
              />
            </div>
            <p className="text-xs text-muted-foreground italic">
              (Upcoming Feature)
            </p>
          </div>
        </AccordianHOC>
      </Accordion>
    </div>
  );
};

export default ContentComponentStyles
