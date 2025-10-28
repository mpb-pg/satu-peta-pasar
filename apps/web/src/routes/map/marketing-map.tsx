import type React from 'react';
import { useState, useEffect } from 'react';
import { AdministrativeBoundariesService, type AdministrativeLevel } from '../../lib/services/AdministrativeBoundariesService';
import DynamicMap from './-component/DynamicMap';
import { orpc } from '@/lib/orpc/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';


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

interface MarketingMapProps {
  productData?: any[];
  administrativeLevel?: AdministrativeLevel;
  filters?: FilterCriteria;
  onMapViewChange?: (viewState: MapViewState) => void;
  onProductBrandChange?: (brand: string) => void;
  onAdministrativeLevelChange?: (level: AdministrativeLevel) => void;
}

const MarketingMap: React.FC<MarketingMapProps> = ({
  administrativeLevel = 'national',
  filters = {},
  onMapViewChange,
  onProductBrandChange,
  onAdministrativeLevelChange,
}) => {
  const [currentLevel, setCurrentLevel] =
    useState<AdministrativeLevel>(administrativeLevel);
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(
    filters.productBrands ? filters.productBrands[0] : undefined
  );
  const [selectedLandType, setSelectedLandType] = useState<string | undefined>(
    filters.landTypes ? filters.landTypes[0] : undefined
  );
  const [selectedCommodityType, setSelectedCommodityType] = useState<string | undefined>(
    filters.commodityTypes ? filters.commodityTypes[0] : undefined
  );

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
  const filteredCommodityTypes = selectedLandType
    ? commodityTypes?.data.filter(
        (ct) => ct.landTypeId === selectedLandType
      )
    : commodityTypes?.data;

  useEffect(() => {
    const loadProvinces = async () => {
      if (currentLevel !== 'national') {
        try {
          const service = new AdministrativeBoundariesService();
          const provinceList = await service.getAdministrativeBoundaries('province');
          setProvinces(provinceList.map(p => ({ 
            id: p.id, 
            name: p.name, 
            code: p.code || p.id 
          })));
        } catch (error) {
          console.error('Failed to load provinces:', error);
        }
      }
    };

    loadProvinces();
  }, [currentLevel]);

  useEffect(() => {
    const loadRegencies = async () => {
      if (currentLevel === 'regency' && selectedProvince) {
        try {
          const service = new AdministrativeBoundariesService();
          const regencyList = await service.getRegencyBoundariesByProvince(selectedProvince);
          setRegencies(regencyList.map(r => ({ 
            id: r.id, 
            name: r.name, 
            code: r.code || r.id 
          })));
        } catch (error) {
          console.error('Failed to load regencies:', error);
        }
      }
    };

    loadRegencies();
  }, [currentLevel, selectedProvince]);

  const handleLevelChange = (level: AdministrativeLevel) => {
    setCurrentLevel(level);
    // Reset province and regency selections when level changes
    if (level !== 'province') {
      setSelectedProvince('');
    }
    if (level !== 'regency') {
      setSelectedRegency('');
    }
    onAdministrativeLevelChange?.(level);
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrand(brand);
    onProductBrandChange?.(brand);
  };
  const handleLandTypeChange = (landType: string) => {
    setSelectedLandType(landType);
  };
  const handleCommodityTypeChange = (commodityType: string) => {
    setSelectedCommodityType(commodityType);
  };

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

  // Prepare updated filters with the selected administrative region
  const updatedFilters: FilterCriteria = {
    ...filters,
    administrativeRegion: getAdministrativeCode()
  };

  return (
    <div className="flex h-screen w-full" data-testid="marketing-map-container">
      <div
        className="z-10 w-80 bg-white p-4 shadow-lg"
        data-testid="control-panel"
      >
        <h2 className="mb-4 font-bold text-xl">Marketing Map Controls</h2>

        <div className="mb-4">
          <label className="mb-1 block font-medium text-sm">
            Administrative Level
          </label>
          <select
            className="w-full rounded border p-2"
            data-testid="admin-level-selector"
            onChange={(e) =>
              handleLevelChange(e.target.value as AdministrativeLevel)
            }
            value={currentLevel}
          >
            <option value="national">National</option>
            <option value="province">Province</option>
            <option value="regency">Regency</option>
          </select>
        </div>

        {currentLevel === 'province' && (
          <div className="mb-4">
            <label className="mb-1 block font-medium text-sm">Province</label>
            <select
              className="w-full rounded border p-2"
              value={selectedProvince}
              onChange={(e) => handleProvinceChange(e.target.value)}
            >
              <option value="">Select a Province</option>
              {provinces.map(province => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {currentLevel === 'regency' && (
          <div className="mb-4">
            <label className="mb-1 block font-medium text-sm">Province</label>
            <select
              className="w-full rounded border p-2"
              value={selectedProvince}
              onChange={(e) => handleProvinceChange(e.target.value)}
            >
              <option value="">Select a Province</option>
              {provinces.map(province => (
                <option key={province.id} value={province.id}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {currentLevel === 'regency' && selectedProvince && (
          <div className="mb-4">
            <label className="mb-1 block font-medium text-sm">Regency</label>
            <select
              className="w-full rounded border p-2"
              value={selectedRegency}
              onChange={(e) => handleRegencyChange(e.target.value)}
              disabled={!selectedProvince}
            >
              <option value="">Select a Regency</option>
              {regencies.map(regency => (
                  <option key={regency.id} value={regency.id}>
                    {regency.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1 block font-medium text-sm">
            Product Brand
          </label>
          <Select
            onValueChange={(value) => {
              handleBrandChange(value);
            }}
            value={selectedBrand}
          >
            <SelectTrigger className="w-full rounded">
              <SelectValue placeholder="Select a Product Brand" />
            </SelectTrigger>
            <SelectContent>
              {productBrands?.data.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4">
          <label className="mb-1 block font-medium text-sm">
            Land Type
          </label>
          <Select
            onValueChange={(value) => {
              handleLandTypeChange(value);
              setSelectedLandType(value);
            }}
            value={selectedLandType}
          >
            <SelectTrigger className="w-full rounded">
              <SelectValue placeholder="Select a Land Type" />
            </SelectTrigger>
            <SelectContent>
              {landTypes?.data.map((landType) => (
                <SelectItem key={landType.id} value={landType.id}>
                  {landType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4">
          <label className="mb-1 block font-medium text-sm">
            Commodity Type
          </label>
          <Select
            onValueChange={(value) => {
              handleCommodityTypeChange(value);
            }}
            value={selectedCommodityType}
          >
            <SelectTrigger className="w-full rounded">
              <SelectValue placeholder="Select a Commodity Type" />
            </SelectTrigger>
            <SelectContent>
              {filteredCommodityTypes?.map((commodityType) => (
                <SelectItem key={commodityType.id} value={commodityType.id}>
                  {commodityType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="relative flex-1">
        <DynamicMap
          administrativeLevel={currentLevel}
          filters={updatedFilters}
          onMapViewChange={onMapViewChange}
          selectedProductBrand={selectedBrand}
        />
      </div>
    </div>
  );
};

export default MarketingMap;
