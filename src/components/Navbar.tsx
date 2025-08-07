"use client"

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";

const menuItems = [
  { name: "Features", href: "#" },
  { name: "Pricing", href: "#" },
];

export const Navbar = () => {
  const [menuState, setMenuState] = React.useState(false);

  return (
    <nav
      data-state={menuState && "active"}
      className="group fixed z-20 w-full border-b border-dashed bg-white backdrop-blur md:relative dark:bg-zinc-950/50 lg:dark:bg-transparent"
    >
      <div className="m-auto max-w-5xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
          {/* Logo (left) */}
          <div className="flex items-center lg:w-auto">
            <Link
              href="/"
              aria-label="home"
              className="flex items-center space-x-2"
            >
              <Logo />
            </Link>
          </div>

          {/* Centered Menu Items (desktop) */}
          <div className="hidden lg:flex flex-1 justify-center">
            <ul className="flex gap-8 text-base lg:text-sm">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-accent-foreground block duration-150"
                  >
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Dashboard button (right) */}
          <div className="hidden lg:flex items-center gap-3">
            <Button asChild size="sm">
              <Link href="#">
                <span>Dashboard</span>
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuState(!menuState)}
            aria-label={menuState ? "Close Menu" : "Open Menu"}
            className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
          >
            <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
            <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
          </button>
        </div>

        {/* Mobile Menu */}
        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
          <div className="w-full">
            <ul className="space-y-6 text-base flex flex-col items-center lg:hidden">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-accent-foreground block duration-150"
                  >
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6 lg:hidden">
            <Button asChild size="sm">
              <Link href="#">
                <span>Dashboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
