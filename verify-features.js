const API_URL = 'http://localhost:8080/api/v1';

let authToken = '';
let passed = 0;
let failed = 0;
let currentUserId = null;
let currentTripId = null;
let currentBookingId = null;

async function runTest(name, testFn) {
  try {
    const result = await testFn();
    console.log(`✅ TEST PASSED: ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ TEST FAILED: ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
  };
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });
  
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  console.log('--- STARTING EXPEDITION X E2E TEST SUITE ---');

  let registeredEmail = `testuser${Date.now()}@example.com`;
  
  // Note: The rest of this file was permanently lost during deletion.
}

main();
