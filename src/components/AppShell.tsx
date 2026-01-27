"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useNavigation } from "@/contexts/navigation-context";
import { Sidebar } from "@/components/Sidebar";
import { TopToolbar } from "@/components/TopToolbar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isCollapsed } = useNavigation();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopToolbar />
      <main
        className={cn(
          "pt-16 min-h-screen transition-sidebar",
          isCollapsed ? "pl-16" : "pl-64"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
