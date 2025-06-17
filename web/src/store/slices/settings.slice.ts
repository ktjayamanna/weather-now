import { StateCreator } from 'zustand';
import { AppSettings, UpdateFrequency, TemperatureUnit, ForecastView } from '@/types/settings';

export interface SettingsSlice {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setUpdateFrequency: (frequency: UpdateFrequency) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setForecastView: (view: ForecastView) => void;
}

const defaultSettings: AppSettings = {
  updateFrequency: '1hour',
  temperatureUnit: 'celsius',
  forecastView: 'hourly',
};

export const createSettingsSlice: StateCreator<
  SettingsSlice,
  [],
  [],
  SettingsSlice
> = (set) => ({
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
});
