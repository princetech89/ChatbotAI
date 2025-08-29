# GitHub Pages Deployment Guide

## Quick Setup Instructions

### 1. Create GitHub Repository
1. Go to GitHub.com and create a new repository
2. Name it something like `ai-chatbot` or `prince-chourasiya-chatbot`
3. Make it public (required for GitHub Pages)
4. Don't initialize with README (we'll push existing code)

### 2. Update Configuration
1. Edit `vite.config.github.ts` and replace `your-repo-name` with your actual repository name
2. Edit `client/index.github.html` and update the URLs to match your username and repo

### 3. Push Your Code
```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: AI Chatbot for GitHub Pages"

# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### 4. Enable GitHub Pages
1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" section
4. Under "Source", select "GitHub Actions"
5. The workflow will automatically deploy your site

### 5. Build Locally (Optional)
```bash
# Make build script executable
chmod +x build-github.sh

# Run build
./build-github.sh

# The static site will be in the 'docs' folder
```

## What Gets Deployed
- Beautiful animated landing page with your branding
- Showcase of all features (non-functional for demo)
- Professional portfolio piece
- Fully responsive design
- All your custom animations and styling

## Important Notes
- This creates a STATIC version for portfolio/demo purposes
- The chat functionality won't work (GitHub Pages doesn't support backends)
- For full functionality, use the Replit deployment instead
- The GitHub Pages version is perfect for showcasing your skills

## Customization
- Update the Replit URL in `client/src/pages/static-landing.tsx`
- Modify colors and styling as needed
- Add your own domain in GitHub Pages settings (optional)

Your site will be available at: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`