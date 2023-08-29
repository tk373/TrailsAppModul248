import { useEffect } from "react"
import translation from "./translations.json"

export default function NotFound({ t }){

    return (
        <div id="error404Div"> {console.log(t)}
            <h1 id="error404">404</h1>
            <h4>{t["e404"]}</h4>
            <p>{t["e404message"]}</p>
            <a href="/">{t["e404back"]}</a>
        </div>
    )
}