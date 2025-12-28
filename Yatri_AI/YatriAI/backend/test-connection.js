// Quick database connection test
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!');
    
    // Try a simple query
    const userCount = await prisma.user.count();
    console.log(`📊 Users in database: ${userCount}`);
    
    // Check feedback table structure
    try {
      const feedbackCount = await prisma.feedback.count();
      console.log(`📊 Feedback entries: ${feedbackCount}`);
    } catch (error) {
      console.log('⚠️  Feedback table might not exist or have issues:', error.message);
    }
    
    await prisma.$disconnect();
    console.log('✅ Connection test completed');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Resume the database in Neon console: https://console.neon.tech');
      console.log('2. Wait 10-20 seconds after resuming (cold start delay)');
      console.log('3. Try using direct connection (remove -pooler from URL)');
    }
    
    process.exit(1);
  }
}

testConnection();


