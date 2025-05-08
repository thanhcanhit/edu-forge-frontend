import Link from "next/link";

import { ArrowLeft } from "lucide-react";

export default function AIExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại</span>
            </Link>
            <span className="text-muted-foreground mx-2">|</span>
            <h1 className="font-semibold text-lg">EduForge AI Examples</h1>
          </div>
          <nav>
            <ul className="flex gap-4">
              <li>
                <Link
                  href="/docs/ai-integration-guide"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tài liệu
                </Link>
              </li>
              <li>
                <Link href="/examples/ai" className="text-primary font-medium">
                  Ví dụ
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} EduForge. Ví dụ tích hợp AI với
          Gemini.
        </div>
      </footer>
    </div>
  );
}
