import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as Location from 'expo-location';
import { StorageKeys } from '../lib/constants';
import { safeGetJSON, safeSetJSON } from '../lib/storage';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

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

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [source, setSource] = useState<'gps' | 'cached' | 'profile' | null>(null);

  const resolveLocation = useCallback(async () => {
    setIsLocating(true);
    setPermissionDenied(false);

    try {
      // Step 1: Try GPS
      const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const gpsCoords: Coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };

        setCoords(gpsCoords);
        setSource('gps');
        setIsLocating(false);

        // Cache for future fallback
        await safeSetJSON(StorageKeys.LAST_LOCATION, gpsCoords);

        // Update server profile (fire-and-forget)
        api.updateLocation(gpsCoords).catch((err: unknown) =>
          console.warn('Failed to update server location:', err)
        );
        return;
      }

      // GPS denied
      setPermissionDenied(true);

      // Step 2: Try cached location
      const cached = await safeGetJSON<Coords | null>(StorageKeys.LAST_LOCATION, null);
      if (cached && cached.latitude && cached.longitude) {
        setCoords(cached);
        setSource('cached');
        setIsLocating(false);
        return;
      }

      // Step 3: Try user profile location
      if (user?.latitude && user?.longitude) {
        setCoords({ latitude: user.latitude, longitude: user.longitude });
        setSource('profile');
        setIsLocating(false);
        return;
      }

      // No location available
      setCoords(null);
      setSource(null);
    } catch (error) {
      console.error('Location resolution error:', error);
      setCoords(null);
      setSource(null);
    } finally {
      setIsLocating(false);
    }
  }, [user]);

  useEffect(() => {
    resolveLocation();
  }, []);

  const value: LocationContextType = {
    coords,
    isLocating,
    permissionDenied,
    source,
    refreshLocation: resolveLocation,
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
