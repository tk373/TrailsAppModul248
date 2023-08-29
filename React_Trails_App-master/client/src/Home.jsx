import { useEffect, useState } from "react";
import React from "react"
import Dialog from "./Dialog";  
import WeatherDisplay from "./WeatherDisplay";
import { Header } from "./Header";
import { TrailsForm } from "./TrailsForm";
import { signOut } from "firebase/auth";
import { auth } from "./Auth/fire";



export function Home({t, getLanguage, dragDiv, getWeatherStr}){
    const [displayDialog, setDisplayDialog] = useState(false)
    const [signOutDialog, setSignOutDialog] = useState(false)
    const [selectedTrail, setSelectedTrail] = useState([])
    const [weatherDisplay, setWeatherDisplay] = useState(false)
    
   
    function getFormattedDate(stringDate){
        const currentDate = new Date(stringDate)
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const formattedDate = `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year}`;
      
        return formattedDate;
    }

    function signOutUser(){
        setSignOutDialog([true, "Signing out."]);
    }

    function closeSignOut(){
        setSignOutDialog([false, []]);
        signOut(auth);
        localStorage.removeItem("authUser");
    }

    


    useEffect(() => {
        let lang = localStorage.getItem("LANG")
        if(lang){
            getLanguage(lang)
        }
        console.log(t);
    }, [])


    function setSelected(trail){
        setWeatherDisplay(!weatherDisplay)
        setSelectedTrail(trail)
    }
    
    return(
        <>
            {weatherDisplay && <WeatherDisplay close={() => setWeatherDisplay(false)} trail={selectedTrail} getWeatherStr={getWeatherStr} dragDiv={dragDiv}/>}
            {displayDialog[0] && <Dialog closeAlert={() => setDisplayDialog([false, []])} message={displayDialog[1]}/>}
            {signOutDialog[0] && <Dialog closeAlert={closeSignOut} message={signOutDialog[1]}/>}
            <div id="HomeDiv">
                <Header getLanguage={getLanguage} signOutUser={signOutUser} t={t}/>
                <TrailsForm t={t} setSelected={setSelected} getWeatherStr={getWeatherStr} getFormattedDate={getFormattedDate} setDisplayDialog={setDisplayDialog} dragDiv={dragDiv} signOutUser={closeSignOut} getLanguage={getLanguage}/>
            </div>
        </> 
    )
}