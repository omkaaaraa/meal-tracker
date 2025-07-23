import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  deleteDoc,
  updateDoc,
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { db } from '../firebase';

// Create user profile document in Firestore
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      email: userData.email,
      createdAt: new Date().toISOString(),
      ...userData
    });
    console.log('User profile created successfully');
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Add a new meal to user's meals subcollection
export const addMeal = async (userId, meal) => {
  try {
    const mealsRef = collection(db, 'users', userId, 'meals');
    const docRef = await addDoc(mealsRef, {
      ...meal,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString() // For easy querying by date
    });
    console.log('Meal added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding meal:', error);
    throw error;
  }
};

// Update an existing meal
export const updateMeal = async (userId, mealId, updatedMeal) => {
  try {
    const mealRef = doc(db, 'users', userId, 'meals', mealId);
    await updateDoc(mealRef, {
      ...updatedMeal,
      updatedAt: new Date().toISOString()
    });
    console.log('Meal updated with ID: ', mealId);
    return mealId;
  } catch (error) {
    console.error('Error updating meal:', error);
    throw error;
  }
};

// Get all meals for a user
export const getMeals = async (userId, date = null) => {
  try {
    const mealsRef = collection(db, 'users', userId, 'meals');
    let q;
    
    if (date) {
      // Simple query for specific date (no orderBy to avoid index requirement)
      q = query(mealsRef, where('date', '==', date));
    } else {
      // Get all meals, ordered by timestamp
      q = query(mealsRef, orderBy('timestamp', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    const meals = [];
    
    querySnapshot.forEach((doc) => {
      meals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // If querying by date, sort by timestamp in JavaScript
    if (date) {
      meals.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    return meals;
  } catch (error) {
    console.error('Error getting meals:', error);
    throw error;
  }
};

// Get meals for today
export const getTodaysMeals = async (userId) => {
  try {
    const mealsRef = collection(db, 'users', userId, 'meals');
    const today = new Date().toDateString();
    
    // Simple query without orderBy to avoid index issues
    const q = query(
      mealsRef, 
      where('date', '==', today)
    );
    
    const querySnapshot = await getDocs(q);
    const meals = [];
    
    querySnapshot.forEach((doc) => {
      meals.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort in JavaScript instead of Firestore
    meals.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return meals;
  } catch (error) {
    console.error('Error getting today\'s meals:', error);
    throw error;
  }
};

// Delete a meal from user's meals subcollection
export const deleteMeal = async (userId, mealId) => {
  try {
    const mealRef = doc(db, 'users', userId, 'meals', mealId);
    await deleteDoc(mealRef);
    console.log('Meal deleted successfully');
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
};
