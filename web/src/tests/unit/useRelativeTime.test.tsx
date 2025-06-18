/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import React from 'react';
import { renderHook } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { useRelativeTime, RelativeTimeDisplay } from '@/hooks/useRelativeTime';

// Mock the formatLastUpdatedShort function
jest.mock('@/lib/utils', () => ({
  formatLastUpdatedShort: jest.fn((timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date('2024-01-01T12:00:00Z');
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    }
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}d ago`;
  })
}));

describe('useRelativeTime Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return empty string for null timestamp', () => {
    const { result } = renderHook(() => useRelativeTime(null));
    expect(result.current).toBe('');
  });

  it('should return formatted relative time for valid timestamp', () => {
    const timestamp = new Date('2024-01-01T11:30:00Z').toISOString(); // 30 minutes ago
    const { result } = renderHook(() => useRelativeTime(timestamp));
    expect(result.current).toBe('30m ago');
  });

  it('should set up interval for updates', () => {
    const timestamp = new Date('2024-01-01T11:59:00Z').toISOString(); // 1 minute ago
    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    renderHook(() => useRelativeTime(timestamp, 1000));

    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
    setIntervalSpy.mockRestore();
  });

  it('should cleanup interval on unmount', () => {
    const timestamp = new Date('2024-01-01T11:30:00Z').toISOString();
    const { unmount } = renderHook(() => useRelativeTime(timestamp));
    
    const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
    unmount();
    
    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});

describe('RelativeTimeDisplay Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render nothing for null timestamp', () => {
    const { container } = render(<RelativeTimeDisplay timestamp={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render relative time with default prefix', () => {
    const timestamp = new Date('2024-01-01T11:30:00Z').toISOString();
    render(<RelativeTimeDisplay timestamp={timestamp} />);
    
    expect(screen.getByText('Updated 30m ago')).toBeInTheDocument();
  });

  it('should render relative time with custom prefix', () => {
    const timestamp = new Date('2024-01-01T11:30:00Z').toISOString();
    render(<RelativeTimeDisplay timestamp={timestamp} prefix="Last updated " />);
    
    expect(screen.getByText('Last updated 30m ago')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const timestamp = new Date('2024-01-01T11:30:00Z').toISOString();
    render(<RelativeTimeDisplay timestamp={timestamp} className="custom-class" />);
    
    const element = screen.getByText('Updated 30m ago');
    expect(element).toHaveClass('custom-class');
  });

  it('should set up interval for component updates', () => {
    const timestamp = new Date('2024-01-01T11:59:00Z').toISOString();
    const setIntervalSpy = jest.spyOn(global, 'setInterval');

    render(<RelativeTimeDisplay timestamp={timestamp} updateInterval={1000} />);

    expect(screen.getByText('Updated 1m ago')).toBeInTheDocument();
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

    setIntervalSpy.mockRestore();
  });
});
