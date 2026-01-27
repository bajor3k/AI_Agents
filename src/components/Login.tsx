"use client";

import React from "react";
import { LogIn } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function Login() {
  const { signIn, isLoading } = useAuth();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome to Orion Advisory</CardTitle>
        <CardDescription>
          Sign in with your Microsoft account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={signIn}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          <LogIn className="mr-2 h-5 w-5" />
          {isLoading ? "Signing in..." : "Sign in with Microsoft"}
        </Button>
      </CardContent>
    </Card>
  );
}
