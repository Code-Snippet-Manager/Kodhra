"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import DiffView from "@/components/ui/DiffView";
import CodeEditor from "@/components/ui/editor";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
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
  GitCompareArrows,
  Hash,
  Lock,
  Maximize,
  Minimize,
  Pencil,
  RotateCcw,
  Save,
  Tags,
  X,
  History,
  Clock,
  User,
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

type VersionType = {
  changeMessage: string;
  code: string;
  createdAt: Date;
  createdBy: string;
  description: string;
  isDeleted: boolean;
  language: string;
  snippetId: string;
  title: string;
  updatedAt: Date;
  version: number;
  _id: string;
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

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function EditSnippet() {
  const { id } = useParams<{ id: string }>();

  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [folder, setFolder] = useState<undefined | string>();
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("public");

  const [folderList, setFolderList] = useState<FolderType[]>([]);
  const [versionList, setVersionList] = useState<VersionType[]>([]);
  const [cVersion, setCVersion] = useState<VersionType | null>(null);

  const [tagInput, setTagInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  const fullScreenElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getFolders = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-folders`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch folders");
        }

        const data = await response.json();

        const folders: FolderType[] = (data.data ?? []).map(
          (item: { name: string; _id: string; color: string }) => ({
            label: item.name,
            value: item._id,
            color: item.color,
          }),
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

  useEffect(() => {
    if (!id) return;

    const getSnippet = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-snippet/${id}`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch snippet");
        }

        const data = await response.json();
        const snippet = data.data;

        setTitle(snippet.title ?? "");
        setLanguage(snippet.language ?? "javascript");
        setCode(snippet.code ?? "");
        setTags(snippet.tags ?? []);
        setDescription(snippet.description ?? "");

        setFolder(
          typeof snippet.folder === "string" ? snippet.folder : (snippet.folder?._id ?? ""),
        );

        setVisibility(snippet.isPublic ? "public" : "private");
      } catch (error) {
        console.error(error);
        toast.add({
          title: "Unable to load snippet",
          type: "error",
        });
      }
    };

    getSnippet();
  }, [id]);

 const fetchVersions = useCallback(async () => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/get-snippet-versions/${id}`,
      { credentials: "include" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch snippet versions");
    }

    const data = await response.json();
    setVersionList(data.data ?? []);

  } catch (error) {
    console.error(error);

    toast.add({
      title: "Unable to load versions",
      type: "error",
    });
  }
}, [id]);

  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchVersions();
  }, [fetchVersions, id]);

  const addTag = () => {
    const newTags = tagInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setTags((previousTags) => [...new Set([...previousTags, ...newTags])]);

    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setTags((previousTags) => previousTags.filter((tag) => tag !== tagToRemove));
  };

  const handleVersionChange = (value: string) => {
    const selectedVersion = versionList.find((item) => String(item.version) === value);

    if (!selectedVersion) return;

    setCVersion(selectedVersion);
    setShowDiff(true);
  };

  const handleRevert = () => {
    if (!cVersion) return;

    setCode(cVersion.code);
    setLanguage(cVersion.language);
    setShowDiff(false);

    toast.add({
      title: "Version restored",
      description: `Editor restored to version ${cVersion.version}. Save to apply your changes.`,
      type: "success",
    });
  };

  const toggleFullScreen = async () => {
    try {
      if (document.fullscreenElement === fullScreenElement.current) {
        await document.exitFullscreen();
      } else {
        await fullScreenElement.current?.requestFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
      toast.add({
        title: "Fullscreen failed",
        type: "error",
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(document.fullscreenElement === fullScreenElement.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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
        description: "Please enter some code before updating.",
        type: "error",
      });
      return;
    }

    try {
      setIsUpdating(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/update-snippet`, {
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
          id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(errorData?.message ?? "Failed to update snippet");
      }

      toast.add({
        title: "Snippet updated",
        description: "Your snippet has been updated successfully.",
        type: "success",
      });

      await fetchVersions();

      setCVersion(null);
      setShowDiff(false);
    } catch (error) {
      console.error(error);

      toast.add({
        title: "Error updating snippet",
        description:
          error instanceof Error ? error.message : "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setCode("");
    setTags([]);
    setTagInput("");
    setFolder(undefined);
    setVisibility("public");
    setLanguage("javascript");
    setCVersion(null);
    setShowDiff(false);
  };

  return (
    <div className="min-h-full w-full bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_290px]">
          <div className="min-w-0 space-y-6">
            <section className="space-y-5 rounded-xl border bg-card p-4 sm:p-6">
              <div className="space-y-1">
                <h2 className="text-base font-semibold">Snippet Information</h2>
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
                    <FieldDescription>Choose a short and descriptive title.</FieldDescription>
                  </Field>

                  <Field>
                    <FieldLabel>Programming Language</FieldLabel>
                    <Select
                      value={language}
                      onValueChange={(value) => setLanguage(value as string)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {languages.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor">
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
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-25 resize-y"
                  />
                  <FieldDescription>Markdown formatting is supported.</FieldDescription>
                </Field>
              </FieldSet>
            </section>

            <section
              className={`overflow-hidden rounded-xl border bg-card ${
                isFullScreen ? "flex h-screen flex-col rounded-none" : ""
              }`}
              ref={fullScreenElement}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-2">
                  <Code2 size={18} className="text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold">Code Editor</h2>
                    <p className="text-xs text-muted-foreground">Write and edit your code.</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2">
                    <History size={16} className="text-muted-foreground" />

                    <select
                      value={cVersion ? String(cVersion.version) : ""}
                      onChange={(e) => handleVersionChange(e.target.value)}
                      className="h-9 w-40 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="">Version history</option>
                      {versionList.map((item) => (
                        <option key={item._id} value={String(item.version)}>
                          Version {item.version} · {formatDate(item.createdAt)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button variant="outline" size="sm" disabled={!cVersion} onClick={handleRevert}>
                    <RotateCcw size={15} />
                    Revert
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    disabled={!cVersion}
                    onClick={() => setShowDiff((previous) => !previous)}
                    title={showDiff ? "Show code editor" : "Compare versions"}
                  >
                    <GitCompareArrows size={16} />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFullScreen}
                    title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {isFullScreen ? <Minimize /> : <Maximize />}
                  </Button>
                </div>
              </div>

              {cVersion && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-y bg-muted/30 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background">
                      <History size={17} className="text-primary" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium">Version {cVersion.version} selected</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {cVersion.changeMessage || "No change description"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      {formatDate(cVersion.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={13} />
                      {cVersion.createdBy || "Unknown"}
                    </span>
                  </div>
                </div>
              )}

              <Separator />

              <div className="min-h-100 flex-1">
                {showDiff && cVersion ? (
                  <DiffView
                    original={cVersion.code}
                    modified={code}
                    language={getEditorLanguage(language)}
                    readOnly
                  />
                ) : (
                  <CodeEditor
                    value={code}
                    language={getEditorLanguage(language)}
                    onChange={setCode}
                    dynamicHeight={false}
                  />
                )}
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-2 px-4 py-2.5 text-xs text-muted-foreground">
                <span>
                  {showDiff && cVersion
                    ? `Comparing with version ${cVersion.version}`
                    : "Code changes are reflected in the editor."}
                </span>
                <span>{code.length} characters</span>
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="space-y-4 rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2">
                <Folder size={18} className="text-primary" />
                <h2 className="text-sm font-semibold">Organization</h2>
              </div>

              <Separator />

              <Field>
                <FieldLabel>Save to Folder</FieldLabel>
                <Select value={folder} onValueChange={(value) => setFolder(value as string)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {folderList.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          <Folder size={16} color={item.color} />
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>Organize your snippets into folders.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Tags</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    placeholder="React, Hooks..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
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
                <Button type="button" size="sm" variant="secondary" onClick={addTag}>
                  Add Tag
                </Button>
              )}
            </section>

            <section className="space-y-4 rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2">
                <Earth size={18} className="text-primary" />
                <h2 className="text-sm font-semibold">Visibility</h2>
              </div>

              <Separator />

              <Field>
                <FieldLabel>Who can access this snippet?</FieldLabel>
                <Select
                  value={visibility}
                  onValueChange={(value) => setVisibility(value as string)}
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
                    <Earth size={16} className="mt-0.5 text-green-600" />
                    <p className="text-xs text-muted-foreground">
                      Anyone can discover and view this snippet.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <Lock size={16} className="mt-0.5 text-amber-600" />
                    <p className="text-xs text-muted-foreground">
                      Only you can access this private snippet.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-3 rounded-xl border bg-card p-4">
              <h2 className="text-sm font-semibold">Quick Actions</h2>

              <Separator />

              <Button className="w-full" onClick={saveSnippet} disabled={isUpdating}>
                <Check size={16} />
                {isUpdating ? "Updating..." : "Update Snippet"}
              </Button>

              <Button variant="outline" className="w-full" onClick={clearForm}>
                <X size={16} />
                Clear Form
              </Button>
            </section>
          </aside>
        </div>

        <Separator />

        <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            Make sure to save your changes before leaving.
          </p>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>

            <Button onClick={saveSnippet} disabled={isUpdating}>
              <Save size={16} />
              {isUpdating ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
