'use strict';

/**
 * Example script demonstrating how to use the No-CodeQA API programmatically
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Load test flow from file
async function loadTestFlow(filePath) {
  const content = await fs.readFile(path.resolve(filePath), 'utf8');
  return JSON.parse(content);
}

// Execute a test flow via the API
async function executeTest(flow, options = {}) {
  try {
    const response = await axios.post('http://localhost:3000/api/v1/execute', {
      flow,
      options
    });
    
    return response.data;
  } catch (error) {
    console.error('Error executing test:', error.response?.data || error.message);
    throw error;
  }
}

// Get test result by ID
async function getTestResult(testId) {
  try {
    const response = await axios.get(`http://localhost:3000/api/v1/results/${testId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting test result:', error.response?.data || error.message);
    throw error;
  }
}

// Main function
async function main() {
  try {
    // Load test flow
    const flow = await loadTestFlow('./login-test.json');
    
    console.log(`Executing test: ${flow.test_name}`);
    
    // Execute test
    const result = await executeTest(flow, {
      headless: false,  // Show browser UI
      browser: 'chromium',
      retries: 1,
      saveScreenshots: true
    });
    
    console.log('Test execution started:');
    console.log(`Test ID: ${result.testId}`);
    console.log(`Status: ${result.status}`);
    console.log(`Total steps: ${result.total_steps}`);
    console.log(`Duration: ${result.duration}`);
    
    // Get detailed test result
    const detailedResult = await getTestResult(result.testId);
    
    console.log('\nDetailed test result:');
    console.log(`Status: ${detailedResult.status}`);
    console.log(`Duration: ${detailedResult.duration}ms`);
    console.log(`Steps: ${detailedResult.steps.length}`);
    console.log(`Logs: ${detailedResult.logs.length}`);
    console.log(`Screenshots: ${detailedResult.screenshots.length}`);
    
    // Print step results
    console.log('\nStep results:');
    detailedResult.steps.forEach((step, index) => {
      console.log(`${index + 1}. ${step.id} (${step.action}): ${step.status}`);
      if (step.status === 'failed' && step.error) {
        console.log(`   Error: ${step.error}`);
      }
    });
    
    // Print screenshots
    if (detailedResult.screenshots.length > 0) {
      console.log('\nScreenshots:');
      detailedResult.screenshots.forEach(screenshot => {
        console.log(`- ${screenshot}`);
      });
    }
    
  } catch (error) {
    console.error('Error in main function:', error);
  }
}

// Run the example
if (require.main === module) {
  main();
}

module.exports = {
  loadTestFlow,
  executeTest,
  getTestResult
};