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
import {
  ArrowUpRight,
  ClipboardCopy,
  Copy,
  Edit,
  Flag,
  Folder,
  MoreHorizontal,
  Share,
  SquareKanbanPlus,
  StickyNote,
  Tags,
  Trash,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
type Snippets = {
  _id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  folder: string;
  author: {
    name: string;
    image: string;
    _id: string;
    email: string;
  };
  isFavorite: boolean;
  isPinned: boolean;
  isPublic: boolean;
  isDeleted: boolean;
  createdAt: string;
};
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
export default function DashboardClient() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [dailyReport, setDailyReport] = useState<DailyReportItem[]>([]);
  const [showReportFor, setShowReportFor] = useState<ReportRange>("7-days");
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [folderList, setFolderList] = useState([]);
  const [snippets, setSnippets] = useState<Snippets[]>([]);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [snippetId, setSnippetId] = useState<string | null>(null);
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const userName = session?.user?.name ?? "Unknown";
  const router = useRouter();
  const duplicateSnippet = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/duplicate-snippet/${id}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        toast.add({
          title: "Failed to duplicate snippet",
          description: "Something went wrong while duplicating your snippet. Please try again.",
          type: "error",
        });
      } else {
        toast.add({
          title: "Snippet duplicated successfully",
          description: "Your snippet has been duplicated successfully.",
          type: "success",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.add({
          title: "Failed to duplicate snippet",
          description: "We couldn't duplicate your snippet. Please try again.",
          type: "error",
        });
      }
      console.log(error);
    }
  };
  const deleteSnippet = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/delete-snippet/${id}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        toast.add({
          title: "Failed to delete snippet",
          description: "We couldn't delete your snippet. Please try again.",
          type: "error",
        });
      } else {
        toast.add({
          title: "Snippet deleted successfully",
          description: "Your snippet has been permanently deleted.",
          type: "success",
        });
      }
    } catch (error) {
      console.log(error);
      toast.add({
        title: "Failed to delete snippet",
        description: "We couldn't delete your snippet. Please try again.",
        type: "error",
      });
    }
  };
  const snippetMenu = [
    {
      label: "Actions",
      items: [
        {
          label: "Edit Snippet",
          value: "edit",
          icon: Edit,
          onClick: (_: unknown | string, id: string) => {
            router.push(`/card/edit/${id}`);
          },
        },
        {
          label: "Share",
          value: "share",
          icon: Share,
          onClick: (_: unknown | string, id: string) => {
            setSnippetId(id);
            setOpenShareDialog(true);
          },
        },
        {
          label: "Duplicate",
          value: "duplicate",
          icon: StickyNote,
          onClick: (_: unknown | string, id: string) => {
            duplicateSnippet(id);
          },
        },
        {
          label: "Copy Link",
          value: "copy-link",
          icon: Copy,
          onClick: (_: unknown | string, id: string) => {
            window.navigator.clipboard.writeText(
              `${process.env.NEXT_PUBLIC_API_URL}/snippet/${id}`,
            );
            toast.add({
              title: "Link copied successfully",
              description: "The link has been copied to your clipboard.",
              type: "success",
            });
          },
        },
        {
          label: "Copy Content",
          value: "copy-content",
          icon: ClipboardCopy,
          onClick: (_: unknown | string, id: string, value?:string) => {
            window.navigator.clipboard.writeText(value as string);
            toast.add({
              title: "Code copied successfully",
              description: "The code has been copied to your clipboard.",
              type: "success",
            });
          },
        },
      ],
    },
    {
      label: "Danger Zone",
      items: [
        {
          label: "Delete",
          value: "delete",
          icon: Trash,
          variant: "destructive",
          onClick: (_: unknown | string, id: string) => {
            deleteSnippet(id);
          },
        },
        {
          label: "Report",
          value: "report",
          icon: Flag,
          onClick: (_: unknown | string, id: string) => {
            router.push(`/card/edit/${id}`);
          },
        },
        {
          label: "Cancel",
          value: "cancel",
          icon: X,
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onClick: (_: unknown | string, id: string) => {
            return;
          },
        },
      ],
    },
  ];
  useEffect(() => {
    if (isPending || !userId) return;
    const controller = new AbortController();
    const getReport = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-report`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch overview report");
        }
        const result = await res.json();
        console.log(result);
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
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/get-daily-wise-report?${params.toString()}`,
          {
            credentials: "include",
          },
        );
        if (!res.ok) {
          throw new Error("Failed to fetch daily report");
        }
        const result = await res.json();
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
  useEffect(() => {
    const getFolders = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-folders`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      const folders = data.data;
      console.log(folders);
      setFolderList(folders);
    };
    getFolders();
  }, []);
  useEffect(() => {
    const getSnippets = async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-snippets`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      setSnippets(data.data);
      console.log(data);
    };
    getSnippets();
  }, []);
  if (isPending) {
    return <div className="p-5">Loading dashboard...</div>;
  }
  if (!session) {
    return null;
  }
  return (
    <main className="pt-5 space-y-5 px-3">
      {/* Overview Section */}
      <section className="space-y-5">
        {/* Header */}
        <section className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Hi, {userName}</h1>
            <p className="text-muted-foreground">Welcome to your Kodhra dashboard.</p>
          </div>
        </section>
        {/* Analytics Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Snippets */}
          <Card>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Snippets</p>
                <p className="text-3xl font-bold">{counts?.getSnippetCount ?? 0}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <SquareKanbanPlus size={28} />
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/snippets" className="flex justify-between items-center gap-2 group">
                View Snippets <ArrowUpRight size={18} className="group-hover:animate-caret-blink" />
              </Link>
            </CardFooter>
          </Card>
          {/* Total Folders */}
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
                View Folders <ArrowUpRight size={18} className="group-hover:animate-caret-blink" />
              </Link>
            </CardFooter>
          </Card>
          {/* Total Tags */}
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
                View Tags <ArrowUpRight size={18} className="group-hover:animate-caret-blink" />
              </Link>
            </CardFooter>
          </Card>
        </section>
      </section>
      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most Used Languages */}
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="">Most Used Programming Languages</CardTitle>
            <CardDescription className="text-muted-foreground text-xs">
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
        {/* Daily Activity */}
        <Card className="min-w-0">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="">Daily Snippet Activity</CardTitle>
                <CardDescription className="text-muted-foreground text-xs">
                  Number of snippets created over time.
                </CardDescription>
              </div>
              {/* Date Range Selector */}
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
      {/* recent folders */}
      <section>
        <p className="text-xs text-muted-foreground">Recent Folders</p>
        <div className="grid grid-cols-4 gap-4 mt-2">
          {folderList.map(
            (item: { id: string; name: string; color: string; createdAt: Date }, index) => {
              if (index >= 4) {
                return;
              }
              return (
                <Card key={index} className="h-fit">
                  <CardContent className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="">{item.name}</p>
                      <p className="text-xs text-card-foreground">Created At: {new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted">
                      <Folder size={28} color={item.color} />
                    </div>
                  </CardContent>
                </Card>
              );
            },
          )}
        </div>
      </section>
      <section>
        <p className="text-xs text-accent-foreground">Recent Snippets</p>
        <div className="mt-3 columns-1 sm:columns-2 gap-4">
          {snippets.map((item, index) => {
            return (
              <ContextMenu key={index}>
                <ContextMenuTrigger>
                  <Card key={index} className="mb-3">
                    <CardHeader className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={item.author.image} />
                          <AvatarFallback>{item.author.name.split(" ")[0][0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="capitalize">{item.title}</CardTitle>
                          <CardDescription className="text-muted-foreground text-xs">
                            Author: {item.author.name} | Language: {item.language}
                          </CardDescription>
                          <CardDescription className="text-muted-foreground text-xs"></CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="lg" className={"rounded-full"}>
                              <MoreHorizontal size={24} />
                            </Button>
                          }
                        />
                        <DropdownMenuContent className={"w-fit"}>
                          {snippetMenu.map((group) => (
                            <DropdownMenuGroup key={group.label}>
                              <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                              {group.items.map((menu) => (
                                <DropdownMenuItem
                                  key={menu.label}
                                  onClick={() => menu.onClick(null, item._id, item.code)}
                                >
                                  <menu.icon className="mr-2 h-4 w-4" />
                                  {menu.label}
                                </DropdownMenuItem>
                              ))}
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
                <ContextMenuContent>
                  {snippetMenu.map((group) => (
                    <ContextMenuGroup key={group.label}>
                      <ContextMenuLabel>{group.label}</ContextMenuLabel>
                      {group.items.map((menu) => {
                        const Icon = menu.icon;
                        return (
                          <ContextMenuItem
                            key={menu.value}
                            onClick={() => menu.onClick(null, item._id, item.code)}
                          >
                            <Icon />
                            {menu.label}
                          </ContextMenuItem>
                        );
                      })}
                    </ContextMenuGroup>
                  ))}
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      </section>
      {/* FAB ICONS */}
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
      {/* FAB ICONS */}
      {/* SHARE DIALOG BOX*/}
      <Dialog open={openShareDialog} onOpenChange={setOpenShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share link</DialogTitle>
            <DialogDescription>
              Anyone who has this link will be able to view this.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                defaultValue={`http://localhost:3000/snippet/${snippetId}`}
                readOnly
              />
            </div>
          </div>
          <div className="flex flex-row items-center">
            {[FaInstagram, FaTwitter, FaLinkedin, FaGithub, FaDiscord, FaFacebook].map(
              (Icon, index) => (
                <Tooltip key={index}>
                  <TooltipTrigger>
                    <Button key={index} variant="outline" className="mr-2">
                      <Icon />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{Icon.name.toString().replace("Fa", "")}</p>
                  </TooltipContent>
                </Tooltip>
              ),
            )}
            <Button
              variant={"outline"}
              onClick={() => {
                window.navigator.share({
                  title: "Share Snippet",
                  text: "Share snippet to your friends",
                  url: `http://localhost:3000/snippet/${snippetId}`,
                });
              }}
            >
              Other
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* SHARE DIALOG BOX*/}
    </main>
  );
}
