"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldSet } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import {
  ArrowLeft,
  Bell,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mic,
  MicOff,
  Search,
  Settings,
  SlidersHorizontal,
  UserCheck,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { toast } from "@/components/ui/toast";
type SearchSnippetType = {
  _id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  author: string;
  version: number;
  isFavorite: boolean;
  isPinned: boolean;
  isPublic: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
};
export default function AppHeader() {
  const { data: session } = authClient.useSession();
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();
  const pathname = usePathname();
  const [searchValue, setSearchValue] = useState("");
  const [searchResult, setSearchResult] = useState<SearchSnippetType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchRef = useRef<HTMLFieldSetElement>(null);
  useEffect(() => {
    if (listening) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchValue(transcript);
    }
  }, [transcript, listening]);
  const searchSnippets = useCallback(async (value: string) => {
    if (!value.trim()) {
      setSearchResult([]);
      setIsLoading(false);
      return;
    }
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      setIsLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search-snippet?search=${encodeURIComponent(value)}`,
        {
          credentials: "include",
          signal: controller.signal,
        },
      );
      if (!res.ok) {
        throw new Error("Failed to fetch search results");
      }
      const data = await res.json();
      if (!controller.signal.aborted) {
        setSearchResult(data.data);
        setIsSearchOpen(true);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error("Search error:", error);
      toast.add({
        title: "Error Fetching",
        description: "Unable to fetch search results. Please try again.",
        type: "error",
      });
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);
  const debounceSearch = useCallback(
    (value: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (!value.trim()) {
        abortControllerRef.current?.abort();
        setSearchResult([]);
        setIsLoading(false);
        setIsSearchOpen(false);
        return;
      }
      timerRef.current = setTimeout(() => {
        searchSnippets(value);
      }, 300);
    },
    [searchSnippets],
  );
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setIsSearchOpen(true);
    debounceSearch(value);
  };
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    if (listening) {
      await SpeechRecognition.stopListening();
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    searchSnippets(searchValue);
    setIsSearchOpen(true);
  };
  const handleVoiceSearch = async () => {
    if (listening) {
      await SpeechRecognition.stopListening();
      return;
    }
    if (!browserSupportsSpeechRecognition) {
      toast.add({
        title: "Not Supported",
        description: "Your browser does not support speech recognition.",
        type: "error",
      });
      return;
    }
    if (!isMicrophoneAvailable) {
      toast.add({
        title: "Microphone Unavailable",
        description: "Please allow microphone access.",
        type: "error",
      });
      return;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    resetTranscript();
    setSearchValue("");
    setSearchResult([]);
    setIsSearchOpen(true);
    try {
      await SpeechRecognition.startListening({
        continuous: true,
        language: "en-IN",
      });
    } catch (error) {
      console.error("Voice search error:", error);
    }
  };
  const handleClearSearch = () => {
    setSearchValue("");
    setSearchResult([]);
    setIsSearchOpen(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    abortControllerRef.current?.abort();
    resetTranscript();
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      abortControllerRef.current?.abort();
      SpeechRecognition.stopListening();
    };
  }, []);
  return (
    <header className="sticky top-0 h-13.75 border-b flex items-center px-2 justify-between bg-white/50 backdrop-blur-2xl z-10 dark:bg-black/50">
      {/* Back Button */}
      {pathname !== "/dashboard" && (
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft />
          <span>Back</span>
        </Button>
      )}
      {/* Search */}
      <FieldSet className="w-[40%] max-w-125 min-w-25 relative" ref={searchRef}>
        <form onSubmit={handleSearch}>
          <Field orientation="horizontal">
            <InputGroup>
              <InputGroupInput
                placeholder="Search snippets..."
                autoComplete="off"
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchValue.trim()) {
                    setIsSearchOpen(true);
                  }
                }}
              />
              <InputGroupAddon align="inline-start">
                <Search />
              </InputGroupAddon>
              {/* Clear Search */}
              {searchValue && (
                <InputGroupButton type="button" onClick={handleClearSearch} title="Clear search">
                  <X />
                </InputGroupButton>
              )}
              {/* Voice Search */}
              <InputGroupButton
                type="button"
                onClick={handleVoiceSearch}
                disabled={!browserSupportsSpeechRecognition}
                title={listening ? "Stop voice search" : "Start voice search"}
                className={listening ? "text-red-500" : ""}
              >
                {listening ? <MicOff /> : <Mic />}
                {listening && (
                  <span className="flex items-center">
                    Listening
                    <span className="animate-caret-blink">...</span>
                  </span>
                )}
              </InputGroupButton>
            </InputGroup>
            <Button type="submit" disabled={!searchValue.trim()}>
              {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
              Search
            </Button>
          </Field>
        </form>
        {/* Search Results Dropdown */}
        {isSearchOpen && searchValue.trim() && (
          <Card className="absolute top-full w-full mt-3 z-50 shadow-lg">
            <CardContent className="p-2">
              {/* Loading */}
              {isLoading && (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="animate-spin size-4" />
                  Searching...
                </div>
              )}
              {/* Results */}
              {!isLoading && searchResult.length > 0 && (
                <ul className="max-h-80 overflow-y-auto">
                  {searchResult.map((item) => (
                    <li
                      key={item._id}
                      className="px-2 py-1 rounded-md hover:bg-muted cursor-pointer"
                    >
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.language}</p>
                    </li>
                  ))}
                </ul>
              )}
              {/* Empty State */}
              {!isLoading && searchResult.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-4">No snippets found.</p>
              )}
            </CardContent>
          </Card>
        )}
      </FieldSet>
      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="w-10 h-10 rounded-full">
          <Bell size={24} />
        </Button>
        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="w-10 h-10 rounded-full">
                <Avatar>
                  {session?.user?.image && <AvatarImage src={session.user.image} alt="Profile" />}
                  <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-50">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link
                  href="/dashboard/profile"
                  className="flex items-center gap-2 cursor-pointer w-full"
                >
                  <UserCheck size={16} />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/dashboard/profile/edit"
                  className="flex items-center gap-2 cursor-pointer w-full"
                >
                  <UserRound size={16} />
                  Edit Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2 cursor-pointer w-full"
                >
                  <Settings size={16} />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/dashboard/preferences"
                  className="flex items-center gap-2 cursor-pointer w-full"
                >
                  <SlidersHorizontal size={16} />
                  Preferences
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer w-full">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="https://github.com/codewithajoydas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 cursor-pointer w-full"
                >
                  <FaGithub size={16} />
                  GitHub
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => authClient.signOut()}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <LogOut size={16} />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
