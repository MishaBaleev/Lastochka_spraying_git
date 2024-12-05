import "./Spraying.scss";
import Settings from "./Settings/Settings";
import { MapManager } from "./MapManager";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import { update_modal_message } from "../AppSlice";
import { sprayManager } from "./sprayManager";
import axios from "axios";
import PresetManager from "./PresetManager/PresetManager";

const Spraying = (props) => {
    const [MapManager_obj, setMapManager] = useState(null)
    const spray_manager = new sprayManager()

    const [pr_man_active, setPrManActive] = useState(false)
    const [presets, setAllPresets] = useState([])
    const getPresets = (preset) => {
        axios.get("http://localhost:8000/presets").then(response => {
            setAllPresets(response.data)
        })
    }
    const savePreset = (preset) => {
        let data = new FormData()
        data.append("command", "save")
        data.append("preset", JSON.stringify(preset))
        axios.post("http://localhost:8000/presets", data).then(response => {
            getPresets("wheat")
        })
    }

    const setPreset = (key) => {
        let preset = null 
        presets.forEach(item => {
            if (item.key === key){preset = item}
        })
        let cur_zone = {...zone_settings}
        cur_zone.culture = key
        cur_zone.line_spacing = preset.line_spacing
        setZone(cur_zone)
        let cur_move = {...move_settings}
        Object.keys(preset).forEach(item_key => {
            cur_move[item_key] = preset[item_key]
        })
        setMove(cur_move)
        MapManager_obj.changeLineSpacing(preset.line_spacing)
        MapManager_obj.changeAlt(preset.alt)
    }

    const addPreset = () => {
        let data = new FormData()
        data.append("command", "add")
        axios.post("http://localhost:8000/presets", data).then(response => {
            getPresets("wheat")
        })
    }
    const deletePreset = (key) => {
        let data = new FormData()
        data.append("command", "delete")
        data.append("key", key)
        axios.post("http://localhost:8000/presets", data).then(response => {
            getPresets("wheat")
        })
    }

    const [zone_settings, setZone] = useState({
        culture: "wheat",
        start_pos: {x: "", y: ""},
        angle: 0,
        line_spacing: 3,
        is_return: true
    })
    const changeZone = (key, value) => {
        let cur_zone = {...zone_settings}
            cur_zone[key] = value 
            setZone(cur_zone)
        if (key === "angle"){
            MapManager_obj.rotatePolygon(value)
        }else if (key === "line_spacing"){
            MapManager_obj.changeLineSpacing(value)
        }else if (key === "is_return"){
            MapManager_obj.toggleRTL()
        }else if (key === "culture"){
            setPreset(value)
        }
    }
    const [move_settings, setMove] = useState({
        speed: 30,
        alt: 3.5,
        tank_capacity: 1,
        liters_per_hectar: 75,
        mode: "spray"
    })
    const changeMove = (key, value) => {
        let cur_move = {...move_settings}
        cur_move[key] = value 
        setMove(cur_move)
        if (key === "alt"){
            MapManager_obj.changeAlt(value)
        }
    }

    const [wheather_settings, setWheather] = useState({
        temperature: 20,
        wind_speed: 2,
        humidity: 90,
        adjuvants: false,
        wind_direction: "N"
    })
    const changeWheather = (key, value) => {
        let cur_wheather = {...wheather_settings}
        cur_wheather[key] = value 
        setWheather(cur_wheather)
        if ((key === "wind_speed") || (key === "wind_direction")){
            MapManager_obj.changeWind(key, value)
        }
    }

    const savePlan = () => {
        console.log(zone_settings)
        console.log(move_settings)
    }
    useEffect(() => {
        if (props.manager3D !== null){
            let manager = new MapManager(props.map, props.manager3D, props.update_modal_message, zone_settings)
            setMapManager(manager)
            props.map.on("mousemove", (e) => {
                if (manager.translate_cursor === true){
                    let cur_zone = {...zone_settings}
                    cur_zone.start_pos.x = e.lngLat.lng 
                    cur_zone.start_pos.y = e.lngLat.lat
                    setZone(cur_zone)
                }
            })
            props.map.on("click", (e) => {
                if (manager.translate_cursor === true){
                    manager.setStartMarker([e.lngLat.lng, e.lngLat.lat])
                }else{
                    manager.setPolygon([e.lngLat.lng, e.lngLat.lat])
                }
            })
        }
        getPresets("wheat")
    }, [props.manager3D])

    return <div className="spraying">
        {pr_man_active===true?
            <PresetManager
                setPrManActive={setPrManActive}
                presets={presets}
                savePreset={savePreset}
                addPreset={addPreset}
                deletePreset={deletePreset}
            />:
            ""
        }
        <Settings 
            map_manager={MapManager_obj} 
            spray_manager={spray_manager} 
            zone_settings={zone_settings}
            changeZone={changeZone}
            move_settings={move_settings}
            changeMove={changeMove}
            wheather_settings={wheather_settings}
            changeWheather={changeWheather}
            savePlan={savePlan}
            presets={presets}
            setPrManActive={setPrManActive}
        />
    </div>
}
const mapStateToProps = (state) => {return state}
const mapDispatchToProps = (dispatch) => { return{
    "update_modal_message": (data) => {dispatch(update_modal_message(data))}
}}
export default connect(mapStateToProps, mapDispatchToProps)(Spraying)