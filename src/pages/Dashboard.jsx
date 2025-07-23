import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { getTodaysMeals, addMeal, deleteMeal, updateMeal, getUserProfile } from '../services/firestore';
import { analyzeNutrition } from '../services/aiService';

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  // ...existing code...
  const [loading, setLoading] = useState(true);
  const [showMealForm, setShowMealForm] = useState(false);
  const [mealDescription, setMealDescription] = useState('');
  const [addingMeal, setAddingMeal] = useState(false);
  const [deletingMealId, setDeletingMealId] = useState(null);
  const [editingMeal, setEditingMeal] = useState(null);
  const [editingDescription, setEditingDescription] = useState('');
  const [updatingMeal, setUpdatingMeal] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [userGoals, setUserGoals] = useState({
    calories: 2000,
    protein: 100,
    carbs: 250,
    fats: 70
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

  const loadTodaysMeals = async () => {
    try {
      setLoading(true);
      const todaysMeals = await getTodaysMeals(user.uid);
      console.log('Loaded meals:', todaysMeals); // Debug log
      setMeals(todaysMeals);
      
      // Load user profile and goals
      const userProfile = await getUserProfile(user.uid);
      if (userProfile && userProfile.goals) {
        setUserGoals(userProfile.goals);
      }
    } catch (error) {
      console.error('Error loading meals:', error);
      setError('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodaysMeals();
  }, [user.uid]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!mealDescription.trim()) return;

    setAddingMeal(true);
    setError('');

    try {
      // Use AI service for meal analysis
      const analysisResult = await analyzeNutrition(mealDescription);
      
      const mealData = {
        description: mealDescription,
        items: analysisResult.items,
        totals: {
          calories: analysisResult.totalCalories,
          protein: analysisResult.totalProtein,
          carbs: analysisResult.totalCarbs,
          fats: analysisResult.totalFats
        }
      };

      await addMeal(user.uid, mealData);
      await loadTodaysMeals(); // Refresh the meals list
      
      setMealDescription('');
      setShowMealForm(false);
      setSuccessMessage('Meal added successfully!');
    } catch (error) {
      console.error('Error adding meal:', error);
      setError('Failed to add meal: ' + error.message);
    } finally {
      setAddingMeal(false);
    }
  };

  const handleEditMeal = async (e) => {
    e.preventDefault();
    if (!editingDescription.trim() || !editingMeal) return;

    setUpdatingMeal(true);
    setError('');

    try {
      // Use AI service for meal analysis
      const analysisResult = await analyzeNutrition(editingDescription);
      
      const updatedMealData = {
        description: editingDescription,
        items: analysisResult.items,
        totals: {
          calories: analysisResult.totalCalories,
          protein: analysisResult.totalProtein,
          carbs: analysisResult.totalCarbs,
          fats: analysisResult.totalFats
        }
      };

      await updateMeal(user.uid, editingMeal.id, updatedMealData);
      await loadTodaysMeals(); // Refresh the meals list
      
      setEditingMeal(null);
      setEditingDescription('');
      setSuccessMessage('Meal updated successfully!');
    } catch (error) {
      console.error('Error updating meal:', error);
      setError('Failed to update meal: ' + error.message);
    } finally {
      setUpdatingMeal(false);
    }
  };

  const startEditingMeal = (meal) => {
    setEditingMeal(meal);
    setEditingDescription(meal.description);
    setShowMealForm(false); // Close add form if open
  };

  const cancelEditing = () => {
    setEditingMeal(null);
    setEditingDescription('');
  };

  const handleDeleteMeal = async (mealId) => {
    if (!window.confirm('Are you sure you want to delete this meal?')) {
      return;
    }

    setDeletingMealId(mealId);
    setError('');

    try {
      await deleteMeal(user.uid, mealId);
      await loadTodaysMeals(); // Refresh the meals list
      setSuccessMessage('Meal deleted successfully!');
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError('Failed to delete meal: ' + error.message);
    } finally {
      setDeletingMealId(null);
    }
  };

  const calculateDayTotals = () => {
    return meals.reduce(
      (totals, meal) => {
        // Handle different possible data structures
        const mealTotals = meal.totals || {
          calories: meal.totalCalories || 0,
          protein: meal.totalProtein || 0,
          carbs: meal.totalCarbs || 0,
          fats: meal.totalFats || 0
        };
        
        return {
          calories: totals.calories + (mealTotals.calories || 0),
          protein: totals.protein + (mealTotals.protein || 0),
          carbs: totals.carbs + (mealTotals.carbs || 0),
          fats: totals.fats + (mealTotals.fats || 0)
        };
      },
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );
  };

  const dayTotals = calculateDayTotals();
  
  // Debug log
  console.log('Current meals:', meals);
  console.log('Day totals:', dayTotals);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Meal Tracker</h1>
              <p className="text-gray-600">Welcome back, {user.displayName || user.email}!</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/settings')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ⚙️ Settings
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Daily Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Today's Summary</h2>
            <button
              onClick={() => {
                const data = {
                  date: new Date().toDateString(),
                  totals: dayTotals,
                  meals: meals.map(meal => ({
                    time: meal.timestamp,
                    description: meal.description,
                    totals: meal.totals || {
                      calories: meal.totalCalories || 0,
                      protein: meal.totalProtein || 0,
                      carbs: meal.totalCarbs || 0,
                      fats: meal.totalFats || 0
                    }
                  }))
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `meals-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                setSuccessMessage('Meal data exported successfully!');
              }}
              className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
            >
              📊 Export Data
            </button>
            <button
              onClick={async () => {
                console.log('🧪 Testing AI nutrition analysis...');
                try {
                  const testMeal = "2 scrambled eggs with toast";
                  const result = await analyzeNutrition(testMeal);
                  console.log('🧪 Test result:', result);
                  setSuccessMessage(`Test successful! Check console for details. Calories: ${result.totalCalories}`);
                } catch (error) {
                  console.error('🧪 Test failed:', error);
                  setError(`Test failed: ${error.message}`);
                }
              }}
              className="px-3 py-1 text-sm text-green-600 border border-green-600 rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              🧪 Test AI
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{Math.round(dayTotals.calories)}</p>
              <p className="text-sm text-gray-600">Calories</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{width: `${Math.min((dayTotals.calories / userGoals.calories) * 100, 100)}%`}}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Goal: {userGoals.calories}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{Math.round(dayTotals.protein)}g</p>
              <p className="text-sm text-gray-600">Protein</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{width: `${Math.min((dayTotals.protein / userGoals.protein) * 100, 100)}%`}}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Goal: {userGoals.protein}g</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{Math.round(dayTotals.carbs)}g</p>
              <p className="text-sm text-gray-600">Carbs</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{width: `${Math.min((dayTotals.carbs / userGoals.carbs) * 100, 100)}%`}}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Goal: {userGoals.carbs}g</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{Math.round(dayTotals.fats)}g</p>
              <p className="text-sm text-gray-600">Fats</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{width: `${Math.min((dayTotals.fats / userGoals.fats) * 100, 100)}%`}}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Goal: {userGoals.fats}g</p>
            </div>
          </div>
        </div>

        {/* Add Meal Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Add Meal</h2>
            {!showMealForm && (
              <button
                onClick={() => setShowMealForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add New Meal
              </button>
            )}
          </div>

          {showMealForm && (
            <form onSubmit={handleAddMeal} className="space-y-4">
              <div>
                <label htmlFor="meal-description" className="block text-sm font-medium text-gray-700">
                  Describe your meal
                </label>
                <textarea
                  id="meal-description"
                  rows={3}
                  value={mealDescription}
                  onChange={(e) => setMealDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2 eggs, 1 cup rice, 100g chicken breast"
                  required
                />
              </div>
              
              {/* Quick Add Suggestions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Add Common Meals:
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "2 scrambled eggs with toast",
                    "1 cup oatmeal with banana",
                    "Grilled chicken salad",
                    "Pasta with marinara sauce",
                    "Rice bowl with vegetables",
                    "Greek yogurt with berries",
                    "Sandwich with turkey and cheese",
                    "Smoothie bowl with protein"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setMealDescription(suggestion)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={addingMeal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {addingMeal ? 'Analyzing...' : 'Add Meal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMealForm(false);
                    setMealDescription('');
                    setError('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </form>
          )}
        </div>

        {/* Edit Meal Section */}
        {editingMeal && (
          <div className="bg-yellow-50 rounded-lg shadow p-6 mb-8 border border-yellow-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit Meal</h2>
            <form onSubmit={handleEditMeal} className="space-y-4">
              <div>
                <label htmlFor="edit-meal-description" className="block text-sm font-medium text-gray-700">
                  Update meal description
                </label>
                <textarea
                  id="edit-meal-description"
                  rows={3}
                  value={editingDescription}
                  onChange={(e) => setEditingDescription(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2 eggs, 1 cup rice, 100g chicken breast"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={updatingMeal}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {updatingMeal ? 'Updating...' : 'Update Meal'}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Meals List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Today's Meals</h2>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">Loading meals...</p>
            </div>
          ) : meals.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No meals recorded today. Add your first meal!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {meals.map((meal, index) => (
                <div key={meal.id || index} className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{meal.description}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(meal.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditingMeal(meal)}
                        className="px-3 py-1 text-sm text-green-600 hover:text-green-800 rounded-md transition-colors"
                        title="Edit meal"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        disabled={deletingMealId === meal.id}
                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete meal"
                      >
                        {deletingMealId === meal.id ? 'Deleting...' : '🗑️ Delete'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Meal Items */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {meal.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="bg-gray-50 rounded-md p-3 text-sm">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-gray-600">
                            {item.calories} cal • {item.protein}g protein • {item.carbs}g carbs • {item.fats}g fats
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Meal Totals */}
                  <div className="bg-blue-50 rounded-md p-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Meal Total:</h4>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">
                        {Math.round(meal.totals?.calories || meal.totalCalories || 0)} calories
                      </span> • 
                      <span className="ml-2">
                        {Math.round(meal.totals?.protein || meal.totalProtein || 0)}g protein
                      </span> • 
                      <span className="ml-2">
                        {Math.round(meal.totals?.carbs || meal.totalCarbs || 0)}g carbs
                      </span> • 
                      <span className="ml-2">
                        {Math.round(meal.totals?.fats || meal.totalFats || 0)}g fats
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
