import mapboxgl from 'mapbox-gl';

class MapManager{
  constructor(){
    if(!localStorage.getItem('map_zoom')){
      localStorage.setItem('map_zoom', JSON.stringify(5));
    }
    console.log(localStorage.getItem('map_center'))
    if(!localStorage.getItem('map_center')){
      localStorage.setItem('map_center', JSON.stringify([0, 0]));
    }

    if(!localStorage.getItem('map_pitch')){
      localStorage.setItem('map_pitch', JSON.stringify(0));
    }
    this.map = null
    this.createMap = this.createMap.bind(this);
  }
  createMap(layers, settings, mapContainer){
    let [style, lazy_layers] = this.buildStyle(layers, settings)
    let map = new Map({
      container: mapContainer,
      style: style, //'mapbox://styles/mapbox/satellite-streets-v11',
      center: JSON.parse(localStorage.getItem('map_center')),//[38.782723, 47.327716],
      // zoom: 14,
      zoom: parseInt(localStorage.getItem('map_zoom')),
      pitch: JSON.parse(localStorage.getItem('map_pitch')),
      preserveDrawingBuffer: true,
      // maxZoom: 16.5,
      antialias: true,
      });
    map.on("idle", () => {
      map.resize()
    })
    map.on('style.load', () => {
      // console.log(lazy_layers)
      for(let layer_id in lazy_layers){
        // рельеф
        if(layer_id == 6){
          if(lazy_layers[layer_id].layer.active == "active"){
            map.setTerrain({ 'source': lazy_layers[layer_id].id, 'exaggeration': 1 });
          }
        }
        // здания
        else if(layer_id == 8){
          const layers = map.getStyle().layers;
          const labelLayerId = layers.find(
          (layer) => layer.type === 'symbol' && layer.layout['text-field']
          )
          map.addLayer(
            {
            'id': 'add-3d-buildings',
            'source': lazy_layers[layer_id].id,
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': lazy_layers[layer_id].layer.minzoom,
            'maxzoom': lazy_layers[layer_id].layer.maxzoom,
            'paint': {
              'fill-extrusion-color': 
              [
                'case',
                ['boolean', ['feature-state', 'select'], false],
                "red",
                ['boolean', ['feature-state', 'hover'], false],
                "lightblue",
                '#aaa'
              ],
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.8,
            },
            'layout': {
              'visibility': lazy_layers[layer_id].layer.active == "active" ? 'visible' : 'none'
            }
            },
            labelLayerId.id
            )
        }
        // здания
        else if(layer_id == 9){
          console.log(lazy_layers[layer_id].id)
          map.addLayer(
            {
              'id': lazy_layers[layer_id].id,
              'source': lazy_layers[layer_id].id,
              'source-layer': 'trees',
              'filter': ['==', 'extrude', 'true'],
              'type': 'fill-extrusion',
              'minzoom': lazy_layers[layer_id].layer.minzoom,
              'maxzoom': lazy_layers[layer_id].layer.maxzoom,
              'paint': {
                'fill-extrusion-color': 
                [
                  'case',
                  ['boolean', ['feature-state', 'select'], false],
                  "red",
                  ['boolean', ['feature-state', 'hover'], false],
                  "lightblue",
                  '#81e581'
                ],
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'height']
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.8,
              },
            }
          )
        }
      }})

    map.on('dragend', () => {
      localStorage.setItem('map_center', JSON.stringify(map.getCenter()));
      });
    map.on('zoomend', () => {
      localStorage.setItem('map_zoom', JSON.stringify(map.getZoom()));
    });
    map.on('pitchend', () => {
      localStorage.setItem('map_pitch', JSON.stringify(map.getPitch()));
    });
    this.map = map
    return map
  }
  buildStyle(layers, settings){
    let active_source_layers = layers.filter((item, index) => {
          if(item.type == "layer") return item
      }),
      active_source_style = layers.filter((item, index) => {
          if(item.type == "style" && item.active == "active") return item
      })[0],
      layers_3d = layers.filter((item, index) => {
          if(item.dim_type == "3d") return item
      });

    let is_local = parseInt(settings.filter((item) => {
      if(item.id == 4) return item
    })[0].value)
    
    let style = {
      "version": 8,
      "name": "Meteorites",
      "metadata": {
        "mapbox:origin": "basic-template-v1",
        "mapbox:autocomposite": true,
        "mapbox:type": "template",
        "mapbox:sdk-support": {
          "js": "0.45.0",
          "android": "6.0.0",
          "ios": "4.0.0"
        }
      },
      "center": [
        74.24426803763072,
        -2.2507114487818853
      ],
      "zoom": 0.6851443156248076,
      "bearing": 0,
      "pitch": 0,
      "sources": {
        // "global": {
        //   "type": "raster",
        //   "tiles":[],
        //   "tileSize": 256
        // },
        // "local":{
        //   "type": "raster",
        //   "tiles":[],
        //   "tileSize": 256
        // }
      },
      "sprite": "mapbox://sprites/examples/cjikt35x83t1z2rnxpdmjs7y7",
      "glyphs": "mapbox://fonts/{username}/{fontstack}/{range}.pbf",
      "layers": [],
      "created": "2015-10-30T22:18:31.111Z",
      "id": "cjikt35x83t1z2rnxpdmjs7y7",
      "modified": "2015-10-30T22:22:06.077Z",
      "owner": "examples",
      "visibility": "public",
      "draft": false
    }
    // map base layer
    if(is_local){
      style.sources.local = {
          "type": "raster",
          "tiles":[
            window.location.origin+"/media/map_cash/"+active_source_style.label+"/tile_{x}_{y}_{z}.jpg"
          ],
          "tileSize":active_source_style.tileSize
      }
      style.layers.push(
        {
          "id": "local-tiles-layer",
          "type": "raster",
          "source": "local",
          "minzoom": active_source_style.minzoom,
          "maxzoom": active_source_style.maxzoom
        }
      )
    }
    else{
      style.sources.global = {
        type: "raster",
        tiles:active_source_style.tiles,
        tileSize:active_source_style.tileSize
      }
      style.layers.push(
        {
          "id": "global-tiles-layer",
          "type": "raster",
          "source": "global",
          "minzoom": active_source_style.minzoom,
          "maxzoom": active_source_style.maxzoom
        }
      )
    }
    // map adv layers and sources
    let lazy_layers = {}
    // console.log(active_source_layers)
    for(let layer of active_source_layers){
      // рельеф
      if(layer.id == 6){
        let tiles = [];
        if(is_local){
          tiles.push(
            window.location.origin+'/media/map_cash/'+layer.label+'/tile_{x}_{y}_{z}.jpg'
          )
        }
        else{
          tiles = [...layer.tiles]
        }
        style.sources[layer.label+"_"+layer.id] = {
            "type": "raster-dem",
            "tiles":tiles,
            "tileSize":active_source_style.tileSize
          }
        lazy_layers[layer.id] = {
          id:layer.label+"_"+layer.id,
          layer:layer
        }
      }
      // здания
      if(layer.id == 8){
        let tiles = [];
        if(is_local){
          tiles.push(
            window.location.origin+'/media/map_cash/'+layer.label+'/tile_{x}_{y}_{z}.pbf'
          )
        }
        else{
          tiles = [...layer.tiles]
        }
        style.sources[layer.label+"_"+layer.id] = {
          "type": "vector",
          "tiles": tiles
        }
        style.layers.push({
              "interactive": true,
              "layout": {
                  "symbol-placement": "line",
                  "text-field": "{name_en}",
                  "text-font": [
                      "Open Sans Semibold",
                      "Arial Unicode MS Bold"
                  ],
                  "text-transform": "uppercase",
                  "text-letter-spacing": 0.1,
                  "text-size": {
                      "base": 1.4,
                      "stops": [
                          [
                              10,
                              8
                          ],
                          [
                              20,
                              14
                          ]
                      ]
                  }
              },
              "filter": [
                  "all",
                  [
                      "==",
                      "$type",
                      "LineString"
                  ],
                  [
                      "in",
                      "class",
                      "motorway",
                      "primary",
                      "secondary",
                      "tertiary",
                      "trunk"
                  ]
              ],
              "type": "symbol",
              "source": layer.label+"_"+layer.id,
              "id": "road_major_label",
              "paint": {
                  "text-color": "#666",
                  "text-halo-color": "rgba(255,255,255,0.95)",
                  "text-halo-width": 2
              },
              "source-layer": "road_label"
        })
        lazy_layers[layer.id] = {
          id:layer.label+"_"+layer.id,
          layer:layer
        }
      }
      // разметка лесов
      if(layer.id == 9){
        console.log(layer.label+"_"+layer.id)
        let tiles = [...layer.tiles]
        style.sources[layer.label+"_"+layer.id] = {
          "type": "vector",
          "tiles": tiles
        }
        style.layers.push({
          "interactive": true,
            "layout": {
                "symbol-placement": "line",
                "text-field": "{name_en}",
                "text-font": [
                    "Open Sans Semibold",
                    "Arial Unicode MS Bold"
                ],
                "text-transform": "uppercase",
                "text-letter-spacing": 0.1,
                "text-size": {
                    "base": 1.4,
                    "stops": [
                        [
                            10,
                            8
                        ],
                        [
                            20,
                            14
                        ]
                    ]
                }
            },
            "filter": [
                "all",
                [
                    "==",
                    "$type",
                    "LineString"
                ],
                [
                    "in",
                    "class",
                    "motorway",
                    "primary",
                    "secondary",
                    "tertiary",
                    "trunk"
                ]
            ],
            "type": "symbol",
            "source": layer.label+"_"+layer.id,
            "id": "road_major_label_tree",
            "paint": {
                "text-color": "#666",
                "text-halo-color": "rgba(255,255,255,0.95)",
                "text-halo-width": 2
            },
            "source-layer": "road_label"
        })
        lazy_layers[layer.id] = {
          id:layer.label+"_"+layer.id,
          layer:layer
        }











        // style.sources[layer.label+"_"+layer.id] = {
        //     "type": "raster",
        //     "tiles":[
        //       window.location.origin+'/media/map_cash/'+layer.label+'/tile_{x}_{y}_{z}.png'
        //     ],
        //     tileSize:active_source_style.tileSize
        //   }
        // style.layers.push(
        //   {
        //     'id': layer.label+"_"+layer.id,
        //     'type': 'raster',
        //     'source': layer.label+"_"+layer.id,
        //     'minzoom': layer.minzoom,
        //     'maxzoom': layer.maxzoom,
        //     'paint':{
        //       'raster-opacity':0.8
        //     },
        //     'layout': {
        //       'visibility': layer.active == "active" ? 'visible' : 'none'
        //     }
        //   }
        // )
      }
    }
    return [style, lazy_layers]
  }
  updateStyle(layers, settings){
    let [style, lazy_layers] = this.buildStyle(layers, settings)
    // console.log(this.map.getStyle())
    // console.log(style)
    this.map.setStyle(style)
    // console.log(this.map.getStyle())
    this.map.once('styledata', () => {
      // console.log(this.map)
      for(let layer_id in lazy_layers){
        // рельеф
        if(layer_id == 6){
          if(lazy_layers[layer_id].layer.active == "active"){
            this.map.setTerrain({ 'source': lazy_layers[layer_id].id, 'exaggeration': 1 });
          }
        }
        // здания
        else if(layer_id == 8){
          const layers = this.map.getStyle().layers;
          const labelLayerId = layers.find(
          (layer) => layer.type === 'symbol' && layer.layout['text-field']
          )
          this.map.addLayer(
            {
            'id': 'add-3d-buildings',
            'source': lazy_layers[layer_id].id,
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': lazy_layers[layer_id].layer.minzoom,
            'maxzoom': lazy_layers[layer_id].layer.maxzoom,
            'paint': {
              'fill-extrusion-color': 
              [
                'case',
                ['boolean', ['feature-state', 'select'], false],
                "red",
                ['boolean', ['feature-state', 'hover'], false],
                "lightblue",
                '#aaa'
              ],
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.8,
            },
            'layout': {
              'visibility': lazy_layers[layer_id].layer.active == "active" ? 'visible' : 'none'
            }
            },
            labelLayerId.id
            )
        }
      }
      });
  }
}

class Map extends mapboxgl.Map{
  constructor(...args){
    super(...args)
    this.currentEventListener = null
    this.setEventListener = this.setEventListener.bind(this);
    this.unsetEventListener = this.unsetEventListener.bind(this);
  }
  setEventListener(map_, eventListener){
    if(this.currentEventListener != null) this.off('click', this.currentEventListener)
    this.currentEventListener = eventListener
    this.on("click", eventListener)
  }
  unsetEventListener(map_){
    if(this.currentEventListener != null) this.off('click', this.currentEventListener)
    this.currentEventListener = null
  }
}

export default MapManager