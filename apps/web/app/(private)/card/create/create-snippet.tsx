"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import CodeEditor from "@/components/ui/editor";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  Check,
  Code2,
  Earth,
  Folder,
  Hash,
  Lock,
  Pencil,
  Save,
  Tags,
  X,
} from "lucide-react";
import {
  siC,
  siCplusplus,
  siCss,
  siDart,
  siGo,
  siHtml5,
  siJavascript,
  siJson,
  siKotlin,
  siMarkdown,
  siMysql,
  siNodedotjs,
  siPhp,
  siPython,
  siReact,
  siRuby,
  siRust,
  siSwift,
  siTypescript,
} from "simple-icons/icons";
type FolderType = {
  label: string;
  value: string;
  color: string;
};
export const languages = [
  { label: "JavaScript", value: "javascript", icon: siJavascript },
  { label: "TypeScript", value: "typescript", icon: siTypescript },
  { label: "Python", value: "python", icon: siPython },
  { label: "HTML", value: "html", icon: siHtml5 },
  { label: "CSS", value: "css", icon: siCss },
  { label: "JSON", value: "json", icon: siJson },
  { label: "React JSX", value: "javascriptreact", icon: siReact },
  { label: "Node.js", value: "nodejs", icon: siNodedotjs },
  { label: "PHP", value: "php", icon: siPhp },
  { label: "Go", value: "go", icon: siGo },
  { label: "Rust", value: "rust", icon: siRust },
  { label: "C", value: "c", icon: siC },
  { label: "C++", value: "cpp", icon: siCplusplus },
  { label: "C#", value: "csharp", icon: siC },
  { label: "Ruby", value: "ruby", icon: siRuby },
  { label: "Kotlin", value: "kotlin", icon: siKotlin },
  { label: "Swift", value: "swift", icon: siSwift },
  { label: "Dart", value: "dart", icon: siDart },
  { label: "SQL", value: "sql", icon: siMysql },
  { label: "Markdown", value: "markdown", icon: siMarkdown },
];
const getEditorLanguage = (value: string) => {
  if (value === "nodejs") return "javascript";
  return value || "javascript";
};
export default function CreateSnippet() {
  const [code, setCode] = useState('console.log("Hello Kodhra");');
  const [language, setLanguage] = useState("javascript");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [description, setDescription] = useState("");
  const [folder, setFolder] = useState<string | undefined>();
  const [title, setTitle] = useState("");
  const [folderList, setFolderList] = useState<FolderType[]>([]);
  const [visibility, setVisibility] = useState("public");
  const [isCreating, setIsCreating] = useState(false);
  // Fetch folders
  useEffect(() => {
    const getFolders = async () => {
      try {
         const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/get-folders`,
          { credentials: "include" }
        );
        if (!response.ok) {
          throw new Error("Failed to fetch folders");
        }
        const data = await response.json();
        const folders: FolderType[] = (data.data ?? []).map(
          (item: {
            name: string;
            _id: string;
            color: string;
          }) => ({
            label: item.name,
            value: item._id,
            color: item.color,
          })
        );
        setFolderList(folders);
      } catch (error) {
        console.error(error);
        toast.add({
          title: "Unable to load folders",
          type: "error",
        });
      }
    };
    getFolders();
  }, []);
  // Add tags
  const addTag = () => {
    const newTags = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    setTags((previousTags) => [
      ...new Set([...previousTags, ...newTags]),
    ]);
    setTagInput("");
  };
  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags((previousTags) =>
      previousTags.filter((tag) => tag !== tagToRemove)
    );
  };
  // Reset form
  const clearForm = () => {
    setTitle("");
    setDescription("");
    setCode("");
    setTags([]);
    setTagInput("");
    setFolder(undefined);
    setVisibility("public");
    setLanguage("javascript");
  };
  // Create snippet
  const saveSnippet = async () => {
    if (!title.trim()) {
      toast.add({
        title: "Title is required",
        description: "Please enter a title for your snippet.",
        type: "error",
      });
      return;
    }
    if (!code.trim()) {
      toast.add({
        title: "Code is required",
        description: "Please enter some code before saving.",
        type: "error",
      });
      return;
    }
    try {
      setIsCreating(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/create-snippet`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title,
            language,
            code,
            tags,
            description,
            folder: folder ?? null,
            isPublic: visibility === "public",
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ?? "Failed to create snippet"
        );
      }
      toast.add({
        title: "Snippet created",
        description: "Your snippet has been created successfully.",
        type: "success",
      });
      clearForm();
    } catch (error) {
      console.error(error);
      toast.add({
        title: "Error creating snippet",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };
  return (
    <div className="min-h-full w-full bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
       
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_290px]">
          {/* Main Content */}
          <div className="min-w-0 space-y-6">
            {/* Snippet Information */}
            <section className="space-y-5 rounded-xl border bg-card p-4 sm:p-6">
              <div className="space-y-1">
                <h2 className="text-base font-semibold">
                  Snippet Information
                </h2>
                <p className="text-sm text-muted-foreground">
                  Give your snippet a meaningful name and description.
                </p>
              </div>
              <FieldSet>
                <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_190px]">
                  <Field>
                    <FieldLabel>Snippet Title *</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        placeholder="e.g. Custom React Hook"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoComplete="off"
                      />
                      <InputGroupAddon>
                        <Pencil size={16} />
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      Choose a short and descriptive title.
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel>Programming Language</FieldLabel>
                    <Select
                      value={language}
                      onValueChange={(value) =>
                        setLanguage(value as string)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {languages.map((item) => (
                            <SelectItem
                              key={item.value}
                              value={item.value}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                width="17"
                                height="17"
                                fill="currentColor"
                              >
                                <path d={item.icon.path} />
                              </svg>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
                <Field className="mt-4">
                  <FieldLabel>Description</FieldLabel>
                  <Textarea
                    placeholder="Describe what this snippet does..."
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    className="min-h-25 resize-y"
                  />
                  <FieldDescription>
                    Markdown formatting is supported.
                  </FieldDescription>
                </Field>
              </FieldSet>
            </section>
            {/* Code Editor */}
            <section className="overflow-hidden rounded-xl border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-2">
                  <Code2 size={18} className="text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold">
                      Code Editor
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Write your code here.
                    </p>
                  </div>
                </div>
                <div className="rounded-md border bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                  {language.toUpperCase()}
                </div>
              </div>
              <Separator />
              <div className="min-h-100">
                <CodeEditor
                  value={code}
                  language={getEditorLanguage(language)}
                  onChange={setCode}
                  dynamicHeight={false}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-2 px-4 py-2.5 text-xs text-muted-foreground">
                <span>
                  Code changes are reflected in the editor.
                </span>
                <span>{code.length} characters</span>
              </div>
            </section>
          </div>
          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Organization */}
            <section className="space-y-4 rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2">
                <Folder size={18} className="text-primary" />
                <h2 className="text-sm font-semibold">
                  Organization
                </h2>
              </div>
              <Separator />
              <Field>
                <FieldLabel>Save to Folder</FieldLabel>
                <Select
                  value={folder ?? ""}
                  onValueChange={(value) =>
                    setFolder(value as string)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {folderList.map((item) => (
                        <SelectItem
                          key={item.value}
                          value={item.value}
                        >
                          <Folder
                            size={16}
                            color={item.color}
                          />
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Organize your snippets into folders.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Tags</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    placeholder="React, Hooks..."
                    value={tagInput}
                    onChange={(e) =>
                      setTagInput(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <InputGroupAddon>
                    <Tags size={16} />
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>
                  Separate multiple tags with commas or press Enter.
                </FieldDescription>
              </Field>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 rounded-md border bg-muted px-2 py-1 text-xs"
                    >
                      <Hash size={12} />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${tag} tag`}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {tagInput.trim() && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={addTag}
                >
                  Add Tag
                </Button>
              )}
            </section>
            {/* Visibility */}
            <section className="space-y-4 rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2">
                <Earth size={18} className="text-primary" />
                <h2 className="text-sm font-semibold">
                  Visibility
                </h2>
              </div>
              <Separator />
              <Field>
                <FieldLabel>
                  Who can access this snippet?
                </FieldLabel>
                <Select
                  value={visibility}
                  onValueChange={(value) =>
                    setVisibility(value as string)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="public">
                        <Earth size={16} />
                        Public
                      </SelectItem>
                      <SelectItem value="private">
                        <Lock size={16} />
                        Private
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <div className="rounded-lg bg-muted/60 p-3">
                {visibility === "public" ? (
                  <div className="flex items-start gap-2">
                    <Earth
                      size={16}
                      className="mt-0.5 text-green-600"
                    />
                    <p className="text-xs text-muted-foreground">
                      Anyone can discover and view this snippet.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Lock
                      size={16}
                      className="mt-0.5 text-amber-600"
                    />
                    <p className="text-xs text-muted-foreground">
                      Only you can access this private snippet.
                    </p>
                  </div>
                )}
              </div>
            </section>
            {/* Quick Actions */}
            <section className="space-y-3 rounded-xl border bg-card p-4">
              <h2 className="text-sm font-semibold">
                Quick Actions
              </h2>
              <Separator />
              <Button
                className="w-full"
                onClick={saveSnippet}
                disabled={isCreating}
              >
                <Check size={16} />
                {isCreating ? "Creating..." : "Create Snippet"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={clearForm}
                disabled={isCreating}
              >
                <X size={16} />
                Clear Form
              </Button>
            </section>
          </aside>
        </div>
        {/* Bottom Actions */}
        <Separator />
        <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            Make sure your snippet is ready before creating it.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={clearForm}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={saveSnippet}
              disabled={isCreating}
            >
              <Save size={16} />
              {isCreating ? "Creating..." : "Create Snippet"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
