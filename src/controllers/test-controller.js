'use strict';

const { v4: uuidv4 } = require('uuid');
const TestExecutor = require('../services/test-executor');

// In-memory storage for test results (would be replaced by MongoDB in production)
const testResults = new Map();

// Track currently running tests
const runningTests = new Map();

/**
 * Execute a test flow
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
async function executeTest(request, reply) {
  try {
    // Check if there's already a running test
    if (runningTests.size > 0) {
      return reply.code(409).send({
        error: 'Conflict',
        message: 'Another test is already running. Only one test can run at a time.'
      });
    }

    const { flow, options = {} } = request.body;
    const testId = uuidv4();
    
    // Create test executor
    const executor = new TestExecutor(flow, options);
    
    // Store test as running
    runningTests.set(testId, {
      status: 'running',
      startTime: Date.now(),
      flow: flow.test_name || 'Unnamed test',
      steps_completed: 0
    });
    
    // Execute test asynchronously
    executeTestAsync(testId, executor, request.log);
    
    // Return test ID immediately
    return {
      testId,
      status: 'running',
      message: 'Test execution started. Use GET /api/v1/results/:id to check status.'
    };
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ 
      error: 'Test execution failed', 
      message: error.message 
    });
  }
}

/**
 * Execute test asynchronously
 * @param {string} testId - Unique test ID
 * @param {Object} executor - Test executor instance
 * @param {Object} logger - Fastify logger
 */
async function executeTestAsync(testId, executor, logger) {
  try {
    // Execute test
    const result = await executor.execute();
    
    // Update test status
    runningTests.delete(testId);
    testResults.set(testId, {
      ...result,
      completedAt: Date.now()
    });
  } catch (error) {
    logger.error(error);
    
    // Update test status on error
    runningTests.delete(testId);
    testResults.set(testId, {
      status: 'failed',
      error: error.message,
      completedAt: Date.now()
    });
  }
}

/**
 * Get test result by ID
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
async function getTestResult(request, reply) {
  const { id } = request.params;
  
  // Check if test is still running
  if (runningTests.has(id)) {
    const runningTest = runningTests.get(id);
    return {
      testId: id,
      status: 'running',
      startTime: runningTest.startTime,
      elapsedTime: Date.now() - runningTest.startTime,
      flow: runningTest.flow,
      steps_completed: runningTest.steps_completed
    };
  }
  
  // Check if test is completed
  if (!testResults.has(id)) {
    return reply.code(404).send({ 
      error: 'Not found', 
      message: `Test result with ID ${id} not found` 
    });
  }
  
  return testResults.get(id);
}

/**
 * Get all test results (both running and completed)
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
async function getAllTestResults(request, reply) {
  const results = {
    running: Array.from(runningTests.entries()).map(([id, test]) => ({
      testId: id,
      status: 'running',
      startTime: test.startTime,
      elapsedTime: Date.now() - test.startTime,
      flow: test.flow
    })),
    completed: Array.from(testResults.entries()).map(([id, result]) => ({
      testId: id,
      status: result.status,
      completedAt: result.completedAt,
      duration: result.duration,
      flow: result.summary?.test_name || 'Unnamed test'
    }))
  };
  
  return results;
}

/**
 * Delete a test result
 * @param {Object} request - Fastify request object
 * @param {Object} reply - Fastify reply object
 */
async function deleteTestResult(request, reply) {
  const { id } = request.params;
  
  if (runningTests.has(id)) {
    return reply.code(400).send({
      error: 'Bad Request',
      message: 'Cannot delete a running test'
    });
  }
  
  if (!testResults.has(id)) {
    return reply.code(404).send({ 
      error: 'Not found', 
      message: `Test result with ID ${id} not found` 
    });
  }
  
  testResults.delete(id);
  
  return {
    success: true,
    message: `Test result ${id} deleted successfully`
  };
}

module.exports = {
  executeTest,
  getTestResult,
  getAllTestResults,
  deleteTestResult
};