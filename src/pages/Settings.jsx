import React, { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../services/firestore';

const Settings = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  // ...existing code...
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Profile data
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email] = useState(user?.email || '');

  // Nutrition goals
  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 100,
    carbs: 250,
    fats: 70
  });

  // Personal info
  const [personalInfo, setPersonalInfo] = useState({
    age: '',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    goal: 'maintain' // maintain, lose, gain
  });

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError('');
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile(user.uid);
        if (profile) {
          setGoals(profile.goals || goals);
          setPersonalInfo(profile.personalInfo || personalInfo);
          if (profile.displayName) setDisplayName(profile.displayName);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.uid) {
      loadUserProfile();
    }
  }, [user?.uid]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Update Firebase Auth display name
      if (displayName !== user.displayName) {
        await updateProfile(user, {
          displayName: displayName
        });
      }

      // Update user profile in Firestore
      await updateUserProfile(user.uid, {
        displayName,
        goals,
        personalInfo,
        updatedAt: new Date().toISOString()
      });

      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const calculateRecommendedGoals = () => {
    const { age, weight, height, activityLevel, goal } = personalInfo;
    
    if (!age || !weight || !height) {
      setError('Please fill in age, weight, and height to get recommendations');
      return;
    }

    // Basic BMR calculation (Mifflin-St Jeor Equation)
    // For males: BMR = 10 × weight + 6.25 × height - 5 × age + 5
    // For females: BMR = 10 × weight + 6.25 × height - 5 × age - 161
    // Using male formula as default (can be enhanced later)
    const bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseFloat(age) + 5;
    
    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9
    };

    const tdee = bmr * activityMultipliers[activityLevel];
    
    // Goal adjustments
    let targetCalories = tdee;
    if (goal === 'lose') targetCalories = tdee - 500; // 1lb per week deficit
    if (goal === 'gain') targetCalories = tdee + 500; // 1lb per week surplus

    // Macro calculations (typical ratios)
    const protein = Math.round((targetCalories * 0.25) / 4); // 25% protein (4 cal/g)
    const carbs = Math.round((targetCalories * 0.45) / 4);   // 45% carbs (4 cal/g)
    const fats = Math.round((targetCalories * 0.30) / 9);    // 30% fats (9 cal/g)

    setGoals({
      calories: Math.round(targetCalories),
      protein,
      carbs,
      fats
    });

    setSuccessMessage('Recommended goals calculated! Review and save if they look good.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your profile and nutrition goals</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {(error || successMessage) && (
          <div className={`rounded-md p-4 mb-6 ${
            error ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {error ? (
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  error ? 'text-red-800' : 'text-green-800'
                }`}>
                  {error || successMessage}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={() => { setError(''); setSuccessMessage(''); }}
                    className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      error 
                        ? 'text-red-500 hover:bg-red-100 focus:ring-red-600' 
                        : 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                    }`}
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                  Display Name
                </label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
              <button
                type="button"
                onClick={calculateRecommendedGoals}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                📊 Calculate Recommended Goals
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  value={personalInfo.age}
                  onChange={(e) => setPersonalInfo({...personalInfo, age: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="25"
                />
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  value={personalInfo.weight}
                  onChange={(e) => setPersonalInfo({...personalInfo, weight: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="70"
                />
              </div>
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                  Height (cm)
                </label>
                <input
                  type="number"
                  id="height"
                  value={personalInfo.height}
                  onChange={(e) => setPersonalInfo({...personalInfo, height: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="175"
                />
              </div>
              <div>
                <label htmlFor="activityLevel" className="block text-sm font-medium text-gray-700">
                  Activity Level
                </label>
                <select
                  id="activityLevel"
                  value={personalInfo.activityLevel}
                  onChange={(e) => setPersonalInfo({...personalInfo, activityLevel: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="sedentary">Sedentary (office job)</option>
                  <option value="light">Light (light exercise 1-3 days/week)</option>
                  <option value="moderate">Moderate (moderate exercise 3-5 days/week)</option>
                  <option value="active">Active (hard exercise 6-7 days/week)</option>
                  <option value="veryActive">Very Active (physical job + exercise)</option>
                </select>
              </div>
              <div>
                <label htmlFor="goal" className="block text-sm font-medium text-gray-700">
                  Goal
                </label>
                <select
                  id="goal"
                  value={personalInfo.goal}
                  onChange={(e) => setPersonalInfo({...personalInfo, goal: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="lose">Lose Weight</option>
                  <option value="maintain">Maintain Weight</option>
                  <option value="gain">Gain Weight</option>
                </select>
              </div>
            </div>
          </div>

          {/* Nutrition Goals */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Daily Nutrition Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label htmlFor="calories" className="block text-sm font-medium text-gray-700">
                  Calories
                </label>
                <input
                  type="number"
                  id="calories"
                  value={goals.calories}
                  onChange={(e) => setGoals({...goals, calories: parseInt(e.target.value) || 0})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2000"
                />
              </div>
              <div>
                <label htmlFor="protein" className="block text-sm font-medium text-gray-700">
                  Protein (g)
                </label>
                <input
                  type="number"
                  id="protein"
                  value={goals.protein}
                  onChange={(e) => setGoals({...goals, protein: parseInt(e.target.value) || 0})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                />
              </div>
              <div>
                <label htmlFor="carbs" className="block text-sm font-medium text-gray-700">
                  Carbohydrates (g)
                </label>
                <input
                  type="number"
                  id="carbs"
                  value={goals.carbs}
                  onChange={(e) => setGoals({...goals, carbs: parseInt(e.target.value) || 0})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="250"
                />
              </div>
              <div>
                <label htmlFor="fats" className="block text-sm font-medium text-gray-700">
                  Fats (g)
                </label>
                <input
                  type="number"
                  id="fats"
                  value={goals.fats}
                  onChange={(e) => setGoals({...goals, fats: parseInt(e.target.value) || 0})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="70"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
