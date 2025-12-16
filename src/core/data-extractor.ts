import { JiraClient } from './jira-client.js';
import { ExtractedData, JiraTicket, TicketFieldValue } from '../interfaces/jira-types.js';
import { FieldMappingsLoader } from '../config/field-mappings-loader.js';
import { FieldMapping } from '../interfaces/jira-types.js';

export class DataExtractor {
  private jiraClient: JiraClient;

  constructor(jiraClient: JiraClient) {
    this.jiraClient = jiraClient;
  }

  /**
   * Extract ticket data using JQL query
   */
  async extractTickets(jql: string, maxResults: number, selectedFields: string[]): Promise<ExtractedData> {
    console.log(`\n🔄 Starting data extraction...`);
    console.log(`📊 Max results: ${maxResults}`);
    
    const timestamp = this.generateTimestamp();
    const extractedAt = new Date().toISOString();

    const baseFields = ['key', 'summary', 'status'];
    const requestedFields = selectedFields && selectedFields.length > 0
      ? selectedFields
      : FieldMappingsLoader.getPresetFields('basic');

    const fieldsForExtraction = Array.from(new Set([...baseFields, ...requestedFields]));
    const jiraFields = this.buildJiraFields(fieldsForExtraction);

    // Execute JQL search
    const searchResponse = await this.jiraClient.searchIssues(jql, maxResults, jiraFields);

    console.log(`📋 Processing ${searchResponse.issues.length} tickets...`);

    // Extract and normalize ticket data
    const tickets: JiraTicket[] = searchResponse.issues.map((issue) =>
      this.normalizeTicket(issue, fieldsForExtraction)
    );

    console.log(`✅ Data extraction completed - ${tickets.length} tickets processed`);

    return {
      timestamp,
      query: jql,
      totalTickets: searchResponse.total,
      extractedAt,
      maxResults,
      tickets,
      fieldsUsed: fieldsForExtraction,
      fieldMappingsUsed: requestedFields
    };
  }

  /**
   * Normalize JIRA issue to our ticket format
   */
  private normalizeTicket(issue: any, fieldsForExtraction: string[]): JiraTicket {
    const fields = issue.fields;

    const ticket: JiraTicket = {
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

    fieldsForExtraction.forEach((fieldKey) => {
      if (fieldKey === 'key' || fieldKey === 'summary' || fieldKey === 'status') {
        return;
      }

      const mapping = FieldMappingsLoader.getMapping(fieldKey) as FieldMapping | null;
      if (!mapping) {
        return;
      }

      ticket[fieldKey] = this.mapFieldValue(fields, mapping);
    });

    return ticket;
  }

  /**
   * Generate consistent timestamp for file naming
   */
  private generateTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }

  /**
   * Build the list of JIRA fields to request based on selected semantic keys
   */
  private buildJiraFields(fieldKeys: string[]): string[] {
    const standardFields = ['summary', 'description', 'status', 'priority', 'assignee', 'reporter', 'created', 'updated', 'issuetype'];
    const jiraFields = new Set<string>(standardFields);

    fieldKeys.forEach((fieldKey) => {
      const mapping = FieldMappingsLoader.getMapping(fieldKey) as FieldMapping | null;
      if (mapping) {
        jiraFields.add(mapping.jiraField);
      }
    });

    return Array.from(jiraFields);
  }

  /**
   * Map a JIRA field value to a normalized format according to the mapping metadata
   */
  private mapFieldValue(fields: any, mapping: FieldMapping): TicketFieldValue {
    const raw = fields[mapping.jiraField];

    switch (mapping.jiraField) {
      case 'status':
      case 'priority':
      case 'issuetype':
        return raw?.name ?? null;

      case 'assignee':
      case 'reporter':
        return raw?.displayName ?? null;

      case 'subtasks':
        if (!Array.isArray(raw)) return [];
        return raw.map((subtask: any) => ({ key: subtask.key, summary: subtask.fields?.summary || '' }));

      case 'customfield_10021': // sprint
        return this.normalizeSprint(raw);

      default:
        return raw ?? null;
    }
  }

  /**
   * Normalize sprint field structure
   */
  private normalizeSprint(raw: any): TicketFieldValue {
    if (!raw) return null;

    const sprint = Array.isArray(raw) ? raw[0] : raw;
    if (!sprint) return null;

    // Some JIRA instances return sprint as string; best-effort parse
    if (typeof sprint === 'string') {
      return sprint;
    }

    return {
      name: sprint.name || null,
      state: sprint.state || null,
      startDate: sprint.startDate || null,
      endDate: sprint.endDate || null
    };
  }
}
