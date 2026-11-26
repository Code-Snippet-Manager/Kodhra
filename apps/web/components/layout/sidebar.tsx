"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { clsx } from "cn";
import {
  BookOpen,
  BookOpenCheck,
  CloudDownload,
  Code2,
  FileCode2,
  FileText,
  Folder,
  FolderPlus,
  LayoutDashboard,
  Pin,
  Recycle,
  Search,
  Settings,
  SquareCode,
  Star,
  Tags,
  Telescope,
  UserLock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
export const SIDEBAR_ITEMS = [
  {
    category: "Main Pages",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, shortcut: "alt+d" },
      { label: "Snippets", href: "/card", icon: Code2, shortcut: "alt+s" },
      { label: "Folders", href: "/folder", icon: Folder, shortcut: "alt+f" },
      { label: "Notebooks", href: "/notebook", icon: BookOpen, shortcut: "alt+n" },
      { label: "Draft", href: "/draft", icon: FileText, shortcut: "alt+r" },
      { label: "Recycle Bin", href: "/recyclebin", icon: Recycle, shortcut: "alt+b" },
    ],
  },
  {
    category: "Filters & Views",
    items: [
      // { label: "Tags", href: "/tags", icon: Tags, shortcut: "alt+t" },
      // { label: "Language", href: "/language", icon: FileCode2, shortcut: "alt+l" },
      { label: "Pinned", href: "/pin", icon: Pin, shortcut: "alt+p" },
      { label: "Favorites", href: "/fav", icon: Star, shortcut: "alt+v" },
    ],
  },
  {
    category: "Creation Shortcuts",
    items: [
      { label: "New Snippet", href: "/card/create", icon: SquareCode, shortcut: "alt+n" },
      { label: "New Folder", action: "create-folder", icon: FolderPlus, shortcut: "shift+f" },
      { label: "Create Notebook", href: "/notebook/create", icon: BookOpenCheck, shortcut: "alt+n" },
    ],
  },
  {
    category: "Search & Explore",
    items: [
      { label: "Universal Search", href: "/search", icon: Search, shortcut: "alt+u" },
      { label: "Explore Snippets", href: "/explore", icon: Telescope, shortcut: "alt+e" },
    ],
  },
  {
    category: "Settings & Tools",
    items: [
      { label: "Import / Export", href: "/import-export", icon: CloudDownload, shortcut: "alt+i" },
      { label: "Settings", href: "/settings", icon: Settings, shortcut: "alt+g" },
      { label: "Account", href: "/profile", icon: UserLock, shortcut: "alt+o" },
    ],
  },
];
const colors = [
  {
    label: "Red",
    value: "#EF4444",
  },
  {
    label: "Blue",
    value: "#3B82F6",
  },
  {
    label: "Green",
    value: "#22C55E",
  },
  {
    label: "Yellow",
    value: "#EAB308",
  },
  {
    label: "Purple",
    value: "#A855F7",
  },
];
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState<string | null>();
  const path = usePathname();
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");
  const createFolder = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName, description: folderDescription, color }),
        credentials: "include",
      });
      if(!res.ok){

        toast.add({
          title: "Error",
          description: "Failed to create folder",
          type: "error",
        })
      }else{
        toast.add({
          title: "Success",
          description: "Folder created successfully",
          type: "success",
        })
      }
      
    } catch (error) {
      console.log(error);
      toast.add({
        title: "Error",
        description: "Failed to create folder",
        type: "error",
      })
    }finally{
      setIsOpen(false);
    }
  };
  return (
    <div className="w-62.5 border border-r  overflow-y-auto h-screen scrollbar-none hover:scrollbar-thin scrollbar-thumb-gray-300">
      <div className="flex items-center gap-2  top-0 sticky bg-transparent backdrop-blur-2xl px-2 z-1 h-13.75">
        <Image
          src={"/icons/kodhra.webp"}
          width={30}
          height={30}
          alt="Logo of kodhra"
          className="w-7.5 h-7.5 dark:invert-100"
        />
        <div className="leading-none">
          <span className="text-sm font-bold block">Kodhra</span>
          <span className="text-xs">Code Snippet Manager</span>
        </div>
      </div>
      <nav className="px-2">
        {SIDEBAR_ITEMS.map((item) => {
          return (
            <div key={item.category}>
              <span className="text-zinc-500 text-xs mt-2">{item.category}</span>
              <ul className="gap-1 flex flex-col">
                {item.items.map((item) => {
                  return (
                    <li key={item.label} className="relative flex items-center group">
                      {item.label === "New Folder" ? (
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                          <DialogTrigger
                            render={
                              <Button
                                variant="ghost"
                                className="text-sm flex gap-2 items-center justify-start px-2 py-1.5 hover:bg-gray-50 rounded flex-1 transition"
                              >
                                <item.icon size={18} />
                                <span>New Folder</span>
                              </Button>
                            }
                          />
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create a new folder</DialogTitle>
                            </DialogHeader>
                            <FieldSet>
                              <FieldGroup className="gap-2">
                                <FieldLabel htmlFor="name" className="gap-x-0">
                                  Folder Name<span className="text-red-700">*</span>
                                </FieldLabel>
                                <InputGroup>
                                  <InputGroupInput
                                    placeholder="E.g. New Folder"
                                    name="name"
                                    id="name"
                                    autoComplete="off"
                                    onChange={(e) => setFolderName(e.target.value)}
                                  />
                                  <InputGroupAddon>
                                    <FolderPlus size={18} />
                                  </InputGroupAddon>
                                </InputGroup>
                              </FieldGroup>
                              <FieldGroup className="gap-2">
                                <FieldLabel htmlFor="description" className="gap-x-1">
                                  Description{" "}
                                  <span className="text-xs font-normal text-gray-500">
                                    (optional)
                                  </span>
                                </FieldLabel>
                                <Textarea
                                  id="description"
                                  placeholder="Enter Description"
                                  onChange={(e) => setFolderDescription(e.target.value)}
                                />
                              </FieldGroup>
                              <label htmlFor="color">Select Color</label>
                              <div className="flex gap-2 items-center justify-between">
                                {colors.map((item) => {
                                  return (
                                    <div
                                      key={item.label}
                                      onClick={() => setColor(item.value)}
                                      className="flex items-center gap-2 focus:outline-2 rounded-full outline-card-foreground"
                                      tabIndex={0}
                                    >
                                      <div
                                        className="w-10 h-10 rounded-full"
                                        style={{ backgroundColor: item.value }}
                                      ></div>
                                    </div>
                                  );
                                })}
                                <Input
                                  type="color"
                                  className="w-10 h-10 rounded-full"
                                  onChange={(e) => setColor(e.target.value as string)}
                                />
                              </div>
                              <Button onClick={createFolder}>Create</Button>
                            </FieldSet>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Link
                          key={item.label}
                          href={item.href || ""}
                          className={clsx(
                            "text-sm flex gap-2 items-center px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded flex-1 transition",
                            {
                              "bg-gray-50 dark:bg-zinc-900": path === item.href,
                            },
                          )}
                        >
                          <item.icon size={18} />
                          {item.label}
                        </Link>
                      )}
                      <span className="absolute right-2 text-xs text-zinc-400 font-light opacity-0 group-hover:opacity-100">
                        {item.shortcut}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>
      <div className="my-4" />
    </div>
  );
}
