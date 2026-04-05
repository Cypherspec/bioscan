#!/bin/bash

# ============================================================
#  BioScan → GitHub Setup Script
#  Run this once from inside the bioscan/ folder
# ============================================================

set -e

echo ""
echo "🌿 BioScan GitHub Setup"
echo "========================"
echo ""

# --- Get GitHub info ---
read -p "Enter your GitHub username: " GITHUB_USER
read -p "Enter the repo name (e.g. bioscan): " REPO_NAME

echo ""
echo "📦 Initializing git..."
git init
git add .
git commit -m "🌿 Initial commit — BioScan AI Plant Disease Detector"

echo ""
echo "🔗 Linking to GitHub..."
git branch -M main
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

echo ""
echo "✅ Done! Your project is live at:"
echo "   https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "⚠️  Remember to add your Anthropic API key as an environment"
echo "   variable when deploying (never commit your .env file)."
echo ""
