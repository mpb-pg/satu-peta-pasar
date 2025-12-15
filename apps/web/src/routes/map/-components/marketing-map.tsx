import type React from 'react';
import { useState } from 'react';
import type { AdministrativeLevel } from '../-app/administrative-boundaries-service';
import type { FilterCriteria, MarketingMapProps } from '../-domain/marketing';
import DynamicMap from './dynamic-map';
import { useMapParams } from './map-context';

const MarketingMap: React.FC<MarketingMapProps> = ({
  filters = {},
  onMapViewChange,
}) => {
  const [selectedProvince] = useState<string>('');
  const [selectedRegency] = useState<string>('');
  const [provinces] = useState<{ id: string; name: string; code: string }[]>(
    []
  );
  const [regencies] = useState<{ id: string; name: string; code: string }[]>(
    []
  );

  // Get the appropriate administrative code based on current level and selections
  const getAdministrativeCode = (): string | undefined => {
    if (currentLevel === 'province' && selectedProvince) {
      const province = provinces.find((p) => p.id === selectedProvince);
      return province?.code;
    }
    if (currentLevel === 'regency' && selectedRegency) {
      const regency = regencies.find((r) => r.id === selectedRegency);
      return regency?.code;
    }
    return;
  };

  // Prefer filters coming from MapContext (sidebar) when available;
  // otherwise fall back to locally computed filters.
  const { params } = useMapParams();
  const contextCurrentLevel =
    params?.administrativeLevel as AdministrativeLevel;
  const contextFilters = (params?.filters ?? null) as FilterCriteria | null;
  const contextSelectedBrand = params?.productBrand as string;
  const contextSelectedLandType = params?.landType as string;
  const contextSelectedCommodityType = params?.commodityType as string;

  const currentLevel = contextCurrentLevel;
  const selectedBrand = contextSelectedBrand;
  const selectedLandType = contextSelectedLandType;
  const selectedCommodityType = contextSelectedCommodityType;

  const updatedFilters: FilterCriteria = contextFilters ?? {
    ...filters,
    administrativeRegion: getAdministrativeCode(),
  };

  return (
    <div className="flex h-screen w-full" data-testid="marketing-map-container">
      <div className="relative flex-1">
        <DynamicMap
          administrativeLevel={currentLevel}
          filters={updatedFilters}
          onMapViewChange={onMapViewChange}
          selectedCommodityType={selectedCommodityType}
          selectedLandType={selectedLandType}
          selectedProductBrand={selectedBrand}
        />
      </div>
    </div>
  );
};

export default MarketingMap;
