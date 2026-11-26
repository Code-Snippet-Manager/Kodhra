"use client";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Code2,
  FileCode2,
  FileText,
  Folder,
  FolderOpen,
  Globe,
  Hash,
  Lock,
  RefreshCw,
  Search,
  Star,
  Pin,
  FolderPlus,
  LayoutGrid,
  List,
  MoreVertical,
  Clock,
} from "lucide-react";
// -----------------------------------------
// Types
// -----------------------------------------
interface FolderType {
  _id: string;
  name: string;
  description?: string;
  userId: string;
  cards: string[];
  parentFolderId: string | null;
  color: string;
  icon: string;
  isPinned: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
interface SnippetType {
  _id: string;
  title: string;
  description?: string;
  code: string;
  language: string;
  tags: string[];
  author: string;
  version: number;
  originalSnippetId?: string;
  isFavorite: boolean;
  isPinned: boolean;
  isPublic: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  folder: string;
}
interface FolderChildrenResponse {
  folders: FolderType[];
  snippets: SnippetType[];
}
// -----------------------------------------
// Main Component
// -----------------------------------------
export default function ViewFolder() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [snippets, setSnippets] = useState<SnippetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  // -----------------------------------------
  // Fetch folder children
  // -----------------------------------------
  const getSnippetChildren = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError("");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/folder-children/${id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      if (!res.ok) {
        throw new Error("Unable to load folder contents.");
      }
      const response = await res.json();
      if (response.status !== "success") {
        throw new Error(
          response.message || "Unable to load folder contents."
        );
      }
      const data: FolderChildrenResponse = response.data;
      setFolders(data.folders ?? []);
      setSnippets(data.snippets ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getSnippetChildren();
  }, [getSnippetChildren]);
  // -----------------------------------------
  // Date formatter
  // -----------------------------------------
  const formatDate = (date: string) => {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(parsedDate);
  };
  // -----------------------------------------
  // Search filtering
  // -----------------------------------------
  const filteredFolders = folders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSnippets = snippets.filter((snippet) => {
    const query = searchQuery.toLowerCase();
    return (
      snippet.title.toLowerCase().includes(query) ||
      snippet.language.toLowerCase().includes(query) ||
      snippet.description?.toLowerCase().includes(query) ||
      snippet.tags?.some((tag) =>
        tag.toLowerCase().includes(query)
      )
    );
  });
  // -----------------------------------------
  // Loading UI
  // -----------------------------------------
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <Skeleton className="h-4 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  // -----------------------------------------
  // Error UI
  // -----------------------------------------
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-5">
        <div className="size-14 rounded-full bg-destructive/10 flex items-center justify-center">
          <FolderOpen className="size-7 text-destructive" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-semibold text-lg">
            Unable to load folder
          </h2>
          <p className="text-sm text-muted-foreground">
            {error}
          </p>
        </div>
        <Button onClick={getSnippetChildren} variant="outline">
          <RefreshCw className="size-4 mr-2" />
          Try again
        </Button>
      </div>
    );
  }
  // -----------------------------------------
  // Main UI
  // -----------------------------------------
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/dashboard" />}>
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/folder" />}>
              Folders
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              Folder Contents
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* Folder Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FolderOpen className="size-6 text-primary" />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Folder Contents
            </h1>
            <p className="text-sm text-muted-foreground">
              Browse and manage your folders and saved snippets.
            </p>
            <p className="text-xs text-muted-foreground">
              Folder ID: {id}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4 mr-2" />
          Go Back
        </Button>
      </div>
      <Separator />
      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatsCard
          icon={<Folder />}
          label="Folders"
          value={folders.length}
        />
        <StatsCard
          icon={<Code2 />}
          label="Snippets"
          value={snippets.length}
        />
        <StatsCard
          icon={<Pin />}
          label="Pinned"
          value={
            folders.filter((folder) => folder.isPinned).length +
            snippets.filter((snippet) => snippet.isPinned).length
          }
        />
      </div>
      {/* Search and View Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search folders and snippets..."
            className="w-full h-10 pl-9 pr-3 rounded-md border bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant={viewMode === "grid" ? "secondary" : "outline"}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            size="icon"
            variant={viewMode === "list" ? "secondary" : "outline"}
            onClick={() => setViewMode("list")}
          >
            <List className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={getSnippetChildren}
            title="Refresh"
          >
            <RefreshCw className="size-4" />
          </Button>
        </div>
      </div>
      {/* Folders Section */}
      {filteredFolders.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Folder className="size-4 text-muted-foreground" />
              <h2 className="font-semibold">
                Folders
              </h2>
              <Badge variant="secondary">
                {filteredFolders.length}
              </Badge>
            </div>
          </div>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                : "flex flex-col gap-3"
            }
          >
            {filteredFolders.map((folder) => (
              <FolderCard
                key={folder._id}
                folder={folder}
                formatDate={formatDate}
                viewMode={viewMode}
              />
            ))}
          </div>
        </section>
      )}
      {/* Snippets Section */}
      {filteredSnippets.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="size-4 text-muted-foreground" />
              <h2 className="font-semibold">
                Snippets
              </h2>
              <Badge variant="secondary">
                {filteredSnippets.length}
              </Badge>
            </div>
          </div>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "flex flex-col gap-3"
            }
          >
            {filteredSnippets.map((snippet) => (
              <SnippetCard
                key={snippet._id}
                snippet={snippet}
                formatDate={formatDate}
                viewMode={viewMode}
              />
            ))}
          </div>
        </section>
      )}
      {/* Empty State */}
      {filteredFolders.length === 0 &&
        filteredSnippets.length === 0 && (
          <div className="border border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center gap-3">
            <div className="size-14 rounded-full bg-muted flex items-center justify-center">
              {searchQuery ? (
                <Search className="size-6 text-muted-foreground" />
              ) : (
                <FolderOpen className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">
                {searchQuery
                  ? "No results found"
                  : "This folder is empty"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {searchQuery
                  ? "Try searching with another keyword."
                  : "Folders and snippets added here will appear in this section."}
              </p>
            </div>
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      {/* Footer */}
      <div className="pt-4 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
        <span>
          {folders.length + snippets.length} total items
        </span>
        <span>
          Powered by Kodhra
        </span>
      </div>
    </div>
  );
}
// -----------------------------------------
// Statistics Card
// -----------------------------------------
function StatsCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="size-9 rounded-lg bg-muted flex items-center justify-center shrink-0 [&>svg]:size-4">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {label}
          </p>
          <p className="text-xl font-bold">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
// -----------------------------------------
// Folder Card
// -----------------------------------------
function FolderCard({
  folder,
  formatDate,
  viewMode,
}: {
  folder: FolderType;
  formatDate: (date: string) => string;
  viewMode: "grid" | "list";
}) {
  const router = useRouter();
  return (
    <Card
      onClick={() => router.push(`/folder/${folder._id}`)}
      className="group cursor-pointer shadow-none hover:border-primary/50 hover:bg-accent/30 transition-colors"
    >
      <CardContent
        className={
          viewMode === "grid"
            ? "p-4 space-y-4"
            : "p-4 flex items-center gap-4"
        }
      >
        <div
          className="size-11 rounded-xl flex items-center justify-center shrink-0"
          style={{
            backgroundColor: `${folder.color || "#64748b"}18`,
            color: folder.color || "#64748b",
          }}
        >
          <Folder className="size-6" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">
              {folder.name}
            </h3>
            {folder.isPinned && (
              <Pin className="size-3 text-muted-foreground shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {folder.description || "No description added."}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <CalendarDays className="size-3" />
            {formatDate(folder.updatedAt)}
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
      </CardContent>
    </Card>
  );
}
// -----------------------------------------
// Snippet Card
// -----------------------------------------
function SnippetCard({
  snippet,
  formatDate,
  viewMode,
}: {
  snippet: SnippetType;
  formatDate: (date: string) => string;
  viewMode: "grid" | "list";
}) {
  const router = useRouter();
  return (
    <Card
      onClick={() => router.push(`/card/${snippet._id}`)}
      className="group cursor-pointer shadow-none hover:border-primary/50 transition-colors overflow-hidden"
    >
      <CardHeader className="p-4 pb-3 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileCode2 className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-sm truncate">
                {snippet.title}
              </CardTitle>
              <CardDescription className="text-xs mt-1 capitalize">
                {snippet.language}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {snippet.isPinned && (
              <Pin className="size-3.5 text-muted-foreground" />
            )}
            {snippet.isFavorite && (
              <Star className="size-3.5 text-yellow-500 fill-yellow-500" />
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-8">
          {snippet.description || "No description available."}
        </p>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        {/* Code Preview */}
        <div className="rounded-lg bg-muted/70 border overflow-hidden">
          <div className="px-3 py-2 border-b flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {snippet.language}
            </span>
            <Code2 className="size-3 text-muted-foreground" />
          </div>
          <pre className="p-3 text-xs font-mono whitespace-pre-wrap break-words overflow-hidden max-h-28 text-muted-foreground">
            {snippet.code.slice(0, 350)}
            {snippet.code.length > 350 ? "\n..." : ""}
          </pre>
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {snippet.tags?.slice(0, 3).map((tag, index) => (
            <Badge
              key={`${tag}-${index}`}
              variant="secondary"
              className="text-[10px] font-normal"
            >
              #{tag}
            </Badge>
          ))}
          {snippet.tags?.length > 3 && (
            <Badge variant="outline" className="text-[10px]">
              +{snippet.tags.length - 3}
            </Badge>
          )}
        </div>
        <Separator />
        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Clock className="size-3" />
            {formatDate(snippet.updatedAt)}
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px] font-normal"
            >
              v{snippet.version}
            </Badge>
            {snippet.isPublic ? (
              <Globe className="size-3.5 text-muted-foreground" />
            ) : (
              <Lock className="size-3.5 text-muted-foreground" />
            )}
            <ArrowRight className="size-3.5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
