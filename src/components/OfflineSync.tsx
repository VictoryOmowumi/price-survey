'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wifi, WifiOff, RefreshCw, Loader2 } from 'lucide-react';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { toast } from 'sonner';

interface OfflineSyncProps {
  className?: string;
}

export function OfflineSync({ className }: OfflineSyncProps) {
  const { pendingCount, isOnline, retryAll } = useOfflineQueue();
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetryAll = async () => {
    if (!isOnline) {
      toast.error('Device is offline. Please check your connection.');
      return;
    }

    if (pendingCount === 0) {
      toast.info('No pending submissions to sync.');
      return;
    }

    setIsRetrying(true);
    try {
      const result = await retryAll();
      if (result.success > 0) {
        toast.success(`Successfully synced ${result.success} submission${result.success > 1 ? 's' : ''}`);
      }
      if (result.failed > 0) {
        toast.error(`Failed to sync ${result.failed} submission${result.failed > 1 ? 's' : ''}`);
      }
    } catch (error) {
      toast.error('Failed to sync submissions. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  if (pendingCount === 0 && isOnline) {
    return null;
  }

  return (
    <div className={className}>
      {/* Pending count badge */}
      {pendingCount > 0 && (
        <Badge variant="destructive" className="mb-2">
          {pendingCount} pending
        </Badge>
      )}

      {/* Offline status card */}
      <Card className={`border-2 shadow-lg ${isOnline ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-orange-600" />
            )}
            <CardTitle className={`text-sm font-semibold ${isOnline ? 'text-green-700' : 'text-orange-700'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </CardTitle>
          </div>
          <CardDescription className={`text-xs ${isOnline ? 'text-green-600' : 'text-orange-600'}`}>
            {isOnline 
              ? 'All submissions will be sent immediately'
              : 'Submissions will be queued for later sync'
            }
          </CardDescription>
        </CardHeader>
        
        {pendingCount > 0 && (
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <span className="text-sm text-orange-700">
                {pendingCount} submission{pendingCount > 1 ? 's' : ''} waiting to sync
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryAll}
                disabled={!isOnline || isRetrying}
                className="h-8 px-3 text-xs border-orange-300 text-orange-700 hover:bg-orange-100 disabled:opacity-50"
              >
                {isRetrying ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Retry All
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
