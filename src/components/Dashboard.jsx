import React from 'react';
import { calculateTotals } from '../utils/utils';

const Dashboard = ({ meals }) => {
  const totals = calculateTotals(meals);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Today's Summary</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Calories */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{totals.calories}</div>
          <div className="text-sm opacity-90">Calories</div>
        </div>
        
        {/* Protein */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{totals.protein}g</div>
          <div className="text-sm opacity-90">Protein</div>
        </div>
        
        {/* Carbs */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{totals.carbs}g</div>
          <div className="text-sm opacity-90">Carbs</div>
        </div>
        
        {/* Fats */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4 text-center">
          <div className="text-2xl font-bold">{totals.fats}g</div>
          <div className="text-sm opacity-90">Fats</div>
        </div>
      </div>
      
      {/* Meals count */}
      <div className="mt-4 text-center text-gray-600">
        <span className="text-lg font-medium">{meals.length}</span> meal{meals.length !== 1 ? 's' : ''} logged today
      </div>
    </div>
  );
};

export default Dashboard;
