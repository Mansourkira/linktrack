import Image from "next/image";
import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <>
      <Image
        src="/linktrack.png"
        alt="LinkTrack Logo"
        className={cn("block dark:hidden h-8 w-auto", className)}
        width={120}
        height={32}
        priority
      />
      <Image
        src="/linktrack.png"
        alt="LinkTrack Logo"
        className={cn("hidden dark:block h-8 w-auto", className)}
        width={120}
        height={32}
        priority
      />
    </>
  );
};
