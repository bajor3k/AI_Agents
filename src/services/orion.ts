import type { AdvisoryData, OrionAccountUpdate } from "@/types";

// TODO: Replace with real Orion API base URL and auth
const ORION_BASE_URL = process.env.ORION_API_URL || "https://orion-api.example.com";
const ORION_API_KEY = process.env.ORION_API_KEY || "";

function getHeaders(): HeadersInit {
    // TODO: Replace with real Orion auth headers
    return {
        Authorization: `Bearer ${ORION_API_KEY}`,
        "Content-Type": "application/json",
    };
}

/**
 * Push extracted advisory data to Orion to update the account.
 * Called when a document is IGO and the user clicks "Push".
 *
 * TODO: Replace with real Orion API call
 */
export async function pushAdvisoryData(
    accountNumber: string,
    data: AdvisoryData
): Promise<{ success: boolean; message: string }> {
    // TODO: Replace with real API call to update account in Orion
    console.log(`[ORION STUB] pushAdvisoryData called for account: ${accountNumber}`);
    console.log(`[ORION STUB] Data:`, JSON.stringify(data, null, 2));

    const update: OrionAccountUpdate = {
        accountNumber,
        discretionary: data.discretionary,
        wrap: data.wrap,
        clientName: data.clientName,
        effectiveDate: data.effectiveDate,
        feeType: data.feeType,
        feeAmount: data.feeAmount,
        advisorName: data.advisorName,
        repCode: data.repCode,
    };

    console.log(`[ORION STUB] Would push update:`, update);

    return {
        success: true,
        message: `Account ${accountNumber} updated successfully (stubbed)`,
    };
}

/**
 * Validate that an account exists in Orion before pushing data.
 *
 * TODO: Replace with real Orion API call
 */
export async function validateAccount(
    accountNumber: string
): Promise<{ exists: boolean; message: string }> {
    // TODO: Replace with real API call
    console.log(`[ORION STUB] validateAccount called for: ${accountNumber}`);

    return {
        exists: true,
        message: `Account ${accountNumber} found (stubbed)`,
    };
}

/**
 * Fetch current account details from Orion.
 * Useful for comparing existing data with the advisory agreement.
 *
 * TODO: Replace with real Orion API call
 */
export async function getAccountDetails(
    accountNumber: string
): Promise<Record<string, unknown> | null> {
    // TODO: Replace with real API call
    console.log(`[ORION STUB] getAccountDetails called for: ${accountNumber}`);

    return null;
}
