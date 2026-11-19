"use client";

import Editor from "@monaco-editor/react";
import { clsx } from "cn";
import React, { useMemo } from "react";

interface CodeEditorProps {
  value: string;
  language: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: React.ComponentProps<"div">["className"];
}

export default function CodeEditor({
  value,
  language,
  onChange,
  readOnly = false,
  className,
}: CodeEditorProps) {
  const editorHeight = useMemo(() => {
    const lineCount = value.split("\n").length;

    const lineHeight = 21;
    const padding = 32;
    const minHeight = 100;
    const maxHeight = 500;

    return Math.min(
      Math.max(lineCount * lineHeight + padding, minHeight),
      maxHeight
    );
  }, [value]);

  return (
    <div className={clsx("overflow-hidden rounded-lg border", className)}>
      <Editor
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(value) => onChange?.(value ?? "")}
        height={`${editorHeight}px`}
        options={{
          contextmenu: !readOnly,
          fontSize: 14,
          lineHeight: 21,
          minimap: { enabled: false },
          wordWrap: "on",
          automaticLayout: true,
          tabSize: 2,
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          formatOnPaste: true,
          formatOnType: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          tabCompletion: "on",
          autoClosingBrackets: "always",
          autoClosingQuotes: "always",
          readOnly,
          domReadOnly: readOnly,
        }}
      />
    </div>
  );
}