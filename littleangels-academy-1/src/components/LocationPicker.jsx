import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export default function LocationPicker({ value, onChange, className = '' }) {
  const [position, setPosition] = useState(value?.coordinates || [-1.286389, 36.817223]);
  const [showMap, setShowMap] = useState(false);
  const [address, setAddress] = useState(value?.street || '');

  useEffect(() => {
    if (value?.coordinates) {
      setPosition(value.coordinates);
    }
    if (value?.street) {
      setAddress(value.street);
    }
  }, [value]);

  const handlePositionChange = async (newPosition) => {
    setPosition(newPosition);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition[0]}&lon=${newPosition[1]}`
      );
      const data = await response.json();
      const addressStr = data.display_name || `${newPosition[0].toFixed(6)}, ${newPosition[1].toFixed(6)}`;
      setAddress(addressStr);
      
      onChange({
        coordinates: newPosition,
        street: addressStr,
        lat: newPosition[0],
        lng: newPosition[1]
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      const addressStr = `${newPosition[0].toFixed(6)}, ${newPosition[1].toFixed(6)}`;
      setAddress(addressStr);
      
      onChange({
        coordinates: newPosition,
        street: addressStr,
        lat: newPosition[0],
        lng: newPosition[1]
      });
    }
  };

  const handleManualAddress = (e) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    
    onChange({
      coordinates: position,
      street: newAddress,
      lat: position[0],
      lng: position[1]
    });
  };

  return (
    <div className={className}>
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={handleManualAddress}
            placeholder="Enter home address or click map to select location"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <MapPin size={18} />
            {showMap ? 'Hide Map' : 'Select on Map'}
          </button>
        </div>

        {position && (
          <div className="text-sm text-gray-600">
            📍 Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </div>
        )}

        {showMap && (
          <div className="relative border-2 border-gray-200 rounded-lg overflow-hidden" style={{ height: '400px' }}>
            <button
              type="button"
              onClick={() => setShowMap(false)}
              className="absolute top-2 right-2 z-[1000] bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
            <MapContainer
              center={position}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={handlePositionChange} />
            </MapContainer>
            <div className="absolute bottom-2 left-2 bg-white px-3 py-2 rounded-md shadow-lg text-sm z-[1000]">
              💡 Click on the map to select student's home location
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
