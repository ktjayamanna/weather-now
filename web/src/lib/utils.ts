import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudHail,
  CloudSun,
  CloudFog
} from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWeatherGradient(condition: string): string {
  const lowerCondition = condition.toLowerCase();
  
  if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
    return 'weather-gradient-sunny';
  } else if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
    return 'weather-gradient-rain';
  } else if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) {
    return 'weather-gradient-cloudy';
  }
  
  return 'weather-gradient';
}

export function formatTemperature(temp: number, unit: 'C' | 'F' = 'C'): string {
  return `${Math.round(temp)}°${unit}`;
}

export function convertTemperature(tempC: number, targetUnit: 'celsius' | 'fahrenheit'): number {
  if (targetUnit === 'fahrenheit') {
    return (tempC * 9/5) + 32;
  }
  return tempC;
}

export function getTemperatureDisplay(tempC: number, tempF: number, unit: 'celsius' | 'fahrenheit'): string {
  const temp = unit === 'celsius' ? tempC : tempF;
  return `${Math.round(temp)}°`;
}

export function getTemperatureWithUnit(tempC: number, tempF: number, unit: 'celsius' | 'fahrenheit'): string {
  const temp = unit === 'celsius' ? tempC : tempF;
  const unitSymbol = unit === 'celsius' ? 'C' : 'F';
  return `${Math.round(temp)}°${unitSymbol}`;
}

export function getWeatherIconType(condition: string): {
  icon: typeof Cloud;
  color: string;
} {
  const lowerCondition = condition.toLowerCase();

  // Clear/Sunny conditions
  if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
    return { icon: Sun, color: 'text-yellow-300' };
  }

  // Partly cloudy conditions
  if (lowerCondition.includes('partly cloudy') || lowerCondition.includes('partly sunny')) {
    return { icon: CloudSun, color: 'text-yellow-200' };
  }

  // Thunderstorm conditions
  if (lowerCondition.includes('thunder') || lowerCondition.includes('storm') || lowerCondition.includes('lightning')) {
    return { icon: CloudLightning, color: 'text-purple-300' };
  }

  // Snow conditions
  if (lowerCondition.includes('snow') || lowerCondition.includes('blizzard') || lowerCondition.includes('flurries')) {
    return { icon: CloudSnow, color: 'text-blue-100' };
  }

  // Hail conditions
  if (lowerCondition.includes('hail') || lowerCondition.includes('sleet') || lowerCondition.includes('ice pellets')) {
    return { icon: CloudHail, color: 'text-blue-200' };
  }

  // Fog/Mist conditions
  if (lowerCondition.includes('fog') || lowerCondition.includes('mist') || lowerCondition.includes('haze')) {
    return { icon: CloudFog, color: 'text-gray-200' };
  }

  // Light rain/drizzle conditions
  if (lowerCondition.includes('light rain') || lowerCondition.includes('drizzle') ||
      lowerCondition.includes('light shower') || lowerCondition.includes('sprinkle')) {
    return { icon: CloudDrizzle, color: 'text-blue-200' };
  }

  // Heavy rain conditions
  if (lowerCondition.includes('heavy rain') || lowerCondition.includes('downpour') ||
      lowerCondition.includes('torrential') || lowerCondition.includes('heavy shower')) {
    return { icon: CloudRain, color: 'text-blue-400' };
  }

  // General rain conditions
  if (lowerCondition.includes('rain') || lowerCondition.includes('shower')) {
    return { icon: CloudRain, color: 'text-blue-300' };
  }

  // Overcast/Cloudy conditions
  if (lowerCondition.includes('overcast') || lowerCondition.includes('cloudy')) {
    return { icon: Cloud, color: 'text-gray-300' };
  }

  // Default fallback
  return { icon: Cloud, color: 'text-gray-300' };
}

export function formatLastUpdated(lastUpdated: string): string {
  const date = new Date(lastUpdated);

  // Format date and time using user's local timezone
  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Get user's local timezone abbreviation
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  let timezoneStr = '';

  try {
    const tzAbbr = Intl.DateTimeFormat('en-US', {
      timeZone: userTimezone,
      timeZoneName: 'short'
    }).formatToParts(new Date()).find(part => part.type === 'timeZoneName')?.value;

    if (tzAbbr) {
      timezoneStr = ` ${tzAbbr}`;
    }
  } catch {
    // Fallback if timezone detection fails
    timezoneStr = '';
  }

  return `${dateStr} at ${timeStr}${timezoneStr}`;
}

export function formatLastUpdatedShort(lastUpdated: string): string {
  const date = new Date(lastUpdated);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInMinutes < 1440) { // Less than 24 hours
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInMinutes / 1440);
    return `${days}d ago`;
  }
}
