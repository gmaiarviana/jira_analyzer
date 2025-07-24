# Roadmap - JIRA Analyzer

## ✅ **ETAPA 1: CORE EXTRACTION - CONCLUÍDA**

Sistema básico funcional que extrai dados do JIRA e gera prompts estruturados para GitHub Copilot.

### Funcionalidades Implementadas
- ✅ Setup base TypeScript/Node.js com scripts npm
- ✅ Cliente JIRA com autenticação (email + API token)
- ✅ Conexão com JIRA corporativo HP (SSL self-signed)
- ✅ Extração de dados via JQL interativo
- ✅ Campos básicos: key, summary, description, status, priority, assignee, reporter, created, updated
- ✅ Limite configurável de tickets (padrão: 500)
- ✅ Salvamento timestamped em `data/raw/jira-data-{timestamp}.json`
- ✅ Geração de prompts para Copilot em `prompts/copilot-prompt-{timestamp}.md`
- ✅ Templates de resposta em `responses/copilot-response-{timestamp}.md`
- ✅ Validação de credenciais e tratamento de erros

### Resultado
Comando `npm run analyze` funcional que:
1. Conecta ao JIRA HP
2. Executa JQL interativo
3. Extrai e normaliza dados
4. Gera arquivos prontos para GitHub Copilot

---

## 🔮 **ETAPAS FUTURAS - SOMENTE SE NECESSÁRIO**

> **Status**: Sistema atual atende completamente o caso de uso. Extensões abaixo apenas se surgirem necessidades específicas.

### **Campos Customizados HP**
Se precisar de campos específicos HP:
- acceptance_criteria, sprint, epic_link, story_points
- Adicionar em `normalizeTicket()` no data-extractor.ts

### **Comments e Transitions**
Se análises precisarem de histórico detalhado:
- Extração de comments (últimos N)
- Timeline de transitions
- Requer requests adicionais ao JIRA