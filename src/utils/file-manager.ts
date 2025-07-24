import { writeFile, mkdir } from 'fs/promises';
import * as path from 'path';
import { ExtractedData } from '../interfaces/jira-types.js';

export class FileManager {
  
  /**
   * Ensure required directories exist
   */
  async ensureDirectories(): Promise<void> {
    await mkdir('data/raw', { recursive: true });
    await mkdir('prompts', { recursive: true });
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
    const filepath = path.join('prompts', filename);
    
    const templateContent = this.generateResponseTemplate(data);
    
    console.log(`📋 Generating response template: ${filepath}`);
    
    await writeFile(filepath, templateContent, 'utf8');
    
    console.log(`✅ Response template generated successfully`);
    
    return filepath;
  }

  /**
   * Generate structured prompt for Copilot
   */
  private generatePromptContent(data: ExtractedData, analysisQuestion: string): string {
    return `# Análise de Tickets JIRA - ${data.timestamp}

## Contexto
${analysisQuestion}

## JQL Query Executada
\`\`\`
${data.query}
\`\`\`

## Resumo dos Dados
- **Total de tickets encontrados**: ${data.totalTickets}
- **Tickets extraídos**: ${data.tickets.length}
- **Data da extração**: ${new Date(data.extractedAt).toLocaleString('pt-BR')}

## Dados Extraídos
\`\`\`json
${JSON.stringify(data.tickets, null, 2)}
\`\`\`

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
- Sugestões práticas e acionáveis`;
  }

  /**
   * Generate response template for Copilot to fill
   */
  private generateResponseTemplate(data: ExtractedData): string {
    return `# Análise JIRA - ${data.timestamp}

## Resumo Executivo
<!-- Copilot: Preencha aqui com um resumo de 2-3 linhas dos principais insights -->

## Principais Achados
<!-- Copilot: Liste os 3-5 achados mais importantes da análise -->

## Recomendações
<!-- Copilot: Forneça recomendações práticas e acionáveis -->

## Próximos Passos
<!-- Copilot: Sugira próximos passos concretos -->

---
**Dados analisados**: ${data.tickets.length} tickets  
**Query**: \`${data.query}\`  
*Análise gerada via GitHub Copilot em ${new Date().toLocaleString('pt-BR')}*`;
  }
}
