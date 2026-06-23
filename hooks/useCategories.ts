import { useCallback, useEffect, useState } from 'react';
import API from '@/app/services/api';

export interface Category {
  CategoryID: number;
  CategoryName: string;
}

interface UseCategoriesResult {
  categories: Category[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/categories');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setCategories(
          res.data
            .filter((c: any) => c.CategoryID && c.CategoryName)
            .sort((a: Category, b: Category) =>
              a.CategoryName.localeCompare(b.CategoryName)
            )
        );
      }
    } catch (err) {
      console.error('[useCategories] fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { categories, loading, refresh };
}
