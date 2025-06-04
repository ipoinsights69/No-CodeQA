/**
 * Example of using the No-CodeQA API with QA-specific features
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load the QA-specific test flow
const testFlow = require('./qa-specific-test.json');

// API base URL
const API_BASE_URL = 'http://localhost:3000/api/v1';

/**
 * Execute a test with QA-specific features
 */
async function executeQATest() {
  try {
    console.log('Starting QA test execution...');
    
    // Execute the test with QA-specific options
    const executeResponse = await axios.post(`${API_BASE_URL}/execute`, {
      flow: testFlow,
      options: {
        headless: true,
        browser: 'chromium',
        retries: 1,
        timeout: 30000,
        saveScreenshots: true,
        captureNetworkLogs: true,  // Enable network logs capture
        recordHar: true,           // Record HAR file
        recordVideo: true           // Record video of test execution
      }
    });
    
    const { testId } = executeResponse.data;
    console.log(`Test started with ID: ${testId}`);
    
    // Poll for test completion
    let testResult;
    let isComplete = false;
    
    console.log('Waiting for test to complete...');
    while (!isComplete) {
      // Wait for 2 seconds between polls
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get current test status
      const resultResponse = await axios.get(`${API_BASE_URL}/results/${testId}`);
      testResult = resultResponse.data;
      
      if (testResult.status !== 'running') {
        isComplete = true;
      } else {
        console.log(`Test progress: ${testResult.progress}%`);
      }
    }
    
    // Display test results
    console.log('\n===== TEST RESULTS =====');
    console.log(`Status: ${testResult.status}`);
    console.log(`Duration: ${testResult.duration}ms`);
    console.log(`Steps: ${testResult.steps.length} total`);
    console.log(`Passed Steps: ${testResult.steps.filter(s => s.status === 'passed').length}`);
    console.log(`Failed Steps: ${testResult.steps.filter(s => s.status === 'failed').length}`);
    
    // Display network logs summary if available
    if (testResult.networkLogs && testResult.networkLogs.length > 0) {
      console.log('\n===== NETWORK LOGS =====');
      console.log(`Total Requests: ${testResult.networkLogs.filter(l => l.type === 'request').length}`);
      console.log(`Total Responses: ${testResult.networkLogs.filter(l => l.type === 'response').length}`);
      
      // Show some sample network logs
      console.log('\nSample Network Logs:');
      testResult.networkLogs.slice(0, 3).forEach(log => {
        console.log(`- ${log.type.toUpperCase()}: ${log.url} (${log.status || log.method})`);
      });
    }
    
    // Display HAR file path if available
    if (testResult.harPath) {
      console.log('\n===== HAR FILE =====');
      console.log(`HAR File: ${testResult.harPath}`);
    }
    
    // Display video path if available
    if (testResult.videoPath) {
      console.log('\n===== VIDEO RECORDING =====');
      console.log(`Video: ${testResult.videoPath}`);
    }
    
    // Display screenshots if available
    if (testResult.screenshots && testResult.screenshots.length > 0) {
      console.log('\n===== SCREENSHOTS =====');
      testResult.screenshots.forEach(screenshot => {
        console.log(`- ${screenshot}`);
      });
    }
    
    // Display XPath verification results if available
    if (testResult.variables && testResult.variables.h1Element) {
      console.log('\n===== XPATH VERIFICATION =====');
      console.log(`XPath '//h1' exists: ${testResult.variables.h1Element.exists}`);
      console.log(`XPath '//h1' visible: ${testResult.variables.h1Element.visible}`);
      console.log(`XPath '//h1' count: ${testResult.variables.h1Element.count}`);
    }
    
    // Display URL redirection results if available
    if (testResult.variables && testResult.variables.redirectResult) {
      console.log('\n===== URL REDIRECTION =====');
      console.log(`Initial URL: ${testResult.variables.redirectResult.initialUrl}`);
      console.log(`Redirected URL: ${testResult.variables.redirectResult.redirectedUrl}`);
      console.log(`Redirection Success: ${testResult.variables.redirectResult.success}`);
    }
    
    console.log('\nTest execution completed!');
    
  } catch (error) {
    console.error('Error executing test:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the example
executeQATest();