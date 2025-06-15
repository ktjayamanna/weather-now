'use client';

import { getWeatherIconType } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface WeatherIconProps {
  condition: string;
  size?: string;
  className?: string;
}

export function WeatherIcon({ condition, size = 'h-16 w-16', className }: WeatherIconProps) {
  const { icon: IconComponent, color } = getWeatherIconType(condition);
  
  return (
    <IconComponent 
      className={cn(size, color, className)} 
    />
  );
}
