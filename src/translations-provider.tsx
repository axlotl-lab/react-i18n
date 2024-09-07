'use client'

import React from 'react';

type TranslationsProviderContextType = { locale: string, fallbackLocale: string }
type TranslationsProviderProps = { children: React.ReactNode } & TranslationsProviderContextType

export const TranslationsProviderContext = React.createContext<TranslationsProviderContextType | undefined>(undefined);

export const TranslationsProvider = ({ locale, fallbackLocale, children }: TranslationsProviderProps) => {
  const context = React.useMemo(() => {
    return { locale, fallbackLocale }
  }, [locale]);

  return (
    <TranslationsProviderContext.Provider value={context}>
      {children}
    </TranslationsProviderContext.Provider>
  );
};

TranslationsProvider.displayName = 'TranslationsProvider';