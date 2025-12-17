# ROADMAP - JIRA Analyzer

## 📍 PRÓXIMOS PASSOS

### ÉPICO 1: CLI Inteligente com Metadados ⚡ ✅ CONCLUÍDO

**Objetivo:** Extrair dados JIRA com queries dinâmicas e gerar prompts com metadados ricos para Copilot interpretar corretamente.

**Contexto:** Atualmente o CLI extrai dados uma vez e contexto morre. Usuário precisa re-extrair tudo para cada nova pergunta. Além disso, JSON sem metadados confunde Copilot (campos customizados aparecem como "customfield_10016" sem explicação).

**Solução:** Queries dinâmicas + extração seletiva de campos + prompts com schema descritivo.

---

#### 1.1 Mapeamento de Campos Customizados

**Descrição:** Criar dicionário de campos customizados do JIRA HP com metadados semânticos.

**Arquivo a criar:** `src/config/field-mappings.json`

**Estrutura esperada:**
```json
{
  "storyPoints": {
    "jiraField": "customfield_10016",
    "type": "number",
    "description": "Esforço estimado em story points",
    "nullable": true
  },
  "team": {
    "jiraField": "customfield_20345", 
    "type": "string",
    "description": "Time de entrega (Squad)",
    "values": ["Aurora", "Phoenix", "Titan"]
  }
}
```

**Critérios de Aceite:**
- Deve mapear pelo menos 10 campos críticos (story points, team, sprint, epic, tipo, prioridade, severity, root cause, parent, subtasks)
- Deve incluir descrição semântica de cada campo
- Deve especificar tipo de dado (number, string, date, object, array)
- Deve documentar valores possíveis para enums (team, priority, status)

**Status:** ✅ CONCLUÍDO

**Implementação:** 
- `src/config/field-mappings.json` - 10 campos mapeados com metadados completos
- `src/config/field-mappings-loader.ts` - FieldMappingsLoader class com:
  - `load()` para carregar e cachear mappings
  - `getAvailableFields()` para listar campos
  - `fieldExists()` para validação
  - `getPresets()` com 4 presets prontos (sprint, bugs, features, basic)
  - `generateSchemaMarkdown()` para gerar documentação de schema
  - Filtros: `getFieldsByType()`, `getEnumFields()`
- Integrado em `src/main.ts` para carregar no startup
- Atualizado `src/interfaces/jira-types.ts` com interfaces FieldMapping e FieldMappings

---

#### 1.2 Extração Guiada por Campos

**Descrição:** Permitir usuário especificar quais campos extrair (ao invés de pegar tudo sempre).

**Arquivos modificados:**
- `src/main.ts` - adicionado input de campos
- `src/utils/input-handler.ts` - adicionado função askFields()
- `src/core/data-extractor.ts` - recebe lista de campos e extrai apenas esses

**Implementação:**
- InputHandler.askFields() com menu de presets
- Validação de campos customizados
- Suporte a variáveis de ambiente (FIELDS, FIELDS_PRESET)
- DataExtractor filtra campos corretamente
- Base fields sempre inclusos: key, summary, status

**Status:** ✅ CONCLUÍDO

---

#### 1.3 Prompt com Schema Descritivo

**Descrição:** Gerar prompt que EXPLICA cada campo pro Copilot, com schema descritivo e exemplos de uso.

**Arquivos modificados:**
- `src/utils/file-manager.ts` - implementado buildSchemaSection()

**Implementação:**
- Seção "Schema dos Dados" gerada automaticamente
- Base fields documentados com tipo e descrição
- Campos solicitados listados com valores possíveis (enums)
- Explicação de nullability
- Estrutura de objetos complexos (sprint com campos: name, state, startDate, endDate)
- Estatísticas gerais (distribuição por status, prioridade, assignees)
- Exemplos de perguntas relevantes ao contexto

**Status:** ✅ CONCLUÍDO

---

#### 1.4 Queries Rápidas (Loop CLI)

**Descrição:** Permitir re-extrair com query diferente sem reiniciar CLI.

**Arquivos modificados:**
- `src/main.ts` - implementado loop interativo
- `src/utils/input-handler.ts` - adicionado askMainMenu() e askLoopMenu()
- `src/utils/file-manager.ts` - adicionado saveQueryToHistory()

**Implementação:**
- Menu principal com opções: Nova query, Sair
- Loop CLI que mantém sessão ativa
- Suporte para nova query ou mesma query com campos novos
- Menu pós-extração com 4 opções: Nova query, Mesma query/campos novos, Voltar ao menu, Sair
- Histórico de queries salvo em data/history/queries-{date}.json
- Histórico contém: timestamp, jql, fields, ticketCount, dataPath, promptPath, extractedAt
- Modo não-interativo mantido quando JQL + ANALYSIS_QUESTION fornecidos via env

**Status:** ✅ CONCLUÍDO

---

## 🎯 PRÓXIMOS PASSOS

### ÉPICO 2: Melhorias de Usabilidade e Limites 🔄

**Objetivo:** Resolver limitações identificadas no uso real (campos nullos, limite de 1000 tickets, queries incompletas) e adicionar queries comuns faltantes.

**Contexto:** Durante análise Omnissa/Horizon, identificamos:
- Campos `team` e `epic` retornam null em muitos tickets (mapeamento incorreto ou campo diferente)
- Limite de 1000 tickets trunca resultados (860 encontrados, 1000 processados perde 0, mas queries maiores perdem dados)
- Faltam queries para casos comuns: Customer Issues, Tech Debt, Componentes, RFCs
- Usuário não é alertado quando dados são truncados

**Solução:** Investigação de campos + paginação automática + queries adicionais + warnings claros.

---

#### 2.1 Investigação de Campos Customizados

**Descrição:** Validar se campos `team` e `epic` usam customfields corretos no JIRA corporativo HP.

**Ações:**
- Executar query no JIRA com todos customfields: `/rest/api/2/field`
- Identificar customfield real para "Delivery Team" ou equivalente (pode ser outro nome)
- Identificar se epic usa `customfield_10020` ou `Epic Link` (outro customfield)
- Testar com tickets conhecidos que têm team/epic preenchidos
- Atualizar `field-mappings.json` com customfields corretos

**Arquivos modificados:**
- `src/config/field-mappings.json` - corrigir jiraField se necessário

**Critérios de Aceite:**
- Query com `team` retorna valores válidos (não null)
- Query com `epic` retorna epic links válidos
- Documentar se campo não existe no projeto TSW

**Status:** ⏳ TODO

---

#### 2.2 Paginação Automática

**Descrição:** Implementar busca paginada quando query retorna mais tickets que MAX_TICKETS.

**Arquivos a modificar:**
- `src/core/jira-client.ts` - adicionar método `searchAllIssues()` com paginação
- `src/core/data-extractor.ts` - usar paginação quando total > maxResults

**Implementação:**
```typescript
async searchAllIssues(jql: string, fields?: string[]): Promise<JiraIssue[]> {
  let startAt = 0;
  const maxResults = 100; // chunk size
  const allIssues: JiraIssue[] = [];
  
  while (true) {
    const response = await this.searchIssues(jql, maxResults, fields, startAt);
    allIssues.push(...response.issues);
    
    if (response.total <= startAt + maxResults) break;
    startAt += maxResults;
  }
  
  return allIssues;
}
```

**Critérios de Aceite:**
- Query com 2000+ tickets extrai todos sem truncar
- Progress indicator mostra progresso (ex: "Extraindo página 3/10...")
- Rate limiting respeitado (delay entre páginas se necessário)

**Status:** ⏳ TODO

---

#### 2.3 Warning de Dados Truncados

**Descrição:** Alertar usuário quando totalTickets > ticketsProcessados.

**Arquivos a modificar:**
- `src/main.ts` - adicionar warning após extração
- `src/utils/file-manager.ts` - incluir aviso no prompt gerado

**Implementação:**
```typescript
if (data.totalTickets > data.tickets.length) {
  console.warn(`⚠️  Atenção: ${data.totalTickets} tickets encontrados, mas apenas ${data.tickets.length} processados.`);
  console.warn(`   Use $env:MAX_TICKETS='${data.totalTickets}' ou refine a query JQL.`);
}
```

**Critérios de Aceite:**
- Console mostra warning quando dados truncados
- Prompt gerado inclui nota sobre truncamento
- Sugere aumentar MAX_TICKETS ou refinar query

**Status:** ⏳ TODO

---

#### 2.4 Queries Adicionais no jql-examples.md

**Descrição:** Adicionar 5 queries comuns faltantes na documentação.

**Arquivos a modificar:**
- `docs/jql-examples.md` - adicionar queries #12-16

**Queries a adicionar:**
- #12: Customer Issues recentes (últimos 90 dias)
- #13: Tech Debt / Maintenance
- #14: RFCs / Architecture Decisions
- #15: Trabalho por Componente
- #16: Subtasks órfãs (sem parent)

**Critérios de Aceite:**
- 5 novas queries documentadas
- Cada uma com: objetivo, JQL, campos sugeridos, análise sugerida
- Exemplos práticos de uso

**Status:** ⏳ TODO

---

#### 2.5 Documentar Limitações

**Descrição:** Adicionar seção no COPILOT-WORKFLOW.md sobre limites e work-arounds.

**Arquivos a modificar:**
- `COPILOT-WORKFLOW.md` - nova seção "Limitações e Work-arounds"

**Conteúdo:**
- Limite padrão: 1000 tickets (pode aumentar via MAX_TICKETS)
- Queries textuais (summary ~ "palavra") retornam muitos resultados
- Recomendação: refinar com filtros (issueType, status, created >= -180d)
- Alternativa: múltiplas queries segmentadas
- Futura solução: paginação automática (ÉPICO 2.2)

**Critérios de Aceite:**
- Seção clara e concisa (máx 15 linhas)
- Exemplos de refinamento de query
- Link para issue 2.2 (paginação)

**Status:** ⏳ TODO

---

## 💡 IDEIAS FUTURAS (Backlog)

Épicos não refinados, aguardando priorização:

- **ÉPICO 2:** Análise Visual (gráficos ASCII no terminal)
- **ÉPICO 3:** Exportar Relatórios (PDF, Excel, Confluence)
- **ÉPICO 4:** Integração MCP (agente autônomo)
- **ÉPICO 5:** Cache/Incremental (delta updates)

---

## ✅ CONCLUÍDO RECENTEMENTE

### ÉPICO 1: CLI Inteligente com Metadados ✅
- 1.1 Mapeamento de Campos Customizados ✅
- 1.2 Extração Guiada por Campos ✅
- 1.3 Prompt com Schema Descritivo ✅
- 1.4 Queries Rápidas (Loop CLI) ✅

---

**Última atualização:** Dezembro 17, 2025
