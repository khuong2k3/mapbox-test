import { useRef, useEffect, useState, type RefObject, cache } from 'react'

import Add from './assets/add.svg'
import Minus from './assets/minus.svg'
import Compass from './assets/compass.svg'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css'
import { Slider, type InputNumberProps } from 'antd'
import type { Location } from './helper'
import Marker from './components/Marker'

//import { tileToLatLon } from './helper'
//console.log(tileToLatLon(12, 3261, 1924))
//console.log(tileToLatLon(12, 3262, 1925))

//10.833305983642491, 
//106.611328125, 
//10.746969318459994, 
//106.69921875

const LOCATIONS: Array<Location> = [
  {
    corr: {
      lng: 106.73,
      lat: 10.74,
    },
    name: "Quận 7, Thành phố Hồ Chí Minh",
    //bound: undefined,
    //[
    //  10.646,
    //  10.933,
    //  106.51,
    //  106.8
    //],
    raster: {
      id: 'distric-7',
      layerId: 'distric-7-layer',
      url: './mapbox/{z}/{x}/{y}.png',
    }
  }
]

const INITIAL_CENTER = {
  lng: 106.73,
  lat: 10.74,
}
const INITIAL_ZOOM = 12.12
const INITIAL_ROTATE = 0.0
//const BOUND_VIETNAM = [8.10,  23.24, 102.09, 109.30]
const BOUND_VIETNAM = [
  [102.09, 6.10], // Southwest coordinates (approximate)
  [110.30, 23.24], // Northeast coordinates
]

function setSearchParams(center: { lat: number, lng: number }) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  params.set("lng", center.lng.toFixed(2).toString())
  params.set("lat", center.lat.toFixed(2).toString())
  url.search = params.toString();
  //console.log(url.toString())
  window.history.replaceState({}, '', url.toString());
}

function getSearchParams() {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  const lat = params.get("lat")
  const lng = params.get("lng")
  if (!lat || !lng) {
    return null
  } else {
    return {
      lng, lat
    }
  }
}

function RasterCtl({ mapRef }: {
  mapRef: RefObject<mapboxgl.Map | null>
}) {
  const [layerOpacity, setInputValue] = useState(0.8)

  const onChange: InputNumberProps['onChange'] = (newValue) => {
    if (!newValue) {
      return
    }

    setInputValue(newValue as number);
    LOCATIONS.forEach(location => {
      mapRef.current?.setPaintProperty(location.raster.layerId, 'raster-opacity', newValue as number)
    })
  };

  return (
    <div className='raster-ctl'>
      <div>
        <div className='raster-header-ctl'>Độ mờ của bản đồ {(layerOpacity * 100.0).toFixed(0)}%</div>
        <Slider
          min={0.0}
          max={1.0}
          onChange={onChange}
          value={typeof layerOpacity === 'number' ? layerOpacity : 0.8}
          step={0.01}
        />
      </div>

      <div className='marker-locations flex-col'>
        {
          LOCATIONS.map((location) => {
            return (
              <div
                key={location.raster.id}
                className='marker-location'
                onClick={() => {
                  mapRef.current?.flyTo({
                    center: location.corr,
                    zoom: INITIAL_ZOOM,
                  })
                }}
              >
                {location.name}
              </div>
            )
          })
        }
      </div>
    </div>
  )
}


function Map() {
  const mapRef = useRef<mapboxgl.Map>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const startGeoRef = useRef<MapboxGeocoder>(null)
  const endGeoRef = useRef<MapboxGeocoder>(null)
  const [_, setCenter] = useState(INITIAL_CENTER)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [rotate, setRoate] = useState(INITIAL_ROTATE)
  const [onRotating, setOnRoating] = useState(false)
  const [activeLocation, setActiveLocation] = useState<Location>(null);
  const [startPoint, setStartPoint] = useState([])
  const [endPoint, setEndPoint] = useState([])


  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoia2h1b25nMjAwMyIsImEiOiJjbWY0dHlla3cwOWNwMmtvZ2l6Z3F0c2l1In0.Tro4vKJ4mTqzvciNSEfn-A'
    const openrouteserviceApiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjI4MTYyODRiM2Y0NDRjMjFhOWY3ZmExNThhYmFmZThmIiwiaCI6Im11cm11cjY0In0='

    const paramCenter = getSearchParams()

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: paramCenter ? paramCenter : INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      maxBounds: BOUND_VIETNAM,
    });


    startGeoRef.current = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      countries: "vn",
      placeholder: "Tìm vị trí",
      flyTo: false,
      mapboxgl,
      //mode
    });

    endGeoRef.current = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      countries: "vn",
      placeholder: "Tìm vị trí",
      mapboxgl,
    })

    // geocoder-1
    // geocoder-2
    document.getElementById('geocoder-1').appendChild(startGeoRef.current.onAdd(mapRef.current))
    document.getElementById('geocoder-2').appendChild(endGeoRef.current.onAdd(mapRef.current))

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right')

    startGeoRef.current.on("result", (e) => {
      setStartPoint(e.result.geometry.coordinates)
      //const apiUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${openrouteserviceApiKey}&start=${startPoint}&end=${endPoint}`;
    })

    endGeoRef.current.on("result", (e) => {
      setEndPoint(e.result.geometry.coordinates)
    })

    startGeoRef.current.on("clear", () => {
      setStartPoint([])
    })
    endGeoRef.current.on("clear", () => {
      setEndPoint([])
    })

    mapRef.current.on('load', () => {
      //mapRef.current?.addSource('vn-localtion', {
      //  type: 'geojson',
      //  data: "./vietnam.geojson"
      //})
      //  .addLayer({
      //    id: "vn-layer",
      //    type: "circle",
      //    source: "vn-localtion",
      //  });

      LOCATIONS.forEach((location) => {
        mapRef.current?.addSource(location.raster.id, {
          'type': 'raster',
          tiles: [location.raster.url],
          minzoom: 12,
          maxzoom: 16,
          //bounds: location.bound,
          tileSize: 256,
        });
      })
    })

    mapRef.current.on('move', () => {
      const mapCenter = mapRef.current.getCenter()
      const mapZoom = mapRef.current.getZoom()
      const mapRoate = mapRef.current.getBearing()

      // update state
      setSearchParams(mapCenter)

      setCenter(mapCenter)
      setZoom(mapZoom)
      setRoate(mapRoate)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()

        for (const clN of ['geocoder-1', 'geocoder-2']) {
          console.log(clN)
          const element = document.getElementById(clN)
          const childrens = element?.children;
          if (childrens !== null && typeof childrens !== 'undefined') {
            childrens.item(0)?.remove()
          }
        }
      }
    }
  }, [])

  useEffect(() => {
    if (startPoint.length !== 0 && endPoint.length !== 0) {
      getRoute()
    }

    async function getRoute() {
      const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${startPoint[0]},${startPoint[1]};${endPoint[0]},${endPoint[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;

      try {
        mapRef.current.removeLayer('route')
        mapRef.current.removeSource('route')
      } catch (e) {
        console.log(e)
      }

      try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
          console.error('No routes found.');
          return;
        }

        const route = data.routes[0].geometry;

        // If a route source and layer already exist, remove them
        if (mapRef.current.getSource('route')) {
          mapRef.current.removeLayer('route');
          mapRef.current.removeSource('route');
        }

        // Add the route as a new source and layer on the map
        mapRef.current.addSource('route', {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': route
          }
        });

        mapRef.current.addLayer({
          'id': 'route',
          'type': 'line',
          'source': 'route',
          'layout': {
            'line-join': 'round',
            'line-cap': 'round'
          },
          'paint': {
            'line-color': '#2196F3',
            'line-width': 6
          }
        });

        // Fit the map to the route's bounding box
        const bounds = new mapboxgl.LngLatBounds();
        route.coordinates.forEach(coord => {
          bounds.extend(coord);
        });
        mapRef.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 }
        });

      } catch (error) {
        console.error('Error fetching route:', error);
      }
    }

  }, [startPoint, endPoint])

  useEffect(() => {
    const onMouseMove = (e) => {
      if (onRotating) {
        console.log(e.movementX)
        if (e.movementX > 0) {
          mapRef.current?.setBearing(rotate + 2.0)
        } else {
          mapRef.current?.setBearing(rotate - 2.0)
        }
      }
    }
    const onMouseUp = () => {
      setOnRoating(false)
    }
    document.addEventListener("mousemove", onMouseMove)
    document.addEventListener("mouseup", onMouseUp)
    document.addEventListener("mouseleave", onMouseUp)

    return () => {
      document.removeEventListener("mousemove", onMouseMove)
      document.removeEventListener("mouseup", onMouseUp)
      document.removeEventListener("mouseleave", onMouseUp)
    }
  }, [onRotating, rotate])

  return (
    <div id="map-holder">
      <div className="local-info">
        <div className="flex-col zoom-btn">
          <img className="icon-ms" src={Add}
            onClick={() => {
              mapRef.current?.zoomTo(zoom + 1.0)
            }}
          />
          <img className="icon-ms" src={Minus}
            onClick={() => {
              mapRef.current?.zoomTo(zoom - 1.0)
            }}
          />
          <img className='icon-ms' src={Compass}
            draggable="false"
            style={{
              transform: `rotate(${rotate - 45}deg)`,
            }}
            onMouseDown={() => {
              setOnRoating(true)
            }}
          />
        </div>
        <div id="geocoder-container">
          <div id="geocoder-1" className="geocoder-input"></div>
          <div id="geocoder-2" className="geocoder-input"></div>
        </div>

      </div>
      <div id='map-container' ref={mapContainerRef} />
      {
        mapRef.current && LOCATIONS.map((location) => {
          return (
            <Marker key={location.raster.id} map={mapRef.current} location={location}
              onClick={() => {
                setActiveLocation(location)
              }} />
          )
        })
      }
    </div>
  )
}

export default Map
        //<RasterCtl mapRef={mapRef} />
