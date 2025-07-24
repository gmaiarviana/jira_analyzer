import * as dotenv from 'dotenv';
import { JiraClient } from './core/jira-client.js';
import { DataExtractor } from './core/data-extractor.js';
import { InputHandler } from './utils/input-handler.js';
import { FileManager } from './utils/file-manager.js';
import { loadJiraConfig, getMaxTickets, isDebugMode } from './utils/config.js';

// Load environment variables
dotenv.config();

async function main() {
    console.log('🎯 JIRA Analyzer - Starting...');
    
    const inputHandler = new InputHandler();
    const fileManager = new FileManager();
    
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
            console.error('💥 Failed to connect to JIRA. Please check your credentials.');
            process.exit(1);
        }
        
        console.log('🔧 JIRA Client ready for data extraction');
        
        // Interactive input for JQL and analysis question
        const jqlQuery = await inputHandler.askJQL();
        const analysisQuestion = await inputHandler.askAnalysisQuestion();
        
        console.log(`\n📋 Summary:`);
        console.log(`   JQL: ${jqlQuery}`);
        console.log(`   Analysis: ${analysisQuestion}`);
        console.log(`   Max tickets: ${maxTickets}`);
        
        // Initialize data extractor
        const dataExtractor = new DataExtractor(jiraClient);
        
        // Extract data
        const extractedData = await dataExtractor.extractTickets(jqlQuery, maxTickets);
        
        // Save files
        const dataFile = await fileManager.saveExtractedData(extractedData);
        const promptFile = await fileManager.savePromptFile(extractedData, analysisQuestion);
        const templateFile = await fileManager.saveResponseTemplate(extractedData);
        
        console.log(`\n🎉 Extraction completed successfully!`);
        console.log(`📁 Files generated:`);
        console.log(`   📊 Data: ${dataFile}`);
        console.log(`   📝 Copilot Prompt: ${promptFile}`);
        console.log(`   📋 Response Template: ${templateFile}`);
        console.log(`\n💡 Next steps:`);
        console.log(`   1. Open ${promptFile}`);
        console.log(`   2. Copy content and paste in GitHub Copilot Chat`);
        console.log(`   3. Use generated analysis to fill ${templateFile}`);
        
    } catch (error: any) {
        console.error('💥 Error:', error.message);
        process.exit(1);
    } finally {
        inputHandler.close();
    }
}

// Handle errors gracefully
main().catch((error) => {
    console.error('💥 Unexpected error:', error.message);
    process.exit(1);
});