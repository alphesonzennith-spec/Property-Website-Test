'use client';

import React, { useState } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/lib/trpc/client';
import { useSearchStore } from '@/lib/store';

export function AISearchBar() {
  const [query, setQuery] = useState('');
  const { setFilters, aiTags, setAiTags, removeAiTag } = useSearchStore();

  const parseQuery = trpc.properties.parseNaturalLanguageQuery.useMutation({
    onSuccess: (data) => {
      setFilters(data.filters);
      setAiTags(data.extractedTags);
    },
  });

  const handleSearch = () => {
    if (query.trim()) {
      parseQuery.mutate({ query: query.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleRemoveTag = (tag: string) => {
    removeAiTag(tag);
    // TODO: Update filters when tag removed (future enhancement)
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Try: '3 bedroom condo in Bedok under 2M'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-32 h-12 text-base bg-white border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
        />
        <Button
          onClick={handleSearch}
          disabled={parseQuery.isPending || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 gap-2"
          size="sm"
        >
          <Sparkles className="w-4 h-4" />
          AI Search
        </Button>
      </div>

      {/* AI Understanding Tags */}
      {aiTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">AI understood:</span>
          {aiTags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 pl-2 pr-1 py-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:bg-gray-300 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${tag} filter`}
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {parseQuery.isError && (
        <p className="text-xs text-red-600">
          Failed to parse query. Please try again.
        </p>
      )}
    </div>
  );
}
