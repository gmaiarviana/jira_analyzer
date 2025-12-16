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
# Modo interativo
npm run analyze

# Modo não-interativo (útil para automação/CI)
JQL="project = TSW AND statusCategory != Done" \
FIELDS_PRESET=basic \
ANALYSIS_QUESTION="Quantos itens abertos tem?" \
npm run analyze
```

## Como Funciona

1. **Conectar ao JIRA**: Autentique usando credenciais JIRA (configuradas em `.env`)
2. **Extrair Dados**: Execute o CLI (interativo ou via variáveis de ambiente) com JQL e seleção de campos/preset
3. **Gerar Prompt de Análise**: Sistema cria um prompt rico com schema descritivo dos campos extraídos
4. **Analisar com Copilot**: Copie o prompt gerado e cole no GitHub Copilot
5. **Iterar**: Rode novamente com JQL ou campos diferentes

### Principais Recursos

- 🎯 **Extração Seletiva**: Escolha campos (presets ou lista) e o cliente só busca o necessário
- 📋 **Schema no Prompt**: Prompts trazem seções com tipos, enums e nullability dos campos
- 🧭 **Presets Inteligentes**: Sprint, Bugs, Features, Basic
- 🔌 **Modo Não-Interativo**: Defina `JQL`, `FIELDS_PRESET` ou `FIELDS`, e `ANALYSIS_QUESTION` para automatizar
- 💬 **Pronto para Copilot**: Prompts estruturados para copiar/colar

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

## Uso

### Fluxo Básico
```bash
# Iniciar CLI interativa
npm run analyze

# Escolher ação
> [1] Nova consulta
> [2] Sair

# Digite sua JQL
> JQL: project = TSW AND sprint in openSprints()

# Selecione campos (ou pressione Enter para padrão)
> Campos: storyPoints, team, sprint
# Ou escolha preset: [1] Sprint [2] Bugs [3] Features [4] Personalizado

# Dados extraídos!
✅ 465 tickets extraídos
📋 Prompt gerado: prompts/copilot-prompt-2025-12-16T15-36-24.md
💾 Dados salvos: data/raw/jira-data-2025-12-16T15-36-24.json

# Copie o prompt para o GitHub Copilot e faça perguntas:
- "Quantos story points a equipe Aurora completou?"
- "Qual é o tempo médio de ciclo?"
- "Quais tarefas estão abertas há mais tempo?"

# Continue com consulta diferente
> [1] Nova consulta (JQL diferente)
> [2] Mesma consulta, campos diferentes
> [3] Sair
```

### Presets de Campos

- **Sprint**: storyPoints, team, status, assignee, sprint, issueType, priority
- **Bugs**: priority, severity, reporter, rootCause, status, assignee, issueType
- **Features**: epic, parentTask, subtasksCount, acceptanceCriteria, progress, status, issueType
- **Basic**: status, priority, assignee, reporter, team, issueType (padrão)

## Mapeamento de Campos

O sistema mapeia campos customizados do JIRA para nomes legíveis. Configuração em `src/config/field-mappings.json`.

Campos comuns:
- `storyPoints` → Estimativa de story points
- `team` → Equipe de entrega/squad
- `sprint` → Objeto de sprint Scrum
- `epic` → Vínculo de epic
- `severity` → Severidade de bug
- `rootCause` → Análise de causa raiz

Os prompts gerados incluem descrições completas do esquema para que o Copilot entenda sua estrutura de dados.

## Estrutura do Projeto

```
jira-analyzer/
├── src/
│   ├── main.ts              # Ponto de entrada (loop interativo)
│   ├── core/
│   │   ├── jira-client.ts   # Cliente da API JIRA
│   │   └── data-extractor.ts # Normalização de dados
│   ├── config/
│   │   └── field-mappings.json # Mapeamento de campos customizados
│   ├── interfaces/
│   │   └── jira-types.ts    # Tipos TypeScript
│   └── utils/
│       ├── config.ts        # Variáveis de ambiente
│       ├── file-manager.ts  # Operações de I/O de arquivo
│       └── input-handler.ts # Manipulação de entrada CLI
├── data/
│   ├── raw/                 # Dados JSON extraídos
│   └── history/             # Histórico de consultas
├── prompts/                 # Prompts Copilot gerados
└── responses/               # Templates de análise
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