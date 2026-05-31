"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
  delay?: number;
}

export function TestimonialCard({
  quote,
  author,
  role,
  company,
  avatar,
  delay = 0,
}: TestimonialCardProps) {
  const initials = author
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div
      className={cn(
        "h-full animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Card className="h-full border-0 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card/80 hover:shadow-lg hover:-translate-y-1">
        <CardContent className="p-6">
          <blockquote className="text-sm leading-relaxed mb-4">&quot;{quote}&quot;</blockquote>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={avatar || "/placeholder.svg"} alt={author} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-sm">{author}</div>
              <div className="text-xs text-muted-foreground">
                {role} at {company}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
