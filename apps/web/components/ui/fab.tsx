"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Code2,
  FolderPlus,
  FileUp,
  FileCode,
  Clipboard,
  Braces,
  LayoutTemplate,
  FileJson,
  Terminal,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
type FabAction =
  | "create-snippet"
  | "create-folder"
  | "import-file"
  | "paste-code"
  | "import-github"
  | "json-template"
  | "react-template"
  | "node-template"
  | "open-playground";
interface FabButtonProps {
  onAction: (action: FabAction) => void;
}
export function FabButton({ onAction }: FabButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            size="icon"
            variant={"default"}
            className="fixed bottom-5 right-5 z-50 size-12 rounded-full shadow-lg"
            aria-label="Quick actions"
          >
            <Plus className="size-6" />
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        side="top"
        sideOffset={12}
        className="w-60"
      >
        <DropdownMenuItem
          onSelect={() => onAction("create-snippet")}
        >
          <Code2 />
          Create Snippet
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => onAction("create-folder")}
        >
          <FolderPlus />
          Create Folder
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <FileUp />
            Import Code
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onSelect={() => onAction("import-file")}
            >
              <FileCode />
              Upload File
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onAction("paste-code")}
            >
              <Clipboard />
              Paste Code
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onAction("import-github")}
            >
              <FaGithub />
              Import from GitHub
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <LayoutTemplate />
            Templates
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onSelect={() => onAction("json-template")}
            >
              <FileJson />
              JSON Template
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onAction("react-template")}
            >
              <Braces />
              React Component
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onAction("node-template")}
            >
              <Terminal />
              Node.js Script
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => onAction("open-playground")}
        >
          <Braces />
          Open Playground
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
