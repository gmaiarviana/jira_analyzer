export interface JiraCredentials {
  baseUrl: string;
  email: string;
  apiToken: string;
}

export interface JiraTicket {
  key: string;
  summary: string;
  description: string;
  status: string;
  priority: string;
  assignee: string | null;
  reporter: string;
  created: string;
  updated: string;
}

export interface JiraSearchResponse {
  total: number;
  startAt: number;
  maxResults: number;
  issues: any[];
}

export interface JiraAuthResponse {
  displayName: string;
  emailAddress: string;
  active: boolean;
}

export interface ExtractedData {
  timestamp: string;
  query: string;
  totalTickets: number;
  extractedAt: string;
  maxResults: number;
  tickets: JiraTicket[];
}
