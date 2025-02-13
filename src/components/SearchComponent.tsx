'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { useDebounce } from '@/lib/hooks';
import styles from './cmdksearch.module.css';

interface SearchResult {
  pageid: number;
  title: string;
  titleSlug?: string;
}

export default function SearchComponent() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);

  const searchWikipedia = useCallback(async (value: string) => {
    if (value) {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setResults(data.query?.search || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      }
    } else {
      setResults([]);
    }
  }, []);

  const debouncedSearch = useDebounce(searchWikipedia, 300);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.searchContainer} ${isFocused ? styles.focused : ''}`}>
        <div className={styles.blurOverlay} />
        <div className={styles.vercel}>
          <Command className={styles['cmdk-root']}>
            <div>
              <Command.Input
                className={styles['cmdk-input']}
                placeholder="Search Wikipedia..."
                value={query}
                onValueChange={(value: string) => {
                  setQuery(value);
                  router.push(`/search?q=${encodeURIComponent(value)}`, { scroll: false });
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </div>
            <Command.List className={styles['cmdk-list']}>
              {results.length === 0 && query !== '' && (
                <Command.Empty className={styles['cmdk-empty']}>No results found.</Command.Empty>
              )}
              {results.map((result) => (
                <Command.Item
                  key={result.pageid}
                  onSelect={() => router.push(`/article/${encodeURIComponent(result.title.replace(/ /g, '_'))}`)}
                  className={styles['cmdk-item']}
                >
                  {result.title}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </div>
      </div>
    </div>
  );
}