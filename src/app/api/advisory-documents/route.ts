import { NextRequest, NextResponse } from "next/server";
import { writeFile, readdir, unlink, readFile } from "fs/promises";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import type { DocumentFile } from "@/types";

const DOCUMENTS_FOLDER = process.env.DOCUMENTS_FOLDER || "./documents";
const PENDING_FOLDER = join(DOCUMENTS_FOLDER, "pending");
const PROCESSED_FOLDER = join(DOCUMENTS_FOLDER, "processed");

// Ensure folders exist
[PENDING_FOLDER, PROCESSED_FOLDER].forEach((folder) => {
    if (!existsSync(folder)) {
        mkdirSync(folder, { recursive: true });
    }
});

// GET - List all documents
export async function GET(request: NextRequest) {
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

// PUT - Analyze a document
export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { success: false, error: "Document ID required" },
                { status: 400 }
            );
        }

        // Simulate analysis
        return NextResponse.json({
            success: true,
            message: "Document analyzed",
            data: {
                status: Math.random() > 0.5 ? "igo" : "nigo",
            },
        });
    } catch (error) {
        console.error("Error analyzing document:", error);
        return NextResponse.json(
            { success: false, error: "Failed to analyze document" },
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

        // In a real implementation, you would delete the actual file
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
