# No-CodeQA

A no-code test automation platform with JSON-based test flows. This project allows you to define and run automated browser tests using a simple JSON configuration without writing any code.

## Features

No-CodeQA provides a rich set of actions and features to build comprehensive automated tests.

### Core Test Actions

Each action is defined within a `step` in your JSON test flow. A step typically includes an `action` type (e.g., `open_url`, `click`), relevant `parameters` for that action, and a `next` property to define the subsequent step in the flow. If a step is the last one, its `next` property should be set to `"end"`.

Below is a detailed breakdown of available actions, their parameters, and examples.

-   **Navigation**: Actions for controlling browser navigation.

    *   `open_url`
        *   **Description**: Navigates the browser to a specified URL.
        *   **Parameters**:
            *   `url` (string, required): The absolute URL to navigate to (e.g., `"https://www.example.com"`).
        *   **Example**:
            ```json
            "navigateToGoogle": {
              "action": "open_url",
              "url": "https://www.google.com",
              "next": "searchSomething"
            }
            ```

    *   `go_back`
        *   **Description**: Navigates to the previous page in the browser's history.
        *   **Parameters**: None.
        *   **Example**:
            ```json
            "goBackToPreviousPage": {
              "action": "go_back",
              "next": "verifyPreviousPage"
            }
            ```

    *   `go_forward`
        *   **Description**: Navigates to the next page in the browser's history.
        *   **Parameters**: None.
        *   **Example**:
            ```json
            "goForwardToNextPage": {
              "action": "go_forward",
              "next": "verifyNextPage"
            }
            ```

    *   `reload`
        *   **Description**: Reloads the current page.
        *   **Parameters**: None.
        *   **Example**:
            ```json
            "reloadCurrentPage": {
              "action": "reload",
              "next": "checkForUpdates"
            }
            ```

    *   `wait_for_navigation`
        *   **Description**: Pauses execution until a page navigation event (e.g., page load, history change) completes. This is often used after actions like `click` that trigger a page change.
        *   **Parameters**: None.
        *   **Example**:
            ```json
            "clickLoginButton": {
              "action": "click",
              "selector": "#login-button",
              "next": "waitForDashboardLoad"
            },
            "waitForDashboardLoad": {
              "action": "wait_for_navigation",
              "next": "assertDashboardTitle"
            }
            ```

-   **Assertions**: Actions for verifying expected conditions or states on the web page. If an assertion fails, the test step is marked as failed.

    *   `assert_text`
        *   **Description**: Asserts that an element identified by a selector contains the specified text. The comparison is case-sensitive and checks for exact or partial matches depending on the underlying Playwright implementation (typically exact match for visible text content).
        *   **Parameters**:
            *   `selector` (string, required): A CSS selector or XPath expression to locate the element (e.g., `"h1.main-title"`, `"//div[@id='user-greeting']"`).
            *   `text` (string, required): The expected text content (e.g., `"Welcome, User!"`).
        *   **Example**:
            ```json
            "verifyGreetingMessage": {
              "action": "assert_text",
              "selector": "#welcome-message",
              "text": "Hello, John Doe!",
              "next": "end"
            }
            ```

    *   `assert_title`
        *   **Description**: Asserts that the current page title matches the specified string.
        *   **Parameters**:
            *   `title` (string, required): The expected page title (e.g., `"My Awesome Application"`).
        *   **Example**:
            ```json
            "assertDashboardTitle": {
              "action": "assert_title",
              "title": "User Dashboard - MyApp",
              "next": "end"
            }
            ```

    *   `assert_url`
        *   **Description**: Asserts that the current page URL matches the specified string or regular expression.
        *   **Parameters**:
            *   `url` (string or regex, required): The expected URL or a regular expression to match against the current URL (e.g., `"https://example.com/profile"`, `"/dashboard\\?user=\\d+"`).
        *   **Example**:
            ```json
            "verifyProfileUrl": {
              "action": "assert_url",
              "url": "https://example.com/user/profile",
              "next": "end"
            }
            ```

    *   `assert_element_exists`
        *   **Description**: Asserts that at least one element matching the given selector exists on the page.
        *   **Parameters**:
            *   `selector` (string, required): A CSS selector or XPath expression (e.g., `".error-message"`, `"//button[contains(text(), 'Submit')][@disabled]"`).
        *   **Example**:
            ```json
            "checkErrorMessagePresence": {
              "action": "assert_element_exists",
              "selector": ".alert-danger",
              "next": "end"
            }
            ```

    *   `assert_attr`
        *   **Description**: Asserts that an attribute of an element (identified by a selector) has a specific value.
        *   **Parameters**:
            *   `selector` (string, required): A CSS selector or XPath expression.
            *   `attribute` (string, required): The name of the attribute to check (e.g., `"value"`, `"href"`, `"data-testid"`).
            *   `value` (string, required): The expected value of the attribute.
        *   **Example**:
            ```json
            "verifyInputValue": {
              "action": "assert_attr",
              "selector": "#username-input",
              "attribute": "value",
              "value": "testuser",
              "next": "end"
            }
            ```

    *   `assert_response_code`
        *   **Description**: Asserts that a network request matching a URL pattern (made during the test) had a specific HTTP status code. Requires network interception to be active (see `capture_network_logs` or `intercept_request`).
        *   **Parameters**:
            *   `url` (string or regex, required): A URL string or regex to match the network request (e.g., `"https://api.example.com/users"`, `"/data/.*"`).
            *   `statusCode` (number, required): The expected HTTP status code (e.g., `200`, `404`).
        *   **Example**:
            ```json
            "verifyUserApiSuccess": {
              "action": "assert_response_code",
              "url": "https://api.example.com/users/123",
              "statusCode": 200,
              "next": "end"
            }
            ```

-   **Selectors (Getters)**: Actions for retrieving information from web elements and storing it in variables for later use.

    *   `get_text`
        *   **Description**: Retrieves the text content of an element and saves it to a variable.
        *   **Parameters**:
            *   `selector` (string, required): A CSS selector or XPath expression.
            *   `saveAs` (string, required): The name of the variable to store the retrieved text (e.g., `"pageHeading"`). This variable can then be used in subsequent steps using `{{variable_name}}` syntax.
        *   **Example**:
            ```json
            "storePageHeading": {
              "action": "get_text",
              "selector": "h1.main-title",
              "saveAs": "mainHeadingText",
              "next": "printHeading"
            }
            ```

    *   `get_attr`
        *   **Description**: Retrieves the value of a specified attribute from an element and saves it to a variable.
        *   **Parameters**:
            *   `selector` (string, required): A CSS selector or XPath expression.
            *   `attribute` (string, required): The name of the attribute whose value is to be retrieved (e.g., `"href"`, `"src"`).
            *   `saveAs` (string, required): The name of the variable to store the attribute value.
        *   **Example**:
            ```json
            "getProfileLinkUrl": {
              "action": "get_attr",
              "selector": "a#profile-link",
              "attribute": "href",
              "saveAs": "profileUrl",
              "next": "navigateToProfile"
            }
            ```

    *   `check_xpath`
        *   **Description**: Checks if an element identified by an XPath expression exists and is visible. Saves `true` or `false` to a variable.
        *   **Parameters**:
            *   `xpath` (string, required): The XPath expression (e.g., `"//div[@class='product' and contains(., 'Special Offer')]"`).
            *   `saveAs` (string, required): The name of the boolean variable to store the result.
        *   **Example**:
            ```json
            "checkIfOfferExists": {
              "action": "check_xpath",
              "xpath": "//span[contains(@class, 'discount-badge')]",
              "saveAs": "isDiscountApplied",
              "next": "conditionalDiscountStep"
            }
            ```

    *   `get_element_count`
        *   **Description**: Counts the number of elements matching a given selector and saves the count to a variable.
        *   **Parameters**:
            *   `selector` (string, required): A CSS selector or XPath expression (e.g., `"ul.product-list > li"`, `"//table[@id='resultsTable']/tbody/tr"`).
            *   `saveAs` (string, required): The name of the variable to store the element count.
        *   **Example**:
            ```json
            "countListItems": {
              "action": "get_element_count",
              "selector": ".item-list li",
              "saveAs": "numberOfItems",
              "next": "printItemCount"
            }
            ```

-   **Interactions**: Actions that simulate user interactions with web elements.

    *   `click`
        *   **Description**: Clicks an element identified by a selector.
        *   **Parameters**:
            *   `selector` (string, required): A CSS selector or XPath expression for the element to be clicked.
        *   **Example**:
            ```json
            "submitForm": {
              "action": "click",
              "selector": "button[type='submit']",
              "next": "waitForConfirmation"
            }
            ```

    *   `type`
        *   **Description**: Types the specified text into an input field or textarea identified by a selector. This action first clears the field before typing.
        *   **Parameters**:
            *   `selector` (string, required): A CSS selector or XPath expression for the input field.
            *   `text` (string, required): The text to type into the field. Can include variables like `{{myPassword}}`.
        *   **Example**:
            ```json
            "enterUsername": {
              "action": "type",
              "selector": "#username",
              "text": "testUser123",
              "next": "enterPassword"
            }
            ```

    *   `hover`
        *   **Description**: Simulates hovering the mouse cursor over an element, often used to trigger dropdown menus or tooltips.
        *   **Parameters**:
            *   `selector` (string, required): A CSS selector or XPath expression for the element to hover over.
        *   **Example**:
            ```json
            "hoverOverUserMenu": {
              "action": "hover",
              "selector": "#user-menu-dropdown",
              "next": "clickLogoutLink"
            }
            ```

    *   `select`
        *   **Description**: Selects one or more options in a `<select>` dropdown element.
        *   **Parameters**:
            *   `selector` (string, required): A CSS selector or XPath expression for the `<select>` element.
            *   `value` (string or array of strings, required): The value(s) of the option(s) to select. For a single selection, provide a string. For multiple selections (if the dropdown supports it), provide an array of strings.
        *   **Example (single select)**:
            ```json
            "selectCountry": {
              "action": "select",
              "selector": "#country-select",
              "value": "US",
              "next": "fillZipCode"
            }
            ```
        *   **Example (multi-select)**:
            ```json
            "selectInterests": {
              "action": "select",
              "selector": "#interests-multiselect",
              "value": ["sports", "music"],
              "next": "submitPreferences"
            }
            ```

    *   `scroll`
        *   **Description**: Scrolls the page or a specific scrollable element by a given amount or to make an element visible.
        *   **Parameters**:
            *   `selector` (string, optional): A CSS selector or XPath expression for a specific scrollable element. If omitted, scrolls the main page window.
            *   `x` (number, optional): The horizontal pixel value to scroll to. If `selector` is provided, scrolls within that element.
            *   `y` (number, optional): The vertical pixel value to scroll to. If `selector` is provided, scrolls within that element.
            *   If `x` and `y` are omitted and `selector` is provided, it scrolls the element into view.
        *   **Example (scroll window)**:
            ```json
            "scrollToFooter": {
              "action": "scroll",
              "y": 10000, // Scroll down a large amount to reach footer
              "next": "verifyFooter"
            }
            ```
        *   **Example (scroll element into view)**:
            ```json
            "scrollToSubmitButton": {
              "action": "scroll",
              "selector": "#submit-form-button",
              "next": "clickSubmitButton"
            }
            ```

    *   `upload_file`
        *   **Description**: Uploads a file to an `<input type="file">` element.
        *   **Parameters**:
            *   `selector` (string, required): A CSS selector or XPath expression for the file input element.
            *   `filePath` (string, required): The absolute or relative path to the file to be uploaded (e.g., `"./data/avatar.jpg"`, `"/Users/me/documents/report.pdf"`).
        *   **Example**:
            ```json
            "uploadProfilePicture": {
              "action": "upload_file",
              "selector": "input[type='file'][name='avatar']",
              "filePath": "./test-files/profile.png",
              "next": "saveProfile"
            }
            ```

    *   `drag_and_drop`
        *   **Description**: Simulates dragging an element (source) and dropping it onto another element (target).
        *   **Parameters**:
            *   `sourceSelector` (string, required): CSS selector or XPath for the element to drag.
            *   `targetSelector` (string, required): CSS selector or XPath for the element to drop onto.
        *   **Example**:
            ```json
            "moveTaskToDoneColumn": {
              "action": "drag_and_drop",
              "sourceSelector": "#task-123",
              "targetSelector": "#column-done",
              "next": "verifyTaskMoved"
            }
            ```

-   **Conditionals**: Actions that control the test execution flow based on specified conditions. These actions typically have `then` and `else` properties, which define the name of the next step to execute based on whether the condition is true or false, respectively.

    *   `if_equals`
        *   **Description**: Compares two values. If they are equal, proceeds to the step defined in `then`. Otherwise, proceeds to the step in `else` (if provided).
        *   **Parameters**:
            *   `value1` (any, required): The first value for comparison. Can be a literal or a variable (e.g., `"{{userStatus}}"`).
            *   `value2` (any, required): The second value for comparison.
            *   `then` (string, required): The name of the next step if `value1` equals `value2`.
            *   `else` (string, optional): The name of the next step if `value1` does not equal `value2`.
        *   **Example**:
            ```json
            "checkUserRole": {
              "action": "if_equals",
              "value1": "{{userRole}}",
              "value2": "admin",
              "then": "navigateToAdminPanel",
              "else": "navigateToUserProfile"
            }
            ```

    *   `if_contains`
        *   **Description**: Checks if a string (`text`) contains a specific substring. Proceeds to `then` if true, `else` otherwise.
        *   **Parameters**:
            *   `text` (string, required): The main string to check (e.g., `"{{pageContent}}"`).
            *   `substring` (string, required): The substring to look for.
            *   `then` (string, required): Next step if `text` contains `substring`.
            *   `else` (string, optional): Next step otherwise.
        *   **Example**:
            ```json
            "checkIfErrorMessageDisplayed": {
              "action": "if_contains",
              "text": "{{alertMessage}}",
              "substring": "Error:",
              "then": "reportErrorStep",
              "else": "proceedToNextAction"
            }
            ```

    *   `if_element_exists`
        *   **Description**: Checks if an element matching the selector exists on the page. Proceeds to `then` if true, `else` otherwise.
        *   **Parameters**:
            *   `selector` (string, required): CSS selector or XPath for the element.
            *   `then` (string, required): Next step if element exists.
            *   `else` (string, optional): Next step otherwise.
        *   **Example**:
            ```json
            "checkOptionalFeature": {
              "action": "if_element_exists",
              "selector": "#beta-feature-button",
              "then": "testBetaFeature",
              "else": "skipBetaFeatureTest"
            }
            ```

    *   `if_status_code`
        *   **Description**: Checks if a previously captured network request (matching `url`) had a specific `statusCode`. Proceeds to `then` if true, `else` otherwise. Requires network interception.
        *   **Parameters**:
            *   `url` (string or regex, required): URL or regex to match the network request.
            *   `statusCode` (number, required): Expected HTTP status code.
            *   `then` (string, required): Next step if condition is met.
            *   `else` (string, optional): Next step otherwise.
        *   **Example**:
            ```json
            "checkApiResponse": {
              "action": "if_status_code",
              "url": "/api/v1/data",
              "statusCode": 200,
              "then": "processApiData",
              "else": "handleApiError"
            }
            ```

    *   `switch`
        *   **Description**: Provides multi-branch conditional logic based on the value of a variable. It evaluates `variable` and executes the step defined in the matching `cases` entry. If no case matches, it executes the `default` step.
        *   **Parameters**:
            *   `variable` (string, required): The name of the variable (e.g., `"{{userType}}"`) whose value determines the branch.
            *   `cases` (object, required): An object where keys are possible values of `variable`, and values are the names of the steps to execute for that case.
            *   `default` (string, required): The name of the step to execute if no case matches.
        *   **Example**:
            ```json
            "routeByUserType": {
              "action": "switch",
              "variable": "{{userCategory}}",
              "cases": {
                "guest": "showGuestDashboard",
                "member": "showMemberDashboard",
                "premium": "showPremiumDashboard"
              },
              "default": "showGenericDashboard"
            }
            ```

    *   `loop`
        *   **Description**: Repeats a sequence of defined `steps` for a specified number of `iterations` or over an array of data (not yet fully implemented for data-driven loops in this description, but `iterations` is supported).
        *   **Parameters**:
            *   `iterations` (number, required): The number of times to repeat the loop.
            *   `steps` (array of step definitions, required): An array of step objects to be executed in each iteration. These steps are self-contained and follow the same structure as top-level steps but are local to the loop.
        *   **Example**:
            ```json
            "performActionMultipleTimes": {
              "action": "loop",
              "iterations": 3,
              "steps": [
                {
                  "name": "clickButtonInLoop",
                  "action": "click",
                  "selector": ".increment-button",
                  "next": "logIteration"
                },
                {
                  "name": "logIteration",
                  "action": "print_log",
                  "message": "Clicked button, iteration {{loop.index}}", // loop.index is 0-based
                  "next": "end_loop_step" // Special marker for end of one iteration's steps
                }
              ],
              "next": "afterLoopActions" // Step to execute after all iterations complete
            }
            ```

    *   `try_catch`
        *   **Description**: Allows for error handling. Executes steps in the `try` block. If any step in `try` fails, execution jumps to the `catch` block. If all `try` steps succeed, the `catch` block is skipped.
        *   **Parameters**:
            *   `try` (array of step definitions, required): Steps to attempt.
            *   `catch` (array of step definitions, required): Steps to execute if an error occurs in the `try` block. The error message can be accessed via `{{error.message}}` within the catch block.
        *   **Example**:
            ```json
            "attemptRiskyOperation": {
              "action": "try_catch",
              "try": [
                {
                  "name": "clickOptionalElement",
                  "action": "click",
                  "selector": "#maybe-present-button",
                  "next": "end_try_step"
                }
              ],
              "catch": [
                {
                  "name": "logFailure",
                  "action": "print_log",
                  "message": "Optional element not found or clickable: {{error.message}}",
                  "next": "end_catch_step"
                }
              ],
              "next": "continueAfterTryCatch"
            }
            ```

-   **Waits**: Actions to pause test execution until certain conditions are met or a timeout occurs.

    *   `wait_for_selector`
        *   **Description**: Waits for an element matching the selector to appear on the page and become visible. Fails if the timeout is reached before the element appears.
        *   **Parameters**:
            *   `selector` (string, required): CSS selector or XPath for the element to wait for.
            *   `timeout` (number, optional): Maximum time in milliseconds to wait. Defaults to the global timeout if not specified.
        *   **Example**:
            ```json
            "waitForModalPopup": {
              "action": "wait_for_selector",
              "selector": ".modal-dialog",
              "timeout": 5000,
              "next": "interactWithModal"
            }
            ```

    *   `wait_for_timeout`
        *   **Description**: Pauses test execution for a fixed duration.
        *   **Parameters**:
            *   `timeout` (number, required): Time in milliseconds to wait (e.g., `2000` for 2 seconds).
        *   **Example**:
            ```json
            "pauseForAnimation": {
              "action": "wait_for_timeout",
              "timeout": 1500,
              "next": "checkAnimationResult"
            }
            ```

    *   `wait_until_text`
        *   **Description**: Waits until an element matching the selector contains the specified text.
        *   **Parameters**:
            *   `selector` (string, required): CSS selector or XPath for the element.
            *   `text` (string, required): The text to wait for within the element.
            *   `timeout` (number, optional): Maximum time in milliseconds to wait.
        *   **Example**:
            ```json
            "waitForLoadingCompleteText": {
              "action": "wait_until_text",
              "selector": "#status-message",
              "text": "Data loaded successfully.",
              "timeout": 10000,
              "next": "proceedWithData"
            }
            ```

-   **Network/API**: Actions for interacting with network requests and API calls. These often require specific test options like `captureNetworkLogs` to be enabled.

    *   `intercept_request`
        *   **Description**: Intercepts network requests matching a URL pattern and can optionally modify them or provide a mock response. This is powerful for testing edge cases or offline behavior.
        *   **Parameters**:
            *   `url` (string or regex, required): URL pattern to intercept.
            *   `response` (object, optional): If provided, this object defines the mock response. It can have `status` (number), `headers` (object), and `body` (string or object).
            *   `modifyRequest` (object, optional): Allows modification of the outgoing request (e.g., headers, postData). (More advanced, consult Playwright docs for details).
        *   **Example (Mocking)**:
            ```json
            "mockUserDetailsApi": {
              "action": "intercept_request",
              "url": "**/api/user/details",
              "response": {
                "status": 200,
                "headers": {"Content-Type": "application/json"},
                "body": {"id": "mockUser", "name": "Mock User"}
              },
              "next": "loadUserPageAndVerifyMock"
            }
            ```

    *   `mock_response` (Often an alias or specific use-case of `intercept_request`)
        *   **Description**: Specifically provides a mock response for requests matching a URL pattern.
        *   **Parameters**: Same as `intercept_request` when used for mocking.
        *   **Example**: See `intercept_request` example for mocking.

    *   `validate_network_call`
        *   **Description**: Validates properties of a network call that occurred during the test. Requires network logs to be captured.
        *   **Parameters**:
            *   `url` (string or regex, required): URL pattern of the network call to validate.
            *   `status` (number, optional): Expected HTTP status code.
            *   `method` (string, optional): Expected HTTP method (e.g., `"GET"`, `"POST"`).
            *   `responseBody` (string or regex, optional): Expected content or pattern in the response body.
            *   `requestBody` (string or regex, optional): Expected content or pattern in the request body (for POST/PUT).
        *   **Example**:
            ```json
            "validateLoginApiCall": {
              "action": "validate_network_call",
              "url": "/api/auth/login",
              "method": "POST",
              "status": 200,
              "responseBody": "{\"success\":true}",
              "next": "end"
            }
            ```

    *   `measure_performance`
        *   **Description**: Measures various page load and rendering performance metrics (e.g., LCP, FCP, DOMContentLoaded). The results are typically logged or can be asserted.
        *   **Parameters**: None specific to the action itself; relies on browser performance APIs.
        *   **Example**:
            ```json
            "measureHomePageLoadTime": {
              "action": "measure_performance",
              "next": "logPerformanceMetrics"
            }
            ```

    *   `capture_network_logs`
        *   **Description**: This is typically an *option* set at the beginning of a test run rather than a step action. It enables the collection of network requests and responses. However, if it were an action, it would toggle capturing on/off or specify filters.
        *   **Parameters (as an option)**:
            *   `patterns` (array of strings/regex, optional): Filters which URLs to capture. Defaults to all if not specified.
            *   `includeData` (boolean, optional): If true, includes response bodies in the logs (can be large).
        *   **Note**: Refer to "Usage > Using the API > Execute a Test > options" for how to enable this globally for a test.

-   **QA-Specific**: Actions tailored for specific quality assurance verification tasks.

    *   `verify_xpath`
        *   **Description**: Verifies if an element identified by an XPath expression exists and is visible on the page. Logs the result (pass/fail) but doesn't halt the test on failure like `assert_element_exists` with XPath might. Useful for checks where you want to record status without immediate failure.
        *   **Parameters**:
            *   `xpath` (string, required): The XPath expression.
        *   **Example**:
            ```json
            "checkOptionalDisclaimerVisibility": {
              "action": "verify_xpath",
              "xpath": "//p[contains(@class, 'disclaimer-text') and not(contains(@style,'display: none'))]",
              "next": "proceedToPayment"
            }
            ```

    *   `verify_redirected_url`
        *   **Description**: Verifies that the browser has redirected to an expected URL after an action (e.g., form submission, link click). This is often used in conjunction with `wait_for_navigation`.
        *   **Parameters**:
            *   `expectedUrl` (string or regex, required): The URL or URL pattern expected after redirection.
        *   **Example**:
            ```json
            "submitLoginForm": {
              "action": "click",
              "selector": "#loginSubmit",
              "next": "waitForRedirect"
            },
            "waitForRedirect": {
              "action": "wait_for_navigation",
              "next": "checkDashboardUrl"
            },
            "checkDashboardUrl": {
              "action": "verify_redirected_url",
              "expectedUrl": "https://example.com/dashboard",
              "next": "end"
            }
            ```

-   **Utility**: General-purpose actions for tasks like taking screenshots, managing variables, and logging.

    *   `screenshot`
        *   **Description**: Takes a screenshot of the current page or a specific element.
        *   **Parameters**:
            *   `path` (string, optional): The file path (including filename, e.g., `"./screenshots/homepage.png"`) where the screenshot will be saved. Defaults to a path within the `SCREENSHOTS_DIR` environment variable if not set.
            *   `fullPage` (boolean, optional): If `true`, captures the entire scrollable page. Defaults to `false` (viewport only).
            *   `selector` (string, optional): If provided, captures only the element matching this selector.
        *   **Example (full page)**:
            ```json
            "captureHomePage": {
              "action": "screenshot",
              "path": "./output/home_page_final.png",
              "fullPage": true,
              "next": "end"
            }
            ```
        *   **Example (element)**:
            ```json
            "captureLoginForm": {
              "action": "screenshot",
              "selector": "#login-form-container",
              "path": "./output/login_form.png",
              "next": "end"
            }
            ```

    *   `save_value`
        *   **Description**: Saves a literal value (string, number, boolean) to a variable for later use.
        *   **Parameters**:
            *   `value` (any, required): The literal value to save.
            *   `saveAs` (string, required): The name of the variable.
        *   **Example**:
            ```json
            "setTestUsername": {
              "action": "save_value",
              "value": "john.doe.test",
              "saveAs": "currentTestUser",
              "next": "useUsernameInTypeAction"
            }
            ```

    *   `print_log`
        *   **Description**: Prints a message to the console/log output. Supports variable interpolation.
        *   **Parameters**:
            *   `message` (string, required): The message to print. Use `{{variableName}}` to include variable values (e.g., `"Current user: {{username}}"`).
        *   **Example**:
            ```json
            "logCurrentUrl": {
              "action": "print_log",
              "message": "Current page URL is: {{page.url}}", // page.url is an example of a built-in variable
              "next": "end"
            }
            ```

    *   `set_variable` (Often an alias for `save_value` or used for more complex assignments, e.g., from JS evaluation - not detailed here)
        *   **Description**: Sets or updates a variable with a given value. Functionally similar to `save_value` for simple cases.
        *   **Parameters**:
            *   `name` (string, required): The name of the variable.
            *   `value` (any, required): The value to assign to the variable.
        *   **Example**: (Same as `save_value`)

    *   `get_cookie`
        *   **Description**: Retrieves the value of a browser cookie by its name and saves it to a variable.
        *   **Parameters**:
            *   `name` (string, required): The name of the cookie to retrieve.
            *   `saveAs` (string, required): The variable name to store the cookie's value.
        *   **Example**:
            ```json
            "getSessionIdCookie": {
              "action": "get_cookie",
              "name": "session_id",
              "saveAs": "userSessionId",
              "next": "logSessionId"
            }
            ```

    *   `set_cookie`
        *   **Description**: Sets a browser cookie with a specified name and value. Can also set other cookie attributes like `url`, `domain`, `path`, `expires`, `httpOnly`, `secure`, `sameSite`.
        *   **Parameters**:
            *   `name` (string, required): The name of the cookie.
            *   `value` (string, required): The value of the cookie.
            *   `url` (string, optional): The URL to associate with the cookie. If not provided, it's set for the current page's domain/path.
            *   `domain` (string, optional): The cookie domain.
            *   `path` (string, optional): The cookie path.
            *   `expires` (number, optional): Expiry date in seconds since UNIX epoch.
            *   `httpOnly` (boolean, optional): HTTPOnly flag.
            *   `secure` (boolean, optional): Secure flag.
            *   `sameSite` (string, optional): SameSite attribute (`'Strict'`, `'Lax'`, `'None'`).
        *   **Example**:
            ```json
            "setTrackingPreferenceCookie": {
              "action": "set_cookie",
              "name": "tracking_preference",
              "value": "false",
              "url": "https://example.com",
              "expires": 1735689600, // Example future timestamp
              "next": "reloadPageWithNewCookie"
            }
            ```

### Advanced Features

-   **Variable System**: Enables dynamic test data. Use `{{variable_name}}` syntax within action parameters to inject values saved from previous steps (e.g., `saveAs` action) or set via `set_variable`.
-   **Loops**: Define iterative test scenarios, such as repeating actions for multiple data sets or elements.
-   **Retry Logic**: Automatically re-executes flaky steps a specified number of times to improve test reliability.
-   **Parallel Tests**: Execute multiple test flows concurrently to reduce overall test execution time.
-   **Reporting**: Generates detailed JSON and HTML reports of test runs, including step-by-step results, errors, and links to screenshots and videos.
-   **XPath Support**: Provides robust element selection and verification capabilities using XPath expressions, including checks for element visibility.
-   **Network Monitoring**: Allows capturing, analyzing, and validating network traffic during test execution, including specific requests and responses.
-   **URL Redirection**: Specifically designed to verify that URL redirections occur as expected after user interactions like clicking links or submitting forms.
-   **Media Recording**: Records full-page screenshots, videos of the entire test execution, and HAR (HTTP Archive) files for detailed network analysis.
-   **Test Tracking**: Each test execution is assigned a unique ID, allowing for easy tracking and retrieval of results.

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

The No-CodeQA platform provides a comprehensive RESTful API for executing tests and retrieving results.

#### Execute a Test

To execute a test flow, send a `POST` request to the `/api/v1/execute` endpoint with the test `flow` JSON and `options`.

**Endpoint**: `POST /api/v1/execute`

**Request Body Example**:

```javascript
const axios = require('axios');

async function executeTest() {
  const response = await axios.post('http://localhost:3000/api/v1/execute', {
    flow: {
      test_name: "Advanced Example Test",
      start: "openHomePage",
      steps: {
        "openHomePage": {
          "action": "open_url",
          "url": "https://www.example.com",
          "next": "getElementCount"
        },
        "getElementCount": {
          "action": "get_element_count",
          "selector": "h1",
          "saveAs": "h1_count",
          "next": "printCount"
        },
        "printCount": {
          "action": "print_log",
          "message": "Number of H1 elements: {{h1_count}}",
          "next": "takeScreenshot"
        },
        "takeScreenshot": {
          "action": "screenshot",
          "path": "./screenshots/example_page.png",
          "fullPage": true,
          "next": "end"
        }
      }
    },
    options: {
      headless: true,          // Run browser in headless mode (no UI)
      browser: 'chromium',     // Specify browser: 'chromium', 'firefox', or 'webkit'
      retries: 0,              // Number of times to retry failed steps
      saveScreenshots: true,   // Save screenshots on test failure or when `screenshot` action is used
      timeout: 30000,          // Maximum time (ms) for each step to complete
      captureNetworkLogs: {    // Capture network requests
        patterns: [".*"],      // Array of URL patterns to capture (e.g., ["example.com", ".*api/data.*"]), ".*" for all
        includeData: false     // Include response bodies in logs
      },
      recordHar: true,         // Record HAR (HTTP Archive) file of network activity
      recordVideo: true        // Record video of the test execution
    }
  });
  
  return response.data; // Returns { testId: "..." }
}
```

#### Get Test Results

After executing a test, you can retrieve its results by sending a `GET` request to the `/api/v1/results/:testId` endpoint. You might need to poll this endpoint if the test is long-running.

**Endpoint**: `GET /api/v1/results/:testId`

**Example**:

```javascript
const axios = require('axios');

async function getTestResult(testId) {
  let result = null;
  while (!result || result.status === 'running') {
    const response = await axios.get(`http://localhost:3000/api/v1/results/${testId}`);
    result = response.data;
    if (result.status === 'running') {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before polling again
    }
  }
  console.log('Test Result:', result);
  return result;
}

// Example usage:
// const testId = await executeTest();
// getTestResult(testId.testId);
```

### Using the CLI

You can also run tests directly from the command-line interface, providing the path to your JSON test flow file and optional parameters.

```bash
node src/cli.js examples/login-test.json --headless=true --browser=chromium --saveScreenshots=true
```

## Test Flow Structure

A test flow is defined as a JSON object with the following top-level properties:

```json
{
  "test_name": "Your Test Name", // A descriptive name for the test
  "start": "firstStepName",    // The name of the first step to execute
  "steps": {                   // An object containing all defined steps
    "firstStepName": {         // Each key is a unique step name
      "action": "open_url",
      "url": "https://example.com",
      "next": "secondStepName" // The name of the next step to execute, or "end" to finish
    },
    "secondStepName": {
      "action": "click",
      "selector": ".button",
      "next": "end"
    }
    // ... more steps
  }
}
```

Each step object must contain an `action` property, which specifies the type of operation to perform, and typically a `next` property to define the subsequent step. The `next` property can point to another step name or `"end"` to signify the completion of the test flow.

## Advanced Examples

Explore the `examples` directory for practical demonstrations of various features:

-   <mcfile name="advanced-test.json" path="/Users/vaibhav/Desktop/No-CodeQA/examples/advanced-test.json"></mcfile>: Demonstrates variable usage, conditional logic (`if_equals`, `if_element_exists`), `get_element_count`, `print_log`, and `screenshot`.
-   <mcfile name="cnbctv18-test.json" path="/Users/vaibhav/Desktop/No-CodeQA/examples/cnbctv18-test.json"></mcfile>: Shows complex navigation, network log capture, `verify_xpath`, `get_element_count`, `verify_redirected_url`, and `validate_network_call`.
-   <mcfile name="login-test.json" path="/Users/vaibhav/Desktop/No-CodeQA/examples/login-test.json"></mcfile>: A simple login scenario using `open_url`, `type`, `click`, and `assert_url`.
-   <mcfile name="qa-specific-test.json" path="/Users/vaibhav/Desktop/No-CodeQA/examples/qa-specific-test.json"></mcfile>: Highlights QA-specific features like detailed network log capture, `verify_xpath`, `assert_text` with XPath, `get_element_count`, `validate_network_call`, and full-page screenshots.
-   <mcfile name="api-usage.js" path="/Users/vaibhav/Desktop/No-CodeQA/examples/api-usage.js"></mcfile> and <mcfile name="qa-features-api-usage.js" path="/Users/vaibhav/Desktop/No-CodeQA/examples/qa-features-api-usage.js"></mcfile>: Node.js examples demonstrating how to programmatically interact with the No-CodeQA API to execute tests and retrieve results, including various `options`.
-   <mcfile name="cnbctv18-curl-example.sh" path="/Users/vaibhav/Desktop/No-CodeQA/examples/cnbctv18-curl-example.sh"></mcfile>: Bash script demonstrating API interaction using `curl` commands for test execution and result retrieval, including options for HAR and video recording.

## License

MIT