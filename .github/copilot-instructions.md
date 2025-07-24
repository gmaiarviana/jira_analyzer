# GitHub Copilot Instructions - JIRA Analyzer

## Project Overview
TypeScript/Node.js tool that extracts JIRA data via JQL queries and generates structured prompts for GitHub Copilot analysis. Designed for HP corporate environment.

## Core Workflow
```
npm run analyze → Interactive JQL input → Data extraction → Generate 3 files:
├── data/raw/jira-data-{timestamp}.json
├── prompts/copilot-prompt-{timestamp}.md  
└── responses/copilot-response-{timestamp}.md
```

## Environment Constraints

### **PowerShell Only**
- ✅ `npm run analyze`, `docker-compose up`
- ❌ Never suggest Linux commands (`&&`, `|`, `grep`, `curl`)

### **HP Corporate JIRA**
- SSL self-signed certificates (rejectUnauthorized: false)
- Authentication: email + API token (never username/password)
- Rate limiting: respect 500 ticket limit

### **TypeScript Preferences**
- Strict typing with interfaces
- async/await (not promises)
- Modular architecture: src/core/, src/interfaces/, src/utils/

## Key Implementation Patterns

### **Timestamp Consistency**
```typescript
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
// Result: "2025-07-23T14-30-00"
```

### **Error Handling Priorities**
1. JIRA authentication (401) → check credentials message
2. Invalid JQL (400) → display JIRA error messages  
3. SSL/connectivity → check JIRA_BASE_URL message

### **File Structure**
- All outputs use same timestamp in single execution
- JSON data includes metadata (query, totalTickets, extractedAt)
- Prompts are self-contained for direct copy-paste to Copilot

## Development Guidelines

### **Incremental Validation**
- Each feature must pass `npm run analyze` test
- Commit only when functionality works end-to-end
- Use specific file additions: `git add file1.ts file2.ts`

### **Anti-Patterns to Avoid**
- ❌ Hardcoded JIRA URLs or credentials
- ❌ `git add .` in commits  
- ❌ Linux command suggestions in comments
- ❌ Missing directory creation before file writes

## Current Architecture Status
- ✅ **Core**: JiraClient, DataExtractor, FileManager implemented
- ✅ **Interfaces**: JiraTicket, ExtractedData defined
- ✅ **Utils**: InputHandler, config validation working
- ✅ **Output**: Timestamped files with statistics

## Extension Points for Future Features
- Docker containerization (planned)
- Custom HP fields extraction (acceptance_criteria, sprint, epic_link)
- Advanced analysis templates by ticket type
- Cache/resume functionality for large queries