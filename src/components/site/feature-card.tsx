"use client";

import type React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  delay?: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  className,
  delay = 0,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "h-full animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Card className="h-full border-0 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:bg-card/80 hover:shadow-lg">
        <CardContent className="p-6">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            {icon}
          </div>
          <h3 className="mb-2 text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
