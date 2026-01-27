"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    FileText,
    Upload,
    CheckCircle2,
    XCircle,
    Clock,
    Download,
    Trash2,
    RefreshCw,
} from "lucide-react";

import type { DocumentFile, StatusFilter, AdvisoryData } from "@/types";

export default function AdvisoryPage() {
    const [documents, setDocuments] = useState<DocumentFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState<string | null>(null);
    const [filter, setFilter] = useState<StatusFilter>("all");
    const { toast } = useToast();

    const fetchDocuments = useCallback(async () => {
        try {
            const response = await fetch("/api/advisory-documents");
            if (!response.ok) throw new Error("Failed to fetch documents");
            const data = await response.json();
            setDocuments(data.documents || []);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load documents",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        const formData = new FormData();

        Array.from(files).forEach((file) => {
            formData.append("files", file);
        });

        try {
            const response = await fetch("/api/advisory-documents", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            toast({
                title: "Success",
                description: `${files.length} file(s) uploaded successfully`,
            });

            fetchDocuments();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to upload files",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleAnalyze = async (documentId: string) => {
        setAnalyzing(documentId);
        try {
            const response = await fetch(`/api/advisory-documents?id=${documentId}`, {
                method: "PUT",
            });

            if (!response.ok) throw new Error("Analysis failed");

            toast({
                title: "Success",
                description: "Document analyzed successfully",
            });

            fetchDocuments();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to analyze document",
                variant: "destructive",
            });
        } finally {
            setAnalyzing(null);
        }
    };

    const handleDelete = async (documentId: string) => {
        try {
            const response = await fetch(`/api/advisory-documents?id=${documentId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error("Delete failed");

            toast({
                title: "Success",
                description: "Document deleted",
            });

            fetchDocuments();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete document",
                variant: "destructive",
            });
        }
    };

    const filteredDocuments = documents.filter((doc) => {
        if (filter === "all") return true;
        return doc.status === filter;
    });

    const getStatusBadge = (status: string) => {
        const config = {
            pending: { label: "Pending", variant: "secondary" as const, icon: Clock },
            igo: { label: "IGO", variant: "default" as const, icon: CheckCircle2 },
            nigo: { label: "NIGO", variant: "destructive" as const, icon: XCircle },
        };

        const { label, variant, icon: Icon } = config[status as keyof typeof config] || config.pending;

        return (
            <Badge variant={variant} className="gap-1">
                <Icon className="h-3 w-3" />
                {label}
            </Badge>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <FileText className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Advisory Review</h1>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={fetchDocuments}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    </Button>
                    <Button asChild disabled={uploading}>
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            {uploading ? "Uploading..." : "Upload PDF"}
                            <input
                                id="file-upload"
                                type="file"
                                multiple
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </label>
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Documents</CardDescription>
                        <CardTitle className="text-3xl">{documents.length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Pending</CardDescription>
                        <CardTitle className="text-3xl">
                            {documents.filter((d) => d.status === "pending").length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>IGO</CardDescription>
                        <CardTitle className="text-3xl">
                            {documents.filter((d) => d.status === "igo").length}
                        </CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>NIGO</CardDescription>
                        <CardTitle className="text-3xl">
                            {documents.filter((d) => d.status === "nigo").length}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Documents Table */}
            <Card className="rounded-3xl">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Documents</CardTitle>
                        <Tabs value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
                            <TabsList>
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="pending">Pending</TabsTrigger>
                                <TabsTrigger value="igo">IGO</TabsTrigger>
                                <TabsTrigger value="nigo">NIGO</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center p-8">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredDocuments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No documents found</p>
                            <p className="text-sm text-muted-foreground">
                                Upload PDF files to get started
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>File Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead>Analyzed</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredDocuments.map((doc) => (
                                    <TableRow key={doc.id}>
                                        <TableCell className="font-medium">{doc.fileName}</TableCell>
                                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                                        <TableCell>{new Date(doc.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {doc.analyzedAt
                                                ? new Date(doc.analyzedAt).toLocaleDateString()
                                                : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {doc.status === "pending" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAnalyze(doc.id)}
                                                        disabled={analyzing === doc.id}
                                                    >
                                                        {analyzing === doc.id ? (
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            "Analyze"
                                                        )}
                                                    </Button>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => window.open(`/api/view-pdf?id=${doc.id}`, "_blank")}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => handleDelete(doc.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
