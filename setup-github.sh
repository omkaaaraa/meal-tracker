#!/bin/bash

# Commands to run after creating GitHub repository
# Replace 'yourusername' with your actual GitHub username

echo "🚀 Setting up GitHub remote..."
git remote add origin https://github.com/yourusername/ai-meal-tracker.git

echo "📤 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo "✅ Repository pushed to GitHub!"
echo "🔗 Visit: https://github.com/yourusername/ai-meal-tracker"
