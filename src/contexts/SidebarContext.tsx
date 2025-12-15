'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

const STORAGE_KEY = 'sidebar-collapsed';

export interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  expandSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      setIsCollapsed(stored === 'true');
    }
    setIsHydrated(true);
  }, []);

  // Persist state changes to localStorage
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    }
  }, [isCollapsed, isHydrated]);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const collapseSidebar = useCallback(() => {
    setIsCollapsed(true);
  }, []);

  const expandSidebar = useCallback(() => {
    setIsCollapsed(false);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        collapseSidebar,
        expandSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar(): SidebarContextType {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
