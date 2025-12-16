import * as dotenv from 'dotenv';
import { JiraClient } from './core/jira-client.js';
import { DataExtractor } from './core/data-extractor.js';
import { InputHandler } from './utils/input-handler.js';
import { FileManager } from './utils/file-manager.js';
import { loadJiraConfig, getMaxTickets, isDebugMode } from './utils/config.js';
import { FieldMappingsLoader } from './config/field-mappings-loader.js';

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
        
        // Load field mappings
        FieldMappingsLoader.load();
        console.log(`📋 Field mappings available: ${FieldMappingsLoader.getAvailableFields().length} fields`);
        
        // Initialize JIRA client
        const jiraClient = new JiraClient(jiraConfig);
        
        // Validate connection
        const isConnected = await jiraClient.validateConnection();
        
        if (!isConnected) {
            console.error('💥 Failed to connect to JIRA. Please check your credentials.');
            process.exit(1);
        }
        
        console.log('🔧 JIRA Client ready for data extraction');
        
        // Inputs (env overrides allow non-interactive runs)
        const jqlQuery = process.env.JQL ?? await inputHandler.askJQL();
        const fieldsResult = getFieldsSelection(inputHandler);
        const fields = fieldsResult.fields;
        const presetUsed = fieldsResult.presetUsed;
        const analysisQuestion = process.env.ANALYSIS_QUESTION ?? await inputHandler.askAnalysisQuestion();
        
        console.log(`\n📋 Summary:`);
        console.log(`   JQL: ${jqlQuery}`);
        console.log(`   Fields: ${fields.join(', ')} (preset: ${presetUsed})`);
        console.log(`   Analysis: ${analysisQuestion}`);
        console.log(`   Max tickets: ${maxTickets}`);
        
        // Initialize data extractor
        const dataExtractor = new DataExtractor(jiraClient);
        
        // Extract data
        const extractedData = await dataExtractor.extractTickets(jqlQuery, maxTickets, fields);
        
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

function getFieldsSelection(inputHandler: InputHandler): { fields: string[]; presetUsed: string } {
    // Env override: explicit field list (comma separated)
    const envFields = process.env.FIELDS;
    const envPreset = process.env.FIELDS_PRESET;

    if (envFields || envPreset) {
        if (envPreset && FieldMappingsLoader.presetExists(envPreset)) {
            return { fields: FieldMappingsLoader.getPresetFields(envPreset), presetUsed: envPreset };
        }

        if (envFields) {
            const parsed = envFields
                .split(',')
                .map((f) => f.trim())
                .filter(Boolean);

            const baseFields = ['key', 'summary', 'status'];
            const invalid = parsed.filter((field) => !baseFields.includes(field) && !FieldMappingsLoader.fieldExists(field));

            if (invalid.length > 0) {
                throw new Error(`FIELDS contém campos inválidos: ${invalid.join(', ')}`);
            }

            return { fields: Array.from(new Set(parsed)), presetUsed: 'env-custom' };
        }
    }

    // Interactive fallback
    return inputHandler.askFields();
}