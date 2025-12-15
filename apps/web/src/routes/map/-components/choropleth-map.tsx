import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { orpc } from '@/lib/orpc/client';

interface ChoroplethMapProps {
  productBrandId?: string | undefined;
  landTypeId?: string | undefined;
  commodityTypeId?: string | undefined;
  onLoadingChange?: (loading: boolean) => void;
}

const ChoroplethMap: React.FC<ChoroplethMapProps> = ({
  productBrandId,
  onLoadingChange,
}) => {
  const map = useMap();
  const [featureCollection, setFeatureCollection] = useState<any | null>(null);

  const potentialsData = useQuery(
    orpc.admin.potential.province_potential.get.queryOptions({
      input: { productBrandId },
    })
  );
  // convert potential with divide by 1000 to get in ton
  useEffect(() => {
    if (potentialsData.data?.data) {
      const converted = potentialsData.data.data.map((item: any) => ({
        ...item,
        potential: item.potential ? item.potential / 1000 : 0,
      }));
      potentialsData.data.data = converted;
    }
  }, [potentialsData.data]);

  // Fetch provinces list and build a map of provinceCode -> province metadata
  const provincesData = useQuery(
    orpc.admin.region.province.get.queryOptions({ input: {} })
  );

  const provinceMap = useMemo(() => {
    const m: Record<
      string,
      { id: string; name: string; code: string; area: number }
    > = {};
    (provincesData?.data?.data ?? []).forEach((prov: any) => {
      if (prov && prov.code) m[prov.code] = prov;
    });
    return m;
  }, [provincesData]);

  // (onLoadingChange will be called later after `enriched` is computed)

  // Load all province geojson files and merge into a single FeatureCollection
  // useEffect(() => {
  //   let mounted = true;
  //   const loadAll = async () => {
  //     try {
  //       const codes = Object.keys(provinceMap).length
  //         ? Object.keys(provinceMap)
  //         : [];
  //       console.log('Loading province geojsons for codes:', codes);
  //       console.log(
  //         'Province codes with id+area:',
  //         Object.entries(provinceMap).map(([code, prov]) => ({
  //           code,
  //           id: prov.id,
  //           name: prov.name,
  //           area: prov.area,
  //         }))
  //       );
  //       console.log(provinceMap);
  //       const fetches = Object.entries(provinceMap)
  //         .map(([code, prov]) => ({
  //           code,
  //           id: prov.id,
  //           name: prov.name,
  //           area: prov.area,
  //         }))
  //         .map(async ({ code, id, area }) => {
  //           const res = await fetch(`/data/indonesia-boundary.geojson`);
  //           if (!res.ok) return null;
  //           const json = await res.json();

  //           const features =
  //             json.type === 'FeatureCollection' ? json.features : [json];
  //           // Attach a provinceCode property so we can match later
  //           features.forEach((f: any) => {
  //             if (!f.properties) f.properties = {};
  //             f.properties.provinceCode = code;
  //             f.properties.provinceId = id;
  //             f.properties.area = area;
  //           });
  //           return features;
  //         });

  //       const all = await Promise.all(fetches);
  //       const mergedFeatures = all.flat().filter(Boolean);
  //       console.log(`Loaded ${mergedFeatures.length} province features`);
  //       console.log(mergedFeatures);
  //       if (mounted) {
  //         console.log('Setting featureCollection with merged features');
  //         setFeatureCollection({
  //           type: 'FeatureCollection',
  //           features: mergedFeatures,
  //         });
  //       }
  //     } catch (e) {
  //       console.error('Failed loading province geojsons', e);
  //     }
  //   };

  //   loadAll();
  //   return () => {
  //     mounted = false;
  //   };
  // }, [provinceMap]);

  const { data: geoJsonData } = useQuery({
    queryKey: ['indonesia-geojson'],
    queryFn: async () => {
      // Pastikan file ada di folder public/data/
      const res = await fetch('/data/indonesia-boundary.geojson');
      if (!res.ok) throw new Error('Failed to load map data');
      return res.json();
    },
    staleTime: Number.POSITIVE_INFINITY, // Data peta jarang berubah, simpan selamanya di cache
    refetchOnWindowFocus: false,
  });

  // Logic merging (enriched) tetap bisa dipakai, tapi sumber datanya dari geoJsonData
  useEffect(() => {
    if (geoJsonData) {
      setFeatureCollection(geoJsonData);
    }
  }, [geoJsonData]);

  // Merge potentials into features' properties
  const enriched = useMemo(() => {
    if (!featureCollection) return null;
    // Build potentials map keyed by provinceId and include productBrandName
    const potentials = (potentialsData.data?.data ?? []).reduce(
      (
        acc: Record<
          string,
          {
            potential: number;
            productBrandName?: string;
            productBrandId?: string;
          }
        >,
        row: any
      ) => {
        if (!row) return acc;
        const key = String(
          row.provinceId ?? row.province_id ?? row.provinceCode ?? ''
        );
        if (!key) return acc;
        acc[key] = {
          potential: Number(row.potential ?? row.value ?? 0),
          productBrandName:
            row.productBrandName ??
            row.product_brand_name ??
            row.brandName ??
            null,
          productBrandId:
            row.productBrandId ?? row.product_brand_id ?? row.brandId ?? null,
        };
        return acc;
      },
      {} as Record<
        string,
        {
          potential: number;
          productBrandName?: string;
          productBrandId?: string;
        }
      >
    );

    const features = featureCollection.features.map((f: any) => {
      const copy = { ...f, properties: { ...(f.properties || {}) } };
      const code = String(copy.properties.code);
      // Keep provinceCode explicitly and also set provinceId fallback for compatibility
      copy.properties.provinceCode = code;
      // get provinceId from find code in provinceMap
      const provinceMeta = provinceMap[code];
      copy.properties.provinceId = provinceMeta ? provinceMeta.id : null;
      const meta = potentials[String(copy.properties.provinceId ?? '')] ?? null;
      copy.properties.potential = meta?.potential ? meta.potential : 0;
      copy.properties.productBrandName = meta?.productBrandName ?? null;
      copy.properties.productBrandId = meta?.productBrandId ?? null;
      return copy;
    });

    // compute min/max for legend
    const values = features.map((f: any) =>
      Number(f.properties.potential ? f.properties.potential : 0)
    );
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { type: 'FeatureCollection', features, stats: { min, max } };
  }, [featureCollection, potentialsData.data]);

  // Create a deterministic key so React will remount the GeoJSON layer
  // whenever feature potentials or province codes change. This forces
  // Leaflet to recreate the underlying L.GeoJSON layer and re-bind styles.
  const geoKey = useMemo(() => {
    if (!enriched) return 'empty';
    // Use provinceCode and potential — concise and reflects visible changes
    return enriched.features
      .map(
        (f: any) =>
          `${String(f.properties?.provinceCode ?? f.properties?.code ?? f.properties?.id ?? '')}:${String(f.properties?.potential ?? 0)}`
      )
      .join('|');
  }, [enriched]);

  // Report loading status to parent when queries or enriched change
  useEffect(() => {
    const loading = Boolean(
      (potentialsData.isLoading ?? false) ||
        (provincesData.isLoading ?? false) ||
        !enriched
    );
    if (typeof onLoadingChange === 'function') onLoadingChange(loading);
  }, [
    potentialsData.isLoading,
    provincesData.isLoading,
    enriched,
    onLoadingChange,
  ]);
  // Color scale helper
  const getColor = (value: number, min: number, max: number) => {
    if (max === min) return '#ffffb2';
    const ratio = (value - min) / (max - min);
    // Gradient from light yellow -> orange -> red -> purple
    const colors = ['#ffffb2', '#fed976', '#fd8d3c', '#f03b20', '#bd0026'];
    const idx = Math.min(colors.length - 1, Math.floor(ratio * colors.length));
    return colors[idx];
  };

  // Legend control: show exact numeric ranges with thousand separators
  useEffect(() => {
    if (!enriched) return;
    const { min, max } = enriched.stats;
    const steps = 5;
    const breaks: number[] = [];
    for (let i = 0; i < steps; i++) {
      breaks.push(min + (i / (steps - 1)) * (max - min));
    }

    const fmt = new Intl.NumberFormat(undefined);

    const legend: any = (L.control as any)({ position: 'bottomright' });
    legend.onAdd = () => {
      const div = L.DomUtil.create(
        'div',
        'info legend bg-white p-2 rounded shadow text-xs'
      );
      const labels: string[] = [];

      for (let i = 0; i < breaks.length; i++) {
        const fromVal = Math.round(breaks[i]);
        const color = getColor(breaks[i], min, max);
        let labelText: string;
        if (i < breaks.length - 1) {
          const toVal = Math.round(breaks[i + 1]);
          labelText = `${fmt.format(fromVal)} – ${fmt.format(toVal)}`;
        } else {
          labelText = `≥ ${fmt.format(fromVal)}`;
        }

        labels.push(
          `<div style="display:flex;align-items:center;margin-bottom:6px;"><i style="background:${color};width:18px;height:14px;display:inline-block;margin-right:8px;border:1px solid #ccc;"></i><span>${labelText}</span></div>`
        );
      }

      div.innerHTML = labels.join('');
      return div;
    };

    legend.addTo(map);
    return () => {
      legend.remove();
    };
  }, [enriched, map]);

  if (!enriched) return null;

  const style = (feature: any) => {
    const v = Number(feature.properties?.potential ?? 0);
    const color = getColor(v, enriched.stats.min, enriched.stats.max);
    const opts: L.PathOptions = {
      fillColor: color,
      weight: 1,
      opacity: 1,
      color: '#444',
      dashArray: '1',
      fillOpacity: 0.8,
    };
    return opts;
  };

  const onEachFeature = (feature: any, layer: any) => {
    const name = feature.properties?.name ?? 'Unknown';
    // add productBrandName
    const productBrandName =
      feature.properties?.productBrandName ?? 'Unknown Brand';
    const potential = feature.properties?.potential ?? 0;
    const formatted_potential = Number(potential).toLocaleString();
    layer.bindPopup(
      `<strong>${name}</strong><br/><b>Product:</b> ${productBrandName}<br/><b>Product Potential:</b> ${formatted_potential} ton`
    );
  };

  return (
    <GeoJSON
      data={enriched as any}
      key={geoKey}
      onEachFeature={onEachFeature}
      style={style}
    />
  );
};

export default ChoroplethMap;
