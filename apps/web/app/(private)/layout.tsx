"use client";
import AppHeader from "@/components/layout/AppHeader";
import Sidebar from "@/components/layout/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { LoaderCircle } from "lucide-react";
import { Inter } from "next/font/google";
import { redirect } from "next/navigation";
import React from "react";
const inter = Inter({ subsets: ["latin"] });
export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex h-screen w-full justify-center items-center gap-2">
        <LoaderCircle className="animate-spin" size={20} />
        Loading...
      </div>
    );
  }
  if (!session) {
    redirect("/login");
  }
  return (
    <div className={`${inter.className} w-full h-full flex justify-start max-w-360 mx-auto`}>
      <Sidebar />
      <main className="flex-1 h-screen overflow-x-auto scrollbar-thin scroll-bar-thumb-gray-300">
        <AppHeader />
        <TooltipProvider>{children}</TooltipProvider>
      </main>
    </div>
  );
}
