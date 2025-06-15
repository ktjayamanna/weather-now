'use client';

import { X, Wind, Eye, Droplets, Sun } from 'lucide-react';
import { City } from '@/types/weather';
import { WeatherIcon } from '@/components/WeatherIcon';

interface CityDetailsModalProps {
  city: City;
  onClose: () => void;
}

export function CityDetailsModal({ city, onClose }: CityDetailsModalProps) {
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
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
        getWeatherGradient(city.currentWeather?.condition?.text || 'clear')
      } shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 pt-12">
          {/* Location */}
          <div className="text-center text-white mb-8">
            <h2 className="text-2xl font-light mb-1">{city.name}</h2>
            <p className="text-white/80 text-sm">
              {city.region && city.region !== city.name ? `${city.region}, ` : ''}
              {city.country}
            </p>
            <p className="text-white/60 text-xs mt-1">
              Last updated: {formatTime(city.lastUpdated)}
            </p>
          </div>

          {/* Temperature */}
          <div className="text-center text-white mb-8">
            <div className="text-7xl font-thin mb-4">
              {city.currentWeather?.temp_c ? `${Math.round(city.currentWeather.temp_c)}°` : '--°'}
            </div>
            <div className="flex items-center justify-center space-x-3 mb-2">
              <p className="text-white/90 text-xl">
                {city.currentWeather?.condition?.text || 'Loading...'}
              </p>
              {city.currentWeather?.condition?.text && (
                <div className="opacity-90">
                  <WeatherIcon
                    condition={city.currentWeather.condition.text}
                    size="h-6 w-6"
                  />
                </div>
              )}
            </div>
            <p className="text-white/80 text-sm">
              {getTimeOfDay()} • Feels like {city.currentWeather?.feelslike_c ? `${Math.round(city.currentWeather.feelslike_c)}°` : '--°'}
            </p>
          </div>

          {/* High/Low */}
          <div className="text-center text-white mb-8">
            <div className="flex justify-center space-x-8">
              <div>
                <p className="text-white/70 text-sm">High</p>
                <p className="text-white text-lg font-medium">
                  {city.currentWeather?.temp_c ? `${Math.round(city.currentWeather.temp_c + 5)}°` : '--°'}
                </p>
              </div>
              <div>
                <p className="text-white/70 text-sm">Low</p>
                <p className="text-white text-lg font-medium">
                  {city.currentWeather?.temp_c ? `${Math.round(city.currentWeather.temp_c - 8)}°` : '--°'}
                </p>
              </div>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="space-y-4 mb-6">
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Droplets className="w-5 h-5 text-white/70" />
                  <span className="text-white/70 text-sm">Humidity</span>
                </div>
                <span className="text-white text-lg font-medium">
                  {city.currentWeather?.humidity || '--'}%
                </span>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Wind className="w-5 h-5 text-white/70" />
                  <span className="text-white/70 text-sm">Wind</span>
                </div>
                <div className="text-right">
                  <div className="text-white text-lg font-medium">
                    {city.currentWeather?.wind_kph ? `${Math.round(city.currentWeather.wind_kph)} km/h` : '-- km/h'}
                  </div>
                  <div className="text-white/70 text-xs">
                    {city.currentWeather?.wind_dir || '--'}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Eye className="w-5 h-5 text-white/70" />
                  <span className="text-white/70 text-sm">Visibility</span>
                </div>
                <span className="text-white text-lg font-medium">
                  {city.currentWeather?.vis_km ? `${city.currentWeather.vis_km} km` : '-- km'}
                </span>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Sun className="w-5 h-5 text-white/70" />
                  <span className="text-white/70 text-sm">UV Index</span>
                </div>
                <span className="text-white text-lg font-medium">
                  {city.currentWeather?.uv || '--'}
                </span>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-white/70"></div>
                  <span className="text-white/70 text-sm">Pressure</span>
                </div>
                <span className="text-white text-lg font-medium">
                  {city.currentWeather?.pressure_mb ? `${city.currentWeather.pressure_mb} mb` : '-- mb'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
