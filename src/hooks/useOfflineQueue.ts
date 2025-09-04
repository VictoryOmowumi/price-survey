import { useState, useEffect, useCallback } from 'react';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SubmissionCreateType } from '@/schemas/submission';

interface PendingSubmission extends SubmissionCreateType {
  id: string;
  timestamp: number;
  retryCount: number;
}

interface PriceSurveyDB extends DBSchema {
  submissions: {
    key: string;
    value: PendingSubmission;
  };
}

let dbPromise: Promise<IDBPDatabase<PriceSurveyDB>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<PriceSurveyDB>('price-survey-db', 1, {
      upgrade(db) {
        db.createObjectStore('submissions', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
};

export function useOfflineQueue() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update pending count
  const updatePendingCount = useCallback(async () => {
    try {
      const db = await getDB();
      const count = await db.count('submissions');
      setPendingCount(count);
    } catch (error) {
      console.error('Failed to get pending count:', error);
    }
  }, []);

  useEffect(() => {
    updatePendingCount();
  }, [updatePendingCount]);

  // Add submission to queue
  const addToQueue = useCallback(async (submission: SubmissionCreateType) => {
    try {
      const db = await getDB();
      const pendingSubmission: PendingSubmission = {
        ...submission,
        id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        retryCount: 0,
      };
      
      await db.add('submissions', pendingSubmission);
      await updatePendingCount();
      return pendingSubmission.id;
    } catch (error) {
      console.error('Failed to add to queue:', error);
      throw error;
    }
  }, [updatePendingCount]);

  // Remove submission from queue
  const removeFromQueue = useCallback(async (id: string) => {
    try {
      const db = await getDB();
      await db.delete('submissions', id);
      await updatePendingCount();
    } catch (error) {
      console.error('Failed to remove from queue:', error);
    }
  }, [updatePendingCount]);

  // Get all pending submissions
  const getPendingSubmissions = useCallback(async (): Promise<PendingSubmission[]> => {
    try {
      const db = await getDB();
      return await db.getAll('submissions');
    } catch (error) {
      console.error('Failed to get pending submissions:', error);
      return [];
    }
  }, []);

  // Submit a single pending submission
  const submitPending = useCallback(async (submission: PendingSubmission): Promise<boolean> => {
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: submission.customerName,
          customerPhone: submission.customerPhone,
          outletName: submission.outletName,
          area: submission.area,
          items: submission.items,
          geo: submission.geo,
          collectedAt: submission.collectedAt,
        }),
      });

      if (response.ok) {
        await removeFromQueue(submission.id);
        return true;
      } else {
        // Increment retry count
        const db = await getDB();
        const updatedSubmission = {
          ...submission,
          retryCount: submission.retryCount + 1,
        };
        
        // Remove if too many retries
        if (updatedSubmission.retryCount >= 3) {
          await removeFromQueue(submission.id);
        } else {
          await db.put('submissions', updatedSubmission);
        }
        
        return false;
      }
    } catch (error) {
      console.error('Failed to submit pending:', error);
      return false;
    }
  }, [removeFromQueue]);

  // Retry all pending submissions
  const retryAll = useCallback(async (): Promise<{ success: number; failed: number }> => {
    if (!isOnline) {
      throw new Error('Device is offline');
    }

    const pending = await getPendingSubmissions();
    let success = 0;
    let failed = 0;

    for (const submission of pending) {
      const result = await submitPending(submission);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    await updatePendingCount();
    return { success, failed };
  }, [isOnline, getPendingSubmissions, submitPending, updatePendingCount]);

  // Auto-retry when coming online
  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      const autoRetry = async () => {
        try {
          await retryAll();
        } catch (error) {
          console.error('Auto-retry failed:', error);
        }
      };
      
      // Small delay to ensure connection is stable
      const timeoutId = setTimeout(autoRetry, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [isOnline, pendingCount, retryAll]);

  return {
    pendingCount,
    isOnline,
    addToQueue,
    removeFromQueue,
    getPendingSubmissions,
    retryAll,
    updatePendingCount,
  };
}
