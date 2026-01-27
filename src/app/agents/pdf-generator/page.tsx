"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FileUp, FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function PdfGeneratorPage() {
    const [generating, setGenerating] = useState(false);
    const [count, setCount] = useState("10");
    const [template, setTemplate] = useState("all");
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        count?: number;
    } | null>(null);
    const { toast } = useToast();

    const handleGenerate = async () => {
        setGenerating(true);
        setProgress(0);
        setResult(null);

        // Simulate progress
        const progressInterval = setInterval(() => {
            setProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        try {
            const response = await fetch("/api/generate-pdfs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    count: parseInt(count),
                    template: template === "all" ? undefined : template,
                }),
            });

            clearInterval(progressInterval);
            setProgress(100);

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Generation failed");
            }

            setResult({
                success: true,
                message: data.message,
                count: data.metadata?.count,
            });

            toast({
                title: "Success",
                description: data.message,
            });
        } catch (error) {
            clearInterval(progressInterval);
            setProgress(0);

            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            setResult({
                success: false,
                message: errorMessage,
            });

            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <FileUp className="h-7 w-7" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">PDF Generator</h1>
                    <p className="text-muted-foreground">
                        Generate test advisory documents from templates
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Generator Form */}
                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle>Generate Documents</CardTitle>
                        <CardDescription>
                            Create test PDF documents with randomized data
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="count">Number of Documents</Label>
                            <Input
                                id="count"
                                type="number"
                                min="1"
                                max="100"
                                value={count}
                                onChange={(e) => setCount(e.target.value)}
                                placeholder="10"
                            />
                            <p className="text-sm text-muted-foreground">
                                Generate between 1 and 100 documents
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="template">Template Selection</Label>
                            <Select value={template} onValueChange={setTemplate}>
                                <SelectTrigger id="template">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Templates (Random)</SelectItem>
                                    <SelectItem value="template-1">Template 1</SelectItem>
                                    <SelectItem value="template-2">Template 2</SelectItem>
                                    <SelectItem value="template-3">Template 3</SelectItem>
                                    <SelectItem value="template-4">Template 4</SelectItem>
                                    <SelectItem value="template-5">Template 5</SelectItem>
                                    <SelectItem value="template-6">Template 6</SelectItem>
                                    <SelectItem value="template-7">Template 7</SelectItem>
                                    <SelectItem value="template-8">Template 8</SelectItem>
                                    <SelectItem value="template-9">Template 9</SelectItem>
                                    <SelectItem value="template-10">Template 10</SelectItem>
                                    <SelectItem value="template-11">Template 11</SelectItem>
                                    <SelectItem value="template-12">Template 12</SelectItem>
                                    <SelectItem value="template-13">Template 13</SelectItem>
                                    <SelectItem value="template-14">Template 14</SelectItem>
                                    <SelectItem value="template-15">Template 15</SelectItem>
                                    <SelectItem value="template-16">Template 16</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                Select a specific template or use all templates randomly
                            </p>
                        </div>

                        {generating && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Generating...</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} />
                            </div>
                        )}

                        {result && (
                            <div
                                className={`rounded-lg border p-4 ${result.success
                                    ? "border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/50"
                                    : "border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/50"
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    {result.success ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium">{result.message}</p>
                                        {result.count && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Generated {result.count} document(s)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleGenerate}
                            disabled={generating || !count || parseInt(count) < 1}
                            className="w-full"
                        >
                            {generating ? "Generating..." : "Generate PDFs"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle>How It Works</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                    1
                                </div>
                                <div>
                                    <h4 className="font-medium">Select Options</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Choose the number of documents and template to use
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                    2
                                </div>
                                <div>
                                    <h4 className="font-medium">Generate</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Click Generate to create PDFs with random test data
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                    3
                                </div>
                                <div>
                                    <h4 className="font-medium">Review</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Files are saved in the documents/pending directory
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                    4
                                </div>
                                <div>
                                    <h4 className="font-medium">Analyze</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Head to Advisory Review to analyze the generated documents with AI.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-muted/50 p-4">
                            <h4 className="font-medium mb-2">Note</h4>
                            <p className="text-sm text-muted-foreground">
                                Generated PDFs contain randomized data for testing purposes. Ensure you have
                                the reference templates in the{" "}
                                <code className="text-xs bg-background px-1 py-0.5 rounded">
                                    src/ai/reference-docs
                                </code>{" "}
                                folder.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
