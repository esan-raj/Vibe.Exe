// Test with direct connection URL (bypassing pooler)
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Get current URL and create direct version
const currentUrl = process.env.DATABASE_URL;
if (!currentUrl) {
  console.error('❌ DATABASE_URL not found');
  process.exit(1);
}

// Remove -pooler from the URL
const directUrl = currentUrl.replace('-pooler', '');

console.log('🔄 Testing DIRECT connection (bypassing pooler)...\n');
console.log('Original URL:', currentUrl.replace(/:[^:@]+@/, ':****@'));
console.log('Direct URL:  ', directUrl.replace(/:[^:@]+@/, ':****@'));
console.log('\n');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl
    }
  }
});

async function test() {
  try {
    console.log('Connecting...');
    await prisma.$connect();
    console.log('✅ SUCCESS! Direct connection works!\n');
    
    const userCount = await prisma.user.count();
    console.log(`📊 Users: ${userCount}`);
    
    try {
      const feedbackCount = await prisma.feedback.count();
      console.log(`📊 Feedback: ${feedbackCount}`);
    } catch (e) {
      console.log(`⚠️  Feedback table: ${e.message}`);
    }
    
    await prisma.$disconnect();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ DIRECT CONNECTION WORKS!');
    console.log('\n📝 Next step: Update your backend/.env file:');
    console.log('\nChange this line:');
    console.log(`DATABASE_URL="${currentUrl}"`);
    console.log('\nTo this:');
    console.log(`DATABASE_URL="${directUrl}"`);
    console.log('\nThen restart your backend server.');
    
  } catch (error) {
    console.error('\n❌ Direct connection also failed:', error.message);
    console.error('\n💡 The database needs to be RESUMED in Neon console.');
    console.log('\n📋 Steps:');
    console.log('1. Open: https://console.neon.tech');
    console.log('2. Log in');
    console.log('3. Find your project (ep-tiny-sunset-adt90a6a)');
    console.log('4. Look for "Resume" button - it might be:');
    console.log('   - In the top right corner');
    console.log('   - On the project dashboard');
    console.log('   - In the "Settings" or "Database" section');
    console.log('   - As a notification/banner at the top');
    console.log('5. Click Resume and wait 20-30 seconds');
    console.log('6. Run: node diagnose-db.js');
    process.exit(1);
  }
}

test();


