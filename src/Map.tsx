import { useRef, useEffect, useState } from 'react'

import Add from './assets/add.svg'
import Minus from './assets/minus.svg'
import Compass from './assets/compass.svg'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';

import './App.css'

const INITIAL_CENTER = {
  lat: 10.762622,
  lng: 106.660172
}
const INITIAL_ZOOM = 10.12
const INITIAL_ROTATE = 0.0
//const BOUND_VIETNAM = [8.10,  23.24, 102.09, 109.30]
const BOUND_VIETNAM = [
  [102.09, 6.10], // Southwest coordinates (approximate)
  [110.30, 23.24], // Northeast coordinates
]
function Map() {
  const mapRef = useRef<mapboxgl.Map>(null)
  const mapContainerRef = useRef<HTMLElement>(null)
  const [center, setCenter] = useState(INITIAL_CENTER)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [rotate, setRoate] = useState(INITIAL_ROTATE)
  const [onRotating, setOnRoating] = useState(false)

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoia2h1b25nMjAwMyIsImEiOiJjbWY0dHlla3cwOWNwMmtvZ2l6Z3F0c2l1In0.Tro4vKJ4mTqzvciNSEfn-A'
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
      maxBounds: BOUND_VIETNAM,
    });


    mapRef.current.on('load', () => {
      const img = new Image()
      img.onload = () => {
        mapRef.current?.addImage("my-img", img)
        mapRef.current?.addSource('image-source', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [{
              'type': 'Feature',
              'geometry': {
                'type': 'Point',
                'coordinates': [32.61, 21.70] // Adjust to your desired coordinates
              }
            }]
          }
        });
        mapRef.current.addLayer({
          'id': 'image-layer',
          'type': 'symbol',
          'source': 'image-source',
          'layout': {
            'icon-image': 'my-img',
            'icon-size': 1 // Adjust size as needed
          }
        });

      }
      img.src = './MAPBOX/72023/12/3261/2170.png';
    });

    mapRef.current.on('move', () => {
      const mapCenter = mapRef.current.getCenter()
      const mapZoom = mapRef.current.getZoom()
      const mapRoate = mapRef.current.getBearing()

      // update state
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
            style={{
              transform: `rotate(${rotate - 45}deg)`,
            }}
            onClick={() => {
              setOnRoating(!onRotating)
            }}
          />
        </div>
      </div>
      <div id='map-container' ref={mapContainerRef} />
    </div>
  )
}

export default Map


//mapRef.current.addSource('bla.tile', {
//  'type': 'raster',
//  'tiles': ['http://blablabla.bla/{z}/{x}/{y}.png'],
//  'tileSize': 150
//})
//
//mapRef.current.addLayer({
//  'id': 'bla',
//  'type': 'raster',
//  'source': 'bla.tile'
//})
//
//
//
//<div className='flex-col gap-10'>
//  <div className="sidebar">
//    Longitude: {center.lng.toFixed(4)} | Latitude: {center.lat.toFixed(4)} | Zoom: {zoom.toFixed(2)}
//  </div>
//  <button className='reset-button' onClick={() => {
//    mapRef.current?.flyTo({
//      center: INITIAL_CENTER,
//      zoom: INITIAL_ZOOM,
//    })
//  }}>
//    Reset
//  </button>
//</div>
