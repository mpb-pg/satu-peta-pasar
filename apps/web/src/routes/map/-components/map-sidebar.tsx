'use client';

import { Trans, useLingui } from '@lingui/react/macro';
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
  const { i18n } = useLingui();
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
  const [selectedYear, setSelectedYear] = useState<string>(
    String(new Date().getFullYear())
  );

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

  // Province potential data to determine last updated time
  const { data: provincePotential } = useQuery(
    orpc.admin.potential.province_potential.get.queryOptions({ input: {} })
  );

  const latestUpdatedAtText = useMemo(() => {
    const items =
      (provincePotential?.data as Array<{ updatedAt: string | number | Date }>) ?? [];
    if (!items.length) return undefined;
    const latestMs = items.reduce((max: number, item) => {
      const t = Number(new Date(item.updatedAt));
      return t > max ? t : max;
    }, 0);
    if (!latestMs) return undefined;
    return i18n.date(new Date(latestMs), {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [provincePotential, i18n]);

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
  const handleYearChange = (year: string) => {
    setSelectedYear(year);
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
    updateParam('year', selectedYear);
  }, [
    updatedFilters,
    updateParam,
    currentLevel,
    selectedBrand,
    selectedLandType,
    selectedCommodityType,
    selectedYear,
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
          
          {/* Year selection */}
          <SidebarMenuItem className="mt-2 ml-4">
            <Label className="mb-2" htmlFor="year">
              <Trans>Year</Trans>
            </Label>
            <Select onValueChange={(value) => handleYearChange(value)} value={selectedYear}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {[
                  String(new Date().getFullYear()),
                  String(new Date().getFullYear() - 1),
                  String(new Date().getFullYear() - 2),
                  String(new Date().getFullYear() - 3),
                ].map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SidebarMenuItem>

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
              <SelectTrigger className="w-40">
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
                <SelectTrigger className="w-40">
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
                    <SelectTrigger className="w-40">
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
                    <SelectTrigger className="w-40">
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
              <SelectTrigger className="w-40">
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
                <SelectTrigger className="w-40">
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
                <SelectTrigger className="w-40">
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
                <SelectTrigger className="w-40">
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

        {/* Bottom information block */}
        <div className="mt-6 border-t px-4 py-3 text-xs text-muted-foreground">
          <p className="mb-2">
            <Trans>
              This data is based on data consisting of 14 commodities:
            </Trans>
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li><Trans>Rice</Trans></li>
            <li><Trans>Corn</Trans></li>
            <li><Trans>Soybeans</Trans></li>
            <li><Trans>Peanuts</Trans></li>
            <li><Trans>Cassava</Trans></li>
            <li><Trans>Cabbage</Trans></li>
            <li><Trans>Mustard greens</Trans></li>
            <li><Trans>Potatoes</Trans></li>
            <li><Trans>Tomatoes</Trans></li>
            <li><Trans>Chili</Trans></li>
            <li><Trans>Shallots</Trans></li>
            <li><Trans>Melons</Trans></li>
            <li><Trans>Watermelon</Trans></li>
            <li><Trans>Sugarcane</Trans></li>
          </ul>
          <p className="mt-3">
            <Trans>Last updated on:</Trans> {latestUpdatedAtText ?? '—'}
          </p>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
