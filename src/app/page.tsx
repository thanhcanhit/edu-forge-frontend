import Image from "next/image";

import { ChevronRight, ChevronRightSquare } from "lucide-react";
import { Metadata } from "next";

import BlurText from "@/components/react-bits/text-animations/BlurText/BlurText";
import TrueFocus from "@/components/react-bits/text-animations/TrueFocus/TrueFocus";

export const metadata: Metadata = {
  title: "EduForge - Your Next Education Platform",
  description:
    "EduForge is a platform for educators and students to collaborate and learn together.",
};

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <TrueFocus
          sentence="Edu Forge"
          manualMode={false}
          blurAmount={5}
          borderColor="orange"
          animationDuration={1}
          pauseBetweenAnimations={2}
        />

        <div className="flex gap-4 items-center flex-col sm:flex-row ">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gay now
            <ChevronRight />
          </a>
        </div>
      </main>
    </div>
  );
}
