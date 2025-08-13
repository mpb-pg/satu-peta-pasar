import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';

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

  const setParams = useCallback(
    (p: MapParams | ((prev: MapParams) => MapParams)) => {
      setParamsState((prev) => {
        const next =
          typeof p === 'function'
            ? (p as (prev: MapParams) => MapParams)(prev)
            : p;

        if (JSON.stringify(prev) === JSON.stringify(next)) {
          return prev;
        }
        return next;
      });
    },
    []
  );

  const updateParam = useCallback((key: string, value: unknown) => {
    setParamsState((prev) => {
      const prevValue = (prev as any)?.[key];

      if (typeof prevValue === 'object' && typeof value === 'object') {
        if (JSON.stringify(prevValue) === JSON.stringify(value)) {
          return prev;
        }
      } else if (prevValue === value) {
        return prev;
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
  if (!ctx) {
    throw new Error('useMapParams must be used within a MapProvider');
  }
  return ctx;
}

export type { MapParams };
