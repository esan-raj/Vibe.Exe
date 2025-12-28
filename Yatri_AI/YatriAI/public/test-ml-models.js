/**
 * ML Models Test Script
 * 
 * Copy-paste this into browser console to test ML models
 * 
 * Usage:
 * 1. Open your app in browser
 * 2. Press F12 → Console tab
 * 3. Copy-paste this entire script
 * 4. Press Enter
 */

(async function testMLModels() {
  console.log('%c🧪 Testing ML Models in Frontend', 'font-size: 16px; font-weight: bold; color: #3b82f6;');
  console.log('='.repeat(60));
  
  try {
    // Import services
    console.log('📦 Loading services...');
    const { hybridAIService } = await import('./src/lib/services/hybridAIService');
    const { intentClassifier } = await import('./src/lib/services/intentClassifier');
    const { retrieveLocalContext } = await import('./src/lib/services/rag.service');
    const { nerService } = await import('./src/lib/services/nerService');
    
    console.log('✅ Services loaded\n');
    
    // Test queries
    const testQueries = [
      {
        query: "I want to book a guide",
        expectedIntent: "book_guide"
      },
      {
        query: "Plan a 3-day heritage tour of Kolkata",
        expectedIntent: "plan_itinerary"
      },
      {
        query: "Show me heritage sites",
        expectedIntent: "find_heritage"
      },
      {
        query: "How much will it cost?",
        expectedIntent: "budget_question"
      },
      {
        query: "Tell me about Durga Puja",
        expectedIntent: "cultural_info"
      }
    ];
    
    let passed = 0;
    let total = testQueries.length;
    
    for (const test of testQueries) {
      console.log(`\n📝 Testing: "${test.query}"`);
      console.log('-'.repeat(60));
      
      const startTime = performance.now();
      
      // Test 1: Intent Classification
      const intent = await intentClassifier.classify(test.query);
      const intentMatch = intent.intent === test.expectedIntent;
      if (intentMatch) passed++;
      
      console.log(`🎯 Intent: ${intent.intent} ${intentMatch ? '✅' : '❌'} (expected: ${test.expectedIntent})`);
      console.log(`   Confidence: ${(intent.confidence * 100).toFixed(1)}%`);
      
      // Test 2: NER
      const entities = nerService.extract(test.query);
      console.log(`📝 Entities:`);
      if (entities.locations.length > 0) console.log(`   Locations: ${entities.locations.join(', ')}`);
      if (entities.durations.length > 0) console.log(`   Durations: ${entities.durations.join(', ')}`);
      if (entities.budgets.length > 0) console.log(`   Budgets: ${entities.budgets.join(', ')}`);
      
      // Test 3: Embeddings
      const context = await retrieveLocalContext(test.query, true);
      console.log(`🔍 Semantic Search: Found ${context.length} results`);
      if (context.length > 0) {
        console.log(`   Top result: ${context[0].title} (score: ${context[0].score.toFixed(3)})`);
      }
      
      // Test 4: Hybrid Service
      const hybrid = await hybridAIService.processQuery(test.query);
      const duration = performance.now() - startTime;
      
      console.log(`🤖 Hybrid Service:`);
      console.log(`   Response time: ${duration.toFixed(0)}ms`);
      console.log(`   Used Gemini: ${hybrid.shouldUseGemini ? 'Yes' : 'No'}`);
      console.log(`   Response length: ${hybrid.text.length} chars`);
      
      if (duration < 1000) {
        console.log(`   ⚡ Fast response! ✅`);
      } else {
        console.log(`   ⚠️  Slow response (>1s)`);
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Test Results: ${passed}/${total} passed`);
    console.log(`   Success rate: ${(passed/total*100).toFixed(1)}%`);
    
    if (passed === total) {
      console.log('%c✅ All tests passed!', 'color: green; font-weight: bold;');
    } else {
      console.log('%c⚠️  Some tests failed', 'color: orange; font-weight: bold;');
    }
    
    console.log('\n💡 Tips:');
    console.log('   - Check Network tab to see API calls');
    console.log('   - Enable VITE_DEBUG_ML=true for detailed logs');
    console.log('   - Use MLTestPanel component for visual testing');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\n💡 Make sure:');
    console.log('   1. App is running (npm run dev)');
    console.log('   2. You\'re on the correct page');
    console.log('   3. Services are properly imported');
  }
})();










