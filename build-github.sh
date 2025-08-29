#!/bin/bash
# Build script for GitHub Pages deployment

echo "Building for GitHub Pages..."

# Use the GitHub-specific Vite config
npx vite build --config vite.config.github.ts

# Rename the HTML file to index.html for GitHub Pages
cd docs && mv index.github.html index.html 2>/dev/null || true
cd ..

echo "GitHub Pages build complete! Check the 'docs' folder."