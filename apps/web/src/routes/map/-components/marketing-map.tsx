import type React from 'react';
import { useState, useEffect } from 'react';
import { useMapParams } from './map-context';
import { AdministrativeBoundariesService, type AdministrativeLevel } from '../-app/administrative-boundaries-service';
import DynamicMap from './DynamicMap';
import { orpc } from '@/lib/orpc/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { FilterCriteria, MarketingMapProps } from '../-domain/marketing';

const MarketingMap: React.FC<MarketingMapProps> = ({
  administrativeLevel = 'national',
  filters = {},
  onMapViewChange,
  onProductBrandChange,
  onAdministrativeLevelChange,
}) => {

  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedRegency, setSelectedRegency] = useState<string>('');
  const [provinces, setProvinces] = useState<{ id: string; name: string; code: string }[]>([]);
  const [regencies, setRegencies] = useState<{ id: string; name: string; code: string }[]>([]);

  const { data: productBrands } = useQuery(
    orpc.admin.product.product_brand.get.queryOptions({ input: {} })
  );

  const { data: landTypes } = useQuery(
    orpc.admin.land.land_type.get.queryOptions({ input: {} })
  );

  const { data: commodityTypes } = useQuery(
    orpc.admin.commodity.commodity_type.get.queryOptions({ input: {} })
  );

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvince(provinceId);
    // When province changes and level is regency, reset regency selection
    if (currentLevel === 'regency') {
      setSelectedRegency('');
    }
  };

  const handleRegencyChange = (regencyId: string) => {
    setSelectedRegency(regencyId);
  };

  // Get the appropriate administrative code based on current level and selections
  const getAdministrativeCode = (): string | undefined => {
    if (currentLevel === 'province' && selectedProvince) {
      const province = provinces.find(p => p.id === selectedProvince);
      return province?.code;
    } else if (currentLevel === 'regency' && selectedRegency) {
      const regency = regencies.find(r => r.id === selectedRegency);
      return regency?.code;
    }
    return undefined;
  };

  // Prefer filters coming from MapContext (sidebar) when available;
  // otherwise fall back to locally computed filters.
  const { params } = useMapParams();
  const contextCurrentLevel = (params?.administrativeLevel as AdministrativeLevel);
  const contextFilters = (params?.filters ?? null) as FilterCriteria | null;
  const contextSelectedBrand = (params?.productBrand as string);
  const contextSelectedLandType = (params?.landType as string);
  const contextSelectedCommodityType = (params?.commodityType as string);

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
          selectedProductBrand={selectedBrand}
          selectedLandType={selectedLandType}
          selectedCommodityType={selectedCommodityType}
        />
      </div>
    </div>
  );
};

export default MarketingMap;
