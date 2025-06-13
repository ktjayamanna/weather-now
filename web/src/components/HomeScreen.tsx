'use client';

import { Search, MapPin } from 'lucide-react';
import { City } from '@/types/weather';

interface HomeScreenProps {
  cities: City[];
  onSearch: (query: string) => void;
  onCityClick: (city: City) => void;
  isLoading?: boolean;
}

export function HomeScreen({ cities, onSearch, onCityClick, isLoading }: HomeScreenProps) {
  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 px-4 py-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center text-white mb-8">
          <h1 className="text-3xl font-light mb-2">Weather</h1>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="search"
              placeholder="Search for a city or airport"
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
            />
          </div>
        </form>

        {/* Cities List */}
        <div className="space-y-4">
          {cities.length === 0 ? (
            <div className="text-center text-white/80 py-12">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No cities added yet</p>
              <p className="text-sm opacity-70">Search for a city to get started</p>
            </div>
          ) : (
            cities.map((city) => (
              <div
                key={city.id}
                onClick={() => onCityClick(city)}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${getWeatherGradient(
                  city.currentWeather?.condition?.text || 'clear'
                )} p-6 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg`}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white text-xl font-medium mb-1">
                        {city.name}
                      </h3>
                      <p className="text-white/80 text-sm mb-2">
                        {city.region && city.region !== city.name ? `${city.region}, ` : ''}
                        {city.country}
                      </p>
                      <p className="text-white/90 text-sm">
                        {city.currentWeather?.condition?.text || 'Loading...'}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-3xl font-light mb-1">
                        {city.currentWeather?.temp_c ? `${Math.round(city.currentWeather.temp_c)}°` : '--°'}
                      </div>
                      <div className="text-white/80 text-sm">
                        H:{city.currentWeather?.temp_c ? `${Math.round(city.currentWeather.temp_c + 5)}°` : '--°'} L:{city.currentWeather?.temp_c ? `${Math.round(city.currentWeather.temp_c - 8)}°` : '--°'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Background overlay for better text readability */}
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
