// Test script for Gemini AI cost estimation
import { costEstimationService } from './src/lib/services/costEstimationService.js';

async function testCostEstimation() {
  console.log('Testing Gemini AI Cost Estimation...');
  
  const testRequest = {
    destinationName: 'Victoria Memorial',
    address: 'Queens Way, Maidan, Kolkata, West Bengal 700071',
    category: 'heritage',
    duration: 3,
    visitTime: '09:00',
    priority: 'high',
    groupSize: 2,
    travelStyle: 'mid-range'
  };

  try {
    const result = await costEstimationService.estimateCost(testRequest);
    console.log('✅ Cost Estimation Result:', result);
    console.log(`💰 Total Cost: ₹${result.estimatedCost}`);
    console.log('📊 Breakdown:', result.breakdown);
    console.log('💡 Tips:', result.tips);
    console.log(`🎯 Confidence: ${result.confidence}`);
  } catch (error) {
    console.error('❌ Cost Estimation Failed:', error);
  }
}

testCostEstimation();