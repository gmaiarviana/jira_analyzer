# 🎯 JIRA Analyzer - Interactive Data Extraction & Analysis

Sistema completo para extração interativa de dados do JIRA via JQL com geração automática de prompts para análise com GitHub Copilot.

## ✨ Funcionalidades

- 🔍 **Input Interativo de JQL**: Interface amigável para entrada de consultas JQL
- 📊 **Extração Completa**: Normalização automática de dados dos tickets
- 📝 **Geração de Prompts**: Criação automática de prompts estruturados para Copilot
- 💾 **Salvamento Timestamped**: Arquivos organizados com timestamps únicos
- 🎨 **Templates de Resposta**: Modelos pré-formatados para análises

## 🚀 Início Rápido

### 1. Configuração
```bash
# Clone e instale dependências
npm install

# Configure credenciais
cp .env.example .env
# Edite .env com suas credenciais JIRA
```

### 2. Execução
```bash
npm start
```

### 3. Fluxo Interativo
1. **Digite sua consulta JQL** (ex: `assignee = currentUser()`)
2. **Defina sua pergunta de análise** (ex: "Analise performance do sprint")
3. **Aguarde a extração** dos dados
4. **Use os arquivos gerados** com GitHub Copilot

## 📁 Estrutura de Arquivos Gerados

```
data/
└── raw/
    └── jira-data-2025-01-23T14-30-15.json    # Dados extraídos

prompts/
├── copilot-prompt-2025-01-23T14-30-15.md    # Prompt para Copilot
└── copilot-response-2025-01-23T14-30-15.md  # Template de resposta
```

### Exemplo de Dados Extraídos
```json
{
  "timestamp": "2025-01-23T14-30-15",
  "query": "assignee = currentUser() AND status = 'In Progress'",
  "totalTickets": 25,
  "extractedAt": "2025-01-23T17:30:15.123Z",
  "maxResults": 500,
  "tickets": [
    {
      "key": "PROJ-123",
      "summary": "Implementar nova funcionalidade",
      "description": "Descrição detalhada...",
      "status": "In Progress",
      "priority": "High",
      "assignee": "João Silva",
      "reporter": "Maria Santos",
      "created": "2025-01-20T10:00:00.000Z",
      "updated": "2025-01-23T16:45:00.000Z"
    }
  ]
}
```

## 🤖 Uso com GitHub Copilot

### 1. Copiar Prompt
- Abra: `prompts/copilot-prompt-{timestamp}.md`
- Copie todo conteúdo
- Cole no GitHub Copilot Chat

### 2. Obter Análise
- Copilot analisa os dados automaticamente
- Gera insights estruturados
- Fornece recomendações acionáveis

### 3. Documentar Resposta
- Use: `prompts/copilot-response-{timestamp}.md`
- Preencha com insights do Copilot
- Mantenha histórico de análises

## 📊 Exemplos de Consultas JQL

### Performance de Sprint
```jql
project = "MYPROJECT" AND sprint in openSprints()
```

### Bugs Críticos
```jql
priority = "Critical" AND type = "Bug" AND status != "Done"
```

### Workload da Equipe
```jql
assignee in ("user1", "user2", "user3") AND status in ("To Do", "In Progress")
```

### Tickets Antigos
```jql
created <= -30d AND status != "Done" AND status != "Cancelled"
```

## 🛠️ Configuração Avançada

### Variáveis de Ambiente
```bash
# Obrigatórias
JIRA_BASE_URL=https://sua-instancia-jira.com
JIRA_EMAIL=seu.email@empresa.com
JIRA_API_TOKEN=seu_token_api

# Opcionais
MAX_TICKETS=500        # Máximo de tickets por consulta
DEBUG=false            # Modo debug (logs detalhados)
```

### Exemplos de Perguntas de Análise

**Performance:**
- "Analise a performance do sprint atual e identifique gargalos"
- "Avalie a distribuição de workload entre membros da equipe"

**Qualidade:**
- "Identifique padrões em bugs críticos e sugira melhorias"
- "Analise tickets com maior tempo de resolução"

**Processo:**
- "Revise fluxo de aprovações e identifique ineficiências"
- "Analise frequência de mudanças de prioridade"

## 🏗️ Arquitetura

```
src/
├── core/
│   ├── jira-client.ts      # Cliente JIRA com autenticação
│   └── data-extractor.ts   # Extração e normalização
├── interfaces/
│   └── jira-types.ts       # Tipos TypeScript
├── utils/
│   ├── config.ts           # Configurações
│   ├── input-handler.ts    # Interface interativa
│   └── file-manager.ts     # Gerenciamento de arquivos
└── main.ts                 # Ponto de entrada
```

## 🔧 Desenvolvimento

### Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Debug
```bash
DEBUG=true npm start
```

## 📝 Contribuição

1. Fork o projeto
2. Crie feature branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit mudanças (`git commit -am 'Add nova funcionalidade'`)
4. Push branch (`git push origin feature/nova-funcionalidade`)
5. Abra Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

**🎯 Fluxo Completo:**
Input JQL → Extração → Prompt Copilot → Análise → Insights Acionáveis
