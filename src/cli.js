#!/usr/bin/env node
'use strict';

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const TestExecutor = require('./services/test-executor');

async function runTest() {
  try {
    // Get test file path from command line arguments
    const testFilePath = process.argv[2];
    
    if (!testFilePath) {
      console.error('Error: Test file path is required');
      console.log('Usage: node cli.js <test-file-path> [options]');
      process.exit(1);
    }
    
    // Read test flow from file
    const flowContent = await fs.readFile(path.resolve(testFilePath), 'utf8');
    const flow = JSON.parse(flowContent);
    
    // Parse options from command line arguments
    const options = {};
    const args = process.argv.slice(3);
    
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        const key = arg.slice(2);
        const value = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
        
        options[key] = value === 'true' ? true : value === 'false' ? false : value;
        
        if (value !== 'true') {
          i++;
        }
      }
    }
    
    console.log(`Running test: ${flow.test_name || 'Unnamed test'}`);
    console.log('Options:', options);
    
    // Execute test
    const executor = new TestExecutor(flow, options);
    const result = await executor.execute();
    
    // Print result summary
    console.log('\nTest Result:');
    console.log(`Status: ${result.status}`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Steps: ${result.steps.length} (${result.steps.filter(s => s.status === 'passed').length} passed, ${result.steps.filter(s => s.status === 'failed').length} failed)`);
    
    if (result.error) {
      console.error('Error:', result.error);
    }
    
    if (result.screenshots.length > 0) {
      console.log('\nScreenshots:');
      result.screenshots.forEach(screenshot => {
        console.log(`- ${screenshot}`);
      });
    }
    
    // Exit with appropriate code
    process.exit(result.status === 'passed' ? 0 : 1);
  } catch (error) {
    console.error('Error running test:', error);
    process.exit(1);
  }
}

runTest();