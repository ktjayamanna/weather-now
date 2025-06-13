'use client';

import { Cloud, Sun, CloudRain, Wind, Droplets, Eye, Thermometer, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { City } from '@/types/weather';
import { formatTemperature, getWeatherGradient } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface WeatherDisplayProps {
  city: City;
  onAddCity?: () => void;
  showAddButton?: boolean;
  className?: string;
}

function getWeatherIcon(condition: string) {
  const lowerCondition = condition.toLowerCase();
  
  if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
    return <Sun className="h-16 w-16 text-yellow-300" />;
  } else if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
    return <CloudRain className="h-16 w-16 text-blue-300" />;
  }
  
  return <Cloud className="h-16 w-16 text-gray-300" />;
}

export function WeatherDisplay({ 
  city, 
  onAddCity, 
  showAddButton = false,
  className 
}: WeatherDisplayProps) {
  const { currentWeather } = city;
  
  if (!currentWeather) {
    return (
      <div className={cn('text-center text-white', className)}>
        <p>No weather data available</p>
      </div>
    );
  }

  const gradientClass = getWeatherGradient(currentWeather.condition.text);

  return (
    <div className={cn(
      'min-h-screen flex flex-col items-center justify-center text-white relative',
      gradientClass,
      className
    )}>
      {/* Header with add button */}
      {showAddButton && onAddCity && (
        <div className="absolute top-4 right-4">
          <Button
            onClick={onAddCity}
            variant="glass"
            size="sm"
            className="text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      )}

      {/* Main weather content */}
      <div className="flex flex-col items-center space-y-6 px-6">
        {/* City name */}
        <h1 className="text-3xl font-light text-center">
          {city.name}
        </h1>

        {/* Temperature */}
        <div className="text-8xl font-thin">
          {formatTemperature(currentWeather.temp_c)}
        </div>

        {/* Weather condition */}
        <div className="flex flex-col items-center space-y-2">
          {getWeatherIcon(currentWeather.condition.text)}
          <p className="text-xl font-light">
            {currentWeather.condition.text}
          </p>
        </div>

        {/* Weather details */}
        <div className="w-full max-w-md space-y-4 mt-8">
          <div className="glass-effect rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wind className="h-4 w-4" />
                <span>Wind</span>
              </div>
              <span>{currentWeather.wind_kph} km/h</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Droplets className="h-4 w-4" />
                <span>Humidity</span>
              </div>
              <span>{currentWeather.humidity}%</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Visibility</span>
              </div>
              <span>{currentWeather.vis_km} km</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Thermometer className="h-4 w-4" />
                <span>Feels like</span>
              </div>
              <span>{formatTemperature(currentWeather.feelslike_c)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
