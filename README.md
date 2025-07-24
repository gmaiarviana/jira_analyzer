# 🎯 JIRA Analyzer - Extração de Dados para Análise com GitHub Copilot

Sistema para extração interativa de dados do JIRA via JQL com geração automática de prompts estruturados para análise com GitHub Copilot.

## 🚀 Início Rápido

### 1. Pré-requisitos
- Node.js 18+ instalado
- Credenciais JIRA (email + API token)

### 2. Setup
```bash
# Clone e instale dependências
npm install

# Configure credenciais JIRA
cp .env.example .env
# Edite .env com suas credenciais
```

### 3. Uso
```bash
npm run analyze
```

### 4. Fluxo de Trabalho
1. **Digite sua consulta JQL** (ex: `assignee = currentUser()`)
2. **Defina sua pergunta de análise** (ex: "Analise performance do sprint")
3. **Aguarde a extração** dos dados do JIRA
4. **Copie o prompt gerado** e cole no GitHub Copilot Chat
5. **Use a análise** do Copilot para insights acionáveis

## 📁 Arquivos Gerados

O sistema gera 3 arquivos com timestamp único:

```
data/raw/jira-data-2025-01-23T14-30-15.json         # Dados extraídos do JIRA
prompts/copilot-prompt-2025-01-23T14-30-15.md       # Para colar no Copilot
responses/copilot-response-2025-01-23T14-30-15.md   # Template de resposta
```

## ⚙️ Configuração (.env)

```bash
# Obrigatórias
JIRA_BASE_URL=https://sua-instancia-jira.com
JIRA_EMAIL=seu.email@empresa.com
JIRA_API_TOKEN=seu_token_api

# Opcionais
MAX_TICKETS=500        # Máximo de tickets por consulta
DEBUG=false            # Logs detalhados
```

### Como obter API Token JIRA
1. Acesse: JIRA → Profile → Personal Access Tokens
2. Crie novo token com permissões de leitura
3. Copie o token para JIRA_API_TOKEN

## 📊 Exemplos de Uso

### Consultas JQL Comuns
```jql
# Meus tickets em andamento
assignee = currentUser() AND status = "In Progress"

# Bugs críticos em aberto
priority = "Critical" AND type = "Bug" AND status != "Done"

# Sprint atual
project = "MYPROJECT" AND sprint in openSprints()

# Tickets antigos não resolvidos
created <= -30d AND status != "Done"
```

### Perguntas de Análise
- "Analise a distribuição de workload da equipe e identifique sobrecarga"
- "Identifique padrões em bugs críticos e sugira melhorias de processo"
- "Avalie a performance do sprint atual e gargalos"
- "Analise tickets com maior tempo de resolução"

## 🤖 Uso com GitHub Copilot

1. **Execute**: `npm run analyze`
2. **Abra**: `prompts/copilot-prompt-{timestamp}.md`
3. **Copie tudo** e cole no GitHub Copilot Chat
4. **Obtenha análise** estruturada automaticamente
5. **Documente**: Use `responses/copilot-response-{timestamp}.md`

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

## 📄 Licença

MIT License