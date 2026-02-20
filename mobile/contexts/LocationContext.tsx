import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Coords {
  latitude: number;
  longitude: number;
}

interface LocationContextType {
  coords: Coords | null;
  isLocating: boolean;
  permissionDenied: boolean;
  source: 'gps' | 'cached' | 'profile' | null;
  refreshLocation: () => Promise<void>;
}

// Boston College, Chestnut Hill, MA
const BC_COORDS: Coords = {
  latitude: 42.3355,
  longitude: -71.1685,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [coords, setCoords] = useState<Coords | null>(BC_COORDS);
  const [isLocating, setIsLocating] = useState(false);
  const [permissionDenied] = useState(false);
  const [source] = useState<'gps' | 'cached' | 'profile' | null>('gps');

  useEffect(() => {
    setCoords(BC_COORDS);
    setIsLocating(false);
  }, []);

  const refreshLocation = async () => {
    setCoords(BC_COORDS);
  };

  const value: LocationContextType = {
    coords,
    isLocating,
    permissionDenied,
    source,
    refreshLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}

export default LocationContext;
