"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
    ChevronDown,
    ChevronUp,
    Search,
    ArrowUpFromLine,
    Eye,
} from "lucide-react";

import type { DocumentFile, StatusFilter, AdvisoryData } from "@/types";

// All fields the AI extracts from advisory agreements
const ADVISORY_FIELDS: { key: keyof AdvisoryData; label: string }[] = [
    { key: "discretionary", label: "Discretionary v. Non-Discretionary" },
    { key: "wrap", label: "WRAP v. Non-WRAP" },
    { key: "clientName", label: "Client's Name" },
    { key: "effectiveDate", label: "Effective Date" },
    { key: "clientSignedP11", label: "Client Signed Page 11" },
    { key: "clientDateP11", label: "Client Dated Page 11" },
    { key: "accountNumber", label: "Account Number" },
    { key: "feeType", label: "Flat v. Tiered" },
    { key: "feeAmount", label: "Fee Amount" },
    { key: "advReceivedDate", label: "ADV Received Date" },
    { key: "clientSignedP14", label: "Client Signed Page 14" },
    { key: "clientDateP14", label: "Client Dated Page 14" },
];

function getFieldValue(data: AdvisoryData | undefined, key: keyof AdvisoryData): string | null {
    if (!data) return null;
    const val = data[key];
    if (val === undefined || val === null || val === "") return null;
    if (typeof val === "boolean") return val ? "Yes" : "No";
    return String(val);
}

function getDisplayValue(data: AdvisoryData | undefined, key: keyof AdvisoryData): string {
    const val = getFieldValue(data, key);
    if (!val) return "Missing";

    // Truncate long values
    if (val.length > 25) return val.slice(0, 22) + "...";
    return val;
}

function getSummaryColumns(doc: DocumentFile) {
    const d = doc.data;
    return {
        account: d?.accountNumber || "Missing",
        clientName: d?.clientName || "Missing",
        discretion: d?.discretionary !== undefined ? (d.discretionary ? "Discretionary" : "Non-Discretionary") : "Missing",
        wrap: d?.wrap !== undefined ? (d.wrap ? "WRAP" : "Non-WRAP") : "Missing",
        feeType: d?.feeType || "Missing",
        feeAmt: d?.feeAmount || "Missing",
    };
}

function StatusBadge({ status }: { status: string }) {
    if (status === "igo") {
        return (
            <span className="inline-flex items-center rounded-md bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-500/30">
                IGO
            </span>
        );
    }
    return (
        <span className="inline-flex items-center rounded-md bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-400 ring-1 ring-inset ring-red-500/30">
            NIGO
        </span>
    );
}

function FieldCard({ label, value, found }: { label: string; value: string; found: boolean }) {
    return (
        <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${found ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
            {found ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
                <XCircle className="h-4 w-4 shrink-0 text-red-400" />
            )}
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className={`ml-auto text-sm font-medium ${found ? "text-foreground" : "text-red-400"}`}>
                {value}
            </span>
        </div>
    );
}

export default function AdvisoryPage() {
    const [documents, setDocuments] = useState<DocumentFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [analyzing, setAnalyzing] = useState<string | null>(null);
    const [pushing, setPushing] = useState<string | null>(null);
    const [pendingFilter, setPendingFilter] = useState<StatusFilter>("all");
    const [historyFilter, setHistoryFilter] = useState<StatusFilter>("all");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [searchPending, setSearchPending] = useState("");
    const [searchHistory, setSearchHistory] = useState("");
    const { toast } = useToast();

    const fetchDocuments = useCallback(async () => {
        try {
            const response = await fetch("/api/advisory-documents");
            if (!response.ok) throw new Error("Failed to fetch documents");
            const data = await response.json();
            setDocuments(data.documents || []);
        } catch {
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
        Array.from(files).forEach((file) => formData.append("files", file));

        try {
            const response = await fetch("/api/advisory-documents", {
                method: "POST",
                body: formData,
            });
            if (!response.ok) throw new Error("Upload failed");
            toast({ title: "Success", description: `${files.length} file(s) uploaded` });
            fetchDocuments();
        } catch {
            toast({ title: "Error", description: "Failed to upload files", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleAnalyze = async (documentId: string) => {
        setAnalyzing(documentId);
        try {
            const response = await fetch(`/api/advisory-documents?id=${documentId}`, { method: "PUT" });
            if (!response.ok) throw new Error("Analysis failed");
            toast({ title: "Success", description: "Document analyzed" });
            fetchDocuments();
        } catch {
            toast({ title: "Error", description: "Failed to analyze", variant: "destructive" });
        } finally {
            setAnalyzing(null);
        }
    };

    const handleDelete = async (documentId: string) => {
        try {
            const response = await fetch(`/api/advisory-documents?id=${documentId}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Delete failed");
            toast({ title: "Success", description: "Document deleted" });
            fetchDocuments();
        } catch {
            toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
        }
    };

    const handlePush = async (documentId: string) => {
        setPushing(documentId);
        try {
            const response = await fetch(`/api/advisory-documents?action=push&id=${documentId}`, { method: "PUT" });
            if (!response.ok) throw new Error("Push failed");
            const data = await response.json();
            const action = data.result?.action;

            if (action === "pushed") {
                toast({ title: "Pushed to Orion", description: "Account updated and Jira ticket notified" });
            } else if (action === "nigo-replied") {
                toast({ title: "NIGO — Jira Notified", description: "Missing fields sent back to the advisor via Jira" });
            } else {
                toast({ title: "Push Error", description: data.message || "Something went wrong", variant: "destructive" });
            }
            fetchDocuments();
        } catch {
            toast({ title: "Error", description: "Failed to push document", variant: "destructive" });
        } finally {
            setPushing(null);
        }
    };

    // Pending Review = NIGO documents needing attention
    // History = all analyzed documents (IGO and NIGO)
    // "pending" status docs are still being processed by AI and don't appear in either table
    const pendingDocs = documents.filter((d) => d.status === "nigo");
    const historyDocs = documents.filter((d) => d.status === "igo" || d.status === "nigo");

    const filterDocs = (docs: DocumentFile[], filter: StatusFilter, search: string) => {
        let filtered = docs;
        if (filter === "igo") filtered = filtered.filter((d) => d.status === "igo");
        else if (filter === "nigo") filtered = filtered.filter((d) => d.status === "nigo");
        if (search) {
            const q = search.toLowerCase();
            filtered = filtered.filter((d) =>
                d.fileName.toLowerCase().includes(q) ||
                d.data?.clientName?.toLowerCase().includes(q) ||
                d.data?.accountNumber?.toLowerCase().includes(q)
            );
        }
        return filtered;
    };

    const filteredPending = filterDocs(pendingDocs, pendingFilter, searchPending);
    const filteredHistory = filterDocs(historyDocs, historyFilter, searchHistory);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const TabBar = ({ filter, setFilter, options }: { filter: StatusFilter; setFilter: (f: StatusFilter) => void; options: { value: StatusFilter; label: string }[] }) => (
        <div className="flex items-center gap-1">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => setFilter(opt.value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === opt.value ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Pending Review Section */}
            <div className="rounded-2xl border border-border/50 bg-card">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold">Pending Review</h2>
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-medium">
                            {pendingDocs.length}
                        </span>
                        <TabBar
                            filter={pendingFilter}
                            setFilter={setPendingFilter}
                            options={[
                                { value: "all", label: "All" },
                                { value: "igo" as StatusFilter, label: "IGO" },
                                { value: "nigo" as StatusFilter, label: "NIGO" },
                            ]}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchDocuments}
                            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-2"
                            disabled={pushing !== null || filteredPending.length === 0}
                            onClick={() => {
                                // Push the first pending doc as a demo; bulk push when real APIs arrive
                                if (filteredPending.length > 0) {
                                    handlePush(filteredPending[0].id);
                                }
                            }}
                        >
                            <ArrowUpFromLine className="h-3.5 w-3.5" />
                            {pushing ? "Pushing..." : "Push"}
                        </Button>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchPending}
                                onChange={(e) => setSearchPending(e.target.value)}
                                className="h-8 rounded-md border border-border/50 bg-transparent pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="px-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredPending.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Clock className="mb-3 h-8 w-8 opacity-40" />
                            <p className="text-sm">No pending documents</p>
                        </div>
                    ) : (
                        <div>
                            {/* Column headers */}
                            <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_80px_80px_40px] gap-2 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <div className="w-5" />
                                <div>Account</div>
                                <div>Client Name</div>
                                <div>Discretion</div>
                                <div>Wrap</div>
                                <div>Fee Type</div>
                                <div>Fee Amt</div>
                                <div>PDF</div>
                                <div>Status</div>
                                <div />
                            </div>

                            {filteredPending.map((doc) => {
                                const cols = getSummaryColumns(doc);
                                const isExpanded = expandedId === doc.id;

                                return (
                                    <div key={doc.id} className="mb-1">
                                        {/* Row */}
                                        <div
                                            className="grid cursor-pointer grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_80px_80px_40px] items-center gap-2 rounded-lg px-4 py-3 transition-colors hover:bg-white/[0.03]"
                                            onClick={() => toggleExpand(doc.id)}
                                        >
                                            <div className="w-5">
                                                <input type="checkbox" className="h-3.5 w-3.5 rounded border-border/50 bg-transparent" onClick={(e) => e.stopPropagation()} />
                                            </div>
                                            <div className="truncate text-sm font-medium">{cols.account === "Missing" ? <span className="text-muted-foreground">{doc.fileName.replace(".pdf", "").slice(0, 20)}...</span> : cols.account}</div>
                                            <div className={`truncate text-sm ${cols.clientName === "Missing" ? "text-muted-foreground" : ""}`}>{cols.clientName}</div>
                                            <div className={`text-sm ${cols.discretion === "Missing" ? "text-muted-foreground" : ""}`}>{cols.discretion}</div>
                                            <div className={`text-sm ${cols.wrap === "Missing" ? "text-muted-foreground" : ""}`}>{cols.wrap}</div>
                                            <div className={`text-sm ${cols.feeType === "Missing" ? "text-muted-foreground" : ""}`}>{cols.feeType}</div>
                                            <div className={`text-sm ${cols.feeAmt === "Missing" ? "text-muted-foreground" : ""}`}>{cols.feeAmt}</div>
                                            <div>
                                                <button
                                                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`/api/view-pdf?id=${doc.id}`, "_blank");
                                                    }}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </button>
                                            </div>
                                            <div><StatusBadge status={doc.status} /></div>
                                            <div className="flex justify-end">
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Detail */}
                                        {isExpanded && (
                                            <div className="mx-4 mb-3 rounded-xl border border-border/30 bg-white/[0.02] p-5">
                                                <div className="grid grid-cols-3 gap-3">
                                                    {ADVISORY_FIELDS.map((field) => {
                                                        const val = getFieldValue(doc.data, field.key);
                                                        const displayVal = getDisplayValue(doc.data, field.key);
                                                        return (
                                                            <FieldCard
                                                                key={field.key}
                                                                label={field.label}
                                                                value={displayVal}
                                                                found={val !== null}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                                <div className="mt-4 flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-2"
                                                        disabled={pushing === doc.id}
                                                        onClick={() => handlePush(doc.id)}
                                                    >
                                                        <ArrowUpFromLine className="h-3.5 w-3.5" />
                                                        {pushing === doc.id ? "Pushing..." : doc.status === "nigo" ? "Push (NIGO → Jira)" : "Push to Orion"}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* History Section */}
            <div className="rounded-2xl border border-border/50 bg-card">
                <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-semibold">History</h2>
                        <TabBar
                            filter={historyFilter}
                            setFilter={setHistoryFilter}
                            options={[
                                { value: "all", label: "All" },
                                { value: "igo" as StatusFilter, label: "IGO" },
                                { value: "nigo" as StatusFilter, label: "NIGO" },
                            ]}
                        />
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search history..."
                            value={searchHistory}
                            onChange={(e) => setSearchHistory(e.target.value)}
                            className="h-8 rounded-md border border-border/50 bg-transparent pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                    </div>
                </div>

                <div className="px-2">
                    {filteredHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <RefreshCw className="mb-3 h-8 w-8 opacity-40" />
                            <p className="text-sm">No files processed yet</p>
                        </div>
                    ) : (
                        <div>
                            <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_80px_80px_40px] gap-2 px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                <div className="w-5" />
                                <div>Account</div>
                                <div>Client Name</div>
                                <div>Discretion</div>
                                <div>Wrap</div>
                                <div>Fee Type</div>
                                <div>Fee Amt</div>
                                <div>PDF</div>
                                <div>Status</div>
                                <div />
                            </div>
                            {filteredHistory.map((doc) => {
                                const cols = getSummaryColumns(doc);
                                const isExpanded = expandedId === doc.id;

                                return (
                                    <div key={doc.id} className="mb-1">
                                        <div
                                            className="grid cursor-pointer grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_80px_80px_40px] items-center gap-2 rounded-lg px-4 py-3 transition-colors hover:bg-white/[0.03]"
                                            onClick={() => toggleExpand(doc.id)}
                                        >
                                            <div className="w-5">
                                                <input type="checkbox" className="h-3.5 w-3.5 rounded border-border/50 bg-transparent" onClick={(e) => e.stopPropagation()} />
                                            </div>
                                            <div className="truncate text-sm font-medium">{cols.account === "Missing" ? <span className="text-muted-foreground">{doc.fileName.replace(".pdf", "").slice(0, 20)}...</span> : cols.account}</div>
                                            <div className={`truncate text-sm ${cols.clientName === "Missing" ? "text-muted-foreground" : ""}`}>{cols.clientName}</div>
                                            <div className={`text-sm ${cols.discretion === "Missing" ? "text-muted-foreground" : ""}`}>{cols.discretion}</div>
                                            <div className={`text-sm ${cols.wrap === "Missing" ? "text-muted-foreground" : ""}`}>{cols.wrap}</div>
                                            <div className={`text-sm ${cols.feeType === "Missing" ? "text-muted-foreground" : ""}`}>{cols.feeType}</div>
                                            <div className={`text-sm ${cols.feeAmt === "Missing" ? "text-muted-foreground" : ""}`}>{cols.feeAmt}</div>
                                            <div>
                                                <button
                                                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`/api/view-pdf?id=${doc.id}`, "_blank");
                                                    }}
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </button>
                                            </div>
                                            <div><StatusBadge status={doc.status} /></div>
                                            <div className="flex justify-end">
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="mx-4 mb-3 rounded-xl border border-border/30 bg-white/[0.02] p-5">
                                                <div className="grid grid-cols-3 gap-3">
                                                    {ADVISORY_FIELDS.map((field) => {
                                                        const val = getFieldValue(doc.data, field.key);
                                                        const displayVal = getDisplayValue(doc.data, field.key);
                                                        return (
                                                            <FieldCard
                                                                key={field.key}
                                                                label={field.label}
                                                                value={displayVal}
                                                                found={val !== null}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                                <div className="mt-4 flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="gap-2"
                                                        disabled={pushing === doc.id}
                                                        onClick={() => handlePush(doc.id)}
                                                    >
                                                        <ArrowUpFromLine className="h-3.5 w-3.5" />
                                                        {pushing === doc.id ? "Pushing..." : doc.status === "nigo" ? "Push (NIGO → Jira)" : "Push to Orion"}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
