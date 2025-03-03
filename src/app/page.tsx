import Image from "next/image";

import { auth } from "@/auth";
import { ChevronRight, ChevronRightSquare } from "lucide-react";
import { Metadata } from "next";
import { signOut } from "next-auth/react";

import BlurText from "@/components/react-bits/text-animations/BlurText/BlurText";
import TrueFocus from "@/components/react-bits/text-animations/TrueFocus/TrueFocus";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "EduForge - Your Next Education Platform",
  description:
    "EduForge is a platform for educators and students to collaborate and learn together.",
};

export default async function Home() {
  const session = await auth();
  //use session to get data https://www.youtube.com/watch?v=nwn2lwYZG2M&ab_channel=H%E1%BB%8FiD%C3%A2nIT
  // 30:00
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div>hello {JSON.stringify(session?.user?.name)}</div>

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
          {/* <div>
            <Button
              onClick={handleSignOut}
              className="w-full bg-red-500 text-white hover:bg-red-600"
            >
              Đăng xuất
            </Button>
          </div> */}
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
