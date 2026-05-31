"use client";

import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
  mode?: "per-line" | "per-word";
  delay?: number;
}

export function AnimatedText({
  text,
  className,
  mode = "per-line",
}: AnimatedTextProps) {
  const splitText =
    mode === "per-line"
      ? text.split("\n").filter((line) => line.trim() !== "")
      : text.split(" ");

  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500",
        className
      )}
    >
      {splitText.map((item, index) => (
        <span
          key={index}
          className={mode === "per-line" ? "block" : "inline-block mr-1"}
        >
          {item}
          {mode === "per-line" && index < splitText.length - 1 && <br />}
        </span>
      ))}
    </div>
  );
}
