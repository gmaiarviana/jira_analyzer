# 🎯 JIRA Analyzer

Sistema CLI para extração de dados do JIRA via JQL com geração automática de prompts estruturados para análise com GitHub Copilot.

---

## 🤖 Trabalhando com GitHub Copilot?

**Este projeto foi otimizado para análise assistida por IA.**

### → **[Veja o COPILOT WORKFLOW completo](COPILOT-WORKFLOW.md)** ←

O Copilot pode:
- ✅ Entender sua pergunta em linguagem natural
- ✅ Construir a query JQL apropriada consultando [10 queries pré-definidas](docs/jql-examples.md)
- ✅ Executar o analyzer automaticamente
- ✅ Analisar os dados extraídos e responder com insights acionáveis

**Exemplo:**
> Você: "Quero saber quantos tickets estão em progresso sem atualização desde dezembro"
> 
> Copilot: *[constrói query, executa, analisa e responde com lista de tickets + recomendações]*

---

## 🚀 Início Rápido

### Setup
```powershell
npm install
cp .env.example .env
# Configure JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN
```

### Uso
```powershell
# Modo interativo (menu com loop)
npm run analyze

# Modo automação (para Copilot)
$env:JQL='project = TSW AND status = "In Progress"'
$env:FIELDS_PRESET='sprint'
$env:ANALYSIS_QUESTION='Analise o progresso da sprint'
npm run analyze
```

### Saída
```
data/raw/jira-data-{timestamp}.json         # Dados extraídos
prompts/copilot-prompt-{timestamp}.md       # Prompt estruturado
responses/copilot-response-{timestamp}.md   # Template de análise
data/history/queries-{date}.json            # Histórico do dia
```

## ⚙️ Configuração

Crie `.env` na raiz:
```bash
JIRA_BASE_URL=https://sua-instancia-jira.com
JIRA_EMAIL=seu.email@empresa.com
JIRA_API_TOKEN=seu_token_api
MAX_TICKETS=500  # Opcional
```

**API Token:** JIRA → Profile → Personal Access Tokens

---

## 📚 Documentação

- **[COPILOT-WORKFLOW.md](COPILOT-WORKFLOW.md)** ← Guia completo (LEIA PRIMEIRO)
- **[docs/jql-examples.md](docs/jql-examples.md)** - 10 queries pré-definidas
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Arquitetura técnica
- **[ROADMAP.md](ROADMAP.md)** - Próximos épicos

---

## 🗺️ Campos e Presets

**15 campos mapeados:**
`storyPoints`, `team`, `sprint`, `epic`, `severity`, `rootCause`, `acceptanceCriteria`, `parentTask`, `subtasksCount`, `progress`, `priority`, `issueType`, `status`, `assignee`, `reporter`

**4 presets:**
`basic`, `sprint`, `bugs`, `features`

Ver `src/config/field-mappings.json` para detalhes

**Presets prontos:**
- `basic`: status, storyPoints, assignee
- `sprint`: status, storyPoints, assignee, sprint, priority
- `bugs`: priority, severity, status, rootCause, assignee
- `features`: epic, status, storyPoints, assignee, priority

## 📁 Estrutura do Projeto

```
jira-analyzer/
├── src/
│   ├── main.ts                      # Ponto de entrada (loop interativo)
│   ├── core/
│   │   ├── jira-client.ts          # Cliente da API JIRA
│   │   └── data-extractor.ts       # Normalização de dados
│   ├── config/
│   │   ├── field-mappings.json     # Mapeamento de campos customizados
│   │   └── field-mappings-loader.ts # Carregamento de mappings
│   ├── interfaces/
│   │   └── jira-types.ts           # Tipos TypeScript
│   └── utils/
│       ├── config.ts               # Variáveis de ambiente
│       ├── file-manager.ts         # Operações de I/O + histórico
│       └── input-handler.ts        # CLI interativo + menus
├── docs/
│   ├── jql-examples.md             # 10 queries pré-definidas
│   ├── COPILOT-WORKFLOW.md         # Guia de uso com Copilot
│   ├── ARCHITECTURE.md             # Documentação técnica
│   └── DEVELOPMENT_GUIDELINES.md   # Padrões de código
├── data/
│   ├── raw/                        # Dados JSON extraídos (gitignore)
│   └── history/                    # Histórico de queries (gitignore)
├── prompts/                        # Prompts gerados (gitignore)
├── responses/                      # Templates de resposta (gitignore)
└── ROADMAP.md                      # Planejamento de features
```

## 🛠️ Troubleshooting

### Erro de Autenticação
```
❌ JIRA Authentication failed - check credentials in .env
```
- Verifique JIRA_EMAIL e JIRA_API_TOKEN no .env
- Teste acesso manual ao JIRA

### Erro de Conexão
```
❌ JIRA Connection refused - check JIRA_BASE_URL in .env
```
- Verifique URL do JIRA (inclua https://)
- Teste conectividade de rede

### JQL Inválido
```
❌ Invalid JQL query: Field 'xyz' does not exist
```
- Valide sintaxe JQL no JIRA web interface
- Verifique nomes de campos customizados

## 🏗️ Para Desenvolvedores

### Scripts Disponíveis
```bash
npm run analyze    # Execução principal
npm run dev        # Modo desenvolvimento (watch)
npm run build      # Build TypeScript
npm run lint       # Linting código
```

### Estrutura do Código
```
src/
├── core/           # Lógica principal (JIRA client, extração)
├── interfaces/     # Tipos TypeScript
├── utils/          # Utilitários (config, inputs, arquivos)
└── main.ts         # Ponto de entrada
```

Ver `docs/ARCHITECTURE.md` para detalhes técnicos.

## Roteiro

Veja [ROADMAP.md](ROADMAP.md) para recursos planejados e melhorias.

## 📄 Licença

MIT License