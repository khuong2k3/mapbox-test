import { useRef, useEffect, useState, type RefObject } from 'react'

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
      lat: 10.74,
      lng: 106.73,
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
  lat: 10.74,
  lng: 106.73,
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
  params.set("lat", center.lat.toFixed(2).toString())
  params.set("lng", center.lng.toFixed(2).toString())
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
      lat, lng
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
  const mapContainerRef = useRef<HTMLElement>(null)
  const geocoderRef = useRef<MapboxGeocoder>(null)
  const [_, setCenter] = useState(INITIAL_CENTER)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [rotate, setRoate] = useState(INITIAL_ROTATE)
  const [onRotating, setOnRoating] = useState(false)
  const [activeLocation, setActiveLocation] = useState<Location>(null);


  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoia2h1b25nMjAwMyIsImEiOiJjbWY0dHlla3cwOWNwMmtvZ2l6Z3F0c2l1In0.Tro4vKJ4mTqzvciNSEfn-A'

    const paramCenter = getSearchParams()

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: paramCenter ? paramCenter : INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      maxBounds: BOUND_VIETNAM,
    });


    geocoderRef.current = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      countries: "vn",
      placeholder: "Tìm vị trí",
      mapboxgl,
    });

    mapRef.current.addControl(geocoderRef.current)

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
        //.addLayer({
        //  'id': location.raster.layerId,
        //  'type': 'raster',
        //  'source': location.raster.id, // Match the source ID
        //  'paint': {
        //    'raster-opacity': 1.0, // Adjust opacity for transparency
        //    'raster-fade-duration': 100 // Smooth fade effect when tiles load
        //  }
        //});
      })


      //LOCATIONS.forEach((location) => {
      //  const popUp = new mapboxgl.Popup({offset: 25})
      //  .setText(location.name)
      //
      //  new mapboxgl.Marker({
      //    //color: "#FFFFFF",
      //  }).setLngLat([location.corr.lng, location.corr.lat])
      //    .setPopup(popUp)
      //    .addTo(mapRef.current);
      //});

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
      }
    }
  }, [])

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
        <RasterCtl mapRef={mapRef} />
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
