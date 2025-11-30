import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { BannerDesign } from "@/types/banner";

interface BannerContextType {
  selectedDesign: BannerDesign | null;
  setSelectedDesign: (design: BannerDesign | null) => void;
  editedValues: Record<string, string>;
  setEditedValues: (values: Record<string, string>) => void;
  updateValue: (areaId: string, value: string) => void;
}

const BannerContext = createContext<BannerContextType | null>(null);

interface BannerProviderProps {
  children: ReactNode;
}

export function BannerProvider({ children }: BannerProviderProps) {
  const [selectedDesign, setSelectedDesign] = useState<BannerDesign | null>(
    null,
  );
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  const updateValue = (areaId: string, value: string) => {
    setEditedValues((prev) => ({
      ...prev,
      [areaId]: value,
    }));
  };

  return (
    <BannerContext.Provider
      value={{
        selectedDesign,
        setSelectedDesign,
        editedValues,
        setEditedValues,
        updateValue,
      }}
    >
      {children}
    </BannerContext.Provider>
  );
}

export function useBannerContext() {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error("useBannerContext must be used within BannerProvider");
  }
  return context;
}
