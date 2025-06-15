import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, SettingsStore, UpdateFrequency, TemperatureUnit, ForecastView } from '@/types/settings';

const defaultSettings: AppSettings = {
  updateFrequency: '1hour',
  temperatureUnit: 'celsius',
  forecastView: 'hourly',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,

      updateSettings: (newSettings: Partial<AppSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings }
        }));
      },

      setUpdateFrequency: (frequency: UpdateFrequency) => {
        set((state) => ({
          settings: { ...state.settings, updateFrequency: frequency }
        }));
      },

      setTemperatureUnit: (unit: TemperatureUnit) => {
        set((state) => ({
          settings: { ...state.settings, temperatureUnit: unit }
        }));
      },

      setForecastView: (view: ForecastView) => {
        set((state) => ({
          settings: { ...state.settings, forecastView: view }
        }));
      },
    }),
    {
      name: 'weather-settings',
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);
