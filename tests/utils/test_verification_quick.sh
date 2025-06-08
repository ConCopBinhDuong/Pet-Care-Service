#!/bin/bash

# Quick test script to validate the new verification system implementation

echo "🧪 Testing New In-Memory Verification System"
echo "============================================="

# Check if server is running
echo "1. Testing server startup..."
cd /Users/thanh_X.X/Documents/Pet_care_service_backend

# Start server in background
node --experimental-sqlite ./src/server.js &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test if server responds
if curl -s http://localhost:8383/api/auth/verification-status > /dev/null; then
    echo "   ❌ Server should require authentication for this endpoint"
else
    echo "   ✅ Server started and auth middleware working"
fi

# Test basic registration endpoint
echo "2. Testing registration endpoint..."
RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:8383/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_user",
    "email": "test@example.com", 
    "password": "TestPass123",
    "gender": "Male",
    "role": "Pet owner",
    "phone": "+84901234567",
    "city": "Test City",
    "address": "Test Address"
  }')

HTTP_CODE="${RESPONSE: -3}"
if [ "$HTTP_CODE" = "201" ]; then
    echo "   ✅ Registration endpoint working"
else
    echo "   ❌ Registration failed with code: $HTTP_CODE"
fi

# Test login endpoint
echo "3. Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:8383/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "TestPass123"
  }')

LOGIN_HTTP_CODE="${LOGIN_RESPONSE: -3}"
if [ "$LOGIN_HTTP_CODE" = "200" ]; then
    echo "   ✅ Login endpoint working"
else
    echo "   ❌ Login failed with code: $LOGIN_HTTP_CODE"
fi

# Test verification service directly
echo "4. Testing verification service..."
if node ./tests/verification/test_verification_system.js; then
    echo "   ✅ Verification service test completed"
else
    echo "   ❌ Verification service test failed"
fi

# Cleanup
echo "5. Cleaning up..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo ""
echo "🏁 Basic verification system tests completed!"
echo "============================================="
echo ""
echo "📝 Next steps:"
echo "   1. Start the server: npm run dev"
echo "   2. Check console for verification codes"
echo "   3. Use tests/rest/test_verification.rest for comprehensive testing"
echo "   4. Codes expire in 1 minute for security"
echo ""
