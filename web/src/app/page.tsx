'use client';

import { useState, useEffect } from 'react';
import { HomeScreen } from '@/components/HomeScreen';
import { SearchModal } from '@/components/SearchModal';
import { CityDetailsModal } from '@/components/CityDetailsModal';
import { useWeatherStore } from '@/store/weatherStore';
import { createCityFromWeatherData } from '@/store/weatherStore';
import { trpc } from '@/utils/trpc';
import { City } from '@/types/weather';

export default function Home() {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showCityDetails, setShowCityDetails] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    defaultCities,
    addDefaultCity,
    setError,
    error
  } = useWeatherStore();

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
      setSearchQuery(''); // Clear search query on error
    }
  }, [searchError, setError]);

  const handleSearch = (city: string) => {
    setError(null);
    setSearchQuery(city);
    setShowSearchModal(true);
  };

  const handleCityClick = (city: City) => {
    setSelectedCity(city);
    setShowCityDetails(true);
  };

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

  const handleCloseCityDetails = () => {
    setShowCityDetails(false);
    setSelectedCity(null);
  };

  return (
    <>
      <HomeScreen
        cities={defaultCities}
        onSearch={handleSearch}
        onCityClick={handleCityClick}
        isLoading={isSearchLoading && searchQuery === 'Colombo, Sri Lanka'}
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

      {showCityDetails && selectedCity && (
        <CityDetailsModal
          city={selectedCity}
          onClose={handleCloseCityDetails}
        />
      )}
    </>
  );
}
