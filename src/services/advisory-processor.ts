import { join } from "path";
import type { DocumentFile, AdvisoryData, PushResult } from "@/types";
import { pushAdvisoryData, validateAccount } from "./orion";
import { replyToTicket, transitionTicket } from "./jira";

/**
 * Path to the 16 reference advisory agreement PDFs.
 * Each PDF has "XXXXXX" placeholders in every field the AI needs to detect.
 * The AI compares the submitted document against the matching reference
 * to know exactly where each field should appear and what to extract.
 *
 * Naming convention: {Discretionary|Non-Discretionary} {WRAP|NON-WRAP} {Flat|Tiered} ({1|2})
 *   - (1) = 1 account holder
 *   - (2) = 2 account holders
 */
const REFERENCE_DOCS_PATH = join(process.cwd(), "src/ai/reference-docs");

/**
 * The 16 reference template names covering all advisory agreement variations:
 *   4 form types × 2 fee structures × 2 account holder counts = 16
 */
const REFERENCE_TEMPLATES = [
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
] as const;

/**
 * Required fields that must be present for a document to be IGO.
 */
const REQUIRED_FIELDS: (keyof AdvisoryData)[] = [
    "discretionary",
    "wrap",
    "clientName",
    "effectiveDate",
    "accountNumber",
    "feeType",
    "feeAmount",
    "advReceivedDate",
    "clientSignedP11",
    "clientDateP11",
    "clientSignedP14",
    "clientDateP14",
];

/**
 * Resolve the path to a reference template PDF by name.
 */
export function getReferencePath(templateName: string): string {
    return join(REFERENCE_DOCS_PATH, `${templateName}.pdf`);
}

/**
 * Determine which reference template to use based on an incoming document's
 * detected characteristics. The AI first does a quick classification pass
 * to identify the form type, then loads the matching reference for detailed extraction.
 *
 * TODO: Replace with real AI classification call
 */
export async function classifyDocument(doc: DocumentFile): Promise<{
    templateName: string;
    referencePath: string;
    discretionary: boolean;
    wrap: boolean;
    feeStructure: "Flat" | "Tiered";
    accountHolders: 1 | 2;
}> {
    // TODO: Replace with real AI classification
    // Step 1: Send the first page of the submitted PDF to the AI
    // Step 2: AI determines: discretionary vs non-discretionary, WRAP vs NON-WRAP,
    //         flat vs tiered, 1 vs 2 account holders
    // Step 3: Match to the correct reference template
    console.log(`[PROCESSOR STUB] classifyDocument called for: ${doc.fileName}`);

    // Stubbed defaults — real AI would determine these from the document
    const discretionary = true;
    const wrap = false;
    const feeStructure: "Flat" | "Tiered" = "Flat";
    const accountHolders: 1 | 2 = 1;

    const templateName = `${discretionary ? "Discretionary" : "Non-Discretionary"} ${wrap ? "WRAP" : "NON-WRAP"} ${feeStructure} (${accountHolders})`;
    const referencePath = getReferencePath(templateName);

    return { templateName, referencePath, discretionary, wrap, feeStructure, accountHolders };
}

/**
 * Analyze a document and extract advisory fields.
 *
 * Process:
 *   1. Classify the document to identify which of the 16 form types it is
 *   2. Load the matching reference PDF (with "XXXXXX" markers)
 *   3. Send both the submitted PDF and reference PDF to the AI model
 *   4. AI compares them page-by-page: everywhere the reference has "XXXXXX",
 *      the AI extracts the actual value from the submitted document
 *   5. Validate extracted fields against REQUIRED_FIELDS → IGO or NIGO
 *
 * TODO: Replace the stubbed extraction with real AI/OCR analysis
 */
export async function processAdvisoryDocument(
    doc: DocumentFile
): Promise<{ status: "igo" | "nigo"; data: AdvisoryData; errors: string[] }> {
    console.log(`[PROCESSOR STUB] processAdvisoryDocument called for: ${doc.fileName}`);

    // Step 1: Classify the document to find the right reference template
    const classification = await classifyDocument(doc);
    console.log(`[PROCESSOR STUB] Classified as: ${classification.templateName}`);
    console.log(`[PROCESSOR STUB] Reference PDF: ${classification.referencePath}`);

    // Step 2: Load the reference PDF for comparison
    // TODO: Read the reference PDF from classification.referencePath
    // const referenceBuffer = await readFile(classification.referencePath);

    // Step 3: Send both documents to AI for extraction
    // TODO: Replace with real AI call, e.g.:
    //
    // const result = await ai.extract({
    //     submittedPdf: doc.filePath,
    //     referencePdf: classification.referencePath,
    //     prompt: `Compare the submitted advisory agreement against the reference template.
    //              The reference has "XXXXXX" in every field that needs to be filled in.
    //              For each "XXXXXX" location in the reference, extract the actual value
    //              from the submitted document. If a field is blank, missing, or unsigned,
    //              return null for that field.`,
    //     schema: AdvisoryDataSchema,
    // });

    // Stubbed extraction — returns empty data so everything shows as NIGO
    const data: AdvisoryData = {
        discretionary: classification.discretionary,
        wrap: classification.wrap,
        advisorName: "",
        repCode: "",
        clientName: "",
        effectiveDate: "",
        accountHolders: classification.accountHolders,
        advReceivedDate: "",
        clientSignedP11: false,
        clientNameP11: "",
        clientDateP11: "",
        advisorSignedP11: false,
        advisorNameP11: "",
        advisorDateP11: "",
        accountNumber: "",
        feeType: "",
        feeAmount: "",
        clientSignedP14: false,
        clientNameP14: "",
        clientDateP14: "",
        advisorSignedP14: false,
        advisorNameP14: "",
        advisorDateP14: "",
    };

    const errors = getValidationErrors(data);
    const status = errors.length === 0 ? "igo" : "nigo";

    return { status, data, errors };
}

/**
 * Check which required fields are missing from extracted advisory data.
 * Returns a list of human-readable error descriptions.
 */
export function getValidationErrors(data: AdvisoryData): string[] {
    const errors: string[] = [];

    for (const field of REQUIRED_FIELDS) {
        const val = data[field];
        if (val === undefined || val === null || val === "" || val === false) {
            errors.push(fieldToLabel(field));
        }
    }

    return errors;
}

/**
 * The main "Push" action. Handles the full workflow:
 * - IGO: Push to Orion + reply to Jira confirming the update
 * - NIGO: Skip Orion + reply to Jira with missing fields
 */
export async function pushDocument(doc: DocumentFile): Promise<PushResult> {
    if (!doc.data) {
        return {
            success: false,
            action: "error",
            errors: ["Document has not been analyzed yet"],
        };
    }

    const errors = getValidationErrors(doc.data);
    const jiraTicketId = doc.jiraTicketId;

    if (errors.length === 0) {
        // IGO — push to Orion and notify via Jira
        const accountNumber = doc.data.accountNumber;

        // Validate account exists in Orion first
        const validation = await validateAccount(accountNumber);
        if (!validation.exists) {
            return {
                success: false,
                action: "error",
                errors: [`Account ${accountNumber} not found in Orion`],
            };
        }

        // Push data to Orion
        const orionResult = await pushAdvisoryData(accountNumber, doc.data);
        if (!orionResult.success) {
            return {
                success: false,
                action: "error",
                errors: [orionResult.message],
            };
        }

        // Reply to Jira ticket with IGO confirmation
        if (jiraTicketId) {
            const message = formatIgoResponse(doc.data);
            const jiraResult = await replyToTicket(jiraTicketId, message);
            await transitionTicket(jiraTicketId, "Processed");

            return {
                success: true,
                action: "pushed",
                jiraCommentId: jiraResult.commentId,
                orionUpdated: true,
            };
        }

        return {
            success: true,
            action: "pushed",
            orionUpdated: true,
        };
    } else {
        // NIGO — do NOT update Orion, reply to Jira with missing fields
        if (jiraTicketId) {
            const message = formatNigoResponse(errors);
            const jiraResult = await replyToTicket(jiraTicketId, message);
            await transitionTicket(jiraTicketId, "Needs Review");

            return {
                success: true,
                action: "nigo-replied",
                jiraCommentId: jiraResult.commentId,
                orionUpdated: false,
                errors,
            };
        }

        return {
            success: true,
            action: "nigo-replied",
            orionUpdated: false,
            errors,
        };
    }
}

/**
 * Format the Jira reply message when a document is IGO.
 */
export function formatIgoResponse(data: AdvisoryData): string {
    return [
        `Advisory Agreement — IN GOOD ORDER (IGO)`,
        ``,
        `Account: ${data.accountNumber}`,
        `Client: ${data.clientName}`,
        `Type: ${data.discretionary ? "Discretionary" : "Non-Discretionary"} / ${data.wrap ? "WRAP" : "Non-WRAP"}`,
        `Fee: ${data.feeType} — ${data.feeAmount}`,
        `Effective Date: ${data.effectiveDate}`,
        ``,
        `The account has been updated in Orion. No further action is required.`,
    ].join("\n");
}

/**
 * Format the Jira reply message when a document is NIGO.
 */
export function formatNigoResponse(errors: string[]): string {
    return [
        `Advisory Agreement — NOT IN GOOD ORDER (NIGO)`,
        ``,
        `The following items are missing or incomplete:`,
        ...errors.map((e) => `  • ${e}`),
        ``,
        `Please resubmit the advisory agreement with the missing information.`,
    ].join("\n");
}

/**
 * Convert a field key to a human-readable label.
 */
function fieldToLabel(field: keyof AdvisoryData): string {
    const labels: Partial<Record<keyof AdvisoryData, string>> = {
        discretionary: "Discretionary v. Non-Discretionary",
        wrap: "WRAP v. Non-WRAP",
        clientName: "Client's Name",
        effectiveDate: "Effective Date",
        accountNumber: "Account Number",
        feeType: "Fee Type (Flat v. Tiered)",
        feeAmount: "Fee Amount",
        advReceivedDate: "ADV Received Date",
        clientSignedP11: "Client Signature (Page 11)",
        clientDateP11: "Client Date (Page 11)",
        clientSignedP14: "Client Signature (Page 14)",
        clientDateP14: "Client Date (Page 14)",
    };
    return labels[field] || field;
}
