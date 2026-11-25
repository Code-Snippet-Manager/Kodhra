import AuthHeader from "@/components/layout/AuthHeader";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div >
      <AuthHeader />
      <main>{children}</main>
    </div>
  );
}
