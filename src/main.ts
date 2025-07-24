import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
    console.log('🎯 JIRA Analyzer - Starting...');
    
    // Validate required environment variables
    const requiredVars = ['JIRA_BASE_URL', 'JIRA_EMAIL', 'JIRA_API_TOKEN'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
        console.error('❌ Missing required environment variables:', missingVars.join(', '));
        console.log('📋 Please copy .env.example to .env and fill in your JIRA credentials');
        process.exit(1);
    }
    
    console.log('✅ Environment variables validated');
    console.log('🔧 Ready for JIRA integration development');
}

// Handle errors gracefully
main().catch((error) => {
    console.error('💥 Unexpected error:', error.message);
    process.exit(1);
});