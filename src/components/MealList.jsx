import React from 'react';

const MealList = ({ meals }) => {
  if (meals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Today's Meals</h2>
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p>No meals logged yet today.</p>
          <p className="text-sm">Add your first meal using the form above!</p>
        </div>
      </div>
    );
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Today's Meals</h2>
      
      <div className="space-y-4">
        {meals.map((meal) => (
          <div key={meal.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Meal header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-medium text-gray-800">{meal.description}</h3>
                <p className="text-sm text-gray-500">{formatTime(meal.timestamp)}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-blue-600">
                  {meal.nutritionData?.totalCalories || 0} cal
                </div>
              </div>
            </div>
            
            {/* Nutrition breakdown */}
            {meal.nutritionData && meal.nutritionData.items && (
              <div className="space-y-3">
                {/* Items */}
                <div className="grid gap-2">
                  {meal.nutritionData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-gray-50 rounded p-2">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex space-x-4 text-gray-600">
                        <span>{item.calories} cal</span>
                        <span>P: {item.protein}g</span>
                        <span>C: {item.carbs}g</span>
                        <span>F: {item.fats}g</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Totals */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm font-medium">
                  <span>Total:</span>
                  <div className="flex space-x-4">
                    <span className="text-blue-600">{meal.nutritionData.totalCalories} cal</span>
                    <span className="text-green-600">P: {meal.nutritionData.totalProtein}g</span>
                    <span className="text-yellow-600">C: {meal.nutritionData.totalCarbs}g</span>
                    <span className="text-purple-600">F: {meal.nutritionData.totalFats}g</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealList;
