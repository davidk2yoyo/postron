#!/bin/bash

# Create a simple test image file
echo "Creating test image..."
curl -s "https://via.placeholder.com/100x100.png" -o test-logo.png

echo "Checking if file was created..."
ls -la test-logo.png

echo "Testing logo upload..."
curl -X POST http://localhost:3001/api/logos \
  -F "name=Test Logo" \
  -F "file=@test-logo.png"

echo ""
echo "Cleaning up..."
rm -f test-logo.png