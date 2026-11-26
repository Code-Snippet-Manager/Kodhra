"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Clock,
  Edit,
  ExternalLink,
  FileText,
  NotebookPen,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
interface NotebookType {
  _id: string;
  title: string;
  content: string;
  version: number;
  userId: string;
  isDeleted: boolean | string;
  isFav: boolean | string;
  isPinned: boolean | string;
  isPublic: boolean | string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};
const cardVariants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.96,
    transition: {
      duration: 0.2,
    },
  },
};
const fadeVariants = {
  hidden: {
    opacity: 0,
    y: 10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
    },
  },
};
const isTrue = (value: boolean | string) => value === true || value === "true";
const getPlainText = (html: string) => {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
};
const formatDate = (date: string) => {
  if (!date) return "Unknown date";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown date";
  }
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
};
const formatRelativeDate = (date: string) => {
  if (!date) return "Unknown";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }
  const days = Math.round(
    (parsed.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  return new Intl.RelativeTimeFormat("en", {
    numeric: "auto",
  }).format(days, "day");
};

function NotebookSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="size-10 rounded-xl" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardFooter className="justify-between border-t pt-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-16" />
      </CardFooter>
    </Card>
  );
}
function EmptyState({
  search,
  onClear,
}: {
  search: string;
  onClear: () => void;
}) {
  return (
    <motion.div
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <Card className="border-dashed shadow-none">
        <CardContent className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 180,
              damping: 14,
            }}
            className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-muted"
          >
            {search ? (
              <Search className="size-7 text-muted-foreground" />
            ) : (
              <NotebookPen className="size-7 text-muted-foreground" />
            )}
          </motion.div>
          <h3 className="text-lg font-semibold">
            {search ? "No notebooks found" : "Your workspace is empty"}
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {search
              ? "We couldn't find any notebooks matching your search. Try another keyword."
              : "Create your first notebook and start organizing your thoughts and ideas."}
          </p>
          {search ? (
            <Button variant="outline" className="mt-6" onClick={onClear}>
              Clear Search
            </Button>
          ) : (
            <Button className="mt-6">
              <Link href="/notebook/create">
                <Plus className="mr-2 size-4" />
                Create Notebook
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
export default function Notebook() {
  const router = useRouter();
  const [notebooks, setNotebooks] = useState<NotebookType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const getNotebooks = useCallback(async (signal?: AbortSignal) => {
    try {
      setError("");
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("API URL is not configured.");
      }
      const res = await fetch(`${apiUrl}/api/get-notebook`, {
        credentials: "include",
        cache: "no-store",
        signal,
      });
      if (!res.ok) {
        throw new Error("Unable to fetch your notebooks. Please try again.");
      }
      const response = await res.json();
      const data = Array.isArray(response) ? response : response.data;
      if (!Array.isArray(data)) {
        throw new Error("Invalid notebook response from server.");
      }
      if (!signal?.aborted) {
        setNotebooks(data);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }
      if (!signal?.aborted) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while fetching notebooks.",
        );
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getNotebooks(controller.signal);
    return () => {
      controller.abort();
    };
  }, [getNotebooks]);
  const filteredNotebooks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return notebooks;
    return notebooks.filter((notebook) => {
      const title = notebook.title?.toLowerCase() || "";
      const content = getPlainText(notebook.content).toLowerCase();
      return title.includes(query) || content.includes(query);
    });
  }, [notebooks, search]);
  const handleRefresh = () => {
    getNotebooks();
  };

  const deletNotebook = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/delete-notebook/${id}`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (!res.ok) {
        throw new Error("Unable to delete notebook. Please try again.");
      }
      toast.add({
        title: "Notebook Deleted",
        description: "Your notebook is Successfully Deleted.",
        type: "success",
      });
      getNotebooks();
      return;
    } catch (error) {
      if (error instanceof Error) {
        toast.add({
          title: "Error Deleting Notebook",
          description: error.message,
          type: "error",
        });
      }
    }
  };

  return (
    <div className="w-full space-y-8 p-3 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Notebooks</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your notes, organize your thoughts and ideas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            title="Refresh notebooks"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button>
            <Plus className="mr-2 size-4" />
            <Link href="/notebook/create">New Notebook</Link>
          </Button>
        </div>
      </motion.div>
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h2 className="text-lg font-semibold">All Notebooks</h2>
          <p className="text-sm text-muted-foreground">
            {loading
              ? "Loading your notebooks..."
              : `${filteredNotebooks.length} ${
                  filteredNotebooks.length === 1 ? "notebook" : "notebooks"
                } found`}
          </p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notebooks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-9"
          />
        </div>
      </motion.div>
      {/* Error State */}
      <AnimatePresence mode="wait">
        {error && !loading && (
          <motion.div
            key="error"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Card className="border-destructive/30 shadow-none">
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="size-6 text-destructive" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Unable to load notebooks</h3>
                  <p className="max-w-md text-sm text-muted-foreground">
                    {error}
                  </p>
                </div>
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="mr-2 size-4" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Loading Skeleton */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <NotebookSkeleton key={index} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Notebook Grid / Empty State */}
      {!loading && !error && (
        <AnimatePresence mode="wait">
          {filteredNotebooks.length === 0 ? (
            <EmptyState
              key="empty"
              search={search}
              onClear={() => setSearch("")}
            />
          ) : (
            <motion.div
              key="notebook-grid"
              layout
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {filteredNotebooks.map((notebook) => {
                  const preview = getPlainText(notebook.content);
                  const pinned = isTrue(notebook.isPinned);
                  const favorite = isTrue(notebook.isFav);
                  const publicNotebook = isTrue(notebook.isPublic);
                  return (
                    <motion.div
                      key={notebook._id}
                      layout
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      whileHover={{
                        y: -4,
                        transition: { duration: 0.2 },
                      }}
                      className="h-full"
                    >
                      <ContextMenu>
                        <ContextMenuTrigger>
                          <Card
                            className="group flex h-full cursor-default flex-col overflow-hidden border-border/70 transition-colors duration-200 hover:border-primary/30 hover:shadow-md"
                            onClick={() =>
                              router.push(`/notebook/${notebook._id}`)
                            }
                          >
                            {/* Card Header */}
                            <CardHeader className="space-y-4">
                              <div className="flex items-start justify-between gap-3 max-w-[80%]">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                                  <FileText className="size-5 text-primary" />
                                </div>
                                <div className="flex flex-wrap justify-end gap-1.5">
                                  {pinned && (
                                    <Badge
                                      variant="secondary"
                                      className="gap-1"
                                    >
                                      <Pin className="size-3" />
                                      Pinned
                                    </Badge>
                                  )}
                                  {favorite && (
                                    <Badge
                                      variant="outline"
                                      className="gap-1 border-yellow-500/30 text-yellow-600"
                                    >
                                      <Star className="size-3 fill-current" />
                                      Favorite
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-2 max-w-[80%]">
                                <CardTitle className="truncate text-base">
                                  {notebook.title || "Untitled Notebook"}
                                </CardTitle>
                                <p className="line-clamp-3 min-h-18 text-sm leading-relaxed text-muted-foreground">
                                  {preview ||
                                    "No content available. Start writing your ideas..."}
                                </p>
                              </div>
                            </CardHeader>
                            {/* Card Footer */}
                            <CardFooter className="mt-auto flex flex-col items-stretch gap-3 border-t bg-muted/20 px-5 py-4">
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="size-3.5" />
                                  Updated{" "}
                                  {formatRelativeDate(notebook.updatedAt)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <CalendarDays className="size-3.5" />
                                  {formatDate(notebook.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {publicNotebook && (
                                    <Badge variant="outline">Public</Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    v{notebook.version}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="gap-1"
                                >
                                  <Link href={`/notebook/${notebook._id}`}>
                                    Open
                                  </Link>
                                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        </ContextMenuTrigger>
                        {/* Context Menu */}
                        <ContextMenuContent className="w-52">
                          <ContextMenuGroup>
                            <ContextMenuLabel>Actions</ContextMenuLabel>
                            <ContextMenuItem>
                              <Link
                                href={`/notebook/${notebook._id}`}
                                className="flex cursor-pointer items-center"
                              >
                                <ExternalLink className="mr-2 size-4" />
                                Open
                              </Link>
                            </ContextMenuItem>
                            <ContextMenuItem>
                              <Link
                                href={`/notebook/edit/${notebook._id}`}
                                className="flex cursor-pointer items-center"
                              >
                                <Edit className="mr-2 size-4" />
                                Edit Notebook
                              </Link>
                            </ContextMenuItem>
                            <ContextMenuItem
                              onClick={async () => {
                                try {
                                  const res = await fetch(
                                    `${process.env.NEXT_PUBLIC_API_URL}/api/pin-notebook/${notebook._id}`,
                                    { method: "POST", credentials: "include" },
                                  );
                                  if (!res.ok) {
                                    throw new Error("Error to pin notebook");
                                  } else {
                                    toast.add({
                                      title: "Success",
                                      description:
                                        "Notebook pinned successfully",
                                      type: "success",
                                    });
                                    getNotebooks();
                                  }
                                } catch (error) {
                                  if (error instanceof Error) {
                                    toast.add({
                                      title: "Error",
                                      description: error.message,
                                      type: "error",
                                    });
                                    return;
                                  }
                                  console.log(error);
                                }
                              }}
                            >
                              <Pin className="size-4" />
                              {notebook.isPinned === "true"
                                ? "Unpin Notebook"
                                : "Pin Notebook"}
                            </ContextMenuItem>
                            <ContextMenuItem
                              onClick={async () => {
                                try {
                                  const res = await fetch(
                                    `${process.env.NEXT_PUBLIC_API_URL}/api/fav-notebook/${notebook._id}`,
                                    { method: "POST", credentials: "include" },
                                  );
                                  if (!res.ok) {
                                    throw new Error(
                                      "Error to Favorited notebook",
                                    );
                                  } else {
                                    toast.add({
                                      title: "Success",
                                      description:
                                        "Notebook Favorited successfully",
                                      type: "success",
                                    });
                                    getNotebooks();
                                  }
                                } catch (error) {
                                  if (error instanceof Error) {
                                    toast.add({
                                      title: "Error",
                                      description: error.message,
                                      type: "error",
                                    });
                                    return;
                                  }
                                  console.log(error);
                                }
                              }}
                            >
                              <Star className=" size-4" />
                              {notebook.isFav === "true"
                                ? "Unfavorite Notebook"
                                : "Favorite Notebook"}
                            </ContextMenuItem>
                          </ContextMenuGroup>
                          <ContextMenuGroup>
                            <ContextMenuGroup>
                              <ContextMenuLabel>Danger</ContextMenuLabel>
                              <ContextMenuItem
                                variant="destructive"
                                onClick={() => deletNotebook(notebook._id)}
                              >
                                <Trash />
                                Delete
                              </ContextMenuItem>
                            </ContextMenuGroup>
                          </ContextMenuGroup>
                        </ContextMenuContent>
                      </ContextMenu>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
