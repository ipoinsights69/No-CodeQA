'use strict';

const testController = require('../controllers/test-controller');

async function routes(fastify, options) {
  // Execute a test flow
  fastify.post('/api/v1/execute', {
    schema: {
      body: {
        type: 'object',
        required: ['flow'],
        properties: {
          flow: { type: 'object' },
          options: {
            type: 'object',
            properties: {
              headless: { type: 'boolean', default: true },
              browser: { type: 'string', enum: ['chromium', 'firefox', 'webkit'], default: 'chromium' },
              retries: { type: 'integer', default: 0 },
              timeout: { type: 'integer', default: 30000 },
              saveScreenshots: { type: 'boolean', default: false },
              captureNetworkLogs: { type: 'boolean', default: false },
              recordHar: { type: 'boolean', default: false },
              recordVideo: { type: 'boolean', default: false }
            }
          }
        }
      }
    },
    handler: testController.executeTest
  });

  // Get specific test result
  fastify.get('/api/v1/results/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    handler: testController.getTestResult
  });
  
  // Get all test results
  fastify.get('/api/v1/results', {
    handler: testController.getAllTestResults
  });
  
  // Delete test result
  fastify.delete('/api/v1/results/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      }
    },
    handler: testController.deleteTestResult
  });
}

module.exports = routes;