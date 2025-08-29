#!/bin/bash
# Build script for GitHub Pages deployment

echo "Building for GitHub Pages..."

# Use the GitHub-specific Vite config
npx vite build --config vite.config.github.ts

echo "GitHub Pages build complete! Check the 'docs' folder."