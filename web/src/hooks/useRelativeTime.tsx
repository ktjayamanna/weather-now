import { useState, useEffect, useRef } from 'react';
import { formatLastUpdatedShort } from '@/lib/utils';

/**
 * Custom hook that provides auto-updating relative time display
 * without causing parent component rerenders
 */
export function useRelativeTime(timestamp: string | null, updateInterval: number = 60000) {
  const [relativeTime, setRelativeTime] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!timestamp) {
      setRelativeTime('');
      return;
    }

    // Update immediately
    const updateTime = () => {
      setRelativeTime(formatLastUpdatedShort(timestamp));
    };

    updateTime();

    // Set up interval for updates
    intervalRef.current = setInterval(updateTime, updateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timestamp, updateInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return relativeTime;
}

/**
 * Component that displays auto-updating relative time
 * This component isolates the time updates to prevent parent rerenders
 */
interface RelativeTimeDisplayProps {
  timestamp: string | null;
  className?: string;
  prefix?: string;
  updateInterval?: number;
}

export function RelativeTimeDisplay({ 
  timestamp, 
  className = '', 
  prefix = 'Updated ',
  updateInterval = 60000 
}: RelativeTimeDisplayProps) {
  const relativeTime = useRelativeTime(timestamp, updateInterval);

  if (!timestamp || !relativeTime) {
    return null;
  }

  return (
    <span className={className}>
      {prefix}{relativeTime}
    </span>
  );
}
