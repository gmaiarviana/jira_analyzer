# Arquitetura - JIRA Analyzer

## Visão Geral

JIRA Analyzer é uma ferramenta CLI que extrai dados do JIRA e gera prompts ricos para análise com GitHub Copilot. Desenvolvida em TypeScript, foca em flexibilidade e integração com Copilot.

## Princípios de Design

1. **Simplicidade**: Sem gerenciamento de estado complexo, fluxo direto de dados
2. **Flexibilidade**: Consultas dinâmicas e seleção de campos
3. **Copilot-First**: Prompts otimizados com metadados ricos
4. **Transparência**: Extração clara de dados e geração de prompts

## Diagrama da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         User                                │
└────────────────┬───────────────────────────┬────────────────┘
                 │                           │
                 │ JQL + Fields              │ Copy/Paste
                 ▼                           ▼
┌────────────────────────────────┐  ┌──────────────────────┐
│       JIRA Analyzer CLI        │  │   GitHub Copilot     │
│                                │  │                      │
│  ┌──────────────────────────┐  │  │  Analyzes data       │
│  │  Input Handler           │  │  │  Answers questions   │
│  │  - JQL query             │  │  │  Provides insights   │
│  │  - Field selection       │  │  │                      │
│  └──────────┬───────────────┘  │  └──────────────────────┘
│             ▼                  │
│  ┌──────────────────────────┐  │
│  │  Field Mappings          │  │
│  │  - Custom field IDs      │  │
│  │  - Metadata & schemas    │  │
│  └──────────┬───────────────┘  │
│             ▼                  │
│  ┌──────────────────────────┐  │
│  │  JIRA Client             │  │
│  │  - HTTP requests (Axios) │  │
│  │  - Authentication        │  │
│  └──────────┬───────────────┘  │
│             ▼                  │
│  ┌──────────────────────────┐  │
│  │  Data Extractor          │  │
│  │  - Normalize responses   │  │
│  │  - Map custom fields     │  │
│  └──────────┬───────────────┘  │
│             ▼                  │
│  ┌──────────────────────────┐  │
│  │  File Manager            │  │
│  │  - Save raw data         │  │
│  │  - Generate prompt       │  │
│  │  - Save history          │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│        JIRA HP API                     │
│  (https://hp-jira.external.hp.com)   │
└────────────────────────────────────────┘
```

## Componentes Principais

### 1. Input Handler (`input-handler.ts`)
- Prompts CLI interativos usando readline
- Coleta JQL, seleção de campos, escolhas de presets
- Valida entrada do usuário

### 2. Mapeamento de Campos (`config/field-mappings.json` + `config/field-mappings-loader.ts`)
- **JSON**: Mapeia IDs de campos customizados do JIRA para nomes semânticos
  - Inclui: `jiraField`, `type`, `description`, `nullable`, `values`
  - Campos críticos cobertos: storyPoints, team, sprint, epic, rootCause, severity, acceptanceCriteria, parentTask, subtasksCount, progress, priority, issueType, status, assignee, reporter
  - Define presets de campos (Sprint, Bugs, Features, Basic)

- **Loader (TypeScript)**: Classe FieldMappingsLoader com métodos utilitários:
  - `load()`: Carrega e cacheia mappings
  - `getAvailableFields()`: Lista todos os campos
  - `fieldExists()`: Valida existência
  - `getFieldsByType()`: Filtra por tipo de dado
  - `getEnumFields()`: Retorna campos com valores predefinidos
  - `getPresets()`: 4 presets prontos para uso
  - `generateSchemaMarkdown()`: Gera documentação descritiva para prompts

### 3. Cliente JIRA (`jira-client.ts`)
- Cliente HTTP baseado em Axios
- Gerencia autenticação (Basic Auth com token de API)
- Executa buscas JQL (`/rest/api/2/search`)
- Valida conexão (`/rest/api/2/myself`)

### 4. Extrator de Dados (`data-extractor.ts`)
- Normaliza respostas da API JIRA
- **Integração com Field Mappings**: Mapeia campos customizados usando FieldMappingsLoader
- Extrai apenas campos solicitados (presets ou lista custom) e adiciona base (key, summary, status)
- Calcula estatísticas (distribuição de status, totais de story points)

### 5. Gerenciador de Arquivos (`file-manager.ts`)
- Salva dados JSON brutos em `data/raw/`
- Gera prompts Copilot com schema descritivo (tipos, enums, nullability, estrutura de sprint/subtasks)
- Cria templates de resposta em `responses/`
- Mantém histórico de consultas em `data/history/`

### 6. Fluxo Principal (`main.ts`)
- Ponto de entrada e orquestração
- **Carrega Field Mappings** no startup (FieldMappingsLoader.load())
- Suporta modo interativo ou não-interativo via variáveis de ambiente: `JQL`, `FIELDS_PRESET`/`FIELDS`, `ANALYSIS_QUESTION`
- Tratamento de erros e feedback ao usuário

## Fluxo de Dados

```
Entrada do Usuário (JQL + Campos)
    ↓
Mapeamento de Campos (resolver IDs de campos customizados)
    ↓
Cliente JIRA (executar requisição da API)
    ↓
Extrator de Dados (normalizar e mapear)
    ↓
Gerenciador de Arquivos (salvar dados + gerar prompt)
    ↓
Usuário (copiar prompt para Copilot)
    ↓
Copilot (analisar e responder)
```

## Decisões Arquiteturais Principais

### Por que sem Gerenciamento de Sessões/Contexto?

- **Simplicidade**: Evitar complexidade de persistência de estado
- **Flexibilidade**: Usuários consultam exatamente o que precisam
- **Força do Copilot**: Deixar Copilot lidar com conversas multi-turno
- **Escopo Claro**: Cada extração é auto-contida e auditável

### Por que Mapeamento de Campos em JSON?

- **Manutenibilidade**: Não-desenvolvedores podem atualizar mapeamentos
- **Transparência**: Documentação clara do significado de cada campo
- **Extensibilidade**: Fácil adicionar novos campos sem mudanças de código

### Por que Copiar/Colar para o Copilot?

- **Confiabilidade**: Sem dependência de setup de servidor MCP
- **Debugabilidade**: Usuário vê exatamente quais dados são enviados
- **Flexibilidade**: Funciona com qualquer LLM (ChatGPT, Claude, etc)

## Stack Tecnológico

- **Linguagem**: TypeScript 5.3.0
- **Runtime**: Node.js ≥18
- **Executor**: tsx (sem etapa de build)
- **Cliente HTTP**: Axios 1.6.0
- **Config**: dotenv 16.3.1

## Estrutura de Arquivos

```
jira-analyzer/
├── src/
│   ├── main.ts                    # Ponto de entrada & loop
│   ├── core/
│   │   ├── jira-client.ts         # Cliente da API
│   │   └── data-extractor.ts      # Normalização
│   ├── config/
│   │   └── field-mappings.json    # Metadados de campos
│   ├── interfaces/
│   │   └── jira-types.ts          # Tipos TypeScript
│   └── utils/
│       ├── config.ts              # Variáveis de ambiente
│       ├── file-manager.ts        # Operações de I/O
│       └── input-handler.ts       # Entrada do usuário
├── data/
│   ├── raw/                       # Dados extraídos
│   └── history/                   # Log de consultas
├── prompts/                       # Prompts gerados
└── responses/                     # Templates
```

## Pontos de Extensão

### Adicionando Novos Tipos de Campo

Adicione a `field-mappings.json`:

```json
{
  "newField": {
    "jiraField": "customfield_XXXXX",
    "type": "string",
    "description": "Descrição para Copilot"
  }
}
```

O Extrator de Dados manipula automaticamente o mapeamento

### Adicionando Novos Presets

Atualize `field-mappings.json`:

```json
{
  "presets": {
    "newPreset": {
      "name": "Meu Preset Personalizado",
      "fields": ["field1", "field2", "field3"]
    }
  }
}
```

Então atualize `input-handler.ts` para exibir a nova opção de preset

## Melhorias Futuras

- **Cache**: Armazenar consultas recentes para evitar re-fetching
- **Integração MCP**: Quando o ambiente corporativo permitir
- **Exportação**: Gerar relatórios (PDF, Excel)
- **Visualização**: Gráficos ASCII no terminal

---

**Última atualização:** 16 de dezembro de 2025
