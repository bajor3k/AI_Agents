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

const ADVISORY_TYPES = [
    "Discretionary NON-WRAP Flat (1)",
    "Discretionary NON-WRAP Flat (2)",
    "Discretionary NON-WRAP Tiered (1)",
    "Discretionary NON-WRAP Tiered (2)",
    "Discretionary WRAP Flat (1)",
    "Discretionary WRAP Flat (2)",
    "Discretionary WRAP Tiered (1)",
    "Discretionary WRAP Tiered (2)",
    "Non-Discretionary NON-WRAP Flat (1)",
    "Non-Discretionary NON-WRAP Flat (2)",
    "Non-Discretionary NON-WRAP Tiered (1)",
    "Non-Discretionary NON-WRAP Tiered (2)",
    "Non-Discretionary WRAP Flat (1)",
    "Non-Discretionary WRAP Flat (2)",
    "Non-Discretionary WRAP Tiered (1)",
    "Non-Discretionary WRAP Tiered (2)",
];

export default function PdfGeneratorPage() {
    const [generating, setGenerating] = useState(false);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        count?: number;
    } | null>(null);
    const { toast } = useToast();

    const handleTypeToggle = (type: string) => {
        setSelectedTypes((prev) =>
            prev.includes(type)
                ? prev.filter((t) => t !== type)
                : [...prev, type]
        );
    };

    const handleSelectAll = () => {
        setSelectedTypes(selectedTypes.length === ADVISORY_TYPES.length ? [] : [...ADVISORY_TYPES]);
    };

    const handleGenerate = async () => {
        if (selectedTypes.length === 0) return;

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
                    types: selectedTypes,
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
                </div>
            </div>

            <div className="grid gap-6">
                {/* Generator Form */}
                <Card className="rounded-3xl">
                    <CardHeader>
                        <CardTitle>Select Document Types</CardTitle>
                        <CardDescription>
                            Choose which advisory agreements to generate
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                                {selectedTypes.length === ADVISORY_TYPES.length ? "Deselect All" : "Select All"}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-3">
                            {ADVISORY_TYPES.map((type) => (
                                <div
                                    key={type}
                                    className={`flex items-center space-x-3 rounded-lg border p-3 cursor-pointer transition-colors ${selectedTypes.includes(type)
                                        ? "bg-primary/5 border-primary"
                                        : "hover:bg-muted/50"
                                        }`}
                                    onClick={() => handleTypeToggle(type)}
                                >
                                    <div
                                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${selectedTypes.includes(type)
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "border-input"
                                            }`}
                                    >
                                        {selectedTypes.includes(type) && <CheckCircle2 className="h-3.5 w-3.5" />}
                                    </div>
                                    <Label className="cursor-pointer font-normal flex-1">{type}</Label>
                                </div>
                            ))}
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
                            disabled={generating || selectedTypes.length === 0}
                            className="w-full"
                        >
                            {generating ? "Generating..." : `Generate ${selectedTypes.length} Document${selectedTypes.length !== 1 ? 's' : ''}`}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
