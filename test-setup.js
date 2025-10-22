// Simple test script to verify project structure
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing LeadGen SaaS Project Structure...\n');

// Check if all required files exist
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'tsconfig.json',
  'drizzle.config.ts',
  'middleware.ts',
  'lib/db/schema.ts',
  'lib/db/index.ts',
  'app/layout.tsx',
  'app/globals.css',
  'app/[username]/page.tsx',
  'app/[username]/LeadCaptureForm.tsx',
  'app/[username]/actions.ts',
  'app/[username]/thank-you/page.tsx',
  'app/dashboard/page.tsx',
  'app/dashboard/DashboardClient.tsx',
  'app/dashboard/actions.ts',
  'app/unauthorized/page.tsx',
  'README.md',
  '.env.example'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

console.log('\n📋 Project Summary:');
console.log(`- Total files checked: ${requiredFiles.length}`);
console.log(`- All files present: ${allFilesExist ? 'Yes' : 'No'}`);

if (allFilesExist) {
  console.log('\n🎉 Project structure is complete!');
  console.log('Next steps:');
  console.log('1. Run: npm install (if not done)');
  console.log('2. Set up environment variables in .env.local');
  console.log('3. Run: npm run db:push (to create database tables)');
  console.log('4. Run: npm run dev (to start development server)');
} else {
  console.log('\n⚠️  Some files are missing. Please check the project structure.');
}
