import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { orpc } from '@/lib/orpc/client';
import { useQuery } from '@tanstack/react-query';

interface ChoroplethMapProps {
  productBrandId?: string | undefined;
  landTypeId?: string | undefined;
  commodityTypeId?: string | undefined;
}

// List of province codes available in src/lib/data/provinces
const PROVINCE_CODES = [
  '11','12','13','14','15','16','17','18','19','21','31','32','33','34','35','36',
  '51','52','53','61','62','63','64','65','71','72','73','74','75','76','81','82',
  '91','92','93','94','95','96'
];

const ChoroplethMap: React.FC<ChoroplethMapProps> = ({ productBrandId, landTypeId, commodityTypeId }) => {
  const map = useMap();
  const [featureCollection, setFeatureCollection] = useState<any | null>(null);

  // Fetch province potentials from server (large limit to retrieve all)
  const potentialsQuery = useQuery(
    orpc.admin.potential.province_potential.get.queryOptions({ input: { productBrandId } })
  );

  // Load all province geojson files and merge into a single FeatureCollection
  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      try {
        const fetches = PROVINCE_CODES.map(async (code) => {
          const res = await fetch(`/src/lib/data/provinces/${code}.geojson`);
          if (!res.ok) return null;
          const json = await res.json();
          // Ensure features array exists
          const features = json.type === 'FeatureCollection' ? json.features : [json];
          // Attach a provinceCode property so we can match later
          features.forEach((f: any) => {
            if (!f.properties) f.properties = {};
            f.properties.provinceCode = code;
          });
          return features;
        });

        const all = await Promise.all(fetches);
        const mergedFeatures = all.flat().filter(Boolean);
        if (mounted) {
          setFeatureCollection({ type: 'FeatureCollection', features: mergedFeatures });
        }
      } catch (e) {
        console.error('Failed loading province geojsons', e);
      }
    };

    loadAll();
    return () => { mounted = false; };
  }, []);

  // Merge potentials into features' properties
  const enriched = useMemo(() => {
    if (!featureCollection) return null;
    // Build potentials map keyed by provinceCode when available, fallback to provinceId
    const potentials = (potentialsQuery.data?.data ?? []).reduce((acc: Record<string, number>, row: any) => {
      if (!row) return acc;
      const key = String(row.provinceCode ?? '');
      if (key) acc[key] = Number(row.potential ?? 0);
      return acc;
    }, {});

    const features = featureCollection.features.map((f: any) => {
      const copy = { ...f, properties: { ...(f.properties || {}) } };
      const code = String(copy.properties.provinceCode ?? copy.properties.code ?? copy.properties.id ?? copy.properties.PROV_CODE ?? copy.properties.KODE);
      // Keep provinceCode explicitly and also set provinceId fallback for compatibility
      copy.properties.provinceCode = code;
      copy.properties.provinceId = copy.properties.provinceId ?? code;
      copy.properties.potential = potentials[code] ?? potentials[copy.properties.provinceId] ?? 0;
      return copy;
    });

    // compute min/max for legend
    const values = features.map((f: any) => Number(f.properties.potential ?? 0));
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { type: 'FeatureCollection', features, stats: { min, max } };
  }, [featureCollection, potentialsQuery.data]);

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
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info legend bg-white p-2 rounded shadow text-xs');
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
    const name = feature.properties?.name ?? feature.properties?.prov_name ?? feature.properties?.PROVINSI ?? feature.properties?.provinceName ?? feature.properties?.province;
    const val = feature.properties?.potential ?? 0;
    const formatted = Number(val).toLocaleString();
    layer.bindPopup(`<strong>${name ?? 'Unknown'}</strong><br/>Potential: ${formatted}`);
  };

  return (
    <GeoJSON data={enriched as any} style={style} onEachFeature={onEachFeature} />
  );
};

export default ChoroplethMap;
