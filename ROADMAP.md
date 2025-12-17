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

## 💡 IDEIAS FUTURAS (Backlog)

Épicos não refinados, aguardando priorização:

- **ÉPICO 2:** Análise Visual (gráficos ASCII no terminal com blessed ou ink)
- **ÉPICO 3:** Exportar Relatórios (PDF via puppeteer, Excel via xlsx)
- **ÉPICO 4:** Integração MCP (quando ambiente corporativo permitir)
- **ÉPICO 5:** Cache de Queries (evitar re-extração de mesma JQL)

---

## ✅ CONCLUÍDO RECENTEMENTE

### ÉPICO 1: CLI Inteligente com Metadados ✅
- 1.1 Mapeamento de Campos Customizados ✅
- 1.2 Extração Guiada por Campos ✅
- 1.3 Prompt com Schema Descritivo ✅
- 1.4 Queries Rápidas (Loop CLI) ✅

---

**Última atualização:** Dezembro 17, 2025
