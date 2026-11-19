"use client";
import { Button } from "@/components/ui/button";
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
import { Earth, Folder, Lock, Pencil, Tags } from "lucide-react";
import { useEffect, useState } from "react";
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

export const languages = [
  { label: "JavaScript", value: "javascript", icon: siJavascript },
  { label: "TypeScript", value: "typescript", icon: siTypescript },
  { label: "Python", value: "python", icon: siPython },
  { label: "HTML", value: "html", icon: siHtml5 },
  { label: "CSS", value: "css", icon: siCss },
  { label: "JSON", value: "json", icon: siJson },
  { label: "React JSX", value: "javascript", icon: siReact },
  { label: "Node.js", value: "javascript", icon: siNodedotjs },
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
export default function CreateSnippet() {
  const [code, setCode] = useState('console.log("Hello Kodhra");');
  const [language, setLanguage] = useState("javascript");
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [folder, setFolder] = useState("");
  const [title, setTitle] = useState("");
  const [folderList, setFolderList] = useState([]);
  const [visibility, setVisibility] = useState("public");
  const saveSnippet = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-snippet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          language,
          code,
          tags,
          description,
          folder,
          visibility,
        }),
        credentials: "include",
      });
      if (!response) {
        toast.add({
          title: "Error Creating Snippet",
          actionProps: {
            children: "Try again",
            onClick() {
              window.location.reload();
            },
          },
        });
      }
      toast.add({
        title: "Snippet Created",
        type: "success",
        
      });
      setTitle("");
      setDescription("")
      setCode("");
      setTags([]);
      setFolder("");
      setVisibility("public");
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message ?? "Error creating snippet!");
      }
      toast.add({
        title: "Error Creating Snippet",
        actionProps: {
          children: "Try again",
          onClick() {
            window.location.reload();
          },
        },
      });
    }
  };

  useEffect(() => {
    const getFolders = async () => {
      const response = await fetch("${process.env.NEXT_PUBLIC_API_URL}/api/get-folders", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      const folders = data.data.map((folder: { name: string; _id: string; color: string }) => {
        return {
          label: folder.name,
          value: folder._id,
          color: folder.color,
        };
      });
      setFolderList(folders);
    };
    getFolders();
  }, []);
  return (
    <div className="w-full h-full py-3 px-3">
      <header className="pb-2">
        <h1 className="font-bold">Create New Snippet</h1>
        <p className="text-xs">Create a new snippet and share with the world</p>
      </header>
      <Separator className={"mb-2"} />
      <div className="mb-3 flex items-center gap-2">
        <FieldSet className="w-full">
          <FieldGroup className="grid grid-cols-1 sm:grid-cols-3">
            <Field className="flex-1 col-span-2">
              <FieldLabel>Enter Title</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  placeholder="e.g. print hello world"
                  autoComplete={"off"}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <InputGroupAddon>
                  <Pencil />
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field className="flex-1">
              <FieldLabel>Select Language</FieldLabel>
              <Select
                items={languages}
                onValueChange={(value) => setLanguage(value as string)}
                value={language}
              >
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {languages.map((item, index) => (
                      <SelectItem key={item.value + index} value={item.value}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
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
        </FieldSet>
      </div>
      <CodeEditor value={code} language={language || "javascript"} onChange={setCode} />
      <Separator className={"my-2"} />
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel>Enter Description</FieldLabel>
            <Textarea onChange={(e) => setDescription(e.target.value)} />
            <FieldDescription className="text-xs">Markdown code is supported</FieldDescription>
          </Field>
          <div className="grid sm:grid-cols-3 grid-cols-1 gap-2">
            <Field>
              <FieldLabel>Enter Tags</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  placeholder="e.g. react, javascript, typescript"
                  autoComplete={"off"}
                  onChange={(e) => setTags(e.target.value.split(","))}
                />
                <InputGroupAddon>
                  <Tags />
                </InputGroupAddon>
              </InputGroup>
            </Field>
            <Field>
              <FieldLabel>Enter Folder Name</FieldLabel>
              <Select items={folderList} onValueChange={(value) => setFolder(value as string)}>
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="Select Folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {folderList.map(
                      (item: { label: string; value: string; color: string }, index) => (
                        <SelectItem key={item.value + index} value={item.value}>
                          <Folder size={18} color={item.color} />
                          {item.label}
                        </SelectItem>
                      ),
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Visibilty</FieldLabel>
              <Select onValueChange={(value) => setVisibility(value as string)} value={visibility}>
                <SelectTrigger className="w-45">
                  <SelectValue placeholder="Select Visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value={"public"}>
                      <Earth />
                      Public
                    </SelectItem>
                    <SelectItem value={"private"}>
                      <Lock />
                      Private
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FieldGroup>
        <div className="grid grid-cols-2 gap-3">
          <Button variant={"secondary"}>Save as Draft</Button>
          <Button onClick={saveSnippet}>Save</Button>
        </div>
        <div className="mb-5" />
      </FieldSet>
    </div>
  );
}
