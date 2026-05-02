import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import API from '@/app/services/api';

interface Item {
  ItemID: number;
  ItemName: string;
  Quantity: number;
  Price: number;
  Category?: string;
  ExpiryDate?: string;
  DaysLeft?: number;
  Barcode?: string;
}

// --- Fake Data for Development ---
const MOCK_DATA: Item[] = [
  { ItemID: 1, ItemName: 'Organic Bananas', Quantity: 150, Price: 0.99, Category: 'Produce', ExpiryDate: '2026-05-05' },
  { ItemID: 2, ItemName: 'Whole Milk', Quantity: 40, Price: 3.49, Category: 'Dairy', ExpiryDate: '2026-05-10' },
  { ItemID: 3, ItemName: 'Sourdough Bread', Quantity: 12, Price: 5.50, Category: 'Bakery', ExpiryDate: '2026-05-02' },
  { ItemID: 4, ItemName: 'Greek Yogurt', Quantity: 0, Price: 1.25, Category: 'Dairy', ExpiryDate: '2026-05-15' },
  { ItemID: 5, ItemName: 'Avocados', Quantity: 85, Price: 2.00, Category: 'Produce', ExpiryDate: '2026-05-07' },
];

interface InventoryContextType {
  items: Item[];
  inventory: Item[];
  loading: boolean;
  error: string | null;
  refreshStock: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with MOCK_DATA instead of an empty array
  const [items, setItems] = useState<Item[]>(MOCK_DATA);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshStock = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get('/stock');
      if (response.data && response.data.length > 0) {
        setItems(response.data);
      }
      setError(null);
    } catch (err: any) {
      // Log the error but keep the mock data visible so you can keep working
      console.warn('API Offline - Using Mock Data:', err.message);
      setError('Running in Offline/Mock Mode');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStock();
  }, [refreshStock]);

  return (
    <InventoryContext.Provider value={{ items, inventory: items, loading, error, refreshStock }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within an InventoryProvider');
  return context;
};
