"use client";

import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OrionPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <FileText className="h-7 w-7" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Orion</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card className="rounded-3xl hover:shadow-md transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <CardTitle>Advisory Review</CardTitle>
                                <CardDescription>Document analysis and validation</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-muted-foreground">
                            Review advisory agreement documents with AI-powered field extraction and validation.
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/orion/advisory">
                                Open Advisory
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
