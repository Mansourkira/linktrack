import ThemeToggle from "@/components/ui/ThemeToggle";
import { Header } from "@/components/ui/navbar";
import { HeroSection } from "@/components/hero-section-9";
import { ComingSoon } from "@/components/ComingSoon";
import { config } from "@/lib/config";

export default function Home() {
  // Show coming soon page if in production and flag is enabled
  if (config.isProduction && config.features.showComingSoon) {
    return <ComingSoon />;
  }

  return (
    <div className="font-sans min-h-screen">
      <HeroSection />
    </div>
  );
}
