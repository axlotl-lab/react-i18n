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

  it('should memoize the context value while props do not change', () => {
    const contexts: unknown[] = [];
    const TestComponent = () => {
      contexts.push(React.useContext(TranslationsProviderContext));
      return null;
    };

    const { rerender } = render(
      <TranslationsProvider locale="es" fallbackLocale="en">
        <TestComponent />
      </TranslationsProvider>
    );

    rerender(
      <TranslationsProvider locale="es" fallbackLocale="en">
        <TestComponent />
      </TranslationsProvider>
    );

    expect(contexts).toHaveLength(2);
    expect(contexts[1]).toBe(contexts[0]);
  });

  it('should update the context when fallbackLocale changes', () => {
    const TestComponent = () => {
      const context = React.useContext(TranslationsProviderContext);
      return <div>{context?.fallbackLocale}</div>;
    };

    const { rerender, getByText } = render(
      <TranslationsProvider locale="fr" fallbackLocale="en">
        <TestComponent />
      </TranslationsProvider>
    );

    expect(getByText('en')).toBeDefined();

    rerender(
      <TranslationsProvider locale="fr" fallbackLocale="es">
        <TestComponent />
      </TranslationsProvider>
    );

    expect(getByText('es')).toBeDefined();
  });
});
