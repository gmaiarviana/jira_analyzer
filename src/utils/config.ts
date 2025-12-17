import { JiraCredentials } from '../interfaces/jira-types.js';

export function loadJiraConfig(): JiraCredentials {
  const requiredVars = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return {
    baseUrl: process.env.JIRA_BASE_URL!,
    email: process.env.JIRA_EMAIL!,
    apiToken: process.env.JIRA_API_TOKEN!
  };
}

export function getMaxTickets(): number {
  return parseInt(process.env.MAX_TICKETS || '1000', 10);
}

export function isDebugMode(): boolean {
  return process.env.DEBUG === 'true';
}
