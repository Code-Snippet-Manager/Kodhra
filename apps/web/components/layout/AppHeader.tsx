"use client";
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
import { authClient } from "@/lib/auth-client";
import {
  ArrowLeft,
  Bell,
  LayoutDashboard,
  LogOut,
  Mic,
  Search,
  Settings,
  SlidersHorizontal,
  UserCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaGithub } from "react-icons/fa";
export default function AppHeader() {
  const { data: session } = authClient.useSession();
  const pathName = usePathname();
  return (
    <header className="sticky top-0 h-13.75 border-b flex items-center px-2 justify-between bg-white/50 backdrop-blur-2xl z-10">
      {pathName !== "/dashboard" && (
        <Button variant={"ghost"} onClick={() => window.history.back()}>
          <ArrowLeft />
          <span>Back</span>
        </Button>
      )}
      <FieldSet>
        <Field orientation="horizontal">
          <InputGroup>
            <InputGroupInput placeholder="Search..." />
            <InputGroupAddon align="inline-start">
              <Search />
            </InputGroupAddon>
            <InputGroupButton>
              <Mic />
            </InputGroupButton>
          </InputGroup>
          <Button variant={"default"}>
            <Search /> Search
          </Button>
        </Field>
      </FieldSet>
      <div className="flex items-center gap-3">
        <Button variant={"ghost"} className={"w-10 h-10 rounded-full "}>
          <Bell size={24} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant={"ghost"} className={"rounded-full"} />}>
            <Avatar>
              {session?.user?.image && <AvatarImage src={session?.user?.image} alt="@shadcn" />}
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-50">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
                  <UserCheck size={16} />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/dashboard/profile/edit"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <UserRound size={16} />
                  Edit Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
                  <Settings size={16} />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="/dashboard/preferences"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <SlidersHorizontal size={16} />
                  Preferences
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href="https://github.com"
                  target="_blank"
                  className="flex items-center gap-2 cursor-pointer"
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
