#!/bin/bash

echo "🚀 Starting Pet Care Service Application"
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MySQL is running (optional - you can comment this out if using remote DB)
# if ! pgrep -x "mysqld" > /dev/null; then
#     echo "⚠️  MySQL doesn't appear to be running. Make sure your database is accessible."
# fi

echo "📦 Installing dependencies if needed..."

# Install backend dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Install frontend dependencies
if [ ! -d "public/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd public && npm install && cd ..
fi

echo "✅ Dependencies ready!"
echo ""
echo "🔧 Starting both servers..."
echo "   - Backend: http://localhost:10000"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
npm run dev:both
