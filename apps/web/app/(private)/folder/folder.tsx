"use client";
import { Button } from "@/components/ui/button";
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
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  Copy,
  Edit,
  FileCode2,
  Folder,
  FolderInput,
  FolderOpen,
  FolderPlus,
  LayoutGrid,
  Link2,
  List,
  MoreHorizontal,
  PaintBucket,
  Pin,
  RefreshCw,
  Search,
  Share2,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;
type FolderType = {
  _id: string;
  name: string;
  description?: string;
  userId: string;
  cards?: string[];
  parentFolderId: string | null;
  color?: string;
  icon?: string;
  isPinned?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type ViewMode = "grid" | "list";

const folderMenus = [
  {
    label: "Actions",
    items: [
      {
        label: "Rename Folder",
        icon: Edit,
        value: "rename",
      },
      {
        label: "Change Color",
        icon: PaintBucket,
        value: "change-color",
      },
      {
        label: "Move Folder",
        icon: FolderInput,
        value: "move",
      },
      {
        label: "Share Folder",
        icon: Share2,
        value: "share",
      },
      {
        label: "Copy Folder Link",
        icon: Link2,
        value: "copy-link",
      },
    ],
  },
  {
    label: "Danger Zone",
    items: [
      {
        label: "Delete Folder",
        icon: Trash2,
        value: "delete",
        variant: "destructive" as const,
      },
    ],
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.045,
    },
  },
};
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 12,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: "easeOut" as const,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
    },
  },
};
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
type SelectedFolder = {
  _id: string;
  name: string;
  color: string;
};
export default function FolderPage() {
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [openNewFolderDialogBox, setOpenNewFolderDialogBox] = useState(false);
  const [color, setColor] = useState<string | null>();
  const [folderName, setFolderName] = useState("");
  const [folderDescription, setFolderDescription] = useState("");

  // Fetch folders
  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-folders`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Unable to fetch folders");
      }
      const result = await response.json();
      const folderData = Array.isArray(result)
        ? result
        : (result.folders ?? result.data?.folders ?? result.data ?? []);
      if (!Array.isArray(folderData)) {
        throw new Error("Invalid folder response");
      }
      setFolders(folderData.filter((folder: FolderType) => !folder.isDeleted));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFolders();
  }, [fetchFolders]);
  const createFolder = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/create-folder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: folderName, description: folderDescription, color }),
        credentials: "include",
      });
      if (!res.ok) {
        toast.add({
          title: "Error",
          description: "Failed to create folder",
          type: "error",
        });
      } else {
        fetchFolders();
        toast.add({
          title: "Success",
          description: "Folder created successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.log(error);
      toast.add({
        title: "Error",
        description: "Failed to create folder",
        type: "error",
      });
    } finally {
      setOpenNewFolderDialogBox(false);
    }
  };
  // Search folders
  const filteredFolders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return folders.filter(
      (folder) =>
        folder.name.toLowerCase().includes(query) ||
        folder.description?.toLowerCase().includes(query),
    );
  }, [folders, search]);
  // Separate pinned and regular folders
  const pinnedFolders = filteredFolders.filter((folder) => folder.isPinned);
  const regularFolders = filteredFolders.filter((folder) => !folder.isPinned);
  return (
    <motion.main layout className="mx-auto w-full max-w-7xl space-y-7 p-4 md:p-6">
      {/* Page Header */}
      <motion.div
        layout
        className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Folders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your snippet collections.</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={fetchFolders}
            disabled={loading}
            title="Refresh folders"
            className="inline-flex size-9 items-center justify-center rounded-md border text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </motion.button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setOpenNewFolderDialogBox(true)}
            className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <FolderPlus className="size-4" />
            New folder
          </motion.button>
        </div>
      </motion.div>
      {/* Toolbar */}
      <motion.div
        layout
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search folders..."
            className="h-9 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary"
          />
        </div>
        {/* View Toggle and Folder Count */}
        <div className="flex items-center justify-between gap-3">
          <motion.p
            key={filteredFolders.length}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-muted-foreground"
          >
            {filteredFolders.length} {filteredFolders.length === 1 ? "folder" : "folders"}
          </motion.p>
          <div className="flex items-center rounded-md border p-1">
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setViewMode("grid")}
              title="Grid view"
              aria-label="Grid view"
              aria-pressed={viewMode === "grid"}
              className={`flex size-7 items-center justify-center rounded-sm transition ${
                viewMode === "grid"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-4" />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setViewMode("list")}
              title="List view"
              aria-label="List view"
              aria-pressed={viewMode === "list"}
              className={`flex size-7 items-center justify-center rounded-sm transition ${
                viewMode === "list"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
      {/* Loading State */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "space-y-3"
            }
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`animate-pulse rounded-md bg-muted/50 ${
                  viewMode === "grid" ? "h-36" : "h-15.5"
                }`}
              />
            ))}
          </motion.div>
        )}
        {/* Error State */}
        {!loading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-md border p-6 text-center"
          >
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={fetchFolders}
              className="mt-3 text-sm font-medium underline underline-offset-4"
            >
              Try again
            </button>
          </motion.div>
        )}
        {/* Folder Content */}
        {!loading && !error && (
          <motion.div
            key="folder-content"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Pinned Folders */}
            <AnimatePresence>
              {pinnedFolders.length > 0 && (
                <FolderSection
                  key="pinned"
                  title="Pinned"
                  folders={pinnedFolders}
                  viewMode={viewMode}
                  onRefresh={fetchFolders}
                />
              )}
            </AnimatePresence>
            {/* All Folders */}
            <FolderSection
              title="All folders"
              folders={regularFolders}
              viewMode={viewMode}
              empty={filteredFolders.length === 0}
              search={search}
              onRefresh={fetchFolders}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Dialog open={openNewFolderDialogBox} onOpenChange={setOpenNewFolderDialogBox}>
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
                Description <span className="text-xs font-normal text-gray-500">(optional)</span>
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
    </motion.main>
  );
}
// Folder Section
function FolderSection({
  title,
  folders,
  viewMode,
  empty = false,
  search = "",
  onRefresh,
}: {
  title: string;
  folders: FolderType[];
  viewMode: ViewMode;
  empty?: boolean;
  search?: string;
  onRefresh: () => Promise<void>;
}) {
  const [selectedFolder, setSelectedFolder] = useState<SelectedFolder>({
    _id: "",
    name: "",
    color: "#000000",
  });
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("#6366f1");
  const [targetFolderId, setTargetFolderId] = useState("");
  const [openRenameFolderDialog, setOpenRenameFolderDialog] = useState(false);
  const [openChangeFolderColorDialog, setOpenChangeFolderColorDialog] = useState(false);
  const [openMoveFolderDialog, setOpenMoveFolderDialog] = useState(false);
  const [openFolderDeleteDialog, setOpenFolderDeleteDialog] = useState(false);
  const [openShareFolderDialog, setOpenShareFolderDialog] = useState(false);
  const [, setFolderList] = useState<FolderType[]>([]);

  const handleSelectFolder = (folder: FolderType) => {
    setSelectedFolder({
      _id: folder._id,
      name: folder.name,
      color: folder.color as string,
    });
  };
  const getFolderUrl = useCallback((id: string) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/folder/${id}`;
  }, []);
  const handleFolderAction = (action: string, folder: FolderType) => {
    handleSelectFolder(folder);
    switch (action) {
      case "rename":
        setNewFolderName(folder.name);
        setOpenRenameFolderDialog(true);
        break;
      case "change-color":
        setNewFolderColor(folder.color || "#6366f1");
        setOpenChangeFolderColorDialog(true);
        break;
      case "move":
        setTargetFolderId("");
        setOpenMoveFolderDialog(true);
        break;
      case "share":
        setOpenShareFolderDialog(true);
        break;
      case "copy-link":
        navigator.clipboard
          .writeText(getFolderUrl(folder._id))
          .then(() => {
            toast.add({
              title: "Link copied successfully",
              description: "The folder link has been copied.",
              type: "success",
            });
          })
          .catch(() => {
            toast.add({
              title: "Copy failed",
              description: "Unable to copy folder link.",
              type: "error",
            });
          });
        break;
      case "delete":
        setOpenFolderDeleteDialog(true);
        break;
      default:
        break;
    }
  };
  const refreshFolders = useCallback(async () => {
    await onRefresh();
  }, [onRefresh]);

  const renameFolder = async () => {
    if (!selectedFolder._id || !newFolderName.trim()) return;
    try {
      const response = await fetch(`${API_URL}/api/update-folder/${selectedFolder._id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newFolderName.trim(),
        }),
      });
      if (!response.ok) {
        throw new Error("Rename failed");
      }
      setFolderList((previous) =>
        previous.map((folder) =>
          folder._id === selectedFolder._id ? { ...folder, name: newFolderName.trim() } : folder,
        ),
      );
      setSelectedFolder((previous) => ({
        ...previous,
        name: newFolderName.trim(),
      }));
      toast.add({
        title: "Folder renamed",
        description: "Folder name updated successfully.",
        type: "success",
      });
      refreshFolders();
      setOpenRenameFolderDialog(false);
      setNewFolderName("");
    } catch (error) {
      console.error(error);
      toast.add({
        title: "Rename failed",
        description: "Unable to rename folder.",
        type: "error",
      });
    }
  };

  const changeFolderColor = async () => {
    if (!selectedFolder._id) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/update-folder/${selectedFolder._id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            color: newFolderColor,
          }),
        },
      );
      if (!response.ok) {
        throw new Error("Color update failed");
      }
      setFolderList((previous) =>
        previous.map((folder) =>
          folder._id === selectedFolder._id ? { ...folder, color: newFolderColor } : folder,
        ),
      );
      setSelectedFolder((previous) => ({
        ...previous,
        color: newFolderColor,
      }));
      toast.add({
        title: "Folder color updated",
        description: "Your folder color has been changed.",
        type: "success",
      });
      setOpenChangeFolderColorDialog(false);
      refreshFolders();
    } catch (error) {
      console.error(error);
      toast.add({
        title: "Color update failed",
        description: "Unable to update folder color.",
        type: "error",
      });
    }
  };

  const moveFolder = async () => {
    if (!selectedFolder._id || !targetFolderId) return;
    try {
      const response = await fetch(`${API_URL}/api/update-folder/${selectedFolder._id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parentFolderId: targetFolderId,
        }),
      });
      if (!response.ok) {
        throw new Error("Move failed");
      }
      toast.add({
        title: "Folder moved",
        description: "Folder moved successfully.",
        type: "success",
      });
      setOpenMoveFolderDialog(false);
      setTargetFolderId("");
      await refreshFolders();
    } catch (error) {
      console.error(error);
      toast.add({
        title: "Move failed",
        description: "Unable to move folder.",
        type: "error",
      });
    }
  };

  const deleteFolder = async () => {
    if (!selectedFolder._id) return;
    try {
      const response = await fetch(`${API_URL}/api/delete-folder/${selectedFolder._id}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
      setFolderList((previous) => previous.filter((folder) => folder._id !== selectedFolder._id));
      toast.add({
        title: "Folder deleted",
        description: "Folder deleted successfully.",
        type: "success",
      });
      refreshFolders();
      setOpenFolderDeleteDialog(false);
    } catch (error) {
      console.error(error);
      toast.add({
        title: "Delete failed",
        description: "Unable to delete folder.",
        type: "error",
      });
    }
  };

  const shareFolder = async () => {
    const url = getFolderUrl(selectedFolder._id);
    try {
      if (!navigator.share) {
        await navigator.clipboard.writeText(url);
        toast.add({
          title: "Link copied",
          description: "Folder link copied successfully.",
          type: "success",
        });
        return;
      }
      await navigator.share({
        title: selectedFolder.name,
        text: "Check out this folder.",
        url,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error(error);
      toast.add({
        title: "Sharing failed",
        description: "Unable to share folder.",
        type: "error",
      });
    }
  };
  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-3"
    >
      {/* Section Heading */}
      <div className="flex items-center gap-2">
        <FolderOpen className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground">{folders.length}</span>
      </div>
      {/* Folder Items */}
      <AnimatePresence mode="popLayout">
        {folders.length > 0 ? (
          <motion.div
            layout
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "overflow-hidden rounded-md border"
            }
          >
            {folders.map((folder, index) => (
              <ContextMenu key={index}>
                <ContextMenuTrigger>
                  <FolderItem
                    key={folder._id}
                    folder={folder}
                    viewMode={viewMode}
                    isLast={index === folders.length - 1}
                    handleFolderAction={handleFolderAction}
                  />
                </ContextMenuTrigger>
                <ContextMenuContent className="w-52">
                  <ContextMenuGroup>
                    <ContextMenuLabel>Actions</ContextMenuLabel>
                    <ContextMenuItem onClick={() => handleFolderAction("rename", folder)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Rename Folder
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleFolderAction("change-color", folder)}>
                      <PaintBucket className="mr-2 h-4 w-4" />
                      Change Color
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleFolderAction("move", folder)}>
                      <FolderInput className="mr-2 h-4 w-4" />
                      Move Folder
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleFolderAction("share", folder)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Folder
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => handleFolderAction("copy-link", folder)}>
                      <Link2 className="mr-2 h-4 w-4" />
                      Copy Folder Link
                    </ContextMenuItem>
                  </ContextMenuGroup>
                  <ContextMenuGroup>
                    <ContextMenuLabel>Danger Zone</ContextMenuLabel>
                    <ContextMenuItem
                      variant="destructive"
                      onClick={() => handleFolderAction("delete", folder)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Folder
                    </ContextMenuItem>
                  </ContextMenuGroup>
                </ContextMenuContent>
              </ContextMenu>
            ))}
          </motion.div>
        ) : empty ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="rounded-md border border-dashed px-4 py-12 text-center"
          >
            <Folder className="mx-auto mb-3 size-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {search ? "No matching folders" : "No folders created yet"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {search
                ? "Try another search term."
                : "Create a folder to start organizing your snippets."}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <Dialog open={openRenameFolderDialog} onOpenChange={setOpenRenameFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>Enter a new name for your folder.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              placeholder="Enter folder name"
              autoComplete="off"
            />
            <Button
              className="w-full"
              disabled={!newFolderName.trim() || newFolderName.trim() === selectedFolder.name}
              onClick={() => {
                renameFolder();
                alert("asasasas");
              }}
            >
              Rename Folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {}
      <Dialog open={openChangeFolderColorDialog} onOpenChange={setOpenChangeFolderColorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Folder Color</DialogTitle>
            <DialogDescription>Choose a color for {selectedFolder.name}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="folder-color">Select Color</Label>
            <Input
              id="folder-color"
              type="color"
              value={newFolderColor}
              onChange={(event) => setNewFolderColor(event.target.value)}
              className="h-12 cursor-pointer"
            />
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-md border"
                style={{ backgroundColor: newFolderColor }}
              />
              <p className="text-sm text-muted-foreground">{newFolderColor}</p>
            </div>
            <Button
              className="w-full"
              disabled={newFolderColor === selectedFolder.color}
              onClick={changeFolderColor}
            >
              Save Color
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {}
      <Dialog open={openMoveFolderDialog} onOpenChange={setOpenMoveFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Folder</DialogTitle>
            <DialogDescription>
              Select the destination for &quot;{selectedFolder.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field>
              <Label>Destination Folder</Label>
              <Select value={targetFolderId} onValueChange={(e) => setTargetFolderId(e as string)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination folder" />
                </SelectTrigger>
                <SelectContent>
                  {folders
                    .filter((item) => item._id !== selectedFolder._id)
                    .map((folder) => (
                      <SelectItem key={folder._id} value={folder._id}>
                        <Folder color={folder.color} />
                        {folder.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </Field>
            <Button className="w-full" disabled={!targetFolderId} onClick={moveFolder}>
              <FolderInput className="mr-2 h-4 w-4" />
              Move Folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {}
      <Dialog open={openFolderDeleteDialog} onOpenChange={setOpenFolderDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedFolder.name}&quot;? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenFolderDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteFolder}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={openShareFolderDialog} onOpenChange={setOpenShareFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Folder</DialogTitle>
            <DialogDescription>
              Anyone with this link can access the folder, depending on its sharing permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input value={getFolderUrl(selectedFolder._id)} readOnly />
            <Button
              variant="outline"
              size="icon"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(getFolderUrl(selectedFolder._id));
                  toast.add({
                    title: "Link copied",
                    description: "Folder link copied successfully.",
                    type: "success",
                  });
                } catch {
                  toast.add({
                    title: "Copy failed",
                    description: "Unable to copy folder link.",
                    type: "error",
                  });
                }
              }}
            >
              <Copy />
            </Button>
          </div>
          <Button className="w-full" onClick={shareFolder}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Folder
          </Button>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}
// Individual Folder
function FolderItem({
  folder,
  viewMode,
  isLast,
  handleFolderAction,
}: {
  folder: FolderType;
  viewMode: ViewMode;
  isLast: boolean;
  handleFolderAction: (action: string, folder: FolderType) => void;
}) {
  const color = folder.color || "#64748b";
  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -2 }}
      transition={{
        layout: {
          type: "spring",
          stiffness: 350,
          damping: 30,
        },
      }}
      className={`group relative ${
        viewMode === "grid"
          ? "rounded-md border p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
          : `flex min-w-0 items-center gap-3 px-3 py-3 transition hover:bg-muted/50 ${
              !isLast ? "border-b" : ""
            }`
      }`}
    >
      {viewMode === "grid" ? (
        <>
          {/* Grid Icon and Actions */}
          <div className="flex items-start justify-between">
            <div
              className="flex size-10 items-center justify-center rounded-md"
              style={{
                backgroundColor: `${color}18`,
                color,
              }}
            >
              <Folder className="size-5" />
            </div>
            <div className="flex items-center gap-1">
              {folder.isPinned && <Pin className="size-3.5 text-muted-foreground" />}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      aria-label={`More options for ${folder.name}`}
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-100 transition hover:bg-muted hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  }
                />

                <DropdownMenuContent className={"min-w-fit w-52"}>
                  {folderMenus.map((menu, index) => {
                    return (
                      <DropdownMenuGroup key={index}>
                        <DropdownMenuLabel>{menu.label}</DropdownMenuLabel>
                        {menu.items.map((item, index) => {
                          return (
                            <DropdownMenuItem
                              variant={item.label.includes("Delete") ? "destructive" : "default"}
                              key={index}
                              onClick={() => handleFolderAction(item.value, folder)}
                              className="cursor-pointer"
                            >
                              <item.icon className="mr-2 h-4 w-4" />
                              {item.label}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuGroup>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          {/* Grid Details */}
          <div className="mt-4 min-w-0">
            <h3 className="truncate text-sm font-medium">{folder.name}</h3>
            <p className="mt-1 line-clamp-2 min-h-8 text-xs text-muted-foreground">
              {folder.description || "No description"}
            </p>
          </div>
          {/* Grid Footer */}
          <div className="mt-4 flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground">
            <FileCode2 className="size-3.5" />
            <span>{folder.cards?.length ?? 0} snippets</span>
          </div>
        </>
      ) : (
        <>
          {/* List Icon */}
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-md"
            style={{
              backgroundColor: `${color}18`,
              color,
            }}
          >
            <Folder className="size-4.5" />
          </div>
          {/* List Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-medium">{folder.name}</h3>
              {folder.isPinned && <Pin className="size-3 shrink-0 text-muted-foreground" />}
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {folder.description || "No description"}
            </p>
          </div>
          {/* List Count */}
          <div className="hidden shrink-0 items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <FileCode2 className="size-3.5" />
            <span>{folder.cards?.length ?? 0}</span>
          </div>
          {/* List Actions */}
          <button
            type="button"
            aria-label={`More options for ${folder.name}`}
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-100 transition hover:bg-muted hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </>
      )}
    </motion.div>
  );
}
