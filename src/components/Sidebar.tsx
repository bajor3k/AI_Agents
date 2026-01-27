"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationData } from "@/lib/navigation-data";
import { useNavigation } from "@/contexts/navigation-context";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useNavigation();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar-background border-r border-sidebar-border transition-sidebar",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Compass className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-sidebar-foreground">
                Orion Advisory
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-4 overflow-y-auto h-[calc(100vh-8rem)]">
          {Object.entries(navigationData).map(([section, items]) => (
            <div key={section} className="space-y-1">
              {!isCollapsed && (
                <h3 className="px-2 py-1 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
                  {section}
                </h3>
              )}
              {items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="absolute bottom-4 left-0 right-0 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={cn(
              "w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed && "px-0"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
