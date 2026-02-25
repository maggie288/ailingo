"use client";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { Components } from "react-markdown";

const components: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const code = String(children).replace(/\n$/, "");
    if (match) {
      return (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          customStyle={{
            margin: "0.75rem 0",
            borderRadius: 8,
            fontSize: "0.875rem",
          }}
          codeTagProps={{ style: {} }}
        >
          {code}
        </SyntaxHighlighter>
      );
    }
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-foreground text-sm"
        {...props}
      >
        {children}
      </code>
    );
  },
  h1: ({ children }) => (
    <h1 className="text-xl font-bold text-foreground mt-4 mb-2 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-lg font-bold text-foreground mt-4 mb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-bold text-foreground mt-3 mb-1">
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="text-foreground text-base leading-relaxed mb-2">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5 text-foreground">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5 text-foreground">{children}</ol>,
  li: ({ children }) => <li className="text-base">{children}</li>,
  strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
};

type LessonContentProps = {
  content: string;
  className?: string;
};

export function LessonContent({ content, className = "" }: LessonContentProps) {
  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
}
