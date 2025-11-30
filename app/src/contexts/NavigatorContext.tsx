import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { NavigatorReturn } from "@/hooks/useNavigator";

interface NavigatorContextType extends NavigatorReturn {}

const NavigatorContext = createContext<NavigatorContextType | null>(null);

interface NavigatorProviderProps {
  children: ReactNode;
  value: NavigatorContextType;
}

export function NavigatorProvider({ children, value }: NavigatorProviderProps) {
  return (
    <NavigatorContext.Provider value={value}>
      {children}
    </NavigatorContext.Provider>
  );
}

export function useNavigatorContext() {
  const context = useContext(NavigatorContext);
  if (!context) {
    throw new Error(
      "useNavigatorContext must be used within NavigatorProvider",
    );
  }
  return context;
}
