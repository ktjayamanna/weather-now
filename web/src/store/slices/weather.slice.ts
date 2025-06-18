import { StateCreator } from 'zustand';
import { City, CurrentWeather, ForecastWeather, Location } from '@/types/weather';

export interface WeatherSlice {
  currentCity: City | null;
  defaultCities: City[];
  isLoading: boolean;
  error: string | null;
  isRefreshing: boolean;
  lastAutoUpdate: string | null;
  setCurrentCity: (city: City) => void;
  addDefaultCity: (city: City) => void;
  removeDefaultCity: (cityId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateCityWeather: (cityId: string, weather: CurrentWeather) => void;
  updateCityForecast: (cityId: string, forecast: ForecastWeather) => void;
  updateCityLocalTime: (cityId: string, localtime: string, localtime_epoch: number) => void;
  setRefreshing: (refreshing: boolean) => void;
  setLastAutoUpdate: (timestamp: string) => void;
}

export const createWeatherSlice: StateCreator<
  WeatherSlice,
  [],
  [],
  WeatherSlice
> = (set, get) => ({
  currentCity: null,
  defaultCities: [],
  isLoading: false,
  error: null,
  isRefreshing: false,
  lastAutoUpdate: null,

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

  setRefreshing: (refreshing: boolean) => {
    set({ isRefreshing: refreshing });
  },

  setLastAutoUpdate: (timestamp: string) => {
    set({ lastAutoUpdate: timestamp });
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

  updateCityForecast: (cityId: string, forecast: ForecastWeather) => {
    const { currentCity, defaultCities } = get();

    // Update current city if it matches
    if (currentCity && currentCity.id === cityId) {
      set({
        currentCity: {
          ...currentCity,
          forecast: forecast,
          lastUpdated: new Date().toISOString()
        }
      });
    }

    // Update in default cities list
    const updatedDefaultCities = defaultCities.map(city =>
      city.id === cityId
        ? {
            ...city,
            forecast: forecast,
            lastUpdated: new Date().toISOString()
          }
        : city
    );

    set({ defaultCities: updatedDefaultCities });
  },

  updateCityLocalTime: (cityId: string, localtime: string, localtime_epoch: number) => {
    const { currentCity, defaultCities } = get();

    // Update current city if it matches
    if (currentCity && currentCity.id === cityId) {
      set({
        currentCity: {
          ...currentCity,
          localtime,
          localtime_epoch,
          lastUpdated: new Date().toISOString()
        }
      });
    }

    // Update in default cities list
    const updatedDefaultCities = defaultCities.map(city =>
      city.id === cityId
        ? {
            ...city,
            localtime,
            localtime_epoch,
            lastUpdated: new Date().toISOString()
          }
        : city
    );

    set({ defaultCities: updatedDefaultCities });
  },
});

export const createCityFromWeatherData = (
  name: string,
  weatherData: { location: Location; current: CurrentWeather }
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
    localtime: location.localtime,
    localtime_epoch: location.localtime_epoch,
    currentWeather: current,
    lastUpdated: new Date().toISOString(),
  };
};
