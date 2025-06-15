import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, SettingsStore, UpdateFrequency, TemperatureUnit } from '@/types/settings';

const defaultSettings: AppSettings = {
  updateFrequency: '1hour',
  temperatureUnit: 'celsius',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
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
    }),
    {
      name: 'weather-settings',
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
);
