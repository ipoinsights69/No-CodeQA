'use strict';

/**
 * Utility class for handling variables and template substitution in test flows
 */
class VariableProcessor {
  constructor(initialVariables = {}) {
    this.variables = { ...initialVariables };
  }

  /**
   * Set a variable value
   * @param {string} name - Variable name
   * @param {any} value - Variable value
   */
  set(name, value) {
    this.variables[name] = value;
    return value;
  }

  /**
   * Get a variable value
   * @param {string} name - Variable name
   * @param {any} defaultValue - Default value if variable doesn't exist
   * @returns {any} Variable value or default
   */
  get(name, defaultValue = undefined) {
    return this.variables[name] !== undefined ? this.variables[name] : defaultValue;
  }

  /**
   * Check if a variable exists
   * @param {string} name - Variable name
   * @returns {boolean} True if variable exists
   */
  has(name) {
    return this.variables.hasOwnProperty(name);
  }

  /**
   * Get all variables
   * @returns {Object} All variables
   */
  getAll() {
    return { ...this.variables };
  }

  /**
   * Process a string and replace variable placeholders
   * @param {string} text - Text with variable placeholders
   * @returns {string} Processed text
   */
  processString(text) {
    if (typeof text !== 'string') return text;
    
    return text.replace(/{{([^}]+)}}/g, (match, varName) => {
      return this.variables[varName] !== undefined ? this.variables[varName] : match;
    });
  }

  /**
   * Process an object and replace variable placeholders in all string values
   * @param {Object} obj - Object with variable placeholders in string values
   * @returns {Object} Processed object
   */
  processObject(obj) {
    if (typeof obj !== 'object' || obj === null) return obj;
    
    // Deep clone the object to avoid modifying the original
    const processed = JSON.parse(JSON.stringify(obj));
    
    const processValue = (value) => {
      if (typeof value === 'string') {
        return this.processString(value);
      }
      return value;
    };
    
    const processObj = (o) => {
      for (const key in o) {
        if (typeof o[key] === 'object' && o[key] !== null) {
          processObj(o[key]);
        } else if (typeof o[key] === 'string') {
          o[key] = processValue(o[key]);
        }
      }
    };
    
    processObj(processed);
    return processed;
  }
}

module.exports = VariableProcessor;