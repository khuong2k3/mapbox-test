import { useEffect, useRef, useState } from "react";
import mapboxgl, { Popup } from "mapbox-gl";
import { createPortal } from "react-dom";
import type { Location } from "../helper";
import '../Map.css';
import MapPopup from "./MapPopup";

const Marker = ({
  map, location, onClick
}: {
  map: mapboxgl.Map, location: Location, onClick?: React.MouseEventHandler<HTMLDivElement>
}) => {
  const {
    corr,
  } = location
  const markerRef = useRef(null);
  const contentRef = useRef(document.createElement("div"));
  const popupRef = useRef(document.createElement("div"));
  const [isActive, setActive] = useState(false);

  useEffect(() => {
    const popup = new Popup()
      .setDOMContent(popupRef.current);

    markerRef.current = new mapboxgl.Marker(contentRef.current)
      .setLngLat([corr.lng, corr.lat])
      .setPopup(popup)
      .addTo(map);

    return () => {
      markerRef.current.remove();
    };
  }, [location, corr.lat, map, corr.lng]);

  return (
    <>
      {createPortal(
        <div className="custom-marker" onClick={onClick}>
          <div className={`marker-circle ${isActive ? 'active-marker-circle' : ''}`}></div>
        </div>,
        contentRef.current
      )}
      {
        createPortal(
          <MapPopup
            location={location}
            isActive={isActive}
            onClick={() => {
              setActive(!isActive)
              if (isActive) {
                map.removeLayer(location.raster.layerId)
              } else {
                map.addLayer({
                  'id': location.raster.layerId,
                  'type': 'raster',
                  'source': location.raster.id, // Match the source ID
                  'paint': {
                    'raster-opacity': 1.0, // Adjust opacity for transparency
                    'raster-fade-duration': 100 // Smooth fade effect when tiles load
                  }
                });
              }
            }}
          />, popupRef.current
        )
      }
    </>
  );
};

export default Marker;

