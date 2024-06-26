import React from 'react';
import ReactDOM from 'react-dom/client';
import './style/index.css';
import App from './App';
import GeoGuesser from './components/GeoGuesser';
import MyRecipes from './components/MyRecipes';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Login from './components/Login';
import {useState, useEffect} from 'react';
import axios from 'axios'
import { getAuth } from 'firebase/auth'



//Wrapper function to wrap the App component and pass props from App to the child components 
function Wrapper({children, user, setUser, savedRecipes, setSavedRecipes}){
  return (
    //cloneElement to clone the passed props for the children classes to also access them
   React.cloneElement(children, {user, setUser, savedRecipes, setSavedRecipes})
  );
}
const Index = () => {
  const [user, setUser] = useState(null);  //changes during the login process
  const [savedRecipes, setSavedRecipes] = useState([]); //redeclared in index.js (parent class) to effectively pass down to child
  //Wrapper component used to wrap all props and pass them to the child components 


  //the two use effects handle getting the user's saved recipes 
  //We then store the recipes in the savedRecipes array and pass it into certain pages as props
  const auth = getAuth();
  useEffect(() => {
    console.log('Current user on page load:', user)
    const auth = getAuth();
    const change = auth.onAuthStateChanged((user) => {
      setUser(user);
    }); 
    return () => {
      change();
    };
  }, [auth, user]); //pass auth and user since this deals with user authentication


    useEffect(() => {
        const fetchSavedRecipes = async () => {
            if (user){
                try {
                    console.log(auth.currentUser.uid)
                    const response = await axios.get(`http://localhost:8000/getSavedRecipes?userID=${auth.currentUser.uid}`);
                    if (response.data && response.data.recipes) {
                        setSavedRecipes(response.data.recipes);
                    } else {
                        setSavedRecipes([]);
                    }
                } catch (error) {
                    console.log("Error in fetching saved recipes: ", error)
                }
            } else {
                setSavedRecipes([]);
            }

        };

        if (user) {
            fetchSavedRecipes();
        } else {
            console.log('user is null')
            setSavedRecipes([]);
        }
        
    }, [user, auth]); 



  
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <Wrapper
          user={user}
          setUser = {setUser} 
          savedRecipes = {savedRecipes}
          setSavedRecipes = {setSavedRecipes}> 
            <App />
          </Wrapper> //props wrapped from App.js and then passed back to App.js 
      ),
    }, 
    {
      path: "geoGuesser",
      element: (
        <Wrapper
          user={user}
          savedRecipes={savedRecipes}>
            <GeoGuesser />
          </Wrapper>  //GeoGuesser.js needs access to the user and savedRecipes props due to game implementation
    ),
    },
    {
      path: 'login',
      element: (
        <Wrapper
          user={user}
          setUser={setUser}>
            <Login />
          </Wrapper>  //Login.js needs access to the user and setUser props during the sign-in process
        )
    },
    {
      path:"myRecipes",
      element: (
      <Wrapper 
        setUser = {setUser}  
        user={user}
        savedRecipes={savedRecipes}
        setSavedRecipes = {setSavedRecipes}> 
          <MyRecipes />
        </Wrapper> //MyRecipes.js needs access to the user and savedRecipes props when viewing recipes that are saved
      ),

    },
    
  ]);
  //render the application and initialize the RouterProvider using the root node
  const root = ReactDOM.createRoot(document.getElementById('root')); 
  root.render(
      <RouterProvider router={router} />
  );
}
//Index root component - rendering
ReactDOM.createRoot(document.getElementById('root')).render(<Index />);