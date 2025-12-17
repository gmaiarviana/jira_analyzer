import * as readline from 'readline';
import { FieldMappingsLoader } from '../config/field-mappings-loader.js';

export class InputHandler {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Ask a question and wait for user input
   */
  askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Ask for JQL query with validation
   */
  async askJQL(): Promise<string> {
    console.log('\n📝 Enter your JQL query:');
    console.log('Examples:');
    console.log('  - assignee = currentUser()');
    console.log('  - project = "MYPROJECT" AND status = "In Progress"');
    console.log('  - created >= -30d AND priority = High');
    
    const jql = await this.askQuestion('\n🔍 JQL Query: ');
    
    if (!jql) {
      throw new Error('JQL query cannot be empty');
    }
    
    return jql;
  }

  /**
   * Ask for analysis question
   */
  async askAnalysisQuestion(): Promise<string> {
    console.log('\n💭 What analysis do you want to perform?');
    console.log('Examples:');
    console.log('  - Analyze sprint performance and identify bottlenecks');
    console.log('  - Review bug patterns and suggest improvements');
    console.log('  - Evaluate team workload distribution');
    
    const question = await this.askQuestion('\n❓ Analysis Question: ');
    
    if (!question) {
      throw new Error('Analysis question cannot be empty');
    }
    
    return question;
  }

  /**
   * Ask which fields should be extracted (supports presets)
   */
  async askFields(): Promise<{ fields: string[]; presetUsed: string }> {
    const presets = FieldMappingsLoader.getPresets();
    const presetNames = Object.keys(presets);

    console.log('\n🎛️  Campos para extrair (deixe vazio para preset básico)');
    presetNames.forEach((name, index) => {
      const presetFields = presets[name];
      if (presetFields) {
        const fields = presetFields.join(', ');
        console.log(`  [${index + 1}] ${name} → ${fields}`);
      }
    });
    console.log('  [Custom] Digite lista separada por vírgula (ex: storyPoints, team, sprint)');

    const answer = await this.askQuestion('\n📌 Campos ou número do preset: ');

    // Default: basic preset
    if (!answer) {
      return {
        fields: presets.basic ?? [],
        presetUsed: 'basic'
      };
    }

    const numericOption = Number(answer);
    if (!Number.isNaN(numericOption) && numericOption >= 1 && numericOption <= presetNames.length) {
      const presetName = presetNames[numericOption - 1];
      if (presetName) {
        const presetFields = presets[presetName];
        if (presetFields) {
          return {
            fields: presetFields,
            presetUsed: presetName
          };
        }
      }
    }

    // Custom list
    const parsed = answer
      .split(',')
      .map((field) => field.trim())
      .filter(Boolean);

    if (parsed.length === 0) {
      throw new Error('Lista de campos vazia. Use Enter para preset básico ou informe os campos.');
    }

    // Allow base fields even if not mapped (key/summary/status) and validate mapped ones
    const baseFields = ['key', 'summary', 'status'];
    const invalid = parsed.filter(
      (field) => !baseFields.includes(field) && !FieldMappingsLoader.fieldExists(field)
    );

    if (invalid.length > 0) {
      throw new Error(`Campos inválidos: ${invalid.join(', ')}`);
    }

    const deduped = Array.from(new Set(parsed));

    return {
      fields: deduped,
      presetUsed: 'custom'
    };
  }

  /**
   * Close the readline interface
   */
  close(): void {
    this.rl.close();
  }
}
