# ROADMAP - JIRA Analyzer

## 📍 PRÓXIMOS PASSOS

### ÉPICO 1: CLI Inteligente com Metadados ⚡ EM PROGRESSO

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

**Status:** ⏳ Não iniciado

---

#### 1.2 Extração Guiada por Campos

**Descrição:** Permitir usuário especificar quais campos extrair (ao invés de pegar tudo sempre).

**Arquivos a modificar:**
- `src/main.ts` - adicionar input de campos
- `src/utils/input-handler.ts` - adicionar função askFields()
- `src/core/data-extractor.ts` - receber lista de campos e extrair apenas esses

**Comportamento esperado:**
```bash
> Campos (deixe vazio para padrão básico):
  Ex: storyPoints, team, sprint, epic
  [Enter para padrão]

> Ou escolha preset:
  [1] Sprint (storyPoints, team, status, assignee, sprint)
  [2] Bugs (priority, severity, reporter, rootCause)
  [3] Features (epic, parent, subtasks, progress)
  [4] Custom

[Usuário digita: storyPoints, team, sprint]
✅ Extraindo campos: storyPoints, team, sprint
```

**Critérios de Aceite:**
- Deve permitir lista de campos separada por vírgula
- Deve ter 3 presets prontos (Sprint, Bugs, Features)
- Deve validar se campos existem no field-mappings.json
- Deve extrair apenas campos solicitados + campos base obrigatórios (key, summary, status)
- Se input vazio, usar preset padrão (campos base + storyPoints + team)

**Status:** ⏳ Não iniciado

---

#### 1.3 Prompt com Schema Descritivo

**Descrição:** Gerar prompt que EXPLICA cada campo pro Copilot, com schema descritivo e exemplos de uso.

**Arquivos a modificar:**
- `src/utils/file-manager.ts` - modificar generateCopilotPrompt()

**Estrutura esperada do prompt:**
```markdown
# Análise JIRA - [Título baseado em JQL]

Você é um analista de dados JIRA. Responda perguntas sobre estes [N] tickets.

## Schema dos Dados

Cada ticket contém:

- **key** (string): Identificador único (ex: TSW-1234)
- **summary** (string): Título do ticket
- **storyPoints** (number | null): Esforço estimado em pontos (0-13). Null = não estimado
- **team** (string): Time responsável - valores possíveis: Aurora, Phoenix, Titan
- **status** (string): Estado atual - valores: To Do, In Progress, Done, Blocked
- **sprint** (object | null): Sprint Scrum com propriedades:
  - name: Nome da sprint (ex: "Sprint 45")
  - state: Estado (active, closed, future)
  - startDate, endDate: Datas ISO

## Estatísticas Gerais

- Total de tickets: [N]
- Story points total: [X]
- Distribuição por status: [...]
- Distribuição por time: [...]

## Dados Extraídos
```json
[array de tickets]
```

## Suas Capacidades

- Calcular totais, médias, distribuições
- Agrupar por time, sprint, epic, status
- Identificar gargalos e anomalias
- Comparar períodos e times

## Exemplos de Perguntas

- Quantos story points o time Aurora completou?
- Qual o tempo médio de ciclo?
- Quais tasks estão abertas há mais tempo?
- Qual a distribuição de trabalho por time?

Pronto para sua primeira pergunta.
```

**Critérios de Aceite:**
- Deve incluir seção "Schema dos Dados" com descrição de cada campo extraído
- Deve explicar valores possíveis (enums) e nullability
- Deve mostrar estrutura de objetos complexos (sprint, epic)
- Deve incluir estatísticas gerais calculadas
- Deve incluir exemplos de perguntas relevantes ao contexto

**Status:** ⏳ Não iniciado

---

#### 1.4 Queries Rápidas (Loop CLI)

**Descrição:** Permitir re-extrair com query diferente sem reiniciar CLI.

**Arquivos a modificar:**
- `src/main.ts` - transformar fluxo linear em loop

**Comportamento esperado:**
```bash
npm run analyze

┌─────────────────────────────────┐
│ JIRA Analyzer - Menu Principal  │
├─────────────────────────────────┤
│ [1] Nova query                  │
│ [2] Sair                        │
└─────────────────────────────────┘

[1 - Nova query]
> JQL: project = TSW AND sprint in openSprints()
> Campos: [Enter para padrão]
> ✅ 465 tickets extraídos
> 📋 Prompt copiado para clipboard (se disponível)

┌─────────────────────────────────┐
│ [1] Nova query (diferente)      │
│ [2] Mesma query, campos novos   │
│ [3] Voltar ao menu              │
└─────────────────────────────────┘

[1 - Nova query]
> JQL: type = Bug AND priority = High
> Campos: priority, severity, rootCause
> ✅ 23 tickets extraídos
```

**Critérios de Aceite:**
- Deve manter CLI rodando entre queries (loop while)
- Deve permitir query completamente diferente
- Deve gerar novo prompt + salvar histórico a cada extração
- Deve salvar histórico em data/history/queries-{date}.json
- Histórico deve conter: {timestamp, jql, fields, ticketCount, promptPath}

**Status:** ⏳ Não iniciado

---

## 💡 IDEIAS FUTURAS (Backlog)

Épicos não refinados, aguardando priorização:

- **ÉPICO 2:** Análise Visual (gráficos ASCII no terminal com blessed ou ink)
- **ÉPICO 3:** Exportar Relatórios (PDF via puppeteer, Excel via xlsx)
- **ÉPICO 4:** Integração MCP (quando ambiente corporativo permitir)
- **ÉPICO 5:** Cache de Queries (evitar re-extração de mesma JQL)

---

## ✅ CONCLUÍDO RECENTEMENTE

Nenhum épico concluído ainda.

---

**Última atualização:** Dezembro 16, 2025
