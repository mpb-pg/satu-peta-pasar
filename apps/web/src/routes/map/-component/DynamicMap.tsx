import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewState {
  center: [number, number]; // [latitude, longitude]
  zoom: number;
}

interface FilterCriteria {
  productTypes?: string[];
  productBrands?: string[];
  landTypes?: string[];
  commodityTypes?: string[];
  timeRange?: { start: Date; end: Date };
  administrativeRegion?: string;
}

interface DynamicMapProps {
  administrativeLevel: 'national' | 'province' | 'regency';
  selectedProductBrand?: string;
  filters?: FilterCriteria;
  onMapViewChange?: (viewState: MapViewState) => void;
}

// Component to handle map view changes
const MapViewHandler: React.FC<{ onMapViewChange?: (viewState: MapViewState) => void }> = ({ onMapViewChange }) => {
  const map = useMap();

  useEffect(() => {
    if (onMapViewChange) {
      const handleMoveEnd = () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        onMapViewChange({
          center: [center.lat, center.lng],
          zoom,
        });
      };

      map.on('moveend', handleMoveEnd);
      return () => {
        map.off('moveend', handleMoveEnd);
      };
    }
  }, [map, onMapViewChange]);

  return null;
};

const DynamicMap: React.FC<DynamicMapProps> = ({ 
  administrativeLevel, 
  selectedProductBrand,
  filters,
  onMapViewChange
}) => {
  // Default to center of Indonesia
  const center: [number, number] = [-0.7893, 113.9213];
  const zoom = administrativeLevel === 'national' ? 5 : administrativeLevel === 'province' ? 7 : 10;

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%' }}
      data-testid="dynamic-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewHandler onMapViewChange={onMapViewChange} />
    </MapContainer>
  );
};

export default DynamicMap;