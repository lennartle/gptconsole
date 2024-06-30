import { ChangeEvent, useState, useEffect, useRef, memo } from "react";
import TextareaAutosize from "react-textarea-autosize";

type ChatInputProps = {
  onSubmit: ({ content, action }: { content: string; action: "send" | "save" }) => void;
  defaultValue?: string;
};

const Textarea = ({ onSubmit, defaultValue = "" }: ChatInputProps) => {
  const [content, setContent] = useState(defaultValue);
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const msg = content.trim();

      if (!msg) return;

      onSubmit({ content: msg, action: "send" });
    }

    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();

      const msg = content.trim();

      if (!msg) return;

      onSubmit({ content: msg, action: "save" });
    }
  };

  useEffect(() => {
    if (content === "" && !["TEXT", "TEXTAREA"].includes(document.activeElement?.nodeName || "")) {
      ref.current?.focus();
    }
  }, [content]);

  const textColor = defaultValue.length > 0 && content !== defaultValue ? "text-[#ffd985]" : "text-[#fff]";

  return (
    <>
      <TextareaAutosize
        minRows={1}
        placeholder="[Enter] - send, [Shift+Enter] - new line, [Ctrl+S] - save"
        onKeyDown={handleKeyDown}
        onChange={handleInputChange}
        value={content}
        className={`w-full resize-none overflow-hidden bg-black outline-none p-2 ${textColor}`}
        ref={ref}
      />
    </>
  );
};

export default memo(Textarea);
