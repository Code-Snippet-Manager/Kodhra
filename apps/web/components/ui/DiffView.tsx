
"use client";

import {
  DiffEditor,
  type DiffEditorProps,
} from "@monaco-editor/react";
import { clsx } from "cn";
import React from "react";

interface DiffViewProps {
  original: string;
  modified: string;
  language: string;
  height?: string | number;
  theme?: string;
  readOnly?: boolean;
  originalEditable?: boolean;
  className?: React.ComponentProps<"div">["className"];
  options?: DiffEditorProps["options"];
}

export default function DiffView({
  original,
  modified,
  language,
  height = "500px",
  theme = "vs-dark",
  readOnly = true,
  originalEditable = false,
  className,
  options,
}: DiffViewProps) {
  return (
    <div
      className={clsx(
        "rounded-lg border",
        className
      )}
    >
      <DiffEditor
        original={original}
        modified={modified}
        language={language}
        className="m-h-full"
        theme={theme}
        height={height}
        width="100%"
        options={{
          readOnly,
          originalEditable: readOnly
            ? false
            : originalEditable,
          renderSideBySide: true,
          enableSplitViewResizing: true,
          renderOverviewRuler: false,
          diffWordWrap: "on",
          ignoreTrimWhitespace: false,
          fontSize: 14,
          lineHeight: 21,
          minimap: {
            enabled: false,
          },
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: {
            top: 16,
            bottom: 16,
          },
          renderIndicators: true,
          diffAlgorithm: "advanced",
          hideUnchangedRegions: {
            enabled: true,
            contextLineCount: 3,
            minimumLineCount: 3,
          },

          ...options,
        }}
      />
    </div>
  );
}
