#!/bin/bash

# Test script for diet endpoints
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJwZXRvd25lcjFAZXhhbXBsZS5jb20iLCJyb2xlIjoiUGV0IG93bmVyIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzMzNjE2Mjk5LCJleHAiOjE3MzM3MDI2OTl9.CjxP-k3rNGgUl4_lUO-L7lEMgLWv4QdW6vYwqPsBr5A"

echo "Testing diet endpoint..."
curl -X GET http://localhost:8383/api/diet \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo -e "\n\nTesting activity endpoint..."
curl -X GET http://localhost:8383/api/activity \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo -e "\n\nTesting schedule endpoint..."
curl -X GET http://localhost:8383/api/schedule \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
