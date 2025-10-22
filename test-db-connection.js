// Simple script to test database connection
require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;
    console.log('Database URL:', databaseUrl ? '✅ Set' : '❌ Not set');
    
    if (!databaseUrl) {
      throw new Error('No database URL found in environment variables');
    }
    
    const sql = neon(databaseUrl);
    
    // Test query
    const result = await sql`SELECT version()`;
    console.log('✅ Database connection successful!');
    console.log('PostgreSQL version:', result[0].version);
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    console.log('\n📊 Existing tables:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
