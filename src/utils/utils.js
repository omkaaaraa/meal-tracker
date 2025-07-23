// Utility functions for meal tracking

// Get today's date in YYYY-MM-DD format
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Get all meals for today from localStorage
export const getTodaysMeals = () => {
  const today = getTodayDate();
  const allMeals = JSON.parse(localStorage.getItem('meals') || '{}');
  return allMeals[today] || [];
};

// Save a meal to localStorage
export const saveMeal = (mealData) => {
  const today = getTodayDate();
  const allMeals = JSON.parse(localStorage.getItem('meals') || '{}');
  
  if (!allMeals[today]) {
    allMeals[today] = [];
  }
  
  const mealWithId = {
    ...mealData,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    date: today
  };
  
  allMeals[today].push(mealWithId);
  localStorage.setItem('meals', JSON.stringify(allMeals));
  
  return mealWithId;
};

// Calculate total calories from meals
export const calculateTotalCalories = (meals) => {
  return meals.reduce((total, meal) => {
    if (meal.nutritionData && meal.nutritionData.items) {
      return total + meal.nutritionData.items.reduce((mealTotal, item) => mealTotal + item.calories, 0);
    }
    return total;
  }, 0);
};

// Calculate total protein from meals
export const calculateTotalProtein = (meals) => {
  return meals.reduce((total, meal) => {
    if (meal.nutritionData && meal.nutritionData.items) {
      return total + meal.nutritionData.items.reduce((mealTotal, item) => mealTotal + item.protein, 0);
    }
    return total;
  }, 0);
};

// Calculate total carbs from meals
export const calculateTotalCarbs = (meals) => {
  return meals.reduce((total, meal) => {
    if (meal.nutritionData && meal.nutritionData.items) {
      return total + meal.nutritionData.items.reduce((mealTotal, item) => mealTotal + item.carbs, 0);
    }
    return total;
  }, 0);
};

// Calculate total fats from meals
export const calculateTotalFats = (meals) => {
  return meals.reduce((total, meal) => {
    if (meal.nutritionData && meal.nutritionData.items) {
      return total + meal.nutritionData.items.reduce((mealTotal, item) => mealTotal + item.fats, 0);
    }
    return total;
  }, 0);
};

// Calculate all totals at once
export const calculateTotals = (meals) => {
  return {
    calories: Math.round(calculateTotalCalories(meals)),
    protein: Math.round(calculateTotalProtein(meals) * 10) / 10,
    carbs: Math.round(calculateTotalCarbs(meals) * 10) / 10,
    fats: Math.round(calculateTotalFats(meals) * 10) / 10
  };
};
