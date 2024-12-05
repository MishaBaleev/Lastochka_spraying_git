import "./Settings.scss";
import zone from "./img/zone.png";
import movement from "./img/movement.png";
import wheather from "./img/wheather.png";
import Movement from "./Movement/Movement";
import Zone from "./Zone/Zone";
import Wheather from "./Wheather/Wheather";
import { useState } from "react";

const Settings = (props) => {

    const [cur_cmp, setCmp] = useState(0)

    const cmps = [
        <Zone changeZone={props.changeZone} settings={props.zone_settings} map_manager={props.map_manager} presets={props.presets} setPrManActive={props.setPrManActive}/>,
        <Movement changeMove={props.changeMove} settings={props.move_settings} map_manager={props.map_manager}/>,
        <Wheather changeWheather={props.changeWheather} settings={props.wheather_settings} spray_manager={props.spray_manager}/>
    ]

    return <div className="settings_spray">
        <div className="title"><p>Настройка полетного задания</p></div>
        <nav className="navigation">
            <button onClick={() => {setCmp(0)}}>
                <img src={zone} alt="zone"/>
            </button>
            <button onClick={() => {setCmp(1)}}>
                <img src={movement} alt="movement"/>
            </button>
            <button onClick={() => {setCmp(2)}}>
                <img src={wheather} alt="wheather"/>
            </button>
        </nav>
        <div className="main_spray">
            <div className="file_name">
                <input type="text"
                    placeholder="Название файла"
                />
            </div>
            {cmps[cur_cmp]}
            <div className="save">
                <button onClick={props.savePlan}>Сохранить</button>
            </div>
        </div>
    </div>
}
export default Settings