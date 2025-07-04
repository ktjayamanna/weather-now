import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { WeatherApiResponse, ForecastApiResponse } from '@/types/weather';

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_BASE_URL = 'http://api.weatherapi.com/v1';

if (!WEATHER_API_KEY) {
  throw new Error('WEATHER_API_KEY environment variable is not set');
}

export const weatherRouter = createTRPCRouter({
  getCurrentWeather: publicProcedure
    .input(
      z.object({
        city: z.string().min(1, 'City name is required'),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `${WEATHER_API_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
            input.city
          )}&aqi=no`
        );

        if (!response.ok) {
          if (response.status === 400) {
            throw new Error('City not found. Please check the city name and try again.');
          }
          throw new Error(`Weather API error: ${response.status}`);
        }

        const data: WeatherApiResponse = await response.json();
        return data;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error('Failed to fetch weather data');
      }
    }),

  getForecast: publicProcedure
    .input(
      z.object({
        city: z.string().min(1, 'City name is required'),
        days: z.number().min(1).max(14).default(7),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `${WEATHER_API_BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
            input.city
          )}&days=${input.days}&aqi=no&alerts=no`
        );

        if (!response.ok) {
          if (response.status === 400) {
            throw new Error('City not found. Please check the city name and try again.');
          }
          throw new Error(`Weather API error: ${response.status}`);
        }

        const data: ForecastApiResponse = await response.json();
        return data;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error('Failed to fetch forecast data');
      }
    }),

  searchLocations: publicProcedure
    .input(
      z.object({
        query: z.string().min(1, 'Search query is required'),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `${WEATHER_API_BASE_URL}/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(
            input.query
          )}`
        );

        if (!response.ok) {
          if (response.status === 400) {
            throw new Error('Invalid search query');
          }
          throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error('Failed to search locations');
      }
    }),
});
