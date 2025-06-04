'use strict';

const fs = require('fs').promises;
const path = require('path');

class ReportGenerator {
  constructor(testResult, options = {}) {
    this.testResult = testResult;
    this.options = {
      outputDir: './reports',
      includeScreenshots: true,
      includeVariables: true,
      includeLogs: true,
      ...options
    };
  }

  async generateHtmlReport() {
    try {
      // Create output directory if it doesn't exist
      await fs.mkdir(this.options.outputDir, { recursive: true });
      
      // Generate report filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportName = `${this.testResult.summary.test_name || 'test'}-${timestamp}`;
      const reportPath = path.join(this.options.outputDir, `${reportName}.html`);
      
      // Generate HTML content
      const html = this.generateHtml();
      
      // Write HTML to file
      await fs.writeFile(reportPath, html);
      
      return reportPath;
    } catch (error) {
      console.error('Error generating HTML report:', error);
      throw error;
    }
  }

  async generateJsonReport() {
    try {
      // Create output directory if it doesn't exist
      await fs.mkdir(this.options.outputDir, { recursive: true });
      
      // Generate report filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportName = `${this.testResult.summary.test_name || 'test'}-${timestamp}`;
      const reportPath = path.join(this.options.outputDir, `${reportName}.json`);
      
      // Write JSON to file
      await fs.writeFile(reportPath, JSON.stringify(this.testResult, null, 2));
      
      return reportPath;
    } catch (error) {
      console.error('Error generating JSON report:', error);
      throw error;
    }
  }

  generateHtml() {
    const { testResult } = this;
    const { summary, steps, logs, screenshots, variables, error } = testResult;
    
    // Generate step rows
    const stepsHtml = steps.map((step, index) => {
      const statusClass = step.status === 'passed' ? 'success' : 'danger';
      const stepDetails = JSON.stringify(step, null, 2);
      
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${step.id}</td>
          <td>${step.action}</td>
          <td><span class="badge bg-${statusClass}">${step.status}</span></td>
          <td>
            <button class="btn btn-sm btn-info" type="button" data-bs-toggle="collapse" data-bs-target="#step${index}" aria-expanded="false">
              Details
            </button>
            <div class="collapse mt-2" id="step${index}">
              <pre class="bg-light p-2 rounded"><code>${this.escapeHtml(stepDetails)}</code></pre>
            </div>
          </td>
        </tr>
      `;
    }).join('');
    
    // Generate screenshots section
    let screenshotsHtml = '';
    if (this.options.includeScreenshots && screenshots && screenshots.length > 0) {
      const screenshotItems = screenshots.map(screenshot => {
        return `
          <div class="col-md-4 mb-3">
            <div class="card">
              <img src="${screenshot}" class="card-img-top" alt="Screenshot">
              <div class="card-body">
                <h5 class="card-title">${path.basename(screenshot)}</h5>
              </div>
            </div>
          </div>
        `;
      }).join('');
      
      screenshotsHtml = `
        <div class="card mb-4">
          <div class="card-header">
            <h4>Screenshots</h4>
          </div>
          <div class="card-body">
            <div class="row">
              ${screenshotItems}
            </div>
          </div>
        </div>
      `;
    }
    
    // Generate variables section
    let variablesHtml = '';
    if (this.options.includeVariables && variables && Object.keys(variables).length > 0) {
      const variableRows = Object.entries(variables).map(([key, value]) => {
        return `
          <tr>
            <td>${key}</td>
            <td><pre class="mb-0"><code>${this.escapeHtml(JSON.stringify(value, null, 2))}</code></pre></td>
          </tr>
        `;
      }).join('');
      
      variablesHtml = `
        <div class="card mb-4">
          <div class="card-header">
            <h4>Variables</h4>
          </div>
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                ${variableRows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
    
    // Generate logs section
    let logsHtml = '';
    if (this.options.includeLogs && logs && logs.length > 0) {
      const logRows = logs.map(log => {
        const levelClass = {
          info: 'info',
          error: 'danger',
          warning: 'warning',
          debug: 'secondary'
        }[log.level] || 'info';
        
        return `
          <tr>
            <td>${log.timestamp}</td>
            <td><span class="badge bg-${levelClass}">${log.level}</span></td>
            <td>${this.escapeHtml(log.message)}</td>
          </tr>
        `;
      }).join('');
      
      logsHtml = `
        <div class="card mb-4">
          <div class="card-header">
            <h4>Logs</h4>
          </div>
          <div class="card-body">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Level</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                ${logRows}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
    
    // Generate error section
    let errorHtml = '';
    if (error) {
      errorHtml = `
        <div class="card mb-4 border-danger">
          <div class="card-header bg-danger text-white">
            <h4>Error</h4>
          </div>
          <div class="card-body">
            <pre class="mb-0"><code>${this.escapeHtml(error)}</code></pre>
          </div>
        </div>
      `;
    }
    
    // Generate full HTML
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Report: ${summary.test_name || 'Unnamed Test'}</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { padding-top: 2rem; padding-bottom: 2rem; }
          pre { margin-bottom: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="row mb-4">
            <div class="col">
              <h1>Test Report</h1>
              <h2>${summary.test_name || 'Unnamed Test'}</h2>
            </div>
          </div>
          
          <div class="row mb-4">
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h4>Summary</h4>
                </div>
                <div class="card-body">
                  <table class="table table-bordered">
                    <tbody>
                      <tr>
                        <th>Status</th>
                        <td><span class="badge bg-${summary.status === 'passed' ? 'success' : 'danger'}">${summary.status}</span></td>
                      </tr>
                      <tr>
                        <th>Duration</th>
                        <td>${summary.duration}</td>
                      </tr>
                      <tr>
                        <th>Total Steps</th>
                        <td>${summary.steps_total}</td>
                      </tr>
                      <tr>
                        <th>Passed Steps</th>
                        <td>${summary.steps_passed}</td>
                      </tr>
                      <tr>
                        <th>Failed Steps</th>
                        <td>${summary.steps_failed}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          ${errorHtml}
          
          <div class="card mb-4">
            <div class="card-header">
              <h4>Steps</h4>
            </div>
            <div class="card-body">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Step ID</th>
                    <th>Action</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  ${stepsHtml}
                </tbody>
              </table>
            </div>
          </div>
          
          ${screenshotsHtml}
          ${variablesHtml}
          ${logsHtml}
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
      </body>
      </html>
    `;
  }

  escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}

module.exports = ReportGenerator;