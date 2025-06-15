'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HourlyWeather } from '@/types/weather';
import { WeatherIcon } from '@/components/WeatherIcon';
import { getTemperatureDisplay } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';

interface HourlyForecastProps {
  hourlyData: HourlyWeather[];
  className?: string;
  isLoading?: boolean;
  timezone?: string;
}

export function HourlyForecast({ hourlyData, className = '', isLoading = false, timezone }: HourlyForecastProps) {
  const { settings } = useSettingsStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Get next 24 hours of data starting from current hour
  const getCurrentHourIndex = () => {
    const now = new Date();
    const currentHour = now.getHours();

    // Find the index of the current hour in the hourly data
    const currentHourIndex = hourlyData.findIndex(hour => {
      const hourDate = new Date(hour.time);
      return hourDate.getHours() === currentHour &&
             hourDate.getDate() === now.getDate() &&
             hourDate.getMonth() === now.getMonth() &&
             hourDate.getFullYear() === now.getFullYear();
    });

    return currentHourIndex >= 0 ? currentHourIndex : 0;
  };

  const startIndex = getCurrentHourIndex();
  const next24Hours = hourlyData.slice(startIndex, startIndex + 24);

  // If we don't have enough hours from the current time, show what we have
  const displayHours = next24Hours.length > 0 ? next24Hours : hourlyData.slice(0, Math.min(24, hourlyData.length));

  const formatTime = (timeString: string, cityTimezone?: string) => {
    const date = new Date(timeString);
    const now = new Date();

    // Check if it's the current hour (within the same hour and day)
    if (date.getHours() === now.getHours() &&
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()) {
      return 'Now';
    }

    // Format as 12-hour time in the city's timezone if available
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      hour12: true,
      timeZone: cityTimezone || undefined
    };

    return date.toLocaleTimeString('en-US', options);
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        {/* Header */}
        <div className="flex items-center space-x-2 mb-4 px-1">
          <div className="w-4 h-4 rounded-full bg-white/30"></div>
          <span className="text-white/80 text-sm font-medium">Hourly Forecast</span>
        </div>

        {/* Loading skeleton */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
          <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
            {Array.from({ length: 24 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-2 min-w-[60px] flex-shrink-0 animate-pulse"
              >
                <div className="w-8 h-3 bg-white/20 rounded"></div>
                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                <div className="w-8 h-3 bg-white/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!displayHours.length && !isLoading) {
    return (
      <div className={`w-full ${className}`}>
        {/* Header */}
        <div className="flex items-center space-x-2 mb-4 px-1">
          <div className="w-4 h-4 rounded-full bg-white/30"></div>
          <span className="text-white/80 text-sm font-medium">Hourly Forecast</span>
        </div>

        {/* No data message */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
          <div className="text-center text-white/70 text-sm">
            Forecast data unavailable
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-white/30"></div>
          <span className="text-white/80 text-sm font-medium">Hourly Forecast</span>
        </div>

        {/* Navigation arrows for web */}
        <div className="hidden md:flex items-center space-x-2">
          <button
            onClick={scrollLeft}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white/70 hover:text-white"
            aria-label="Scroll left"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={scrollRight}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 text-white/70 hover:text-white"
            aria-label="Scroll right"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable hourly forecast */}
      <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
        <div
          ref={scrollContainerRef}
          className="flex space-x-3 overflow-x-auto scrollbar-hide hourly-scroll pb-2 px-1"
        >
          {displayHours.map((hour) => (
            <div
              key={hour.time_epoch}
              className="flex flex-col items-center space-y-1 sm:space-y-2 min-w-[45px] sm:min-w-[55px] flex-shrink-0"
            >
              {/* Time */}
              <div className="text-white/80 text-xs font-medium whitespace-nowrap">
                {formatTime(hour.time, timezone)}
              </div>

              {/* Weather Icon */}
              <div className="opacity-90">
                <WeatherIcon
                  condition={hour.condition.text}
                  size="h-6 w-6 sm:h-8 sm:w-8"
                />
              </div>

              {/* Temperature */}
              <div className="text-white text-xs sm:text-sm font-medium">
                {getTemperatureDisplay(hour.temp_c, hour.temp_f, settings.temperatureUnit)}
              </div>

              {/* Precipitation chance (if > 0) */}
              {hour.chance_of_rain > 0 && (
                <div className="text-blue-200 text-xs">
                  {hour.chance_of_rain}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
