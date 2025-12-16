import * as fs from 'fs';
import * as path from 'path';
import { FieldMappings } from '../interfaces/jira-types.js';

// Resolve mappings file path - works in both dev and built versions
const getMappingsPath = (): string => {
  const currentDir = process.cwd();
  const devPath = path.join(currentDir, 'src', 'config', 'field-mappings.json');
  const builtPath = path.join(currentDir, 'dist', 'config', 'field-mappings.json');
  const rootPath = path.join(currentDir, 'field-mappings.json');

  if (fs.existsSync(devPath)) return devPath;
  if (fs.existsSync(builtPath)) return builtPath;
  return rootPath;
};

export class FieldMappingsLoader {
  private static instance: FieldMappings | null = null;

  /**
   * Carrega o arquivo de field mappings
   */
  static load(): FieldMappings {
    if (this.instance) {
      return this.instance;
    }

    try {
      const mappingsPath = getMappingsPath();

      if (!fs.existsSync(mappingsPath)) {
        throw new Error(
          `Field mappings file not found at ${mappingsPath}`
        );
      }

      const rawData = fs.readFileSync(mappingsPath, 'utf-8');
      this.instance = JSON.parse(rawData) as FieldMappings;

      console.log(`✅ Loaded field mappings: ${Object.keys(this.instance).length} fields`);
      return this.instance;
    } catch (error) {
      console.error('❌ Failed to load field mappings:', error);
      throw error;
    }
  }

  /**
   * Obtém um mapeamento específico por chave
   */
  static getMapping(fieldKey: string): any {
    const mappings = this.load();
    return mappings[fieldKey] || null;
  }

  /**
   * Retorna lista de todas as chaves de campo disponíveis
   */
  static getAvailableFields(): string[] {
    const mappings = this.load();
    return Object.keys(mappings);
  }

  /**
   * Valida se um campo existe nos mappings
   */
  static fieldExists(fieldKey: string): boolean {
    const mappings = this.load();
    return fieldKey in mappings;
  }

  /**
   * Filtra campos por tipo
   */
  static getFieldsByType(type: string): string[] {
    const mappings = this.load();
    return Object.entries(mappings)
      .filter(([_, mapping]) => mapping.type === type)
      .map(([key, _]) => key);
  }

  /**
   * Retorna todos os campos que possuem valores predefinidos (enums)
   */
  static getEnumFields(): { [key: string]: string[] } {
    const mappings = this.load();
    const enumFields: { [key: string]: string[] } = {};

    Object.entries(mappings).forEach(([key, mapping]) => {
      if (mapping.values && mapping.values.length > 0) {
        enumFields[key] = mapping.values;
      }
    });

    return enumFields;
  }

  /**
   * Retorna descrição descritiva de um campo para prompts
   */
  static getFieldDescription(fieldKey: string): string {
    const mapping = this.getMapping(fieldKey);
    if (!mapping) return '';

    let description = `**${fieldKey}** (${mapping.type})`;
    description += `: ${mapping.description}`;

    if (mapping.values && mapping.values.length > 0) {
      description += `\n  Valores possíveis: ${mapping.values.join(', ')}`;
    }

    if (mapping.nullable) {
      description += ` [nullable]`;
    }

    return description;
  }

  /**
   * Gera schema markdown descritivo para uso em prompts Copilot
   */
  static generateSchemaMarkdown(selectedFields?: string[]): string {
    const mappings = this.load();
    const fields = selectedFields || Object.keys(mappings);

    let markdown = '## Schema dos Dados\n\n';
    markdown += 'Cada ticket contém os seguintes campos:\n\n';

    fields.forEach((fieldKey) => {
      const mapping = mappings[fieldKey];
      if (!mapping) return;

      markdown += `- **${fieldKey}** (\`${mapping.type}\`): ${mapping.description}`;

      if (mapping.values && mapping.values.length > 0) {
        markdown += `\n  - Valores: ${mapping.values.join(', ')}`;
      }

      if (mapping.nullable) {
        markdown += ` _(nullable)_`;
      }

      markdown += '\n';
    });

    return markdown;
  }

  /**
   * Retorna presets de campos para uso comum
   */
  static getPresets(): { [preset: string]: string[] } {
    return {
      sprint: ['storyPoints', 'team', 'status', 'assignee', 'sprint', 'issueType', 'priority'],
      bugs: ['priority', 'severity', 'reporter', 'rootCause', 'status', 'assignee', 'issueType'],
      features: ['epic', 'parentTask', 'subtasksCount', 'acceptanceCriteria', 'progress', 'status', 'issueType'],
      basic: ['status', 'priority', 'assignee', 'reporter', 'team', 'issueType']
    };
  }

  /**
   * Valida se um preset existe
   */
  static presetExists(presetName: string): boolean {
    const presets = this.getPresets();
    return presetName in presets;
  }

  /**
   * Obtém campos de um preset
   */
  static getPresetFields(presetName: string): string[] {
    const presets = this.getPresets();
    return presets[presetName] || [];
  }
}
