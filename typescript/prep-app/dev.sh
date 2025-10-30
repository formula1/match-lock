#!/bin/bash

# Clear all snap-related environment variables
for var in $(env | grep -E '^SNAP' | cut -d= -f1); do
    unset "$var"
done

# Set clean PATH without snap directories
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/home/sam/.cargo/bin"

# Set clean library path
export LD_LIBRARY_PATH="/usr/lib/x86_64-linux-gnu:/lib/x86_64-linux-gnu:/usr/lib:/lib"

# Clear other potentially problematic variables
unset LD_PRELOAD
unset LIBRARY_PATH

echo "🚀 Starting MatchLock Prep App Development Environment"
echo "📦 Cleaned environment variables"
echo "🔧 Using PATH: $PATH"
echo "📚 Using LD_LIBRARY_PATH: $LD_LIBRARY_PATH"

# Start Vite dev server in background
echo "🌐 Starting Vite dev server..."
npm run dev:vite &
VITE_PID=$!

# Wait for Vite to start
echo "⏳ Waiting for Vite to start..."
sleep 4

# Check if Vite is running
if ! curl -s http://localhost:5173 > /dev/null; then
    echo "❌ Vite dev server failed to start"
    kill $VITE_PID 2>/dev/null
    exit 1
fi

echo "✅ Vite dev server is running at http://localhost:5173"

# Start Tauri app in dev mode (bypass beforeDevCommand)
echo "🦀 Starting Tauri app..."
cd src-tauri || exit 1
TAURI_DEV_SERVER_URL="http://localhost:5173" cargo run

# Clean up Vite when Tauri exits
echo "🧹 Cleaning up..."
kill $VITE_PID 2>/dev/null
