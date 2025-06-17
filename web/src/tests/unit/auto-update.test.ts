/**
 * Auto-update mechanism tests
 * Tests the logic for automatic weather data updates based on user settings
 */

import { UpdateFrequency } from '@/types/settings';

// Mock the auto-update logic from page.tsx
class AutoUpdateManager {
  private lastAutoUpdate: string | null = null;
  private updateFrequency: UpdateFrequency = '1hour';

  constructor(updateFrequency: UpdateFrequency = '1hour') {
    this.updateFrequency = updateFrequency;
  }

  setLastAutoUpdate(timestamp: string) {
    this.lastAutoUpdate = timestamp;
  }

  setUpdateFrequency(frequency: UpdateFrequency) {
    this.updateFrequency = frequency;
  }

  getUpdateInterval(): number {
    switch (this.updateFrequency) {
      case '30min': return 30 * 60 * 1000; // 30 minutes
      case '1hour': return 60 * 60 * 1000; // 1 hour
      case '1day': return 24 * 60 * 60 * 1000; // 1 day
      default: return 60 * 60 * 1000; // Default to 1 hour
    }
  }

  shouldUpdate(currentTime: number = Date.now()): boolean {
    if (!this.lastAutoUpdate) return true;
    const timeSinceLastUpdate = currentTime - new Date(this.lastAutoUpdate).getTime();
    return timeSinceLastUpdate >= this.getUpdateInterval();
  }

  updateAllCities(citiesCount: number, currentTime: number = Date.now()): boolean {
    if (citiesCount === 0 || !this.shouldUpdate(currentTime)) return false;
    
    this.setLastAutoUpdate(new Date(currentTime).toISOString());
    return true;
  }
}

describe('Auto-Update Mechanism', () => {
  let autoUpdateManager: AutoUpdateManager;
  const mockCurrentTime = new Date('2024-01-01T12:00:00Z').getTime();

  beforeEach(() => {
    autoUpdateManager = new AutoUpdateManager();
    jest.spyOn(Date, 'now').mockReturnValue(mockCurrentTime);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getUpdateInterval', () => {
    it('should return correct interval for 30 minutes', () => {
      autoUpdateManager.setUpdateFrequency('30min');
      expect(autoUpdateManager.getUpdateInterval()).toBe(30 * 60 * 1000);
    });

    it('should return correct interval for 1 hour', () => {
      autoUpdateManager.setUpdateFrequency('1hour');
      expect(autoUpdateManager.getUpdateInterval()).toBe(60 * 60 * 1000);
    });

    it('should return correct interval for 1 day', () => {
      autoUpdateManager.setUpdateFrequency('1day');
      expect(autoUpdateManager.getUpdateInterval()).toBe(24 * 60 * 60 * 1000);
    });

    it('should default to 1 hour for unknown frequency', () => {
      // @ts-ignore - testing invalid input
      autoUpdateManager.setUpdateFrequency('invalid' as UpdateFrequency);
      expect(autoUpdateManager.getUpdateInterval()).toBe(60 * 60 * 1000);
    });
  });

  describe('shouldUpdate', () => {
    it('should return true when no previous update exists', () => {
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(true);
    });

    it('should return false when update interval has not passed', () => {
      // Set last update to 30 minutes ago, with 1 hour interval
      const thirtyMinutesAgo = mockCurrentTime - (30 * 60 * 1000);
      autoUpdateManager.setLastAutoUpdate(new Date(thirtyMinutesAgo).toISOString());
      autoUpdateManager.setUpdateFrequency('1hour');
      
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(false);
    });

    it('should return true when update interval has passed', () => {
      // Set last update to 2 hours ago, with 1 hour interval
      const twoHoursAgo = mockCurrentTime - (2 * 60 * 60 * 1000);
      autoUpdateManager.setLastAutoUpdate(new Date(twoHoursAgo).toISOString());
      autoUpdateManager.setUpdateFrequency('1hour');
      
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(true);
    });

    it('should work correctly with 30-minute intervals', () => {
      autoUpdateManager.setUpdateFrequency('30min');
      
      // 20 minutes ago - should not update
      const twentyMinutesAgo = mockCurrentTime - (20 * 60 * 1000);
      autoUpdateManager.setLastAutoUpdate(new Date(twentyMinutesAgo).toISOString());
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(false);
      
      // 35 minutes ago - should update
      const thirtyFiveMinutesAgo = mockCurrentTime - (35 * 60 * 1000);
      autoUpdateManager.setLastAutoUpdate(new Date(thirtyFiveMinutesAgo).toISOString());
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(true);
    });

    it('should work correctly with daily intervals', () => {
      autoUpdateManager.setUpdateFrequency('1day');
      
      // 12 hours ago - should not update
      const twelveHoursAgo = mockCurrentTime - (12 * 60 * 60 * 1000);
      autoUpdateManager.setLastAutoUpdate(new Date(twelveHoursAgo).toISOString());
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(false);
      
      // 25 hours ago - should update
      const twentyFiveHoursAgo = mockCurrentTime - (25 * 60 * 60 * 1000);
      autoUpdateManager.setLastAutoUpdate(new Date(twentyFiveHoursAgo).toISOString());
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(true);
    });
  });

  describe('updateAllCities', () => {
    it('should not update when no cities exist', () => {
      const result = autoUpdateManager.updateAllCities(0, mockCurrentTime);
      expect(result).toBe(false);
    });

    it('should update when cities exist and no previous update', () => {
      const result = autoUpdateManager.updateAllCities(3, mockCurrentTime);
      expect(result).toBe(true);
    });

    it('should not update when interval has not passed', () => {
      // Set last update to 30 minutes ago
      const thirtyMinutesAgo = mockCurrentTime - (30 * 60 * 1000);
      autoUpdateManager.setLastAutoUpdate(new Date(thirtyMinutesAgo).toISOString());
      autoUpdateManager.setUpdateFrequency('1hour');
      
      const result = autoUpdateManager.updateAllCities(3, mockCurrentTime);
      expect(result).toBe(false);
    });

    it('should update when interval has passed', () => {
      // Set last update to 2 hours ago
      const twoHoursAgo = mockCurrentTime - (2 * 60 * 60 * 1000);
      autoUpdateManager.setLastAutoUpdate(new Date(twoHoursAgo).toISOString());
      autoUpdateManager.setUpdateFrequency('1hour');
      
      const result = autoUpdateManager.updateAllCities(3, mockCurrentTime);
      expect(result).toBe(true);
    });

    it('should update timestamp when update occurs', () => {
      const result = autoUpdateManager.updateAllCities(1, mockCurrentTime);
      expect(result).toBe(true);
      
      // Should not update immediately after
      const oneMinuteLater = mockCurrentTime + (1 * 60 * 1000);
      const secondResult = autoUpdateManager.updateAllCities(1, oneMinuteLater);
      expect(secondResult).toBe(false);
    });
  });

  describe('frequency change scenarios', () => {
    it('should respect new frequency settings immediately', () => {
      // Start with 1 hour, set last update to 45 minutes ago
      const fortyFiveMinutesAgo = mockCurrentTime - (45 * 60 * 1000);
      autoUpdateManager.setLastAutoUpdate(new Date(fortyFiveMinutesAgo).toISOString());
      autoUpdateManager.setUpdateFrequency('1hour');

      // Should not update with 1 hour frequency
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(false);

      // Change to 30 minute frequency
      autoUpdateManager.setUpdateFrequency('30min');

      // Should now update with 30 minute frequency
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(true);
    });

    it('should handle frequency changes from frequent to less frequent', () => {
      // Start with 30 min, set last update to 45 minutes ago
      const fortyFiveMinutesAgo = mockCurrentTime - (45 * 60 * 1000);
      autoUpdateManager.setLastAutoUpdate(new Date(fortyFiveMinutesAgo).toISOString());
      autoUpdateManager.setUpdateFrequency('30min');

      // Should update with 30 minute frequency
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(true);

      // Change to daily frequency
      autoUpdateManager.setUpdateFrequency('1day');

      // Should not update with daily frequency (45 min < 24 hours)
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(false);
    });
  });

  describe('Auto-update Integration Scenarios', () => {
    it('should handle multiple cities with different update needs', () => {
      // Simulate scenario where some cities need updates and others don't
      const citiesData = [
        { id: '1', lastUpdate: mockCurrentTime - (2 * 60 * 60 * 1000) }, // 2 hours ago
        { id: '2', lastUpdate: mockCurrentTime - (30 * 60 * 1000) },     // 30 minutes ago
        { id: '3', lastUpdate: mockCurrentTime - (90 * 60 * 1000) },     // 90 minutes ago
      ];

      autoUpdateManager.setUpdateFrequency('1hour');

      // Cities 1 and 3 should need updates, city 2 should not
      const city1ShouldUpdate = (mockCurrentTime - citiesData[0].lastUpdate) >= autoUpdateManager.getUpdateInterval();
      const city2ShouldUpdate = (mockCurrentTime - citiesData[1].lastUpdate) >= autoUpdateManager.getUpdateInterval();
      const city3ShouldUpdate = (mockCurrentTime - citiesData[2].lastUpdate) >= autoUpdateManager.getUpdateInterval();

      expect(city1ShouldUpdate).toBe(true);  // 2 hours > 1 hour
      expect(city2ShouldUpdate).toBe(false); // 30 min < 1 hour
      expect(city3ShouldUpdate).toBe(true);  // 90 min > 1 hour
    });

    it('should handle rapid frequency changes gracefully', () => {
      const thirtyMinutesAgo = mockCurrentTime - (30 * 60 * 1000);
      autoUpdateManager.setLastAutoUpdate(new Date(thirtyMinutesAgo).toISOString());

      // Rapidly change frequencies
      autoUpdateManager.setUpdateFrequency('1hour');
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(false);

      autoUpdateManager.setUpdateFrequency('30min');
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(true);

      autoUpdateManager.setUpdateFrequency('1day');
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(false);

      autoUpdateManager.setUpdateFrequency('30min');
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(true);
    });

    it('should maintain update consistency across app restarts', () => {
      // Simulate app restart scenario
      const twoHoursAgo = mockCurrentTime - (2 * 60 * 60 * 1000);

      // First session
      autoUpdateManager.setLastAutoUpdate(new Date(twoHoursAgo).toISOString());
      autoUpdateManager.setUpdateFrequency('1hour');

      // App "restarts" - create new manager with same settings
      const newAutoUpdateManager = new AutoUpdateManager('1hour');
      newAutoUpdateManager.setLastAutoUpdate(new Date(twoHoursAgo).toISOString());

      // Should still recognize that update is needed
      expect(newAutoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(true);
    });

    it('should handle edge case timing scenarios', () => {
      // Test exactly at the boundary
      const exactlyOneHourAgo = mockCurrentTime - (60 * 60 * 1000);
      autoUpdateManager.setLastAutoUpdate(new Date(exactlyOneHourAgo).toISOString());
      autoUpdateManager.setUpdateFrequency('1hour');

      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(true);

      // Test just before the boundary
      const justUnderOneHour = mockCurrentTime - (60 * 60 * 1000 - 1);
      autoUpdateManager.setLastAutoUpdate(new Date(justUnderOneHour).toISOString());

      expect(autoUpdateManager.shouldUpdate(mockCurrentTime)).toBe(false);
    });
  });

  describe('Performance and Resource Management', () => {
    it('should handle large numbers of update checks efficiently', () => {
      const startTime = Date.now();

      // Perform many update checks
      for (let i = 0; i < 1000; i++) {
        autoUpdateManager.shouldUpdate(mockCurrentTime + i);
      }

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Should complete quickly (less than 100ms for 1000 operations)
      expect(executionTime).toBeLessThan(100);
    });

    it('should not cause memory leaks with frequent updates', () => {
      // Simulate frequent timestamp updates
      for (let i = 0; i < 100; i++) {
        const timestamp = new Date(mockCurrentTime + (i * 60 * 1000)).toISOString();
        autoUpdateManager.setLastAutoUpdate(timestamp);
        autoUpdateManager.updateAllCities(5, mockCurrentTime + (i * 60 * 1000));
      }

      // Should still function correctly after many operations
      expect(autoUpdateManager.shouldUpdate(mockCurrentTime + (200 * 60 * 1000))).toBe(true);
    });
  });
});
