'use client';

import { MapPin, Pin, PinOff, Settings } from 'lucide-react';
import { City } from '@/types/weather';
import { SearchBar } from '@/components/SearchBar';
import { WeatherIcon } from '@/components/WeatherIcon';
import { formatLastUpdatedShort, getTemperatureDisplay } from '@/lib/utils';
import { useSettingsStore } from '@/store/settingsStore';
import { Button } from '@/components/ui/button';

interface HomeScreenProps {
  cities: City[];
  onSearch: (query: string) => void;
  onCityClick: (city: City) => void;
  onRemoveCity: (cityId: string) => void;
  onOpenSettings: () => void;
  isLoading?: boolean;
  clearSearchInput?: boolean;
  onClearComplete?: () => void;
}

export function HomeScreen({ cities, onSearch, onCityClick, onRemoveCity, onOpenSettings, isLoading, clearSearchInput, onClearComplete }: HomeScreenProps) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
        <div className="text-white text-center" data-testid="loading">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 px-4 py-8">
      <div className="max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
        <div className="relative text-center text-white mb-8">
          <h1 className="text-3xl font-light mb-2">Weather</h1>
          <Button
            onClick={onOpenSettings}
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 text-white hover:bg-white/20"
            data-testid="settings-button"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        <SearchBar
          onSearch={onSearch}
          isLoading={isLoading}
          placeholder="Search for a city or airport"
          className="mb-8 max-w-md mx-auto"
          clearInput={clearSearchInput}
          onClearComplete={onClearComplete}
        />

        <div className="relative">
          {cities.length === 0 ? (
            <div className="text-center text-white/80 py-12">
              <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No cities added yet</p>
              <p className="text-sm opacity-70">Search for a city to get started</p>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto scrollbar-custom">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6 p-2 pr-4">
                {cities.map((city) => (
                <div
                  key={city.id}
                  className={`city-card relative overflow-hidden rounded-2xl bg-gradient-to-r ${getWeatherGradient(
                    city.currentWeather?.condition?.text || 'clear'
                  )} p-4 md:p-5 lg:p-6 animate-slide-in group`}
                  data-testid="city-card"
                >
                  <div
                    onClick={() => onCityClick(city)}
                    className="cursor-pointer relative z-10"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-3 md:pr-4">
                        <div className="flex items-center space-x-2 mb-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveCity(city.id);
                            }}
                            className="group/pin w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center hover:bg-white/10 hover:backdrop-blur-sm transition-all duration-200 hover:scale-110"
                            title="Unpin city"
                            data-testid="remove-city-button"
                          >
                            <Pin className="w-3 h-3 md:w-4 md:h-4 text-white/70 group-hover/pin:hidden transition-all duration-200" />
                            <PinOff className="w-3 h-3 md:w-4 md:h-4 text-white/50 hidden group-hover/pin:block transition-all duration-200" />
                          </button>
                          <h3 className="text-white text-lg md:text-xl font-medium truncate">
                            {city.name}
                          </h3>
                        </div>
                        <p className="text-white/80 text-xs md:text-sm mb-1 md:mb-2 truncate">
                          {city.region && city.region !== city.name ? `${city.region}, ` : ''}
                          {city.country}
                        </p>
                        <p className="text-white/90 text-xs md:text-sm truncate">
                          {city.currentWeather?.condition?.text || 'Loading...'}
                        </p>
                        {city.lastUpdated && (
                          <p className="text-white/60 text-xs mt-1">
                            Updated {formatLastUpdatedShort(city.lastUpdated)}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <div className="flex items-center space-x-1 md:space-x-2 mb-1">
                          <div className="text-white text-2xl md:text-3xl font-light">
                            {city.currentWeather ?
                              getTemperatureDisplay(city.currentWeather.temp_c, city.currentWeather.temp_f, settings.temperatureUnit)
                              : '--°'
                            }
                          </div>
                          {city.currentWeather?.condition?.text && (
                            <div className="opacity-80">
                              <WeatherIcon
                                condition={city.currentWeather.condition.text}
                                size="h-6 w-6 md:h-8 md:w-8"
                              />
                            </div>
                          )}
                        </div>
                        <div className="text-white/80 text-xs md:text-sm">
                          {city.currentWeather ? (
                            <>
                              H:{getTemperatureDisplay(city.currentWeather.temp_c + 5, city.currentWeather.temp_f + 9, settings.temperatureUnit)} L:{getTemperatureDisplay(city.currentWeather.temp_c - 8, city.currentWeather.temp_f - 14, settings.temperatureUnit)}
                            </>
                          ) : (
                            'H:--° L:--°'
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
