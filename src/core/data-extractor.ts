import { JiraClient } from './jira-client.js';
import { JiraTicket, JiraSearchResponse, ExtractedData } from '../interfaces/jira-types.js';

export class DataExtractor {
  private jiraClient: JiraClient;

  constructor(jiraClient: JiraClient) {
    this.jiraClient = jiraClient;
  }

  /**
   * Extract ticket data using JQL query
   */
  async extractTickets(jql: string, maxResults: number): Promise<ExtractedData> {
    console.log(`\n🔄 Starting data extraction...`);
    console.log(`📊 Max results: ${maxResults}`);
    
    const timestamp = this.generateTimestamp();
    const extractedAt = new Date().toISOString();
    
    // Execute JQL search
    const searchResponse = await this.jiraClient.searchIssues(jql, maxResults);
    
    console.log(`📋 Processing ${searchResponse.issues.length} tickets...`);
    
    // Extract and normalize ticket data
    const tickets: JiraTicket[] = searchResponse.issues.map(issue => this.normalizeTicket(issue));
    
    console.log(`✅ Data extraction completed - ${tickets.length} tickets processed`);
    
    return {
      timestamp,
      query: jql,
      totalTickets: searchResponse.total,
      extractedAt,
      maxResults,
      tickets
    };
  }

  /**
   * Normalize JIRA issue to our ticket format
   */
  private normalizeTicket(issue: any): JiraTicket {
    const fields = issue.fields;
    
    return {
      key: issue.key,
      summary: fields.summary || '',
      description: fields.description || '',
      status: fields.status?.name || 'Unknown',
      priority: fields.priority?.name || 'Unknown',
      assignee: fields.assignee?.displayName || null,
      reporter: fields.reporter?.displayName || 'Unknown',
      created: fields.created || '',
      updated: fields.updated || ''
    };
  }

  /**
   * Generate consistent timestamp for file naming
   */
  private generateTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }
}
