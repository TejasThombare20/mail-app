import React from "react";

import TextComponent from "./Text";

import LinkComponent from "./Link-component";
import { EditorElement } from "../../../providers/email-editor/editor-provider";
import Container from "./Container";
import Body from "./Body";

type Props = {
  element: EditorElement;
};

const Recursive = ({ element }: Props) => {
  switch (element.type) {
    case "text":
      return <TextComponent element={element} />;

    case "container":
      return <Container element={element} />;

    case "2Col":
      return <Container element={element} />;

    case "__body":
      return <Body element={element} />;

    case "link":
      return <LinkComponent element={element} />;

    default:
      return null;
  }
};

export default Recursive;
