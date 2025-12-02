import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

type MapParams = Record<string, unknown>;

type MapContextValue = {
  params: MapParams;
  setParams: (p: MapParams | ((prev: MapParams) => MapParams)) => void;
  updateParam: (key: string, value: unknown) => void;
};

const MapContext = createContext<MapContextValue | undefined>(undefined);

export function MapProvider({
  children,
  initialParams = {},
}: {
  children: ReactNode;
  initialParams?: MapParams;
}) {
  const [params, setParamsState] = useState<MapParams>(initialParams);

  const setParams = useCallback((p: MapParams | ((prev: MapParams) => MapParams)) => {
    setParamsState((prev) => {
      const next = typeof p === "function" ? (p as (prev: MapParams) => MapParams)(prev) : p;
      try {
        if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
      } catch (_) {
        // fallback: if stringify fails, still return next
      }
      return next;
    });
  }, []);

  const updateParam = useCallback((key: string, value: unknown) => {
    setParamsState((prev) => {
      const prevValue = (prev as any)?.[key];
      try {
        if (typeof prevValue === 'object' && typeof value === 'object') {
          if (JSON.stringify(prevValue) === JSON.stringify(value)) return prev;
        } else {
          if (prevValue === value) return prev;
        }
      } catch (_) {
        // ignore stringify errors and proceed to set
      }
      return { ...prev, [key]: value };
    });
  }, []);

  return (
    <MapContext.Provider value={{ params, setParams, updateParam }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapParams() {
  const ctx = useContext(MapContext);
  console.log("useMapParams context:", ctx);
  if (!ctx) throw new Error("useMapParams must be used within a MapProvider");
  return ctx;
}

export type { MapParams };
