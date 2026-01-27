"use client";

import React from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { NavigationProvider } from "@/contexts/navigation-context";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/AppShell";
import { Toaster } from "@/components/ui/toaster";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <NavigationProvider>
          <AppShell>{children}</AppShell>
          <Toaster />
        </NavigationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
