'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  offlineReportQueue,
  QueuedReportItem,
} from '@/lib/reports/offlineQueue';
import {
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface OfflineQueueListProps {
  onItemDelivered?: (reportId: string) => void;
  className?: string;
}

export function OfflineQueueList({
  onItemDelivered,
  className = '',
}: OfflineQueueListProps) {
  const [items, setItems] = useState<QueuedReportItem[]>([]);
  const [isRetryingAll, setIsRetryingAll] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const refreshItems = useCallback(async () => {
    try {
      const qItems = await offlineReportQueue.getItems();
      setItems(qItems);
    } catch {
      // IndexedDB might not be available in SSR
    }
  }, []);

  useEffect(() => {
    refreshItems();
    const unsubscribe = offlineReportQueue.subscribe(refreshItems);

    const handleOnline = () => {
      setIsOnline(true);
      refreshItems();
    };
    const handleOffline = () => {
      setIsOnline(false);
      refreshItems();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshItems]);

  const handleRetryAll = async () => {
    setIsRetryingAll(true);
    try {
      await offlineReportQueue.processAll();
      await refreshItems();
    } finally {
      setIsRetryingAll(false);
    }
  };

  const handleRetryItem = async (item: QueuedReportItem) => {
    try {
      const res = await offlineReportQueue.processItem(item);
      if (res.ok && res.result?.reportId && onItemDelivered) {
        onItemDelivered(res.result.reportId);
      }
      await refreshItems();
    } catch {}
  };

  const handleRemoveItem = async (idempotencyKey: string) => {
    await offlineReportQueue.removeItem(idempotencyKey);
    await refreshItems();
  };

  if (items.length === 0) {
    return null;
  }

  const renderStatusBadge = (status: QueuedReportItem['status']) => {
    switch (status) {
      case 'retrying':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#EDF1F5] text-[#536A82] border border-[#536A82]/20">
            <RefreshCw className="w-3 h-3 animate-spin text-[#536A82]" />
            <span>Retrying delivery...</span>
          </span>
        );
      case 'needs_correction':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FAE8E7] text-[#B74349] border border-[#B74349]/20">
            <AlertCircle className="w-3 h-3 text-[#B74349]" />
            <span>Needs correction</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#E5EEE8] text-[#377D65] border border-[#377D65]/20">
            <CheckCircle className="w-3 h-3 text-[#377D65]" />
            <span>Delivered</span>
          </span>
        );
      case 'local_only':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FFF2DD] text-[#A87426] border border-[#A87426]/20">
            <Clock className="w-3 h-3 text-[#A87426]" />
            <span>Local only</span>
          </span>
        );
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-[#E8E6E1] shadow-sm p-4 sm:p-5 space-y-3.5 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#E8E6E1]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FFF2DD] text-[#A87426]">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#252A30] flex items-center gap-2">
              <span>Offline Device Queue</span>
              <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-[#FFF2DD] text-[#A87426] border border-[#A87426]/20">
                {items.length} {items.length === 1 ? 'report' : 'reports'}
              </span>
            </h4>
            <p className="text-[11px] text-[#757B81]">
              {isOnline
                ? 'Device is online. Ready to deliver queued reports.'
                : 'Device is offline. Reports will deliver automatically when connection restores.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRetryAll}
          disabled={isRetryingAll || items.length === 0}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#536A82] hover:bg-[#40566D] text-white font-bold text-xs shadow-2xs transition-colors disabled:opacity-60 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetryingAll ? 'animate-spin' : ''}`} />
          <span>{isRetryingAll ? 'Retrying All...' : 'Retry Now'}</span>
        </button>
      </div>

      {/* Prominent Mandatory Offline Warning (Rule 3) */}
      <div className="p-3 bg-[#FFF2DD] border border-[#A87426]/30 rounded-xl text-[#A87426] text-xs flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-[#A87426] shrink-0" />
        <span className="font-bold tracking-tight">
          Saved on this device. NOT delivered yet.
        </span>
      </div>

      {/* Queued Items List (Rule 6) */}
      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.idempotencyKey}
            className="p-3 rounded-xl bg-[#F7F6F2] border border-[#E8E6E1] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
          >
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {renderStatusBadge(item.status)}
                <span className="font-semibold text-[#252A30] truncate">
                  {item.payload.locationDescription || 'No description'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#757B81]">
                <span>
                  Queued: {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {item.retryCount > 0 && <span>Attempts: {item.retryCount}</span>}
                {item.error && (
                  <span className="text-[#B74349] font-medium truncate max-w-xs">
                    {item.error}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={() => handleRetryItem(item)}
                disabled={item.status === 'retrying'}
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E8E6E1] hover:bg-[#F7F6F2] text-[#252A30] text-xs font-semibold transition-colors cursor-pointer"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.idempotencyKey)}
                className="p-1 rounded-lg text-[#92979D] hover:text-[#B74349] hover:bg-white transition-colors cursor-pointer"
                title="Discard from device"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
