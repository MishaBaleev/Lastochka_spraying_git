export class sprayManager{
    checkWheather(wheather) {
        let hum = Number(wheather.humidity)
        let temp = Number(wheather.temperature)
        let wind = Number(wheather.wind_speed)
        let adjuvants = wheather.adjuvants
        let max_wind = (adjuvants===true)?8:5
        const temp_hum_table = {
            90: {good: [10, 33], middle: [33, 36], bad: [36, 80]},
            80: {good: [10, 33], middle: [33, 36], bad: [36, 60]},
            70: {good: [10, 33], middle: [33, 36], bad: [36, 80]},
            60: {good: [10, 27], middle: [27, 36], bad: [36, 80]},
            50: {good: [], middle: [18, 30], bad: [30, 80]},
            40: {good: [], middle: [18, 24], bad: [24, 80]},
            30: {good: [], middle: [18, 24], bad: [24, 80]},
        }
        if (wind <= max_wind){
            let hum_values = temp_hum_table[hum]
            let result = "undef"
            Object.keys(hum_values).forEach(key => {
                let range = hum_values[key]
                if (temp >= range[0] && temp < range[1]){
                    result = key
                }
            })
            return result
        }else{
            return "bad"
        }
    }

}