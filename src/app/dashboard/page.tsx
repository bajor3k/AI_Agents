"use client";

import Link from "next/link";
import { FileText, FileUp, ArrowRight, Compass } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Compass className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Orion Advisory</h1>
          <p className="text-muted-foreground">
            AI-powered document review and validation system
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle>Advisory Documents</CardTitle>
                <CardDescription>Review and validate PDF documents</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Upload advisory agreement PDFs for AI-powered analysis. The system extracts key fields,
              validates signatures, and determines IGO/NIGO status automatically.
            </p>
            <Button asChild className="w-full">
              <Link href="/orion/advisory">
                Open Advisory Review
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <FileUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>PDF Generator</CardTitle>
                <CardDescription>Generate test documents</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Generate test PDF documents from templates with randomized data.
              Perfect for testing the advisory review system with sample documents.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/agents/pdf-generator">
                Open PDF Generator
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="rounded-3xl bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                1
              </div>
              <h3 className="font-medium">Add Templates</h3>
              <p className="text-sm text-muted-foreground">
                Place your 16 reference PDF templates in the src/ai/reference-docs folder.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                2
              </div>
              <h3 className="font-medium">Configure API Keys</h3>
              <p className="text-sm text-muted-foreground">
                Add your Gemini API key and Azure AD credentials to .env.local file.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                3
              </div>
              <h3 className="font-medium">Upload Documents</h3>
              <p className="text-sm text-muted-foreground">
                Add PDFs to the documents/pending folder or use the PDF Generator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
