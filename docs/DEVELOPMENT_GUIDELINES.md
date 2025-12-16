# Diretrizes de Desenvolvimento - JIRA Analyzer

## Visão Geral

Este documento define **como trabalhar** no projeto JIRA Analyzer. O **que construir** está em `ROADMAP.md` e detalhes técnicos em `ARCHITECTURE.md`.

## Ambiente de Desenvolvimento

### **PowerShell + TypeScript/Node.js**
- **Sistema**: Windows PowerShell - NUNCA usar comandos Linux
- **Comandos válidos**: `npm run analyze`, `docker-compose up`, `git add arquivo.ts`
- **Comandos proibidos**: `&&`, `|`, `grep`, `curl`, `sleep`
- **Validação**: `npm run analyze` para teste end-to-end

### **Controle de Versão**
- **Commits específicos**: SEMPRE `git add arquivo1.ts arquivo2.ts` - NUNCA `git add .`
- **Mensagens**: "feat/fix: descrição - Funcionalidade X.Y concluída"
- **Frequência**: 1 commit por tarefa validada

## Fluxo de Desenvolvimento

### **1. REFLEXÃO TÉCNICA OBRIGATÓRIA**
Antes de qualquer implementação:

1. **STACK**: TypeScript + Node.js + Docker + JIRA API
2. **COMPATIBILITY**: .env correto? PowerShell commands? 
3. **ARCHITECTURE**: Como integra com estrutura existente?
4. **JIRA**: SSL self-signed? Campos customizados HP?
5. **OUTPUT**: Templates de prompts corretos?

### **2. DEFINIR TAREFAS**
- Quebrar funcionalidade em tarefas específicas
- Cada tarefa = 1 prompt para GitHub Copilot
- Validação clara para cada tarefa

### **3. TEMPLATE PARA PROMPTS**
```markdown
## 🎯 TAREFA: [Nome Específico]

### Para o GitHub Copilot:
```
[AÇÃO] arquivo [CAMINHO]
- [Detalhe 1]: especificação
- [Detalhe 2]: especificação
```

### Validação PowerShell:
```powershell
npm run analyze
# Verificar: [comportamento esperado]
```

**Critério de Aceite:**
✅ Deve: [output específico]
❌ NÃO deve: [erros específicos]
```

## Princípios de Qualidade

### **PowerShell-First**
- Comandos testados no Windows PowerShell
- NUNCA assumir comandos Linux

### **TypeScript + Node.js**
- Interfaces para dados JIRA
- Error handling para falhas de API
- Configuração via .env

### **JIRA Corporate**
- SSL self-signed certificates HP
- Rate limiting respeitoso
- Fallback para campos ausentes

### **Incremental**
- Sistema funcionando após cada tarefa
- Validação: tickets extraídos == web interface
- 1 commit por tarefa validada
- Build e testes devem passar: `npm run build`

### **JSON Configuration (Field Mappings)**
- Alterações em `src/config/field-mappings.json` requerem apenas reload
- Usar `FieldMappingsLoader` para carregar e validar campos
- Sempre copiar JSON para `dist/config/` após build

## Regras Fundamentais

✅ **SEMPRE:**
- Reflexão técnica antes de implementar
- Template estruturado para Copilot
- Validação PowerShell após tarefa
- Commit específico quando funcionar

❌ **NUNCA:**
- Comandos Linux no PowerShell
- `git add .` em commits
- Prosseguir com validação falhando