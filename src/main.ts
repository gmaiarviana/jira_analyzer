import dotenv from 'dotenv';
import { JiraClient } from './core/jira-client.js';
import { loadJiraConfig, getMaxTickets, isDebugMode } from './utils/config.js';

// Load environment variables
dotenv.config();

async function main() {
    console.log('🎯 JIRA Analyzer - Starting...');
    
    try {
        // Load and validate configuration
        const jiraConfig = loadJiraConfig();
        const maxTickets = getMaxTickets();
        const debug = isDebugMode();
        
        if (debug) {
            console.log('🐛 Debug mode enabled');
            console.log(`📊 Max tickets: ${maxTickets}`);
        }
        
        console.log('✅ Configuration loaded successfully');
        
        // Initialize JIRA client
        const jiraClient = new JiraClient(jiraConfig);
        
        // Validate connection
        const isConnected = await jiraClient.validateConnection();
        
        if (!isConnected) {
            console.error('� Failed to connect to JIRA. Please check your credentials.');
            process.exit(1);
        }
        
        // Test basic search (simple validation)
        console.log('🧪 Testing basic JQL search...');
        const testResult = await jiraClient.searchIssues('key = "TEST-1" OR assignee = currentUser()', 1);
        console.log(`✅ JQL test successful - API responding correctly`);
        
        console.log('🔧 JIRA Client ready for data extraction');
        
    } catch (error: any) {
        console.error('💥 Startup error:', error.message);
        if (error.message.includes('Missing required environment variables')) {
            console.log('📋 Please copy .env.example to .env and fill in your JIRA credentials');
        }
        process.exit(1);
    }
}

// Handle errors gracefully
main().catch((error) => {
    console.error('💥 Unexpected error:', error.message);
    process.exit(1);
});