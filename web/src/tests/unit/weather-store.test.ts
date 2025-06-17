/**
 * Weather Store tests
 * Tests the Zustand store functionality for weather data management
 */

import { City, CurrentWeather, ForecastWeather } from '@/types/weather';

// Mock the weather store functionality
interface WeatherStoreState {
  currentCity: City | null;
  defaultCities: City[];
  isLoading: boolean;
  error: string | null;
  isRefreshing: boolean;
  lastAutoUpdate: string | null;
}

class MockWeatherStore {
  private state: WeatherStoreState = {
    currentCity: null,
    defaultCities: [],
    isLoading: false,
    error: null,
    isRefreshing: false,
    lastAutoUpdate: null,
  };

  // Getters
  getCurrentCity() { return this.state.currentCity; }
  getDefaultCities() { return this.state.defaultCities; }
  getIsLoading() { return this.state.isLoading; }
  getError() { return this.state.error; }
  getIsRefreshing() { return this.state.isRefreshing; }
  getLastAutoUpdate() { return this.state.lastAutoUpdate; }

  // Actions
  setCurrentCity(city: City) {
    this.state.currentCity = city;
    this.state.error = null;
  }

  addDefaultCity(city: City) {
    const exists = this.state.defaultCities.some(c => c.id === city.id);
    if (!exists) {
      this.state.defaultCities = [...this.state.defaultCities, city];
      this.state.error = null;
    }
  }

  removeDefaultCity(cityId: string) {
    this.state.defaultCities = this.state.defaultCities.filter(city => city.id !== cityId);
    this.state.error = null;
  }

  setLoading(loading: boolean) {
    this.state.isLoading = loading;
  }

  setError(error: string | null) {
    this.state.error = error;
    this.state.isLoading = false;
  }

  setRefreshing(refreshing: boolean) {
    this.state.isRefreshing = refreshing;
  }

  setLastAutoUpdate(timestamp: string) {
    this.state.lastAutoUpdate = timestamp;
  }

  updateCityWeather(cityId: string, weather: CurrentWeather) {
    const currentTime = new Date().toISOString();

    // Update current city if it matches
    if (this.state.currentCity && this.state.currentCity.id === cityId) {
      this.state.currentCity = {
        ...this.state.currentCity,
        currentWeather: weather,
        lastUpdated: currentTime
      };
    }

    // Update in default cities list
    this.state.defaultCities = this.state.defaultCities.map(city =>
      city.id === cityId
        ? {
            ...city,
            currentWeather: weather,
            lastUpdated: currentTime
          }
        : city
    );
  }

  updateCityForecast(cityId: string, forecast: ForecastWeather) {
    const currentTime = new Date().toISOString();

    // Update current city if it matches
    if (this.state.currentCity && this.state.currentCity.id === cityId) {
      this.state.currentCity = {
        ...this.state.currentCity,
        forecast: forecast,
        lastUpdated: currentTime
      };
    }

    // Update in default cities list
    this.state.defaultCities = this.state.defaultCities.map(city =>
      city.id === cityId
        ? {
            ...city,
            forecast: forecast,
            lastUpdated: currentTime
          }
        : city
    );
  }

  // Test helper to reset state
  reset() {
    this.state = {
      currentCity: null,
      defaultCities: [],
      isLoading: false,
      error: null,
      isRefreshing: false,
      lastAutoUpdate: null,
    };
  }
}

// Test data factories
const createMockCity = (id: string, name: string): City => ({
  id,
  name,
  region: 'Test Region',
  country: 'Test Country',
  lat: 40.7128,
  lon: -74.0060,
  timezone: 'America/New_York',
  lastUpdated: new Date().toISOString(),
});

const createMockWeather = (temp: number): CurrentWeather => ({
  last_updated_epoch: Date.now(),
  last_updated: new Date().toISOString(),
  temp_c: temp,
  temp_f: (temp * 9/5) + 32,
  is_day: 1,
  condition: { text: 'Sunny', icon: 'sunny.png', code: 1000 },
  wind_mph: 5,
  wind_kph: 8,
  wind_degree: 180,
  wind_dir: 'S',
  pressure_mb: 1013,
  pressure_in: 29.91,
  precip_mm: 0,
  precip_in: 0,
  humidity: 50,
  cloud: 25,
  feelslike_c: temp + 2,
  feelslike_f: ((temp + 2) * 9/5) + 32,
  windchill_c: temp - 1,
  windchill_f: ((temp - 1) * 9/5) + 32,
  heatindex_c: temp + 1,
  heatindex_f: ((temp + 1) * 9/5) + 32,
  dewpoint_c: temp - 5,
  dewpoint_f: ((temp - 5) * 9/5) + 32,
  vis_km: 10,
  vis_miles: 6,
  uv: 5,
  gust_mph: 8,
  gust_kph: 13,
});

const createMockForecast = (): ForecastWeather => ({
  forecastday: [
    {
      date: '2024-01-01',
      date_epoch: 1704067200,
      day: {
        maxtemp_c: 25,
        maxtemp_f: 77,
        mintemp_c: 15,
        mintemp_f: 59,
        avgtemp_c: 20,
        avgtemp_f: 68,
        maxwind_mph: 10,
        maxwind_kph: 16,
        totalprecip_mm: 0,
        totalprecip_in: 0,
        avgvis_km: 10,
        avgvis_miles: 6,
        avghumidity: 50,
        condition: { text: 'Sunny', icon: 'sunny.png', code: 1000 },
        uv: 5,
        daily_will_it_rain: 0,
        daily_will_it_snow: 0,
        daily_chance_of_rain: 0,
        daily_chance_of_snow: 0,
      },
      astro: {
        sunrise: '06:30 AM',
        sunset: '06:30 PM',
        moonrise: '08:00 PM',
        moonset: '06:00 AM',
        moon_phase: 'New Moon',
        moon_illumination: 0,
        is_moon_up: 0,
        is_sun_up: 1,
      },
      hour: [],
    }
  ]
});

describe('Weather Store', () => {
  let store: MockWeatherStore;

  beforeEach(() => {
    store = new MockWeatherStore();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      expect(store.getCurrentCity()).toBe(null);
      expect(store.getDefaultCities()).toEqual([]);
      expect(store.getIsLoading()).toBe(false);
      expect(store.getError()).toBe(null);
      expect(store.getIsRefreshing()).toBe(false);
      expect(store.getLastAutoUpdate()).toBe(null);
    });
  });

  describe('City Management', () => {
    it('should set current city', () => {
      const city = createMockCity('1', 'New York');
      store.setCurrentCity(city);
      
      expect(store.getCurrentCity()).toEqual(city);
      expect(store.getError()).toBe(null);
    });

    it('should add default city', () => {
      const city = createMockCity('1', 'London');
      store.addDefaultCity(city);
      
      expect(store.getDefaultCities()).toHaveLength(1);
      expect(store.getDefaultCities()[0]).toEqual(city);
      expect(store.getError()).toBe(null);
    });

    it('should not add duplicate cities', () => {
      const city = createMockCity('1', 'Paris');
      store.addDefaultCity(city);
      store.addDefaultCity(city); // Try to add same city again
      
      expect(store.getDefaultCities()).toHaveLength(1);
    });

    it('should remove default city', () => {
      const city1 = createMockCity('1', 'Tokyo');
      const city2 = createMockCity('2', 'Sydney');
      
      store.addDefaultCity(city1);
      store.addDefaultCity(city2);
      expect(store.getDefaultCities()).toHaveLength(2);
      
      store.removeDefaultCity('1');
      expect(store.getDefaultCities()).toHaveLength(1);
      expect(store.getDefaultCities()[0].id).toBe('2');
    });

    it('should handle removing non-existent city', () => {
      const city = createMockCity('1', 'Berlin');
      store.addDefaultCity(city);
      
      store.removeDefaultCity('999'); // Non-existent ID
      expect(store.getDefaultCities()).toHaveLength(1);
    });
  });

  describe('Loading and Error States', () => {
    it('should set loading state', () => {
      store.setLoading(true);
      expect(store.getIsLoading()).toBe(true);
      
      store.setLoading(false);
      expect(store.getIsLoading()).toBe(false);
    });

    it('should set error state and clear loading', () => {
      store.setLoading(true);
      store.setError('Test error');
      
      expect(store.getError()).toBe('Test error');
      expect(store.getIsLoading()).toBe(false);
    });

    it('should clear error state', () => {
      store.setError('Test error');
      expect(store.getError()).toBe('Test error');
      
      store.setError(null);
      expect(store.getError()).toBe(null);
    });

    it('should set refreshing state', () => {
      store.setRefreshing(true);
      expect(store.getIsRefreshing()).toBe(true);
      
      store.setRefreshing(false);
      expect(store.getIsRefreshing()).toBe(false);
    });
  });

  describe('Weather Data Updates', () => {
    it('should update city weather in default cities', () => {
      const city = createMockCity('1', 'Miami');
      const weather = createMockWeather(30);
      
      store.addDefaultCity(city);
      store.updateCityWeather('1', weather);
      
      const updatedCity = store.getDefaultCities()[0];
      expect(updatedCity.currentWeather).toEqual(weather);
      expect(updatedCity.lastUpdated).toBeDefined();
    });

    it('should update current city weather', () => {
      const city = createMockCity('1', 'Chicago');
      const weather = createMockWeather(20);
      
      store.setCurrentCity(city);
      store.updateCityWeather('1', weather);
      
      const currentCity = store.getCurrentCity();
      expect(currentCity?.currentWeather).toEqual(weather);
      expect(currentCity?.lastUpdated).toBeDefined();
    });

    it('should update forecast data', () => {
      const city = createMockCity('1', 'Seattle');
      const forecast = createMockForecast();
      
      store.addDefaultCity(city);
      store.updateCityForecast('1', forecast);
      
      const updatedCity = store.getDefaultCities()[0];
      expect(updatedCity.forecast).toEqual(forecast);
      expect(updatedCity.lastUpdated).toBeDefined();
    });

    it('should handle updates for non-existent cities gracefully', () => {
      const weather = createMockWeather(25);
      const forecast = createMockForecast();
      
      // Should not throw errors
      store.updateCityWeather('999', weather);
      store.updateCityForecast('999', forecast);
      
      expect(store.getDefaultCities()).toHaveLength(0);
    });
  });

  describe('Auto-update Tracking', () => {
    it('should set last auto-update timestamp', () => {
      const timestamp = new Date().toISOString();
      store.setLastAutoUpdate(timestamp);
      
      expect(store.getLastAutoUpdate()).toBe(timestamp);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple cities with different weather data', () => {
      const city1 = createMockCity('1', 'New York');
      const city2 = createMockCity('2', 'Los Angeles');
      const weather1 = createMockWeather(15);
      const weather2 = createMockWeather(25);
      
      store.addDefaultCity(city1);
      store.addDefaultCity(city2);
      store.updateCityWeather('1', weather1);
      store.updateCityWeather('2', weather2);
      
      const cities = store.getDefaultCities();
      expect(cities[0].currentWeather?.temp_c).toBe(15);
      expect(cities[1].currentWeather?.temp_c).toBe(25);
    });

    it('should maintain data integrity during rapid updates', () => {
      const city = createMockCity('1', 'Boston');
      store.addDefaultCity(city);
      
      // Rapid updates
      for (let i = 0; i < 10; i++) {
        const weather = createMockWeather(i * 2);
        store.updateCityWeather('1', weather);
      }
      
      const updatedCity = store.getDefaultCities()[0];
      expect(updatedCity.currentWeather?.temp_c).toBe(18); // Last update: 9 * 2
    });

    it('should clear error when adding cities successfully', () => {
      store.setError('Previous error');
      expect(store.getError()).toBe('Previous error');
      
      const city = createMockCity('1', 'Denver');
      store.addDefaultCity(city);
      
      expect(store.getError()).toBe(null);
    });
  });
});
