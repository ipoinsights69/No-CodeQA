'use strict';

class ActionHandlers {
  constructor(executor) {
    this.executor = executor;
    this.page = null;
  }

  // Update page reference
  setPage(page) {
    this.page = page;
  }

  // Get handler function for a specific action
  getHandler(action) {
    // Update page reference
    this.page = this.executor.page;
    
    const handlers = {
      // Navigation actions
      open_url: this.openUrl.bind(this),
      go_back: this.goBack.bind(this),
      go_forward: this.goForward.bind(this),
      reload: this.reload.bind(this),
      wait_for_navigation: this.waitForNavigation.bind(this),
      
      // Assertions
      assert_text: this.assertText.bind(this),
      assert_title: this.assertTitle.bind(this),
      assert_url: this.assertUrl.bind(this),
      assert_element_exists: this.assertElementExists.bind(this),
      assert_attr: this.assertAttribute.bind(this),
      assert_response_code: this.assertResponseCode.bind(this),
      
      // Selectors
      get_text: this.getText.bind(this),
      get_attr: this.getAttribute.bind(this),
      check_xpath: this.checkXPath.bind(this),
      get_element_count: this.getElementCount.bind(this),
      
      // Interactions
      click: this.click.bind(this),
      type: this.type.bind(this),
      hover: this.hover.bind(this),
      select: this.select.bind(this),
      scroll: this.scroll.bind(this),
      upload_file: this.uploadFile.bind(this),
      
      // Conditionals
      if_equals: this.ifEquals.bind(this),
      if_contains: this.ifContains.bind(this),
      if_element_exists: this.ifElementExists.bind(this),
      if_status_code: this.ifStatusCode.bind(this),
      switch: this.switch.bind(this),
      loop: this.loop.bind(this),
      try_catch: this.tryCatch.bind(this),
      
      // Waits
      wait_for_selector: this.waitForSelector.bind(this),
      wait_for_timeout: this.waitForTimeout.bind(this),
      wait_until_text: this.waitUntilText.bind(this),
      
      // Network/API
      intercept_request: this.interceptRequest.bind(this),
      mock_response: this.mockResponse.bind(this),
      validate_network_call: this.validateNetworkCall.bind(this),
      measure_performance: this.measurePerformance.bind(this),
      
      // Utility
      screenshot: this.screenshot.bind(this),
      save_value: this.saveValue.bind(this),
      print_log: this.printLog.bind(this),
      set_variable: this.setVariable.bind(this),
      get_cookie: this.getCookie.bind(this),
      set_cookie: this.setCookie.bind(this),
    };
    
    return handlers[action];
  }

  // Navigation actions
  async openUrl({ url }) {
    await this.page.goto(url, { waitUntil: 'networkidle' });
    return { url: this.page.url() };
  }

  async goBack() {
    await this.page.goBack();
    return { url: this.page.url() };
  }

  async goForward() {
    await this.page.goForward();
    return { url: this.page.url() };
  }

  async reload() {
    await this.page.reload();
    return { url: this.page.url() };
  }

  async waitForNavigation() {
    await this.page.waitForNavigation();
    return { url: this.page.url() };
  }

  // Assertions
  async assertText({ selector, expected, contains = false }) {
    const text = await this.page.textContent(selector);
    
    if (contains) {
      if (!text.includes(expected)) {
        throw new Error(`Text "${text}" does not contain "${expected}"`);
      }
    } else {
      if (text !== expected) {
        throw new Error(`Text "${text}" does not equal "${expected}"`);
      }
    }
    
    return { actual: text, expected };
  }

  async assertTitle({ expected, contains = false }) {
    const title = await this.page.title();
    
    if (contains) {
      if (!title.includes(expected)) {
        throw new Error(`Title "${title}" does not contain "${expected}"`);
      }
    } else {
      if (title !== expected) {
        throw new Error(`Title "${title}" does not equal "${expected}"`);
      }
    }
    
    return { actual: title, expected };
  }

  async assertUrl({ expected, contains = false }) {
    const url = this.page.url();
    
    if (contains) {
      if (!url.includes(expected)) {
        throw new Error(`URL "${url}" does not contain "${expected}"`);
      }
    } else {
      if (url !== expected) {
        throw new Error(`URL "${url}" does not equal "${expected}"`);
      }
    }
    
    return { actual: url, expected };
  }

  async assertElementExists({ selector, exists = true }) {
    const elementExists = await this.page.$(selector) !== null;
    
    if (elementExists !== exists) {
      throw new Error(`Element ${selector} ${exists ? 'does not exist' : 'exists'} but expected ${exists ? 'to exist' : 'not to exist'}`);
    }
    
    return { selector, exists: elementExists };
  }

  async assertAttribute({ selector, attribute, expected, contains = false }) {
    const value = await this.page.getAttribute(selector, attribute);
    
    if (contains) {
      if (!value.includes(expected)) {
        throw new Error(`Attribute ${attribute} value "${value}" does not contain "${expected}"`);
      }
    } else {
      if (value !== expected) {
        throw new Error(`Attribute ${attribute} value "${value}" does not equal "${expected}"`);
      }
    }
    
    return { selector, attribute, actual: value, expected };
  }

  async assertResponseCode({ url, expected }) {
    // Wait for response matching the URL
    const response = await this.page.waitForResponse(url);
    const status = response.status();
    
    if (status !== expected) {
      throw new Error(`Response code ${status} does not equal expected ${expected}`);
    }
    
    return { url, actual: status, expected };
  }

  // Selectors
  async getText({ selector, saveAs, xPath = false }) {
    let text;
    
    if (xPath) {
      const elements = await this.page.$x(selector);
      if (elements.length === 0) {
        throw new Error(`XPath selector not found: ${selector}`);
      }
      text = await this.page.evaluate(el => el.textContent.trim(), elements[0]);
    } else {
      text = await this.page.textContent(selector);
    }
    
    if (saveAs) {
      this.executor.setVariable(saveAs, text);
    }
    
    return { selector, text };
  }

  async getAttribute({ selector, attribute, saveAs, xPath = false }) {
    let value;
    
    if (xPath) {
      const elements = await this.page.$x(selector);
      if (elements.length === 0) {
        throw new Error(`XPath selector not found: ${selector}`);
      }
      value = await this.page.evaluate((el, attr) => el.getAttribute(attr), elements[0], attribute);
    } else {
      value = await this.page.getAttribute(selector, attribute);
    }
    
    if (saveAs) {
      this.executor.setVariable(saveAs, value);
    }
    
    return { selector, attribute, value };
  }

  async checkXPath({ xpath, saveAs, checkVisibility = false }) {
    const elements = await this.page.$x(xpath);
    const exists = elements.length > 0;
    
    let result = { xpath, exists, count: elements.length };
    
    // Check visibility if requested and element exists
    if (checkVisibility && exists) {
      const isVisible = await this.page.evaluate(el => {
        // Check if element is visible (has layout and is not hidden)
        const style = window.getComputedStyle(el);
        return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }, elements[0]);
      
      result.visible = isVisible;
    }
    
    if (saveAs) {
      this.executor.setVariable(saveAs, exists);
    }
    
    return result;
  }

  async getElementCount({ selector, saveAs, xPath = false }) {
    let count;
    
    if (xPath) {
      const elements = await this.page.$x(selector);
      count = elements.length;
    } else {
      const elements = await this.page.$$(selector);
      count = elements.length;
    }
    
    if (saveAs) {
      this.executor.setVariable(saveAs, count);
    }
    
    return { selector, count };
  }

  // Interactions
  async click({ selector, xPath = false }) {
    if (xPath) {
      const elements = await this.page.$x(selector);
      if (elements.length === 0) {
        throw new Error(`XPath selector not found: ${selector}`);
      }
      await elements[0].click();
    } else {
      await this.page.click(selector);
    }
    return { selector };
  }

  async type({ selector, text, xPath = false }) {
    if (xPath) {
      const elements = await this.page.$x(selector);
      if (elements.length === 0) {
        throw new Error(`XPath selector not found: ${selector}`);
      }
      await elements[0].type(text);
    } else {
      await this.page.fill(selector, text);
    }
    return { selector, text };
  }

  async hover({ selector, xPath = false }) {
    if (xPath) {
      const elements = await this.page.$x(selector);
      if (elements.length === 0) {
        throw new Error(`XPath selector not found: ${selector}`);
      }
      await elements[0].hover();
    } else {
      await this.page.hover(selector);
    }
    return { selector };
  }

  async select({ selector, value, xPath = false }) {
    if (xPath) {
      const elements = await this.page.$x(selector);
      if (elements.length === 0) {
        throw new Error(`XPath selector not found: ${selector}`);
      }
      await this.page.evaluate((element, val) => {
        element.value = val;
        element.dispatchEvent(new Event('change'));
      }, elements[0], value);
    } else {
      await this.page.selectOption(selector, value);
    }
    return { selector, value };
  }

  async scroll({ selector, position, xPath = false }) {
    if (selector) {
      if (xPath) {
        const elements = await this.page.$x(selector);
        if (elements.length === 0) {
          throw new Error(`XPath selector not found: ${selector}`);
        }
        await elements[0].scrollIntoViewIfNeeded();
      } else {
        await this.page.scrollIntoViewIfNeeded(selector);
      }
      return { selector };
    } else if (position) {
      await this.page.evaluate(({ x, y }) => {
        window.scrollTo(x, y);
      }, position);
      return { position };
    }
    
    throw new Error('Either selector or position must be provided for scroll action');
  }

  async uploadFile({ selector, filePath, xPath = false }) {
    if (xPath) {
      const elements = await this.page.$x(selector);
      if (elements.length === 0) {
        throw new Error(`XPath selector not found: ${selector}`);
      }
      const inputElement = elements[0];
      await inputElement.setInputFiles(filePath);
    } else {
      await this.page.setInputFiles(selector, filePath);
    }
    return { selector, filePath };
  }
  
  async dragAndDrop({ sourceSelector, targetSelector, sourceXPath = false, targetXPath = false }) {
    let sourceElement, targetElement;
    
    if (sourceXPath) {
      const elements = await this.page.$x(sourceSelector);
      if (elements.length === 0) {
        throw new Error(`Source XPath selector not found: ${sourceSelector}`);
      }
      sourceElement = elements[0];
    } else {
      sourceElement = await this.page.$(sourceSelector);
    }
    
    if (targetXPath) {
      const elements = await this.page.$x(targetSelector);
      if (elements.length === 0) {
        throw new Error(`Target XPath selector not found: ${targetSelector}`);
      }
      targetElement = elements[0];
    } else {
      targetElement = await this.page.$(targetSelector);
    }
    
    const sourceBound = await sourceElement.boundingBox();
    const targetBound = await targetElement.boundingBox();
    
    await this.page.mouse.move(sourceBound.x + sourceBound.width / 2, sourceBound.y + sourceBound.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(targetBound.x + targetBound.width / 2, targetBound.y + targetBound.height / 2);
    await this.page.mouse.up();
    
    return { sourceSelector, targetSelector };
  }

  // Conditionals
  async ifEquals({ value1, value2, then, else: elsePath }) {
    const result = value1 === value2;
    const nextStep = result ? then : elsePath;
    
    // Override next step in flow
    return { result, nextStep };
  }

  async ifContains({ value, contains, then, else: elsePath }) {
    const result = value.includes(contains);
    const nextStep = result ? then : elsePath;
    
    return { result, nextStep };
  }

  async ifElementExists({ selector, then, else: elsePath }) {
    const exists = await this.page.$(selector) !== null;
    const nextStep = exists ? then : elsePath;
    
    return { selector, exists, nextStep };
  }

  async ifStatusCode({ url, expected, then, else: elsePath }) {
    const response = await this.page.waitForResponse(url);
    const status = response.status();
    const result = status === expected;
    const nextStep = result ? then : elsePath;
    
    return { url, status, result, nextStep };
  }

  async switch({ value, cases, default: defaultCase }) {
    let nextStep = defaultCase;
    
    for (const [caseValue, caseStep] of Object.entries(cases)) {
      if (value === caseValue) {
        nextStep = caseStep;
        break;
      }
    }
    
    return { value, nextStep };
  }

  async loop({ foreach, as, steps }) {
    const items = Array.isArray(foreach) ? foreach : [foreach];
    const results = [];
    
    for (const item of items) {
      if (as) {
        this.executor.setVariable(as, item);
      }
      
      // TODO: Implement nested step execution
      results.push(item);
    }
    
    return { items: items.length, results };
  }

  async tryCatch({ try: tryStep, catch: catchStep }) {
    try {
      // TODO: Implement nested step execution
      return { success: true, nextStep: tryStep };
    } catch (error) {
      return { success: false, error: error.message, nextStep: catchStep };
    }
  }

  // Waits
  async waitForSelector({ selector, timeout }) {
    await this.page.waitForSelector(selector, { timeout });
    return { selector };
  }

  async waitForTimeout({ timeout }) {
    await this.page.waitForTimeout(timeout);
    return { timeout };
  }

  async waitUntilText({ selector, text, timeout }) {
    await this.page.waitForFunction(
      ({ selector, text }) => {
        const element = document.querySelector(selector);
        return element && element.textContent.includes(text);
      },
      { selector, text },
      { timeout }
    );
    
    return { selector, text };
  }

  // Network/API
  async interceptRequest({ url, action = 'continue' }) {
    await this.page.route(url, route => {
      if (action === 'abort') {
        return route.abort();
      } else if (action === 'continue') {
        return route.continue();
      }
    });
    
    return { url, action };
  }

  async mockResponse({ url, status = 200, headers = {}, body = '' }) {
    await this.page.route(url, route => {
      route.fulfill({
        status,
        headers,
        body: typeof body === 'string' ? body : JSON.stringify(body)
      });
    });
    
    return { url, status };
  }

  async validateNetworkCall({ url, method, saveResponse, expectedStatus, expectedContent }) {
    let response = null;
    
    const responsePromise = this.page.waitForResponse(
      res => res.url().includes(url) && (!method || res.request().method() === method),
      { timeout: this.executor.options.timeout }
    );
    
    response = await responsePromise;
    
    const status = response.status();
    let responseBody = null;
    
    try {
      responseBody = await response.json();
    } catch (e) {
      // Not JSON response
      try {
        responseBody = await response.text();
      } catch (err) {
        // Unable to get response body
      }
    }
    
    if (saveResponse) {
      this.executor.setVariable(saveResponse, {
        status,
        body: responseBody,
        headers: response.headers()
      });
    }
    
    // Validate status code if expected status is provided
    if (expectedStatus && status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus} but got ${status}`);
    }
    
    // Validate response content if expected content is provided
    if (expectedContent && responseBody && !JSON.stringify(responseBody).includes(expectedContent)) {
      throw new Error(`Response does not contain expected content: ${expectedContent}`);
    }
    
    return { url, status, response: responseBody };
  }

  async measurePerformance({ metrics = ['LCP', 'FID', 'CLS'] }) {
    // Basic implementation - in real world would use more sophisticated metrics
    const performanceEntries = await this.page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'));
    });
    
    return { metrics: JSON.parse(performanceEntries) };
  }

  // Utility
  async screenshot({ path, fullPage = false }) {
    const screenshotPath = path || `screenshot_${Date.now()}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage });
    this.executor.screenshots.push(screenshotPath);
    
    return { path: screenshotPath };
  }
  
  async verifyRedirectedUrl({ selector, expectedUrl, timeout = 30000, xPath = false, saveAs }) {
    // Store current URL before click
    const initialUrl = this.page.url();
    
    // Click on the element
    if (xPath) {
      const elements = await this.page.$x(selector);
      if (elements.length === 0) {
        throw new Error(`XPath selector not found: ${selector}`);
      }
      await elements[0].click();
    } else {
      await this.page.click(selector);
    }
    
    // Wait for navigation to complete
    try {
      await this.page.waitForNavigation({ timeout });
    } catch (error) {
      throw new Error(`Navigation did not occur after clicking ${selector}: ${error.message}`);
    }
    
    // Get the new URL after navigation
    const newUrl = this.page.url();
    
    // Verify if the URL matches the expected URL
    const success = !expectedUrl || newUrl.includes(expectedUrl);
    
    const result = {
      initialUrl,
      redirectedUrl: newUrl,
      success
    };
    
    if (!success) {
      throw new Error(`Expected URL to contain ${expectedUrl} but got ${newUrl}`);
    }
    
    if (saveAs) {
      this.executor.setVariable(saveAs, result);
    }
    
    return result;
  }
  
  async captureNetworkLogs({ urlPattern = '', includeRequestData = false, includeResponseData = true, saveAs }) {
    const logs = [];
    
    // Setup network event listeners
    this.page.on('request', request => {
      if (!urlPattern || request.url().includes(urlPattern)) {
        const log = {
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType(),
          timestamp: new Date().toISOString()
        };
        
        if (includeRequestData) {
          log.headers = request.headers();
          try {
            log.postData = request.postData();
          } catch (e) {
            // Ignore if post data can't be accessed
          }
        }
        
        logs.push(log);
      }
    });
    
    this.page.on('response', async response => {
      if (!urlPattern || response.url().includes(urlPattern)) {
        const existingLog = logs.find(log => log.url === response.url());
        
        if (existingLog) {
          existingLog.status = response.status();
          
          if (includeResponseData) {
            existingLog.responseHeaders = response.headers();
            try {
              const contentType = response.headers()['content-type'] || '';
              if (contentType.includes('application/json') || contentType.includes('text/')) {
                existingLog.responseBody = await response.text();
              }
            } catch (e) {
              // Ignore if response body can't be accessed
            }
          }
        }
      }
    });
    
    if (saveAs) {
      this.executor.setVariable(saveAs, logs);
    }
    
    return logs;
  }

  async saveValue({ value, saveAs }) {
    this.executor.setVariable(saveAs, value);
    return { value, saveAs };
  }

  async printLog({ message, level = 'info' }) {
    this.executor.log(level, message);
    return { message, level };
  }

  async setVariable({ name, value }) {
    this.executor.setVariable(name, value);
    return { name, value };
  }

  async getCookie({ name, saveAs }) {
    const cookies = await this.page.context().cookies();
    const cookie = cookies.find(c => c.name === name);
    
    if (saveAs && cookie) {
      this.executor.setVariable(saveAs, cookie.value);
    }
    
    return { name, value: cookie ? cookie.value : null };
  }

  async setCookie({ name, value, domain, path = '/' }) {
    await this.page.context().addCookies([{
      name,
      value,
      domain: domain || new URL(this.page.url()).hostname,
      path
    }]);
    
    return { name, value };
  }
}

module.exports = ActionHandlers;