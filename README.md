# 🍽️ AI Meal Tracker

A modern React web application that helps users track their meals and get AI-powered nutrition insights using Google Gemini AI.

## ✨ Features

- 🔐 **Firebase Authentication** - Secure user login/signup
- 🤖 **AI Nutrition Analysis** - Powered by Google Gemini API
- 📊 **Daily Dashboard** - Track calories, protein, carbs, and fats
- ✏️ **Meal Management** - Add, edit, and delete meals
- 🎯 **Goal Tracking** - Visual progress bars for daily nutrition goals
- 📱 **Responsive Design** - Works on desktop and mobile
- 💾 **Data Export** - Export your meal data as JSON
- 🚀 **Real-time Updates** - Instant meal analysis and storage

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Firebase (Auth + Firestore)
- **AI**: Google Gemini API
- **Routing**: React Router
- **Styling**: Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ai-meal-tracker.git
   cd ai-meal-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your API keys:
   ```properties
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Get your API keys**
   
   **Google Gemini API:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy and paste into `.env`
   
   **OpenAI API (optional backup):**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy and paste into `.env`

5. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Copy your Firebase config to `src/firebase.js`

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Create an account or sign in
   - Start tracking your meals!
- **User Profile**: Automatic user profile creation in Firestore

### Meal Tracking
- **Add Meals**: Describe meals in natural language (e.g., "2 eggs, 1 cup rice, 100g chicken")
- **AI Analysis**: Mock AI service estimates calories, protein, carbs, and fats for each item
- **Daily Dashboard**: View total calories/macros for today
- **Meal History**: Browse all meals with detailed nutritional breakdown
- **Real-time Updates**: Meals are stored in Firestore and sync in real-time

### UI/UX
- **Responsive Design**: Clean, modern interface with Tailwind CSS
- **Loading States**: Proper loading and error handling throughout the app
- **Route Protection**: Automatic redirects between login and dashboard based on auth state

## Firebase Setup

1. **Create a Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password provider)
   - Create a Firestore database

2. **Get Firebase Config**:
   - Go to Project Settings > General
   - Add a web app and copy the config object
   - Replace the placeholder config in `src/firebase.js`

3. **Firestore Security Rules** (optional for development):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         match /meals/{mealId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```

## Getting Started

1. **Install dependencies**:
   ```sh
   npm install
   ```

2. **Configure Firebase**:
   - Update `src/firebase.js` with your Firebase config

3. **Start the development server**:
   ```sh
   npm run dev
   ```

4. **Test the app**:
   - Navigate to `/login` (or app will redirect you)
   - Create an account (use `123456` for OTP verification)
   - Add meals and track your nutrition!

## Project Structure
```
src/
├── components/
│   ├── AuthPage.jsx          # Login/Signup with tabs
│   ├── Dashboard.jsx         # Original dashboard (kept for reference)
│   ├── MealForm.jsx          # Original meal form (kept for reference)
│   └── MealList.jsx          # Original meal list (kept for reference)
├── pages/
│   └── Dashboard.jsx         # Main dashboard with meal tracking
├── services/
│   ├── aiService.js          # Mock AI nutrition analysis
│   └── firestore.js          # Firestore database operations
├── utils/
│   └── utils.js              # Utility functions for calculations
├── firebase.js               # Firebase configuration
├── App.jsx                   # Main app with routing and auth
└── main.jsx                  # React entry point
```

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Routing**: React Router v6
- **Styling**: Tailwind CSS

## Development Notes
- The AI analysis is currently mocked - replace `mockAnalyzeMeal()` in `Dashboard.jsx` with real AI API calls
- OTP verification is simulated - integrate with Firebase Email Link for production
- Add proper error handling and validation as needed
- Consider adding meal editing/deletion functionality

---

This project demonstrates a complete Firebase integration with authentication, real-time database, and modern React patterns.
