import EditSnippet from "@/app/(private)/card/edit/[id]/edit-snippet";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Edit Snippet | Kodhra",
  description:
    "Edit and manage your code snippets on Kodhra. Update snippet titles, descriptions, programming languages, tags, and code effortlessly.",
};
export default function Page() {
  return <EditSnippet/>;
}
