import React from "react";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Img } from "../Layout/Shared";

// Brand-coloured pin (Leaflet's default icon images don't survive bundling).
const pin = L.divIcon({
  className: "map-pin",
  html: '<span class="map-pin-dot"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -26],
});

// Interactive map of destinations. Loaded lazily (Leaflet is ~40 KB gzipped).
const DestinationMap = ({ destinations, height = 520, zoom = 7, center }) => {
  const placed = destinations.filter((d) => d.position);
  const mapCenter = center || (placed.length === 1 ? placed[0].position : [23.6, 90.6]);
  return (
    <div className="map-frame" style={{ height }}>
      <MapContainer center={mapCenter} zoom={zoom} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={18}
        />
        {placed.map((d) => (
          <Marker key={d.id} position={d.position} icon={pin} title={d.name} alt={d.name}>
            <Popup>
              <div className="map-popup">
                <Img src={d.image} sizes="220px" eager />
                <strong>{d.name}</strong>
                <span className="muted small">{d.region}</span>
                <Link to={`/destinations/${d.id}`}>Explore →</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DestinationMap;
