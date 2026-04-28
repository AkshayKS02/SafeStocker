import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '@/app/services/api';

interface Item {
  ItemID: number;
  ItemName: string;
  Quantity: number;
  Price: number;
  Category?: string;
  ExpiryDate?: string;
}

interface InventoryContextType {
  items: Item[];
  loading: boolean;
  error: string | null;
  refreshStock: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStock = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get('/stock');
      setItems(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stock');
      console.error('Inventory Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStock();
  }, [refreshStock]);

  return (
    <InventoryContext.Provider value={{ items, loading, error, refreshStock }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within an InventoryProvider');
  return context;
};