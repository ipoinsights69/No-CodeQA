'use strict';

/**
 * Utility class for handling retries and error recovery in test steps
 */
class RetryHandler {
  /**
   * Create a new RetryHandler
   * @param {Object} options - Retry options
   * @param {number} options.maxRetries - Maximum number of retry attempts
   * @param {number} options.initialDelay - Initial delay in ms before first retry
   * @param {number} options.maxDelay - Maximum delay in ms between retries
   * @param {Function} options.shouldRetry - Function to determine if retry should be attempted
   * @param {Function} options.onRetry - Function to call before each retry
   */
  constructor(options = {}) {
    this.options = {
      maxRetries: 3,
      initialDelay: 100,
      maxDelay: 3000,
      backoffFactor: 2,
      shouldRetry: () => true,
      onRetry: () => {},
      ...options
    };
  }

  /**
   * Execute a function with retry logic
   * @param {Function} fn - Function to execute
   * @param {Object} context - Context to pass to the function
   * @returns {Promise<any>} Result of the function
   */
  async execute(fn, context = {}) {
    let lastError = null;
    let attempt = 0;
    let delay = this.options.initialDelay;
    
    while (attempt <= this.options.maxRetries) {
      try {
        return await fn(context);
      } catch (error) {
        lastError = error;
        attempt++;
        
        // Check if we should retry
        if (attempt > this.options.maxRetries || !this.options.shouldRetry(error, attempt, context)) {
          break;
        }
        
        // Call onRetry callback
        this.options.onRetry(error, attempt, context);
        
        // Wait before next retry
        await this.sleep(delay);
        
        // Increase delay for next attempt (with exponential backoff)
        delay = Math.min(delay * this.options.backoffFactor, this.options.maxDelay);
      }
    }
    
    // If we get here, all retries failed
    throw lastError;
  }

  /**
   * Sleep for a specified duration
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a retry handler for flaky network operations
   * @returns {RetryHandler} Configured retry handler
   */
  static forNetworkOperations() {
    return new RetryHandler({
      maxRetries: 3,
      initialDelay: 500,
      shouldRetry: (error) => {
        // Retry on network errors, timeouts, and 5xx server errors
        return (
          error.name === 'TimeoutError' ||
          error.message.includes('net::') ||
          (error.response && error.response.status >= 500)
        );
      }
    });
  }

  /**
   * Create a retry handler for flaky UI interactions
   * @returns {RetryHandler} Configured retry handler
   */
  static forUiInteractions() {
    return new RetryHandler({
      maxRetries: 2,
      initialDelay: 100,
      shouldRetry: (error) => {
        // Retry on element not found or stale element errors
        return (
          error.message.includes('Element not found') ||
          error.message.includes('stale element reference') ||
          error.message.includes('element not interactable')
        );
      }
    });
  }
}

module.exports = RetryHandler;