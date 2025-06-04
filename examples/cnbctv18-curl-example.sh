#!/bin/bash

# Execute the CNBCTV18 test with QA-specific options

# First, load the test flow from the JSON file
TEST_FLOW=$(cat /Users/vaibhav/Desktop/No-CodeQA/examples/cnbctv18-test.json)

# Then execute the test with the flow in the request body
curl -X POST http://localhost:3000/api/v1/execute \
  -H "Content-Type: application/json" \
  -d "{
  \"flow\": ${TEST_FLOW},
  \"options\": {
    \"browser\": \"chromium\",
    \"headless\": true,
    \"timeout\": 30000,
    \"captureNetworkLogs\": true,
    \"recordHar\": true,
    \"recordVideo\": true
  }
}"

# The response will include a test_id that you can use to check the status
# Example: {"test_id":"12345678-1234-1234-1234-123456789abc"}

# To check the test result (replace TEST_ID with the actual test_id from the response)
# curl http://localhost:3000/api/v1/results/TEST_ID

# To get all test results
# curl http://localhost:3000/api/v1/results

# To delete a test result (replace TEST_ID with the actual test_id)
# curl -X DELETE http://localhost:3000/api/v1/results/TEST_ID