import type React from 'react';
import { useEffect, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@/components/ui/button';
import {
  loadProvinceGeoJSON,
  loadRegencyGeoJSON,
} from '../../../lib/utils/geojson-utils';
import type { AdministrativeLevel } from '../-app/administrative-boundaries-service';
import ChoroplethMap from './choropleth-map';

interface MapViewState {
  center: [number, number];
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
  selectedLandType?: string;
  selectedCommodityType?: string;
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
  administrativeLevel: AdministrativeLevel;
  administrativeBoundaryCode?: string;
}> = ({ administrativeLevel, administrativeBoundaryCode }) => {
  const [boundaryData, setBoundaryData] = useState<any>(null);
  const map = useMap();

  useEffect(() => {
    const loadBoundary = async () => {
      if (administrativeLevel === 'province' && administrativeBoundaryCode) {
        try {
          const geojsonData = await loadProvinceGeoJSON(
            administrativeBoundaryCode
          );
          setBoundaryData(geojsonData);
        } catch (error) {
          console.error('Failed to load province boundary:', error);
        }
      } else if (
        administrativeLevel === 'regency' &&
        administrativeBoundaryCode
      ) {
        try {
          const geojsonData = await loadRegencyGeoJSON(
            administrativeBoundaryCode
          );
          setBoundaryData(geojsonData);
        } catch (error) {
          console.error('Failed to load regency boundary:', error);
        }
      } else if (administrativeLevel === 'national') {
        try {
          const response = await fetch('/data/indonesia-boundary.geojson');
          if (!response.ok) {
            throw new Error(
              `Failed to load national boundaries: ${response.statusText}`
            );
          }
          const boundaries = await response.json();
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
      try {
        const geoJsonLayer = L.geoJSON(boundaryData);
        const bounds = geoJsonLayer.getBounds();

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

  const boundaryStyle: L.PathOptions = {
    fillColor: '#3182ce',
    weight: 2,
    opacity: 1,
    color: '#2c5282',
    dashArray: '3',
    fillOpacity: 0.2,
  };

  return <GeoJSON data={boundaryData} style={boundaryStyle} />;
};

const DynamicMap: React.FC<DynamicMapProps> = ({
  administrativeLevel,
  selectedProductBrand,
  selectedLandType,
  selectedCommodityType,
  filters,
  onMapViewChange,
}) => {
  const [showChoropleth, setShowChoropleth] = useState<boolean>(false);
  const [choroplethLoading, setChoroplethLoading] = useState<boolean>(false);
  const center: [number, number] = [-0.7893, 113.9213];
  const zoom =
    administrativeLevel === 'national'
      ? 7
      : administrativeLevel === 'province'
        ? 7
        : 10;

  let administrativeCode: string | undefined;
  if (administrativeLevel !== 'national' && filters?.administrativeRegion) {
    administrativeCode = filters.administrativeRegion;
  }

  return (
    <MapContainer
      center={center}
      data-testid="dynamic-map"
      style={{ height: '100%', width: '100%' }}
      zoom={zoom}
    >
      <div
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          pointerEvents: 'auto',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            aria-pressed={!showChoropleth}
            onClick={() => setShowChoropleth((v) => !v)}
            size="sm"
            variant="outline"
          >
            {showChoropleth ? 'Hide Choropleth' : 'Show Choropleth'}
          </Button>
          {choroplethLoading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.9)',
                padding: '6px 8px',
                borderRadius: 6,
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              }}
            >
              <svg aria-hidden height="18" viewBox="0 0 50 50" width="18">
                <circle
                  cx="25"
                  cy="25"
                  fill="none"
                  r="20"
                  stroke="#0ea5a4"
                  strokeDasharray="31.4 31.4"
                  strokeLinecap="round"
                  strokeWidth="4"
                >
                  <animateTransform
                    attributeName="transform"
                    dur="1s"
                    from="0 25 25"
                    repeatCount="indefinite"
                    to="360 25 25"
                    type="rotate"
                  />
                </circle>
              </svg>
              <div style={{ fontSize: 12, color: '#333' }}>Loading...</div>
            </div>
          )}
        </div>
      </div>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <BoundaryDisplay
        administrativeBoundaryCode={administrativeCode}
        administrativeLevel={administrativeLevel}
      />
      {showChoropleth && (
        <ChoroplethMap
          commodityTypeId={selectedCommodityType}
          landTypeId={selectedLandType}
          onLoadingChange={setChoroplethLoading}
          productBrandId={selectedProductBrand}
        />
      )}
      <MapViewHandler onMapViewChange={onMapViewChange} />
    </MapContainer>
  );
};

export default DynamicMap;
