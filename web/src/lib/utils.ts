import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
