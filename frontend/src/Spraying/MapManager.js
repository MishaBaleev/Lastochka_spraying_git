import takeoff_marker from "./img/takeoff_marker.png";
import point_marker from "./img/point_marker.png";
import icon_center from "./img/icon_center.png";
import mapboxgl from 'mapbox-gl';
import { SprayManager3d } from "./manager3D";
import { center } from "@turf/turf";

function rotateFigureCenter(cords, center, phi){
    phi = phi*Math.PI/180
    let rotatedFigure = []
    for(let pair of cords){
      let x = pair[0]-center[0]
      let y = pair[1]-center[1]
      let x_rot = x*Math.cos(phi) - y*Math.sin(phi)
      let y_rot = x*Math.sin(phi) + y*Math.cos(phi)
      rotatedFigure.push([
        x_rot+center[0], y_rot+center[1]
      ])
    }
    return rotatedFigure
}

function addTurnaroundDistance(cords, distance, direction){
  let turnaround_distance_y = getGeoCordsFromMeters(distance, cords[1])
  let cortej = []
  if(direction == true){
    cortej = [cords[0], cords[1]+turnaround_distance_y]
  }
  else{
    cortej = [cords[0], cords[1]-turnaround_distance_y]
  }
  return cortej
}

function getProjective(cords){
  let x = cords.map(x=>x[0])
  let y = cords.map(x=>x[1])

  let x_projection = {
      min:0,
      max:0,
      pr:0
  }
  let y_projection = {
      min:0,
      max:0,
      pr:0
  }

  x_projection.min = Math.min(...x)
  x_projection.max = Math.max(...x)
  x_projection.pr = x_projection.max - x_projection.min
  
  y_projection.min = Math.min(...y)
  y_projection.max = Math.max(...y)
  y_projection.pr = y_projection.max - y_projection.min

  return {x_pr:x_projection, y_pr:y_projection}
}

function getGeoCordsFromMeters(m, min_lng){
  let step = m/1000
  const km_ekv = 40075.696/360
  let step_deg = step/(km_ekv*Math.cos(Math.PI*min_lng/180))
  return step_deg
}

export class MapManager{
  constructor(map, manager3D, update_modal_message, default_){
    this.map = map 
    this.manager3D = new SprayManager3d(manager3D)
    this.translate_cursor = false 
    this.start_marker = null
    this.update_modal_message = update_modal_message
    this.last_id = 0
    this.params = {
      angle: 0,
      line_distance: 3,
      turnaround_distance: 0,
      reverse: false,
      is_rtl: true,
      alt: 3.5,
      wind_speed: 2,
      wind_direction: "N"
    }

    this.conture = {
        markers:[],
        cords:[],
        edges:[],
        source:{
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'geometry': {
            'type': 'Polygon',
            'coordinates': [
                []
              ]
            }
          }
        },
        layer_area:{
          'id': "area_conture",
          'type': 'fill',
          'source': "conture",
          'layout': {},
          'paint': {
            'fill-color': '#008000',
            'fill-opacity': 0.5
            }
          },
        layer_line:{
            'id': 'line_conture',
            'type': 'line',
            'source': "conture",
            'layout': {},
            'paint': {
              'line-color': '#000',
              'line-width': 2
            }
        }
    }
    this.markup = {
        cords:[],
        source:{
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'geometry': {
            'type': 'LineString',
            'coordinates': [
                []
              ]
            }
          }
        },
        layer:{
          'id': "markup",
          'type': 'line',
          'source': "markup",
          'layout': {},
          'paint': {
          'line-color': '#fff',
          'line-width': 2
          }
        }
    };
  }

  calcPerpendVector(lat1, lon1, lat2, lon2){
    let dx = lon2 - lon1;
    let dy = lat2 - lat1;
    let perpDx = -dy;
    let perpDy = dx;
    let length = Math.sqrt(perpDx * perpDx + perpDy * perpDy);
    perpDx /= length;
    perpDy /= length;
    return { perpDx, perpDy };
  }
  meters2degrees(meters, lat){
    let degreesPerMeter = 1 / (111320 * Math.cos(lat * Math.PI / 180));
    return meters * degreesPerMeter;
  }
  getRealSpray(is_update){
    let stripPoints = [];
    let base_width = 2 * 0.26315789
    // let width = 2 * this.params.alt * Math.tan(120)
    let width = 2 * 0.26315789 * this.params.alt
    let opacity = base_width/width <= 1 ? base_width/width : 1 
    if (width >= this.params.line_distance*1.1){width = this.params.line_distance*1.1}
    for (let i = 0; i < this.markup.cords.length - 1; i++) {
        let [lat1, lon1] = this.markup.cords[i];
        let [lat2, lon2] = this.markup.cords[i + 1];
        let { perpDx, perpDy } = this.calcPerpendVector(lat1, lon1, lat2, lon2);
        let halfWidthDegrees = this.meters2degrees(width / 2, lat1);
        let leftLat1 = lat1 + perpDy * halfWidthDegrees;
        let leftLon1 = lon1 + perpDx * halfWidthDegrees;
        let rightLat1 = lat1 - perpDy * halfWidthDegrees;
        let rightLon1 = lon1 - perpDx * halfWidthDegrees;
        let leftLat2 = lat2 + perpDy * halfWidthDegrees;
        let leftLon2 = lon2 + perpDx * halfWidthDegrees;
        let rightLat2 = lat2 - perpDy * halfWidthDegrees;
        let rightLon2 = lon2 - perpDx * halfWidthDegrees;
        stripPoints.push({
          left_first: [leftLat1, leftLon1],
          left_second: [leftLat2, leftLon2],
          right_first: [rightLat1, rightLon1],
          right_second: [rightLat2, rightLon2]
        })
    }
    
    let real_spray = []
    stripPoints.forEach(item => {
      real_spray.push(item.left_first)
      real_spray.push(item.left_second)
    })
    stripPoints.reverse().forEach(item => {
      real_spray.push(item.right_second)
      real_spray.push(item.right_first)
    })

    let shift_real_spray = this.getShift(real_spray)

    if (is_update === true){
      let geojson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {"name": "sector"},
            "geometry": {
                "type": "Polygon",
                "coordinates": [shift_real_spray]
            }
        }]
      }
      this.map.getSource("real_spray").setData(geojson)
      this.map.setPaintProperty("real_spray_layer", "fill-opacity", opacity)
    }else{
      if (this.map.getSource("real_spray")){
        this.map.removeLayer("real_spray_layer")
        this.map.removeSource("real_spray")
      }
      let geojson = {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            // These coordinates outline Maine.
            coordinates: [shift_real_spray]
          }
        }
      }
      this.map.addSource("real_spray", geojson)
      this.map.addLayer({
        "id": "real_spray_layer",
        "type": "fill",
        "source": "real_spray",
        "layout": {},
        "paint": {
            "fill-color": "#02d402",
            "fill-opacity": opacity
        }
      })
    }
  }

  getShift(base_coords){
    const directions = {"N": [0, -1], "NE": [-Math.sqrt(2)/2,-Math.sqrt(2)/2], "E": [-1, 0], "SE": [-Math.sqrt(2)/2, Math.sqrt(2)/2], "S": [0,1], "SW": [Math.sqrt(2)/2,Math.sqrt(2)/2], "W": [1,0], "NW": [Math.sqrt(2)/2,-Math.sqrt(2)/2]}
    const radius = 6378160
    let wind_speed = Number(this.params.wind_speed)
    let alt = Number(this.params.alt)
    let wind_direction = directions[this.params.wind_direction]
    let coord_arr = []
    base_coords.forEach(coord => {
      let coord_x = coord[0]
      let coord_y = coord[1]
      let delta_x = 100*wind_speed*Math.sqrt(2*alt/9.81)*wind_direction[0]
      let delta_y = 100*wind_speed*Math.sqrt(2*alt/9.81)*wind_direction[1]
      let new_coord_x = coord_x + delta_x/radius
      let new_coord_y = coord_y + delta_y/radius
      coord_arr.push([new_coord_x, new_coord_y])
    })
    return coord_arr
  }
  getZoneShift(){
    let conture = []
    this.conture.markers.forEach(marker => {
      conture.push([marker.getLngLat().lng, marker.getLngLat().lat])
    })
    let coord_arr = this.getShift(conture)
    if (this.conture.markers.length >= 3){
      this.getRealSpray(true)
      this.manager3D.drawShiftPolygon(coord_arr)
    }
  }

  toggleCursor(){
    if (this.translate_cursor === true){
      this.translate_cursor = false 
    }else{
      this.translate_cursor = true
    }
  }

  setStartMarker(coords){
    if (this.start_marker === null){
      this.start_marker = new mapboxgl.Marker({draggable: false}).setLngLat(coords).addTo(this.map)
      let icon = document.createElement('img');
      icon.src = takeoff_marker;
      icon.width = 35
      icon.height = 35
      this.start_marker.getElement().querySelector("svg").remove()
      this.start_marker.getElement().append(icon)
      let indicator = document.createElement('span');
      indicator.className = "mapbox_gl_active_indicator"
      this.start_marker.getElement().append(indicator)
      this.start_marker.getElement().classList.add("takeoff")
      this.manager3D.addSphere([coords[0], coords[1], 0], 0)
      this.last_id += 1
    }else{
      this.start_marker.remove()
      this.start_marker = null
      this.setStartMarker(coords)
      this.manager3D.deleteObject(0)
      this.manager3D.addSphere([coords[0], coords[1], 0], 0)
    }
    this.updateRouteLine()
  }

  changeMarkerIcon(marker, Icon, width, height) {
    let icon = document.createElement('img');
    icon.src = Icon;
    icon.width = width
    icon.height = height
    marker.getElement().classList.add("mapboxgl-marker__polygon")
    marker.getElement().querySelector("svg").remove()
    marker.getElement().append(icon)
    let indicator = document.createElement('span');
    indicator.className = "mapbox_gl_active_indicator"
    marker.getElement().append(indicator)
  }

  rotatePolygon(angle){ ///real rotate
    this.params.angle = Number(angle)
    if (this.conture.cords.length != 0){
      this.updateCenterMarker()
      this.updateMarkup()
      this.getRealSpray(true)
    }
  }
  changeLineSpacing(dist){
    this.params.line_distance = Number(dist)
    if (this.conture.cords.length != 0){
      this.updateCenterMarker()
      this.updateMarkup()
      this.getRealSpray(true)
    }
  }
  toggleRTL(){
    if (this.params.is_rtl === true){
      this.params.is_rtl = false
    }else{
      this.params.is_rtl = true 
    }
    if (this.conture.markers.length != 0){
      this.updateCenterMarker()
      this.updateMarkup()
    }
  }
  changeAlt(alt){
    this.params.alt = Number(alt) 
    if (this.conture.cords.length != 0){
      this.updateCenterMarker()
      this.updateMarkup()
      this.conture.markers.forEach(marker => {
        this.manager3D.changeCoords(marker.id, [marker.getLngLat().lng, marker.getLngLat().lat, this.params.alt])
      })
      this.getRealSpray(true)
    }
  }
  changeWind(key, value){
    this.params[key] = value 
    this.getZoneShift()
  }

  markupPolygon(){
    let edges = []
    let cords_markup = this.rotate(this.conture.cords, 1)
    for(let c = 0; c < this.conture.cords.length-1; c++){
      edges.push([cords_markup[c], cords_markup[c+1]])
    }
    let pr = getProjective(cords_markup)
    let step = getGeoCordsFromMeters(this.params.line_distance, pr.y_pr.min)
    let steps = Math.trunc(pr.x_pr.pr/step)
    let cords = []
    for(let i = 0; i < steps; i++){
      let x_0 = pr.x_pr.min+step*(i+1)
      let crossings = []
      let low = [1000, null];
      let high = [-1000, null];
      for(let j = 0; j < edges.length; j++){
          let A = edges[j][0]
          let B = edges[j][1]
          let y = (B[1]-A[1])*(x_0-B[0])/(B[0]-A[0])+B[1]
          let min_y = Math.min(A[1],B[1])
          let max_y = Math.max(A[1],B[1])
          if(y>min_y && y< max_y){
            if(y>high[0]){
              high[0] = y
              high[1] = [x_0, y]
            }
            else if(y<low[0]){
              low[0] = y
              low[1] = [x_0, y]
            }
            crossings.push([x_0, y])
          }
      }
      crossings = crossings.sort(function(a, b){return a[1]-b[1]})

      low[1] = crossings[0]
      high[1] = crossings[crossings.length-1]

      low[1] = addTurnaroundDistance(low[1], this.params.turnaround_distance, false)
      high[1] = addTurnaroundDistance(high[1], this.params.turnaround_distance, true)
      if((cords.length+2)%4 == 0){
        cords.push(low[1])
        cords.push(high[1])
      }
      else{
        cords.push(high[1])
        cords.push(low[1])
      }
    }
    cords = this.rotate(cords, -1)
    if (cords.length == 0){
      return this.conture.cords
    }else{
      cords = cords.map(cord => {return [cord[0], cord[1], this.params.alt]})
      return cords
    }
  }

  addConturePoint(coords){
      let cords = coords;
      let marker = new mapboxgl.Marker(
          {
              draggable: true
          }
      ).setLngLat(cords).addTo(this.map);
      marker.conture_index = this.conture.markers.length;
      marker.id = this.last_id
      this.conture.markers.push(marker)
      let dragContainer = (e) => {e.marker = marker; e.evt = {}; e.id=marker.id; this.drag(e)}
      let dragEndContainer = (e) => {e.evt = {}; this.dragEndCont(e)}
      let dragStartContainer = (e) => {e.evt = {}; this.dragStartCont(e)}
      marker.on("drag", dragContainer)
      marker.on("dragend", dragEndContainer)
      marker.on("dragstart", dragStartContainer)
      this.changeMarkerIcon(marker, point_marker, 35, 35)
      if(this.conture.markers.length == 1){
        this.conture.cords.push(cords)
        this.conture.cords.push(cords)
        this.conture.source.data.geometry.coordinates = [this.conture.cords]
        this.map.addSource("conture", this.conture.source)
        // this.map.addLayer(this.conture.layer_area)
        this.map.addLayer(this.conture.layer_line)
      }
      if(this.conture.markers.length > 1){
          this.conture.cords.pop()
          this.conture.cords.push(cords)
          this.conture.cords.push(this.conture.cords[0])
          this.conture.source.data.geometry.coordinates = [this.conture.cords]
          this.map.getSource("conture").setData(this.conture.source.data)
      }
      if(this.conture.markers.length == 3){
        this.center_marker = new mapboxgl.Marker({
          draggable:true
        })
        this.changeMarkerIcon(this.center_marker, icon_center, 25, 25)
        let cords = [0,0]
        for(let c = 0; c < this.conture.cords.length-1; c++){
          cords[0] += this.conture.cords[c][0]
          cords[1] += this.conture.cords[c][1]
        }
        cords = [cords[0]/(this.conture.cords.length-1), cords[1]/(this.conture.cords.length-1)]
        this.center_marker.setLngLat(cords).addTo(this.map);

        this.container__dragStartCenterMarker = (e) => {e.mapElement = this; e.marker = this.center_marker; e.evt = this.data; this.dragStartCenterMarker(e)}
        this.container__dragCenterMarker = (e) => {e.mapElement = this; e.marker = this.center_marker; e.evt = this.data; this.dragCenterMarker(e)}
        this.container__dragEndStartCenterMarker = (e) => {e.mapElement = this; e.marker = this.center_marker; e.evt = this.data; this.dragEndStartCenterMarker(e)}
    
        this.center_marker.on("dragstart", this.container__dragStartCenterMarker)
        this.center_marker.on("drag", this.container__dragCenterMarker)
        this.center_marker.on("dragend", this.container__dragEndStartCenterMarker)
        let cords_markup = this.markupPolygon()
        this.markup.cords = cords_markup
      }
      if (this.conture.markers.length >= 3){
        let cords_markup = this.markupPolygon()
        this.markup.cords = cords_markup
        this.updateRouteLine()
      }

    ///add sphere
    this.manager3D.addSphere([coords[0], coords[1], this.params.alt], marker.id)
    this.last_id += 1
    this.getRealSpray(false)
  }

  rotate(cords, factor){
    let centerCords = this.center_marker.getLngLat()
    centerCords = [centerCords.lng, centerCords.lat]
    let rotated_cords = rotateFigureCenter(cords, centerCords, factor*this.params.angle)
    return rotated_cords
  }
  isValid(){
    let edges = []
    let cords_markup = this.rotate(this.conture.cords, 1)
    for(let c = 0; c < this.conture.cords.length-1; c++){
      edges.push([cords_markup[c], cords_markup[c+1]])
    }
    let pr = getProjective(cords_markup)
    let step = getGeoCordsFromMeters(this.params.line_distance, pr.y_pr.min)
    let steps = Math.trunc(pr.x_pr.pr/step)
    if(1 > steps) return false
    else return true
  }

  updateMarkup(){
    this.markup.cords = this.markupPolygon()
    this.markup.source.data.geometry.coordinates = this.markup.cords
    this.updateRouteLine()
  }

  updatePolygonPosition(){
    this.conture.source.data.geometry.coordinates = [this.conture.cords]
    this.map.getSource("conture").setData(this.conture.source.data)
    this.updateMarkup()
  }

  dragStartCenterMarker(e){
    // e.evt.route.tbManager.resetCollisionObjects()
    let center_cords = e.marker.getLngLat()
    e.marker.diff = []
    for(let cords of this.conture.cords){
      e.marker.diff.push(
        [cords[0]-center_cords.lng, cords[1]-center_cords.lat]
      )
    }
  }
  dragCenterMarker(e){
    let center_cords = e.marker.getLngLat()
    for(let c = 0; c < this.conture.markers.length; c++){
      let changed_cords = [e.marker.diff[c][0]+center_cords.lng, e.marker.diff[c][1]+center_cords.lat]
      this.conture.cords[c] = changed_cords
      if(c == 0){
        this.conture.cords[this.conture.cords.length-1] = changed_cords
      }
      this.conture.markers[c].setLngLat(changed_cords)
    }
    this.conture.markers.forEach(marker => {
      this.manager3D.changeCoords(marker.id, [marker.getLngLat().lng, marker.getLngLat().lat, this.params.alt])
    })
    // this.manager3D.changeSphereCoords(0, 0)
    // this.conture.cords.slice(0, this.conture.cords.length-1).forEach((cords, index) => {
    //   this.manager3D.sphereArr[index+1].object.setCoords(cords)
    // })
    this.updatePolygonPosition()
    this.updateMarkup()
    this.getRealSpray(true)
  }
  dragEndStartCenterMarker(e){
    e.marker.diff = []
  }
  drag(e){
    let cords = e.marker.getLngLat()
    let before_cords = this.conture.cords[e.marker.conture_index]
    this.conture.cords[e.marker.conture_index] = [cords.lng, cords.lat]
    if(!this.isValid()){
      this.conture.cords[e.marker.conture_index] = before_cords
      e.marker.setLngLat(before_cords)
      return
    }

    this.conture.cords[e.marker.conture_index] = [cords.lng, cords.lat]
    if(e.marker.conture_index == 0){
      this.conture.cords[this.conture.cords.length-1] = [cords.lng, cords.lat]
    }
    this.conture.source.data.geometry.coordinates = [this.conture.cords]
    this.map.getSource("conture").setData(this.conture.source.data)
    this.updateCenterMarker()
    this.updateMarkup()

    //change coords of sphere
    this.manager3D.changeCoords(e.id, [cords.lng, cords.lat, this.params.alt])
    this.getRealSpray(true)
  }
  dragStartCont(e){
    
  }
  dragEndCont(e){
    
  }
  dragEnd(e){
    
  }

  updateCenterMarker(){
    let cords = [0,0]
    for(let c = 0; c < this.conture.cords.length-1; c++){
      cords[0] += this.conture.cords[c][0]
      cords[1] += this.conture.cords[c][1]
    }
    cords = [cords[0]/(this.conture.cords.length-1), cords[1]/(this.conture.cords.length-1)]
    this.center_marker.setLngLat(cords)
  }

  updateRouteLine(){
    this.getZoneShift()
    let route = []
    if (this.params.is_rtl === true){
      route = [[this.start_marker.getLngLat().lng, this.start_marker.getLngLat().lat, 0]].concat(this.markup.cords).concat([[this.start_marker.getLngLat().lng, this.start_marker.getLngLat().lat, 0]])
    }else{
      route = [[this.start_marker.getLngLat().lng, this.start_marker.getLngLat().lat, 0]].concat(this.markup.cords)
    }   
    if (this.conture.markers.length >= 3){
      this.manager3D.unitSpheres(route)
      this.manager3D.sphereArr[0].object.set({})
    }
  }

  setPolygon(coords){
    if (this.start_marker === null){
      this.update_modal_message({active: true, heading: "Ошибка", message: "Сначала добавьте точку старта"})
    }else{
      this.addConturePoint(coords)
    }
  }
  deletePolygon(){
    if (this.map.getSource("conture")){
      this.map.removeLayer("line_conture")
      this.map.removeSource("conture")  
      this.conture.markers.forEach(marker => {
        marker.remove()
      })
      this.center_marker.remove()
      this.manager3D.deletePolygon()
    }
    this.conture = {
      markers:[],
      cords:[],
      edges:[],
      source:{
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
          'type': 'Polygon',
          'coordinates': [
              []
            ]
          }
        }
      },
      layer_line:{
          'id': 'line_conture',
          'type': 'line',
          'source': "conture",
          'layout': {},
          'paint': {
          'line-color': '#000',
          'line-width': 2
          }
      }
    }
    this.markup = {
        cords:[],
        source:{
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'geometry': {
            'type': 'LineString',
            'coordinates': [
                []
              ]
            }
          }
        },
        layer:{
          'id': "markup",
          'type': 'line',
          'source': "markup",
          'layout': {},
          'paint': {
          'line-color': '#fff',
          'line-width': 2
          }
        }
    }
  }
}