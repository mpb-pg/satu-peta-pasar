import { Trans } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import L from 'leaflet';
import type React from 'react';
import { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { orpc } from '@/lib/orpc/client';

interface StallMarkersProps {
  showStallMarkers: boolean;
  filters?: {
    productTypes?: string[];
    productBrands?: string[];
    landTypes?: string[];
    commodityTypes?: string[];
    timeRange?: { start: Date; end: Date };
    administrativeRegion?: string;
  };
}

interface Stall {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  owner?: string;
  notelp?: string;
  criteria?: string;
}

// Create custom marker icon - location pin
// Create custom marker icon - location pin
const stallMarkerIcon = L.divIcon({
  html: `
    <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="false">
      <title>Map pin</title>
      <path fill="#0ea5a4" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 .001-5.001A2.5 2.5 0 0 1 12 11.5z"/>
    </svg>
  `,
  className: 'stall-marker-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});
const StallMarkers: React.FC<StallMarkersProps> = ({ showStallMarkers }) => {
  const [stallsData, setStallsData] = useState<Stall[]>([]);

  // Fetch stalls from oRPC
  const { data: stalls, isLoading } = useQuery(
    orpc.admin.stall.get.queryOptions({
      input: {
        // provinceId: filters?.administrativeRegion,
      },
    })
  );

  useEffect(() => {
    if (stalls?.data) {
      setStallsData(
        stalls.data.map((stall: Record<string, unknown>) => ({
          id: stall.id as string,
          name: stall.name as string,
          latitude: stall.latitude as number,
          longitude: stall.longitude as number,
          address: stall.address as string,
          owner: stall.owner as string,
          notelp: stall.notelp as string,
          criteria: stall.criteria as string,
        }))
      );
    }
  }, [stalls]);

  if (!showStallMarkers || isLoading || stallsData.length === 0) {
    return null;
  }

  return (
    <>
      {stallsData.map((stall) => {
        if (!(stall.latitude && stall.longitude)) {
          return null;
        }

        return (
          <Marker
            icon={stallMarkerIcon}
            key={stall.id}
            position={[stall.latitude, stall.longitude]}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <h3
                    style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#333',
                    }}
                  >
                    {stall.name}
                  </h3>
                  {stall.address && (
                    <p
                      style={{
                        margin: '4px 0',
                        fontSize: '12px',
                        color: '#666',
                      }}
                    >
                      <strong><Trans>Address</Trans>:</strong> {stall.address}
                    </p>
                  )}
                  {stall.owner && (
                    <p
                      style={{
                        margin: '4px 0',
                        fontSize: '12px',
                        color: '#666',
                      }}
                    >
                      <strong><Trans>Owner</Trans>:</strong> {stall.owner}
                    </p>
                  )}
                  {stall.notelp && (
                    <p
                      style={{
                        margin: '4px 0',
                        fontSize: '12px',
                        color: '#666',
                      }}
                    >
                      <strong><Trans>Phone</Trans>:</strong> {stall.notelp}
                    </p>
                  )}
                  {stall.criteria && (
                    <p
                      style={{
                        margin: '4px 0',
                        fontSize: '12px',
                        color: '#666',
                      }}
                    >
                      <strong><Trans>Criteria</Trans>:</strong> {stall.criteria}
                    </p>
                  )}
                </div>
                <Link
                  params={{ id: stall.id }}
                  style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '6px 12px',
                    backgroundColor: '#0ea5a4',
                    color: 'white',
                    borderRadius: '4px',
                    textDecoration: 'none',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  to="/stall/$id"
                >
                  <Trans>View Details</Trans>
                </Link>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default StallMarkers;
