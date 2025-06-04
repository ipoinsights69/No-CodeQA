'use strict';

const { chromium, firefox, webkit } = require('playwright');
const path = require('path');
const fs = require('fs').promises;
const ActionHandlers = require('./action-handlers');

class TestExecutor {
  constructor(flow, options = {}) {
    this.flow = flow;
    this.options = {
      headless: true,
      browser: 'chromium',
      retries: 0,
      timeout: 30000,
      saveScreenshots: false,
      ...options
    };
    this.context = null;
    this.page = null;
    this.browser = null;
    this.variables = {};
    this.screenshots = [];
    this.logs = [];
    this.steps = [];
    this.startTime = null;
    this.endTime = null;
    this.actionHandlers = new ActionHandlers(this);
  }

  async execute() {
    this.startTime = Date.now();
    let status = 'passed';
    let error = null;

    try {
      // Launch browser
      await this.launchBrowser();
      
      // Execute test flow
      await this.executeFlow();
      
    } catch (err) {
      status = 'failed';
      error = err;
      this.log('error', err.message);
    } finally {
      // Close browser
      await this.closeBrowser();
    }

    this.endTime = Date.now();
    
    // Prepare result
    return {
      status,
      duration: this.endTime - this.startTime,
      steps: this.steps,
      logs: this.logs,
      screenshots: this.screenshots,
      variables: this.variables,
      error: error ? error.message : null,
      summary: this.generateSummary(status, error)
    };
  }

  /**
   * Launch a browser instance
   * @param {Object} options - Browser launch options
   * @returns {Promise<Object>} - Browser and page objects
   */
  async launchBrowser() {
    const { 
      browser: browserType = 'chromium', 
      headless = true,
      recordVideo = false,
      recordHar = false,
      captureNetworkLogs = false
    } = this.options;
    
    // Configure context options
    const contextOptions = {};
    
    // Setup video recording if enabled
    if (recordVideo) {
      const videoDir = path.join(process.cwd(), 'videos');
      await fs.mkdir(videoDir, { recursive: true });
      
      contextOptions.recordVideo = {
        dir: videoDir,
        size: { width: 1280, height: 720 }
      };
    }
    
    // Setup HAR recording if enabled
    if (recordHar) {
      const harDir = path.join(process.cwd(), 'har-files');
      await fs.mkdir(harDir, { recursive: true });
      
      const harPath = path.join(harDir, `${Date.now()}.har`);
      contextOptions.recordHar = {
        path: harPath,
        omitContent: false
      };
      
      // Store HAR path for later reference
      this.harPath = harPath;
    }
    
    // Launch browser based on type
    const browserInstance = {
      chromium,
      firefox,
      webkit
    }[this.options.browser] || chromium;
    
    this.browser = await browserInstance.launch({
      headless: this.options.headless
    });
    
    // Create a new context and page
    this.context = await this.browser.newContext(contextOptions);
    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(this.options.timeout);
    
    // Setup network logging if enabled
    if (captureNetworkLogs) {
      this.networkLogs = [];
      
      // Listen for network requests
      this.page.on('request', request => {
        this.networkLogs.push({
          type: 'request',
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          timestamp: new Date().toISOString()
        });
      });
      
      // Listen for network responses
      this.page.on('response', async response => {
        try {
          let responseBody = null;
          const contentType = response.headers()['content-type'] || '';
          
          // Only capture text and JSON responses to avoid memory issues
          if (contentType.includes('application/json') || contentType.includes('text/')) {
            try {
              responseBody = await response.text();
            } catch (e) {
              // Ignore errors when trying to get response body
            }
          }
          
          this.networkLogs.push({
            type: 'response',
            url: response.url(),
            status: response.status(),
            headers: response.headers(),
            body: responseBody,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          // Ignore errors in response handling
        }
      });
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async executeFlow() {
    const { test_name, start, steps } = this.flow;
    
    if (!start || !steps || !steps[start]) {
      throw new Error('Invalid test flow: missing start step or steps definition');
    }

    this.log('info', `Starting test: ${test_name || 'Unnamed test'}`);
    
    // Execute steps starting from the start step
    let currentStepId = start;
    
    while (currentStepId && currentStepId !== 'end') {
      const stepConfig = steps[currentStepId];
      
      if (!stepConfig) {
        throw new Error(`Step '${currentStepId}' not found in test flow`);
      }
      
      // Execute step
      await this.executeStep(currentStepId, stepConfig);
      
      // Move to next step
      currentStepId = stepConfig.next;
    }
    
    this.log('info', 'Test completed successfully');
  }

  async executeStep(stepId, stepConfig) {
    const { action } = stepConfig;
    
    if (!action) {
      throw new Error(`Step '${stepId}' is missing required 'action' property`);
    }
    
    this.log('info', `Executing step '${stepId}': ${action}`);
    
    // Process variables in step config
    const processedConfig = this.processVariables(stepConfig);
    
    // Take screenshot before step if enabled
    if (this.options.saveScreenshots) {
      await this.takeScreenshot(`${stepId}_before`);
    }
    
    try {
      // Execute action
      const handler = this.actionHandlers.getHandler(action);
      
      if (!handler) {
        throw new Error(`Unsupported action: ${action}`);
      }
      
      const result = await handler(processedConfig);
      
      // Save step result
      this.steps.push({
        id: stepId,
        action,
        status: 'passed',
        duration: 0, // TODO: Add duration tracking
        result
      });
      
      // Take screenshot after step if enabled
      if (this.options.saveScreenshots) {
        await this.takeScreenshot(`${stepId}_after`);
      }
      
      return result;
    } catch (error) {
      // Save failed step
      this.steps.push({
        id: stepId,
        action,
        status: 'failed',
        error: error.message
      });
      
      // Take screenshot on error
      await this.takeScreenshot(`${stepId}_error`);
      
      throw error;
    }
  }

  async takeScreenshot(name) {
    if (!this.page) return;
    
    try {
      const screenshotPath = `screenshots/${name}_${Date.now()}.png`;
      await this.page.screenshot({ path: screenshotPath });
      this.screenshots.push(screenshotPath);
    } catch (error) {
      this.log('error', `Failed to take screenshot: ${error.message}`);
    }
  }

  processVariables(config) {
    // Deep clone the config to avoid modifying the original
    const processed = JSON.parse(JSON.stringify(config));
    
    // Process all string values to replace variables
    const processValue = (value) => {
      if (typeof value === 'string') {
        return value.replace(/{{([^}]+)}}/g, (match, varName) => {
          return this.variables[varName] !== undefined ? this.variables[varName] : match;
        });
      }
      return value;
    };
    
    // Recursively process all values in the object
    const processObject = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          processObject(obj[key]);
        } else if (typeof obj[key] === 'string') {
          obj[key] = processValue(obj[key]);
        }
      }
    };
    
    processObject(processed);
    return processed;
  }

  log(level, message) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message
    };
    
    this.logs.push(logEntry);
    console.log(`[${logEntry.timestamp}] [${level.toUpperCase()}] ${message}`);
  }

  /**
   * Generate a summary of the test run
   * @returns {Object} - Test summary
   */
  generateSummary(status, error) {
    const passedSteps = this.steps.filter(step => step.status === 'passed').length;
    const failedSteps = this.steps.filter(step => step.status === 'failed').length;
    
    const summary = {
      test_name: this.flow.test_name || 'Unnamed test',
      status,
      duration: `${this.endTime - this.startTime}ms`,
      steps_total: this.steps.length,
      steps_passed: passedSteps,
      steps_failed: failedSteps,
      error: error ? error.message : null
    };
    
    // Add network logs if captured
    if (this.networkLogs && this.networkLogs.length > 0) {
      summary.networkLogs = this.networkLogs;
    }
    
    // Add HAR file path if recorded
    if (this.harPath) {
      summary.harPath = this.harPath;
    }
    
    // Add video path if recorded
    if (this.options.recordVideo && this.page && this.page.video()) {
      const videoPath = this.page.video().path();
      summary.videoPath = videoPath;
    }
    
    return summary;
  }

  // Helper to set a variable
  setVariable(name, value) {
    this.variables[name] = value;
    this.log('debug', `Set variable ${name} = ${value}`);
  }
}

module.exports = TestExecutor;