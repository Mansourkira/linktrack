import ThemeToggle from "@/components/ui/ThemeToggle";
import { Header } from "@/components/ui/navbar";

export default function Home() {
  return (
    <div className="font-sans min-h-screen">
      <Header />
      <div className="pt-20 px-4 sm:px-6 lg:px-8">
        <ThemeToggle />
      </div>
    </div>
  );
}
