import axios, { AxiosInstance } from 'axios';
import * as https from 'https';
import { JiraCredentials, JiraSearchResponse, JiraAuthResponse } from '../interfaces/jira-types.js';

export class JiraClient {
  private axiosInstance: AxiosInstance;
  private credentials: JiraCredentials;

  constructor(credentials: JiraCredentials) {
    this.credentials = credentials;
    
    // Configure axios for HP corporate SSL (self-signed certificates)
    this.axiosInstance = axios.create({
      baseURL: credentials.baseUrl,
      timeout: 30000,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false // Accept self-signed certificates
      }),
      auth: {
        username: credentials.email,
        password: credentials.apiToken
      },
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Validate JIRA connection and credentials
   */
  async validateConnection(): Promise<boolean> {
    try {
      console.log('🔐 Validating JIRA credentials...');
      
      const response = await this.axiosInstance.get<JiraAuthResponse>('/rest/api/2/myself');
      
      if (response.data && response.data.active) {
        console.log(`✅ JIRA connection successful - User: ${response.data.displayName} (${response.data.emailAddress})`);
        return true;
      } else {
        console.error('❌ JIRA user is not active');
        return false;
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.error('❌ JIRA Authentication failed - check credentials in .env');
      } else if (error.response?.status === 403) {
        console.error('❌ JIRA Access denied - insufficient permissions');
      } else if (error.code === 'ECONNREFUSED') {
        console.error('❌ JIRA Connection refused - check JIRA_BASE_URL in .env');
      } else if (error.code === 'ENOTFOUND') {
        console.error('❌ JIRA Host not found - check JIRA_BASE_URL in .env');
      } else {
        console.error('❌ JIRA Connection error:', error.message);
      }
      return false;
    }
  }

  /**
   * Execute JQL search (basic implementation for validation)
   */
  async searchIssues(jql: string, maxResults: number = 50): Promise<JiraSearchResponse> {
    try {
      console.log(`🔍 Executing JQL: ${jql}`);
      console.log(`📊 Max results: ${maxResults}`);
      
      const response = await this.axiosInstance.get<JiraSearchResponse>('/rest/api/2/search', {
        params: {
          jql,
          maxResults,
          startAt: 0
        }
      });

      console.log(`✅ JQL executed successfully - Found ${response.data.total} tickets`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400) {
        const errorMessages = error.response.data?.errorMessages || ['Invalid JQL syntax'];
        throw new Error(`Invalid JQL query: ${errorMessages.join(', ')}`);
      } else if (error.response?.status === 401) {
        throw new Error('JIRA Authentication failed during search');
      } else {
        throw new Error(`JIRA API Error: ${error.message}`);
      }
    }
  }
}
