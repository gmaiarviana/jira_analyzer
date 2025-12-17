# Copilot Workflow - Como Usar o JIRA Analyzer

Este guia descreve o processo completo para o GitHub Copilot ajudar usuários a analisar dados do JIRA de forma automatizada.

---

## 🎯 Objetivo

Permitir que o usuário faça perguntas em linguagem natural e o Copilot:
1. **Entenda** a pergunta
2. **Construa** a query JQL apropriada
3. **Execute** o JIRA Analyzer
4. **Analise** os dados extraídos
5. **Responda** com insights acionáveis

---

## 📚 Arquivos de Referência

### 1. **JQL Query Examples** (`docs/jql-examples.md`)
- Contém 10 queries pré-definidas por objetivo
- Padrões de filtros (data, sprint, status, prioridade)
- Sugestões de campos por tipo de análise
- Exemplos de análises sugeridas

### 2. **Field Mappings** (`src/config/field-mappings.json`)
- 15 campos customizados mapeados
- Tipos de dados e descrições
- Valores possíveis (enums)
- 4 presets prontos: basic, sprint, bugs, features

### 3. **Copilot Instructions** (`.github/copilot-instructions.md`)
- Contexto do ambiente HP corporativo
- Preferências de implementação
- Padrões de desenvolvimento

---

## 🔄 Workflow Completo

### **Passo 1: Usuário faz pergunta**

**Exemplo:**
> "Quero saber quantos tickets estão em progresso e a última atualização foi antes de Dezembro/25"

### **Passo 2: Copilot analisa a intenção**

**Checklist de análise:**
- [ ] Qual o objetivo? → Identificar tickets parados
- [ ] Quais filtros? → status = "In Progress" AND updated < 2025-12-01
- [ ] Que projeto/time? → TSW, Team Aurora (padrão se não especificado)
- [ ] Quais campos importantes? → status, assignee, updated, storyPoints, priority

**Consultar:** `docs/jql-examples.md` → Query #1 (Tickets Parados)

### **Passo 3: Copilot constrói a query JQL**

**Template base:**
```jql
project = TSW 
AND "Delivery Team" = "Team Aurora" 
AND type in (Story, Bug) 
AND status = "In Progress" 
AND updated < 2025-12-01 
ORDER BY updated ASC
```

**Campos sugeridos:** `status,assignee,storyPoints,priority`

**Análise sugerida:** "Identifique tickets em progresso sem atualização recente (antes de dezembro/2025), possíveis impedimentos ou tickets esquecidos"

### **Passo 4: Copilot executa o JIRA Analyzer**

**Comando PowerShell:**
```powershell
cd 'C:\Users\guilherme_viana\Desktop\WATAM\jira-analyzer'
$env:JQL='project = TSW AND "Delivery Team" = "Team Aurora" AND type in (Story, Bug) AND status = "In Progress" AND updated < 2025-12-01 ORDER BY updated ASC'
$env:FIELDS='status,assignee,storyPoints,priority'
$env:ANALYSIS_QUESTION='Identifique tickets em progresso sem atualização recente (antes de dezembro/2025), possíveis impedimentos ou tickets esquecidos'
npm run analyze
```

**Saída esperada:**
- ✅ Extração concluída
- 📁 Arquivos gerados:
  - `data/raw/jira-data-{timestamp}.json`
  - `prompts/copilot-prompt-{timestamp}.md`
  - `responses/copilot-response-{timestamp}.md`
  - `data/history/queries-{timestamp}.json`

### **Passo 5: Copilot lê o prompt gerado**

**Arquivo:** `prompts/copilot-prompt-{timestamp}.md`

Contém:
- Contexto da análise
- JQL executada
- Schema dos dados (explicação de cada campo)
- Estatísticas gerais
- **Dados extraídos em JSON**
- Capacidades de análise
- Exemplos de perguntas

### **Passo 6: Copilot analisa os dados**

**Estrutura de análise:**

1. **Resumo Executivo**
   - Quantidade total de tickets
   - Gravidade da situação
   - Principais números

2. **Principais Achados**
   - Tickets mais antigos sem atualização
   - Distribuição por pessoa
   - Story points em risco
   - Padrões identificados

3. **Recomendações**
   - Ações prioritárias
   - Responsáveis sugeridos
   - Timeboxing sugerido

4. **Próximos Passos**
   - Checklist de ações
   - Follow-up sugerido

### **Passo 7: Copilot responde ao usuário**

**Formato da resposta:**
```markdown
## 📊 Análise: Tickets Parados

### Resumo Executivo
Encontrei **14 tickets** em progresso sem atualização desde dezembro/2025...

### Principais Achados
- **TSW-12345** (8 SP) - Última atualização: 15/11/2025 (32 dias parado)
  - Assignee: João Silva
  - Prioridade: High
  - Possível impedimento técnico

[continua com insights detalhados]

### Recomendações
1. **Urgente:** Contatar João Silva sobre TSW-12345
2. **Prioridade:** Review semanal de tickets sem update > 7 dias
3. **Processo:** Implementar daily check-in para tickets In Progress

### Próximos Passos
- [ ] Daily com time Aurora para discutir impedimentos
- [ ] Atualizar status de todos os 14 tickets até 20/12
- [ ] Criar alerta automático para tickets parados > 7 dias
```

---

## 🎯 Mapeamento: Perguntas → Queries

### **"Tickets parados"**
→ Query #1: `status = "In Progress" AND updated < [data]`
→ Campos: `status, assignee, updated, storyPoints, priority`

### **"Performance da sprint"**
→ Query #2: `sprint in openSprints()`
→ Campos: `status, storyPoints, assignee, sprint, priority`

### **"Bugs críticos"**
→ Query #3: `type = Bug AND priority in (Highest, High) AND status not in (Done, Closed)`
→ Campos: `priority, severity, status, rootCause, assignee, created`

### **"Carga de trabalho"** / "Workload"
→ Query #4: `status not in (Done, Closed) ORDER BY assignee`
→ Campos: `assignee, status, storyPoints, priority, issueType`

### **"Status de épicos"** / "Features em andamento"
→ Query #5: `epic is not EMPTY AND status not in (Done, Closed)`
→ Campos: `epic, status, storyPoints, assignee, priority`

### **"Novos tickets"** / "Demanda recente"
→ Query #6: `created >= -7d`
→ Campos: `created, status, priority, issueType, reporter`

### **"Subtasks pendentes"** / "Bloqueadores"
→ Query #7: `type = Sub-task AND status not in (Done, Closed)`
→ Campos: `key, summary, status, assignee, epicParent`

### **"Tickets sem estimativa"**
→ Query #8: `"Story Points" is EMPTY AND status not in (Done, Closed)`
→ Campos: `status, assignee, created, priority, issueType`

### **"Velocidade do time"**
→ Query #9: `sprint in closedSprints() AND status in (Done, Closed)`
→ Campos: `sprint, storyPoints, status, issueType`

### **"Tickets bloqueados"**
→ Query #10: `status = Blocked`
→ Campos: `status, assignee, updated, priority, storyPoints`

---

## 🔧 Comandos de Execução

### **Modo Não-Interativo (Recomendado para Copilot)**
```powershell
cd 'C:\Users\guilherme_viana\Desktop\WATAM\jira-analyzer'
$env:JQL='<query_jql>'
$env:FIELDS='<campos_separados_por_virgula>'
$env:ANALYSIS_QUESTION='<pergunta_do_usuario>'
npm run analyze
```

### **Modo Interativo (Usuário manual)**
```powershell
cd 'C:\Users\guilherme_viana\Desktop\WATAM\jira-analyzer'
npm run analyze
# Seguir prompts no terminal
```

### **Presets de Campos**
Alternativamente, usar presets ao invés de listar campos:
```powershell
$env:FIELDS_PRESET='sprint'  # ou 'bugs', 'features', 'basic'
```

**Presets disponíveis:**
- `basic`: status, storyPoints, assignee
- `sprint`: status, storyPoints, assignee, sprint, priority
- `bugs`: priority, severity, status, rootCause, assignee
- `features`: epic, status, storyPoints, assignee, priority

---

## 📁 Estrutura de Saída

### **data/raw/jira-data-{timestamp}.json**
Dados brutos extraídos do JIRA com metadados:
```json
{
  "timestamp": "2025-12-17T12-43-47",
  "query": "project = TSW AND ...",
  "totalTickets": 14,
  "extractedAt": "2025-12-17T12:43:47.123Z",
  "tickets": [...],
  "fieldsUsed": ["status", "assignee", ...]
}
```

### **prompts/copilot-prompt-{timestamp}.md**
Prompt estruturado para análise do Copilot contendo:
- Contexto e JQL
- Schema descritivo dos dados
- Estatísticas gerais
- Dados em JSON
- Exemplos de análise

### **responses/copilot-response-{timestamp}.md**
Template vazio para preencher com análise

### **data/history/queries-{date}.json**
Histórico de todas as queries do dia:
```json
[
  {
    "timestamp": "2025-12-17T12-43-47",
    "jql": "...",
    "fields": [...],
    "ticketCount": 14,
    "dataPath": "data/raw/...",
    "promptPath": "prompts/...",
    "extractedAt": "..."
  }
]
```

---

## 🤖 Visão Futura: MCP Server

**Objetivo final:** Copilot como agente autônomo que:
1. Recebe pergunta em linguagem natural
2. Consulta `docs/jql-examples.md` via MCP
3. Constrói query JQL automaticamente
4. Executa `npm run analyze` via MCP tool
5. Lê prompt gerado
6. Analisa dados e responde

**Tecnologias necessárias:**
- MCP (Model Context Protocol)
- Tool calling para executar comandos
- File reading para ler prompts gerados
- Context management para manter histórico

**Atualmente implementado:**
- ✅ Documentação estruturada
- ✅ Queries pré-definidas
- ✅ CLI não-interativo (env vars)
- ✅ Prompts auto-descritivos
- ⏳ MCP server (futuro)

---

## 💡 Dicas para o Copilot

1. **Sempre consulte `docs/jql-examples.md`** antes de construir queries
2. **Use presets de campos** quando possível (sprint, bugs, features)
3. **Especifique ORDER BY** para resultados consistentes
4. **Campos com espaços** precisam de aspas: `"Delivery Team"`
5. **Datas relativas** funcionam: `created >= -7d`, `updated < 2025-12-01`
6. **Leia o prompt gerado** (`prompts/copilot-prompt-*.md`) para ter contexto completo
7. **Estruture respostas** em: Resumo → Achados → Recomendações → Próximos Passos

---

**Última atualização:** Dezembro 17, 2025
