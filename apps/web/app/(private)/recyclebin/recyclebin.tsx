"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ArchiveRestore,
    Search,
    Trash2,
    FileCode2,
    Folder,
    BookOpen,
    MoreVertical,
    Calendar,
    Code2,
    Loader2,
    RefreshCw,
    Inbox,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
// Types
type DeletedItem = {
    _id: string;
    title: string;
    description?: string;
    author?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    originalSnippetId?: string | null;
};
type DeletedSnippet = DeletedItem & {
    code: string;
    language: string;
    tags: string[];
    version: number;
    isFavorite: boolean;
    isPinned: boolean;
    isPublic: boolean;
    folder?: string;
};
type DeletedNotebook = DeletedItem & {
    content?: string;
};
type DeletedFolder = DeletedItem & {
    parentFolder?: string;
};
type RecycleBinData = {
    deletedNotebooks: DeletedNotebook[];
    deletedSnippets: DeletedSnippet[];
    deletedFolders: DeletedFolder[];
};
type TabType = "all" | "notebooks" | "snippets" | "folders";
type DeleteTarget = {
    id: string;
    title: string;
    type: string;
};
const emptyData: RecycleBinData = {
    deletedNotebooks: [],
    deletedSnippets: [],
    deletedFolders: [],
};
export default function Recyclebin() {
    const [data, setData] = useState<RecycleBinData>(emptyData);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    // Fetch deleted data
    const getData = useCallback(async () => {
        try {
            setError("");
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/get-deleted-data`,
                {
                    method: "GET",
                    credentials: "include",
                },
            );
            if (!res.ok) {
                throw new Error("Unable to fetch deleted data.");
            }
            const response = await res.json();
            if (response.status !== "success") {
                throw new Error(response.message || "Something went wrong.");
            }
            setData({
                deletedNotebooks: response.data?.deletedNotebooks ?? [],
                deletedSnippets: response.data?.deletedSnippets ?? [],
                deletedFolders: response.data?.deletedFolders ?? [],
            });
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Something went wrong.",
            );
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        getData();
    }, [getData]);
    // Counts
    const counts = useMemo(
        () => ({
            notebooks: data.deletedNotebooks.length,
            snippets: data.deletedSnippets.length,
            folders: data.deletedFolders.length,
            all:
                data.deletedNotebooks.length +
                data.deletedSnippets.length +
                data.deletedFolders.length,
        }),
        [data],
    );
    // Search filtering
    const filterItems = <T extends DeletedItem>(items: T[]) => {
        const query = search.trim().toLowerCase();
        if (!query) return items;
        return items.filter((item) =>
            [item.title, item.description ?? ""]
                .join(" ")
                .toLowerCase()
                .includes(query),
        );
    };
    const filteredNotebooks = useMemo(
        () => filterItems(data.deletedNotebooks),
        [data.deletedNotebooks, search],
    );
    const filteredSnippets = useMemo(
        () => filterItems(data.deletedSnippets),
        [data.deletedSnippets, search],
    );
    const filteredFolders = useMemo(
        () => filterItems(data.deletedFolders),
        [data.deletedFolders, search],
    );
    // Refresh
    const handleRefresh = () => {
        setIsRefreshing(true);
        getData();
    };
    // Restore item
    // Connect this handler to your restore API endpoint.
    const handleRestore = async (
        id: string,
        type: "notebook" | "snippet" | "folder",
    ) => {
        toast.add({
            title: "Restore API not connected",
            description: `Connect your ${type} restore endpoint here.`,
            type: "error",
        });
        console.log("Restore:", { id, type });
    };
    // Permanent delete
    // Connect this handler to your permanent delete API endpoint.
    const handlePermanentDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            // Replace with your permanent-delete API request.
            console.log("Permanently delete:", deleteTarget);
            toast.add({
                title: "Delete API not connected",
                description: "Connect your permanent delete endpoint.",
                type: "error",
            });
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    };
    // Date formatting
    const formatDate = (date: string) => {
        if (!date) return "Unknown date";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };
    // Loading state
    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto p-5 md:p-8 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-5 w-96" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[1, 2, 3].map((item) => (
                        <Skeleton key={item} className="h-28 rounded-xl" />
                    ))}
                </div>
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((item) => (
                        <Skeleton key={item} className="h-48 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }
    // Error state
    if (error) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 p-5">
                <AlertCircle className="size-12 text-destructive" />
                <h2 className="text-xl font-semibold">
                    Unable to load recycle bin
                </h2>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button onClick={handleRefresh}>
                    <RefreshCw className="size-4 mr-2" />
                    Try again
                </Button>
            </div>
        );
    }
    // Item Card
    const renderItemCard = (
        item: DeletedItem,
        type: "notebook" | "snippet" | "folder",
    ) => {
        const Icon =
            type === "notebook"
                ? BookOpen
                : type === "snippet"
                  ? FileCode2
                  : Folder;
        return (
            <Card
                key={item._id}
                className="group overflow-hidden hover:border-primary/40 transition-colors"
            >
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                            <div className="size-10 shrink-0 rounded-lg bg-muted flex items-center justify-center">
                                <Icon className="size-5 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                                <CardTitle className="text-base truncate">
                                    {item.title}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <Badge
                                        variant="secondary"
                                        className="capitalize"
                                    >
                                        {type}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        Deleted
                                    </span>
                                </div>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0"
                                >
                                    <MoreVertical className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className={'min-w-fit'}>
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleRestore(item._id, type)
                                    }
                                >
                                    <ArchiveRestore className="size-4 mr-2" />
                                    Restore
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() =>
                                        setDeleteTarget({
                                            id: item._id,
                                            title: item.title,
                                            type,
                                        })
                                    }
                                >
                                    <Trash2 className="size-4 mr-2" />
                                    Delete permanently
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <CardDescription className="line-clamp-2 min-h-10">
                        {item.description || "No description available."}
                    </CardDescription>
                    <Separator />
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="size-3.5" />
                            {formatDate(item.updatedAt)}
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestore(item._id, type)}
                        >
                            <ArchiveRestore className="size-4 mr-1.5" />
                            Restore
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };
    // Empty state
    const renderEmptyState = (label: string) => (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Inbox className="size-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No deleted {label}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Items you delete will appear here. You can restore them whenever
                you need.
            </p>
        </div>
    );
    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-7">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="size-11 rounded-xl bg-muted flex items-center justify-center">
                                <Trash2 className="size-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    Recycle Bin
                                </h1>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Manage and restore your deleted items.
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? (
                            <Loader2 className="size-4 mr-2 animate-spin" />
                        ) : (
                            <RefreshCw className="size-4 mr-2" />
                        )}
                        Refresh
                    </Button>
                </div>
                {/* Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Notebooks
                                </p>
                                <p className="text-2xl font-bold mt-1">
                                    {counts.notebooks}
                                </p>
                            </div>
                            <BookOpen className="size-8 text-muted-foreground" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Snippets
                                </p>
                                <p className="text-2xl font-bold mt-1">
                                    {counts.snippets}
                                </p>
                            </div>
                            <Code2 className="size-8 text-muted-foreground" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Folders
                                </p>
                                <p className="text-2xl font-bold mt-1">
                                    {counts.folders}
                                </p>
                            </div>
                            <Folder className="size-8 text-muted-foreground" />
                        </CardContent>
                    </Card>
                </div>
                {/* Search */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Search deleted items..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                {/* Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={(value) => setActiveTab(value as TabType)}
                    className="space-y-5"
                >
                    <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
                        <TabsTrigger value="all">
                            All
                            <span className="ml-1.5 text-xs text-muted-foreground">
                                {counts.all}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="notebooks">
                            Notebooks
                            <span className="ml-1.5 text-xs text-muted-foreground">
                                {counts.notebooks}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="snippets">
                            Snippets
                            <span className="ml-1.5 text-xs text-muted-foreground">
                                {counts.snippets}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="folders">
                            Folders
                            <span className="ml-1.5 text-xs text-muted-foreground">
                                {counts.folders}
                            </span>
                        </TabsTrigger>
                    </TabsList>
                    {/* All */}
                    <TabsContent value="all" className="space-y-7">
                        {counts.all === 0 ? (
                            renderEmptyState("items")
                        ) : (
                            <>
                                {filteredNotebooks.length > 0 && (
                                    <section className="space-y-4">
                                        <h2 className="font-semibold flex items-center gap-2">
                                            <BookOpen className="size-4" />
                                            Notebooks
                                            <Badge variant="secondary">
                                                {filteredNotebooks.length}
                                            </Badge>
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {filteredNotebooks.map((item) =>
                                                renderItemCard(
                                                    item,
                                                    "notebook",
                                                ),
                                            )}
                                        </div>
                                    </section>
                                )}
                                {filteredSnippets.length > 0 && (
                                    <section className="space-y-4">
                                        <h2 className="font-semibold flex items-center gap-2">
                                            <FileCode2 className="size-4" />
                                            Snippets
                                            <Badge variant="secondary">
                                                {filteredSnippets.length}
                                            </Badge>
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {filteredSnippets.map((item) =>
                                                renderItemCard(item, "snippet"),
                                            )}
                                        </div>
                                    </section>
                                )}
                                {filteredFolders.length > 0 && (
                                    <section className="space-y-4">
                                        <h2 className="font-semibold flex items-center gap-2">
                                            <Folder className="size-4" />
                                            Folders
                                            <Badge variant="secondary">
                                                {filteredFolders.length}
                                            </Badge>
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {filteredFolders.map((item) =>
                                                renderItemCard(item, "folder"),
                                            )}
                                        </div>
                                    </section>
                                )}
                                {filteredNotebooks.length === 0 &&
                                    filteredSnippets.length === 0 &&
                                    filteredFolders.length === 0 &&
                                    renderEmptyState("matching items")}
                            </>
                        )}
                    </TabsContent>
                    {/* Notebooks */}
                    <TabsContent value="notebooks">
                        {filteredNotebooks.length === 0 ? (
                            renderEmptyState("notebooks")
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredNotebooks.map((item) =>
                                    renderItemCard(item, "notebook"),
                                )}
                            </div>
                        )}
                    </TabsContent>
                    {/* Snippets */}
                    <TabsContent value="snippets">
                        {filteredSnippets.length === 0 ? (
                            renderEmptyState("snippets")
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredSnippets.map((item) =>
                                    renderItemCard(item, "snippet"),
                                )}
                            </div>
                        )}
                    </TabsContent>
                    {/* Folders */}
                    <TabsContent value="folders">
                        {filteredFolders.length === 0 ? (
                            renderEmptyState("folders")
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredFolders.map((item) =>
                                    renderItemCard(item, "folder"),
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
            {/* Permanent Delete Confirmation */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open && !isDeleting) {
                        setDeleteTarget(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Permanently delete this item?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete
                            <span className="font-semibold text-foreground">
                                {" "}
                                {deleteTarget?.title}
                            </span>
                            ? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handlePermanentDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting && (
                                <Loader2 className="size-4 mr-2 animate-spin" />
                            )}
                            Delete permanently
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
