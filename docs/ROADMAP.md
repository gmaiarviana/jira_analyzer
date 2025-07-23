# Roadmap de Implementação - JIRA Analyzer

## Visão Geral

Sistema para extração de dados do JIRA via JQL e análise conversacional com GitHub Copilot. Desenvolvimento incremental focado em entregas funcionais e testáveis a cada etapa.

---

## 🎯 **ETAPA 1: CORE JIRA EXTRACTION - ATUAL**

**Objetivo**: Sistema básico funcional que extrai dados do JIRA e gera prompts estruturados para GitHub Copilot.

### **Funcionalidade 1.1: Setup Base do Projeto**
**Critérios de Aceite:**
- Estrutura de projeto TypeScript/Node.js criada
- Package.json com scripts `analyze` e `dev` configurados
- Configuração TypeScript e dependencies básicas
- Arquivo .env.example com variáveis JIRA documentadas

### **Funcionalidade 1.2: Cliente JIRA Básico**
**Critérios de Aceite:**
- Autenticação JIRA com email + API token via .env
- Conexão funcional com JIRA corporativo HP (SSL self-signed)
- Validação de credenciais no startup
- Tratamento de erros de autenticação e conectividade

### **Funcionalidade 1.3: Extração de Dados via JQL**
**Critérios de Aceite:**
- Input interativo para JQL query via terminal
- Execução da query JQL no JIRA
- Extração de campos básicos: key, summary, description, status, priority, assignee, reporter, created, updated
- Limite de 500 tickets por query (configurável)
- Salvamento em `data/raw/jira-data-{timestamp}.json`

### **Funcionalidade 1.4: Geração de Prompts para Copilot**
**Critérios de Aceite:**
- Input interativo para pergunta de análise
- Geração de `copilot-prompt-{timestamp}.md` com dados estruturados + pergunta
- Geração de `copilot-response-{timestamp}.md` com template de resposta
- Template estruturado: Resumo Executivo, Principais Achados, Recomendações, Próximos Passos
- Timestamp consistente entre arquivos da mesma execução

**Resultado Esperado**: Comando `npm run analyze` funcional que extrai dados do JIRA HP e gera arquivos prontos para usar no GitHub Copilot.

---

## 🔮 **ETAPAS FUTURAS - CAPACIDADES PLANEJADAS**

### **ETAPA 2: PROMPT ENHANCEMENT**
**Objetivo**: Prompts mais inteligentes e dados normalizados para análises superiores.

**Capacidades Planejadas:**
- Normalização de dados extraídos (status, priority padronizados)
- Campos customizados HP (acceptance_criteria, sprint, epic_link, story_points)
- Templates de prompt especializados por tipo de análise
- Estrutura de dados processados em `data/processed/`

### **ETAPA 3: CONTAINERIZAÇÃO CORPORATIVA**
**Objetivo**: Ambiente Docker completo para uso corporativo HP.

**Capacidades Planejadas:**
- Dockerfile otimizado para Node.js + TypeScript
- Docker-compose com volume mounts para .env e outputs
- Configuração SSL para certificados self-signed HP
- Scripts de deploy e uso via Docker

### **ETAPA 4: ANÁLISES AVANÇADAS**
**Objetivo**: Funcionalidades avançadas para análises complexas e workflows especializados.

**Capacidades Planejadas:**
- Extração de comments e transitions
- Correlações epic-story automatizadas
- Cache inteligente de extrações recentes
- Métricas de performance e debugging detalhado
- Templates especializados por domínio (bugs, features, epics)