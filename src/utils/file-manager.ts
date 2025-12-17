import { writeFile, mkdir } from 'fs/promises';
import * as path from 'path';
import { ExtractedData, JiraTicket } from '../interfaces/jira-types.js';
import { FieldMappingsLoader } from '../config/field-mappings-loader.js';

export class FileManager {
  
  /**
   * Ensure required directories exist
   */
  async ensureDirectories(): Promise<void> {
    await mkdir('data/raw', { recursive: true });
    await mkdir('prompts', { recursive: true });
    await mkdir('responses', { recursive: true }); // Nova pasta para templates
  }

  /**
   * Save extracted data to JSON file
   */
  async saveExtractedData(data: ExtractedData): Promise<string> {
    await this.ensureDirectories();
    
    const filename = `jira-data-${data.timestamp}.json`;
    const filepath = path.join('data', 'raw', filename);
    
    console.log(`💾 Saving extracted data to: ${filepath}`);
    
    await writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✅ Data saved successfully - ${data.tickets.length} tickets`);
    
    return filepath;
  }

  /**
   * Save prompt file for GitHub Copilot
   */
  async savePromptFile(data: ExtractedData, analysisQuestion: string): Promise<string> {
    const filename = `copilot-prompt-${data.timestamp}.md`;
    const filepath = path.join('prompts', filename);
    
    const promptContent = this.generatePromptContent(data, analysisQuestion);
    
    console.log(`📝 Generating Copilot prompt: ${filepath}`);
    
    await writeFile(filepath, promptContent, 'utf8');
    
    console.log(`✅ Copilot prompt generated successfully`);
    
    return filepath;
  }

  /**
   * Save response template for GitHub Copilot
   */
  async saveResponseTemplate(data: ExtractedData): Promise<string> {
    const filename = `copilot-response-${data.timestamp}.md`;
    const filepath = path.join('responses', filename); // Nova pasta
    
    const templateContent = this.generateResponseTemplate(data);
    
    console.log(`📋 Generating response template: ${filepath}`);
    
    await writeFile(filepath, templateContent, 'utf8');
    
    console.log(`✅ Response template generated successfully`);
    
    return filepath;
  }

  /**
   * Generate structured prompt for Copilot (seguindo copilot-instructions.md)
   */
  private generatePromptContent(data: ExtractedData, analysisQuestion: string): string {
    const statusDistribution = this.calculateStatusDistribution(data.tickets);
    const priorityDistribution = this.calculatePriorityDistribution(data.tickets);
    const assigneeDistribution = this.calculateAssigneeDistribution(data.tickets);
    const fieldsUsed = data.fieldsUsed.join(', ');
    const schemaSection = this.buildSchemaSection(data);
    
    return `# Análise de Tickets JIRA - ${data.timestamp}

## Contexto
${analysisQuestion}

## JQL Query Executada
\`\`\`jql
${data.query}
\`\`\`

${schemaSection}

## Resumo Estatístico
- **Total encontrado**: ${data.totalTickets} tickets
- **Analisados**: ${data.tickets.length} tickets  
- **Extraído em**: ${new Date(data.extractedAt).toLocaleString('pt-BR')}
- **Campos extraídos**: ${fieldsUsed}

**Distribuições:**
- **Status**: ${statusDistribution}
- **Prioridade**: ${priorityDistribution}
- **Assignees**: ${assigneeDistribution}

## Dados Extraídos
\`\`\`json
${JSON.stringify(data.tickets, null, 2)}
\`\`\`

## Suas Capacidades
- Calcular totais, médias e distribuições (status, prioridade, time, sprint)
- Agrupar por time, sprint, epic, status e tipo
- Identificar gargalos, anomalias e outliers
- Comparar períodos, times ou sprints

## Exemplos de Perguntas
- Quais times concentram mais story points e bugs críticos?
- Quais tickets estão bloqueados há mais tempo?
- Como está a distribuição de tarefas por sprint e status?
- Quais epics ou features têm maior volume em aberto?

## Solicitação
Analise os dados acima e forneça insights sobre: **${analysisQuestion}**

Estruture sua resposta em:
1. **Resumo Executivo**
2. **Principais Achados**
3. **Recomendações**
4. **Próximos Passos**

Considere os seguintes aspectos na sua análise:
- Distribuição por status, prioridade e assignee
- Padrões temporais (criação vs atualização)
- Identificação de gargalos ou anomalias
- Sugestões práticas e acionáveis

**IMPORTANTE**: Esta é uma análise completa e independente. Use apenas os dados fornecidos acima.`;
  }

  /**
   * Build schema section describing base fields and selected mapped fields
   */
  private buildSchemaSection(data: ExtractedData): string {
    const baseSchema = [
      '- **key** (string): Identificador único do ticket (ex: TSW-1234)',
      '- **summary** (string): Título curto do ticket',
      '- **description** (string): Descrição detalhada',
      '- **status** (string): Estado atual (ex: To Do, In Progress, Done, Blocked)',
      '- **priority** (string): Prioridade (Highest, High, Medium, Low, Lowest)',
      '- **assignee** (string | null): Responsável atual',
      '- **reporter** (string): Quem criou o ticket',
      '- **created** (date): Data de criação (ISO)',
      '- **updated** (date): Última atualização (ISO)',
      '- **issueType** (string): Tipo do ticket (Story, Bug, Task, Sub-task, Epic)'
    ];

    const mappedFields = data.fieldsUsed.filter((field) => FieldMappingsLoader.fieldExists(field));

    const mappedSchema = mappedFields.map((fieldKey) => {
      const mapping = FieldMappingsLoader.getMapping(fieldKey);
      if (!mapping) return '';

      let line = `- **${fieldKey}** (${mapping.type}): ${mapping.description}`;

      if (mapping.values && mapping.values.length > 0) {
        line += ` | Valores: ${mapping.values.join(', ')}`;
      }

      if (mapping.nullable) {
        line += ' | (nullable)';
      }

      if (mapping.type === 'object' && fieldKey === 'sprint') {
        line += ' | Campos: name, state, startDate, endDate';
      }

      if (fieldKey === 'subtasksCount') {
        line += ' | Lista de subtasks: { key, summary }';
      }

      return line;
    }).filter(Boolean);

    const mappedSection = mappedSchema.length > 0
      ? mappedSchema.join('\n')
      : '- (nenhum campo custom solicitado)';

    return `## Schema dos Dados

Campos base (sempre presentes):
${baseSchema.join('\n')}

Campos solicitados nesta extração:
${mappedSection}`;
  }

  /**
   * Generate response template for Copilot to fill (seguindo copilot-instructions.md)
   */
  private generateResponseTemplate(data: ExtractedData): string {
    return `# Análise JIRA - ${data.timestamp}

## Resumo Executivo
<!-- Copilot: Preencha aqui -->

## Principais Achados
<!-- Copilot: Preencha aqui -->

## Recomendações
<!-- Copilot: Preencha aqui -->

## Próximos Passos
<!-- Copilot: Preencha aqui -->

---
*Análise gerada via GitHub Copilot em ${new Date().toLocaleString('pt-BR')}*

**Dados analisados**: ${data.tickets.length} de ${data.totalTickets} tickets  
**Query**: \`${data.query}\``;
  }

  /**
   * Calculate status distribution summary
   */
  private calculateStatusDistribution(tickets: JiraTicket[]): string {
    const statusCount = tickets.reduce((acc, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCount)
      .map(([status, count]) => `${status}(${count})`)
      .join(', ');
  }

  /**
   * Calculate priority distribution summary
   */
  private calculatePriorityDistribution(tickets: JiraTicket[]): string {
    const priorityCount = tickets.reduce((acc, ticket) => {
      acc[ticket.priority] = (acc[ticket.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(priorityCount)
      .map(([priority, count]) => `${priority}(${count})`)
      .join(', ');
  }

  /**
   * Calculate assignee distribution summary
   */
  private calculateAssigneeDistribution(tickets: JiraTicket[]): string {
    const assigneeCount = tickets.reduce((acc, ticket) => {
      const assignee = ticket.assignee || 'Unassigned';
      acc[assignee] = (acc[assignee] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalAssignees = Object.keys(assigneeCount).length;
    
    if (totalAssignees === 0) {
      return '0 pessoas';
    }
    
    const entries = Object.entries(assigneeCount);
    if (entries.length === 0) {
      return '0 pessoas';
    }
    
    const sortedAssignees = entries.sort(([,a], [,b]) => b - a);
    const topAssignee = sortedAssignees[0];
    
    if (!topAssignee) {
      return '0 pessoas';
    }
    
    const [topAssigneeName, topAssigneeCount] = topAssignee;
    
    return `${totalAssignees} pessoas, top: ${topAssigneeName}(${topAssigneeCount})`;
  }

  /**
   * Save query execution to history
   */
  async saveQueryToHistory(data: ExtractedData, promptPath: string): Promise<string> {
    await this.ensureDirectories();
    
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `queries-${date}.json`;
    const filepath = path.join('data', 'history', filename);
    
    // Ensure history directory exists
    await mkdir('data/history', { recursive: true });

    // Load existing history or start new
    let history: any[] = [];
    try {
      const existingContent = await import('fs/promises').then(fs => fs.readFile(filepath, 'utf8'));
      history = JSON.parse(existingContent);
    } catch {
      // File doesn't exist yet, start fresh
      history = [];
    }

    // Add new entry
    const entry = {
      timestamp: data.timestamp,
      jql: data.query,
      fields: data.fieldsUsed,
      ticketCount: data.tickets.length,
      dataPath: path.join('data', 'raw', `jira-data-${data.timestamp}.json`),
      promptPath: promptPath,
      extractedAt: data.extractedAt
    };

    history.push(entry);

    // Write updated history
    await writeFile(filepath, JSON.stringify(history, null, 2), 'utf8');

    console.log(`📜 Query salvo no histórico: ${filepath}`);

    return filepath;
  }
}
