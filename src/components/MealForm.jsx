import React, { useState } from 'react';
import { analyzeNutrition } from '../services/aiService';

const MealForm = ({ onSubmit }) => {
  const [mealInput, setMealInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!mealInput.trim()) {
      setError('Please enter a meal description');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const nutritionData = await analyzeNutrition(mealInput.trim());
      
      const mealData = {
        description: mealInput.trim(),
        nutritionData: nutritionData
      };
      
      onSubmit(mealData);
      setMealInput(''); // Clear the form
    } catch (err) {
      setError('Failed to analyze meal. Please try again.');
      console.error('Error analyzing meal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Add a Meal</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="meal-input" className="block text-sm font-medium text-gray-700 mb-2">
            Describe your meal
          </label>
          <textarea
            id="meal-input"
            value={mealInput}
            onChange={(e) => setMealInput(e.target.value)}
            placeholder="e.g., 2 eggs, 1 cup rice, 100g chicken breast"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows="3"
            disabled={isLoading}
          />
        </div>
        
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        
        <button
          type="submit"
          disabled={isLoading || !mealInput.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze Meal'
          )}
        </button>
      </form>
      
      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Tip:</strong> Be specific about quantities and cooking methods for better accuracy.</p>
        <p><strong>Example:</strong> "2 scrambled eggs, 1 cup cooked white rice, 150g grilled chicken breast"</p>
      </div>
    </div>
  );
};

export default MealForm;
