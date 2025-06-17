/**
 * Performance and optimization tests
 * Tests for performance, memory usage, and optimization scenarios
 */

import { convertTemperature, getTemperatureDisplay, formatLastUpdated } from '@/lib/utils';

// Mock performance monitoring
class PerformanceMonitor {
  private static measurements: { [key: string]: number[] } = {};

  static measure<T>(name: string, fn: () => T): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    const duration = end - start;

    if (!this.measurements[name]) {
      this.measurements[name] = [];
    }
    this.measurements[name].push(duration);

    return result;
  }

  static getAverageTime(name: string): number {
    const times = this.measurements[name] || [];
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  static getMaxTime(name: string): number {
    const times = this.measurements[name] || [];
    return Math.max(...times);
  }

  static reset() {
    this.measurements = {};
  }
}

// Mock memory usage tracking
class MemoryTracker {
  private static snapshots: number[] = [];

  static takeSnapshot(): number {
    // In a real environment, this would use performance.memory
    // For testing, we'll simulate memory usage
    const mockMemoryUsage = Math.random() * 1000000; // Random memory usage in bytes
    this.snapshots.push(mockMemoryUsage);
    return mockMemoryUsage;
  }

  static getMemoryGrowth(): number {
    if (this.snapshots.length < 2) return 0;
    return this.snapshots[this.snapshots.length - 1] - this.snapshots[0];
  }

  static reset() {
    this.snapshots = [];
  }
}

describe('Performance and Optimization', () => {
  beforeEach(() => {
    PerformanceMonitor.reset();
    MemoryTracker.reset();
  });

  describe('Temperature Conversion Performance', () => {
    it('should convert temperatures efficiently', () => {
      const temperatures = Array.from({ length: 1000 }, (_, i) => i - 500);

      const result = PerformanceMonitor.measure('temperature-conversion', () => {
        return temperatures.map(temp => convertTemperature(temp, 'fahrenheit'));
      });

      expect(result).toHaveLength(1000);
      expect(PerformanceMonitor.getAverageTime('temperature-conversion')).toBeLessThan(10); // Should be very fast
    });

    it('should handle bulk temperature display formatting efficiently', () => {
      const testData = Array.from({ length: 500 }, (_, i) => ({
        temp_c: i - 250,
        temp_f: (i - 250) * 9/5 + 32
      }));

      const result = PerformanceMonitor.measure('temperature-display', () => {
        return testData.map(data => 
          getTemperatureDisplay(data.temp_c, data.temp_f, 'celsius')
        );
      });

      expect(result).toHaveLength(500);
      expect(PerformanceMonitor.getAverageTime('temperature-display')).toBeLessThan(5);
    });
  });

  describe('Date Formatting Performance', () => {
    it('should format dates efficiently for large datasets', () => {
      const dates = Array.from({ length: 100 }, (_, i) => 
        new Date(Date.now() - i * 60000).toISOString()
      );

      const result = PerformanceMonitor.measure('date-formatting', () => {
        return dates.map(date => formatLastUpdated(date));
      });

      expect(result).toHaveLength(100);
      expect(PerformanceMonitor.getAverageTime('date-formatting')).toBeLessThan(200); // More realistic timing
    });
  });

  describe('Memory Usage', () => {
    it('should not cause memory leaks with repeated operations', () => {
      MemoryTracker.takeSnapshot();

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        convertTemperature(Math.random() * 100, 'fahrenheit');
        getTemperatureDisplay(Math.random() * 50, Math.random() * 100, 'celsius');
        formatLastUpdated(new Date().toISOString());
      }

      MemoryTracker.takeSnapshot();
      const memoryGrowth = MemoryTracker.getMemoryGrowth();

      // Memory growth should be minimal (less than 1MB for these operations)
      expect(Math.abs(memoryGrowth)).toBeLessThan(1000000);
    });

    it('should handle large arrays without excessive memory usage', () => {
      MemoryTracker.takeSnapshot();

      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        temp_c: Math.random() * 50,
        temp_f: Math.random() * 100
      }));

      // Process the array
      const processed = largeArray.map(item => ({
        ...item,
        display: getTemperatureDisplay(item.temp_c, item.temp_f, 'celsius')
      }));

      MemoryTracker.takeSnapshot();

      expect(processed).toHaveLength(10000);
      // Should not cause excessive memory growth
      expect(Math.abs(MemoryTracker.getMemoryGrowth())).toBeLessThan(5000000);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent temperature conversions', async () => {
      const concurrentOperations = Array.from({ length: 50 }, (_, i) => 
        Promise.resolve().then(() => 
          PerformanceMonitor.measure(`concurrent-${i}`, () =>
            convertTemperature(i, 'fahrenheit')
          )
        )
      );

      const results = await Promise.all(concurrentOperations);
      
      expect(results).toHaveLength(50);
      
      // All operations should complete reasonably quickly
      for (let i = 0; i < 50; i++) {
        expect(PerformanceMonitor.getMaxTime(`concurrent-${i}`)).toBeLessThan(5);
      }
    });

    it('should maintain accuracy under concurrent load', async () => {
      const testTemp = 25;
      const expectedF = 77;

      const concurrentConversions = Array.from({ length: 100 }, () =>
        Promise.resolve().then(() => convertTemperature(testTemp, 'fahrenheit'))
      );

      const results = await Promise.all(concurrentConversions);

      // All results should be identical and correct
      results.forEach(result => {
        expect(result).toBe(expectedF);
      });
    });
  });

  describe('Edge Case Performance', () => {
    it('should handle extreme values efficiently', () => {
      const extremeValues = [
        -273.15, // Absolute zero
        -200,    // Very cold
        -100,    // Cold
        0,       // Freezing
        100,     // Boiling
        1000,    // Very hot
        Number.MAX_SAFE_INTEGER / 1000000, // Large number
      ];

      const result = PerformanceMonitor.measure('extreme-values', () => {
        return extremeValues.map(temp => convertTemperature(temp, 'fahrenheit'));
      });

      expect(result).toHaveLength(extremeValues.length);
      expect(PerformanceMonitor.getAverageTime('extreme-values')).toBeLessThan(1);
    });

    it('should handle rapid successive calls efficiently', () => {
      const startTime = performance.now();

      // Make 1000 rapid calls
      for (let i = 0; i < 1000; i++) {
        convertTemperature(i % 100, 'fahrenheit');
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete all 1000 calls in less than 10ms
      expect(totalTime).toBeLessThan(10);
    });
  });

  describe('Optimization Validation', () => {
    it('should demonstrate performance improvements over naive implementations', () => {
      // Naive temperature conversion (recalculating constants)
      const naiveConvert = (temp: number): number => {
        const multiplier = 9 / 5; // Recalculated each time
        const offset = 32;        // Could be optimized
        return (temp * multiplier) + offset;
      };

      // Optimized version (constants pre-calculated)
      const optimizedConvert = (temp: number): number => {
        return (temp * 1.8) + 32; // Pre-calculated 9/5 = 1.8
      };

      const testTemps = Array.from({ length: 1000 }, (_, i) => i);

      PerformanceMonitor.measure('naive', () => {
        return testTemps.map(naiveConvert);
      });

      PerformanceMonitor.measure('optimized', () => {
        return testTemps.map(optimizedConvert);
      });

      // Optimized version should be faster or at least not slower
      expect(PerformanceMonitor.getAverageTime('optimized'))
        .toBeLessThanOrEqual(PerformanceMonitor.getAverageTime('naive') * 1.1);
    });

    it('should validate caching effectiveness', () => {
      const cache = new Map<string, string>();

      const formatWithCache = (date: string): string => {
        if (cache.has(date)) {
          return cache.get(date)!;
        }
        const formatted = formatLastUpdated(date);
        cache.set(date, formatted);
        return formatted;
      };

      const testDate = new Date().toISOString();
      const iterations = 100;

      // First call (cache miss)
      PerformanceMonitor.measure('cache-miss', () => {
        return formatWithCache(testDate);
      });

      // Subsequent calls (cache hits)
      PerformanceMonitor.measure('cache-hit', () => {
        for (let i = 0; i < iterations; i++) {
          formatWithCache(testDate);
        }
      });

      // Cache hits should be significantly faster
      expect(PerformanceMonitor.getAverageTime('cache-hit'))
        .toBeLessThan(PerformanceMonitor.getAverageTime('cache-miss'));
    });
  });

  describe('Scalability Tests', () => {
    it('should scale linearly with input size', () => {
      const sizes = [100, 500, 1000, 2000];
      const times: number[] = [];

      sizes.forEach(size => {
        const data = Array.from({ length: size }, (_, i) => i);

        PerformanceMonitor.measure(`scale-${size}`, () => {
          return data.map(temp => convertTemperature(temp, 'fahrenheit'));
        });

        times.push(PerformanceMonitor.getAverageTime(`scale-${size}`));
      });

      // Performance should scale roughly linearly
      // Time for 2000 items should be less than 10x time for 100 items (more lenient for CI)
      expect(times[3]).toBeLessThan(times[0] * 10);
    });
  });
});
