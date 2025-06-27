#!/bin/bash

echo "=== Testing JWT Authentication Fix ==="
echo "Using token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQsImVtYWlsIjoidGhhbmhuaGFuMTY2MjAwNEBnbWFpbC5jb20iLCJyb2xlIjoiUGV0IG93bmVyIiwianRpIjoiZTM0OTk5YmItNWMzYy00ZjJlLTg5MTMtYTg5YjcwZmU0MGY5IiwiaWF0IjoxNzUxMDA4MDAxLCJleHAiOjE3NTEwOTQ0MDF9.MNoMuYQ6SdAXaf4ozuFKthegsYqhRRu6BXUWMvcYX8M"

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjQsImVtYWlsIjoidGhhbmhuaGFuMTY2MjAwNEBnbWFpbC5jb20iLCJyb2xlIjoiUGV0IG93bmVyIiwianRpIjoiZTM0OTk5YmItNWMzYy00ZjJlLTg5MTMtYTg5YjcwZmU0MGY5IiwiaWF0IjoxNzUxMDA4MDAxLCJleHAiOjE3NTEwOTQ0MDF9.MNoMuYQ6SdAXaf4ozuFKthegsYqhRRu6BXUWMvcYX8M"

echo ""
echo "1. Testing notifications/stats endpoint:"
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     https://pet-care-service-backend-hzc6.onrender.com/api/notifications/stats

echo ""
echo ""
echo "2. Testing schedule/dashboard endpoint:"
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     https://pet-care-service-backend-hzc6.onrender.com/api/schedule/dashboard

echo ""
echo ""
echo "3. Testing a simple profile endpoint:"
curl -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     https://pet-care-service-backend-hzc6.onrender.com/api/profile

echo ""
echo "=== Test Complete ==="
