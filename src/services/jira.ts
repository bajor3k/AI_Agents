import type { JiraTicket, JiraAttachment } from "@/types";

// TODO: Replace with real Jira API base URL and auth headers
const JIRA_BASE_URL = process.env.JIRA_BASE_URL || "https://your-org.atlassian.net";
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || "";
const JIRA_USER_EMAIL = process.env.JIRA_USER_EMAIL || "";

function getHeaders(): HeadersInit {
    // TODO: Replace with real Jira auth (Basic auth with email:token or OAuth)
    const encoded = Buffer.from(`${JIRA_USER_EMAIL}:${JIRA_API_TOKEN}`).toString("base64");
    return {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/json",
        Accept: "application/json",
    };
}

/**
 * Fetch new advisory agreement tickets from Jira.
 * Looks for tickets in the configured project/queue that have PDF attachments
 * and haven't been processed yet.
 *
 * TODO: Replace with real Jira JQL query and API call
 */
export async function fetchNewAdvisoryTickets(): Promise<JiraTicket[]> {
    // TODO: Replace with real API call
    // Example: GET /rest/api/3/search?jql=project=ADV AND status="New" AND attachments IS NOT EMPTY
    console.log("[JIRA STUB] fetchNewAdvisoryTickets called");

    return [
        // Stubbed response — will be replaced with real Jira API response
    ];
}

/**
 * Get full details for a specific Jira ticket including attachments.
 *
 * TODO: Replace with real Jira API call
 */
export async function getTicketDetails(ticketId: string): Promise<JiraTicket | null> {
    // TODO: Replace with real API call
    // Example: GET /rest/api/3/issue/{ticketId}
    console.log(`[JIRA STUB] getTicketDetails called for ticket: ${ticketId}`);

    return null;
}

/**
 * Download a PDF attachment from a Jira ticket.
 * Returns the file as a Buffer for local processing.
 *
 * TODO: Replace with real Jira attachment download
 */
export async function downloadAttachment(attachment: JiraAttachment): Promise<Buffer | null> {
    // TODO: Replace with real API call
    // Example: GET /rest/api/3/attachment/content/{attachmentId}
    console.log(`[JIRA STUB] downloadAttachment called for: ${attachment.filename}`);

    return null;
}

/**
 * Post a comment back on a Jira ticket.
 * Used for both IGO confirmations and NIGO rejection notices.
 *
 * TODO: Replace with real Jira API call
 */
export async function replyToTicket(ticketId: string, message: string): Promise<{ success: boolean; commentId?: string }> {
    // TODO: Replace with real API call
    // Example: POST /rest/api/3/issue/{ticketId}/comment
    // Body: { body: { type: "doc", version: 1, content: [{ type: "paragraph", content: [{ type: "text", text: message }] }] } }
    console.log(`[JIRA STUB] replyToTicket called for ticket: ${ticketId}`);
    console.log(`[JIRA STUB] Message: ${message}`);

    return {
        success: true,
        commentId: `stub-comment-${Date.now()}`,
    };
}

/**
 * Transition a Jira ticket to a new status.
 * Used to move tickets to "Processed" or "Needs Review" after push.
 *
 * TODO: Replace with real Jira API call
 */
export async function transitionTicket(ticketId: string, transitionName: string): Promise<boolean> {
    // TODO: Replace with real API call
    // Example: POST /rest/api/3/issue/{ticketId}/transitions
    // Need to first GET available transitions, find the ID, then POST
    console.log(`[JIRA STUB] transitionTicket called: ${ticketId} → ${transitionName}`);

    return true;
}
