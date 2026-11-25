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
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
import { FabButton } from "@/components/ui/fab";
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
import { authClient } from "@/lib/auth-client";
import { snippetMenu } from "@/lib/snippet/snippet-menu";
import { Snippets } from "@/types/snippet";
import {
  ArrowUpRight,
  Copy,
  Edit,
  Folder,
  FolderInput,
  FolderOpen,
  Link2,
  MoreHorizontal,
  PaintBucket,
  Share2,
  SquareDashedBottomCode,
  Tags,
  Trash2
} from "lucide-react";
import Link from "next/link";
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
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
/* =========================
   TYPES
========================= */
type LanguageCount = {
  language: string;
  count: number;
};
type DailyReportItem = {
  date: string;
  count: number;
};
type Counts = {
  getSnippetCount: number;
  getFolderCount: number;
  getTotalTagsCount: number;
  getMUPLanguages: LanguageCount[];
};
type ReportRange = "7-days" | "1-month" | "3-months";
type FolderType = {
  _id: string;
  name: string;
  color: string;
  createdAt: string;
};

type SelectedFolder = {
  _id: string;
  name: string;
  color: string;
};
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const chartConfig = {
  count: {
    label: "Snippets",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;
const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
/* =========================
   COMPONENT
========================= */
export default function DashboardClient() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const userId = session?.user?.id;
  const userName = session?.user?.name ?? "Unknown";

  const [counts, setCounts] = useState<Counts | null>(null);
  const [dailyReport, setDailyReport] = useState<DailyReportItem[]>([]);
  const [showReportFor, setShowReportFor] = useState<ReportRange>("7-days");
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [folderList, setFolderList] = useState<FolderType[]>([]);
  const [snippets, setSnippets] = useState<Snippets[]>([]);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [snippetId, setSnippetId] = useState<string | null>(null);
  /* Folder states */
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

  const getFolderUrl = useCallback((id: string) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/folder/${id}`;
  }, []);
  const getSnippetUrl = useCallback((id: string) => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/snippet/${id}`;
  }, []);
  const refreshFolders = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/get-folders`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }
      const result = await response.json();
      setFolderList(result.data ?? []);
    } catch (error) {
      console.error("Folder fetch error:", error);
    }
  }, []);
  const refreshSnippets = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/get-snippets`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch snippets");
      }
      const result = await response.json();
      setSnippets(result.data ?? []);
    } catch (error) {
      console.error("Snippet fetch error:", error);
    }
  }, []);

  const handleSelectFolder = (folder: FolderType) => {
    setSelectedFolder({
      _id: folder._id,
      name: folder.name,
      color: folder.color,
    });
  };

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
      const response = await fetch(`${API_URL}/api/update-folder/${selectedFolder._id}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          color: newFolderColor,
        }),
      });
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
  const deleteSnippet = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/delete-snippet/${id}`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
      setSnippets((previous) => previous.filter((snippet) => snippet._id !== id));
      toast.add({
        title: "Snippet deleted successfully",
        description: "Your snippet has been deleted.",
        type: "success",
      });
    } catch (error) {
      console.error(error);
      toast.add({
        title: "Failed to delete snippet",
        description: "Please try again.",
        type: "error",
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
    if (isPending || !userId) return;
    const controller = new AbortController();
    const getReport = async () => {
      try {
        const response = await fetch(`${API_URL}/api/get-report`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch overview report");
        }
        const result = await response.json();
        setCounts(result.data);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Overview report error:", error);
        }
      }
    };
    getReport();
    return () => controller.abort();
  }, [isPending, userId]);

  useEffect(() => {
    if (isPending || !userId) return;
    const controller = new AbortController();
    const getDailyWiseReport = async () => {
      try {
        setIsReportLoading(true);
        setReportError(null);
        const endDate = new Date();
        const startDate = new Date();
        switch (showReportFor) {
          case "7-days":
            startDate.setDate(endDate.getDate() - 6);
            break;
          case "1-month":
            startDate.setMonth(endDate.getMonth() - 1);
            break;
          case "3-months":
            startDate.setMonth(endDate.getMonth() - 3);
            break;
        }
        startDate.setHours(0, 0, 0, 0);
        const params = new URLSearchParams({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        });
        const response = await fetch(`${API_URL}/api/get-daily-wise-report?${params}`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch daily report");
        }
        const result = await response.json();
        setDailyReport(result.data ?? []);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Daily report error:", error);
          setReportError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsReportLoading(false);
        }
      }
    };
    getDailyWiseReport();
    return () => controller.abort();
  }, [showReportFor, isPending, userId]);
  /* =========================
     FETCH FOLDERS & SNIPPETS
  ========================= */
  useEffect(() => {
    if (isPending || !userId) return;
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const [folderResponse, snippetResponse] = await Promise.all([
          fetch(`${API_URL}/api/get-folders`, {
            credentials: "include",
            signal: controller.signal,
          }),
          fetch(`${API_URL}/api/get-snippets`, {
            credentials: "include",
            signal: controller.signal,
          }),
        ]);
        if (!folderResponse.ok || !snippetResponse.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const [folderData, snippetData] = await Promise.all([
          folderResponse.json(),
          snippetResponse.json(),
        ]);
        if (controller.signal.aborted) return;
        setFolderList(folderData.data ?? []);
        setSnippets(snippetData.data ?? []);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Dashboard data error:", error);
        }
      }
    };
    fetchData();
    return () => controller.abort();
  }, [isPending, userId]);
  /* =========================
     LOADING & AUTH
  ========================= */
  if (isPending) {
    return <div className="p-5">Loading dashboard...</div>;
  }
  if (!session) {
    return null;
  }

  return (
    <main className="pt-5 space-y-5 px-3">
      {/* OVERVIEW */}
      <section className="space-y-5">
        <section className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Hi, {userName}</h1>
            <p className="text-muted-foreground">Welcome to your Kodhra dashboard.</p>
          </div>
        </section>
        {/* ANALYTICS CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Snippets</p>
                <p className="text-3xl font-bold">{counts?.getSnippetCount ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <SquareDashedBottomCode size={28} />
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/snippets" className="flex justify-between items-center gap-2 group">
                View Snippets
                <ArrowUpRight size={18} />
              </Link>
            </CardFooter>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Folders</p>
                <p className="text-3xl font-bold">{counts?.getFolderCount ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <Folder size={28} />
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/folders" className="flex justify-between items-center gap-2 group">
                View Folders
                <ArrowUpRight size={18} />
              </Link>
            </CardFooter>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Unique Tags</p>
                <p className="text-3xl font-bold">{counts?.getTotalTagsCount ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <Tags size={28} />
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/tags" className="flex justify-between items-center gap-2 group">
                View Tags
                <ArrowUpRight size={18} />
              </Link>
            </CardFooter>
          </Card>
        </section>
      </section>
      {/* CHARTS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* MOST USED LANGUAGES */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Most Used Programming Languages</CardTitle>
            <CardDescription className="text-xs">
              Distribution of your snippets by programming language.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {counts?.getMUPLanguages?.length ? (
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-87.5 w-full"
              >
                <PieChart accessibilityLayer>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={counts.getMUPLanguages}
                    dataKey="count"
                    nameKey="language"
                    outerRadius={110}
                  >
                    {counts.getMUPLanguages.map((entry, index) => (
                      <Cell key={entry.language} fill={colors[index % colors.length]} />
                    ))}
                    <LabelList dataKey="language" position="inside" fill="white" fontSize={11} />
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-75 flex items-center justify-center text-muted-foreground">
                No language data available.
              </div>
            )}
          </CardContent>
        </Card>
        {/* DAILY ACTIVITY */}
        <Card className="min-w-0">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Daily Snippet Activity</CardTitle>
                <CardDescription className="text-xs">
                  Number of snippets created over time.
                </CardDescription>
              </div>
              <Select
                value={showReportFor}
                onValueChange={(value) => setShowReportFor(value as ReportRange)}
              >
                <SelectTrigger className="w-full sm:w-37.5">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7-days">Last 7 Days</SelectItem>
                  <SelectItem value="1-month">Last 1 Month</SelectItem>
                  <SelectItem value="3-months">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isReportLoading ? (
              <div className="h-75 flex items-center justify-center text-muted-foreground">
                Loading report...
              </div>
            ) : reportError ? (
              <div className="h-75 flex items-center justify-center text-destructive">
                {reportError}
              </div>
            ) : dailyReport.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-75 w-full">
                <BarChart
                  accessibilityLayer
                  data={dailyReport}
                  margin={{
                    top: 20,
                    right: 10,
                    left: -15,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) =>
                      new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    }
                  />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[5, 5, 0, 0]}>
                    <LabelList dataKey="count" position="top" />
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-75 flex items-center justify-center text-muted-foreground">
                No activity data available.
              </div>
            )}
          </CardContent>
        </Card>
      </section>
      {}
      <section>
        <p className="text-xs text-muted-foreground flex gap-2 items-center">
          {" "}
          <FolderOpen size={18} />
          Recent Folders
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {folderList.slice(0, 4).map((folder) => (
            <ContextMenu key={folder._id}>
              <ContextMenuTrigger>
                <Card className="h-fit cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="flex items-center justify-between">
                    <div className="flex flex-col min-w-0">
                      <p className="truncate">{folder.name}</p>
                      <p className="text-xs text-card-foreground">
                        Created At: {new Date(folder.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted shrink-0">
                      <Folder size={28} fill={folder.color} color={folder.color} />
                    </div>
                  </CardContent>
                </Card>
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
          {folderList.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full py-6 text-center">
              No folders available.
            </p>
          )}
        </div>
      </section>
      {}
      <section>
        <p className="text-xs text-muted-foreground flex gap-2 items-center"> <SquareDashedBottomCode size={18} />Recent Snippets</p>
        <div className="mt-3 columns-1 sm:columns-2 gap-4">
          {snippets.map((item) => (
            <ContextMenu key={item._id}>
              <ContextMenuTrigger>
                <Card className="mb-3 break-inside-avoid">
                  <CardHeader className="flex justify-between items-center">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar>
                        <AvatarImage src={item.author?.image} />
                        <AvatarFallback>
                          {item.author?.name?.split(" ")[0]?.[0] ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <CardTitle className="capitalize truncate">{item.title}</CardTitle>
                        <CardDescription className="text-xs">
                          Author: {item.author?.name} | Language: {item.language}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="rounded-full shrink-0">
                          <MoreHorizontal size={24} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-52">
                        {snippetMenu.map((group) => (
                          <DropdownMenuGroup key={group.label}>
                            <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                            {group.items.map((menu) => {
                              const Icon = menu.icon;
                              return (
                                <DropdownMenuItem
                                  key={menu.value}
                                  onSelect={() => handleSnippetAction(menu.value, item)}
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
                          onSelect={() => handleSnippetAction(menu.value, item)}
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
          ))}
        </div>
      </section>
      {}
      <FabButton
        onAction={(action) => {
          switch (action) {
            case "create-snippet":
              router.push("/card/create");
              break;
            case "create-folder":
              window.dispatchEvent(new Event("open-modal"));
              break;
            case "open-playground":
              router.push("/playground");
              break;
            case "import-file":
              break;
            case "paste-code":
              break;
            default:
              console.log("Action:", action);
          }
        }}
      />
      {}
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
      {}
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
            <Label>Destination Folder</Label>
            <Select value={targetFolderId} onValueChange={(e) => setTargetFolderId(e as string)}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination folder" />
              </SelectTrigger>
              <SelectContent>
                {folderList
                  .filter((folder) => folder._id !== selectedFolder._id)
                  .map((folder) => (
                    <SelectItem key={folder._id} value={folder._id}>
                      {folder.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
    </main>
  );
}
