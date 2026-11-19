import AuthHeader from "@/components/layout/AuthHeader";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-50">
      <AuthHeader />
      <main>{children}</main>
    </div>
  );
}
