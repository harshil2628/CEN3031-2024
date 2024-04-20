// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "cen3031-cooking-website.firebaseapp.com",
  projectId: "cen3031-cooking-website",
  storageBucket: "cen3031-cooking-website.appspot.com",
  messagingSenderId: "866186810186",
  appId: "1:866186810186:web:2b722bf1350ad56301e7b3",
  measurementId: "G-R4RZ6KL2T0"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);



async function DBcreateUser(userID, name, email, image){
  const db = getDatabase(firebaseApp);
  const reference = ref(db,'users/' + userID);
  set(reference, {
    uid: userID,
    name: name,
    email: email,
    userImage: image
  }).then(() => {
    console.log('Data stored succesfuly in database');
  }).catch((error) => {
    console.log('Error storing user data: ', error)
  })
}


async function DBsaveRecipe(userID, recipeID, recipeTitle, recipeImage, recipeLink, summary, instructions){
  const db = getDatabase(firebaseApp);
  const reference = ref(db, 'users/' + userID + '/recipes/' + recipeID);
  set(reference, {
    recipeID: recipeID,
    recipeTitle: recipeTitle,
    recipeImage: recipeImage,
    recipeLink: recipeLink,
    summary: summary,
    instructions: instructions
  })
}


async function DBcheckUser(userID){
  const db = getDatabase(firebaseApp);
  const userRef = ref(db, `users/${userID}`);
  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()){
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error checking user: ", error);
    throw error;
  }
}

async function DBisRecipeSaved(userID, recipeID){
  const db = getDatabase(firebaseApp);
  const recipeRef = ref(db, `users/${userID}/recipes/${recipeID}`);
  try {
    const snapshot = await get(recipeRef);
    if (snapshot.exists()){
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error checking recipe: ", error);
    throw error;
  }
}

export { DBcreateUser, DBsaveRecipe, DBcheckUser, DBisRecipeSaved };
