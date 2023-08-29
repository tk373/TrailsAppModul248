import { isAfter, isBefore, setDate } from 'date-fns'
import { weatherSymbols } from "./weatherSymbols";
import { useEffect, useState } from "react";
import { TrailsTable } from "./TrailsTable";
import React from "react"
import _translations from "./translations.json"
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import { db } from "./Auth/fire" 
import { useAuth } from './Auth/checkAuth';


export function TrailsForm({ t, setSelected, getWeatherStr, getFormattedDate, setDisplayDialog, dragDiv, signOutUser, getLanguage }){
    const [trailName, setTrailName] = useState("")
    const [trailDate, setTrailDate] = useState("")
    const user = useAuth()

    const [trailTime, setTrailTime] = useState("")
    const [datesSorted, setDatesSorted] = useState(true)
    const [namesSorted, setNamesSorted] = useState(false)
    const [destination, setDestination] = useState("")
    const [trails, setTrails] = useState([]);


    function checkExpiration(inpTrails){
        const updatedTrails = inpTrails.map(trail => {
            if (isAfter(new Date(), new Date(trail.date))) {
              return { ...trail, isCurrent: false };
            } else {
              return trail;
            }
        });
        return updatedTrails;
    }

    useEffect(() => {
        async function fetchTrails() {
          try {
            const trailsSnapshot = await getDocs(
              query(collection(db, "trails"), where("user", "==", user.uid))
            );
            const contributorSnapshot = await getDocs(
                query(collection(db, "trails"), where("contributors", "array-contains", user.uid))
            );
            const contirbutorData = contributorSnapshot.docs.map(doc => doc.data())
            const trailsData = trailsSnapshot.docs.map((doc) => doc.data());

            const newTrails = [...contirbutorData, ...trailsData]
            const updatedTrails = checkExpiration(newTrails);
            setTrails(updatedTrails);
          } catch (error) {
            console.error(error);
          }
        }
      
        fetchTrails();  
    }, []);

    async function handleAddTrails(e){
        const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
        const dateValid = isAfter(new Date(trailDate), new Date())
        const timeValid = timeRegex.test(trailTime)

        e.preventDefault()
        if(dateValid && timeValid && user){
            const weatherStrArr = await getWeatherStr(trailDate, trailTime, destination)
            if(weatherStrArr == 404){
                setDisplayDialog([true, destination + " is not a valid city."])
                return
            }
            const weatherStr = weatherStrArr[0]
            const rndID = crypto.randomUUID()

            setTrails(current => {
                return [
                    ...current,
                    {rid: rndID, name: trailName, date: trailDate, isCurrent: true, time: trailTime, weather: weatherSymbols[weatherStr], destination: destination, contributors: [], creator: [user.displayName, user.uid]}
                ];
            })
           try {
             const docRef = await addDoc(collection(db, "trails"), {
               name: trailName,
               date: trailDate,
               isCurrent: true,
               time: trailTime,
               weather: weatherSymbols[weatherStr],
               destination: destination,
               user: user.uid,
               rid: rndID,
               contributors: [], 
               creator: [user.displayName, user.uid]
             });
             console.log("Document written with ID: ", docRef.id);
            } catch (e) {
                console.error("Error adding document: ", e);
            }
            setTrails(current => sortDates([...current]))
            setTrailDate("")
            setTrailName("")
            setTrailTime("")
            setDestination("")
        } else{
            if(!user){
                setDisplayDialog([true, "You're not logged in"])
                return
            }
            const dateInvalidity = dateValid ? "" : t["dateError"]
            const timeInvalidity = timeValid ? "" : t["timeError"]
            const error = dateInvalidity + "" + (timeInvalidity && dateInvalidity && " / ") + timeInvalidity
            setDisplayDialog([true, error])
        }

    }

    async function handleDeleteTrails(e, id) {
        e.preventDefault();
        try {
            const querySnapshot = await getDocs(
                query(collection(db, "trails"), where("rid", "==", id))
            );
            querySnapshot.forEach((doc) => {
                deleteDoc(doc.ref)
                .then(() => {
                    setTrails(current => {
                        return current.filter(trail => trail.rid !== id);
                    });
                    console.log('Document successfully deleted!');
                })
                .catch((error) => {
                    console.error('Error deleting document: ', error);
                });
            });
            
        } catch (error) {
            console.error("Error deleting trail: ", error);
        }
    }

    function sortByDate(){
        if(datesSorted){
            setTrails(current => {
                return sortDatesDESC([...current])
            });
            setDatesSorted(false)
        } else{
            setTrails(current => {
                return sortDates([...current])
            });
            setDatesSorted(true)
        }
    }

    function sortDates(current){
        const sortedTrails = current.sort((x, y) => (
            new Date(y.date) - new Date(x.date)
        ));
        return sortedTrails;
    }

    function sortDatesDESC(current){
        const sortedTrails = current.sort((x, y) => (
            new Date(x.date) - new Date(y.date)
        ));
        return sortedTrails;
    }
    
    function sortByName(e){
        e.preventDefault()
        if(namesSorted){
            setTrails(current => [...current].sort((a, b) => a.name.localeCompare(b.name)))
            setNamesSorted(false)
        } else{
            setTrails(current => [...current].sort((a, b) => b.name.localeCompare(a.name)))
            setNamesSorted(true)
        }
    }

    useEffect(() => {
        // if(localStorage.getItem("LANG") === "ar"){
        //     console.log(localStorage.getItem("LANG"));
        //     for(let i = 0; i < document.querySelectorAll("p").length; i++){
        //         document.getElementsByTagName("p")[i].style.textAlign = "right";
        //     }
        // }

    }, [t])

    useEffect(() => {
        const lastUpdate = localStorage.getItem("LAST_W_UPDATE")

        //Checks if there was a last update or calculates the difference of the last update and current time
        if(!lastUpdate || (new Date() - new Date(lastUpdate)) >= 24 * 60 * 60 * 1000){ //if more than 24 hours have passed since lastUpdate, a new update occurs
            updateWeather().then(updatedTrails => {
                setTrails(updatedTrails)
                localStorage.setItem("LAST_W_UPDATE", new Date().toISOString());
            })
        }
        localStorage.setItem("TRAILS", JSON.stringify(trails))
        
    }, [trails])

    async function updateWeather(){
       const updatedTrails = await Promise.all(trails.map(async trail =>{
        const weatherStr = await getWeatherStr(trail.date, trail.time, trail.destination)
        return {
            ...trail,
            weather: weatherSymbols[weatherStr]
        }
       }))

       return updatedTrails;
    }
    

    return(
        <div className="mainDiv container">
            <div className="d-flex flex-row justify-content-between">
                <form className="flex-grow-1 gap-1 flex-column d-flex me-5 mt-2">
                <label htmlFor="trailName">{t["name"]}</label>
                <input type="text" name="trailName" id="trailName" className="boxStyle" value={trailName} onChange={e => setTrailName(e.target.value)}/>
                <label htmlFor="trailDate">{t["excursionDate"]}</label>
                <input type="date" name="trailDate" id="trailDate" className="boxStyle" value={trailDate} onChange={e => setTrailDate(e.target.value)}/>
                <label htmlFor="trailTime">{t["time"]}</label>

                <input type="time" name="trailTime" id="trailTime" placeholder="00:00..." className="boxStyle" value={trailTime} onChange={e => setTrailTime(e.target.value)}/>         
                <label htmlFor="destination">{t["destination"]}</label>
                <input type="text" name="destination" id="destination" placeholder={t["destExample"]} className="boxStyle" value={destination} onChange={e => setDestination(e.target.value)} />
                

                <button className="btnStyle" onClick={handleAddTrails}>{t["submit"]}</button>
                </form>
                <TrailsTable sortByName={sortByName} sortByDate={sortByDate} t={t} trails={trails} getFormattedDate={getFormattedDate} handleDeleteTrails={handleDeleteTrails} setSelected={setSelected} dragDiv={dragDiv} signOutUser={signOutUser}/>
            </div>
        </div>
    )
}