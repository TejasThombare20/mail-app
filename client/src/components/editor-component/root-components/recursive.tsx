import React from "react";

import TextComponent from "./Text";
import Container from "./Container";
import LinkComponent from "./Link-component";
import { EditorElement } from "../../../providers/email-editor/editor-provider";

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
      return <Container element={element} />;

    case "link":
      return <LinkComponent element={element} />;

    default:
      return null;
  }
};

export default Recursive;
