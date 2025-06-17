export type UpdateFrequency = '30min' | '1hour' | '1day';
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type ForecastView = 'hourly' | 'daily';

export interface AppSettings {
  updateFrequency: UpdateFrequency;
  temperatureUnit: TemperatureUnit;
  forecastView: ForecastView;
}


