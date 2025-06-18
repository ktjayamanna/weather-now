import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSettingsSlice, SettingsSlice } from './slices/settings.slice';
import { createWeatherSlice, WeatherSlice } from './slices/weather.slice';

type AppStore = SettingsSlice & WeatherSlice;

export const useAppStore = create<AppStore>()(
  persist(
    (...args) => ({
      ...createSettingsSlice(...args),
      ...createWeatherSlice(...args),
    }),
    {
      name: 'weather-app-store',
      partialize: (state) => ({
        settings: state.settings,
        defaultCities: state.defaultCities,
        currentCity: state.currentCity,
        lastAutoUpdate: state.lastAutoUpdate,
      }),
    }
  )
);

export { createCityFromWeatherData } from './slices/weather.slice';
export type { AppStore, SettingsSlice, WeatherSlice };
