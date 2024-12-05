import { useEffect, useState } from "react";
import "./PresetManager.scss";

const PresetManager = (props) => {
    const [cur_preset, setCurPreset] = useState("wheat")
    const stable_presets = ["wheat", "beet", "sunflower", "potato"]
    const [cur_preset_obj, setCurPresetObj] = useState({
        alt: 0,
        key: "",
        line_spacing: 0,
        liters_per_hectar: 0,
        mode: "",
        name: "",
        speed: 0
    })
    const topics = [
        {key: "name", name: "Имя шаблона", type: "text"},
        {key: "line_spacing", name: "Расстояние между линиями", type: "number", min: 1, max: 10, step: 1, units: "м"},
        {key: "speed", name: "Скорость перемещения", type: "number", min: 0.1, max: 30, step: 0.1, units: "м/с"},
        {key: "alt", name: "Высота полета", type: "number", min: 1, max: 10, step: 0.1, units: "м"},
        {key: "mode", name: "Режим опрыскивателя", type: "select", option_names: ["Струя", "Спрей"], option_values: ["jet", "spray"]},
        {key: "liters_per_hectar", name: "Литров на гектар", type: "number", min: 1, max: 300, step: 1, units: "л/га"},
    ]

    useEffect(() => {
        let cur_preset_obj = null
        props.presets.forEach(preset => {
            if (preset.key === cur_preset){ cur_preset_obj = preset }
        })
        setCurPresetObj(cur_preset_obj)
    }, [props.presets, cur_preset])

    const changeParams = (key, value, type) => {
        let cur_preset_obj_new = {...cur_preset_obj}
        if (type === "number"){
            cur_preset_obj_new[key] = Number(value)
        }else{
            cur_preset_obj_new[key] = value 
        }
        setCurPresetObj(cur_preset_obj_new)
    }

    const deletePreset = () => {
        props.deletePreset(cur_preset_obj.key)
        setCurPreset("wheat")
    }

    return <div className="preset_manager">
        <button className="close" onClick={() => {props.setPrManActive(false)}}/>
        <div className="title"><p>Шаблоны опрыскивания</p></div>
        <ul className="preset_nav">
            {props.presets.map((item, index) => {
                return <li key={index} className={(cur_preset===item.key)?"active":""} onClick={() => {setCurPreset(item.key)}}>
                    <p>{item.name}</p>
                </li>
            })}
            <li className="add" onClick={props.addPreset}>
                <p>Добавить</p>
            </li>
        </ul>
        <div className="preset_descr">
            {topics.map((topic, index) => {
                if (topic.type==="text"){
                    return <div className="preset_item" key={index}>
                        <p>{index+1}.   {topic.name}</p>
                        {(stable_presets.includes(cur_preset_obj.key)===true)?
                            <p className="field">{cur_preset_obj[topic.key]}</p>:
                            <input type={topic.type}
                                value={cur_preset_obj[topic.key]}
                                onChange={(e) => {changeParams(topic.key, e.target.value, topic.type)}}
                            />
                        }
                    </div>
                }else if (topic.type === "number"){
                    return <div className="preset_item" key={index}>
                        <p>{index+1}.    {topic.name}</p>
                        {(stable_presets.includes(cur_preset_obj.key)===true)?
                            <p className="field">{cur_preset_obj[topic.key]}</p>:
                            <input type={topic.type}
                                value={cur_preset_obj[topic.key]}
                                min={topic.min}
                                max={topic.max}
                                step={topic.step}
                                onChange={(e) => {changeParams(topic.key, e.target.value, topic.type)}}
                            />
                        }
                        <p>{topic.units}</p>
                    </div>
                }else if (topic.type === "select"){
                    return <div className="preset_item" key={index}>
                        <p>{index+1}.   {topic.name}</p>
                        {(stable_presets.includes(cur_preset_obj.key)===true)?
                            <p className="field">{cur_preset_obj[topic.key]}</p>:
                            <select onChange={(e) => {changeParams(topic.key, e.target.value, topic.type)}}>
                                {topic.option_values.map((option, index) => {
                                    return <option key={index} value={option}>{topic.option_names[index]}</option>
                                })}
                            </select>
                        }
                    </div>
                }
            })}
            {(stable_presets.includes(cur_preset_obj.key)===false)?
                <button className="save_preset" onClick={() => {props.savePreset(cur_preset_obj)}}>Сохранить</button>:""
            }
            {(stable_presets.includes(cur_preset_obj.key)===false)?
                <button className="save_preset" onClick={() => {deletePreset()}}>Удалить</button>:""
            }
        </div>
    </div>
}
export default PresetManager