import { addHours, parse, subHours, format } from "date-fns";
import { useEffect, useState } from "react";
import { weatherSymbols } from "./weatherSymbols";

export default function WeatherDisplay({ trail, getWeatherStr, close = null, dragDiv = null }){
    const [weatherMinus2h, setWeatherMinus2h] = useState([])
    const [weatherCurrent, setWeatherCurrent] = useState([])
    const [weatherPlus2h, setWeatherPlus2h] = useState([])
    const [classNames, setClassNames] = useState(["alertW", "alert-content weatherDisplay"])

    async function getWeather(){
        const timeStr = trail.time;
        const time = parse(timeStr, "HH:mm", new Date())    

        const timeMinus2h = subHours(time, 2)
        const formattedTimeMinus2h = format(timeMinus2h, "HH:mm")
        const timePlus2h = addHours(time, 2)
        const formattedTimePlus2h = format(timePlus2h, "HH:mm")


        const _weatherCurrent = await getWeatherStr(trail.date, time, trail.destination)
        const _weatherMinus2h = await getWeatherStr(trail.date, timeMinus2h, trail.destination)
        const _weatherPlus2h = await getWeatherStr(trail.date, timePlus2h, trail.destination)

        _weatherCurrent.push(timeStr)
        _weatherMinus2h.push(formattedTimeMinus2h)
        _weatherPlus2h.push(formattedTimePlus2h)

        setWeatherCurrent(_weatherCurrent)
        setWeatherMinus2h(_weatherMinus2h)
        setWeatherPlus2h(_weatherPlus2h)


        console.log(_weatherCurrent);
    }

    useEffect(() => {
        getWeather();
        dragDiv && dragDiv("alertDiv")
        !close && setClassNames(["nalertW", "nalert-content nweatherDisplay"])
    }, [])

    return (
        <div className={classNames[0]} id="alertDiv">
            <h1 id="title">{trail.name}	📌{trail.destination}</h1>
            <div className={classNames[1]}>
                <div>
                    <h1>{weatherSymbols[weatherMinus2h[0]]}</h1>
                    <p>{weatherMinus2h[1]}° <em>{weatherMinus2h[2]}</em></p>
                </div>  
                <div>
                    <h1>{weatherSymbols[weatherCurrent[0]]}</h1>
                    <p>{weatherCurrent[1]}° <em>{weatherCurrent[2]}</em></p>
                </div>
                <div>
                    <h1>{weatherSymbols[weatherPlus2h[0]]}</h1>
                    <p>{weatherPlus2h[1]}° <em>{weatherPlus2h[2]}</em></p>
                </div>
            </div>
            {close && <button onClick={close} className="btn btn-dark btn-outline-secondary">Close</button>}
        </div>
    )
}