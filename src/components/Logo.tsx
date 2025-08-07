import Image from "next/image";
import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <>
      <Image
        src="/logo-light.png"
        alt="LinkTrack Logo"
        className={cn("block dark:hidden h-8 w-auto", className)}
        width={120}
        height={32}
        priority
      />
      <Image
        src="/logo-dark.png"
        alt="LinkTrack Logo"
        className={cn("hidden dark:block h-8 w-auto", className)}
        width={120}
        height={32}
        priority
      />
    </>
  );
};
