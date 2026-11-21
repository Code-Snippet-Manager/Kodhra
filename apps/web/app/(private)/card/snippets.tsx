"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import SnippetCard from "@/components/ui/snippet-card";
import { toast } from "@/components/ui/toast";
import { snippetMenu } from "@/lib/snippet/snippet-menu";

import type { Snippets } from "@/types/snippet";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clsx } from "cn";
import { Field, FieldLabel, FieldSet } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const PAGE_SIZE = 10;

export default function SnippetPage() {
  const [snippets, setSnippets] = useState<Snippets[]>([]);
  const [loading, setLoading] = useState(false);

  const [language, setLanguage] = useState<{ count: number; language: string }[]>([]);

  const [selectedLanguage, setSelectedLanguage] = useState("all");

  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch snippets
  useEffect(() => {
    const getSnippets = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/get-snippets?page=${pageNumber}&limit=${PAGE_SIZE}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch snippets");
        }

        const data = await res.json();

        if (data.data.length < PAGE_SIZE) {
          setHasMore(false);
        }

        // Update snippets without using stale state
        setSnippets((prev) => (pageNumber === 1 ? data.data : [...prev, ...data.data]));
      } catch (error) {
        console.error(error);

        toast.add({
          title: "Unable to load snippets",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    getSnippets();
  }, [pageNumber]);

  // Fetch language report
  useEffect(() => {
    const getLanguage = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-report-by-language`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch language report");
        }

        const data = await res.json();

        setLanguage(data.data);
      } catch (error) {
        console.error("Language report error:", error);
      }
    };

    getLanguage();
  }, []);

  // Filter snippets by language
  const filteredSnippets =
    selectedLanguage === "all"
      ? snippets
      : snippets.filter((item) => item.language?.toLowerCase() === selectedLanguage.toLowerCase());

  // Load more snippets
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPageNumber((prev) => prev + 1);
    }
  };

  return (
    <main className="p-3">
      {/* Header */}
      <div className="mb-3 flex justify-between items-center">
        {/* Filter by language */}
        <div className="flex flex-1 gap-2 overflow-x-auto mr-4 scrollbar-thin scrollbar-thumb-sidebar">
          {/* All languages */}
          <button
            onClick={() => setSelectedLanguage("all")}
            className={`text-xs flex items-center rounded-2xl px-3 py-1 capitalize whitespace-nowrap transition-colors ${
              selectedLanguage === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-accent hover:bg-accent/70"
            }`}
          >
            All
            <Badge
              className={clsx(
                "ml-2 text-xs",
                selectedLanguage === "all" ? "bg-primary text-primary-foreground" : "",
              )}
              variant="outline"
            >
              {snippets.length}
            </Badge>
          </button>

          {language.map((item) => (
            <button
              key={item.language}
              onClick={() => setSelectedLanguage(item.language)}
              className={`text-xs flex items-center rounded-2xl px-3 py-1 capitalize whitespace-nowrap transition-colors ${
                selectedLanguage === item.language
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent hover:bg-accent/70"
              }`}
            >
              {item.language}

              <Badge
                className={clsx(
                  "ml-2 text-xs",
                  item.language === selectedLanguage ? "bg-primary text-primary-foreground" : "",
                )}
                variant="outline"
              >
                {item.count}
              </Badge>
            </button>
          ))}
        </div>

        {/* Advanced filters */}
        <Button variant="outline" onClick={() => setOpenFilterDialog(true)}>
          <SlidersHorizontal />
        </Button>
      </div>

      {/* Snippet Cards */}
      <div className="columns-1 md:columns-2 gap-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredSnippets.map((item) => (
            <motion.div
              key={item._id}
              layout
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -20,
                scale: 0.95,
                transition: {
                  duration: 0.25,
                  ease: "easeInOut",
                },
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
                layout: {
                  duration: 0.4,
                  ease: "easeInOut",
                },
              }}
              className="mb-3 break-inside-avoid"
            >
              <SnippetCard item={item} snippetMenu={snippetMenu} setSnippets={setSnippets} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center m-3">
          <p className="text-sm text-muted-foreground">Loading snippets...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && filteredSnippets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground text-sm">No snippets found.</p>
        </div>
      )}

      {/* Load More */}
      <div className="flex justify-center m-3">
        <Button onClick={handleLoadMore} disabled={!hasMore || loading} variant="ghost">
          {loading ? "Loading..." : hasMore ? "Load More" : "No More Snippets"}
        </Button>
      </div>

      {/* Filter Dialog */}
      <Dialog open={openFilterDialog} onOpenChange={setOpenFilterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter</DialogTitle>
            <DialogDescription>Filter by language, tags and many more options.</DialogDescription>
          </DialogHeader>
          <FieldSet>
            <Field>
              <FieldLabel>Language</FieldLabel>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All</SelectItem>
                    {language.map((item) => (
                      <SelectItem key={item.language} value={item.language}>
                        {item.language}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
                <FieldLabel>Text Containes with</FieldLabel>
                <Textarea placeholder="Enter text" />
            </Field>
          </FieldSet>
        </DialogContent>
      </Dialog>
    </main>
  );
}
