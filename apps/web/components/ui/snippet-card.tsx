"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CodeEditor from "@/components/ui/editor";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SnippetMenu, Snippets } from "@/types/snippet";
import { Copy, Folder, FolderOpen, MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  FaDiscord,
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SnippetCard({
  item,
  snippetMenu,
  setSnippets,
}: {
  item: Snippets;
  snippetMenu: SnippetMenu;
  setSnippets: React.Dispatch<React.SetStateAction<Snippets[] | []>>;
}) {
  const router = useRouter();
  const [snippetId, setSnippetId] = useState<string | null>(null);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();
  const [folderList, setFolderList] = useState<
    { name: string; description: string; color: string; _id: string }[]
  >([]);
  const [openMoveFolderDialog, setOpenMoveFolderDialog] = useState(false);
  const getSnippetUrl = useCallback((id: string) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/snippet/${id}`;
  }, []);

  const duplicateSnippet = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/duplicate-snippet/${id}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Duplicate failed");
      }
      toast.add({
        title: "Snippet duplicated successfully",
        description: "Your snippet has been duplicated.",
        type: "success",
      });
      await refreshSnippets();
    } catch (error) {
      console.error(error);
      toast.add({
        title: "Failed to duplicate snippet",
        description: "Please try again.",
        type: "error",
      });
    }
  };
  const refreshSnippets = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/get-snippets`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch snippets");
      }
      const data = await response.json();
      setSnippets(data.data);
    } catch (error) {
      console.error("Snippet fetch error:", error);
    }
  }, []);

  const deleteSnippet = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/delete-snippet/${id}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
      toast.add({
        title: "Snippet deleted successfully",
        description: "Your snippet has been deleted.",
        type: "success",
      });
      await refreshSnippets();
    } catch (error) {
      console.error(error);
      toast.add({
        title: "Failed to delete snippet",
        description: "Please try again.",
        type: "error",
      });
    }
  };

  const fetchFolder = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-folders`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      toast.add({
        title: "Error Fething Folders, Try Again.",
        type: "error",
      });
      throw new Error("Error Fetching Folders");
    }
    const data = await res.json();
    setFolderList(data.data ?? []);
  };
  const moveFolder = async () => {
    console.log("Snippet Id: ", snippetId, "Selected Folder", selectedFolderId);
    if (!snippetId || !selectedFolderId) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/move-snippet/${snippetId}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folderId: selectedFolderId,
      }),
    });
    if (!res.ok) {
      setOpenMoveFolderDialog(false);
      toast.add({
        title: "Error Moving Snippet",
        type: "error",
      });
    } else {
      setOpenMoveFolderDialog(false);
      toast.add({
        title: "Snippet Moved",
        description: "Your Snippet Moved Successfully",
        type: "success",
      });
    }
  };
  const handleSnippetAction = async (action: string, snippet: Snippets) => {
    switch (action) {
      case "edit":
        router.push(`/card/edit/${snippet._id}`);
        break;
      case "share":
        setSnippetId(snippet._id);
        setOpenShareDialog(true);
        break;
      case "duplicate":
        await duplicateSnippet(snippet._id);
        break;
      case "copy-link":
        try {
          await navigator.clipboard.writeText(getSnippetUrl(snippet._id));
          toast.add({
            title: "Link copied successfully",
            description: "The link has been copied.",
            type: "success",
          });
        } catch {
          toast.add({
            title: "Copy failed",
            description: "Unable to copy link.",
            type: "error",
          });
        }
        break;
      case "move":
        setSnippetId(snippet._id);
        setOpenMoveFolderDialog(true);
        break;
      case "copy-content":
        try {
          await navigator.clipboard.writeText(snippet.code);
          toast.add({
            title: "Code copied successfully",
            description: "The code has been copied.",
            type: "success",
          });
        } catch {
          toast.add({
            title: "Copy failed",
            description: "Unable to copy code.",
            type: "error",
          });
        }
        break;
      case "delete":
        await deleteSnippet(snippet._id);
        break;
      case "report":
        router.push(`/card/edit/${snippet._id}`);
        break;
      case "cancel":
      default:
        break;
    }
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFolder();
  }, []);

  return (
    <>
      <ContextMenu key={item._id}>
        <ContextMenuTrigger>
          <Card className="mb-3 break-inside-avoid">
            <CardHeader className="flex justify-between items-center">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar>
                  <AvatarImage src={item.author?.image} />
                  <AvatarFallback>{item.author?.name?.split(" ")[0]?.[0] ?? "U"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <CardTitle className="capitalize truncate">{item.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Author: {item.author?.name} | Language: {item.language}
                  </CardDescription>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant={"ghost"}>
                      <MoreVertical size={20} />
                    </Button>
                  }
                />
                <DropdownMenuContent className="w-52">
                  {snippetMenu.map((group) => (
                    <DropdownMenuGroup key={group.label}>
                      <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                      {group.items.map((menu) => {
                        const Icon = menu.icon;
                        return (
                          <DropdownMenuItem
                            key={menu.value}
                            onClick={() => handleSnippetAction(menu.value, item)}
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            {menu.label}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuGroup>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <CodeEditor
                value={item.code}
                language={item.language}
                onChange={() => {}}
                readOnly
                className="max-h-100 overflow-hidden"
              />
              <p className="line-clamp-2 mt-2">{item.description}</p>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-3">
              <div className="flex flex-wrap gap-2">
                {item.tags?.map((tag) => (
                  <Badge key={tag} variant="link">
                    #{tag}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Created on: {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </CardFooter>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52">
          {snippetMenu.map((group) => (
            <ContextMenuGroup key={group.label}>
              <ContextMenuLabel>{group.label}</ContextMenuLabel>
              {group.items.map((menu) => {
                const Icon = menu.icon;
                return (
                  <ContextMenuItem
                    key={menu.value}
                    variant={menu.value === "delete" ? "destructive" : "default"}
                    onClick={() => handleSnippetAction(menu.value, item)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {menu.label}
                  </ContextMenuItem>
                );
              })}
            </ContextMenuGroup>
          ))}
        </ContextMenuContent>
      </ContextMenu>
      <Dialog open={openShareDialog} onOpenChange={setOpenShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Snippet</DialogTitle>
            <DialogDescription>
              Anyone who has this link will be able to view this.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="snippet-link" className="sr-only">
                Link
              </Label>
              <Input id="snippet-link" value={snippetId ? getSnippetUrl(snippetId) : ""} readOnly />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                if (!snippetId) return;
                try {
                  await navigator.clipboard.writeText(getSnippetUrl(snippetId));
                  toast.add({
                    title: "Link copied",
                    description: "Snippet link copied successfully.",
                    type: "success",
                  });
                } catch {
                  toast.add({
                    title: "Copy failed",
                    description: "Unable to copy snippet link.",
                    type: "error",
                  });
                }
              }}
            >
              <Copy />
            </Button>
          </div>
          <div className="flex flex-wrap items-center">
            {[FaInstagram, FaTwitter, FaLinkedin, FaGithub, FaDiscord, FaFacebook].map(
              (Icon, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={async () => {
                        if (!snippetId) return;
                        await navigator.clipboard.writeText(getSnippetUrl(snippetId));
                        toast.add({
                          title: "Link copied",
                          description: "You can now share your snippet.",
                          type: "success",
                        });
                      }}
                    >
                      <Icon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{Icon.name.replace("Fa", "")}</p>
                  </TooltipContent>
                </Tooltip>
              ),
            )}
            <Button
              variant="outline"
              onClick={async () => {
                if (!snippetId) return;
                try {
                  if (navigator.share) {
                    await navigator.share({
                      title: "Share Snippet",
                      text: "Share snippet with your friends",
                      url: getSnippetUrl(snippetId),
                    });
                  } else {
                    await navigator.clipboard.writeText(getSnippetUrl(snippetId));
                  }
                } catch (error) {
                  if (error instanceof Error && error.name === "AbortError") {
                    return;
                  }
                  console.error(error);
                }
              }}
            >
              Other
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={openMoveFolderDialog} onOpenChange={setOpenMoveFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-lg font-bold">
            <DialogTitle>Move Snippet</DialogTitle>
            <DialogDescription>Move snippet to another folder.</DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel>
              <FolderOpen size={18} />
              Select Folder
            </FieldLabel>
            <Select
              value={selectedFolderId}
              onValueChange={(e) => setSelectedFolderId(e as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a folder">
                  {folderList.find((item) => item._id === selectedFolderId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {folderList.map((item, index) => {
                  return (
                    <SelectItem key={index} value={item._id}>
                      <Folder size={18} color={item.color} />
                      {item.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </Field>
          <Button onClick={() => moveFolder()}>Move Snippet</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
