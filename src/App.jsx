import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { createUserProfile } from './services/firestore';
import AuthPage from './components/AuthPage';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      // Ensure user profile exists for existing users
      if (currentUser) {
        try {
          await createUserProfile(currentUser.uid, {
            email: currentUser.email,
            displayName: currentUser.displayName || '',
            goals: {
              calories: 2000,
              protein: 100,
              carbs: 250,
              fats: 70
            },
            personalInfo: {
              age: '',
              weight: '',
              height: '',
              activityLevel: 'moderate',
              goal: 'maintain'
            }
          });
        } catch (error) {
          console.log('User profile already exists or error creating:', error);
        }
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/settings"
            element={user ? <Settings user={user} /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/"
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
