import React, { createContext, useContext, useState, ReactNode } from "react";

// 1. Define the exact shape of a single inventory item
export interface InventoryItem {
  id: string;
  name: string;
  barcode: string;
  stock: number;
  daysLeft: number;
  price: number;
}

interface InventoryContextType {
  inventory: InventoryItem[];
  setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);
interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: "1",
      name: "Potato Chips",
      barcode: "8901491101837",
      stock: 12,
      daysLeft: 0,
      price: 20,
    },
    {
      id: "2",
      name: "Milk",
      barcode: "123456789",
      stock: 5,
      daysLeft: 9,
      price: 330,
    },
    {
      id: "3",
      name: "Bread",
      barcode: "987654321",
      stock: 12,
      daysLeft: 10,
      price: 25,
    },
    {
      id: "4",
      name: "Eggs",
      barcode: "456789123",
      stock: 24,
      daysLeft: 1,
      price: 10,
    },
    {
      id: "5",
      name: "5star",
      barcode: "12312456789",
      stock: 50,
      daysLeft: 9,
      price: 330,
    },
    {
      id: "6",
      name: "Miilk",
      barcode: "12345116789",
      stock: 5,
      daysLeft: 9,
      price: 30,
    },
  ]);

  return (
    <InventoryContext.Provider value={{ inventory, setInventory }}>
      {children}
    </InventoryContext.Provider>
  );
};
export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
};