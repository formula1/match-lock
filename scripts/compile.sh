#!/bin/bash

SCRIPT_PATH=$(dirname "$0")
cd "$SCRIPT_PATH/.."
echo "Compiling Match Lock..."

packages=(
  "shared"
  "config-editor"
  "relay-server"
  "match-agent"
)

set -e
for package in "${packages[@]}"; do
  echo ":: Installing $package"
  cd "core/$package" && npm install && cd ../..
done
