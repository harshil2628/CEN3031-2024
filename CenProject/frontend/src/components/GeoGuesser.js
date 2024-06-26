import React from 'react';
import "../style/GeoGuesser.css"
import NavBar from "./NavBar"
import { useState, useEffect } from 'react';
import axios from 'axios'
import { GoogleMap, useLoadScript, Marker, Polyline } from '@react-google-maps/api';

// api keys and basic set up variables
const KEY = process.env.REACT_APP_API_MAP_KEY
const KEY2 = process.env.REACT_APP_API_KEY
const libraries = ['places'];
const mapContainerStyle = {
  width: '70vw',
  height: '100vh',
};
// to center the map initially
const center = {
  lat: 37.090240, // default latitude
  lng: -95.712891, // default longitude
}

//arrays of arrays that have [cuisine, origin]
//used to randomly come up with a recipe from a certain place of origin 
const CUISINES = [
  ["african", "africa"], 
  ["french", "france"],
  ["latin_american", "latin_america"],
  ["asian", "asia"], 
  ["german", "germany"], 
  ["mediterranean", "mediterranean"],
  ["american", "america"],
  ["greek", "greece"], 
  ["mexican", "mexico"], 
  ["british", "britain"],
  ["indian", "india"],
  ["middle_eastern", "middle_east"], 
  ["irish", "ireland"],
  ["nordic", "Northern Europe"],
  ["caribbean","caribbean"],
  ["italian", "italy"], 
  ["southern", "south america"], 
  ["chinese", "china"], 
  ["japanese", "japan"],
  ["spanish", "spain"], 
  ["eastern_european", "east_europe"], 
  ["jewish", "east_europe"], 
  ["thai", "thailand"], 
  ["european", "europe"], 
  ["korean", "korea"], 
  ["vietnamese", "vietnam"]
]

const GeoGuesser = ({user}) => {

  //set up state variables 
  const [answerCoordinates, setAnswerCoordinates] = useState([{lat: 37.090240,lng: -95.712891 }])
  const [recipeTitle, setRecipeTitle] = useState("")
  const [recipeSummary, setRecipeSummary] = useState("")
  const [recipeImage, setRecipeImage] = useState("")
  const [recipeLink, setRecipeLink] = useState("")
  const [recipeInstructions, setRecipeInstructions] = useState("")
  const [marker, setMarker] = useState([])
  const [path, setPath] = useState([])
  const [revealAnswer, setAnswer] = useState(false)
  const [revealUserMarker, setUserMarker] = useState(false)
  const [error, setError] = useState(false)
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: KEY,
    libraries,
  });

  useEffect(() => {
    getNewRecipe()
  }, [])
  
  //gets a random recipe from a certain origin
  const getNewRecipe = async () => {

    setAnswer(false)
    setUserMarker(false)
  
    const origin = CUISINES[Math.floor(Math.random()*CUISINES.length)]

    //get random recipe based on a random origin 
    const data = await fetch(`https://api.spoonacular.com/recipes/random?apiKey=${KEY2}&number=1&include-tags=cuisine=${origin[0]}`)
    const results = await data.json()

    //try to set data from all API calls 
    try {
      console.log(results)
      // sets the basic recipe information 
      setRecipeTitle(results.recipes[0].title)
      setRecipeSummary(results.recipes[0].summary.replace(/<\/?[^>]+(>|$)/g, ""))
      setRecipeImage(results.recipes[0].image)
      setRecipeLink(results.recipes[0].spoonacularSourceUrl)
      setRecipeInstructions(results.recipes[0].instructions.replace(/<\/?[^>]+(>|$)/g, ""))

      //gets the lat and lng of the origin 
      const originData = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${origin[1]}&key=${KEY}`)
      const originResults = await originData.json()
      const res = originResults.results[0].geometry.location
    
      setAnswerCoordinates(res)
      setError(false)
    }

    catch(error) {
      console.log(error)
      setError(true)
    }
    
  }

  //when user clicks map, it places their marker on the map
  //only works if the answer is not revealed   
  const onMapClick = (e) => {

    setUserMarker(true)
    if (!revealAnswer) {
      setMarker([
        {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        }
      ])
    }
  }

  //this is for showing the answer  
  const handleSubmit = () => {

    setAnswer(true)
    setPath(
      [
        answerCoordinates,
        {lat: marker[0].lat, lng: marker[0].lng}
      ]
    )
  }

  const handleSave = async () => {

    if (!error) {

      const newRecipe = {
        userID: user.uid,
        recipeID: Math.floor(100000 + Math.random() * 900000), 
        recipeTitle: recipeTitle, 
        recipeImage: recipeImage, 
        recipeLink: recipeLink,
        summary: recipeSummary, 
        instructions: recipeInstructions
      }
  
      await axios.post(`http://localhost:8000/saveRecipeTest`, newRecipe)

    }
    
  }

  //catches errors for the google maps 
  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  return (

    <div>

      <NavBar/>

    <div className="geoGuesserContainer">

        {/* left side of the screen  */}
        <div className="questionsSideBar overflow-hidden">
          <div className="mt-2 d-flex justify-content-around">
            <button className="btn btn-primary" onClick={getNewRecipe}>Get New Recipe</button>
            <button className="btn btn-danger" onClick={handleSubmit}>Submit Answer</button>
            <button className="btn btn-success" onClick={handleSave}> Save Recipe</button>
          </div>
         

          {/* shows the recipe info */}
          { !error ?  (
              <div className="d-flex flex-column justify-content-center align-items-center position-relative">
                <h3 className="mt-5 px-2 text-center">{recipeTitle}</h3>
                <div style={{height: "320px", width:"100%"}} className="overflowY">
                  <p className=" mt-5" dangerouslySetInnerHTML={{ __html: recipeSummary}}></p>
                </div>
                <img className="img-responsive mt-5 position-absolute bottom-0 top-100" src={recipeImage}></img>
            </div>
          ) : (
              <div className="d-flex flex-column justify-content-center align-items-center position-relative">
                <h3 className="mt-5 px-2">Error! Wait a second and try again!</h3>
              </div>

          )
          
          
          }
        
      </div>

      {/* right side of the screen - the actual map */}
      <div className="mainMap">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={4}
          center={center}
          onClick={onMapClick}
        >

        {/* places the user marker on the map */}


        {revealUserMarker ? (
          marker.map((marker, index) => (
            <Marker 
              key={index}
              position={{ 
                lat: marker.lat,
                lng: marker.lng 
              }} />
          ))
        ) : null}     
        
        {/* shows the answer after submit  */}
        {revealAnswer ? <Marker position={answerCoordinates} icon="http://maps.google.com/mapfiles/ms/icons/green-dot.png"/> : null}
        

        {/* draws the line from user's marker to the answer marker  */}
        {revealAnswer ?  <Polyline path={path} strokeColor="#0000FF" strokeOpacity={0.8} strokeWeight={2} /> : null}

        </GoogleMap>
      </div> 
    </div>
    </div>

   
  );
};

export default GeoGuesser;