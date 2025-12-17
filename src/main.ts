import * as dotenv from 'dotenv';
import { JiraClient } from './core/jira-client.js';
import { DataExtractor } from './core/data-extractor.js';
import { InputHandler } from './utils/input-handler.js';
import { FileManager } from './utils/file-manager.js';
import { loadJiraConfig, getMaxTickets, isDebugMode } from './utils/config.js';
import { FieldMappingsLoader } from './config/field-mappings-loader.js';

// Load environment variables
dotenv.config();

interface QueryContext {
  jqlQuery: string;
  fields: string[];
  presetUsed: string;
  analysisQuestion: string;
}

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
        
        // Initialize data extractor
        const dataExtractor = new DataExtractor(jiraClient);
        
        // Check if running in non-interactive mode (env vars provided)
        const isNonInteractive = process.env.JQL && process.env.ANALYSIS_QUESTION;
        
        if (isNonInteractive) {
            // Non-interactive mode: single extraction and exit
            const jqlQuery = process.env.JQL!;
            const fieldsResult = await getFieldsSelection(inputHandler);
            const analysisQuestion = process.env.ANALYSIS_QUESTION!;
            
            await executeQuery(
                jqlQuery,
                fieldsResult.fields,
                fieldsResult.presetUsed,
                analysisQuestion,
                dataExtractor,
                fileManager,
                maxTickets
            );
        } else {
            // Interactive mode: show menu and loop
            await interactiveLoop(inputHandler, dataExtractor, fileManager, maxTickets);
        }
        
    } catch (error: any) {
        console.error('💥 Error:', error.message);
        process.exit(1);
    } finally {
        inputHandler.close();
    }
}

/**
 * Interactive loop for multiple queries
 */
async function interactiveLoop(
    inputHandler: InputHandler,
    dataExtractor: DataExtractor,
    fileManager: FileManager,
    maxTickets: number
): Promise<void> {
    let shouldContinue = true;
    let lastContext: QueryContext | null = null;

    while (shouldContinue) {
        const menuChoice = await inputHandler.askMainMenu();

        if (menuChoice === 'exit') {
            console.log('\n👋 Encerrando JIRA Analyzer. Até logo!');
            shouldContinue = false;
            break;
        }

        // Get initial query context
        let context: QueryContext;
        const jqlQuery = await inputHandler.askJQL();
        const fieldsResult = await getFieldsSelection(inputHandler);
        const analysisQuestion = await inputHandler.askAnalysisQuestion();

        context = {
            jqlQuery,
            fields: fieldsResult.fields,
            presetUsed: fieldsResult.presetUsed,
            analysisQuestion
        };

        lastContext = context;

        // Execute query
        await executeQuery(
            context.jqlQuery,
            context.fields,
            context.presetUsed,
            context.analysisQuestion,
            dataExtractor,
            fileManager,
            maxTickets
        );

        // Show loop menu
        let loopContinues = true;
        while (loopContinues) {
            try {
                const loopChoice = await inputHandler.askLoopMenu();

                if (loopChoice === 'exit') {
                    console.log('\n👋 Encerrando JIRA Analyzer. Até logo!');
                    shouldContinue = false;
                    loopContinues = false;
                    break;
                }

                if (loopChoice === 'main-menu') {
                    loopContinues = false;
                    break;
                }

                if (loopChoice === 'new-query') {
                    loopContinues = false;
                    break;
                }

                if (loopChoice === 'same-query-new-fields' && lastContext) {
                    // Same query but new fields
                    const fieldsResult = await getFieldsSelection(inputHandler);
                    const newContext: QueryContext = { ...lastContext, fields: fieldsResult.fields, presetUsed: fieldsResult.presetUsed };

                    await executeQuery(
                        newContext.jqlQuery,
                        newContext.fields,
                        newContext.presetUsed,
                        newContext.analysisQuestion,
                        dataExtractor,
                        fileManager,
                        maxTickets
                    );

                    lastContext = newContext;
                }
            } catch (error: any) {
                console.error(`⚠️ ${error.message}`);
                // Continue loop menu on error
            }
        }
    }
}

/**
 * Execute a single query and save results
 */
async function executeQuery(
    jqlQuery: string,
    fields: string[],
    presetUsed: string,
    analysisQuestion: string,
    dataExtractor: DataExtractor,
    fileManager: FileManager,
    maxTickets: number
): Promise<void> {
    console.log(`\n📋 Execução:`);
    console.log(`   JQL: ${jqlQuery}`);
    console.log(`   Fields: ${fields.join(', ')} (preset: ${presetUsed})`);
    console.log(`   Analysis: ${analysisQuestion}`);
    console.log(`   Max tickets: ${maxTickets}`);
    
    // Extract data
    const extractedData = await dataExtractor.extractTickets(jqlQuery, maxTickets, fields);
    
    // Save files
    const dataFile = await fileManager.saveExtractedData(extractedData);
    const promptFile = await fileManager.savePromptFile(extractedData, analysisQuestion);
    const templateFile = await fileManager.saveResponseTemplate(extractedData);
    const historyFile = await fileManager.saveQueryToHistory(extractedData, promptFile);
    
    console.log(`\n✅ Execução concluída!`);
    console.log(`📁 Arquivos gerados:`);
    console.log(`   📊 Data: ${dataFile}`);
    console.log(`   📝 Copilot Prompt: ${promptFile}`);
    console.log(`   📋 Response Template: ${templateFile}`);
    console.log(`   📜 History: ${historyFile}`);
}

function getFieldsSelection(inputHandler: InputHandler): Promise<{ fields: string[]; presetUsed: string }> {
    // Env override: explicit field list (comma separated)
    const envFields = process.env.FIELDS;
    const envPreset = process.env.FIELDS_PRESET;

    if (envFields || envPreset) {
        if (envPreset && FieldMappingsLoader.presetExists(envPreset)) {
            return Promise.resolve({ fields: FieldMappingsLoader.getPresetFields(envPreset), presetUsed: envPreset });
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

            return Promise.resolve({ fields: Array.from(new Set(parsed)), presetUsed: 'env-custom' });
        }
    }

    // Interactive fallback
    return inputHandler.askFields();
}

// Handle errors gracefully
main().catch((error) => {
    console.error('💥 Unexpected error:', error.message);
    process.exit(1);
});