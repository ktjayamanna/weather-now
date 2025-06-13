'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch: (city: string) => void;
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
}

export function SearchBar({ 
  onSearch, 
  isLoading = false, 
  className,
  placeholder = "Search for a city..."
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isLoading}
          className="pl-10 pr-20 glass-effect text-white placeholder:text-white/70 border-white/30"
        />
        <Button
          type="submit"
          disabled={isLoading || !query.trim()}
          variant="glass"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>
    </form>
  );
}
