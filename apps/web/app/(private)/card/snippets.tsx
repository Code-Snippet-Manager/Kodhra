"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { clsx } from "cn";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
const PAGE_SIZE = 10;
const INITIAL_FILTERS = {
  language: "all",
  searchText: "",
  tags: "",
  folder: "all",
  isFavorite: "all",
  isPinned: "all",
  isPublic: "all",
  isDeleted: "false",
  version: "",
};
type Filters = typeof INITIAL_FILTERS;
export default function SnippetPage() {
  const [snippets, setSnippets] = useState<Snippets[]>([]);
  const [language, setLanguage] = useState<{ count: number; language: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters | null>(null);
  const activeFilterCount = useMemo(() => {
    if (!appliedFilters) return 0;

    return Object.entries(appliedFilters).filter(([key, value]) => {
      return value !== INITIAL_FILTERS[key as keyof Filters];
    }).length;
  }, [appliedFilters]);
  const requestId = useRef(0);
  const isFiltered = appliedFilters !== null;
  const fetchSnippets = useCallback(async () => {
    const currentRequest = ++requestId.current;
    try {
      setLoading(pageNumber === 1);
      setLoadingMore(pageNumber > 1);
      const endpoint = isFiltered
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/filter-snippets?page=${pageNumber}&limit=${PAGE_SIZE}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/get-snippets?page=${pageNumber}&limit=${PAGE_SIZE}`;
      const res = await fetch(endpoint, {
        method: isFiltered ? "POST" : "GET",
        headers: isFiltered ? { "Content-Type": "application/json" } : undefined,
        credentials: "include",
        body: isFiltered ? JSON.stringify(appliedFilters) : undefined,
      });
      if (!res.ok) {
        throw new Error("Failed to fetch snippets");
      }
      const data = await res.json();
      if (currentRequest !== requestId.current) return;
      const newSnippets: Snippets[] = data.data ?? [];
      setSnippets((prev) =>
        pageNumber === 1
          ? newSnippets
          : [
              ...prev,
              ...newSnippets.filter((item) => !prev.some((existing) => existing._id === item._id)),
            ],
      );
      setHasMore(newSnippets.length === PAGE_SIZE);
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      console.error("Snippet fetching error:", error);
      toast.add({
        title: "Unable to load snippets",
        type: "error",
      });
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [pageNumber, isFiltered, appliedFilters]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSnippets();
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      requestId.current++;
    };
  }, [fetchSnippets]);
  useEffect(() => {
    const controller = new AbortController();
    const getLanguage = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-report-by-language`, {
          method: "GET",
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error("Failed to fetch language report");
        }
        const data = await res.json();
        setLanguage(data.data ?? []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Language report error:", error);
        }
      }
    };
    getLanguage();
    return () => controller.abort();
  }, []);
  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setPageNumber(1);
    setHasMore(true);
    setOpenFilterDialog(false);
  };
  const handleResetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(null);
    setSelectedLanguage("all");
    setPageNumber(1);
    setHasMore(true);
    setOpenFilterDialog(false);
  };
  const displayedSnippets =
    selectedLanguage === "all"
      ? snippets
      : snippets.filter((item) => item.language === selectedLanguage);
  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };
  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasMore) {
      setPageNumber((prev) => prev + 1);
    }
  };
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  return (
    <main className="p-3">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        {/* Language filters */}
        <div className="mr-2 flex flex-1 gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-sidebar">
          <Button
            variant={"outline"}
            onClick={() => handleLanguageChange("all")}
            className={clsx(
              "flex items-center whitespace-nowrap rounded-2xl px-3 py-1 text-xs capitalize transition-discrete",
              selectedLanguage === "all"
                ? "font-extrabold"
                : "",
            )}
          >
            All
            <Badge variant="secondary" className="ml-2 text-xs">
              {snippets.length}
            </Badge>
          </Button>
          {language.map((item) => (
            <Button
              variant={"outline"}
              key={item.language}
              onClick={() => handleLanguageChange(item.language)}
              className={clsx(
                "flex items-center whitespace-nowrap rounded-2xl px-3 py-1 text-xs capitalize transition-colors",
               selectedLanguage === item.language
                ? "font-bold"
                : "",
              )}
            >
              {item.language}
              <Badge variant="secondary" className="ml-2 text-xs">
                {item.count}
              </Badge>
            </Button>
          ))}
        </div>
        {/* Advanced filters */}
        <Button variant="outline" onClick={() => setOpenFilterDialog(true)}>
          <SlidersHorizontal className="size-4" />
          {Boolean(activeFilterCount) ? "Filters" : "Filter"}
          {Boolean(activeFilterCount) && <Badge>{activeFilterCount}</Badge>}
        </Button>
      </div>
      {/* Active filter indicator */}
      {isFiltered && (
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Advanced filters are active.</p>
          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            Clear filters
          </Button>
        </div>
      )}
      {/* Snippet cards */}
      <div className="columns-1 gap-3 md:columns-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {displayedSnippets.map((item) => (
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
              }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="mb-3 break-inside-avoid"
            >
              <SnippetCard item={item} snippetMenu={snippetMenu} setSnippets={setSnippets} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {/* Loading */}
      {(loading || loadingMore) && (
        <div className="m-3 flex justify-center">
          <p className="text-sm text-muted-foreground">Loading snippets...</p>
        </div>
      )}
      {/* Empty state */}
      {!loading && displayedSnippets.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">No snippets found.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try changing your filters or search criteria.
          </p>
        </div>
      )}
      {/* Load more */}
      {displayedSnippets.length > 0 && (
        <div className="m-3 flex justify-center">
          <Button
            onClick={handleLoadMore}
            disabled={!hasMore || loading || loadingMore}
            variant="ghost"
          >
            {loadingMore ? "Loading..." : hasMore ? "Load More" : "No More Snippets"}
          </Button>
        </div>
      )}
      {/* Filter dialog */}
      <Dialog open={openFilterDialog} onOpenChange={setOpenFilterDialog}>
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          {/* Header */}
          <DialogHeader className="flex flex-row items-center gap-3 border-b px-6 py-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <SlidersHorizontal className="size-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">Advanced Filters</DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                Refine your snippets with custom filters.
              </DialogDescription>
            </div>
          </DialogHeader>
          {/* Content */}
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {/* Search */}
            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold">Search</h3>
                <p className="text-xs text-muted-foreground">Find snippets by their content.</p>
              </div>
              <Field>
                <FieldLabel>Contains text</FieldLabel>
                <Textarea
                  placeholder="Search title, description or code..."
                  value={filters.searchText}
                  rows={2}
                  className="resize-none"
                  onChange={(e) => updateFilter("searchText", e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel>Tags</FieldLabel>
                <Input
                  placeholder="e.g. react, hooks, api"
                  value={filters.tags}
                  onChange={(e) => updateFilter("tags", e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  Separate multiple tags with commas.
                </p>
              </Field>
            </section>
            <div className="border-t" />
            {/* Content and organization */}
            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold">Content & Organization</h3>
                <p className="text-xs text-muted-foreground">
                  Filter by language, folder and version.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>Language</FieldLabel>
                  <Select
                    value={filters.language}
                    onValueChange={(value) => updateFilter("language", value as string)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All languages</SelectItem>
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
                  <FieldLabel>Folder</FieldLabel>
                  <Select
                    value={filters.folder}
                    onValueChange={(value) => updateFilter("folder", value as string)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All folders</SelectItem>
                      <SelectItem value="none">No folder</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Version</FieldLabel>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Any version"
                    value={filters.version}
                    onChange={(e) => updateFilter("version", e.target.value)}
                  />
                </Field>
              </div>
            </section>
            <div className="border-t" />
            {/* Preferences */}
            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold">Preferences</h3>
                <p className="text-xs text-muted-foreground">
                  Narrow results using snippet properties.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Favorite */}
                <Field>
                  <Label>Favorite</Label>
                  <Select
                    value={filters.isFavorite}
                    onValueChange={(value) => updateFilter("isFavorite", value as string)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All snippets</SelectItem>
                      <SelectItem value="true">Favorites only</SelectItem>
                      <SelectItem value="false">Not favorites</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                {/* Pinned */}
                <Field>
                  <Label>Pinned</Label>
                  <Select
                    value={filters.isPinned}
                    onValueChange={(value) => updateFilter("isPinned", value as string)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All snippets</SelectItem>
                      <SelectItem value="true">Pinned only</SelectItem>
                      <SelectItem value="false">Not pinned</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                {/* Visibility */}
                <Field>
                  <Label>Visibility</Label>
                  <Select
                    value={filters.isPublic}
                    onValueChange={(value) => updateFilter("isPublic", value as string)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All visibility</SelectItem>
                      <SelectItem value="true">Public</SelectItem>
                      <SelectItem value="false">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                {/* Deleted */}
                <Field>
                  <Label>Deleted</Label>
                  <Select
                    value={filters.isDeleted}
                    onValueChange={(value) => updateFilter("isDeleted", value as string)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="false">Active</SelectItem>
                      <SelectItem value="true">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </section>
          </div>
          {/* Footer */}
          <DialogFooter className="flex-row items-center justify-around border-t mb-0 ">
            <Button variant="ghost" size="sm" onClick={handleResetFilters}>
              Reset filters
            </Button>
            <div className="flex gap-2 px-3">
              <Button variant="outline" size="sm" onClick={() => setOpenFilterDialog(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleApplyFilters}>
                Apply Filters
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
