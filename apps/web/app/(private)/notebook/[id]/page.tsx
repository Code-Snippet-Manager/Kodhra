"use client";
import { Separator } from "@/components/ui/separator";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import {
    Check,
    ChevronDown,
    ChevronRight,
    Copy,
    List,
    Share,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import "./style.css";
import { Button } from "@/components/ui/button";
import TurndownService from "turndown";
import { toast } from "@/components/ui/toast";
import { clsx } from "cn";
import { Dialog } from "@/components/ui/dialog";
import ShareDialog from "@/components/ui/ShareDialog";

type TocItem = {
    id: string;
    text: string;
    level: number;
};

const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
});

export default function Page() {
    const { id } = useParams<{ id: string }>();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [createdAt, setCreatedAt] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [toc, setToc] = useState<TocItem[]>([]);
    const [activeHeading, setActiveHeading] = useState("");
    const [tocOpen, setTocOpen] = useState(true);
    const [copiedId, setCopiedId] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [openShareDialog, setOpenShareDialog] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const controller = new AbortController();
        const getNotebookDetails = async () => {
            try {
                setIsLoading(true);
                setError("");
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/get-notebook/${id}`,
                    {
                        method: "GET",
                        credentials: "include",
                        signal: controller.signal,
                    },
                );
                if (!res.ok) {
                    throw new Error("Error fetching notebook.");
                }
                const data = await res.json();
                const notebook = data.data;
                setTitle(notebook.title || "");
                setContent(notebook.content || "");
                setCreatedAt(notebook.createdAt || "");
            } catch (error) {
                if (error instanceof Error && error.name !== "AbortError") {
                    setError(error.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };
        if (id) getNotebookDetails();
        return () => controller.abort();
    }, [id]);
    useEffect(() => {
        const container = contentRef.current;
        if (!container || !content) {
            setToc([]);
            return;
        }
        const headings = container.querySelectorAll("h1, h2, h3");
        const items: TocItem[] = [];
        headings.forEach((heading, index) => {
            const text = heading.textContent?.trim();
            if (!text) return;
            const slug = text
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
            const headingId = `heading-${index}-${slug || "section"}`;
            heading.id = headingId;
            items.push({
                id: headingId,
                text,
                level: Number(heading.tagName.replace("H", "")),
            });
        });
        setToc(items);
        const codeBlocks = container.querySelectorAll("pre code");
        codeBlocks.forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
        });
    }, [content]);
    useEffect(() => {
        if (!toc.length) return;
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleHeadings = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top,
                    );
                if (visibleHeadings.length > 0) {
                    setActiveHeading(visibleHeadings[0].target.id);
                }
            },
            {
                rootMargin: "-100px 0px -75% 0px",
                threshold: 0,
            },
        );
        toc.forEach((item) => {
            const heading = document.getElementById(item.id);
            if (heading) observer.observe(heading);
        });
        return () => observer.disconnect();
    }, [toc]);
    const scrollToHeading = useCallback((headingId: string) => {
        const heading = document.getElementById(headingId);
        if (!heading) return;
        heading.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
        history.replaceState(null, "", `#${headingId}`);
        setActiveHeading(headingId);
    }, []);
    const copyHeadingLink = async (headingId: string) => {
        const url = new URL(window.location.href);
        url.hash = headingId;
        try {
            await navigator.clipboard.writeText(url.toString());
            setCopiedId(headingId);
            setTimeout(() => {
                setCopiedId("");
            }, 2000);
        } catch (error) {
            console.error("Unable to copy link", error);
        }
    };

    const copyMarkdownCode = () => {
        if (!content) return;
        const markdown = turndownService.turndown(content);
        navigator.clipboard.writeText(markdown);
        toast.add({
            title: "Markdown copied",
            description: "Markdown copied successfully.",
            type: "success",
        });
        setIsCopied(true);
        setTimeout(() => {
            setIsCopied(false);
        }, 4000);
    };
    if (isLoading) {
        return (
            <div className="min-h-screen grid place-items-center">
                Loading notebook...
            </div>
        );
    }
    if (error) {
        return (
            <div className="min-h-screen grid place-items-center text-destructive">
                {error}
            </div>
        );
    }
    return (
        <div className="min-h-screen p-4 md:p-6">
            {/* Notebook Header */}
            <div className="max-w-7xl mx-auto mb-5 flex justify-between items-center">
                <div className="">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {title}
                    </h1>
                    <p className="text-xs text-muted-foreground mt-2">
                        Created At:{" "}
                        {createdAt
                            ? new Date(createdAt).toLocaleDateString()
                            : "Unknown"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        className={clsx(
                            isCopied ? "text-green-400" : "text-primary",
                        )}
                        variant={"ghost"}
                        onClick={() => copyMarkdownCode()}
                    >
                        {isCopied ? <Check /> : <Copy />}
                        Copy
                    </Button>
                    <Button
                        variant={"ghost"}
                        onClick={() => setOpenShareDialog(true)}
                    >
                        <Share />
                        Share
                    </Button>
                </div>
            </div>
            <Separator />
            {/* Mobile TOC */}
            {toc.length > 0 && (
                <div className="lg:hidden max-w-4xl mx-auto mt-6">
                    <div className="border rounded-xl overflow-hidden">
                        <button
                            onClick={() => setTocOpen(!tocOpen)}
                            className="w-full flex items-center justify-between p-4 font-semibold"
                        >
                            <span className="flex items-center gap-2">
                                <List size={18} />
                                Table of Contents
                                <span className="text-xs text-muted-foreground">
                                    ({toc.length})
                                </span>
                            </span>
                            {tocOpen ? (
                                <ChevronDown size={18} />
                            ) : (
                                <ChevronRight size={18} />
                            )}
                        </button>
                        {tocOpen && (
                            <div className="border-t p-3 space-y-1">
                                {toc.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            scrollToHeading(item.id);
                                            setTocOpen(false);
                                        }}
                                        style={{
                                            paddingLeft: `${(item.level - 1) * 16 + 8}px`,
                                        }}
                                        className={`w-full text-left text-sm py-2 px-2 rounded-md transition-colors ${
                                            activeHeading === item.id
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-muted-foreground hover:bg-accent"
                                        }`}
                                    >
                                        {item.text}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Main Layout */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] gap-8 mt-8">
                {/* Desktop TOC */}
                {toc.length > 0 && (
                    <aside className="hidden lg:block">
                        <div className="sticky top-6">
                            <div className="flex items-center gap-2 mb-4 font-semibold">
                                <List size={18} />
                                On this page
                            </div>
                            <nav className="space-y-1 border-l pl-3">
                                {toc.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center gap-1 group"
                                        style={{
                                            marginLeft: `${(item.level - 1) * 12}px`,
                                        }}
                                    >
                                        <button
                                            onClick={() =>
                                                scrollToHeading(item.id)
                                            }
                                            className={`flex-1 text-left text-sm py-1.5 transition-colors ${
                                                activeHeading === item.id
                                                    ? "text-primary font-semibold"
                                                    : "text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            {item.text}
                                        </button>
                                        <button
                                            onClick={() =>
                                                copyHeadingLink(item.id)
                                            }
                                            title="Copy heading link"
                                            className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-primary"
                                        >
                                            {copiedId === item.id ? (
                                                <Check size={14} />
                                            ) : (
                                                <Copy size={14} />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </aside>
                )}
                {/* Notebook Content */}
                <main className="min-w-0">
                    <div
                        ref={contentRef}
                        className="notebook-content prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{
                            __html: content,
                        }}
                    />
                </main>
            </div>
            <ShareDialog
                open={openShareDialog}
                onOpenChange={setOpenShareDialog}
                title={title}
            />
        </div>
    );
}
