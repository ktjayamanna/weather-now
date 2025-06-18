'use client';

import { X, Wind, Eye, Droplets, Sun, RefreshCw, Cloud } from 'lucide-react';
import { City } from '@/types/weather';
import { WeatherIcon } from '@/components/WeatherIcon';
import { HourlyForecast } from '@/components/HourlyForecast';
import { DailyForecast } from '@/components/DailyForecast';
import { formatLastUpdated, getTemperatureDisplay } from '@/lib/utils';
import { useAppStore } from '@/store';

interface CityDetailsModalProps {
  city: City;
  onClose: () => void;
  onRefresh?: (cityId: string) => void;
  isRefreshing?: boolean;
  isForecastLoading?: boolean;
}

export function CityDetailsModal({ city, onClose, onRefresh, isRefreshing = false, isForecastLoading = false }: CityDetailsModalProps) {
  const { settings, setForecastView } = useAppStore();
  const getWeatherGradient = (condition: string) => {
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
      return 'from-yellow-400 to-orange-500';
    } else if (lowerCondition.includes('cloud')) {
      return 'from-gray-400 to-gray-600';
    } else if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
      return 'from-blue-500 to-blue-700';
    } else if (lowerCondition.includes('snow')) {
      return 'from-blue-200 to-blue-400';
    } else if (lowerCondition.includes('thunder') || lowerCondition.includes('storm')) {
      return 'from-purple-600 to-gray-800';
    }
    return 'from-blue-400 to-blue-600';
  };

  const getTimeOfDay = (cityTimezone?: string) => {
    // Get current hour in the city's timezone
    const now = new Date();
    const hour = parseInt(now.toLocaleString('en-US', {
      timeZone: cityTimezone || 'UTC',
      hour: '2-digit',
      hour12: false
    }));

    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  };





  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl rounded-3xl overflow-hidden bg-gradient-to-br ${
        getWeatherGradient(city.currentWeather?.condition?.text || 'clear')
      } shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto scrollbar-custom`} data-testid="city-details-modal">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          data-testid="close-modal-button"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={() => onRefresh(city.id)}
            disabled={isRefreshing}
            className="absolute top-4 right-16 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors disabled:opacity-50"
            data-testid="refresh-button"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 pt-8 sm:pt-10">
          {/* Location */}
          <div className="text-center text-white mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-light mb-1">{city.name}</h2>
            <p className="text-white/80 text-xs sm:text-sm">
              {city.region && city.region !== city.name ? `${city.region}, ` : ''}
              {city.country}
            </p>

            {city.lastUpdated && (
              <p className="text-white/60 text-xs mt-1 hidden lg:block">
                Last updated: {formatLastUpdated(city.lastUpdated)}
              </p>
            )}
          </div>

          {/* Temperature */}
          <div className="text-center text-white mb-3 sm:mb-4">
            <div className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-thin mb-1 sm:mb-2 lg:mb-3">
              {city.currentWeather ?
                getTemperatureDisplay(city.currentWeather.temp_c, city.currentWeather.temp_f, settings.temperatureUnit)
                : '--°'
              }
            </div>
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-1">
              <p className="text-white/90 text-base sm:text-lg lg:text-xl">
                {city.currentWeather?.condition?.text || 'Loading...'}
              </p>
              {city.currentWeather?.condition?.text && (
                <div className="opacity-90">
                  <WeatherIcon
                    condition={city.currentWeather.condition.text}
                    size="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
                  />
                </div>
              )}
            </div>
            {/* Feels like - hide on small/medium screens */}
            <p className="text-white/80 text-xs sm:text-sm hidden lg:block">
              {getTimeOfDay(city.timezone)} • Feels like {city.currentWeather ?
                getTemperatureDisplay(city.currentWeather.feelslike_c, city.currentWeather.feelslike_f, settings.temperatureUnit)
                : '--°'
              }
            </p>
          </div>

          {/* High/Low - show on medium screens and up */}
          <div className="text-center text-white mb-3 sm:mb-4 hidden md:block">
            <div className="flex justify-center space-x-6 sm:space-x-8">
              <div>
                <p className="text-white/70 text-xs sm:text-sm">High</p>
                <p className="text-white text-sm sm:text-base lg:text-lg font-medium">
                  {city.currentWeather?.temp_c ? `${Math.round(city.currentWeather.temp_c + 5)}°` : '--°'}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-xs sm:text-sm">Low</p>
                <p className="text-white text-sm sm:text-base lg:text-lg font-medium">
                  {city.currentWeather?.temp_c ? `${Math.round(city.currentWeather.temp_c - 8)}°` : '--°'}
                </p>
              </div>
            </div>
          </div>

          {/* Forecast Toggle - show on small screens and up */}
          <div className="mb-3 sm:mb-4 hidden sm:block">
            {/* Toggle Buttons */}
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-md rounded-lg p-1 flex">
                <button
                  onClick={() => setForecastView('hourly')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    settings.forecastView === 'hourly'
                      ? 'bg-white/30 text-white shadow-sm'
                      : 'text-white/70 hover:text-white/90'
                  }`}
                  data-testid="hourly-forecast-button"
                >
                  Hourly
                </button>
                <button
                  onClick={() => setForecastView('daily')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    settings.forecastView === 'daily'
                      ? 'bg-white/30 text-white shadow-sm'
                      : 'text-white/70 hover:text-white/90'
                  }`}
                  data-testid="daily-forecast-button"
                >
                  Daily
                </button>
              </div>
            </div>

            {/* Conditional Forecast Display */}
            {settings.forecastView === 'hourly' ? (
              <div data-testid="hourly-forecast">
                <HourlyForecast
                  hourlyData={[
                    ...(city.forecast?.forecastday?.[0]?.hour || []),
                    ...(city.forecast?.forecastday?.[1]?.hour || [])
                  ]}
                  isLoading={isForecastLoading}
                  localtime={city.localtime}
                />
              </div>
            ) : (
              <div data-testid="daily-forecast">
                <DailyForecast
                  dailyData={city.forecast?.forecastday || []}
                  isLoading={isForecastLoading}
                />
              </div>
            )}
          </div>

          {/* Weather Details Grid - Responsive multi-column layout */}
          <div className="mb-3 sm:mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {/* Priority 1: Humidity - Always visible */}
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                    <span className="text-white/70 text-xs sm:text-sm">Humidity</span>
                  </div>
                  <span className="text-white text-sm sm:text-base lg:text-lg font-medium">
                    {city.currentWeather?.humidity || '--'}%
                  </span>
                </div>
              </div>

              {/* Priority 2: Wind Speed - Always visible */}
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                    <span className="text-white/70 text-xs sm:text-sm">Wind</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm sm:text-base lg:text-lg font-medium">
                      {city.currentWeather?.wind_kph ? `${Math.round(city.currentWeather.wind_kph)} km/h` : '-- km/h'}
                    </div>
                    <div className="text-white/70 text-xs hidden lg:block">
                      {city.currentWeather?.wind_dir || '--'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority 3: UV Index - Always visible */}
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                    <span className="text-white/70 text-xs sm:text-sm">UV Index</span>
                  </div>
                  <span className="text-white text-sm sm:text-base lg:text-lg font-medium">
                    {city.currentWeather?.uv || '--'}
                  </span>
                </div>
              </div>

              {/* Secondary metrics - show on small screens and up */}
              <div className="hidden sm:block bg-white/20 backdrop-blur-md rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                    <span className="text-white/70 text-xs sm:text-sm">Visibility</span>
                  </div>
                  <span className="text-white text-sm sm:text-base lg:text-lg font-medium">
                    {city.currentWeather?.vis_km ? `${city.currentWeather.vis_km} km` : '-- km'}
                  </span>
                </div>
              </div>

              <div className="hidden sm:block bg-white/20 backdrop-blur-md rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/70"></div>
                    <span className="text-white/70 text-xs sm:text-sm">Pressure</span>
                  </div>
                  <span className="text-white text-sm sm:text-base lg:text-lg font-medium">
                    {city.currentWeather?.pressure_mb ? `${city.currentWeather.pressure_mb} mb` : '-- mb'}
                  </span>
                </div>
              </div>

              {/* Cloud Coverage - Complete the grid */}
              <div className="hidden sm:block bg-white/20 backdrop-blur-md rounded-xl p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Cloud className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
                    <span className="text-white/70 text-xs sm:text-sm">Cloud Cover</span>
                  </div>
                  <span className="text-white text-sm sm:text-base lg:text-lg font-medium">
                    {city.currentWeather?.cloud !== undefined ? `${city.currentWeather.cloud}%` : '--%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
