import { useState, useEffect } from "react";
import "./App.scss";
import Header from "./layouts/Header/Header";
import { manager3D } from "./manager3D";
import { Threebox } from "threebox-plugin";
import mapboxgl from 'mapbox-gl';
import Spraying from "./Spraying/Spraying";

const App = (props) => {
  const [map, setMap] = useState(null)
  const [manager3D_object, setManager3D] = useState(null)

  useEffect(() => {
    const token = "pk.eyJ1IjoiYmFsZWV2IiwiYSI6ImNsYXBqNmk4dTE5Y3UzcWxiYmt1bTJtcG8ifQ.aE8lRdfDnWq52szIP7gAHw"
    mapboxgl.accessToken = token;
    let map = new mapboxgl.Map({
      container: "map",
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [38.782723, 47.327716],
      zoom: 15,
      minZoom: 2
    })
    setMap(map)
    map.on("style.load", () => {
      let manager3D_ = new manager3D(map)
      setManager3D(manager3D_)
    })
  }, [])

  return <div className="App">
    <Header map={map}/>
    <div id="map" className="container--map"/>
    <Spraying map={map} manager3D={manager3D_object}/> 
  </div>
}
export default App