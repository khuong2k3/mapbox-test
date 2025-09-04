import { useRef, useEffect, useState } from 'react'

import Add from './assets/add.svg'
import Minus from './assets/minus.svg'
import Compass from './assets/compass.svg'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import { tileToLatLon } from './helper'

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


function Map() {
  const mapRef = useRef<mapboxgl.Map>(null)
  const mapContainerRef = useRef<HTMLElement>(null)
  const geocoderRef = useRef<MapboxGeocoder>(null)
  const [center, setCenter] = useState(INITIAL_CENTER)
  const [zoom, setZoom] = useState(INITIAL_ZOOM)
  const [rotate, setRoate] = useState(INITIAL_ROTATE)
  const [onRotating, setOnRoating] = useState(false)

  console.log(tileToLatLon(12, 3261, 2170))

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
      mapRef.current?.addSource('image-source', {
        'type': 'raster',
        tiles: [
          './MAPBOX/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
        .addLayer({
          'id': 'my-raster-layer',
          'type': 'raster',
          'source': 'image-source', // Match the source ID
          'paint': {
            'raster-opacity': 0.8, // Adjust opacity for transparency
            'raster-fade-duration': 100 // Smooth fade effect when tiles load
          }
        });
    });

    mapRef.current.on('move', () => {
      const mapCenter = mapRef.current.getCenter()
      const mapZoom = mapRef.current.getZoom()
      const mapRoate = mapRef.current.getBearing()

      setSearchParams(mapCenter)
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
