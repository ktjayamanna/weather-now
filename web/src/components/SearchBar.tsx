'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trpc } from '@/utils/trpc';
import { useToast } from '@/components/ui/toast';
import { SearchLocation } from '@/types/weather';

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
  clearInput?: boolean;
  onClearComplete?: () => void;
}

export function SearchBar({
  onSearch,
  isLoading = false,
  className,
  placeholder = "Search for a city...",
  clearInput = false,
  onClearComplete
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  // Debounced search for autocomplete
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search suggestions
  const { data: suggestions = [], isLoading: isSearching } = trpc.weather.searchLocations.useQuery(
    { query: debouncedQuery },
    {
      enabled: debouncedQuery.length >= 2,
      refetchOnWindowFocus: false,
    }
  );

  // Show suggestions when we have results and input is focused
  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && query.length >= 2);
    setSelectedIndex(-1);
  }, [suggestions, query]);

  // Clear input when clearInput prop is true
  useEffect(() => {
    if (clearInput) {
      setQuery('');
      setShowSuggestions(false);
      setSelectedIndex(-1);
      onClearComplete?.();
    }
  }, [clearInput, onClearComplete]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Check if the query matches any of our suggestions
      const exactMatch = suggestions.find(
        (location: SearchLocation) =>
          location.name.toLowerCase() === query.toLowerCase() ||
          `${location.name}, ${location.region}`.toLowerCase() === query.toLowerCase() ||
          `${location.name}, ${location.country}`.toLowerCase() === query.toLowerCase()
      );

      if (suggestions.length > 0 && !exactMatch) {
        // If we have suggestions but no exact match, show error
        addToast({
          type: 'error',
          title: 'Location not found',
          description: 'Please select a location from the suggestions or try a different search term.',
        });
        return;
      }

      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (location: SearchLocation) => {
    const locationString = `${location.name}, ${location.region}, ${location.country}`;
    setQuery(locationString);
    setShowSuggestions(false);
    onSearch(locationString);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div ref={searchRef} className={cn('relative', className)} data-testid="search-bar">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="pl-10 pr-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200"
            autoComplete="off"
            data-testid="search-input"
          />
          <Button
            type="submit"
            disabled={isLoading || !query.trim()}
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white border-white/30 rounded-lg px-3 py-1 text-xs font-medium transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 max-h-60 overflow-y-auto z-50">
          {isSearching ? (
            <div className="p-4 text-center text-white/80">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white/60 mx-auto mb-2"></div>
              <span className="text-sm">Searching...</span>
            </div>
          ) : (
            suggestions.map((location: SearchLocation, index: number) => (
              <button
                key={location.id}
                onClick={() => handleSuggestionClick(location)}
                className={cn(
                  'w-full text-left p-4 hover:bg-white/20 transition-all duration-200 flex items-center space-x-3 border-b border-white/10 last:border-b-0 first:rounded-t-xl last:rounded-b-xl',
                  selectedIndex === index && 'bg-white/20'
                )}
              >
                <MapPin className="h-4 w-4 text-white/60 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white truncate text-sm">
                    {location.name}
                  </div>
                  <div className="text-xs text-white/70 truncate">
                    {location.region && location.region !== location.name ? `${location.region}, ` : ''}
                    {location.country}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
