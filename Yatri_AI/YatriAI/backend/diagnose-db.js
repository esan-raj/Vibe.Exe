// Database connection diagnostic tool
require('dotenv').config();

console.log('🔍 Database Connection Diagnostic\n');
console.log('=' .repeat(50));

// Check if DATABASE_URL exists
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('❌ DATABASE_URL not found in .env file');
  console.log('\n💡 Make sure you have DATABASE_URL in backend/.env');
  process.exit(1);
}

console.log('✅ DATABASE_URL found');
console.log('📋 Connection details:');
const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)\?/);
if (urlParts) {
  console.log(`   Username: ${urlParts[1]}`);
  console.log(`   Host: ${urlParts[3]}`);
  console.log(`   Database: ${urlParts[4]}`);
  console.log(`   Type: ${urlParts[3].includes('pooler') ? 'Pooler' : 'Direct'}`);
}

console.log('\n🔄 Testing connection...\n');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnose() {
  try {
    console.log('Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Connection successful!\n');
    
    // Test queries
    try {
      const userCount = await prisma.user.count();
      console.log(`📊 Users table: ${userCount} records`);
    } catch (e) {
      console.log(`⚠️  Users table: ${e.message}`);
    }
    
    try {
      const feedbackCount = await prisma.feedback.count();
      console.log(`📊 Feedback table: ${feedbackCount} records`);
    } catch (e) {
      console.log(`⚠️  Feedback table: ${e.message}`);
    }
    
    await prisma.$disconnect();
    console.log('\n✅ Database is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Connection failed!\n');
    console.error('Error:', error.message);
    console.error('Code:', error.code || 'N/A');
    
    console.log('\n' + '='.repeat(50));
    console.log('🔧 TROUBLESHOOTING STEPS:\n');
    
    if (error.code === 'P1001' || error.message.includes("Can't reach")) {
      console.log('1. ⚠️  Database is PAUSED or unreachable');
      console.log('   → Go to: https://console.neon.tech');
      console.log('   → Log in and select your project');
      console.log('   → Look for "Resume" or "Resume Database" button');
      console.log('   → Click it and wait 10-30 seconds\n');
      
      console.log('2. 🔄 After resuming, wait 10-20 seconds (cold start)');
      console.log('   → Then run: node test-connection.js\n');
      
      console.log('3. 🌐 If still failing, check:');
      console.log('   → Is your internet connection working?');
      console.log('   → Is firewall blocking port 5432?');
      console.log('   → Try the direct connection (remove -pooler)\n');
      
      console.log('4. 📝 To use direct connection, update backend/.env:');
      console.log('   Change: ep-tiny-sunset-adt90a6a-pooler.c-2...');
      console.log('   To:     ep-tiny-sunset-adt90a6a.c-2...');
      console.log('   (Remove "-pooler" from the hostname)\n');
    } else {
      console.log('Different error - check the error message above');
    }
    
    process.exit(1);
  }
}

diagnose();


