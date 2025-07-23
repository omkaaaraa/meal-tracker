import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  deleteDoc,
  updateDoc,
  getDoc,
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { db } from '../firebase';

// Create user profile document in Firestore (with merge to avoid overwriting)
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      email: userData.email,
      createdAt: new Date().toISOString(),
      ...userData
    }, { merge: true }); // Merge option prevents overwriting existing data
    console.log('User profile created/updated successfully');
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

// Get user profile document
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      console.log('No user profile found');
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile document (creates if doesn't exist)
export const updateUserProfile = async (userId, updateData) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Check if document exists first
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // Document exists, update it
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      console.log('User profile updated successfully');
    } else {
      // Document doesn't exist, create it
      await setDoc(userRef, {
        ...updateData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('User profile created successfully');
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};
