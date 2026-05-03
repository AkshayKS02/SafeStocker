import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import API from '@/app/services/api';
import { useAuth } from '@/context/AuthContext';

export interface ProductItem {
  ItemID: number;
  ItemName: string;
  Barcode?: string;
  CategoryID?: number | null;
  CategoryName?: string | null;
  Source?: string;
  Price: number;
}

export interface StockItem extends ProductItem {
  StockID: number;
  Quantity: number;
  ManufactureDate?: string;
  ExpiryDate?: string;
  DaysLeft?: number | null;
}

interface CreateItemPayload {
  ItemName: string;
  Barcode: string;
  CategoryID?: number | null;
  Source?: string;
  Price: number;
}

interface AddStockPayload {
  ItemID: number;
  SupplierID?: number | null;
  Quantity: number;
  ManufactureDate: string;
  ExpiryDate: string;
}

interface InvoiceLine {
  itemID: number;
  qty: number;
}

interface InventoryContextType {
  items: ProductItem[];
  products: ProductItem[];
  inventory: StockItem[];
  loading: boolean;
  error: string | null;
  refreshItems: () => Promise<void>;
  refreshStock: () => Promise<void>;
  refreshAll: () => Promise<void>;
  createItem: (payload: CreateItemPayload) => Promise<ProductItem>;
  addStock: (payload: AddStockPayload) => Promise<void>;
  removeStock: (stockID: number) => Promise<void>;
  updateStockQuantity: (stockID: number, quantity: number) => Promise<void>;
  generateInvoice: (items: InvoiceLine[]) => Promise<{ receiptID?: number; totalAmount?: number }>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toDateOnly(date: string | undefined) {
  if (!date) return undefined;
  return date.split('T')[0];
}

function calcDaysLeft(date: string | undefined) {
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(date);
  expiry.setHours(0, 0, 0, 0);

  return Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
}

function normalizeProduct(row: any): ProductItem {
  return {
    ItemID: toNumber(row.ItemID),
    ItemName: row.ItemName || 'Unnamed Product',
    Barcode: row.Barcode || '',
    CategoryID: row.CategoryID ?? null,
    CategoryName: row.CategoryName ?? null,
    Source: row.Source || 'API',
    Price: toNumber(row.Price),
  };
}

function normalizeStock(row: any): StockItem {
  const expiryDate = toDateOnly(row.ExpiryDate);

  return {
    ...normalizeProduct(row),
    StockID: toNumber(row.StockID),
    Quantity: toNumber(row.Quantity),
    ManufactureDate: toDateOnly(row.ManufactureDate),
    ExpiryDate: expiryDate,
    DaysLeft: calcDaysLeft(expiryDate),
  };
}

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [inventory, setInventory] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshItems = useCallback(async () => {
    if (!user?.ShopID || !token) {
      setProducts([]);
      return;
    }

    const response = await API.get('/items');
    setProducts(Array.isArray(response.data) ? response.data.map(normalizeProduct) : []);
  }, [token, user?.ShopID]);

  const refreshStock = useCallback(async () => {
    if (!user?.ShopID || !token) {
      setInventory([]);
      return;
    }

    const response = await API.get(`/stock/${user.ShopID}`);
    setInventory(Array.isArray(response.data) ? response.data.map(normalizeStock) : []);
  }, [token, user?.ShopID]);

  const refreshAll = useCallback(async () => {
    if (!user?.ShopID || !token) {
      setProducts([]);
      setInventory([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await Promise.all([refreshItems(), refreshStock()]);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [refreshItems, refreshStock, token, user?.ShopID]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const createItem = useCallback(
    async (payload: CreateItemPayload) => {
      const response = await API.post('/items', payload);
      const created: ProductItem = normalizeProduct({
        ...payload,
        ItemID: response.data?.ItemID,
      });

      await refreshItems();
      return created;
    },
    [refreshItems]
  );

  const addStock = useCallback(
    async (payload: AddStockPayload) => {
      await API.post('/stock', payload);
      await refreshStock();
    },
    [refreshStock]
  );

  const updateStockQuantity = useCallback(
    async (stockID: number, quantity: number) => {
      await API.put(`/stock/${stockID}`, { Quantity: quantity });
      await refreshStock();
    },
    [refreshStock]
  );

  const removeStock = useCallback(
    async (stockID: number) => {
      await updateStockQuantity(stockID, 0);
    },
    [updateStockQuantity]
  );

  const generateInvoice = useCallback(
    async (items: InvoiceLine[]) => {
      const response = await API.post('/invoice', { items });
      await refreshStock();
      return response.data || {};
    },
    [refreshStock]
  );

  return (
    <InventoryContext.Provider
      value={{
        items: products,
        products,
        inventory,
        loading,
        error,
        refreshItems,
        refreshStock,
        refreshAll,
        createItem,
        addStock,
        removeStock,
        updateStockQuantity,
        generateInvoice,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within an InventoryProvider');
  return context;
};
