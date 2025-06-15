export type UpdateFrequency = '30min' | '1hour' | '1day';
export type TemperatureUnit = 'celsius' | 'fahrenheit';

export interface AppSettings {
  updateFrequency: UpdateFrequency;
  temperatureUnit: TemperatureUnit;
}

export interface SettingsStore {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  setUpdateFrequency: (frequency: UpdateFrequency) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
}
