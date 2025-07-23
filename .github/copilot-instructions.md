# GitHub Copilot Instructions - JIRA Analyzer

## Project Context

TypeScript/Node.js project for extracting JIRA data via JQL and generating structured prompts for GitHub Copilot analysis. Corporate HP environment with SSL self-signed certificates.

## Tech Stack

- **Language**: TypeScript/Node.js
- **Environment**: Windows PowerShell (never Linux commands)
- **JIRA API**: Corporate HP with SSL self-signed certificates
- **Structure**: Modular architecture with interfaces
- **Output**: Timestamped JSON data + Markdown prompts

## Code Style & Patterns

### **TypeScript Preferences**
```typescript
// ✅ Prefer strict typing
interface JiraTicket {
  key: string;
  summary: string;
  status: string;
}

// ✅ Use async/await, not promises
async function fetchData(): Promise<JiraTicket[]> {
  // implementation
}

// ✅ Error handling with try/catch
try {
  const data = await jiraClient.search(jql);
} catch (error) {
  console.error('JIRA API Error:', error.message);
}
```

### **File Organization**
```
src/
├── core/              # Main business logic
├── interfaces/        # TypeScript interfaces
└── utils/             # Helper functions

data/
└── raw/              # JSON outputs with timestamps

prompts/              # Generated markdown files
```

### **Environment Configuration**
```typescript
// ✅ Always use dotenv for configuration
import dotenv from 'dotenv';
dotenv.config();

// ✅ Validate required environment variables
const requiredVars = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'];
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
}
```

## JIRA Integration Specifics

### **SSL Self-Signed Certificates**
```typescript
// ✅ Always configure for corporate SSL
import https from 'https';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false // HP corporate certificates
});

const axiosConfig = {
  httpsAgent,
  timeout: 30000
};
```

### **Authentication Pattern**
```typescript
// ✅ Use email + API token (not username/password)
const auth = {
  username: process.env.JIRA_EMAIL!,
  password: process.env.JIRA_API_TOKEN!
};
```

### **JIRA Field Extraction**
```typescript
// ✅ Extract these basic fields always
interface JiraBasicFields {
  key: string;
  summary: string;
  description: string;
  status: string;
  priority: string;
  assignee: string | null;
  reporter: string;
  created: string;
  updated: string;
}

// ✅ Handle HP custom fields gracefully
const acceptanceCriteria = issue.fields.customfield_10001 || 'Not specified';
```

## Output File Patterns

### **Timestamp Generation**
```typescript
// ✅ Consistent timestamp format across all files
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
// Result: "2025-07-23T14-30-00"
```

### **JSON Data Output**
```typescript
// ✅ Save raw JIRA data with metadata
const output = {
  timestamp,
  query: jqlQuery,
  totalTickets: results.length,
  extractedAt: new Date().toISOString(),
  tickets: results
};

await fs.writeFile(`data/raw/jira-data-${timestamp}.json`, JSON.stringify(output, null, 2));
```

### **Markdown Prompt Generation**
```typescript
// ✅ Generate structured prompts for Copilot
const promptContent = `# Análise de Tickets JIRA - ${timestamp}

## Contexto
${userQuestion}

## Dados Extraídos
\`\`\`json
${JSON.stringify(ticketData, null, 2)}
\`\`\`

## Solicitação
Analise os dados acima e forneça insights sobre: ${userQuestion}

Estruture sua resposta em:
1. **Resumo Executivo**
2. **Principais Achados**
3. **Recomendações**  
4. **Próximos Passos**`;

await fs.writeFile(`prompts/copilot-prompt-${timestamp}.md`, promptContent);
```

### **Response Template Generation**
```typescript
// ✅ Create template for Copilot to fill
const responseTemplate = `# Análise JIRA - ${timestamp}

## Resumo Executivo
<!-- Copilot: Preencha aqui -->

## Principais Achados
<!-- Copilot: Preencha aqui -->

## Recomendações
<!-- Copilot: Preencha aqui -->

## Próximos Passos
<!-- Copilot: Preencha aqui -->

---
*Análise gerada via GitHub Copilot em ${new Date().toLocaleString('pt-BR')}*`;

await fs.writeFile(`prompts/copilot-response-${timestamp}.md`, responseTemplate);
```

## Interactive Input Patterns

### **Terminal Input Handling**
```typescript
// ✅ Use readline for user input
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
};

// Usage
const jqlQuery = await askQuestion('Digite sua JQL query: ');
const analysisQuestion = await askQuestion('Que análise você quer fazer? ');
```

## Error Handling Patterns

### **JIRA API Errors**
```typescript
// ✅ Specific error handling for JIRA
try {
  const response = await axios.get(`${baseUrl}/rest/api/2/search`, {
    params: { jql, maxResults: 500 },
    auth,
    httpsAgent
  });
} catch (error) {
  if (error.response?.status === 401) {
    throw new Error('JIRA Authentication failed - check credentials');
  } else if (error.response?.status === 400) {
    throw new Error(`Invalid JQL query: ${error.response.data.errorMessages?.join(', ')}`);
  } else {
    throw new Error(`JIRA API Error: ${error.message}`);
  }
}
```

### **File System Operations**
```typescript
// ✅ Ensure directories exist before writing
import { mkdir } from 'fs/promises';

await mkdir('data/raw', { recursive: true });
await mkdir('prompts', { recursive: true });
```

## Package.json Scripts

```json
{
  "scripts": {
    "analyze": "tsx src/main.ts",
    "dev": "tsx --watch src/main.ts",
    "build": "tsc",
    "clean": "rimraf dist"
  }
}
```

## Common Anti-Patterns to Avoid

❌ **Don't use Linux commands in code comments**
```typescript
// ❌ Don't suggest: curl, grep, head
// ✅ Use PowerShell: Invoke-WebRequest, Select-Object
```

❌ **Don't hardcode values**
```typescript
// ❌ Don't do this
const baseUrl = 'https://hp-jira.external.hp.com';

// ✅ Do this  
const baseUrl = process.env.JIRA_BASE_URL!;
```

❌ **Don't ignore SSL certificate issues**
```typescript
// ❌ Don't leave SSL unconfigured for corporate environments
// ✅ Always configure httpsAgent with rejectUnauthorized: false
```

## Project-Specific Requirements

1. **All outputs must use consistent timestamps** across files in same execution
2. **JIRA corporate environment** requires SSL configuration
3. **PowerShell validation commands** should be suggested in comments
4. **Modular architecture** - separate concerns into appropriate files
5. **Graceful degradation** for missing custom fields
6. **Input validation** for JQL queries and user inputs
7. **Rate limiting respect** for JIRA API calls