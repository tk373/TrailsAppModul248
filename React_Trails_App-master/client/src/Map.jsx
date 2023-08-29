import { useEffect, useRef, useState } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
export default function Map({ location, close = null, dragDiv = null, t }){
    const mapContainerRef = useRef(null)
    const [routingView, setRoutingView] = useState(false)
    const [idN, setIDN] = useState(["map", "mapDiv"])

    async function fetchLocation(){
        const accessToken = '';
        const geocodingEndpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            location
        )}.json?access_token=${accessToken}`;

        let [longitude, latitude] = [0, 0];

        try{
            const response = await fetch(geocodingEndpoint)
            const data = await response.json()

            if (data.features.length > 0) {
                [longitude, latitude] = data.features[0].center;
            }
        } catch(error){
            alert(error)
        }

        mapboxgl.accessToken = accessToken;
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [longitude, latitude],
            zoom: 14
        });

        const marker = new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(map);

        return () => {
            marker.remove();
            map.remove();
        };
    }

    useEffect(() => {
        !close && setIDN(["newMap", "newMapDiv"])
    }, []);
    

    useEffect(() => {
        if(routingView){
            initMap()
        } else{
            fetchLocation()
        }
    }, [routingView])

    function getCurrentLocation() {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            position => {
              const { latitude, longitude } = position.coords;
              resolve({ latitude, longitude });
            },
            error => {
              reject(error); 
            }
          );
        });
    }
      
        function initMap() {
            console.log("Map created")
            const directionsService = new google.maps.DirectionsService();
            const directionsRenderer = new google.maps.DirectionsRenderer();
            const map = new google.maps.Map(mapContainerRef.current, {
                zoom: 7,
                center: { lat: 47.465266, lng: 9.0415478 },
            });
            
            directionsRenderer.setMap(map);
        
            calculateAndDisplayRoute(directionsService, directionsRenderer)
        }
        
          
        function calculateAndDisplayRoute(directionsService, directionsRenderer) {
            getCurrentLocation().then(browserLocation => {
                directionsService
                .route({
                    origin: new google.maps.LatLng(browserLocation.latitude,browserLocation.longitude),
                    destination: {
                    query: location,
                },
                    travelMode: google.maps.TravelMode.BICYCLING,
                })
                .then((response) => {
                    directionsRenderer.setDirections(response);
                })
                .catch((e) => window.alert("Directions request failed due to " + e));
            })
        }
      
    return(
        <div id={idN[1]}>
            <div id="mapNav">
                <button className="btn btnStyle" id={!close && "newLocationBtn"} onClick={() => setRoutingView(false)}>{t["locationPin"]}</button>
                <button className="btn btnStyle" id={!close && "newLocationRoute"} onClick={() => setRoutingView(true)}>{t["locationRoute"]}</button>
            </div><br />
            <div ref={mapContainerRef} id={idN[0]}/><br />
            {close && <button id="mapClose" className="btn btn-outline-danger btn-dark" onClick={close}>Close</button>}
        </div>
    )
}
