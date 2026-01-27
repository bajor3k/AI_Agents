"use client";

import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/contexts/navigation-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { FullscreenToggle } from "@/components/chrome/FullscreenToggle";
import { Input } from "@/components/ui/input";

export function TopToolbar() {
  const { isCollapsed } = useNavigation();

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-sidebar",
        isCollapsed ? "left-16" : "left-64"
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-9 w-full bg-muted/50"
          />
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <FullscreenToggle />
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
