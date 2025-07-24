# Arquitetura Técnica - JIRA Analyzer

## Contexto Específico para Claude

**Ambiente HP Corporate**: SSL self-signed certificates, rate limiting corporativo, PowerShell-only commands.

**Filosofia**: Sistema completo e funcional. Mudanças apenas por necessidade específica demonstrada.

**Padrão de Commits**: `git add arquivo1.ts arquivo2.ts` - NUNCA `git add .`

**Validação Obrigatória**: `npm run analyze` deve funcionar após qualquer mudança.

## Fluxo Principal
```
npm run analyze → Input JQL + pergunta → Extração JIRA → 
2 arquivos: copilot-prompt + response-template → 
Copilot Chat → Análise estruturada
```

## Componentes Principais

**core/**: jira-client (auth+SSL), data-extractor (normalização)
**utils/**: file-manager (timestamps), input-handler (terminal), config (.env)
**interfaces/**: jira-types (TypeScript definitions)

## Configuração Crítica

**SSL HP Corporate**: `rejectUnauthorized: false` para certificados self-signed
**Auth**: Basic auth com email + API token via .env
**Limits**: 500 tickets/query, 30s timeout
**PowerShell**: Comandos compatíveis Windows - NUNCA Linux commands

## Pontos de Extensão

**Campos JIRA**: Adicionar em `normalizeTicket()` se precisar de campos customizados HP.

**Templates Prompt**: Modificar `generatePromptContent()` para análises especializadas.

**Error Handling**: Prioridade 1=Auth, 2=JQL, 3=SSL, 4=Rate limiting.