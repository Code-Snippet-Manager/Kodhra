import CreateSnippet from "@/app/(private)/card/create/create-snippet";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Snippet | Kodhra",
  description: "Create Snippet",
};

export const instant = false;
export default function Page() {
  return <CreateSnippet />;
}
