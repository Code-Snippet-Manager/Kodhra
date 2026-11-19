import Sidebar from "@/components/layout/sidebar";
import { Inter } from "next/font/google";

const interFont = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className={interFont.className}>
      <Sidebar />
    </main>
  );
}
