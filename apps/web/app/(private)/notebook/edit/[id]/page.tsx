"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import TextAlign from "@tiptap/extension-text-align";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { all, createLowlight } from "lowlight";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronDown,
  Code,
  CodeSquare,
  Columns2,
  Eraser,
  FileText,
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Info,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  ListTodo,
  Loader2,
  Minus,
  PaintRoller,
  Palette,
  Pilcrow,
  Plus,
  Quote,
  Redo2,
  Rows2,
  Save,
  Strikethrough,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo2,
  X,
} from "lucide-react";
const lowlight = createLowlight(all);
const languages = [
  { label: "Plain Text", value: "plaintext" },
  ...lowlight.listLanguages().map((language) => ({
    label: language.charAt(0).toUpperCase() + language.slice(1),
    value: language,
  })),
];
const textColors = [
  "#000000",
  "#525252",
  "#737373",
  "#a3a3a3",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
];
const highlightColors = [
  "#fef08a",
  "#fed7aa",
  "#fecaca",
  "#fbcfe8",
  "#e9d5ff",
  "#c7d2fe",
  "#bae6fd",
  "#a7f3d0",
  "#bbf7d0",
  "#d9f99d",
  "#e5e5e5",
  "#ffffff",
];
// --------------------------------------------------
// TOOLBAR BUTTON
// --------------------------------------------------
type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  title: string;
};
function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  title,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      size="icon"
      variant={active ? "secondary" : "ghost"}
      disabled={disabled}
      title={title}
      onClick={onClick}
      className={cn(
        "size-9 shrink-0",
        active && "bg-accent text-accent-foreground"
      )}
    >
      {children}
    </Button>
  );
}
// --------------------------------------------------
// TOOLBAR DROPDOWN
// --------------------------------------------------
function ToolbarDropdown({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 shrink-0 gap-1.5 px-2.5"
        >
          {icon}
          <span className="text-xs">{label}</span>
          <ChevronDown className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-48">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
// --------------------------------------------------
// COLOR PICKER
// --------------------------------------------------
function ColorPicker({
  title,
  colors,
  onClick,
}: {
  title: string;
  colors: string[];
  onClick: (color: string) => void;
}) {
  const [customColor, setCustomColor] = useState("#ef4444");
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={title}
          className="size-9 shrink-0"
        >
          {title.includes("Highlight") ? (
            <Palette className="size-4" />
          ) : (
            <PaintRoller className="size-4" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 space-y-4">
        <div>
          <p className="mb-3 text-sm font-medium">{title}</p>
          <div className="grid grid-cols-6 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                title={color}
                onClick={() => onClick(color)}
                className="flex size-8 items-center justify-center rounded-md border transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
              >
                <Check
                  className={cn(
                    "size-4",
                    color === "#ffffff" ||
                      color === "#fef08a" ||
                      color === "#e5e5e5"
                      ? "text-black"
                      : "text-white"
                  )}
                />
              </button>
            ))}
          </div>
        </div>
        <Separator />
        <div className="space-y-2">
          <p className="text-sm font-medium">Custom color</p>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={customColor}
              onChange={(event) => setCustomColor(event.target.value)}
              className="size-10 cursor-pointer rounded-md border bg-transparent p-1"
            />
            <div className="flex-1 rounded-md border px-3 py-2 text-xs font-mono">
              {customColor.toUpperCase()}
            </div>
            <Button
              size="icon"
              type="button"
              onClick={() => onClick(customColor)}
              title="Apply custom color"
            >
              <Check className="size-4" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
// --------------------------------------------------
// NOTEBOOK PAGE
// --------------------------------------------------
export default function Page() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // ------------------------------------------------
  // EDITOR CONFIGURATION
  // ------------------------------------------------
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: "Start writing your thoughts...",
      }),
    ],
    content: "<p></p>",
  });
  // ------------------------------------------------
  // FETCH NOTEBOOK FROM BACKEND
  // ------------------------------------------------
  useEffect(() => {
    if (!editor || !id) return;
    const controller = new AbortController();
    const fetchNotebook = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/get-notebook/${id}`,
          {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          }
        );
        if (!res.ok) {
          throw new Error("Failed to fetch notebook");
        }
        const data = await res.json();
        const notebook = data.data;
        setTitle(notebook.title || "");
        editor.commands.setContent(
          notebook.content || "<p></p>",
          { emitUpdate: false }
        );
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        console.error("Notebook fetching error:", error);
        toast.add({
          title: "Failed to Load Notebook",
          description: "Unable to load your notebook. Please try again.",
          type: "error",
        });
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };
    fetchNotebook();
    return () => controller.abort();
  }, [id, editor]);
  // ------------------------------------------------
  // EDITOR STATE
  // ------------------------------------------------
  const editorState = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;
      return {
        bold: editor.isActive("bold"),
        italic: editor.isActive("italic"),
        underline: editor.isActive("underline"),
        strike: editor.isActive("strike"),
        code: editor.isActive("code"),
        highlight: editor.isActive("highlight"),
        paragraph: editor.isActive("paragraph"),
        h1: editor.isActive("heading", { level: 1 }),
        h2: editor.isActive("heading", { level: 2 }),
        h3: editor.isActive("heading", { level: 3 }),
        bullet: editor.isActive("bulletList"),
        ordered: editor.isActive("orderedList"),
        task: editor.isActive("taskList"),
        quote: editor.isActive("blockquote"),
        codeBlock: editor.isActive("codeBlock"),
        table: editor.isActive("table"),
        link: editor.isActive("link"),
        left: editor.isActive({ textAlign: "left" }),
        center: editor.isActive({ textAlign: "center" }),
        right: editor.isActive({ textAlign: "right" }),
        justify: editor.isActive({ textAlign: "justify" }),
        codeLanguage:
          editor.getAttributes("codeBlock").language || "plaintext",
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      };
    },
  });
  // ------------------------------------------------
  // LINK INSERTION
  // ------------------------------------------------
  const insertLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter URL", previousUrl);
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    try {
      const parsedUrl = new URL(url.trim());
      if (!["http:", "https:", "mailto:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid URL protocol");
      }
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url.trim() })
        .run();
    } catch {
      toast.add({
        title: "Invalid URL",
        description: "Please enter a valid HTTP, HTTPS, or email link.",
        type: "error",
      });
    }
  }, [editor]);
  // ------------------------------------------------
  // IMAGE INSERTION
  // ------------------------------------------------
  const insertImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter image URL");
    if (!url) return;
    try {
      const parsedUrl = new URL(url.trim());
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid image URL");
      }
      editor
        .chain()
        .focus()
        .setImage({ src: parsedUrl.href })
        .run();
    } catch {
      toast.add({
        title: "Invalid Image URL",
        description: "Please enter a valid HTTP or HTTPS image URL.",
        type: "error",
      });
    }
  }, [editor]);
  // ------------------------------------------------
  // TABLE FUNCTIONS
  // ------------------------------------------------
  const insertTable = () => {
    editor?.chain().focus().insertTable({
      rows: 3,
      cols: 3,
      withHeaderRow: true,
    }).run();
  };
  const addRow = () => editor?.chain().focus().addRowAfter().run();
  const addColumn = () => editor?.chain().focus().addColumnAfter().run();
  const deleteRow = () => editor?.chain().focus().deleteRow().run();
  const deleteColumn = () => editor?.chain().focus().deleteColumn().run();
  const deleteTable = () => editor?.chain().focus().deleteTable().run();
  const toggleHeaderRow = () =>
    editor?.chain().focus().toggleHeaderRow().run();
  // ------------------------------------------------
  // CODE BLOCK LANGUAGE
  // ------------------------------------------------
  const changeCodeLanguage = (language: string) => {
    editor
      ?.chain()
      .focus()
      .updateAttributes("codeBlock", {
        language: language === "plaintext" ? null : language,
      })
      .run();
  };
  // ------------------------------------------------
  // TEXT COLORS
  // ------------------------------------------------
  const applyTextColor = (color: string) => {
    editor?.chain().focus().setColor(color).run();
  };
  const removeTextColor = () => {
    editor?.chain().focus().unsetColor().run();
  };
  // ------------------------------------------------
  // HIGHLIGHT COLORS
  // ------------------------------------------------
  const applyHighlight = (color: string) => {
    editor?.chain().focus().toggleHighlight({ color }).run();
  };
  const removeHighlight = () => {
    editor?.chain().focus().unsetHighlight().run();
  };
  // ------------------------------------------------
  // CLEAR FORMATTING
  // ------------------------------------------------
  const clearFormatting = () => {
    editor
      ?.chain()
      .focus()
      .unsetAllMarks()
      .clearNodes()
      .run();
  };
  // ------------------------------------------------
  // SAVE NOTEBOOK TO BACKEND
  // ------------------------------------------------
  const handleSave = async () => {
    if (!editor || isSaving) return;
    if (!title.trim() || editor.isEmpty) {
      toast.add({
        title: "Missing Required Fields",
        description: "Please enter a notebook title and some content.",
        type: "error",
      });
      return;
    }
    setIsSaving(true);
    try {
      const notebookData = {
        title: title.trim(),
        content: editor.getHTML(),
      };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/update-notebook/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(notebookData),
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("Failed to update notebook");
      }
      toast.add({
        title: "Notebook Updated Successfully",
        description: "Your notebook has been successfully updated.",
        type: "success",
      });
    } catch (error) {
      console.error("Notebook update error:", error);
      toast.add({
        title: "Notebook Update Failed",
        description:
          "Something went wrong while updating your notebook. Please try again.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };
  // ------------------------------------------------
  // LOADING STATE
  // ------------------------------------------------
  if (!editor || isLoading) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm">Loading notebook...</span>
        </div>
      </div>
    );
  }
  // ------------------------------------------------
  // RENDER
  // ------------------------------------------------
  return (
    <div className="space-y-5 p-3">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-full max-w-75">
          <InputGroup>
            <InputGroupInput
              placeholder="Enter Notebook Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <InputGroupAddon>
              <FileText className="size-4" />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      {/* EDITOR */}
      <div className="overflow-hidden rounded-xl border bg-background">
        {/* TOOLBAR */}
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 border-b bg-background/95 p-2 backdrop-blur">
          {/* HISTORY */}
          <ToolbarButton
            title="Undo"
            disabled={!editorState?.canUndo}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 />
          </ToolbarButton>
          <ToolbarButton
            title="Redo"
            disabled={!editorState?.canRedo}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 />
          </ToolbarButton>
          <Separator orientation="vertical" className="mx-1 h-6" />
          {/* FORMATTING */}
          <ToolbarDropdown
            label="Format"
            icon={<Bold className="size-4" />}
          >
            <DropdownMenuItem onSelect={() => editor.chain().focus().toggleBold().run()}>
              <Bold className="mr-2 size-4" />
              Bold
              {editorState?.bold && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().toggleItalic().run()}>
              <Italic className="mr-2 size-4" />
              Italic
              {editorState?.italic && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().toggleUnderline().run()}>
              <UnderlineIcon className="mr-2 size-4" />
              Underline
              {editorState?.underline && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().toggleStrike().run()}>
              <Strikethrough className="mr-2 size-4" />
              Strikethrough
              {editorState?.strike && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().toggleCode().run()}>
              <Code className="mr-2 size-4" />
              Inline code
              {editorState?.code && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={clearFormatting}>
              <Eraser className="mr-2 size-4" />
              Clear formatting
            </DropdownMenuItem>
          </ToolbarDropdown>
          {/* HEADINGS */}
          <ToolbarDropdown
            label="Headings"
            icon={<Heading className="size-4" />}
          >
            <DropdownMenuItem onSelect={() => editor.chain().focus().setParagraph().run()}>
              <Pilcrow className="mr-2 size-4" />
              Paragraph
              {editorState?.paragraph && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <DropdownMenuItem
                key={level}
                onSelect={() =>
                  editor.chain().focus().toggleHeading({
                    level: level as 1 | 2 | 3 | 4 | 5 | 6,
                  }).run()
                }
              >
                {level === 1 ? (
                  <Heading1 className="mr-2 size-4" />
                ) : level === 2 ? (
                  <Heading2 className="mr-2 size-4" />
                ) : level === 3 ? (
                  <Heading3 className="mr-2 size-4" />
                ) : (
                  <Heading className="mr-2 size-4" />
                )}
                Heading {level}
                {editor.isActive("heading", { level }) && (
                  <Check className="ml-auto size-4" />
                )}
              </DropdownMenuItem>
            ))}
          </ToolbarDropdown>
          {/* LISTS */}
          <ToolbarDropdown
            label="Lists"
            icon={<List className="size-4" />}
          >
            <DropdownMenuItem onSelect={() => editor.chain().focus().toggleBulletList().run()}>
              <List className="mr-2 size-4" />
              Bullet list
              {editorState?.bullet && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().toggleOrderedList().run()}>
              <ListOrdered className="mr-2 size-4" />
              Numbered list
              {editorState?.ordered && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().toggleTaskList().run()}>
              <ListTodo className="mr-2 size-4" />
              Task list
              {editorState?.task && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                if (editor.isActive("taskItem")) {
                  editor.chain().focus().sinkListItem("taskItem").run();
                } else {
                  editor.chain().focus().sinkListItem("listItem").run();
                }
              }}
            >
              <Plus className="mr-2 size-4" />
              Indent
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                if (editor.isActive("taskItem")) {
                  editor.chain().focus().liftListItem("taskItem").run();
                } else {
                  editor.chain().focus().liftListItem("listItem").run();
                }
              }}
            >
              <Minus className="mr-2 size-4" />
              Outdent
            </DropdownMenuItem>
          </ToolbarDropdown>
          {/* INSERT */}
          <ToolbarDropdown
            label="Insert"
            icon={<Plus className="size-4" />}
          >
            <DropdownMenuItem onSelect={insertLink}>
              <LinkIcon className="mr-2 size-4" />
              Link
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={insertImage}>
              <ImageIcon className="mr-2 size-4" />
              Image
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={insertTable}>
              <TableIcon className="mr-2 size-4" />
              Table (3 × 3)
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().toggleBlockquote().run()}>
              <Quote className="mr-2 size-4" />
              Blockquote
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().toggleCodeBlock().run()}>
              <CodeSquare className="mr-2 size-4" />
              Code block
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().setHorizontalRule().run()}>
              <Minus className="mr-2 size-4" />
              Horizontal divider
            </DropdownMenuItem>
          </ToolbarDropdown>
          {/* TABLE */}
          <ToolbarDropdown
            label="Table"
            icon={<TableIcon className="size-4" />}
          >
            <DropdownMenuItem disabled={!editorState?.table} onSelect={addRow}>
              <Rows2 className="mr-2 size-4" />
              Add row after
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!editorState?.table} onSelect={addColumn}>
              <Columns2 className="mr-2 size-4" />
              Add column after
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={!editorState?.table} onSelect={deleteRow}>
              <Minus className="mr-2 size-4" />
              Delete row
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!editorState?.table} onSelect={deleteColumn}>
              <Minus className="mr-2 size-4" />
              Delete column
            </DropdownMenuItem>
            <DropdownMenuItem disabled={!editorState?.table} onSelect={toggleHeaderRow}>
              <TableIcon className="mr-2 size-4" />
              Toggle header row
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={!editorState?.table}
              onSelect={deleteTable}
              className="text-destructive focus:text-destructive"
            >
              <X className="mr-2 size-4" />
              Delete table
            </DropdownMenuItem>
          </ToolbarDropdown>
          {/* ALIGNMENT */}
          <ToolbarDropdown
            label="Align"
            icon={<AlignLeft className="size-4" />}
          >
            <DropdownMenuItem onSelect={() => editor.chain().focus().setTextAlign("left").run()}>
              <AlignLeft className="mr-2 size-4" />
              Left
              {editorState?.left && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().setTextAlign("center").run()}>
              <AlignCenter className="mr-2 size-4" />
              Center
              {editorState?.center && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().setTextAlign("right").run()}>
              <AlignRight className="mr-2 size-4" />
              Right
              {editorState?.right && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => editor.chain().focus().setTextAlign("justify").run()}>
              <AlignJustify className="mr-2 size-4" />
              Justify
              {editorState?.justify && <Check className="ml-auto size-4" />}
            </DropdownMenuItem>
          </ToolbarDropdown>
          {/* COLORS */}
          <ColorPicker
            title="Text color"
            colors={textColors}
            onClick={applyTextColor}
          />
          <ToolbarButton
            title="Remove text color"
            onClick={removeTextColor}
          >
            <Eraser />
          </ToolbarButton>
          <ColorPicker
            title="Highlight color"
            colors={highlightColors}
            onClick={applyHighlight}
          />
          <ToolbarButton
            title="Remove highlight"
            onClick={removeHighlight}
          >
            <X />
          </ToolbarButton>
          {/* CODE LANGUAGE */}
          {editorState?.codeBlock && (
            <>
              <Separator orientation="vertical" className="mx-1 h-6" />
              <div className="flex items-center gap-2">
                <CodeSquare className="size-4 text-muted-foreground" />
                <Select
                  value={editorState.codeLanguage}
                  onValueChange={changeCodeLanguage}
                >
                  <SelectTrigger className="h-9 w-36">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {languages.map((language) => (
                      <SelectItem
                        key={language.value}
                        value={language.value}
                      >
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
        {/* EDITOR CONTENT */}
        <div className="relative max-h-150 min-h-150 overflow-y-auto p-6 scrollbar-thin md:p-10">
          {/* FLOATING BUBBLE MENU */}
          <BubbleMenu
            editor={editor}
            options={{
              placement: "top",
              offset: 8,
            }}
            shouldShow={({ editor, from, to }) => {
              return (
                editor.isEditable &&
                from !== to &&
                !editor.isActive("codeBlock")
              );
            }}
          >
            <div
              onMouseDown={(event) => event.preventDefault()}
              className="flex max-w-[95vw] flex-wrap items-center gap-1 rounded-xl border bg-background p-1.5 shadow-xl"
            >
              {/* TEXT FORMATTING */}
              <ToolbarButton
                title="Bold"
                active={editorState?.bold}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                title="Italic"
                active={editorState?.italic}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                title="Underline"
                active={editorState?.underline}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              >
                <UnderlineIcon className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                title="Strikethrough"
                active={editorState?.strike}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <Strikethrough className="size-4" />
              </ToolbarButton>
              <ToolbarButton
                title="Inline code"
                active={editorState?.code}
                onClick={() => editor.chain().focus().toggleCode().run()}
              >
                <Code className="size-4" />
              </ToolbarButton>
              <Separator orientation="vertical" className="mx-1 h-6" />
              {/* HEADINGS */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    title="Text style"
                  >
                    <Heading className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onSelect={() => editor.chain().focus().setParagraph().run()}>
                    <Pilcrow className="mr-2 size-4" />
                    Paragraph
                  </DropdownMenuItem>
                  {[1, 2, 3, 4, 5, 6].map((level) => (
                    <DropdownMenuItem
                      key={level}
                      onSelect={() =>
                        editor.chain().focus().toggleHeading({
                          level: level as 1 | 2 | 3 | 4 | 5 | 6,
                        }).run()
                      }
                    >
                      <Heading className="mr-2 size-4" />
                      Heading {level}
                      {editor.isActive("heading", { level }) && (
                        <Check className="ml-auto size-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {/* HIGHLIGHT */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    type="button"
                    size="icon"
                    variant={editorState?.highlight ? "secondary" : "ghost"}
                    title="Highlight color"
                  >
                    <Highlighter className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {[
                    { name: "Yellow", color: "#fef08a" },
                    { name: "Green", color: "#bbf7d0" },
                    { name: "Blue", color: "#bfdbfe" },
                    { name: "Red", color: "#fecaca" },
                  ].map((item) => (
                    <DropdownMenuItem
                      key={item.color}
                      onSelect={() =>
                        editor.chain().focus().toggleHighlight({
                          color: item.color,
                        }).run()
                      }
                    >
                      <span
                        className="mr-2 size-4 rounded"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={removeHighlight}>
                    <Eraser className="mr-2 size-4" />
                    Remove highlight
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* TEXT COLOR */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    title="Text color"
                  >
                    <Palette className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <div className="grid grid-cols-4 gap-2 p-2">
                    {textColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        title={color}
                        onClick={() => applyTextColor(color)}
                        className="size-7 rounded-md border transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={removeTextColor}>
                    <Eraser className="mr-2 size-4" />
                    Remove text color
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Separator orientation="vertical" className="mx-1 h-6" />
              {/* ALIGNMENT */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    title="Text alignment"
                  >
                    <AlignLeft className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onSelect={() => editor.chain().focus().setTextAlign("left").run()}>
                    <AlignLeft className="mr-2 size-4" />
                    Left
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => editor.chain().focus().setTextAlign("center").run()}>
                    <AlignCenter className="mr-2 size-4" />
                    Center
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => editor.chain().focus().setTextAlign("right").run()}>
                    <AlignRight className="mr-2 size-4" />
                    Right
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => editor.chain().focus().setTextAlign("justify").run()}>
                    <AlignJustify className="mr-2 size-4" />
                    Justify
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* LINK */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    type="button"
                    size="icon"
                    variant={editorState?.link ? "secondary" : "ghost"}
                    title="Link options"
                  >
                    <LinkIcon className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onSelect={insertLink}>
                    <LinkIcon className="mr-2 size-4" />
                    Add / Edit link
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={!editorState?.link}
                    onSelect={() =>
                      editor.chain().focus().extendMarkRange("link").unsetLink().run()
                    }
                  >
                    <X className="mr-2 size-4" />
                    Remove link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* CLEAR FORMATTING */}
              <Separator orientation="vertical" className="mx-1 h-6" />
              <ToolbarButton
                title="Clear formatting"
                onClick={clearFormatting}
              >
                <Eraser className="size-4" />
              </ToolbarButton>
            </div>
          </BubbleMenu>
          <EditorContent
            editor={editor}
            className="notebook-editor"
          />
        </div>
      </div>
      {/* FOOTER */}
      <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Info size={18} />
        Do you want to learn about Markdown syntax?
        <a
          href="https://www.markdownguide.org/cheat-sheet/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 hover:underline"
        >
          Click here
        </a>
      </p>
    </div>
  );
}