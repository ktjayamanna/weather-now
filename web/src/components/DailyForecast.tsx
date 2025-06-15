'use client';

import { DayWeather } from '@/types/weather';
import { WeatherIcon } from '@/components/WeatherIcon';
import { getTemperatureDisplay } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';

interface DailyForecastProps {
  dailyData: DayWeather[];
  className?: string;
  isLoading?: boolean;
  timezone?: string;
}

export function DailyForecast({ dailyData, className = '', isLoading = false }: DailyForecastProps) {
  const { settings } = useSettingsStore();

  const formatDayName = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }

    // Check if it's tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }

    // Return day name for other days
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <h3 className="text-white/90 text-sm sm:text-base font-medium mb-3 sm:mb-4">
          Daily Forecast
        </h3>

        {/* Loading skeleton */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
          <div className="flex justify-between items-start gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-2 animate-pulse flex-1 min-w-0"
              >
                <div className="w-8 h-3 bg-white/20 rounded"></div>
                <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                <div className="w-8 h-3 bg-white/20 rounded"></div>
                <div className="w-8 h-3 bg-white/20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Just use all available forecast data from the free tier (maximize what we get)
  const createCombinedData = () => {
    if (!dailyData || dailyData.length === 0) {
      return [];
    }

    // Use all available days from the API (free tier gives us what it gives us)
    // This will show Saturday, Today, Tomorrow, Tuesday, etc. - whatever the API provides
    return dailyData;
  };

  const displayDays = createCombinedData();

  if (displayDays.length === 0) {
    return (
      <div className={`${className}`}>
        <h3 className="text-white/90 text-sm sm:text-base font-medium mb-3 sm:mb-4">
          Daily Forecast
        </h3>
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
          <p className="text-white/70 text-center text-sm">
            Forecast data unavailable
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-white/90 text-sm sm:text-base font-medium mb-3 sm:mb-4">
        Daily Forecast
      </h3>

      {/* Daily forecast - flex layout for better spacing */}
      <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
        <div className="flex justify-between items-start gap-2">
          {displayDays.map((day) => (
            <div
              key={day.date_epoch}
              className="flex flex-col items-center space-y-1 sm:space-y-2 flex-1 min-w-0"
            >
              {/* Day */}
              <div className="text-white/80 text-xs font-medium whitespace-nowrap">
                {formatDayName(day.date)}
              </div>

              {/* Weather Icon */}
              <div className="opacity-90">
                <WeatherIcon
                  condition={day.day.condition.text}
                  size="h-6 w-6 sm:h-8 sm:w-8"
                />
              </div>

              {/* High Temperature */}
              <div className="text-white text-xs sm:text-sm font-medium">
                {getTemperatureDisplay(day.day.maxtemp_c, day.day.maxtemp_f, settings.temperatureUnit)}
              </div>

              {/* Low Temperature */}
              <div className="text-white/70 text-xs sm:text-sm">
                {getTemperatureDisplay(day.day.mintemp_c, day.day.mintemp_f, settings.temperatureUnit)}
              </div>

              {/* Precipitation chance (if > 0) */}
              {day.day.daily_chance_of_rain > 0 && (
                <div className="text-blue-200 text-xs">
                  {day.day.daily_chance_of_rain}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
