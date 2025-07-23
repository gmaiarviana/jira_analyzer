# Arquitetura Técnica - JIRA Analyzer

## Visão Geral
Sistema para extração de dados do JIRA via JQL e análise conversacional com GitHub Copilot. Desenvolvido para ambiente corporativo HP com Docker.

## Contexto do Usuário
- **Ambiente:** VS Code + PowerShell + GitHub Copilot
- **JIRA:** HP Corporate (SSL self-signed certificates)
- **Workflow:** AI-powered development (Cursor/Copilot para código, Claude para validação)

## Fluxo Principal
```
1. npm run analyze
2. Input interativo: JQL + pergunta de análise
3. Sistema extrai dados do JIRA → salva JSON timestamped
4. Gera 2 arquivos:
   - copilot-prompt-{timestamp}.md (para colar no chat)
   - copilot-response-{timestamp}.md (template para Copilot preencher)
5. Usuário: Ctrl+C prompt → Ctrl+V no Copilot Chat
6. Copilot: Preenche template com análise
```

## Arquitetura de Módulos

### Core Components
```
src/
├── core/
│   ├── jira-client.ts        # Cliente JIRA (auth + SSL handling)
│   ├── data-extractor.ts     # Extração e normalização de dados
│   └── prompt-generator.ts   # Geração de prompts estruturados
├── interfaces/
│   ├── jira-types.ts         # Interfaces para dados do JIRA
│   └── analysis-types.ts     # Interfaces para análises
└── utils/
    ├── file-manager.ts       # Gerenciamento de arquivos timestamped
    ├── input-handler.ts      # Inputs interativos do usuário
    └── config.ts             # Configurações e validação .env
```

### Estrutura de Dados
```
data/
├── raw/                      # JSONs brutos do JIRA
│   └── jira-data-{timestamp}.json
└── processed/               # Dados normalizados
    └── tickets-{timestamp}.json

prompts/
├── copilot-prompt-{timestamp}.md      # Para colar no chat
└── copilot-response-{timestamp}.md    # Template para análise
```

## Dados do JIRA

### Campos Extraídos
**Básicos:**
- key, summary, description
- status, priority, assignee, reporter
- created, updated

**Específicos HP:**
- acceptance_criteria (campo customizado)
- sprint, parent, fixVersion
- target_end_date
- epic_link, story_points

**Relacionais:**
- comments (últimos 5)
- transitions (se disponível sem overhead)

### Limites e Performance
- **Max tickets:** 500 por query
- **SSL:** Ignore self-signed certificates (corporate)
- **Cache:** Arquivos timestamped para referência (não reutilização automática)

## Containerização

### Docker Strategy
```
docker/
├── Dockerfile                # Node.js + TypeScript
├── docker-compose.yml        # Volume mounts para .env e outputs
└── .dockerignore
```

### Volume Mounts
- `.env` → configurações JIRA
- `data/` → persistência de extrações
- `prompts/` → outputs para usuário

## Configuração

### .env.example
```bash
# JIRA Configuration
JIRA_BASE_URL=https://hp-jira.external.hp.com
JIRA_EMAIL=seu_email@hp.com
JIRA_API_TOKEN=seu_token

# Output Configuration
MAX_TICKETS=500
INCLUDE_TRANSITIONS=false
```

### package.json Scripts
```json
{
  "scripts": {
    "analyze": "tsx src/main.ts",
    "dev": "tsx --watch src/main.ts"
  }
}
```

### Docker Commands
```bash
# Build container
docker-compose build

# Run analysis
docker-compose run --rm analyzer npm run analyze

# Development mode
docker-compose run --rm analyzer npm run dev

# Shell access
docker-compose run --rm analyzer bash
```

## Integração com GitHub Copilot

### Prompt Structure
```markdown
# Análise de Tickets JIRA - {timestamp}

## Contexto
{user_query}

## Dados Extraídos
{structured_json_data}

## Solicitação
Analise os dados acima e forneça insights sobre: {user_question}

Estruture sua resposta em:
1. **Resumo Executivo**
2. **Principais Achados**
3. **Recomendações**
4. **Próximos Passos**
```

### Template Response
```markdown
# Análise JIRA - {timestamp}

## Resumo Executivo
<!-- Copilot: Preencha aqui -->

## Principais Achados
<!-- Copilot: Preencha aqui -->

## Recomendações
<!-- Copilot: Preencha aqui -->

## Próximos Passos
<!-- Copilot: Preencha aqui -->

---
*Análise gerada via GitHub Copilot em {timestamp}*
```

## Considerações Técnicas

### Error Handling
- Validação de credenciais JIRA
- Tratamento de SSL self-signed
- Fallback para campos customizados ausentes
- Validação de JQL syntax

### Type Safety
- Interfaces TypeScript para todos os dados
- Validação runtime com zod (opcional)
- Strict typing para campos customizados HP

### Performance
- Paginação automática para queries grandes
- Timeout configurável para requests
- Rate limiting respeitoso ao JIRA

## Dependencies

### Core
- `axios` - HTTP client
- `dotenv` - Environment configuration
- `tsx` - TypeScript execution

### Development
- `typescript` - Type system
- `@types/node` - Node.js types

### Docker
- Base: `node:20-alpine`
- Multi-stage build para otimização

## Extensibilidade Futura

### Análises Avançadas
- Correlações epic-story
- Análise temporal de trends
- Métricas de performance de equipe

### Integrações
- Slack notifications
- Confluence documentation
- Dashboard web (opcional)

### Output Formats
- PDF reports
- CSV exports
- Dashboard JSON

## Debugging e Logs

### Log Structure
```
[TIMESTAMP] [LEVEL] [COMPONENT] Message
2025-07-23T14:30:00Z INFO JIRA_CLIENT Authenticated successfully
2025-07-23T14:30:01Z INFO DATA_EXTRACTOR Fetching 450 tickets
```

### Debug Mode
- `DEBUG=true` para logs detalhados
- Raw JIRA responses salvos em debug/
- Performance timing para otimização