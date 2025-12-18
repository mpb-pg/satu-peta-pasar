'use client';

import { Trans } from '@lingui/react/macro';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { orpc } from '@/lib/orpc/client';
import {
  AdministrativeBoundariesService,
  type AdministrativeLevel,
} from '@/routes/map/-app/administrative-boundaries-service';
import type { FilterCriteria, MarketingMapProps } from '../-domain/marketing';
import { useMapParams } from './map-context';

export function MapSidebar({
  administrativeLevel = 'national',
  filters = {},
  onMapViewChange,
  onProductBrandChange,
  onAdministrativeLevelChange,
  className,
  ...props
}: { className?: string } & React.ComponentProps<typeof Sidebar> &
  MarketingMapProps) {
  const toast = useToast();
  const [provinces, setProvinces] = useState<
    { id: string; name: string; code: string }[]
  >([]);
  const [regencies, setRegencies] = useState<
    { id: string; name: string; code: string }[]
  >([]);

  const [currentLevel, setCurrentLevel] =
    useState<AdministrativeLevel>(administrativeLevel);
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
          const provinceList =
            await service.getAdministrativeBoundaries('province');
          setProvinces(
            provinceList.map((p) => ({
              id: p.id,
              name: p.name,
              code: p.code || p.id,
            }))
          );
        } catch (error) {
          toast.error('Failed to load provinces:', (error as Error).message);
        }
      }
    };

    loadProvinces();
  }, [currentLevel, toast]);

  useEffect(() => {
    const loadRegencies = async () => {
      if (currentLevel === 'regency' && selectedProvince) {
        try {
          const service = new AdministrativeBoundariesService();
          const regencyList =
            await service.getRegencyBoundariesByProvince(selectedProvince);
          setRegencies(
            regencyList.map((r) => ({
              id: r.id,
              name: r.name,
              code: r.code || r.id,
            }))
          );
        } catch (error) {
          toast.error('Failed to load regencies:', (error as Error).message);
        }
      }
    };

    loadRegencies();
  }, [currentLevel, selectedProvince, toast]);

  const handleProvinceChange = (provinceId: string) => {
    setSelectedProvince(provinceId);
    if (currentLevel === 'regency') {
      setSelectedRegency('');
    }
  };

  const handleRegencyChange = (regencyId: string) => {
    setSelectedRegency(regencyId);
  };

  const getAdministrativeCode = useCallback((): string | undefined => {
    if (currentLevel === 'province' && selectedProvince) {
      const province = provinces.find((p) => p.id === selectedProvince);
      return province?.code;
    }
    if (currentLevel === 'regency' && selectedRegency) {
      const regency = regencies.find((r) => r.id === selectedRegency);
      return regency?.code;
    }
    return;
  }, [currentLevel, provinces, regencies, selectedProvince, selectedRegency]);

  const { data: productBrands } = useQuery(
    orpc.admin.product.product_brand.get.queryOptions({ input: {} })
  );

  // default filter selection state
  const [currentFilter, setCurrentFilter] = useState<string>('product_brand');
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  const [selectedLandType, setSelectedLandType] = useState<
    string | undefined
  >();
  const [selectedCommodityType, setSelectedCommodityType] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (
      currentFilter === 'product_brand' &&
      !selectedBrand &&
      productBrands?.data?.length
    ) {
      setSelectedBrand(productBrands.data[0]?.id);
    }
  }, [currentFilter, productBrands, selectedBrand]);

  const { data: landTypes } = useQuery(
    orpc.admin.land.land_type.get.queryOptions({ input: {} })
  );

  const { data: commodityTypes } = useQuery(
    orpc.admin.commodity.commodity_type.get.queryOptions({ input: {} })
  );

  const filteredCommodityTypes = selectedLandType
    ? commodityTypes?.data.filter(
        (ct: { landTypeId?: string }) => ct.landTypeId === selectedLandType
      )
    : commodityTypes?.data;

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    if (filter === 'product_brand') {
      setSelectedBrand(productBrands?.data?.[0]?.id);
      setSelectedLandType(undefined);
      setSelectedCommodityType(undefined);
    }
    if (filter === 'land_type') {
      setSelectedLandType(landTypes?.data?.[0]?.id);
      setSelectedBrand(undefined);
      setSelectedCommodityType(undefined);
    }
    if (filter === 'commodity_type') {
      setSelectedCommodityType(commodityTypes?.data?.[0]?.id);
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

  const updatedFilters: FilterCriteria = useMemo(
    () => ({
      ...filters,
      administrativeRegion: getAdministrativeCode(),
    }),
    [filters, getAdministrativeCode]
  );

  // Push updated filters into MapContext so layout and children can consume them
  const { updateParam } = useMapParams();

  useEffect(() => {
    updateParam('administrativeLevel', currentLevel);
    updateParam('filters', updatedFilters);
    updateParam('productBrand', selectedBrand);
    updateParam('landType', selectedLandType);
    updateParam('commodityType', selectedCommodityType);
  }, [
    updatedFilters,
    updateParam,
    currentLevel,
    selectedBrand,
    selectedLandType,
    selectedCommodityType,
  ]);

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
                  <Trans>Marketing Map Control</Trans>
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
            <Label className="mb-2" htmlFor="administrasi-level">
              <Trans>Administrative Level</Trans>
            </Label>
            <Select
              onValueChange={(value) =>
                handleLevelChange(value as AdministrativeLevel)
              }
              value={currentLevel}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Administrative Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="national" value="national">
                  <Trans>National</Trans>
                </SelectItem>
                <SelectItem key="province" value="province">
                  <Trans>Province</Trans>
                </SelectItem>
                <SelectItem key="regency" value="regency">
                  <Trans>Regency</Trans>
                </SelectItem>
              </SelectContent>
            </Select>
          </SidebarMenuItem>

          {currentLevel === 'province' && (
            <SidebarMenuItem className="mt-2 ml-4">
              <Label className="mb-2" htmlFor="province">
                <Trans>Province</Trans>
              </Label>
              <Select
                onValueChange={(value) => handleProvinceChange(value)}
                value={selectedProvince}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Province" />
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
              <SidebarMenuItem className="mt-2 ml-4">
                <Label className="mb-2" htmlFor="regency">
                  <Trans>Province</Trans>
                </Label>
                <Select
                  onValueChange={(value) => handleProvinceChange(value)}
                  value={selectedProvince}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Province" />
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
              <SidebarMenuItem className="mt-2 ml-4">
                <Label className="mb-2" htmlFor="regency">
                  <Trans>Regency</Trans>
                </Label>
                <Select
                  onValueChange={(value) => handleRegencyChange(value)}
                  value={selectedRegency}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Regency" />
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
          <SidebarMenuItem className="mt-2 ml-4">
            <Label className="mb-2" htmlFor="filter">
              <Trans>Filter by</Trans>
            </Label>
            <Select
              onValueChange={(value) => handleFilterChange(value)}
              value={currentFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product_brand">
                  <Trans>Product Brand</Trans>
                </SelectItem>
                {/* <SelectItem value="land_type">Land Type</SelectItem> */}
                {/* <SelectItem value="commodity_type">Commodity Type</SelectItem> */}
              </SelectContent>
            </Select>
          </SidebarMenuItem>

          {currentFilter === 'product_brand' && (
            <SidebarMenuItem className="mt-2 ml-4">
              <Label className="mb-2" htmlFor="product-brand">
                <Trans>Product Brand</Trans>
              </Label>
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
            <SidebarMenuItem className="mt-2 ml-4">
              <Label className="mb-2" htmlFor="land-type">
                <Trans>Land Type</Trans>
              </Label>
              <Select
                onValueChange={(value) => {
                  handleLandTypeChange(value);
                }}
                value={selectedLandType}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select a Land Type" />
                </SelectTrigger>
                <SelectContent>
                  {landTypes?.data?.map(
                    (landType: { id: string; name: string }) => (
                      <SelectItem key={landType.id} value={landType.id}>
                        {landType.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </SidebarMenuItem>
          )}

          {currentFilter === 'commodity_type' && (
            <SidebarMenuItem className="mt-2 ml-4">
              <Label className="mb-2" htmlFor="commodity-type">
                <Trans>Commodity Type</Trans>
              </Label>
              <Select
                onValueChange={(value) => handleCommodityTypeChange(value)}
                value={selectedCommodityType}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Select a Commodity Type" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCommodityTypes?.map(
                    (commodityType: { id: string; name: string }) => (
                      <SelectItem
                        key={commodityType.id}
                        value={commodityType.id}
                      >
                        {commodityType.name}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
