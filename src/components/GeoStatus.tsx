'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, MapPinOff, Loader2 } from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';

export function GeoStatus() {
  const { data, loading, error, retry } = useGeolocation();

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border-2 border-blue-200 shadow-sm">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <span className="text-sm text-blue-700 font-medium">Getting location...</span>
      </div>
    );
  }

  if (data) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border-2 border-green-200 shadow-sm">
        <MapPin className="h-5 w-5 text-green-600" />
        <div className="flex-1">
          <span className="text-sm text-green-700 font-semibold">Location captured</span>
          <div className="text-xs text-green-600 mt-1">
            {data.lat.toFixed(6)}, {data.lng.toFixed(6)}
            {data.accuracy && ` (±${Math.round(data.accuracy)}m)`}
          </div>
          <div className="text-xs text-green-500 mt-1">
            Tap refresh if you've moved to a new location
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={retry}
          className="text-xs h-8 px-3 border-green-300 text-green-700 hover:bg-green-100"
        >
          Refresh
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200 shadow-sm">
        <MapPinOff className="h-5 w-5 text-yellow-600" />
        <div className="flex-1">
          <span className="text-sm text-yellow-700 font-semibold">Location unavailable</span>
          <div className="text-xs text-yellow-600 mt-1">{error}</div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={retry}
          className="text-xs h-8 px-3 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
        >
          Retry
        </Button>
      </div>
    );
  }

  return null;
}
