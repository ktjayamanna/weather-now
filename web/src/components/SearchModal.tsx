'use client';

import { X, Plus } from 'lucide-react';
import { City } from '@/types/weather';
import { WeatherIcon } from '@/components/WeatherIcon';
import { getTemperatureDisplay } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';

interface SearchModalProps {
  city: City | null;
  isLoading: boolean;
  error: string | null;
  onAddCity: (city: City) => void;
  onClose: () => void;
}

export function SearchModal({ city, isLoading, error, onAddCity, onClose }: SearchModalProps) {
  const { settings } = useSettingsStore();
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

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
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
      <div className={`relative w-full max-w-sm rounded-3xl overflow-hidden bg-gradient-to-br ${
        city ? getWeatherGradient(city.currentWeather?.condition?.text || 'clear') : 'from-blue-400 to-blue-600'
      } shadow-2xl transform transition-all duration-300`} data-testid="search-modal">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 pt-12">
          {isLoading ? (
            <div className="text-center text-white py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading weather data...</p>
            </div>
          ) : error ? (
            <div className="text-center text-white py-12">
              <div className="text-red-200 mb-4">
                <p className="text-lg font-medium mb-2">City not found</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
            </div>
          ) : city ? (
            <>
              {/* Location */}
              <div className="text-center text-white mb-8">
                <h2 className="text-2xl font-light mb-1">{city.name}</h2>
                <p className="text-white/80 text-sm">
                  {city.region && city.region !== city.name ? `${city.region}, ` : ''}
                  {city.country}
                </p>
              </div>

              {/* Temperature */}
              <div className="text-center text-white mb-8">
                <div className="text-6xl font-thin mb-4">
                  {city.currentWeather ?
                    getTemperatureDisplay(city.currentWeather.temp_c, city.currentWeather.temp_f, settings.temperatureUnit)
                    : '--°'
                  }
                </div>
                <div className="flex flex-col items-center space-y-2 mb-2">
                  {city.currentWeather?.condition?.text && (
                    <div className="opacity-90">
                      <WeatherIcon
                        condition={city.currentWeather.condition.text}
                        size="h-12 w-12"
                      />
                    </div>
                  )}
                  <p className="text-white/90 text-lg">
                    {city.currentWeather?.condition?.text || 'Loading...'}
                  </p>
                </div>
                <p className="text-white/80 text-sm">
                  {getTimeOfDay()} • Feels like {city.currentWeather ?
                    getTemperatureDisplay(city.currentWeather.feelslike_c, city.currentWeather.feelslike_f, settings.temperatureUnit)
                    : '--°'
                  }
                </p>
              </div>

              {/* Weather Details */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
                  <p className="text-white/70 text-xs uppercase tracking-wide mb-1">Humidity</p>
                  <p className="text-white text-lg font-medium">
                    {city.currentWeather?.humidity || '--'}%
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
                  <p className="text-white/70 text-xs uppercase tracking-wide mb-1">Wind</p>
                  <p className="text-white text-lg font-medium">
                    {city.currentWeather?.wind_kph ? `${Math.round(city.currentWeather.wind_kph)} km/h` : '-- km/h'}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
                  <p className="text-white/70 text-xs uppercase tracking-wide mb-1">Visibility</p>
                  <p className="text-white text-lg font-medium">
                    {city.currentWeather?.vis_km ? `${city.currentWeather.vis_km} km` : '-- km'}
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
                  <p className="text-white/70 text-xs uppercase tracking-wide mb-1">UV Index</p>
                  <p className="text-white text-lg font-medium">
                    {city.currentWeather?.uv || '--'}
                  </p>
                </div>
              </div>

              {/* Add City Button */}
              <button
                onClick={() => onAddCity(city)}
                className="w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-xl py-4 px-6 text-white font-medium flex items-center justify-center space-x-2 hover:bg-white/30 transition-colors"
                data-testid="add-city-button"
              >
                <Plus className="w-5 h-5" />
                <span>Add to My Cities</span>
              </button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
