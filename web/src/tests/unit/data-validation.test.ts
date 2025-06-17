/**
 * Data validation and integrity tests
 * Tests for data validation, timezone handling, and business logic accuracy
 */

import { convertTemperature, getWeatherIconType } from '@/lib/utils';

// Mock timezone data for testing
const mockTimezones = {
  'America/New_York': -5, // EST
  'Europe/London': 0,     // GMT
  'Asia/Tokyo': 9,        // JST
  'Australia/Sydney': 11, // AEDT
  'America/Los_Angeles': -8, // PST
};

// Mock weather data validation
class WeatherDataValidator {
  static validateTemperature(temp: number): boolean {
    // Reasonable temperature range: -100°C to 70°C
    return temp >= -100 && temp <= 70;
  }

  static validateHumidity(humidity: number): boolean {
    return humidity >= 0 && humidity <= 100;
  }

  static validateWindSpeed(speed: number): boolean {
    // Wind speed should be non-negative and reasonable (< 500 km/h)
    return speed >= 0 && speed <= 500;
  }

  static validatePressure(pressure: number): boolean {
    // Atmospheric pressure range: 870-1085 hPa
    return pressure >= 870 && pressure <= 1085;
  }

  static validateUVIndex(uv: number): boolean {
    // UV index range: 0-11+ (we'll allow up to 15 for extreme cases)
    return uv >= 0 && uv <= 15;
  }

  static validateVisibility(visibility: number): boolean {
    // Visibility in km: 0-50km is reasonable range
    return visibility >= 0 && visibility <= 50;
  }

  static validateCoordinates(lat: number, lon: number): boolean {
    return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  }
}

// Mock timezone utilities
class TimezoneUtils {
  static convertToTimezone(date: Date, timezone: string): Date {
    const offset = mockTimezones[timezone as keyof typeof mockTimezones] || 0;
    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utc + (offset * 3600000));
  }

  static formatTimeInTimezone(date: Date, timezone: string): string {
    const localDate = this.convertToTimezone(date, timezone);
    return localDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}

describe('Data Validation and Integrity', () => {
  describe('Temperature Data Validation', () => {
    it('should validate reasonable temperature ranges', () => {
      // Valid temperatures
      expect(WeatherDataValidator.validateTemperature(25)).toBe(true);
      expect(WeatherDataValidator.validateTemperature(0)).toBe(true);
      expect(WeatherDataValidator.validateTemperature(-40)).toBe(true);
      expect(WeatherDataValidator.validateTemperature(50)).toBe(true);

      // Invalid temperatures
      expect(WeatherDataValidator.validateTemperature(-150)).toBe(false);
      expect(WeatherDataValidator.validateTemperature(100)).toBe(false);
      expect(WeatherDataValidator.validateTemperature(NaN)).toBe(false);
    });

    it('should validate temperature conversion accuracy', () => {
      const testCases = [
        { celsius: 0, fahrenheit: 32 },
        { celsius: 100, fahrenheit: 212 },
        { celsius: -40, fahrenheit: -40 },
        { celsius: 37, fahrenheit: 98.6 },
        { celsius: 20, fahrenheit: 68 },
      ];

      testCases.forEach(({ celsius, fahrenheit }) => {
        const converted = convertTemperature(celsius, 'fahrenheit');
        expect(converted).toBeCloseTo(fahrenheit, 1);
      });
    });

    it('should handle temperature precision correctly', () => {
      // Test that we don't lose precision in conversions
      const originalTemp = 23.456;
      const converted = convertTemperature(originalTemp, 'fahrenheit');
      const backConverted = (converted - 32) * 5/9;
      
      expect(backConverted).toBeCloseTo(originalTemp, 3);
    });
  });

  describe('Weather Metrics Validation', () => {
    it('should validate humidity values', () => {
      expect(WeatherDataValidator.validateHumidity(50)).toBe(true);
      expect(WeatherDataValidator.validateHumidity(0)).toBe(true);
      expect(WeatherDataValidator.validateHumidity(100)).toBe(true);
      
      expect(WeatherDataValidator.validateHumidity(-1)).toBe(false);
      expect(WeatherDataValidator.validateHumidity(101)).toBe(false);
    });

    it('should validate wind speed values', () => {
      expect(WeatherDataValidator.validateWindSpeed(10)).toBe(true);
      expect(WeatherDataValidator.validateWindSpeed(0)).toBe(true);
      expect(WeatherDataValidator.validateWindSpeed(200)).toBe(true);
      
      expect(WeatherDataValidator.validateWindSpeed(-1)).toBe(false);
      expect(WeatherDataValidator.validateWindSpeed(600)).toBe(false);
    });

    it('should validate atmospheric pressure', () => {
      expect(WeatherDataValidator.validatePressure(1013)).toBe(true);
      expect(WeatherDataValidator.validatePressure(900)).toBe(true);
      expect(WeatherDataValidator.validatePressure(1050)).toBe(true);
      
      expect(WeatherDataValidator.validatePressure(800)).toBe(false);
      expect(WeatherDataValidator.validatePressure(1200)).toBe(false);
    });

    it('should validate UV index values', () => {
      expect(WeatherDataValidator.validateUVIndex(5)).toBe(true);
      expect(WeatherDataValidator.validateUVIndex(0)).toBe(true);
      expect(WeatherDataValidator.validateUVIndex(11)).toBe(true);
      
      expect(WeatherDataValidator.validateUVIndex(-1)).toBe(false);
      expect(WeatherDataValidator.validateUVIndex(20)).toBe(false);
    });

    it('should validate visibility values', () => {
      expect(WeatherDataValidator.validateVisibility(10)).toBe(true);
      expect(WeatherDataValidator.validateVisibility(0)).toBe(true);
      expect(WeatherDataValidator.validateVisibility(25)).toBe(true);
      
      expect(WeatherDataValidator.validateVisibility(-1)).toBe(false);
      expect(WeatherDataValidator.validateVisibility(100)).toBe(false);
    });

    it('should validate geographic coordinates', () => {
      expect(WeatherDataValidator.validateCoordinates(40.7128, -74.0060)).toBe(true); // NYC
      expect(WeatherDataValidator.validateCoordinates(0, 0)).toBe(true); // Equator/Prime Meridian
      expect(WeatherDataValidator.validateCoordinates(90, 180)).toBe(true); // Extremes
      expect(WeatherDataValidator.validateCoordinates(-90, -180)).toBe(true); // Extremes
      
      expect(WeatherDataValidator.validateCoordinates(91, 0)).toBe(false); // Invalid lat
      expect(WeatherDataValidator.validateCoordinates(0, 181)).toBe(false); // Invalid lon
    });
  });

  describe('Timezone Handling', () => {
    const testDate = new Date('2024-01-01T12:00:00Z'); // Noon UTC

    it('should convert times to different timezones correctly', () => {
      const nyTime = TimezoneUtils.convertToTimezone(testDate, 'America/New_York');
      const londonTime = TimezoneUtils.convertToTimezone(testDate, 'Europe/London');
      const tokyoTime = TimezoneUtils.convertToTimezone(testDate, 'Asia/Tokyo');

      // NYC should be 5 hours behind UTC (7 AM)
      expect(nyTime.getHours()).toBe(7);
      
      // London should be same as UTC (12 PM)
      expect(londonTime.getHours()).toBe(12);
      
      // Tokyo should be 9 hours ahead of UTC (9 PM)
      expect(tokyoTime.getHours()).toBe(21);
    });

    it('should format times correctly for different timezones', () => {
      const nyTimeStr = TimezoneUtils.formatTimeInTimezone(testDate, 'America/New_York');
      const tokyoTimeStr = TimezoneUtils.formatTimeInTimezone(testDate, 'Asia/Tokyo');

      expect(nyTimeStr).toMatch(/7:00 AM/);
      expect(tokyoTimeStr).toMatch(/9:00 PM/);
    });

    it('should handle timezone edge cases', () => {
      // Test with unknown timezone (should default to UTC)
      const unknownTz = TimezoneUtils.convertToTimezone(testDate, 'Unknown/Timezone');
      expect(unknownTz.getHours()).toBe(12); // Should remain UTC
    });
  });

  describe('Weather Icon Logic Validation', () => {
    it('should return appropriate icons for weather conditions', () => {
      const sunnyIcon = getWeatherIconType('Sunny');
      const rainyIcon = getWeatherIconType('Light rain');
      const cloudyIcon = getWeatherIconType('Cloudy');
      const snowIcon = getWeatherIconType('Snow');

      expect(sunnyIcon.color).toBe('text-yellow-300');
      expect(rainyIcon.color).toBe('text-blue-200'); // Light rain uses text-blue-200
      expect(cloudyIcon.color).toBe('text-gray-300');
      expect(snowIcon.color).toBe('text-blue-100');
    });

    it('should handle case-insensitive weather conditions', () => {
      const upperCase = getWeatherIconType('SUNNY');
      const lowerCase = getWeatherIconType('sunny');
      const mixedCase = getWeatherIconType('SuNnY');

      expect(upperCase.color).toBe('text-yellow-300');
      expect(lowerCase.color).toBe('text-yellow-300');
      expect(mixedCase.color).toBe('text-yellow-300');
    });

    it('should provide fallback for unknown weather conditions', () => {
      const unknownWeather = getWeatherIconType('Unknown Weather Condition');
      expect(unknownWeather.color).toBe('text-gray-300'); // Default fallback
    });
  });

  describe('Business Logic Accuracy', () => {
    it('should calculate feels-like temperature reasonably', () => {
      // Mock feels-like calculation (simplified)
      const calculateFeelsLike = (temp: number, humidity: number, windSpeed: number): number => {
        // Simplified heat index calculation
        if (temp > 26) {
          return temp + (humidity / 100) * 5; // Hot weather adjustment
        } else if (temp < 10) {
          return temp - (windSpeed / 10) * 2; // Wind chill adjustment
        }
        return temp;
      };

      expect(calculateFeelsLike(30, 80, 5)).toBeGreaterThan(30); // Should feel hotter
      expect(calculateFeelsLike(5, 50, 20)).toBeLessThan(5); // Should feel colder
      expect(calculateFeelsLike(20, 50, 10)).toBe(20); // Should feel the same
    });

    it('should validate weather data consistency', () => {
      // Mock weather data consistency checks
      const validateWeatherConsistency = (data: {
        temp_c?: number;
        temp_f?: number;
        feelslike_c?: number;
        feelslike_f?: number;
      }): boolean => {
        // Temperature consistency
        if (data.temp_c !== undefined && data.temp_f !== undefined) {
          const convertedF = (data.temp_c * 9/5) + 32;
          if (Math.abs(convertedF - data.temp_f) > 1) return false;
        }

        // Feels like should be within reasonable range of actual temp
        if (data.feelslike_c !== undefined && data.temp_c !== undefined) {
          if (Math.abs(data.feelslike_c - data.temp_c) > 15) return false;
        }

        return true;
      };

      const validData = {
        temp_c: 25,
        temp_f: 77,
        feelslike_c: 27,
        feelslike_f: 80.6
      };

      const invalidData = {
        temp_c: 25,
        temp_f: 100, // Inconsistent conversion
        feelslike_c: 50, // Unrealistic feels-like
      };

      expect(validateWeatherConsistency(validData)).toBe(true);
      expect(validateWeatherConsistency(invalidData)).toBe(false);
    });
  });
});
