import { render } from '@testing-library/react';
import React from 'react';
import { TranslationsProvider, TranslationsProviderContext } from './translations-provider';

describe('TranslationsProvider', () => {
  it('should provide the locale to its children', () => {
    const TestComponent = () => {
      const context = React.useContext(TranslationsProviderContext);
      return <div>{context?.locale}</div>;
    };

    const { getByText } = render(
      <TranslationsProvider locale="es" fallbackLocale="en">
        <TestComponent />
      </TranslationsProvider>
    );

    expect(getByText('es')).toBeDefined();
  });

  it('should memoize the context value', () => {
    const TestComponent = () => {
      const context = React.useContext(TranslationsProviderContext);
      return <div>{context?.locale}</div>;
    };

    const { rerender, getByText } = render(
      <TranslationsProvider locale="es" fallbackLocale="en">
        <TestComponent />
      </TranslationsProvider>
    );

    expect(getByText('es')).toBeDefined();

    rerender(
      <TranslationsProvider locale="es" fallbackLocale="es">
        <TestComponent />
      </TranslationsProvider>
    );

    expect(getByText('es')).toBeDefined();
  });
});
