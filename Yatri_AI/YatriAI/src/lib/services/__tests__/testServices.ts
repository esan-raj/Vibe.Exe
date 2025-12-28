/**
 * Test Suite for Custom ML Services
 * 
 * Run these tests in browser console or as unit tests
 */

import { getEmbedding, cosineSimilarity } from '../embeddingService';
import { intentClassifier } from '../intentClassifier';
import { nerService } from '../nerService';
import { recommendationService } from '../recommendationService';
import { budgetEstimationService } from '../budgetEstimationService';
import { hybridAIService } from '../hybridAIService';
import { retrieveLocalContext } from '../rag.service';

// Test 1: Embeddings
export async function testEmbeddings() {
  console.log('🧪 Testing Embeddings...');
  
  try {
    const query1 = await getEmbedding("heritage sites");
    const query2 = await getEmbedding("historical monuments");
    const similarity = cosineSimilarity(query1, query2);
    
    console.log(`✅ Similarity: ${similarity.toFixed(3)}`);
    console.log(similarity > 0.3 ? '✅ PASS - Similar queries have high similarity' : '⚠️  Low similarity');
    
    return { passed: similarity > 0.3, similarity };
  } catch (error) {
    console.error('❌ FAIL:', error);
    return { passed: false, error };
  }
}

// Test 2: Intent Classification
export async function testIntent() {
  console.log('🧪 Testing Intent Classification...');
  
  const testCases = [
    { query: "I want to book a guide", expected: "book_guide" },
    { query: "Plan a 3-day itinerary", expected: "plan_itinerary" },
    { query: "Show me heritage sites", expected: "find_heritage" },
    { query: "How much will it cost?", expected: "budget_question" },
    { query: "Tell me about Durga Puja", expected: "cultural_info" },
  ];
  
  let passed = 0;
  for (const test of testCases) {
    const result = await intentClassifier.classify(test.query);
    const isCorrect = result.intent === test.expected;
    if (isCorrect) passed++;
    
    console.log(
      `${isCorrect ? '✅' : '❌'} "${test.query}"` +
      `\n   → Got: ${result.intent} (expected: ${test.expected})` +
      `\n   → Confidence: ${result.confidence.toFixed(2)}`
    );
  }
  
  console.log(`\n📊 Results: ${passed}/${testCases.length} passed`);
  return { passed, total: testCases.length };
}

// Test 3: NER
export function testNER() {
  console.log('🧪 Testing NER...');
  
  const testCases = [
    {
      query: "Plan a 3-day trip to Kolkata",
      expected: { hasLocation: true, hasDuration: true }
    },
    {
      query: "Book guide for tomorrow with ₹5000 budget",
      expected: { hasDate: true, hasBudget: true }
    },
    {
      query: "Heritage tour for family next week",
      expected: { hasTravelStyle: true, hasDate: true }
    },
  ];
  
  let passed = 0;
  for (const test of testCases) {
    const entities = nerService.extract(test.query);
    const hasLocation = entities.locations.length > 0;
    const hasDuration = entities.durations.length > 0;
    const hasDate = entities.dates.length > 0;
    const hasBudget = entities.budgets.length > 0;
    const hasTravelStyle = (entities.travelStyles?.length || 0) > 0;
    
    const isCorrect = 
      (!test.expected.hasLocation || hasLocation) &&
      (!test.expected.hasDuration || hasDuration) &&
      (!test.expected.hasDate || hasDate) &&
      (!test.expected.hasBudget || hasBudget) &&
      (!test.expected.hasTravelStyle || hasTravelStyle);
    
    if (isCorrect) passed++;
    
    console.log(`${isCorrect ? '✅' : '❌'} "${test.query}"`);
    console.log(`   Entities:`, {
      locations: entities.locations,
      durations: entities.durations,
      dates: entities.dates,
      budgets: entities.budgets,
      travelStyles: entities.travelStyles,
    });
  }
  
  console.log(`\n📊 Results: ${passed}/${testCases.length} passed`);
  return { passed, total: testCases.length };
}

// Test 4: Recommendations
export async function testRecommendations() {
  console.log('🧪 Testing Recommendations...');
  
  try {
    const recs = await recommendationService.getRecommendations(undefined, 3);
    
    console.log(`✅ Got recommendations:`);
    console.log(`   Destinations: ${recs.destinations.length}`);
    console.log(`   Itineraries: ${recs.itineraries.length}`);
    console.log(`   Guides: ${recs.guides.length}`);
    
    if (recs.destinations.length > 0) {
      console.log(`   Top destination: ${recs.destinations[0].name}`);
    }
    
    return { passed: true, recs };
  } catch (error) {
    console.error('❌ FAIL:', error);
    return { passed: false, error };
  }
}

// Test 5: Budget Estimation
export async function testBudget() {
  console.log('🧪 Testing Budget Estimation...');
  
  try {
    const estimate = await budgetEstimationService.estimate({
      duration: 3,
      budget: 'mid-range',
      travelStyle: 'couple',
      interests: ['heritage', 'food'],
      groupSize: 2
    });
    
    console.log(`✅ Budget Estimate:`);
    console.log(`   Range: ₹${estimate.low.toLocaleString()} - ₹${estimate.high.toLocaleString()}`);
    console.log(`   Breakdown:`, estimate.breakdown);
    console.log(`   Basis: ${estimate.basis}`);
    
    const isValid = estimate.low > 0 && estimate.high > estimate.low;
    console.log(isValid ? '✅ PASS' : '❌ FAIL - Invalid budget range');
    
    return { passed: isValid, estimate };
  } catch (error) {
    console.error('❌ FAIL:', error);
    return { passed: false, error };
  }
}

// Test 6: Hybrid Service
export async function testHybrid() {
  console.log('🧪 Testing Hybrid Service...');
  
  const queries = [
    "Plan a 3-day heritage tour of Kolkata",
    "I want to book a guide",
    "Show me heritage sites",
  ];
  
  const results = [];
  
  for (const query of queries) {
    console.log(`\n📝 Query: "${query}"`);
    
    try {
      const startTime = performance.now();
      const response = await hybridAIService.processQuery(query);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`   ✅ Response received in ${duration.toFixed(0)}ms`);
      console.log(`   Intent: ${response.intent.intent} (${response.intent.confidence.toFixed(2)})`);
      console.log(`   Entities:`, {
        locations: response.entities.locations,
        durations: response.entities.durations,
      });
      console.log(`   Used Gemini: ${response.shouldUseGemini ? 'Yes' : 'No'}`);
      console.log(`   Context results: ${response.context.length}`);
      console.log(`   Response length: ${response.text.length} chars`);
      
      results.push({
        query,
        duration,
        intent: response.intent.intent,
        usedGemini: response.shouldUseGemini,
        success: true,
      });
    } catch (error) {
      console.error(`   ❌ FAIL:`, error);
      results.push({
        query,
        success: false,
        error: String(error),
      });
    }
  }
  
  const passed = results.filter(r => r.success).length;
  console.log(`\n📊 Results: ${passed}/${queries.length} passed`);
  
  return { passed, total: queries.length, results };
}

// Test 7: RAG with Embeddings
export async function testRAG() {
  console.log('🧪 Testing RAG with Embeddings...');
  
  const query = "heritage sites in Kolkata";
  
  try {
    // Test with embeddings
    const start1 = performance.now();
    const results1 = await retrieveLocalContext(query, true);
    const duration1 = performance.now() - start1;
    
    // Test with keywords
    const start2 = performance.now();
    const results2 = await retrieveLocalContext(query, false);
    const duration2 = performance.now() - start2;
    
    console.log(`✅ Embeddings: Found ${results1.length} results in ${duration1.toFixed(0)}ms`);
    console.log(`   Top results:`, results1.slice(0, 3).map(r => r.title));
    
    console.log(`✅ Keywords: Found ${results2.length} results in ${duration2.toFixed(0)}ms`);
    console.log(`   Top results:`, results2.slice(0, 3).map(r => r.title));
    
    return {
      passed: true,
      embeddings: { count: results1.length, duration: duration1 },
      keywords: { count: results2.length, duration: duration2 },
    };
  } catch (error) {
    console.error('❌ FAIL:', error);
    return { passed: false, error };
  }
}

// Run all tests
export async function runAllTests() {
  console.log('🚀 Running All Tests...\n');
  console.log('='.repeat(50));
  
  const results = {
    embeddings: await testEmbeddings(),
    intent: await testIntent(),
    ner: testNER(),
    recommendations: await testRecommendations(),
    budget: await testBudget(),
    rag: await testRAG(),
    hybrid: await testHybrid(),
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 Final Results:');
  console.log(`   Embeddings: ${results.embeddings.passed ? '✅' : '❌'}`);
  console.log(`   Intent: ${results.intent.passed}/${results.intent.total} ✅`);
  console.log(`   NER: ${results.ner.passed}/${results.ner.total} ✅`);
  console.log(`   Recommendations: ${results.recommendations.passed ? '✅' : '❌'}`);
  console.log(`   Budget: ${results.budget.passed ? '✅' : '❌'}`);
  console.log(`   RAG: ${results.rag.passed ? '✅' : '❌'}`);
  console.log(`   Hybrid: ${results.hybrid.passed}/${results.hybrid.total} ✅`);
  
  return results;
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testMLServices = {
    testEmbeddings,
    testIntent,
    testNER,
    testRecommendations,
    testBudget,
    testHybrid,
    testRAG,
    runAllTests,
  };
  
  console.log('💡 Test functions available! Run: testMLServices.runAllTests()');
}










