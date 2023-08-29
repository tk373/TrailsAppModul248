import { useEffect, useState } from "react";
import Map from "./Map"
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import TrailView from "./TrailView";
import { useAuth } from "./Auth/checkAuth";

export function TrailsTable({ sortByName, sortByDate, t, trails, getFormattedDate, handleDeleteTrails, setSelected, dragDiv }){
    const [displayMap, setDisplayMap] = useState([false, ""])
    const navigate = useNavigate()
    const user = useAuth()

    useEffect(() => {
        console.log(user, "esse")
    }, [])

    function displayMapFR(loc){
        setDisplayMap([true, loc])
    }

    function evaluateView(trail){
        navigate('/View', { state: { trail } })
    }

    return (
        <>

            {displayMap[0] && <Map location={displayMap[1]} close={() => setDisplayMap([false, ""])} dragDiv={dragDiv} t={t}/>}
            <table className="styled-table">
                <thead> 
                    <tr>
                        <th onClick={sortByName}>{t["name"]}<strong>&#8693;</strong></th>
                        <th onClick={sortByDate}>{t["excursionDate"]} <strong>&#8693;</strong></th>
                        <th>{t["time"]}</th>
                        <th>{t["destination"]}</th>
                        <th>{t["creator"]}</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {trails.map((trail, index) => (
                        <>
                            <tr key={trail.id} className={trail.isCurrent ? "" : "expired"}>
                                <td onClick={e => setSelected(trail)}>{trail.name} <strong>{trail.weather}</strong></td>
                                <td>{getFormattedDate(trail.date.toString())}</td>
                                {console.log(trail)}
                                <td>{trail.time}</td>
                                <td onClick={(e) => displayMapFR(e.target.innerText)}>{trail.destination} 📌</td>
                                <td onClick={(e) => displayMapFR(e.target.innerText)}>{trail.creator[0]}</td>
                                <td><button onClick={e =>  handleDeleteTrails(e, trail.rid)} className="btn btn-dark btn-outline-danger">{t["delete"]}</button></td>
                                <td><button className="btn btn-primary" onClick={() => evaluateView(trail)}>{t["view"]}</button></td>
                            </tr> 
                        </>
                    ))}
                </tbody>
            </table>    
        </>
    )
}