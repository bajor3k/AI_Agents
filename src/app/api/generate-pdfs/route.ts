import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { count = 10, template } = body;

        if (count < 1 || count > 100) {
            return NextResponse.json(
                { success: false, error: "Count must be between 1 and 100" },
                { status: 400 }
            );
        }

        // Simulate PDF generation
        const filePaths = Array.from({ length: count }, (_, i) => `generated-${i + 1}.pdf`);

        return NextResponse.json({
            success: true,
            message: `Successfully generated ${count} PDF document(s)`,
            filePaths,
            metadata: {
                count,
                templates: template ? [template] : ["all"],
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
