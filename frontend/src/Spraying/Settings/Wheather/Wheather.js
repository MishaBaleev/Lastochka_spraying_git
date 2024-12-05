import "./Wheather.scss";

const Wheather = (props) => {
    const settings = [
        {key: "temperature", title: "Температура воздуха", min: 0, max: 40, type:"range", step: 1},
        {key: "wind_speed", title: "Скорость ветра", min: 0, max: 40, type: "range", step: 1},
        {key: "wind_direction", title: "Направление ветра", type: "select", options: ["Северное", "Северо-Восточное", "Восточное", "Юго-Восточное", "Южное", "Юго-Западное", "Западное", "Северо-Западное"], values: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]},
        {key: "humidity", title: "Влажность", min: 30, max: 90, type: "range", step: 10},
        {key: "adjuvants", title: "Адъюванты", type: "checkbox"},
    ]
    const conditions = {"good": "Предпочтительные", "middle": "Пограничные", "bad": "Неблагоприятные", "undef": "Не определено"}

    return <ul className="wheather block">
        {settings.map((item, index) => {
            if (item.type === "range"){
                return <li key={index}>
                    <div className="wheather_title"><p>{item.title}</p></div>
                    <input type="range"
                        min={item.min}
                        max={item.max}
                        step={item.step}
                        value={props.settings[item.key]}
                        onChange={(e) => {props.changeWheather(item.key, e.target.value)}}
                    />
                    <input type="number"
                        min={item.min}
                        max={item.max}
                        step={item.step}
                        value={props.settings[item.key]}
                        onChange={(e) => {props.changeWheather(item.key, e.target.value)}}
                    />
                </li>
            }else if (item.type === "checkbox"){
                return <li key={index} className="big">
                    <div className="wheather_title"><p>{item.title}</p></div>
                    <input type="checkbox" 
                        checked={props.settings.adjuvants}
                        onChange={(e) => {props.changeWheather(item.key, e.target.checked)}}
                    />
                </li>
            }else if (item.type === "select"){
                return <li key={index}>
                    <div className="wheather_title"><p>{item.title}</p></div>
                    <select onChange={(e) => {props.changeWheather(item.key, e.target.value)}}>
                        {item.values.map((value, v_index) => {
                            return <option key={v_index} value={value}>{item.options[v_index]}</option>
                        })}
                    </select>
                </li>
            }
        })}
        <li className="conditions">
            <div className="wheather_title"><p>Условия</p></div>
            <div className={"result "+props.spray_manager.checkWheather(props.settings)}>
                <p>{conditions[props.spray_manager.checkWheather(props.settings)]}</p>
            </div>
        </li>
    </ul>
}
export default Wheather