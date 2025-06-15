'use client';

import { useState, useEffect, useCallback } from 'react';
import { HomeScreen } from '@/components/HomeScreen';
import { SearchModal } from '@/components/SearchModal';
import { CityDetailsModal } from '@/components/CityDetailsModal';
import { SettingsModal } from '@/components/SettingsModal';
import { useWeatherStore } from '@/store/weatherStore';
import { useSettingsStore } from '@/store/settingsStore';
import { createCityFromWeatherData } from '@/store/weatherStore';
import { trpc } from '@/utils/trpc';
import { City } from '@/types/weather';
import { useToast } from '@/components/ui/toast';

export default function Home() {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCityDetails, setShowCityDetails] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [clearSearchInput, setClearSearchInput] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState<string | null>(null);

  const {
    defaultCities,
    addDefaultCity,
    removeDefaultCity,
    setError,
    error,
    updateCityWeather,
    updateCityForecast,
    lastAutoUpdate,
    setLastAutoUpdate
  } = useWeatherStore();

  const { settings } = useSettingsStore();

  const { addToast } = useToast();

  // Fetch weather for search query
  const {
    data: searchWeatherData,
    isLoading: isSearchLoading,
    error: searchError
  } = trpc.weather.getCurrentWeather.useQuery(
    { city: searchQuery },
    {
      enabled: !!searchQuery,
      refetchOnWindowFocus: false,
    }
  );

  // Fetch weather for refresh
  const refreshCity = refreshTrigger ? defaultCities.find(c => c.id === refreshTrigger) : null;
  const {
    data: refreshWeatherData,
    isLoading: isRefreshLoading,
    error: refreshError
  } = trpc.weather.getCurrentWeather.useQuery(
    { city: refreshCity ? `${refreshCity.name}, ${refreshCity.country}` : '' },
    {
      enabled: !!refreshTrigger && !!refreshCity,
      refetchOnWindowFocus: false,
    }
  );

  // Handle refresh data
  useEffect(() => {
    if (refreshWeatherData && refreshTrigger) {
      updateCityWeather(refreshTrigger, refreshWeatherData.current);
      const city = defaultCities.find(c => c.id === refreshTrigger);
      if (city) {
        addToast({
          title: 'Weather Updated',
          description: `Updated weather for ${city.name}`,
          type: 'success'
        });
      }
      setRefreshTrigger(null);
    }
  }, [refreshWeatherData, refreshTrigger, updateCityWeather, defaultCities, addToast]);

  // Handle refresh error
  useEffect(() => {
    if (refreshError && refreshTrigger) {
      addToast({
        title: 'Update Failed',
        description: 'Failed to update weather data',
        type: 'error'
      });
      setRefreshTrigger(null);
    }
  }, [refreshError, refreshTrigger, addToast]);

  // Manual refresh function
  const refreshCityWeather = useCallback((cityId: string) => {
    setRefreshTrigger(cityId);
  }, []);

  // Auto-update functionality
  useEffect(() => {
    const getUpdateInterval = () => {
      switch (settings.updateFrequency) {
        case '30min': return 30 * 60 * 1000; // 30 minutes
        case '1hour': return 60 * 60 * 1000; // 1 hour
        case '1day': return 24 * 60 * 60 * 1000; // 1 day
        default: return 60 * 60 * 1000; // Default to 1 hour
      }
    };

    const shouldUpdate = () => {
      if (!lastAutoUpdate) return true;
      const timeSinceLastUpdate = Date.now() - new Date(lastAutoUpdate).getTime();
      return timeSinceLastUpdate >= getUpdateInterval();
    };

    const updateAllCities = () => {
      if (defaultCities.length === 0 || !shouldUpdate()) return;

      console.log('Auto-updating weather data for all cities...');
      // For now, we'll just update the timestamp and let the user manually refresh
      // A full auto-update implementation would require more complex state management
      setLastAutoUpdate(new Date().toISOString());
      console.log('Auto-update timestamp updated');
    };

    // Initial update check
    updateAllCities();

    // Set up interval for future updates
    const interval = setInterval(updateAllCities, getUpdateInterval());

    return () => clearInterval(interval);
  }, [settings.updateFrequency, defaultCities, lastAutoUpdate, setLastAutoUpdate]);

  // Load default city (Colombo) on first visit if no cities exist
  useEffect(() => {
    if (defaultCities.length === 0 && !searchQuery) {
      setSearchQuery('Colombo, Sri Lanka');
    }
  }, [defaultCities.length, searchQuery]);

  // Handle search results - add Colombo as default city on first load
  useEffect(() => {
    if (searchWeatherData && searchQuery) {
      const city = createCityFromWeatherData(searchQuery, searchWeatherData);

      // If this is the initial Colombo load and no default cities exist, add it
      if (searchQuery === 'Colombo, Sri Lanka' && defaultCities.length === 0) {
        addDefaultCity(city);
      } else if (showSearchModal) {
        // If searching from modal, show the search result
        setSelectedCity(city);
      }

      setSearchQuery(''); // Clear search query after successful search
    }
  }, [searchWeatherData, searchQuery, addDefaultCity, defaultCities.length, showSearchModal]);

  // Handle search errors
  useEffect(() => {
    if (searchError) {
      setError(searchError.message);
      addToast({
        type: 'error',
        title: 'Search Error',
        description: searchError.message,
      });
      setSearchQuery(''); // Clear search query on error
    }
  }, [searchError, setError, addToast]);

  // Fetch forecast for selected city when modal opens
  const {
    data: forecastData,
    isLoading: isForecastLoading
  } = trpc.weather.getForecast.useQuery(
    {
      city: selectedCity ? `${selectedCity.name}, ${selectedCity.country}` : '',
      days: 10  // Try 10 days to maximize free tier usage
    },
    {
      enabled: !!selectedCity && showCityDetails,
      refetchOnWindowFocus: false,
    }
  );

  // Handle forecast data
  useEffect(() => {
    if (forecastData && selectedCity) {
      updateCityForecast(selectedCity.id, forecastData.forecast);
    }
  }, [forecastData, selectedCity, updateCityForecast]);

  const handleSearch = (city: string) => {
    setError(null);
    setSearchQuery(city);
    setShowSearchModal(true);
    setClearSearchInput(true);
  };

  const handleCityClick = (city: City) => {
    setSelectedCity(city);
    setShowCityDetails(true);
  };

  // Get the selected city with updated forecast data from the store
  const selectedCityWithForecast = selectedCity ?
    defaultCities.find(c => c.id === selectedCity.id) || selectedCity :
    null;

  const handleAddCity = (city: City) => {
    addDefaultCity(city);
    setShowSearchModal(false);
    setSelectedCity(null);
  };

  const handleCloseSearchModal = () => {
    setShowSearchModal(false);
    setSelectedCity(null);
    setSearchQuery('');
  };

  const handleClearComplete = () => {
    setClearSearchInput(false);
  };

  const handleCloseCityDetails = () => {
    setShowCityDetails(false);
    setSelectedCity(null);
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleRemoveCity = (cityId: string) => {
    removeDefaultCity(cityId);
    addToast({
      type: 'info',
      title: 'City Unpinned',
      description: 'City has been unpinned from your list.',
    });
  };

  return (
    <>
      <HomeScreen
        cities={defaultCities}
        onSearch={handleSearch}
        onCityClick={handleCityClick}
        onRemoveCity={handleRemoveCity}
        onOpenSettings={handleOpenSettings}
        isLoading={isSearchLoading && searchQuery === 'Colombo, Sri Lanka'}
        clearSearchInput={clearSearchInput}
        onClearComplete={handleClearComplete}
      />

      {showSearchModal && (
        <SearchModal
          city={selectedCity}
          isLoading={isSearchLoading}
          error={error}
          onAddCity={handleAddCity}
          onClose={handleCloseSearchModal}
        />
      )}

      {showCityDetails && selectedCityWithForecast && (
        <CityDetailsModal
          city={selectedCityWithForecast}
          onClose={handleCloseCityDetails}
          onRefresh={refreshCityWeather}
          isRefreshing={isRefreshLoading}
          isForecastLoading={isForecastLoading}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={handleCloseSettings}
        />
      )}
    </>
  );
}
