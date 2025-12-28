import { io } from 'socket.io-client';
import fetch from 'node-fetch';

console.log('🔗 Starting Beacon API Test...\n');

// Test configuration
const SERVER_URL = 'http://localhost:3001';
const TEST_TIMEOUT = 15000; // 15 seconds

let nodeHeadSocket = null;
let beaconSocket = null;
let testResults = {
  connection: false,
  nodeHeadRegistration: false,
  beaconRegistration: false,
  messageTransmission: false,
  narrativeGeneration: false
};

// Test 1: Node Head Connection and Registration
function testNodeHead() {
  return new Promise((resolve, reject) => {
    console.log('📡 Test 1: Connecting Node Head...');
    
    nodeHeadSocket = io(SERVER_URL);
    
    nodeHeadSocket.on('connect', () => {
      console.log('✅ Node Head connected successfully');
      testResults.connection = true;
      
      // Register as node head
      nodeHeadSocket.emit('register-node-head', { 
        deviceName: 'Test Node Head CLI' 
      });
    });
    
    nodeHeadSocket.on('node-head-registered', (data) => {
      console.log('✅ Node Head registered:', data.nodeId);
      testResults.nodeHeadRegistration = true;
      resolve(data);
    });
    
    nodeHeadSocket.on('beacon-message-received', (message) => {
      console.log('📨 Node Head received message:', message.message);
      console.log('   From device:', message.deviceName);
      testResults.messageTransmission = true;
    });
    
    nodeHeadSocket.on('narrative-generated', (narrative) => {
      console.log('📖 Narrative generated:');
      console.log('   Original:', narrative.originalMessage);
      console.log('   Story Preview:', narrative.narrative.substring(0, 100) + '...');
      testResults.narrativeGeneration = true;
    });
    
    nodeHeadSocket.on('error', (error) => {
      console.error('❌ Node Head error:', error);
      reject(error);
    });
    
    setTimeout(() => {
      if (!testResults.nodeHeadRegistration) {
        reject(new Error('Node Head registration timeout'));
      }
    }, 5000);
  });
}

// Test 2: Beacon Node Connection and Registration
function testBeaconNode() {
  return new Promise((resolve, reject) => {
    console.log('\n📱 Test 2: Connecting Beacon Node...');
    
    beaconSocket = io(SERVER_URL);
    
    beaconSocket.on('connect', () => {
      console.log('✅ Beacon Node connected successfully');
      
      // Register as beacon node
      beaconSocket.emit('register-beacon', { 
        deviceName: 'Test Beacon CLI',
        location: { lat: 22.5726, lng: 88.3639 }
      });
    });
    
    beaconSocket.on('beacon-registered', (data) => {
      if (data.success) {
        console.log('✅ Beacon Node registered:', data.nodeId);
        testResults.beaconRegistration = true;
        resolve(data);
      }
    });
    
    beaconSocket.on('narrative-generated', (narrative) => {
      console.log('📖 Beacon received narrative for:', narrative.originalMessage);
    });
    
    beaconSocket.on('error', (error) => {
      console.error('❌ Beacon Node error:', error);
      reject(error);
    });
    
    setTimeout(() => {
      if (!testResults.beaconRegistration) {
        reject(new Error('Beacon Node registration timeout'));
      }
    }, 5000);
  });
}

// Test 3: Send Beacon Message
function testBeaconMessage() {
  return new Promise((resolve, reject) => {
    console.log('\n📤 Test 3: Sending beacon message...');
    
    if (!beaconSocket) {
      reject(new Error('Beacon socket not available'));
      return;
    }
    
    // Send test message
    beaconSocket.emit('beacon-message', {
      message: 'This is Victoria Memorial',
      location: { lat: 22.5448, lng: 88.3426 }
    });
    
    console.log('📨 Sent message: "This is Victoria Memorial"');
    
    // Wait for narrative generation
    setTimeout(() => {
      if (testResults.narrativeGeneration) {
        console.log('✅ Message transmission and narrative generation successful');
        resolve();
      } else {
        reject(new Error('Narrative generation timeout'));
      }
    }, 8000); // Give more time for AI generation
  });
}

// Test 4: HTTP API Endpoints
async function testHTTPEndpoints() {
  console.log('\n🌐 Test 4: Testing HTTP API endpoints...');
  
  try {
    // Test beacon status endpoint
    const response = await fetch('http://localhost:3001/api/beacon/status', {
      headers: {
        'Authorization': 'Bearer mock-token-user123-1234567890',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ HTTP API Status endpoint working');
      console.log('   Node Head Active:', data.data.nodeHead.isActive);
      console.log('   Active Beacons:', data.data.activeBeacons);
      console.log('   Total Narratives:', data.data.totalNarratives);
    } else {
      console.log('❌ HTTP API Status endpoint failed:', response.status);
    }
  } catch (error) {
    console.log('❌ HTTP API test failed:', error.message);
  }
}

// Main test execution
async function runTests() {
  try {
    // Run tests sequentially
    await testNodeHead();
    await testBeaconNode();
    await testBeaconMessage();
    await testHTTPEndpoints();
    
    // Print results
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    console.log('Connection:', testResults.connection ? '✅ PASS' : '❌ FAIL');
    console.log('Node Head Registration:', testResults.nodeHeadRegistration ? '✅ PASS' : '❌ FAIL');
    console.log('Beacon Registration:', testResults.beaconRegistration ? '✅ PASS' : '❌ FAIL');
    console.log('Message Transmission:', testResults.messageTransmission ? '✅ PASS' : '❌ FAIL');
    console.log('Narrative Generation:', testResults.narrativeGeneration ? '✅ PASS' : '❌ FAIL');
    
    const passedTests = Object.values(testResults).filter(result => result).length;
    const totalTests = Object.keys(testResults).length;
    
    console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! Beacon system is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Check the logs above for details.');
    }
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
  } finally {
    // Cleanup
    if (nodeHeadSocket) nodeHeadSocket.close();
    if (beaconSocket) beaconSocket.close();
    
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
}

// Handle timeout
setTimeout(() => {
  console.log('\n⏰ Test suite timeout reached');
  process.exit(1);
}, TEST_TIMEOUT);

// Start tests
runTests();