// User types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// Navigation types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export interface NavSection {
  [key: string]: NavItem[];
}

// Advisory document types
export interface AdvisoryData {
  // Page 1 fields
  discretionary: boolean;
  wrap: boolean;
  advisorName: string;
  repCode: string;
  clientName: string;
  effectiveDate: string;
  accountHolders: number;

  // Page 10 fields
  advReceivedDate: string;

  // Page 11 fields - Client 1
  clientSignedP11: boolean;
  clientNameP11: string;
  clientDateP11: string;

  // Page 11 fields - Client 2 (if 2 account holders)
  client2SignedP11?: boolean;
  client2NameP11?: string;
  client2DateP11?: string;

  // Page 11 fields - Advisor
  advisorSignedP11: boolean;
  advisorNameP11: string;
  advisorDateP11: string;

  // Page 12 fields
  accountNumber: string;

  // Page 13 fields
  feeType: string;
  feeAmount: string;

  // Page 14 fields - Client 1
  clientSignedP14: boolean;
  clientNameP14: string;
  clientDateP14: string;

  // Page 14 fields - Client 2 (if 2 account holders)
  client2SignedP14?: boolean;
  client2NameP14?: string;
  client2DateP14?: string;

  // Page 14 fields - Advisor
  advisorSignedP14: boolean;
  advisorNameP14: string;
  advisorDateP14: string;
}

export interface DocumentFile {
  id: string;
  fileName: string;
  filePath: string;
  status: "pending" | "igo" | "nigo";
  createdAt: string;
  analyzedAt?: string;
  pushedAt?: string;
  data?: AdvisoryData;
  validationErrors?: string[];
  isSelected?: boolean;
  jiraTicketId?: string;
  jiraTicketKey?: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

export interface DocumentsResponse {
  success: boolean;
  documents: DocumentFile[];
  count: number;
}

export interface GeneratePdfsResponse {
  success: boolean;
  message: string;
  filePaths?: string[];
  metadata?: {
    count: number;
    templates: string[];
  };
}

// Jira types
export interface JiraTicket {
  id: string;
  key: string;
  summary: string;
  status: string;
  reporter: string;
  attachments: JiraAttachment[];
  created: string;
}

export interface JiraAttachment {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

// Orion types
export interface OrionAccountUpdate {
  accountNumber: string;
  discretionary: boolean;
  wrap: boolean;
  clientName: string;
  effectiveDate: string;
  feeType: string;
  feeAmount: string;
  advisorName: string;
  repCode: string;
}

// Push result
export interface PushResult {
  success: boolean;
  action: "pushed" | "nigo-replied" | "error";
  jiraCommentId?: string;
  orionUpdated?: boolean;
  errors?: string[];
}

// Filter types
export type StatusFilter = "all" | "pending" | "igo" | "nigo";
