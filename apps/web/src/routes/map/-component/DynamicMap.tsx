import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { AdministrativeBoundariesService, type AdministrativeLevel } from '../../../lib/services/AdministrativeBoundariesService';
import { loadProvinceGeoJSON, loadRegencyGeoJSON } from '../../../lib/utils/geojson-utils';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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
  administrativeLevel: AdministrativeLevel;
  selectedProductBrand?: string;
  filters?: FilterCriteria;
  onMapViewChange?: (viewState: MapViewState) => void;
}

// Component to handle map view changes
const MapViewHandler: React.FC<{
  onMapViewChange?: (viewState: MapViewState) => void;
}> = ({ onMapViewChange }) => {
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

// Component to handle the display of administrative boundaries
const BoundaryDisplay: React.FC<{ 
  administrativeLevel: AdministrativeLevel, 
  administrativeBoundaryCode?: string 
}> = ({ administrativeLevel, administrativeBoundaryCode }) => {
  const [boundaryData, setBoundaryData] = useState<any>(null);
  const map = useMap();

  useEffect(() => {
    const loadBoundary = async () => {
      if (administrativeLevel === 'province' && administrativeBoundaryCode) {
        try {
          const geojsonData = await loadProvinceGeoJSON(administrativeBoundaryCode);
          setBoundaryData(geojsonData);
        } catch (error) {
          console.error('Failed to load province boundary:', error);
        }
      } else if (administrativeLevel === 'regency' && administrativeBoundaryCode) {
        try {
          const geojsonData = await loadRegencyGeoJSON(administrativeBoundaryCode);
          setBoundaryData(geojsonData);
        } catch (error) {
          console.error('Failed to load regency boundary:', error);
        }
      } else if (administrativeLevel === 'national') {
        try {
          const service = new AdministrativeBoundariesService();
          const boundaries = await service.getBoundaries('national');
          setBoundaryData(boundaries);
        } catch (error) {
          console.error('Failed to load national boundary:', error);
        }
      }
    };

    loadBoundary();
  }, [administrativeLevel, administrativeBoundaryCode]);

  useEffect(() => {
    if (boundaryData) {
      // Safely try to fit the map to the boundary bounds
      try {
        const geoJsonLayer = L.geoJSON(boundaryData);
        const bounds = geoJsonLayer.getBounds();
        
        // Check if bounds are valid before fitting
        if (bounds.isValid()) {
          map.fitBounds(bounds, { animate: true, maxZoom: 12 });
        } else {
          console.warn('Invalid bounds for the loaded boundary data');
        }
      } catch (error) {
        console.error('Error calculating bounds for boundary data:', error);
      }
    }
  }, [boundaryData, map]);

  if (!boundaryData) {
    return null;
  }

  // Define style for boundaries
  const boundaryStyle: L.PathOptions = {
    fillColor: '#3182ce',
    weight: 2,
    opacity: 1,
    color: '#2c5282',
    dashArray: '3',
    fillOpacity: 0.2
  };

  return (
    <GeoJSON 
      data={boundaryData} 
      style={boundaryStyle}
    />
  );
};

const DynamicMap: React.FC<DynamicMapProps> = ({
  administrativeLevel,
  selectedProductBrand,
  filters,
  onMapViewChange,
}) => {
  // Default to center of Indonesia
  const center: [number, number] = [-0.7893, 113.9213];
  const zoom =
    administrativeLevel === 'national'
      ? 5
      : administrativeLevel === 'province'
        ? 7
        : 10;

  // Extract administrative code from filters if available
  let administrativeCode: string | undefined;
  if (administrativeLevel !== 'national' && filters?.administrativeRegion) {
    // In a real implementation, we would use the service to find the code
    // For now, we'll just use the region id as the code
    administrativeCode = filters.administrativeRegion;
  }

  return (
    <MapContainer
      center={center}
      data-testid="dynamic-map"
      style={{ height: '100%', width: '100%' }}
      zoom={zoom}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <BoundaryDisplay 
        administrativeLevel={administrativeLevel} 
        administrativeBoundaryCode={administrativeCode}
      />
      <MapViewHandler onMapViewChange={onMapViewChange} />
    </MapContainer>
  );
};

export default DynamicMap;
