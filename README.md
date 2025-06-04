# No-CodeQA

A no-code test automation platform with JSON-based test flows. This project allows you to define and run automated browser tests using a simple JSON configuration without writing any code.

## Features

### Core Test Actions

- **Navigation**: open_url, go_back, go_forward, reload, wait_for_navigation
- **Assertions**: assert_text, assert_title, assert_url, assert_element_exists, assert_attr, assert_response_code
- **Selectors**: get_text, get_attr, check_xpath, get_element_count
- **Interactions**: click, type, hover, select, scroll, upload_file, drag_and_drop
- **Conditionals**: if_equals, if_contains, if_element_exists, if_status_code, switch, loop, try_catch
- **Waits**: wait_for_selector, wait_for_timeout, wait_until_text
- **Network/API**: intercept_request, mock_response, validate_network_call, measure_performance, capture_network_logs
- **QA-Specific**: verify_xpath, verify_redirected_url, capture_network_logs
- **Utility**: screenshot, save_value, print_log, set_variable, get_cookie, set_cookie

### Advanced Features

- **Variable System**: Use `{{variable_name}}` to reuse saved data across steps
- **Loops**: Iterate over data collections
- **Retry Logic**: Auto-retry flaky steps
- **Parallel Tests**: Support for parallel test execution
- **Reporting**: JSON and HTML reports with screenshots
- **XPath Support**: Enhanced XPath verification with visibility checking
- **Network Monitoring**: Capture and validate network traffic
- **URL Redirection**: Verify redirected URLs after clicking elements
- **Media Recording**: Record videos and HAR files of test execution
- **Test Tracking**: Track test execution with unique test IDs

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/No-CodeQA.git
cd No-CodeQA

# Install dependencies
npm install

# Start the server
npm start
```

The server will start on port 3000 by default. If port 3000 is already in use, the server will automatically try the next available port (3001, 3002, etc.) up to 10 attempts. You can also specify a custom port by setting the `PORT` environment variable:

```bash
# Start on a specific port
PORT=4000 npm start
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server configuration
PORT=3000

# Browser options
HEADLESS=true
DEFAULT_BROWSER=chromium
DEFAULT_TIMEOUT=30000

# Storage paths
SCREENSHOTS_DIR=./screenshots
VIDEOS_DIR=./videos
HAR_FILES_DIR=./har-files
```

## Usage

### Using the API

The No-CodeQA platform provides a RESTful API for executing tests and retrieving results.

#### Execute a Test

```javascript
const axios = require('axios');

async function executeTest() {
  const response = await axios.post('http://localhost:3000/api/v1/execute', {
    flow: {
      test_name: "Simple Login Test",
      start: "openHomepage",
      steps: {
        "openHomepage": {
          "action": "open_url",
          "url": "https://example.com/login",
          "next": "enterUsername"
        },
        "enterUsername": {
          "action": "type",
          "selector": "#username",
          "text": "testuser",
          "next": "enterPassword"
        },
        "enterPassword": {
          "action": "type",
          "selector": "#password",
          "text": "password123",
          "next": "clickLogin"
        },
        "clickLogin": {
          "action": "click",
          "selector": "#login-button",
          "next": "assertDashboard"
        },
        "assertDashboard": {
          "action": "assert_text",
          "selector": ".dashboard-welcome",
          "text": "Welcome, testuser",
          "next": "end"
        }
      }
    },
    options: {
      headless: true,
      browser: 'chromium',
      saveScreenshots: true
    }
  });
  
  return response.data;
}
```

#### Get Test Results

```javascript
const axios = require('axios');

async function getTestResult(testId) {
  const response = await axios.get(`http://localhost:3000/api/v1/results/${testId}`);
  return response.data;
}
```

### Using the CLI

You can also run tests using the command-line interface:

```bash
node src/cli.js examples/login-test.json --headless=true --browser=chromium
```

## Test Flow Structure

A test flow is defined as a JSON object with the following structure:

```json
{
  "test_name": "Example Test",
  "start": "firstStep",
  "steps": {
    "firstStep": {
      "action": "open_url",
      "url": "https://example.com",
      "next": "secondStep"
    },
    "secondStep": {
      "action": "click",
      "selector": ".button",
      "next": "thirdStep"
    },
    "thirdStep": {
      "action": "assert_text",
      "selector": ".result",
      "text": "Success",
      "next": "end"
    }
  }
}
```

## Advanced Examples

Check the `examples` directory for more advanced test flow examples, including:

- Conditional logic
- Variable usage
- Loops and iterations
- Error handling with try/catch
- Network request interception
- Performance measurements

## License

MIT