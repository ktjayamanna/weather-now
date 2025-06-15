import { render, screen } from '@testing-library/react';
import { HourlyForecast } from '../HourlyForecast';
import { HourlyWeather } from '@/types/weather';

// Mock the settings store
jest.mock('@/store/settingsStore', () => ({
  useSettingsStore: () => ({
    settings: {
      temperatureUnit: 'C'
    }
  })
}));

// Mock the WeatherIcon component
jest.mock('../WeatherIcon', () => ({
  WeatherIcon: ({ condition }: { condition: string }) => (
    <div data-testid="weather-icon">{condition}</div>
  )
}));

// Mock the utils
jest.mock('@/lib/utils', () => ({
  getTemperatureDisplay: (tempC: number, tempF: number, unit: string) => 
    `${Math.round(unit === 'C' ? tempC : tempF)}°${unit}`
}));

const mockHourlyData: HourlyWeather[] = [
  {
    time_epoch: Date.now(),
    time: new Date().toISOString(),
    temp_c: 25,
    temp_f: 77,
    condition: {
      text: 'Sunny',
      icon: 'sunny.png',
      code: 1000
    },
    wind_mph: 10,
    wind_kph: 16,
    wind_degree: 180,
    wind_dir: 'S',
    pressure_mb: 1013,
    pressure_in: 29.92,
    precip_mm: 0,
    precip_in: 0,
    humidity: 60,
    cloud: 20,
    feelslike_c: 27,
    feelslike_f: 81,
    windchill_c: 25,
    windchill_f: 77,
    heatindex_c: 27,
    heatindex_f: 81,
    dewpoint_c: 15,
    dewpoint_f: 59,
    will_it_rain: 0,
    will_it_snow: 0,
    is_day: 1,
    vis_km: 10,
    vis_miles: 6,
    chance_of_rain: 0,
    chance_of_snow: 0,
    gust_mph: 15,
    gust_kph: 24,
    uv: 5
  }
];

describe('HourlyForecast', () => {
  it('renders loading state correctly', () => {
    render(<HourlyForecast hourlyData={[]} isLoading={true} />);
    
    expect(screen.getByText('Hourly Forecast')).toBeInTheDocument();
    expect(screen.getAllByRole('generic')).toHaveLength(expect.any(Number));
  });

  it('renders hourly data correctly', () => {
    render(<HourlyForecast hourlyData={mockHourlyData} isLoading={false} />);
    
    expect(screen.getByText('Hourly Forecast')).toBeInTheDocument();
    expect(screen.getByText('Now')).toBeInTheDocument();
    expect(screen.getByText('25°C')).toBeInTheDocument();
    expect(screen.getByTestId('weather-icon')).toBeInTheDocument();
  });

  it('renders no data message when no hourly data and not loading', () => {
    render(<HourlyForecast hourlyData={[]} isLoading={false} />);
    
    expect(screen.getByText('Hourly Forecast')).toBeInTheDocument();
    expect(screen.getByText('Forecast data unavailable')).toBeInTheDocument();
  });

  it('shows precipitation chance when greater than 0', () => {
    const dataWithRain = [{
      ...mockHourlyData[0],
      chance_of_rain: 80
    }];
    
    render(<HourlyForecast hourlyData={dataWithRain} isLoading={false} />);
    
    expect(screen.getByText('80%')).toBeInTheDocument();
  });
});
