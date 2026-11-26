"use client";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Snippets } from "@/types/snippet";
import { Editor } from "@monaco-editor/react";
import { codeToHtml } from "shiki";
import { toPng } from "html-to-image";
import {
    ArrowLeft,
    CalendarDays,
    Check,
    Clock,
    Code2,
    Copy,
    Download,
    Pencil,
    Pin,
    Star,
    Tag,
    FileCode2,
    Hash,
    Globe,
    Lock,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
export default function ViewCard() {
    const { id } = useParams<{ id: string }>();
    const [snippet, setSnippet] = useState<Snippets & {updatedAt: string} | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [highlightedCode, setHighlightedCode] = useState("");
    const exportCardRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const controller = new AbortController();
        const getSnippet = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/get-snippet/${id}`,
                    {
                        method: "GET",
                        credentials: "include",
                        signal: controller.signal,
                    },
                );
                if (!res.ok) {
                    throw new Error("Unable to load snippet.");
                }
                const response = await res.json();
                if (response.status !== "success") {
                    throw new Error("Unable to load snippet.");
                }
                setSnippet(response.data);
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") {
                    return;
                }
                setError(
                    err instanceof Error
                        ? err.message
                        : "Something went wrong.",
                );
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };
        getSnippet();
        return () => controller.abort();
    }, [id]);
    useEffect(() => {
        if (!snippet?.code) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHighlightedCode("");
            return;
        }
        let cancelled = false;
        const highlightCode = async () => {
            try {
                const aliases: Record<string, string> = {
                    js: "javascript",
                    jsx: "jsx",
                    ts: "typescript",
                    tsx: "tsx",
                    py: "python",
                    html: "html",
                    css: "css",
                    scss: "scss",
                    json: "json",
                    md: "markdown",
                    sh: "bash",
                    shell: "bash",
                    yml: "yaml",
                    txt: "text",
                    plaintext: "text",
                    text: "text",
                    cpp: "cpp",
                    c: "c",
                    cs: "csharp",
                    kt: "kotlin",
                    rs: "rust",
                    go: "go",
                    java: "java",
                    php: "php",
                    sql: "sql",
                    xml: "xml",
                    graphql: "graphql",
                    vue: "vue",
                    svelte: "svelte",
                };
                const language = snippet.language.toLowerCase();
                const lang = aliases[language] || language;
                let html: string;
                try {
                    html = await codeToHtml(snippet.code, {
                        lang,
                        theme: "vitesse-dark",
                    });
                } catch {
                    html = await codeToHtml(snippet.code, {
                        lang: "text",
                        theme: "vitesse-dark",
                    });
                }
                if (!cancelled) {
                    setHighlightedCode(html);
                }
            } catch (err) {
                console.error("Shiki highlighting error:", err);
                if (!cancelled) {
                    setHighlightedCode("");
                }
            }
        };
        highlightCode();
        return () => {
            cancelled = true;
        };
    }, [snippet?.code, snippet?.language]);
    const handleCopy = async () => {
        if (!snippet?.code) return;
        try {
            await navigator.clipboard.writeText(snippet.code);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch {
            setError("Unable to copy code.");
        }
    };
    const handleDownloadPNG = async () => {
        if (!exportCardRef.current || !snippet) return;
        if (!highlightedCode) {
            setError("Code highlighting is still loading. Please try again.");
            return;
        }
        try {
            setDownloading(true);
            setError("");
            if ("fonts" in document) {
                await document.fonts.ready;
            }
            const dataUrl = await toPng(exportCardRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: "#121212",
                skipAutoScale: true,
            });
            const link = document.createElement("a");
            const filename = snippet.title
                .replace(/[^a-z0-9]/gi, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "")
                .toLowerCase();
            link.download = `${filename || "snippet"}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("PNG download error:", err);
            setError("Unable to generate PNG. Please try again.");
        } finally {
            setDownloading(false);
        }
    };
    const formatDate = (date?: string) => {
        if (!date) return "N/A";
        const parsedDate = new Date(date);
        if (Number.isNaN(parsedDate.getTime())) return "N/A";
        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(parsedDate);
    };
    if (loading) {
        return (
            <div className="p-5 space-y-5 animate-pulse">
                <div className="h-4 w-40 bg-muted rounded" />
                <div className="h-8 w-72 bg-muted rounded" />
                <div className="h-10 w-full bg-muted rounded" />
                <div className="h-72 w-full bg-muted rounded" />
            </div>
        );
    }
    if (!snippet) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 p-5">
                <div className="rounded-full bg-destructive/10 p-4">
                    <FileCode2 className="text-destructive size-7" />
                </div>
                <h2 className="text-lg font-semibold">Snippet unavailable</h2>
                <p className="text-sm text-muted-foreground text-center">
                    {error || "The requested snippet could not be found."}
                </p>
                <Button variant="outline" size="sm">
                    <Link href="/card">
                        <ArrowLeft className="size-4 mr-2" />
                        Back to snippets
                    </Link>
                </Button>
            </div>
        );
    }
    const lineCount = snippet.code
        ? snippet.code.split(/\r\n|\r|\n/).length
        : 1;
    const editorHeight = Math.min(Math.max(lineCount * 20 + 24, 120), 600);
    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink render={<Link href="/card" />}>
                            Snippets
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Snippet Details</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">
                            <Code2 className="size-3 mr-1" />
                            {snippet.language}
                        </Badge>
                        {snippet.isFavorite && (
                            <Badge variant="outline">
                                <Star className="size-3 mr-1" />
                                Favorite
                            </Badge>
                        )}
                        {snippet.isPinned && (
                            <Badge variant="outline">
                                <Pin className="size-3 mr-1" />
                                Pinned
                            </Badge>
                        )}
                        <Badge variant="outline">
                            {snippet.isPublic ? (
                                <>
                                    <Globe className="size-3 mr-1" />
                                    Public
                                </>
                            ) : (
                                <>
                                    <Lock className="size-3 mr-1" />
                                    Private
                                </>
                            )}
                        </Badge>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold capitalize break-words">
                        {snippet.title}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        View and manage your saved code snippet.
                    </p>
                </div>
                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                        {copied ? (
                            <Check className="size-4 mr-2" />
                        ) : (
                            <Copy className="size-4 mr-2" />
                        )}
                        {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadPNG}
                        disabled={downloading || !highlightedCode}
                    >
                        <Download className="size-4 mr-2" />
                        {downloading
                            ? "Generating..."
                            : !highlightedCode
                              ? "Preparing..."
                              : "Download PNG"}
                    </Button>
                    <Button size="sm">
                        <Pencil className="size-4 mr-2" />
                        <Link href={`/card/edit/${id}`}>Edit</Link>
                    </Button>
                </div>
            </div>
            {/* Download error */}
            {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}
            <Separator />
            {/* Monaco Editor */}
            <section className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <FileCode2 className="size-4 text-muted-foreground" />
                        <h2 className="font-semibold text-sm">Source Code</h2>
                        <Badge variant="secondary">{lineCount} Lines</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground uppercase">
                        {snippet.language}
                    </span>
                </div>
                <div className="border rounded-xl overflow-hidden bg-[#1e1e1e]">
                    <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border/20">
                        <div className="flex items-center gap-2">
                            <div className="size-2.5 rounded-full bg-red-500" />
                            <div className="size-2.5 rounded-full bg-yellow-500" />
                            <div className="size-2.5 rounded-full bg-green-500" />
                            <span className="text-xs text-muted-foreground ml-2">
                                {snippet.title}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={handleCopy}
                        >
                            {copied ? (
                                <Check className="size-4" />
                            ) : (
                                <Copy className="size-4" />
                            )}
                        </Button>
                    </div>
                    <Editor
                        theme="vs-dark"
                        value={snippet.code}
                        language={snippet.language}
                        height={`${editorHeight}px`}
                        options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            codeLens: true,
                            lineNumbers: "on",
                            folding: true,
                            wordWrap: "on",
                            fontSize: 15,
                            mouseWheelZoom: true,
                            lineHeight: 20,
                            padding: {
                                top: 12,
                                bottom: 12,
                            },
                        }}
                        loading={
                            <div className="p-5 text-sm text-muted-foreground">
                                Loading editor...
                            </div>
                        }
                    />
                </div>
            </section>
            {/* Description */}
            {snippet.description && (
                <section className="space-y-3">
                    <div className="flex items-center gap-2">
                        <FileCode2 className="size-4 text-muted-foreground" />
                        <h2 className="font-semibold text-sm">Description</h2>
                    </div>
                    <div className="border rounded-xl p-4 md:p-5 bg-card">
                        <p className="text-sm leading-7 whitespace-pre-wrap break-words text-muted-foreground">
                            {snippet.description}
                        </p>
                    </div>
                </section>
            )}
            {/* Tags */}
            <section className="space-y-3">
                <div className="flex items-center gap-2">
                    <Tag className="size-4 text-muted-foreground" />
                    <h2 className="font-semibold text-sm">Tags</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                    {snippet.tags?.length ? (
                        snippet.tags.map((tag, index) => (
                            <Badge
                                key={`${tag}-${index}`}
                                variant="secondary"
                                className="font-normal"
                            >
                                <Hash className="size-3 mr-1" />
                                {tag}
                            </Badge>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No tags added.
                        </p>
                    )}
                </div>
            </section>
            <Separator />
            {/* Metadata */}
            <section className="space-y-4">
                <h2 className="font-semibold text-sm">Snippet Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <MetadataItem
                        icon={<CalendarDays />}
                        label="Created At"
                        value={formatDate(snippet.createdAt)}
                    />
                    <MetadataItem
                        icon={<Clock />}
                        label="Last Updated"
                        value={formatDate(snippet.updatedAt)}
                    />
                    <MetadataItem
                        icon={<Hash />}
                        label="Version"
                        value={`v${snippet.version}`}
                    />
                </div>
            </section>
            <Separator />
            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground">
                <p>Snippet ID: {snippet._id}</p>
                <p>Saved in Kodhra</p>
            </div>
            {/* ===================================== */}
            {/* PNG EXPORT CARD */}
            {/* ===================================== */}
            <div
                aria-hidden="true"
                className="fixed left-[-10000px] top-0 pointer-events-none"
            >
                <div
                    ref={exportCardRef}
                    className="w-[900px] p-10 bg-[#121212] text-white space-y-7"
                    style={{
                        fontFamily: "Arial, sans-serif",
                    }}
                >
                    {/* Export Header */}
                    <div className="flex items-start justify-between gap-5">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="bg-white text-black rounded-lg size-10 flex items-center justify-center">
                                    <Code2 size={22} />
                                </div>
                                <span className="font-bold text-xl">
                                    Kodhra
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold break-words">
                                {snippet.title}
                            </h1>
                            <p className="text-sm text-gray-400 mt-2 capitalize">
                                {snippet.language} · Version {snippet.version}
                            </p>
                        </div>
                        <div className="bg-white/10 px-4 py-2 rounded-lg text-xs font-medium text-gray-300">
                            CODE SNIPPET
                        </div>
                    </div>
                    {/* Highlighted Code */}
                    <div className="rounded-xl overflow-hidden border border-white/10">
                        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-2 bg-white/[0.03]">
                            <div className="size-3 rounded-full bg-red-500" />
                            <div className="size-3 rounded-full bg-yellow-500" />
                            <div className="size-3 rounded-full bg-green-500" />
                            <span className="text-gray-400 text-xs ml-3">
                                {snippet.language}
                            </span>
                        </div>
                        <div
                            className="overflow-hidden text-sm [&_.shiki]:!m-0 [&_.shiki]:!p-6 [&_.shiki]:!bg-[#121212] [&_.shiki_code]:!font-mono [&_.shiki_code]:!text-[13px] [&_.shiki_code]:!leading-6 [&_.shiki_code]:!whitespace-pre-wrap [&_.shiki_code]:!break-words"
                            dangerouslySetInnerHTML={{
                                __html: highlightedCode,
                            }}
                        />
                    </div>
                    {/* Description */}
                    {snippet.description && (
                        <div className="space-y-3">
                            <h2 className="text-lg font-bold">Description</h2>
                            <p className="text-sm text-gray-300 leading-7 whitespace-pre-wrap break-words">
                                {snippet.description}
                            </p>
                        </div>
                    )}
                    {/* Tags */}
                    {snippet.tags?.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-lg font-bold">Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {snippet.tags.map((tag, index) => (
                                    <span
                                        key={`${tag}-${index}`}
                                        className="px-3 py-2 bg-white/10 text-gray-300 rounded-md text-sm"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Footer */}
                    <div className="border-t border-white/10 pt-5 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold">
                                Created with Kodhra
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {formatDate(snippet.createdAt)}
                            </p>
                        </div>
                        <p className="text-xs text-gray-500">{snippet._id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
function MetadataItem({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="border rounded-lg p-4 flex items-center gap-3 min-w-0">
            <div className="size-9 rounded-md bg-muted flex items-center justify-center shrink-0 [&>svg]:size-4">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium truncate">{value}</p>
            </div>
        </div>
    );
}
