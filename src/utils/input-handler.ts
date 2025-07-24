import * as readline from 'readline';

export class InputHandler {
  private rl: readline.Interface;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Ask a question and wait for user input
   */
  askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Ask for JQL query with validation
   */
  async askJQL(): Promise<string> {
    console.log('\n📝 Enter your JQL query:');
    console.log('Examples:');
    console.log('  - assignee = currentUser()');
    console.log('  - project = "MYPROJECT" AND status = "In Progress"');
    console.log('  - created >= -30d AND priority = High');
    
    const jql = await this.askQuestion('\n🔍 JQL Query: ');
    
    if (!jql) {
      throw new Error('JQL query cannot be empty');
    }
    
    return jql;
  }

  /**
   * Ask for analysis question
   */
  async askAnalysisQuestion(): Promise<string> {
    console.log('\n💭 What analysis do you want to perform?');
    console.log('Examples:');
    console.log('  - Analyze sprint performance and identify bottlenecks');
    console.log('  - Review bug patterns and suggest improvements');
    console.log('  - Evaluate team workload distribution');
    
    const question = await this.askQuestion('\n❓ Analysis Question: ');
    
    if (!question) {
      throw new Error('Analysis question cannot be empty');
    }
    
    return question;
  }

  /**
   * Close the readline interface
   */
  close(): void {
    this.rl.close();
  }
}
