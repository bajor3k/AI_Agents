import { NextRequest, NextResponse } from "next/server";
import { copyFile, writeFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const TARGET_FOLDER = "/Users/bajor3k/Desktop/Orion Advisory";
// Template source folder in the project
const TEMPLATE_FOLDER = join(process.cwd(), "src", "ai", "reference-docs");

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { types } = body;

        if (!types || !Array.isArray(types) || types.length === 0) {
            return NextResponse.json(
                { success: false, error: "No document types selected" },
                { status: 400 }
            );
        }

        const generatedFiles: string[] = [];
        const timestamp = Date.now();

        for (const type of types) {
            const safeName = type.replace(/[^a-zA-Z0-9\-\(\) ]/g, "").trim();
            const fileName = `${safeName} - ${timestamp}.pdf`;
            const targetPath = join(TARGET_FOLDER, fileName);

            // Try to find a matching template
            const templatePath = join(TEMPLATE_FOLDER, `${type}.pdf`);

            if (existsSync(templatePath)) {
                await copyFile(templatePath, targetPath);
            } else {
                // Create a dummy PDF file content if template doesn't exist
                // This is a minimal PDF header
                const dummyPdfContent = `%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Kids [3 0 R]\n/Count 1\n/Type /Pages\n>>\nendobj\n3 0 obj\n<<\n/MediaBox [0 0 595 842]\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(${type}) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000259 00000 n\n0000000346 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n441\n%%EOF`;
                await writeFile(targetPath, dummyPdfContent);
            }

            generatedFiles.push(fileName);
        }

        return NextResponse.json({
            success: true,
            message: `Successfully generated ${generatedFiles.length} document(s)`,
            filePaths: generatedFiles,
            metadata: {
                count: generatedFiles.length,
                templates: types,
            },
        });
    } catch (error) {
        console.error("Error generating PDFs:", error);
        return NextResponse.json(
            { success: false, error: "Failed to generate PDFs" },
            { status: 500 }
        );
    }
}
