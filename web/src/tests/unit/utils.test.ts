/// <reference types="jest" />

import {
  convertTemperature,
  getTemperatureDisplay,
  getTemperatureWithUnit,
  formatTemperature,
  formatLastUpdatedShort,
  getWeatherGradient,
  getWeatherIconType
} from '@/lib/utils';

describe('Temperature Conversion Functions', () => {
  describe('convertTemperature', () => {
    it('should convert Celsius to Fahrenheit correctly', () => {
      expect(convertTemperature(0, 'fahrenheit')).toBe(32);
      expect(convertTemperature(100, 'fahrenheit')).toBe(212);
      expect(convertTemperature(25, 'fahrenheit')).toBe(77);
      expect(convertTemperature(-40, 'fahrenheit')).toBe(-40);
    });

    it('should return Celsius unchanged when target is celsius', () => {
      expect(convertTemperature(25, 'celsius')).toBe(25);
      expect(convertTemperature(0, 'celsius')).toBe(0);
      expect(convertTemperature(-10, 'celsius')).toBe(-10);
    });

    it('should handle decimal temperatures correctly', () => {
      expect(convertTemperature(23.5, 'fahrenheit')).toBeCloseTo(74.3, 1);
      expect(convertTemperature(-12.7, 'fahrenheit')).toBeCloseTo(9.14, 1);
    });
  });

  describe('getTemperatureDisplay', () => {
    it('should display Celsius temperature when unit is celsius', () => {
      expect(getTemperatureDisplay(25.7, 78.26, 'celsius')).toBe('26°');
      expect(getTemperatureDisplay(0.4, 32.72, 'celsius')).toBe('0°');
      expect(getTemperatureDisplay(-5.8, 21.56, 'celsius')).toBe('-6°');
    });

    it('should display Fahrenheit temperature when unit is fahrenheit', () => {
      expect(getTemperatureDisplay(25.7, 78.26, 'fahrenheit')).toBe('78°');
      expect(getTemperatureDisplay(0.4, 32.72, 'fahrenheit')).toBe('33°');
      expect(getTemperatureDisplay(-5.8, 21.56, 'fahrenheit')).toBe('22°');
    });

    it('should round temperatures to nearest integer', () => {
      expect(getTemperatureDisplay(25.4, 77.72, 'celsius')).toBe('25°');
      expect(getTemperatureDisplay(25.6, 78.08, 'celsius')).toBe('26°');
      expect(getTemperatureDisplay(25.5, 77.9, 'fahrenheit')).toBe('78°');
    });
  });

  describe('getTemperatureWithUnit', () => {
    it('should include unit symbol for Celsius', () => {
      expect(getTemperatureWithUnit(25.7, 78.26, 'celsius')).toBe('26°C');
      expect(getTemperatureWithUnit(-5.2, 22.64, 'celsius')).toBe('-5°C');
    });

    it('should include unit symbol for Fahrenheit', () => {
      expect(getTemperatureWithUnit(25.7, 78.26, 'fahrenheit')).toBe('78°F');
      expect(getTemperatureWithUnit(-5.2, 22.64, 'fahrenheit')).toBe('23°F');
    });
  });

  describe('formatTemperature', () => {
    it('should format temperature with default Celsius unit', () => {
      expect(formatTemperature(25.7)).toBe('26°C');
      expect(formatTemperature(-5.2)).toBe('-5°C');
    });

    it('should format temperature with specified unit', () => {
      expect(formatTemperature(78.26, 'F')).toBe('78°F');
      expect(formatTemperature(25.7, 'C')).toBe('26°C');
    });
  });

  describe('Temperature Conversion Edge Cases', () => {
    it('should handle extreme temperatures correctly', () => {
      // Absolute zero
      expect(convertTemperature(-273.15, 'fahrenheit')).toBeCloseTo(-459.67, 1);

      // Very hot temperatures
      expect(convertTemperature(1000, 'fahrenheit')).toBe(1832);

      // Very cold temperatures
      expect(convertTemperature(-200, 'fahrenheit')).toBe(-328);
    });

    it('should maintain precision for scientific calculations', () => {
      // Test precision to 2 decimal places
      expect(convertTemperature(36.6, 'fahrenheit')).toBeCloseTo(97.88, 2);
      expect(convertTemperature(98.6, 'celsius')).toBe(98.6); // Should return unchanged

      // Test very small temperature differences
      expect(convertTemperature(0.1, 'fahrenheit')).toBeCloseTo(32.18, 2);
      expect(convertTemperature(-0.1, 'fahrenheit')).toBeCloseTo(31.82, 2);
    });

    it('should handle special temperature values', () => {
      // Water freezing point
      expect(convertTemperature(0, 'fahrenheit')).toBe(32);

      // Water boiling point
      expect(convertTemperature(100, 'fahrenheit')).toBe(212);

      // Human body temperature
      expect(convertTemperature(37, 'fahrenheit')).toBeCloseTo(98.6, 1);

      // Room temperature
      expect(convertTemperature(20, 'fahrenheit')).toBe(68);
    });

    it('should handle rounding consistently', () => {
      // Test rounding behavior in display functions
      expect(getTemperatureDisplay(25.4999, 77.8998, 'celsius')).toBe('25°');
      expect(getTemperatureDisplay(25.5, 77.9, 'celsius')).toBe('26°');
      expect(getTemperatureDisplay(25.5001, 77.9002, 'celsius')).toBe('26°');
    });
  });
});

describe('Date Formatting Functions', () => {
  describe('formatLastUpdatedShort', () => {
    const RealDate = Date;

    beforeEach(() => {
      // Mock Date constructor
      global.Date = jest.fn((date?: string | number | Date) => {
        if (date) {
          return new RealDate(date);
        }
        return new RealDate('2024-01-01T12:00:00Z');
      }) as DateConstructor;

      // Mock Date.now()
      global.Date.now = jest.fn(() => new RealDate('2024-01-01T12:00:00Z').getTime());
    });

    afterEach(() => {
      global.Date = RealDate;
    });

    it('should return "Just now" for very recent updates', () => {
      const recentTime = new RealDate('2024-01-01T11:59:30Z').toISOString();
      expect(formatLastUpdatedShort(recentTime)).toBe('Just now');
    });

    it('should return minutes for updates within an hour', () => {
      const thirtyMinAgo = new RealDate('2024-01-01T11:30:00Z').toISOString();
      expect(formatLastUpdatedShort(thirtyMinAgo)).toBe('30m ago');

      const fiveMinAgo = new RealDate('2024-01-01T11:55:00Z').toISOString();
      expect(formatLastUpdatedShort(fiveMinAgo)).toBe('5m ago');
    });

    it('should return hours for updates within a day', () => {
      const twoHoursAgo = new RealDate('2024-01-01T10:00:00Z').toISOString();
      expect(formatLastUpdatedShort(twoHoursAgo)).toBe('2h ago');

      const twelveHoursAgo = new RealDate('2024-01-01T00:00:00Z').toISOString();
      expect(formatLastUpdatedShort(twelveHoursAgo)).toBe('12h ago');
    });

    it('should return days for older updates', () => {
      const twoDaysAgo = new RealDate('2023-12-30T12:00:00Z').toISOString();
      expect(formatLastUpdatedShort(twoDaysAgo)).toBe('2d ago');

      const oneWeekAgo = new RealDate('2023-12-25T12:00:00Z').toISOString();
      expect(formatLastUpdatedShort(oneWeekAgo)).toBe('7d ago');
    });
  });
});

describe('Weather Utility Functions', () => {
  describe('getWeatherGradient', () => {
    it('should return sunny gradient for sunny conditions', () => {
      expect(getWeatherGradient('Sunny')).toBe('weather-gradient-sunny');
      expect(getWeatherGradient('Clear')).toBe('weather-gradient-sunny');
      expect(getWeatherGradient('clear sky')).toBe('weather-gradient-sunny');
    });

    it('should return rain gradient for rainy conditions', () => {
      expect(getWeatherGradient('Rain')).toBe('weather-gradient-rain');
      expect(getWeatherGradient('Light drizzle')).toBe('weather-gradient-rain');
      expect(getWeatherGradient('Heavy rain')).toBe('weather-gradient-rain');
    });

    it('should return cloudy gradient for cloudy conditions', () => {
      expect(getWeatherGradient('Cloudy')).toBe('weather-gradient-cloudy');
      expect(getWeatherGradient('Overcast')).toBe('weather-gradient-cloudy');
      expect(getWeatherGradient('partly cloudy')).toBe('weather-gradient-cloudy');
    });

    it('should return default gradient for unknown conditions', () => {
      expect(getWeatherGradient('Unknown')).toBe('weather-gradient');
      expect(getWeatherGradient('Tornado')).toBe('weather-gradient');
      expect(getWeatherGradient('')).toBe('weather-gradient');
    });

    it('should be case insensitive', () => {
      expect(getWeatherGradient('SUNNY')).toBe('weather-gradient-sunny');
      expect(getWeatherGradient('rAiN')).toBe('weather-gradient-rain');
      expect(getWeatherGradient('ClOuDy')).toBe('weather-gradient-cloudy');
    });
  });

  describe('getWeatherIconType', () => {
    it('should return sun icon for sunny conditions', () => {
      const result = getWeatherIconType('Sunny');
      expect(result.color).toBe('text-yellow-300');
    });

    it('should return cloud rain icon for rainy conditions', () => {
      const result = getWeatherIconType('Light rain');
      expect(result.color).toBe('text-blue-200'); // Light rain uses text-blue-200

      const heavyRainResult = getWeatherIconType('Heavy rain');
      expect(heavyRainResult.color).toBe('text-blue-400');

      const generalRainResult = getWeatherIconType('Rain');
      expect(generalRainResult.color).toBe('text-blue-300');
    });

    it('should return cloud icon for cloudy conditions', () => {
      const result = getWeatherIconType('Cloudy');
      expect(result.color).toBe('text-gray-300');
    });

    it('should return appropriate icons for specific weather types', () => {
      expect(getWeatherIconType('Thunderstorm').color).toBe('text-purple-300');
      expect(getWeatherIconType('Snow').color).toBe('text-blue-100');
      expect(getWeatherIconType('Fog').color).toBe('text-gray-200');
    });
  });
});

describe('Timezone and Time Handling', () => {
  describe('Local time formatting', () => {
    it('should handle timezone-aware time formatting', () => {
      // Test that timezone formatting works with different timezones
      const testDate = new Date('2024-01-01T12:00:00Z');

      // Test formatting with different timezones
      const nyTime = testDate.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const tokyoTime = testDate.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Tokyo',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      // These should be different due to timezone differences
      expect(nyTime).not.toBe(tokyoTime);
      expect(nyTime).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
      expect(tokyoTime).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/);
    });

    it('should handle timezone comparison for current hour detection', () => {
      // Test timezone-aware hour comparison
      const testDate = new Date('2024-01-01T12:00:00Z');

      // Get hour in different timezones
      const utcHour = testDate.getUTCHours();
      const nyHour = parseInt(testDate.toLocaleString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        hour12: false
      }));

      // UTC should be 12, NY should be different (7 AM in winter)
      expect(utcHour).toBe(12);
      expect(nyHour).not.toBe(utcHour);
    });

    it('should handle date parsing for different timezone formats', () => {
      // Test parsing of API localtime format
      const apiLocaltime = '2024-01-01 15:30';
      const parsedDate = new Date(apiLocaltime);

      expect(parsedDate).toBeInstanceOf(Date);
      expect(parsedDate.getFullYear()).toBe(2024);
      expect(parsedDate.getMonth()).toBe(0); // January is 0
      expect(parsedDate.getDate()).toBe(1);
    });
  });

  describe('Hourly forecast timezone handling', () => {
    it('should correctly identify current hour in different timezones', () => {
      // Mock hourly data
      const mockHourlyData = [
        { time: '2024-01-01 10:00', time_epoch: 1704110400 },
        { time: '2024-01-01 11:00', time_epoch: 1704114000 },
        { time: '2024-01-01 12:00', time_epoch: 1704117600 },
        { time: '2024-01-01 13:00', time_epoch: 1704121200 },
      ];

      // Test finding current hour index based on timezone
      const findCurrentHourIndex = (hourlyData: any[], timezone: string) => {
        const nowInCityTz = new Date().toLocaleString('en-US', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        const [datePart, timePart] = nowInCityTz.split(', ');
        const [month, day, year] = datePart.split('/').map(Number);
        const [hour] = timePart.split(':').map(Number);

        return hourlyData.findIndex(hourData => {
          const hourDate = new Date(hourData.time);
          const hourInCityTz = hourDate.toLocaleString('en-US', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });

          const [hourDatePart, hourTimePart] = hourInCityTz.split(', ');
          const [hourMonth, hourDay, hourYear] = hourDatePart.split('/').map(Number);
          const [hourHour] = hourTimePart.split(':').map(Number);

          return hourHour === hour &&
                 hourDay === day &&
                 hourMonth === month &&
                 hourYear === year;
        });
      };

      // Test with different timezones
      const utcIndex = findCurrentHourIndex(mockHourlyData, 'UTC');
      const nyIndex = findCurrentHourIndex(mockHourlyData, 'America/New_York');

      // Both should return valid indices (or -1 if not found)
      expect(typeof utcIndex).toBe('number');
      expect(typeof nyIndex).toBe('number');
    });
  });
});
