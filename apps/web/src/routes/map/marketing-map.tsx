import React, { useState } from 'react';
import DynamicMap from './-component/DynamicMap';

export type AdministrativeLevel = 'national' | 'province' | 'regency';
export type ProductBrand = 'Urea' | 'NPK' | 'Petroganik' | 'Other';

interface MapViewState {
  center: [number, number]; // [latitude, longitude]
  zoom: number;
}

interface FilterCriteria {
  productTypes?: string[];
  productBrands?: ProductBrand[];
  landTypes?: string[];
  commodityTypes?: string[];
  timeRange?: { start: Date; end: Date };
  administrativeRegion?: string;
}

interface MarketingMapProps {
  productData?: any[];
  administrativeLevel?: AdministrativeLevel;
  selectedProductBrand?: ProductBrand;
  filters?: FilterCriteria;
  onMapViewChange?: (viewState: MapViewState) => void;
  onProductBrandChange?: (brand: ProductBrand) => void;
  onAdministrativeLevelChange?: (level: AdministrativeLevel) => void;
}

const MarketingMap: React.FC<MarketingMapProps> = ({
  productData = [],
  administrativeLevel = 'national',
  selectedProductBrand,
  filters = {},
  onMapViewChange,
  onProductBrandChange,
  onAdministrativeLevelChange,
}) => {
  const [currentLevel, setCurrentLevel] = useState<AdministrativeLevel>(administrativeLevel);
  const [selectedBrand, setSelectedBrand] = useState<ProductBrand | undefined>(selectedProductBrand);

  const handleLevelChange = (level: AdministrativeLevel) => {
    setCurrentLevel(level);
    onAdministrativeLevelChange?.(level);
  };

  const handleBrandChange = (brand: ProductBrand) => {
    setSelectedBrand(brand);
    onProductBrandChange?.(brand);
  };

  return (
    <div data-testid="marketing-map-container" className="flex h-screen w-full">
      <div data-testid="control-panel" className="w-80 bg-white shadow-lg z-10 p-4">
        <h2 className="text-xl font-bold mb-4">Marketing Map Controls</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Administrative Level</label>
          <select
            data-testid="admin-level-selector"
            value={currentLevel}
            onChange={(e) => handleLevelChange(e.target.value as AdministrativeLevel)}
            className="w-full p-2 border rounded"
          >
            <option value="national">National</option>
            <option value="province">Province</option>
            <option value="regency">Regency</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Product Brand</label>
          <select
            value={selectedBrand || ''}
            onChange={(e) => handleBrandChange(e.target.value as ProductBrand)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Brands</option>
            <option value="Urea">Urea</option>
            <option value="NPK">NPK</option>
            <option value="Petroganik">Petroganik</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Land Type Filter</label>
          <select className="w-full p-2 border rounded">
            <option value="">All Land Types</option>
            <option value="Pangan">Pangan</option>
            <option value="Kebun">Kebun</option>
            <option value="Horti">Horti</option>
            <option value="Tambak">Tambak</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Commodity Type Filter</label>
          <select className="w-full p-2 border rounded">
            <option value="">All Commodity Types</option>
            <option value="Padi">Padi</option>
            <option value="Sawit">Sawit</option>
            <option value="Bawang Merah">Bawang Merah</option>
          </select>
        </div>
      </div>
      
      <div className="flex-1 relative">
        <DynamicMap 
          administrativeLevel={currentLevel}
          selectedProductBrand={selectedBrand}
          filters={filters}
          onMapViewChange={onMapViewChange}
        />
      </div>
    </div>
  );
};

export default MarketingMap;