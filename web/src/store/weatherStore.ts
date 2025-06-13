import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { City, CurrentWeather, WeatherStore } from '@/types/weather';

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set, get) => ({
      currentCity: null,
      defaultCities: [],
      isLoading: false,
      error: null,

      setCurrentCity: (city: City) => {
        set({ currentCity: city, error: null });
      },

      addDefaultCity: (city: City) => {
        const { defaultCities } = get();
        const exists = defaultCities.some(c => c.id === city.id);
        
        if (!exists) {
          set({ 
            defaultCities: [...defaultCities, city],
            error: null 
          });
        }
      },

      removeDefaultCity: (cityId: string) => {
        const { defaultCities } = get();
        set({ 
          defaultCities: defaultCities.filter(city => city.id !== cityId),
          error: null 
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      updateCityWeather: (cityId: string, weather: CurrentWeather) => {
        const { currentCity, defaultCities } = get();
        
        // Update current city if it matches
        if (currentCity && currentCity.id === cityId) {
          set({
            currentCity: {
              ...currentCity,
              currentWeather: weather,
              lastUpdated: new Date().toISOString()
            }
          });
        }

        // Update in default cities list
        const updatedDefaultCities = defaultCities.map(city => 
          city.id === cityId 
            ? { 
                ...city, 
                currentWeather: weather,
                lastUpdated: new Date().toISOString()
              }
            : city
        );

        set({ defaultCities: updatedDefaultCities });
      },
    }),
    {
      name: 'weather-store',
      partialize: (state) => ({
        defaultCities: state.defaultCities,
        currentCity: state.currentCity,
      }),
    }
  )
);

// Helper function to create a City object from weather API response
export const createCityFromWeatherData = (
  name: string,
  weatherData: any
): City => {
  const { location, current } = weatherData;
  
  return {
    id: `${location.lat}-${location.lon}`,
    name: location.name,
    region: location.region,
    country: location.country,
    lat: location.lat,
    lon: location.lon,
    timezone: location.tz_id,
    currentWeather: current,
    lastUpdated: new Date().toISOString(),
  };
};
