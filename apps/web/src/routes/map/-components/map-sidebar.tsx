"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AdministrativeBoundariesService, AdministrativeLevel } from "@/routes/map/-app/administrative-boundaries-service";
import { useEffect, useState } from "react";
import { useMapParams } from "./map-context";
import { FilterCriteria, MarketingMapProps } from "../-domain/marketing";
import { orpc } from "@/lib/orpc/client";
import { useQuery } from "@tanstack/react-query";

export function MapSidebar({
  administrativeLevel = 'national',
  filters ={},
  onMapViewChange,
  onProductBrandChange,
  onAdministrativeLevelChange,
  className,
  ...props
}: { className?: string; } 
  & React.ComponentProps<typeof Sidebar> 
  & MarketingMapProps) {

  const [provinces, setProvinces] = useState<{ id: string; name: string; code: string }[]>([]);
  const [regencies, setRegencies] = useState<{ id: string; name: string; code: string }[]>([]);

  const [currentLevel, setCurrentLevel] = useState<AdministrativeLevel>(administrativeLevel);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedRegency, setSelectedRegency] = useState<string>('');
  const handleLevelChange = (level: AdministrativeLevel) => {
    setCurrentLevel(level);
    if (level !== 'province') {
      setSelectedProvince('');
    }
    if (level !== 'regency') {
      setSelectedRegency('');
    }
    onAdministrativeLevelChange?.(level);
  };

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

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvince(provinceId);
    if (currentLevel === 'regency') {
      setSelectedRegency('');
    }
  };

  const handleRegencyChange = (regencyId: string) => {
    setSelectedRegency(regencyId);
  };

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

  const [currentFilter, setCurrentFilter] = useState<string>('product_brand');
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(
    filters.productBrands ? filters.productBrands[0] : undefined
  );
  const [selectedLandType, setSelectedLandType] = useState<string | undefined>(
    filters.landTypes ? filters.landTypes[0] : undefined
  );
  const [selectedCommodityType, setSelectedCommodityType] = useState<string | undefined>(
    filters.commodityTypes ? filters.commodityTypes[0] : undefined
  );

  const updatedFilters: FilterCriteria = {
    ...filters,
    administrativeRegion: getAdministrativeCode()
  };

  // Push updated filters into MapContext so layout and children can consume them
  const { updateParam } = useMapParams();

  useEffect(() => {
    console.log('Updating filters in MapContext:', updatedFilters);
    updateParam('administrativeLevel', currentLevel);
    updateParam('filters', updatedFilters);
    updateParam('productBrand', selectedBrand);
    updateParam('landType', selectedLandType);
    updateParam('commodityType', selectedCommodityType);
    console.log('Filters updated in MapContext');
  }, [updatedFilters, updateParam, currentLevel, selectedBrand, selectedLandType, selectedCommodityType]);

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

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    if (filter === 'product_brand') {
      setSelectedLandType(undefined);
      setSelectedCommodityType(undefined);
    }
    if (filter === 'land_type') {
      setSelectedBrand(undefined);
      setSelectedCommodityType(undefined);
    }
    if (filter === 'commodity_type') {
      setSelectedBrand(undefined);
      setSelectedLandType(undefined);
    }
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

  return (
    <Sidebar
      className={className}
      collapsible="icon"
      variant="sidebar"
      {...props}
    >
      {/* Header with Branding */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  Marketing Map Control
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem className="ml-4">
            <Label htmlFor="administrasi-level" className="mb-2">Administrative Level</Label>
            <Select
              onValueChange={(value) => handleLevelChange(value as AdministrativeLevel)}
              value={currentLevel}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Administrative Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="national" value="national">National</SelectItem>
                <SelectItem key="province" value="province">Province</SelectItem>
                <SelectItem key="regency" value="regency">Regency</SelectItem>
              </SelectContent>
            </Select>
          </SidebarMenuItem>

          {currentLevel === 'province' && (
            <SidebarMenuItem className="ml-4 mt-2">
                <Label htmlFor="province" className="mb-2">Province</Label>
                <Select
                  onValueChange={(value) => handleProvinceChange(value)}
                  value={selectedProvince}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder='Province' />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces?.map((province) => (
                      <SelectItem key={province.id} value={province.id}>
                        {province.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </SidebarMenuItem>
          )}

          {currentLevel === 'regency' && (
            <>
            <SidebarMenuItem className="ml-4 mt-2">
              <Label htmlFor="regency" className="mb-2">Province</Label>
              <Select
                onValueChange={(value) => handleProvinceChange(value)}
                value={selectedProvince}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder='Province' />
                </SelectTrigger>
                <SelectContent>
                  {provinces?.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SidebarMenuItem>
            <SidebarMenuItem className="ml-4 mt-2">
              <Label htmlFor="regency" className="mb-2">Regency</Label>
              <Select
                  onValueChange={(value) => handleRegencyChange(value)}
                  value={selectedRegency}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder='Regency' />
                  </SelectTrigger>
                  <SelectContent>
                    {regencies?.map((regency) => (
                      <SelectItem key={regency.id} value={regency.id}>
                        {regency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </SidebarMenuItem>
            </>
          )}

          {/* Filters block */}
          <SidebarMenuItem className="ml-4 mt-2">
            <Label htmlFor="filter" className="mb-2">Filter by</Label>
            <Select
              onValueChange={(value) => handleFilterChange(value)}
              value={currentFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product_brand">Product Brand</SelectItem>
                <SelectItem value="land_type">Land Type</SelectItem>
                <SelectItem value="commodity_type">Commodity Type</SelectItem>
              </SelectContent>
            </Select>
          </SidebarMenuItem>

          {currentFilter === 'product_brand' && (
          <SidebarMenuItem className="ml-4 mt-2">
            <Label htmlFor="product-brand" className="mb-2">Product Brand</Label>
            <Select
              onValueChange={(value) => handleBrandChange(value)}
              value={selectedBrand}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select a Product Brand" />
              </SelectTrigger>
              <SelectContent>
                {productBrands?.data?.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SidebarMenuItem>
          )}

          {currentFilter === 'land_type' && (
            <SidebarMenuItem className="ml-4 mt-2">
              <Label htmlFor="land-type" className="mb-2">Land Type</Label>
              <Select
                onValueChange={(value) => { handleLandTypeChange(value); }}
                value={selectedLandType}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select a Land Type" />
                </SelectTrigger>
                <SelectContent>
                  {landTypes?.data?.map((landType) => (
                    <SelectItem key={landType.id} value={landType.id}>
                      {landType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SidebarMenuItem>
          )}

          {currentFilter === 'commodity_type' && (
            <SidebarMenuItem className="ml-4 mt-2">
              <Label htmlFor="commodity-type" className="mb-2">Commodity Type</Label>
              <Select
                onValueChange={(value) => handleCommodityTypeChange(value)}
                value={selectedCommodityType}
              >
                <SelectTrigger className="w-[150px]">
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
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
