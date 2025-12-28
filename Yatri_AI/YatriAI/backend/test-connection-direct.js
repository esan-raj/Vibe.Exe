// Test direct connection (without pooler)
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Try direct connection URL (remove -pooler)
const directUrl = process.env.DATABASE_URL?.replace('-pooler', '') || process.env.DATABASE_URL;

console.log('🔄 Testing DIRECT connection (without pooler)...');
console.log('Connection URL:', directUrl?.replace(/:[^:@]+@/, ':****@')); // Hide password

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl
    }
  }
});

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Direct connection successful!');
    
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);
    
    try {
      const feedbackCount = await prisma.feedback.count();
      console.log(`📊 Feedback entries: ${feedbackCount}`);
    } catch (error) {
      console.log('⚠️  Feedback table:', error.message);
    }
    
    await prisma.$disconnect();
    console.log('\n✅ If this worked, update your .env file to use direct connection (remove -pooler)');
  } catch (error) {
    console.error('❌ Direct connection also failed:', error.message);
    console.error('\n💡 The database needs to be RESUMED in Neon console:');
    console.log('   1. Go to: https://console.neon.tech');
    console.log('   2. Select your project');
    console.log('   3. Click "Resume" button');
    console.log('   4. Wait 10-20 seconds');
    console.log('   5. Try again');
    process.exit(1);
  }
}

testConnection();


