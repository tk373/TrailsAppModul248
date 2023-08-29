import { useLocation } from "react-router-dom"
import Map from "./Map"
import WeatherDisplay from "./WeatherDisplay"
import "./view.css"
import { Header } from "./Header"
import Contributors from "./Contributors"

export default function TrailView({ getWeatherStr, getLanguage, t }){
    const location = useLocation()
    const trail = location.state?.trail


    function getFormattedDate(stringDate){
        const currentDate = new Date(stringDate)
        const day = currentDate.getDate();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const formattedDate = `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year}`;
      
        return formattedDate;
    }

    return (
        <>
            <Header getLanguage={getLanguage} t={t}/>
            <div className="main">
                <header className="viewHeader">
                    <h1>{trail.name}</h1>
                    <h1>{getFormattedDate(trail.date)}</h1>
                </header>
                <div className="maps">
                    <h3>{trail.destination}</h3>
                    <div className="dest">
                        <div>
                            <Map location={trail.destination} t={t}/>
                        </div>
                    </div>
                </div>
                <div className="weathertime">
                    <h3>{trail.time}</h3>
                    <WeatherDisplay trail={trail} getWeatherStr={getWeatherStr}/>
                </div>
                <div className="contributorsDiv">
                    <Contributors trail={trail} t={t}/>
                </div>
            </div>
        </>
    )
}