import Markdoc, { type Node } from "@markdoc/markdoc";
import React from "react";

// Renders page text written in the Keystatic editor (Markdoc / Markdown).
// Runs at build time only; the result is static HTML.
export function Prose({ node }: { node: Node }) {
  const tree = Markdoc.transform(node);
  return <div className="prose">{Markdoc.renderers.react(tree, React)}</div>;
}
