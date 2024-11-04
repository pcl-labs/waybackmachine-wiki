import { useState, useEffect } from 'react';
import { Revision } from '@/types/revisions';

function useRevisions(idOrTitle: string) {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRevisions() {
      if (!idOrTitle) return;
      
      try {
        const queryParam = /^\d+$/.test(idOrTitle) 
          ? `id=${idOrTitle}`
          : `title=${encodeURIComponent(idOrTitle)}`;
        
        const res = await fetch(`/api/revisions?${queryParam}`);
        const data = await res.json();
        
        if (data.error) {
          console.error('API Error:', data.error);
          return;
        }
        
        if (data.revisions) {
          setRevisions(data.revisions);
        }
      } catch (error) {
        console.error('Error fetching revisions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRevisions();
  }, [idOrTitle]);

  return { revisions, isLoading };
}

function useArticleContent(revisionId: string) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      if (!revisionId) return;
      
      try {
        const res = await fetch(`/api/content?revisionId=${revisionId}`);
        const data = await res.json();
        
        if (data.error) {
          console.error('API Error:', data.error);
          return;
        }
        
        if (data.content) {
          setContent(data.content);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchContent();
  }, [revisionId]);

  return { content, isLoading };
}

export { useRevisions, useArticleContent };