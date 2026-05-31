"use client";

import Link from "next/link";
import { ArrowRight, Play, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedText } from "./animated-text";
import { Section } from "./section";
import { cn } from "@/lib/utils";

const fadeUp =
  "animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500";

export function HeroSection() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-primary/5 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className="text-center lg:text-left">
          <div className={cn(fadeUp, "mb-6")}>
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              Advanced link analytics
            </Badge>
          </div>

          <AnimatedText
            text="Short links with powerful analytics and custom domains."
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            mode="per-line"
          />

          <p
            className={cn(
              fadeUp,
              "text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0 [animation-delay:150ms]"
            )}
          >
            Create branded short links, track clicks with detailed analytics, and use
            your own custom domain for maximum impact.
          </p>

          <div
            className={cn(
              fadeUp,
              "flex flex-col sm:flex-row gap-4 justify-center lg:justify-start [animation-delay:300ms]"
            )}
          >
            <Button size="lg" className="group" asChild>
              <Link href="/auth">
                Get started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="group bg-transparent" asChild>
              <Link href="/auth">
                <Play className="mr-2 h-4 w-4" />
                Live demo
              </Link>
            </Button>
          </div>
        </div>

        <div
          className={cn(
            fadeUp,
            "flex justify-center lg:justify-end [animation-delay:450ms]"
          )}
        >
          <Card className="w-full max-w-sm bg-card/50 backdrop-blur-sm border shadow-2xl">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg">Link Analytics</h3>
                <p className="text-sm text-muted-foreground">Real-time click tracking</p>
              </div>

              <div className="space-y-3">
                {[
                  { label: "linktrack.app/Messi", clicks: "2,847", color: "from-green-500 to-emerald-500", letter: "10" },
                  { label: "linktrack.app/CR7", clicks: "2,234", color: "from-blue-500 to-blue-600", letter: "7" },
                  { label: "linktrack.app/ganesha", clicks: "856", color: "from-purple-500 to-pink-500", letter: "G" },
                  { label: "linktrack.app/dT8XrA", clicks: "432", color: "from-orange-500 to-red-500", letter: "D" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between p-3 rounded-lg bg-background/50 border transition-transform hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-8 w-8 bg-gradient-to-br rounded-lg flex items-center justify-center",
                          row.color
                        )}
                      >
                        <span className="text-white font-bold text-xs">{row.letter}</span>
                      </div>
                      <span className="font-medium text-sm">{row.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{row.clicks}</div>
                      <div className="text-xs text-muted-foreground">clicks</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Section>
  );
}
