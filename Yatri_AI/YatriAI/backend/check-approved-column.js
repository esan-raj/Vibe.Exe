const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkColumn() {
  try {
    // Try to query the products table with the approved field
    const products = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'products' AND column_name = 'approved';
    `;
    
    console.log('Checking for "approved" column in products table...');
    console.log('Result:', products);
    
    if (products && products.length > 0) {
      console.log('✅ Column "approved" exists in the products table');
      console.log('Column details:', products[0]);
    } else {
      console.log('❌ Column "approved" does NOT exist in the products table');
      console.log('\nPlease run this SQL in your Neon database:');
      console.log('ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "approved" BOOLEAN NOT NULL DEFAULT false;');
    }
    
    // Also try to create a test product to see the actual error
    console.log('\nTesting product creation...');
    try {
      const testProduct = await prisma.product.findFirst({
        select: {
          id: true,
          name: true,
          approved: true
        }
      });
      console.log('✅ Can query products with approved field:', testProduct ? 'Yes' : 'No products found');
    } catch (error) {
      console.log('❌ Error querying products:', error.message);
      if (error.message.includes('Unknown field') || error.message.includes('Unknown argument')) {
        console.log('\n⚠️  The Prisma client is out of sync. Please:');
        console.log('1. Stop your backend server');
        console.log('2. Run: npx prisma generate');
        console.log('3. Restart your backend server');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkColumn();


