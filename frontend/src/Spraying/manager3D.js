// import waypointIcon from '../RouteConstructor/BRM/Waypoint/icon_map_waypoint.png';

import { lineChunk, lineString, lineIntersect, lineSlice, length, point, polygon } from '@turf/turf'
function getIntersectAlt(l1, l2, l3) {
    if(l1[0] != l2[0]){
        let line1 = lineString([
            [l1[0], l1[2]],
            [l2[0], l2[2]]
        ])
        let line2 = lineString([
            [l3[0], 0],
            [l3[0], Math.max(l1[2], l2[2])]
        ])
        let intersects = lineIntersect(line1, line2)
        return intersects.features[0].geometry.coordinates[1]
    }
    else if(l1[1] != l2[1]){
        let line1 = lineString([
            [l1[1], l1[2]],
            [l2[1], l2[2]]
        ])
        let line2 = lineString([
            [l3[1], 0],
            [l3[1], Math.max(l1[2], l2[2])]
        ])
        let intersects = lineIntersect(line1, line2)
        return intersects.features[0].geometry.coordinates[1]
    }
}

function calcDistance(point1, point2) {
    var line = {
        "type": "FeatureCollection",
        "features": [
          {
            "type": "Feature",
            "properties": {},
            "geometry": {
              "type": "LineString",
              "coordinates": [
                point1, 
                point2
              ]
            }
          }
        ]
      };
      
      var start = {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": point1
        }
      };
      var stop = {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": point2
        }
      };
      return length(lineSlice(start, stop, line.features[0]), {units: 'meters'})
}
function segmentateLine(point1, point2, segmentProcent, manager3D, flag=false) {
    let pwa1 = [
        point1[0],
        point1[1]
    ]
    let pwa2 = [
        point2[0],
        point2[1]
    ]

    let distance = calcDistance(
        pwa1, 
        pwa2
        )
    let interval = 0;
    if(flag){
        interval = 1/1000
    }
    else{
        interval = distance/1000*(segmentProcent/100)
    }
    let cords = []
    let cords_AMS = []

    cords.push(point2)
    cords_AMS.push([
        point2[0],
        point2[1],
        point2[2]+manager3D.getAMS({
            lng:point2[0],
            lat:point2[1]
        })
    ])

    return {
        cords:cords,
        cords_AMS:cords_AMS
    }
}

export class SprayManager3d{
    constructor(manager3d){
        this.manager3d = manager3d;
        this.objects = [];
        this.sphereArr = [];
        this.routeLine = null;
        this.changeMode = this.changeMode.bind(this);
        this.last_id = 0
        this.shift = null
    }

    addSphere(coords, id){
        let sphereOptions = this.manager3d.getMeshOptions("sphere_1")
        let pointSphere = window.tb.sphere(sphereOptions)
        let alt_ams = this.manager3d.getAMS({
            lng:coords[0],
            lat:coords[1]
        })
        if (alt_ams===null){alt_ams=0}
        pointSphere.setCoords([
            coords[0],
            coords[1], 
            coords[2]+alt_ams
        ])

        let sphereObject = {
            object: pointSphere,
            id: id,
            baseCoords: coords
        }
        
        window.tb.add(pointSphere)
        this.objects.push(pointSphere)
        this.sphereArr.push(sphereObject)

        this.manager3d.map.setZoom(this.manager3d.map.getZoom())
    }

    getCoordArr(route){
        let currentNode = route.head
        let coordArr = [] 
        while (currentNode != route.tail){
            currentNode = currentNode.next 
            if(currentNode == route.head.next){
                coordArr.push([
                    currentNode.params.lng.value,
                    currentNode.params.lat.value,
                    0
                ])
            }

            if (currentNode.params.module.name == "Polygon"){
                for (let coord of currentNode.params.markup.value){
                    coordArr.push([
                        coord[0], 
                        coord[1], 
                        Number(currentNode.params.alt.value)
                    ])
                }
            }else if (currentNode.params.module.name == "RTL"){
             coordArr.push(coordArr[1])
             coordArr.push(coordArr[0])
            }else{
                coordArr.push([
                    currentNode.params.lng.value,
                    currentNode.params.lat.value,
                    Number(currentNode.params.alt.value)
                ])
            }
            if(currentNode.params.module.name == "Land"){
                coordArr.push([
                    currentNode.params.lng.value,
                    currentNode.params.lat.value,
                    0
                ])
            }
        }
        this.route = route
        return coordArr
    }

    updateLineGeometry(coord_arr){
        if (this.routeLine){
            let cords_AMS = []
            for (let item in coord_arr){
                if (item < coord_arr.length-1){
                    if(coord_arr[item][2] == 0){
                        cords_AMS.push([
                            coord_arr[item][0],
                            coord_arr[item][1],
                            this.manager3d.getAMS({
                                lng:coord_arr[item][0],
                                lat:coord_arr[item][1]
                            })
                        ])
                    }
                    else if(coord_arr[Number(item)+1][2] == 0){
                        cords_AMS.push([
                            coord_arr[Number(item)+1][0],
                            coord_arr[Number(item)+1][1],
                            this.manager3d.getAMS({
                                lng:coord_arr[Number(item)+1][0],
                                lat:coord_arr[Number(item)+1][1]
                            })
                        ])
                    }
                    else if(coord_arr[item][2] != 0 && coord_arr[Number(item)+1][2] != 0){
                        let segmCoords = segmentateLine(coord_arr[item], coord_arr[Number(item)+1], 10, this.manager3d)
                        cords_AMS = cords_AMS.concat(segmCoords.cords_AMS)
                    }
                }
            }
            this.routeLine.setGeometry_(cords_AMS, this.routeLine)
        }
    }

    unitSpheres(coord_arr){
        if (this.routeLine){
            window.tb.remove(this.routeLine)
            for (let i in this.objects){
                if (this.objects[i] == this.routeLine){
                    this.objects.splice(i, 1)
                }
            }
        }
        if (coord_arr.length > 1){
            let cords_AMS = []
            coord_arr = coord_arr.map(coord => {
                let alt = this.manager3d.getAMS({lng:coord[0], lat:coord[1]})
                if (alt===null){alt=0}
                return [coord[0], coord[1], coord[2]+alt]
            })
            for (let index=0; index<=coord_arr.length-2; index++){
                let segmCoords = segmentateLine(coord_arr[index], coord_arr[index+1], 10, this.manager3d)
                cords_AMS = cords_AMS.concat(segmCoords.cords_AMS)
            }
            cords_AMS.unshift(coord_arr[0])
            let routeLineOptions = this.manager3d.getMeshOptions("line_1")
            routeLineOptions.geometry = cords_AMS
            this.routeLine = window.tb.line(routeLineOptions)
            window.tb.add(this.routeLine, "custom-layer")
            this.objects.push(this.routeLine)
        }
    }

    changeAlt(value, id, route){
        let sphereCoords = []
        for (let sphere of this.sphereArr){
            if (sphere.id == id){
                sphere.object.setCoords([
                    sphere.object.coordinates[0], 
                    sphere.object.coordinates[1], 
                    Number(value)+this.manager3d.getAMS({
                        lng: sphere.object.coordinates[0],
                        lat: sphere.object.coordinates[1]
                    })])
                sphereCoords.push([sphere.object.coordinates[0], sphere.object.coordinates[1]])
                sphere.baseCoords[2] = Number(value)
            }
        }
        this.updateLineGeometry(route)
    }
    changeCoords(id, coords){
        this.sphereArr.forEach(sphere => {
            if (sphere.id === id){
                let alt = this.manager3d.getAMS({lng:coords[0], lat:coords[1]})
                sphere.object.setCoords([coords[0], coords[1], coords[2]+alt])
            }
        })
    }
    clearTb(deleteAll = false){
        for (let object of this.objects){
            window.tb.remove(object)
        };
        this.idSphereArr = []
        this.routeLine = null;
        this.sphereArr = []
        this.objects = []
        if (deleteAll){
            this.map.removeLayer('custom_layer')
        }
    }
    deleteObject(id){
        for (let element of this.sphereArr){
            if (element.id == id){
                window.tb.remove(element.object)
            }
        }
    }
    deletePolygon(){
        this.sphereArr.forEach(item => {
            if (item.id !== 0){window.tb.remove(item.object)}
        })
        window.tb.remove(this.routeLine)
        window.tb.remove(this.shift)
    }
    drawShiftPolygon(coord_arr){
        if (this.shift){
            window.tb.remove(this.shift)
            for (let i in this.objects){
                if (this.objects[i] == this.routeLine){
                    this.objects.splice(i, 1)
                }
            }
        }
        if (coord_arr.length > 1){
            let cords_AMS = []
            coord_arr = coord_arr.map(coord => {
                let alt = this.manager3d.getAMS({lng:coord[0], lat:coord[1]})
                if (alt===null){alt=0}
                return [coord[0], coord[1], 0+alt]
            })
            for (let index=0; index<=coord_arr.length-2; index++){
                let segmCoords = segmentateLine(coord_arr[index], coord_arr[index+1], 10, this.manager3d)
                cords_AMS = cords_AMS.concat(segmCoords.cords_AMS)
            }
            cords_AMS.unshift(coord_arr[0])
            cords_AMS.push(coord_arr[0])
            let line_options = this.manager3d.getMeshOptions("line_2")
            line_options.geometry = cords_AMS
            this.shift = window.tb.line(line_options)
            window.tb.add(this.shift, "custom-layer")
            this.objects.push(this.shift)
            this.objects[0].set({})
        }
    }
    changeMode(){
        for (let id in this.sphereArr){
            let z = [
                this.sphereArr[id].baseCoords[0],
                this.sphereArr[id].baseCoords[1],
                this.sphereArr[id].baseCoords[2]+this.manager3d.getAMS({
                    lng:this.sphereArr[id].baseCoords[0],
                    lat:this.sphereArr[id].baseCoords[1]
                })
            ]
            this.sphereArr[id].object.setCoords(z)
        }
        if (this.route){
            this.unitSpheres(this.route)
        }
    }
    changeScale(){
        
    }
}
