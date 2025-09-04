import { useState, useEffect, useCallback } from 'react';

interface GeolocationData {
  lat: number;
  lng: number;
  accuracy: number | null;
}

interface GeolocationState {
  data: GeolocationData | null;
  loading: boolean;
  error: string | null;
  available: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    data: null,
    loading: false,
    error: null,
    available: 'geolocation' in navigator,
  });

  const getCurrentPosition = useCallback(async (): Promise<GeolocationData | null> => {
    if (!state.available) {
      setState(prev => ({ ...prev, error: 'Geolocation is not supported' }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const data: GeolocationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          
          setState({
            data,
            loading: false,
            error: null,
            available: true,
          });
          
          resolve(data);
        },
        (error) => {
          let errorMessage = 'Failed to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          
          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
          
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }, [state.available]);

  // Don't auto-request location on mount - let user control when to capture
  // This follows professional enterprise patterns

  // Only get location once on mount, no continuous watching
  // This prevents repeated permission prompts

  const clearLocation = useCallback(() => {
    setState(prev => ({
      ...prev,
      data: null,
      error: null,
    }));
  }, []);

  const retry = useCallback(() => {
    getCurrentPosition();
  }, [getCurrentPosition]);

  return {
    ...state,
    getCurrentPosition,
    clearLocation,
    retry,
  };
}
