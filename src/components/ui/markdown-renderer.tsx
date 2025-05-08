"use client";

import React from "react";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({
  content,
  className,
}: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none text-gray-900 dark:text-gray-100",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Override default element styling
          h1: ({ node, ...props }) => (
            <h1
              className="text-xl font-bold my-3 text-gray-900 dark:text-white"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-lg font-bold my-2.5 text-gray-900 dark:text-white"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-md font-bold my-2 text-gray-900 dark:text-white"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="font-bold my-1.5 text-gray-900 dark:text-white"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p
              className="my-1.5 text-sm leading-relaxed text-gray-800 dark:text-gray-200"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc pl-5 my-2 space-y-1 text-gray-800 dark:text-gray-200"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal pl-5 my-2 space-y-1 text-gray-800 dark:text-gray-200"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li
              className="my-0.5 text-sm text-gray-800 dark:text-gray-200"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-500/50 pl-3 italic my-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 py-1 rounded-r"
              {...props}
            />
          ),
          code: ({ node, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && (props.inline || false);

            if (isInline) {
              return (
                <code
                  className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto my-3 text-sm border border-gray-200 dark:border-gray-700">
                <code
                  className="font-mono text-gray-800 dark:text-gray-200"
                  {...props}
                >
                  {children}
                </code>
              </pre>
            );
          },
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-3 border border-gray-300 dark:border-gray-700 rounded-md">
              <table
                className="min-w-full divide-y divide-gray-300 dark:divide-gray-700"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead
              className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
              {...props}
            />
          ),
          tbody: ({ node, ...props }) => (
            <tbody
              className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900"
              {...props}
            />
          ),
          tr: ({ node, ...props }) => (
            <tr
              className="even:bg-gray-50 dark:even:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/80"
              {...props}
            />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="px-3 py-2 text-sm border-t border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr
              className="my-4 border-t border-gray-300 dark:border-gray-700"
              {...props}
            />
          ),
          img: ({ node, ...props }) => (
            <img
              className="max-w-full h-auto rounded-md my-3 border border-gray-200 dark:border-gray-700 shadow-sm"
              loading="lazy"
              {...props}
              alt={props.alt || ""}
            />
          ),
          strong: ({ node, ...props }) => (
            <strong
              className="font-bold text-gray-900 dark:text-white"
              {...props}
            />
          ),
          em: ({ node, ...props }) => (
            <em
              className="italic text-gray-800 dark:text-gray-200"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
