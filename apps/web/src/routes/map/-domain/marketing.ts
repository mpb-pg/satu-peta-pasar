import type { AdministrativeLevel } from '../-app/administrative-boundaries-service';

export interface MapViewState {
  center: [number, number]; // [latitude, longitude]
  zoom: number;
}

export interface FilterCriteria {
  productTypes?: string[];
  productBrands?: string[];
  landTypes?: string[];
  commodityTypes?: string[];
  timeRange?: { start: Date; end: Date };
  administrativeRegion?: string;
}

export interface MarketingMapProps {
  productData?: unknown[];
  administrativeLevel?: AdministrativeLevel;
  filters?: FilterCriteria;
  onMapViewChange?: (viewState: MapViewState) => void;
  onProductBrandChange?: (brand: string) => void;
  onAdministrativeLevelChange?: (level: AdministrativeLevel) => void;
}
