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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#F0F4F8] text-[#375A6B] border border-[#375A6B]/25">
            <RefreshCw className="w-3 h-3 animate-spin text-[#375A6B]" />
            <span>Retrying delivery...</span>
          </span>
        );
      case 'needs_correction':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FBECEE] text-[#BC414A] border border-[#BC414A]/25">
            <AlertCircle className="w-3 h-3 text-[#BC414A]" />
            <span>Needs correction</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#EBF7F2] text-[#258167] border border-[#258167]/25">
            <CheckCircle className="w-3 h-3 text-[#258167]" />
            <span>Delivered</span>
          </span>
        );
      case 'local_only':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#FFF5E6] text-[#A87528] border border-[#A87528]/25">
            <Clock className="w-3 h-3 text-[#A87528]" />
            <span>Local only</span>
          </span>
        );
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-[#E4E8EC] shadow-xs p-4 sm:p-5 space-y-3 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[#E4E8EC]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FFF5E6] text-[#A87528]">
            <WifiOff className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#18232D] flex items-center gap-2">
              <span>Offline Device Queue</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF5E6] text-[#A87528] border border-[#A87528]/25">
                {items.length} {items.length === 1 ? 'report' : 'reports'}
              </span>
            </h4>
            <p className="text-[11px] text-[#5F6B7A]">
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
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#375A6B] hover:bg-[#2C4855] text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetryingAll ? 'animate-spin' : ''}`} />
          <span>{isRetryingAll ? 'Retrying All...' : 'Retry Now'}</span>
        </button>
      </div>

      {/* Prominent Mandatory Offline Warning */}
      <div className="p-3 bg-[#FFF5E6] border border-[#A87528]/30 rounded-lg text-[#A87528] text-xs flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-[#A87528] shrink-0" />
        <span className="font-bold tracking-tight">
          Saved on this device. NOT delivered yet.
        </span>
      </div>

      {/* Queued Items List */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.idempotencyKey}
            className="p-3 rounded-lg bg-[#F7F8FA] border border-[#E4E8EC] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
          >
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {renderStatusBadge(item.status)}
                <span className="font-semibold text-[#18232D] truncate">
                  {item.payload.locationDescription || 'No description'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#5F6B7A]">
                <span>
                  Queued: {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {item.retryCount > 0 && <span>Attempts: {item.retryCount}</span>}
                {item.error && (
                  <span className="text-[#BC414A] font-medium truncate max-w-xs">
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
                className="px-2.5 py-1 rounded-lg bg-white border border-[#E4E8EC] hover:bg-[#F7F8FA] text-[#18232D] text-xs font-semibold transition-colors cursor-pointer"
              >
                Retry
              </button>
              <button
                type="button"
                onClick={() => handleRemoveItem(item.idempotencyKey)}
                className="p-1 rounded-lg text-[#5F6B7A] hover:text-[#BC414A] hover:bg-white transition-colors cursor-pointer"
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
