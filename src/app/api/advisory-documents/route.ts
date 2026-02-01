import { NextRequest, NextResponse } from "next/server";
import { writeFile, readdir } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import type { DocumentFile } from "@/types";
import { processAdvisoryDocument, pushDocument } from "@/services/advisory-processor";

const DOCUMENTS_FOLDER = "/Users/bajor3k/Desktop/Orion Advisory";
const PENDING_FOLDER = DOCUMENTS_FOLDER;
const PROCESSED_FOLDER = join(DOCUMENTS_FOLDER, "processed");

if (!existsSync(DOCUMENTS_FOLDER)) {
    mkdirSync(DOCUMENTS_FOLDER, { recursive: true });
}
if (!existsSync(PROCESSED_FOLDER)) {
    mkdirSync(PROCESSED_FOLDER, { recursive: true });
}

// GET - List all documents
export async function GET() {
    try {
        const pendingFiles = existsSync(PENDING_FOLDER) ? await readdir(PENDING_FOLDER) : [];
        const processedFiles = existsSync(PROCESSED_FOLDER) ? await readdir(PROCESSED_FOLDER) : [];

        const documents: DocumentFile[] = [
            ...pendingFiles
                .filter((f) => f.endsWith(".pdf"))
                .map((fileName, index) => ({
                    id: `pending-${index}`,
                    fileName,
                    filePath: join(PENDING_FOLDER, fileName),
                    status: "pending" as const,
                    createdAt: new Date().toISOString(),
                })),
            ...processedFiles
                .filter((f) => f.endsWith(".pdf"))
                .map((fileName, index) => ({
                    id: `processed-${index}`,
                    fileName,
                    filePath: join(PROCESSED_FOLDER, fileName),
                    status: Math.random() > 0.5 ? ("igo" as const) : ("nigo" as const),
                    createdAt: new Date().toISOString(),
                    analyzedAt: new Date().toISOString(),
                })),
        ];

        return NextResponse.json({
            success: true,
            documents,
            count: documents.length,
        });
    } catch (error) {
        console.error("Error listing documents:", error);
        return NextResponse.json(
            { success: false, error: "Failed to list documents" },
            { status: 500 }
        );
    }
}

// POST - Upload new documents
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { success: false, error: "No files provided" },
                { status: 400 }
            );
        }

        const uploadedFiles: string[] = [];

        for (const file of files) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filePath = join(PENDING_FOLDER, file.name);
            await writeFile(filePath, buffer);
            uploadedFiles.push(file.name);
        }

        return NextResponse.json({
            success: true,
            message: `Uploaded ${uploadedFiles.length} file(s)`,
            files: uploadedFiles,
        });
    } catch (error) {
        console.error("Error uploading documents:", error);
        return NextResponse.json(
            { success: false, error: "Failed to upload documents" },
            { status: 500 }
        );
    }
}

// PUT - Analyze or Push a document
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        const action = searchParams.get("action") || "analyze";

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Document ID required" },
                { status: 400 }
            );
        }

        if (action === "push") {
            // Push action: IGO → update Orion + reply Jira, NIGO → reply Jira with missing fields
            // TODO: Look up the real document from storage with its analyzed data
            const stubDoc: DocumentFile = {
                id,
                fileName: "stub.pdf",
                filePath: "",
                status: "nigo",
                createdAt: new Date().toISOString(),
                // TODO: Load real analyzed data from storage/database
                data: undefined,
            };

            const result = await pushDocument(stubDoc);

            return NextResponse.json({
                success: result.success,
                message: result.action === "pushed"
                    ? "Account updated in Orion and Jira ticket notified"
                    : result.action === "nigo-replied"
                        ? "Jira ticket notified with missing fields"
                        : "Push failed",
                result,
            });
        }

        // Default: analyze action
        // TODO: Look up the real document file for analysis
        const stubDoc: DocumentFile = {
            id,
            fileName: "stub.pdf",
            filePath: "",
            status: "pending",
            createdAt: new Date().toISOString(),
        };

        const analysis = await processAdvisoryDocument(stubDoc);

        return NextResponse.json({
            success: true,
            message: "Document analyzed",
            data: {
                status: analysis.status,
                extractedData: analysis.data,
                errors: analysis.errors,
            },
        });
    } catch (error) {
        console.error("Error processing document:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process document" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a document
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Document ID required" },
                { status: 400 }
            );
        }

        // TODO: Actually delete the file from disk
        return NextResponse.json({
            success: true,
            message: "Document deleted",
        });
    } catch (error) {
        console.error("Error deleting document:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete document" },
            { status: 500 }
        );
    }
}
