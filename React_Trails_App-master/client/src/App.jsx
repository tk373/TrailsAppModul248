import { Home } from "./Home";
import NotFound from "./NotFound";
import "./styles.css"
import {BrowserRouter, Routes, Route, useNavigate, Navigate, useAsyncError} from 'react-router-dom'
import _translations from "./translations.json"
import { useEffect, useState } from "react";
import Registration from "./Auth/Registration";
import { Login } from "./Auth/Login";
import { useAuth } from "./Auth/checkAuth";
import TrailView from "./TrailView";

const apikey = ""


export default function App(){
  const [t, setT] = useState(() => {
    if(localStorage.getItem("LANG")){
        return localStorage.getItem("LANG")
    }

    return _translations.en;
  })
  const user = useAuth()
  const [triggerReRender, setTriggerReRender] = useState(false)

  function getLanguage(lang){
    localStorage.setItem("LANG", lang)
    const selectedLang = eval("_translations." + lang) 
    setT(selectedLang)
  }

  useEffect(() => {
    if(localStorage.getItem("LANG")){
      getLanguage(localStorage.getItem("LANG"))
    } else{
      getLanguage("en")
    }

  }, [])

  function dragDiv(elemId, mapContainerRef = null){
    const mapDiv = document.getElementById(elemId);
    
    let isDragging = false;
    let mouseX = 0;
    let mouseY = 0;
    let offsetX = 0;
    let offsetY = 0;
  
    const handleMouseDown = (e) => {
      isDragging = true;
      mouseX = e.clientX;
      mouseY = e.clientY;
      offsetX = parseInt(window.getComputedStyle(mapDiv).left, 10);
      offsetY = parseInt(window.getComputedStyle(mapDiv).top, 10);
    };
  
    const handleMouseMove = (e) => {
      if (isDragging && !isMouseOverMap(e)) {
        const deltaX = e.clientX - mouseX;
        const deltaY = e.clientY - mouseY;
        mapDiv.style.left = `${offsetX + deltaX}px`;
        mapDiv.style.top = `${offsetY + deltaY}px`;
      }
    };
  
    const handleMouseUp = () => {
      isDragging = false;
    };
  
    const isMouseOverMap = (e) => {
      let mapContainer;
      if(mapContainerRef){
        mapContainer = mapContainerRef.current;
      } else{
        return false
      }
      const rect = mapContainer.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      return (
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom
      );
    };
  
    mapDiv.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  
    return () => {
      mapDiv.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }

  function fetchWeather(date, time, _destination) {
    const currentDate = new Date(date)
    currentDate.setTime(time)
    const dtms = currentDate.getTime()
    // const { latitude, longitude } = location;
    // console.log(latitude, longitude, timestamp)
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${_destination}&dt=${dtms}&appid=${apikey}`;
  
    return fetch(url)
      .then(response => response.json())
      .then(data => {
        if(data.cod === 200){
            return [data.weather[0].main, Math.round(data.main.temp - 273.15)];
        } else{
            return data.cod
        }
    });
  } 

  async function getCoordinates(destination){
    const apiKey = 'AIzaSyAy1PQtALW3rbdXH8gBtGFd8Q7db1aI0kI';

    const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&key=${apiKey}`;

    return fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        if (data.results.length > 0) {
          const latitude = data.results[0].geometry.location.lat;
          const longitude = data.results[0].geometry.location.lng;
          return { latitude, longitude };
        } else {
          throw new Error('No results found for the location.');
        }
      })
      .catch(error => {
        console.error(error);
        throw new Error('An error occurred during the geocoding request.');
      });
  }

  function fetchOpenWeather(date, time, _destination){
    const currentDate = new Date(date)
    currentDate.setTime(time)
    const dtms = currentDate.getTime()

    getCoordinates(_destination).then(coords => {
      const lat = coords.latitude;
      const lon = coords.longitude;

      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apikey}`;
  
      return fetch(url)
        .then(response => response.json())
        .then(data => {
          if(data.cod === 200){
              console.log(data);
              const forecast = data.list.filter(item => item.dt_txt.startsWith(futureDate));

              return [forecast.weather[0].main, Math.round(forecast.main.temp - 273.15)];
          } else{
              return data.cod
          }
      });
    })
  }

  async function getWeatherStr(date, time, destination){
      try{
          const weather = await fetchWeather(date, time, destination);
          return weather; 
      } catch(error){
          console.error(error);
      }
  }

  useEffect(() => {
    setTriggerReRender(true)
  }, [user])
  

  return (
    <>
      <BrowserRouter> 
        <Routes>
          {user ? (
            <>
              <Route exact path="/" element={<Home dragDiv={dragDiv} t={t} getLanguage={getLanguage} getWeatherStr={getWeatherStr}/>} />
              <Route path="/View" element={<TrailView getWeatherStr={getWeatherStr} t={t} getLanguage={getLanguage}/>}/>
              <Route path="/Login" element={<Navigate to="/" />}/>
              <Route path="/Registration" element={<Navigate to="/" />}/>
            </>
          ) : (
            <>
              <Route exact path="/" element={<Navigate to="/Login"/>} />
              <Route path="/View" element={<Navigate to="/Login"/>}/>
              <Route path="/Login" element={<Login/>}/>
              <Route path="/Registration" element={<Registration/>}/>
            </>
          )}
          <Route path="/*" element={<NotFound t={t}/>}/>
        </Routes>
      </BrowserRouter>
    </>
  )
} 
