'use strict';

const path = require('path');

/**
 * Generates a professional HTML report for test results
 * @param {Object} testResult - The test result object
 * @param {string} testId - The unique test identifier
 * @returns {string} HTML report content
 */
function generateHtmlReport(testResult, testId) {
  const { status, duration, steps, logs, screenshots, summary, completedAt } = testResult;

  // Helper functions for formatting and styling
  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}min`;
  };

  const getStatusColor = (stepStatus) => {
    if (stepStatus === 'passed') return 'text-emerald-600';
    if (stepStatus === 'failed') return 'text-rose-600';
    return 'text-slate-500'; // For 'skipped' or other statuses
  };
  
  const getStatusBadgeColor = (stepStatus) => {
    if (stepStatus === 'passed') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (stepStatus === 'failed') return 'bg-rose-100 text-rose-800 border-rose-200';
    return 'bg-slate-100 text-slate-800 border-slate-200'; // For 'skipped' or other statuses
  };

  const overallStatusColor = status === 'passed' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white';
  const overallStatusIcon = status === 'passed' ? '✅' : '❌';

  // Generate flow diagram SVG
  const generateFlowDiagram = (steps) => {
    if (!steps || steps.length === 0) return '';
    
    const boxWidth = 220;
    const boxHeight = 70;
    const verticalGap = 50;
    const totalHeight = steps.length * (boxHeight + verticalGap) + 20;
    const svgWidth = boxWidth + 60;
    
    let flowSvg = `<svg width="${svgWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="passedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#10b981" />
          <stop offset="100%" stop-color="#059669" />
        </linearGradient>
        <linearGradient id="failedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#e11d48" />
          <stop offset="100%" stop-color="#be123c" />
        </linearGradient>
        <linearGradient id="skippedGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#94a3b8" />
          <stop offset="100%" stop-color="#64748b" />
        </linearGradient>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="2" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.2" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
        </marker>
      </defs>
      <rect width="${svgWidth}" height="${totalHeight}" fill="#f8fafc" rx="8" ry="8" />
    `;
    
    steps.forEach((step, index) => {
      const y = index * (boxHeight + verticalGap) + 20;
      const gradientId = step.status === 'passed' ? 'passedGradient' : (step.status === 'failed' ? 'failedGradient' : 'skippedGradient');
      const statusIcon = step.status === 'passed' ? '✓' : (step.status === 'failed' ? '✗' : '⚠');
      const textColor = 'white';
      
      // Add box for step with gradient and shadow
      flowSvg += `
        <g filter="url(#dropShadow)">
          <rect x="30" y="${y}" width="${boxWidth}" height="${boxHeight}" rx="10" ry="10" 
                fill="url(#${gradientId})" />
        </g>
        <circle cx="50" cy="${y + boxHeight/2}" r="12" fill="white" fill-opacity="0.9" />
        <text x="50" y="${y + boxHeight/2 + 5}" text-anchor="middle" font-size="16" font-weight="bold" fill="${step.status === 'passed' ? '#10b981' : (step.status === 'failed' ? '#e11d48' : '#64748b')}">
          ${statusIcon}
        </text>
        <text x="${boxWidth/2 + 30}" y="${y + 30}" text-anchor="middle" font-size="16" font-weight="bold" fill="${textColor}">
          ${step.id}
        </text>
        <text x="${boxWidth/2 + 30}" y="${y + 55}" text-anchor="middle" font-size="14" fill="${textColor}" fill-opacity="0.9">
          ${step.action.length > 25 ? step.action.substring(0, 22) + '...' : step.action}
        </text>
      `;
      
      // Add arrow to next step
      if (index < steps.length - 1) {
        flowSvg += `
          <line x1="${boxWidth/2 + 30}" y1="${y + boxHeight}" x2="${boxWidth/2 + 30}" y2="${y + boxHeight + verticalGap - 10}" 
                stroke="#64748b" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#arrowhead)" />
        `;
      }
    });
    
    flowSvg += '</svg>';
    return flowSvg;
  };

  // Generate step cards
  let stepsHtml = '';
  if (steps && steps.length > 0) {
    stepsHtml = steps.map((step, index) => {
      const stepStatusColor = getStatusColor(step.status);
      const stepStatusBadge = getStatusBadgeColor(step.status);
      const stepScreenshots = screenshots ? screenshots.filter(s => s.includes(`${step.id}_before`) || s.includes(`${step.id}_after`)) : [];
      const stepIcon = step.status === 'passed' ? '✓' : (step.status === 'failed' ? '✗' : '⚠');
      
      let screenshotHtml = '';
      if (stepScreenshots.length > 0) {
        screenshotHtml = `
          <div class="mt-4 pt-3 border-t border-slate-100">
            <p class="text-sm font-medium text-slate-700 mb-2">Screenshots</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${stepScreenshots.map(s => `
                <div class="group relative">
                  <p class="text-xs text-slate-500 mb-1">${s.substring(s.lastIndexOf('/') + 1)}</p>
                  <img src="${s}" alt="Screenshot for step ${step.id}" class="border rounded-md max-w-full h-auto shadow-sm group-hover:shadow-md transition-shadow">
                  <div class="absolute inset-0 bg-slate-900 bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center rounded-md">
                    <span class="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">View</span>
                  </div>
                </div>`).join('')}
            </div>
          </div>`;
      }

      return `
        <div class="mb-6 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200">
          <div class="flex items-center p-4 border-l-4 ${step.status === 'passed' ? 'border-emerald-500' : (step.status === 'failed' ? 'border-rose-500' : 'border-slate-400')}">
            <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${step.status === 'passed' ? 'bg-emerald-100 text-emerald-600' : (step.status === 'failed' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600')}">
              <span class="text-lg font-bold">${stepIcon}</span>
            </div>
            <div class="ml-3 flex-grow">
              <div class="flex justify-between items-center">
                <h4 class="text-lg font-semibold text-slate-800">Step ${index + 1}: ${step.id}</h4>
                <span class="px-3 py-1 text-xs font-medium rounded-full border ${stepStatusBadge}">${step.status.toUpperCase()}</span>
              </div>
              <p class="text-sm text-slate-600 mt-1">${step.action}</p>
            </div>
          </div>
          
          <div class="p-4 bg-white">
            ${step.duration ? `<div class="flex items-center text-sm text-slate-500"><svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> Duration: ${formatDuration(step.duration)}</div>` : ''}
            ${step.result && Object.keys(step.result).length > 0 ? `
              <div class="mt-3">
                <p class="text-sm font-medium text-slate-700 mb-2">Result</p>
                <div class="p-3 bg-slate-50 rounded-md overflow-hidden border border-slate-200">
                  <pre class="text-xs text-slate-700 overflow-x-auto">${JSON.stringify(step.result, null, 2)}</pre>
                </div>
              </div>` : ''}
            ${screenshotHtml}
          </div>
        </div>
      `;
    }).join('');
  } else {
    stepsHtml = '<div class="p-8 text-center text-slate-500"><svg class="w-12 h-12 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><p>No steps executed.</p></div>';
  }

  // Generate logs section
  let logsHtml = '';
  if (logs && logs.length > 0) {
    logsHtml = logs.map(log => {
      const logLevelClass = log.level === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 
                           (log.level === 'warn' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
                           'bg-sky-50 border-sky-200 text-sky-700');
      const logIcon = log.level === 'error' ? '⚠️' : (log.level === 'warn' ? '⚠' : 'ℹ️');
      
      return `
      <div class="text-xs py-2 px-3 border-b border-slate-200 hover:bg-slate-50 flex items-start">
        <span class="font-mono text-slate-500 whitespace-nowrap mr-2">[${new Date(log.timestamp).toLocaleTimeString()}]</span>
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${logLevelClass} mr-2">
          ${logIcon} ${log.level.toUpperCase()}
        </span>
        <span class="text-slate-700 flex-grow">${log.message}</span>
      </div>`;
    }).join('');
    
    logsHtml = `<div class="mt-6 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200">
                  <div class="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <h3 class="text-xl font-semibold text-slate-800">Execution Logs</h3>
                  </div>
                  <div class="max-h-80 overflow-y-auto bg-white">${logsHtml}</div>
                </div>`;
  }
  
  // Generate video section if available
  const videoPath = summary && summary.videoPath && typeof summary.videoPath === 'string' && summary.videoPath.trim() !== '' ? summary.videoPath : null;
  let videoHtml = '';
  if (videoPath) {
    videoHtml = `
      <div class="mt-6 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200">
        <div class="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
          <svg class="w-5 h-5 mr-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          <h3 class="text-xl font-semibold text-slate-800">Test Recording</h3>
        </div>
        <div class="p-4 bg-white">
          <div class="rounded-md overflow-hidden border border-slate-200 shadow-sm">
            <video controls width="100%" class="bg-black">
              <source src="${videoPath}" type="video/webm">
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    `;
  }

  // Generate flow diagram if steps are available
  let flowDiagramHtml = '';
  if (steps && steps.length > 0) {
    flowDiagramHtml = `
      <div class="mt-6 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200">
        <div class="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
          <svg class="w-5 h-5 mr-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path></svg>
          <h3 class="text-xl font-semibold text-slate-800">Test Flow Diagram</h3>
        </div>
        <div class="p-4 bg-white">
          <div class="overflow-x-auto p-4 rounded-md border border-slate-100 bg-slate-50 flex justify-center">
            ${generateFlowDiagram(steps)}
          </div>
        </div>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Report - ${summary && summary.test_name ? summary.test_name : testId}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">
      <style>
        body { 
          font-family: 'Inter', sans-serif;
          background-color: #f8fafc;
          color: #1e293b;
        }
        .card-hover {
          transition: all 0.3s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .7;
          }
        }
        .screenshot-zoom {
          transition: transform 0.3s ease;
        }
        .screenshot-zoom:hover {
          transform: scale(1.02);
        }
      </style>
    </head>
    <body class="p-4 md:p-6 lg:p-8">
      <div class="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
        <header class="p-6 ${overallStatusColor}">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="text-4xl mr-4">${overallStatusIcon}</div>
              <div>
                <h1 class="text-2xl md:text-3xl font-bold">Test Report</h1>
                <p class="text-lg mt-1 opacity-90">${summary && summary.test_name ? summary.test_name : 'Unnamed Test'}</p>
              </div>
            </div>
            <div class="text-sm opacity-80">Test ID: ${testId}</div>
          </div>
        </header>

        <section class="p-6">
          <h2 class="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            Summary
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="p-5 bg-white rounded-xl border border-slate-200 shadow-sm card-hover">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 mr-2 ${status === 'passed' ? 'text-emerald-500' : 'text-rose-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p class="text-sm font-medium text-slate-500">Status</p>
              </div>
              <p class="text-2xl font-bold ${getStatusColor(status)}">${status.toUpperCase()}</p>
            </div>
            <div class="p-5 bg-white rounded-xl border border-slate-200 shadow-sm card-hover">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p class="text-sm font-medium text-slate-500">Duration</p>
              </div>
              <p class="text-2xl font-bold text-slate-700">${formatDuration(duration)}</p>
            </div>
            <div class="p-5 bg-white rounded-xl border border-slate-200 shadow-sm card-hover">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                <p class="text-sm font-medium text-slate-500">Steps</p>
              </div>
              <p class="text-2xl font-bold text-slate-700">${summary && summary.steps_total !== undefined ? summary.steps_total : (steps ? steps.length : 0)}</p>
            </div>
            <div class="p-5 bg-white rounded-xl border border-slate-200 shadow-sm card-hover">
              <div class="flex items-center mb-2">
                <svg class="w-5 h-5 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                <p class="text-sm font-medium text-slate-500">Completed</p>
              </div>
              <p class="text-2xl font-bold text-slate-700">${new Date(completedAt).toLocaleString()}</p>
            </div>
          </div>
          ${summary && summary.error ? `
          <div class="p-5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl mb-6 shadow-sm">
            <div class="flex items-start">
              <svg class="w-6 h-6 mr-3 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div>
                <p class="font-semibold">Error Detected:</p>
                <pre class="mt-2 text-sm overflow-x-auto p-3 bg-rose-100 bg-opacity-50 rounded-md">${summary.error}</pre>
              </div>
            </div>
          </div>` : ''}
        </section>
        
        ${flowDiagramHtml}

        <section class="p-6 border-t border-slate-200">
          <h2 class="text-2xl font-semibold text-slate-800 mb-4 flex items-center">
            <svg class="w-6 h-6 mr-2 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
            Test Steps
          </h2>
          ${stepsHtml}
        </section>
        
        ${videoHtml}

        ${logsHtml}

        <footer class="p-6 border-t border-slate-200 bg-slate-50 text-center text-sm text-slate-500">
          <div class="flex flex-col md:flex-row justify-between items-center max-w-4xl mx-auto">
            <p>Report generated on ${new Date().toLocaleString()}</p>
            <p class="mt-2 md:mt-0 flex items-center">
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
              Test ID: <span class="font-mono ml-1">${testId}</span>
            </p>
          </div>
        </footer>
      </div>
      
      <script>
        // Enable image zoom on click
        document.addEventListener('DOMContentLoaded', function() {
          // Handle screenshot clicks for larger view
          const screenshots = document.querySelectorAll('img[alt^="Screenshot"]');
          screenshots.forEach(img => {
            img.classList.add('screenshot-zoom', 'cursor-pointer');
            img.addEventListener('click', function() {
              const overlay = document.createElement('div');
              overlay.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4';
              
              const imgClone = this.cloneNode(true);
              imgClone.className = 'max-w-full max-h-full object-contain';
              
              overlay.appendChild(imgClone);
              document.body.appendChild(overlay);
              
              overlay.addEventListener('click', function() {
                this.remove();
              });
            });
          });
          
          // Enable collapsible sections
          const collapsibleHeaders = document.querySelectorAll('.collapsible-header');
          collapsibleHeaders.forEach(header => {
            header.addEventListener('click', function() {
              const content = this.nextElementSibling;
              content.classList.toggle('hidden');
              this.querySelector('.toggle-icon').textContent = 
                content.classList.contains('hidden') ? '+' : '-';
            });
          });
        });
      </script>
    </body>
    </html>
  `;
}

module.exports = { generateHtmlReport };