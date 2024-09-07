import { renderHook } from '@testing-library/react';
import React from 'react';
import { TranslationsProviderContext } from './translations-provider';
import { useLocale } from './use-locale';

describe('useLocale', () => {
  it('should return the locale from context', () => {
    const mockContextValue = { locale: 'en', fallbackLocale: 'en' };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TranslationsProviderContext.Provider value={mockContextValue}>
        {children}
      </TranslationsProviderContext.Provider>
    );

    const { result } = renderHook(() => useLocale(), { wrapper });

    expect(result.current).toBe('en');
  });

  it('should throw an error if context is not provided', () => {
    const t = () => {
      renderHook(() => useLocale());
    }

    expect(t).toThrow("It seems that the provider `<TranslationsProvider />` is not implemented.");
  });
});
