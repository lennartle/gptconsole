import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { Highlight } from "prism-react-renderer";

type MarkdownProps = {
  text?: string;
};

const Markdown = ({ text }: MarkdownProps) => (
  <ReactMarkdown
    components={{
      code({ node, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || "");
        return match ? (
          <Highlight theme={oneDarkTheme as any} code={String(children).replace(/\n$/, "")} language={match[1]}>
            {({ tokens, getLineProps, getTokenProps }) => (
              <>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </>
            )}
          </Highlight>
        ) : (
          <code {...props} className={className}>
            {children}
          </code>
        );
      },
    }}
  >
    {text || ""}
  </ReactMarkdown>
);

export default memo(Markdown);

const oneDarkTheme = {
  plain: { color: "#abb2bf" },
  styles: [
    { types: ["comment", "prolog"], style: { color: "#5c6370", fontStyle: "italic" } },
    { types: ["punctuation", "operator"], style: { color: "#56b6c2" } },
    { types: ["variable"], style: { color: "#e06c75" } },
    { types: ["property", "constant"], style: { color: "#ef596f" } },
    { types: ["string", "url", "attr-value"], style: { color: "#98c379" } },
    { types: ["keyword", "selector"], style: { color: "#c678dd" } },
    { types: ["number", "boolean"], style: { color: "#d19a66" } },
    { types: ["function", "builtin"], style: { color: "#81cbff" } },
    { types: ["tag", "doctype"], style: { color: "#e06c75" } },
    { types: ["attr-name"], style: { color: "#d19a66" } },
    { types: ["class-name", "maybe-class-name"], style: { color: "#60b5ff" } },
    { types: ["namespace"], style: { color: "#ee9393" } },
    { types: ["deleted"], style: { color: "#de7474" } },
    { types: ["important", "bold"], style: { fontWeight: "bold" } },
    { types: ["regex"], style: { color: "#a9e942" } },
    { types: ["italic"], style: { fontStyle: "italic" } },
    { types: ["entity"], style: { color: "#f9c859" } },
    { types: ["inserted"], style: { color: "#9dd66a" } },
  ],
};

const githubDarkTheme = {
  plain: { color: "#adbac7" },
  styles: [
    { types: ["comment", "prolog"], style: { color: "#6a737d", fontStyle: "italic" } },
    { types: ["punctuation", "operator"], style: { color: "#d1d5da" } },
    { types: ["variable"], style: { color: "#f97583" } },
    { types: ["property", "constant"], style: { color: "#f156a1" } },
    { types: ["string", "url", "attr-value"], style: { color: "#9ecbff" } },
    { types: ["keyword", "selector"], style: { color: "#b392f0" } },
    { types: ["number", "boolean"], style: { color: "#e4b1a4" } },
    { types: ["function", "builtin"], style: { color: "#72a1ff" } },
    { types: ["tag", "doctype"], style: { color: "#f472b6" } },
    { types: ["attr-name"], style: { color: "#e4b1a4" } },
    { types: ["class-name", "maybe-class-name"], style: { color: "#ffab7b" } },
    { types: ["namespace"], style: { color: "#e0dfff" } },
    { types: ["deleted"], style: { color: "#de7474" } },
    { types: ["important", "bold"], style: { fontWeight: "bold" } },
    { types: ["regex"], style: { color: "#80e8dd" } },
    { types: ["italic"], style: { fontStyle: "italic" } },
    { types: ["entity"], style: { color: "#f0c674" } },
    { types: ["inserted"], style: { color: "#73da91" } },
  ],
};

const nordicVibeTheme = {
  plain: { color: "#e5e9f0" },
  styles: [
    { types: ["comment", "block-comment"], style: { color: "#8fbcbb", fontStyle: "italic" } },
    { types: ["punctuation"], style: { color: "#81a1c1" } },
    { types: ["property", "variable"], style: { color: "#88c0d0" } },
    { types: ["constant"], style: { color: "#b48ead" } },
    { types: ["string", "url", "attr-value"], style: { color: "#a3be8c" } },
    { types: ["keyword", "selector"], style: { color: "#81a1c1" } },
    { types: ["number", "boolean"], style: { color: "#d08770" } },
    { types: ["function"], style: { color: "#88c0d0" } },
    { types: ["builtin"], style: { color: "#ea9153" } },
    { types: ["tag"], style: { color: "#8fbcbb" } },
    { types: ["attr-name"], style: { color: "#81a1c1" } },
    { types: ["class-name"], style: { color: "#5e81ac" } },
    { types: ["maybe-class-name"], style: { color: "#8fbcbb" } },
    { types: ["namespace"], style: { color: "#4c566a" } },
    { types: ["deleted"], style: { color: "#bf616a" } },
    { types: ["important"], style: { fontWeight: "bold" } },
    { types: ["bold"], style: { fontWeight: "bold" } },
    { types: ["regex"], style: { color: "#ebcb8b" } },
    { types: ["italic"], style: { fontStyle: "italic" } },
    { types: ["entity"], style: { color: "#b48ead" } },
    { types: ["inserted"], style: { color: "#a3be8c" } },
  ],
};
