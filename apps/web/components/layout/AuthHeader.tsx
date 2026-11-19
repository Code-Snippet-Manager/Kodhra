"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
const routes: string[] = [
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-otp",
];
export default function AuthHeader() {
  const pathname = usePathname();
  return (
    <header className="flex items-center sticky top-0 justify-start  px-4 py-2 gap-5">
      {routes.includes(pathname) && (
        <Button variant={"ghost"} onClick={() => window.history.back()}>
          <ChevronLeft />
          <span>Back</span>
        </Button>
      )}
      {/* logo */}
      <div className="flex items-center gap-1">
        <Image src="/icons/kodhra.webp" alt="logo" width={30} height={30} />
        <div className="flex flex-col leading-none">
          <span className="font-bold">Kodhra</span>
          <span className="text-xs">Code Snippet Manager</span>
        </div>
      </div>
      {/* logo end */}
    </header>
  );
}
