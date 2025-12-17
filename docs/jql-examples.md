# JQL Query Examples - Referência para Análises

Este documento contém queries JQL pré-definidas e padrões comuns para facilitar análises específicas no JIRA Analyzer.

## 📋 Estrutura de Query Básica

```jql
project = <PROJECT> 
AND "Delivery Team" = "<TEAM>" 
AND type in (<TYPES>) 
AND status [= | in] (<STATUS>) 
AND updated [< | > | >=] <DATE>
ORDER BY <FIELD> [ASC | DESC]
```

---

## 🎯 Queries por Objetivo

### 1. Tickets Parados (In Progress sem atualização recente)

**Objetivo:** Identificar tickets em progresso que não foram atualizados há muito tempo (possível impedimento).

**Query:**
```jql
project = TSW 
AND "Delivery Team" = "Team Aurora" 
AND type in (Story, Bug) 
AND status = "In Progress" 
AND updated < 2025-12-01 
ORDER BY updated ASC
```

**Campos sugeridos:** `status, assignee, updated, storyPoints, priority`

**Análise sugerida:** "Identifique tickets em progresso sem atualização recente, possíveis impedimentos ou tickets esquecidos"

---

### 2. Sprint Performance (Tickets da sprint atual)

**Objetivo:** Analisar progresso e distribuição de trabalho na sprint ativa.

**Query:**
```jql
project = TSW 
AND "Delivery Team" = "Team Aurora" 
AND sprint in openSprints() 
AND type in (Story, Bug, Task)
ORDER BY status, priority DESC
```

**Campos sugeridos:** `status, storyPoints, assignee, sprint, priority`

**Análise sugerida:** "Analise o progresso da sprint atual, distribuição de story points por status e pessoa"

---

### 3. Bugs Críticos em Aberto

**Objetivo:** Identificar bugs de alta prioridade que precisam atenção imediata.

**Query:**
```jql
project = TSW 
AND "Delivery Team" = "Team Aurora" 
AND type = Bug 
AND priority in (Highest, High) 
AND status not in (Resolved, Closed, Done)
ORDER BY priority DESC, created ASC
```

**Campos sugeridos:** `priority, severity, status, rootCause, assignee, created`

**Análise sugerida:** "Liste bugs críticos em aberto, identificando padrões de rootCause e tempo em aberto"

---

### 4. Workload por Pessoa

**Objetivo:** Ver distribuição de trabalho entre membros do time.

**Query:**
```jql
project = TSW 
AND "Delivery Team" = "Team Aurora" 
AND status not in (Done, Closed, Resolved) 
AND type in (Story, Bug, Task)
ORDER BY assignee, priority DESC
```

**Campos sugeridos:** `assignee, status, storyPoints, priority, issueType`

**Análise sugerida:** "Analise a distribuição de trabalho ativo por pessoa, identificando sobrecarga ou ociosidade"

---

### 5. Épicos em Progresso

**Objetivo:** Ver status geral de épicos/features em andamento.

**Query:**
```jql
project = TSW 
AND "Delivery Team" = "Team Aurora" 
AND type in (Story, Task, Bug) 
AND epic is not EMPTY 
AND status not in (Done, Closed)
ORDER BY epic, status
```

**Campos sugeridos:** `epic, status, storyPoints, assignee, priority`

**Análise sugerida:** "Agrupe tickets por épico e mostre progresso de cada feature"

---

### 6. Tickets Criados Recentemente (Últimos 7 dias)

**Objetivo:** Ver novos tickets que entraram no backlog.

**Query:**
```jql
project = TSW 
AND "Delivery Team" = "Team Aurora" 
AND created >= -7d 
AND type in (Story, Bug, Task)
ORDER BY created DESC
```

**Campos sugeridos:** `created, status, priority, issueType, reporter`

**Análise sugerida:** "Liste tickets criados na última semana e identifique padrões de demanda"

---

### 7. Subtasks Pendentes

**Objetivo:** Ver subtasks em aberto que podem estar bloqueando stories.

**Query:**
```jql
project = TSW 
AND "Delivery Team" = "Team Aurora" 
AND type = Sub-task 
AND status not in (Done, Closed) 
AND parent is not EMPTY
ORDER BY parent, status
```

**Campos sugeridos:** `key, summary, status, assignee, epicParent, subtasksCount`

**Análise sugerida:** "Identifique subtasks pendentes e suas stories pai, possíveis bloqueadores"

---

### 8. Tickets sem Story Points

**Objetivo:** Identificar tickets que precisam de estimativa.

**Query:**
```jql
project = TSW 
AND "Delivery Team" = "Team Aurora" 
AND type in (Story, Bug) 
AND "Story Points" is EMPTY 
AND status not in (Done, Closed)
ORDER BY created ASC
```

**Campos sugeridos:** `status, assignee, created, priority, issueType`

**Análise sugerida:** "Liste tickets sem estimativa que precisam de refinamento"

---

### 9. Velocidade das Últimas 3 Sprints

**Objetivo:** Calcular velocidade média do time.

**Query:**
```jql
project = TSW 
AND "Delivery Team" = "Team Aurora" 
AND sprint in closedSprints() 
AND type in (Story, Bug) 
AND status in (Done, Closed)
ORDER BY sprint DESC
```

**Campos sugeridos:** `sprint, storyPoints, status, issueType`

**Análise sugerida:** "Calcule story points completados por sprint e velocidade média do time"

---

### 10. Tickets Bloqueados

**Objetivo:** Ver tickets que estão impedidos.

**Query:**
```jql
project = TSW 
AND "Delivery Team" = "Team Aurora" 
AND status = Blocked 
AND type in (Story, Bug, Task)
ORDER BY updated ASC
```

**Campos sugeridos:** `status, assignee, updated, priority, storyPoints`

**Análise sugerida:** "Liste tickets bloqueados, tempo bloqueado e responsáveis"

---

### 11. Buscar por Texto Livre / Entender Produto

**Objetivo:** Encontrar tickets relacionados a um produto, feature ou termo específico.

**Query:**
```jql
project = TSW 
AND (summary ~ "TermoBusca" OR description ~ "TermoBusca") 
ORDER BY created DESC
```

**Variações:**
```jql
-- Apenas épicos de um produto
AND issueType = Epic

-- Apenas trabalho ativo
AND status not in (Done, Closed, Resolved)

-- Últimos 6 meses
AND created >= -180d
```

**Campos sugeridos:** `status, issueType, assignee, epic, priority, created`

**Análise sugerida:** "Identifique épicos, times envolvidos e escopo do produto/feature"

---

## 🔍 Padrões de Filtros Comuns

### Filtros de Data
- **Últimos N dias:** `created >= -7d` ou `updated >= -30d`
- **Antes de data específica:** `updated < 2025-12-01`
- **Entre datas:** `created >= 2025-11-01 AND created <= 2025-11-30`
- **Ano/mês específico:** `created >= 2025-11-01 AND created < 2025-12-01`

### Filtros de Sprint
- **Sprint ativa:** `sprint in openSprints()`
- **Sprints fechadas:** `sprint in closedSprints()`
- **Sprint específica:** `sprint = "Sprint 45"`
- **Últimas N sprints:** `sprint in closedSprints() ORDER BY sprint DESC` (limitar com maxResults)

### Filtros de Status
- **Em aberto:** `status not in (Done, Closed, Resolved)`
- **Ativos:** `status in ("In Progress", "In Review", "Testing")`
- **Finalizados:** `status in (Done, Closed, Resolved)`

### Filtros de Prioridade
- **Críticos:** `priority in (Highest, High, P0-Blocker, P1-Must)`
- **Baixa prioridade:** `priority in (Low, Lowest, P3-Could)`

---

## 💡 Dicas de Uso

1. **Sempre especifique ORDER BY** para resultados consistentes
2. **Use "Delivery Team"** entre aspas (campo customizado com espaço)
3. **Combine filtros** para análises mais específicas
4. **Limite resultados** com maxResults se a query retornar muitos tickets
5. **Campos sugeridos** variam por tipo de análise - escolha os relevantes

---

## 🤖 Uso com Copilot

Quando perguntar ao Copilot, ele pode usar estas queries como referência:

**Exemplo de pergunta:** "Quero saber quantos tickets estão em progresso e a última atualização foi antes de Dezembro/25"

**Copilot deve construir:**
```jql
project = TSW 
AND "Delivery Team" = "Team Aurora" 
AND type in (Story, Bug) 
AND status = "In Progress" 
AND updated < 2025-12-01 
ORDER BY updated ASC
```

**Campos:** `status, assignee, updated, storyPoints, priority`

**Análise:** "Identifique tickets em progresso sem atualização recente, possíveis impedimentos"

---

**Última atualização:** Dezembro 17, 2025
