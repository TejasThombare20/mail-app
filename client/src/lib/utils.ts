import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { receiver_emails } from "../types/email-logs";
import { CSSProperties } from "react";
import { EditorState, useEditor } from "src/providers/email-editor/editor-provider";
import { STYLE_PROPERTIES, StylePropertyKey } from "./constants";
import { GroupedStyleField } from "src/types/editor-styling-types";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const calculateSuccessRate = (receivers: receiver_emails[]) => {
  const total = receivers.length;
  if (total === 0) return { rate: 0, successful: 0, total: 0 };

  const successful = receivers.filter((r) => r.status === "sent").length;
  const rate = (successful / total) * 100;

  return { rate, successful, total };
};

export const getStyleValueForSelectedElement = (
  styleBlock: GroupedStyleField, state  :EditorState
) => {
  const deviceType = state.editor.device;
  const defaultValue =  styleBlock.defaultValue
  const newDefaultValue = typeof defaultValue === "string" ? defaultValue : defaultValue[deviceType]

    return state.editor.selectedElement.styles[styleBlock.key] ?? newDefaultValue;

};
