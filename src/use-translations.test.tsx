import { renderHook } from '@testing-library/react';
import React from 'react';
import { TranslationsProviderContext } from './translations-provider';
import { setGlobalTranslations, useTranslations } from './use-translations';

const mockTranslationsProvider = (locale: string, fallbackLocale = "en") => {
  return ({ children }: { children: React.ReactNode }) => (
    <TranslationsProviderContext.Provider value={{ locale, fallbackLocale }}>
      {children}
    </TranslationsProviderContext.Provider>
  );
};

describe('Translations', () => {
  describe('setGlobalTranslations', () => {
    it('should set global translations correctly', () => {
      const wrapper = mockTranslationsProvider('en');

      const globalTranslations = {
        common: {
          hello: {
            en: 'Hello',
            es: 'Hola'
          }
        }
      };
      setGlobalTranslations(globalTranslations);

      const { result } = renderHook(() => useTranslations(), { wrapper });
      expect(result.current('common.hello' as any)).toBe('Hello');
    });
  });

  describe('useTranslations', () => {
    const localTranslations = {
      greetings: {
        goodMorning: {
          en: 'Good morning',
          es: 'Buenos días'
        }
      }
    };

    it('should return correct translation for the given locale', () => {
      const wrapper = mockTranslationsProvider('es');
      const { result } = renderHook(() => useTranslations({ translations: localTranslations }), { wrapper });

      expect(result.current('greetings.goodMorning')).toBe('Buenos días');
    });

    it('should fall back to default locale if translation is missing', () => {
      const wrapper = mockTranslationsProvider('fr');
      const { result } = renderHook(() => useTranslations({ translations: localTranslations }), { wrapper });

      expect(result.current('greetings.goodMorning')).toBe('Good morning');
    });

    it('should merge global and local translations', () => {
      const wrapper = mockTranslationsProvider('es');

      setGlobalTranslations({
        common: {
          hello: {
            en: 'Hello',
            es: 'Hola'
          }
        }
      });

      const { result } = renderHook(() => useTranslations({ translations: localTranslations }), { wrapper });

      expect(result.current('common.hello' as any)).toBe('Hola');
      expect(result.current('greetings.goodMorning')).toBe('Buenos días');
    });

    it('should handle nested keys correctly', () => {
      const wrapper = mockTranslationsProvider('es');

      const nestedTranslations = {
        very: {
          nested: {
            key: {
              en: 'Nested value',
              es: 'Valor anidado'
            }
          }
        }
      };

      const { result } = renderHook(() => useTranslations({ translations: nestedTranslations }), { wrapper });

      expect(result.current('very.nested.key')).toBe('Valor anidado');
    });

    it('should interpolate values correctly', () => {
      const wrapper = mockTranslationsProvider('en');

      const interpolationTranslations = {
        welcome: {
          en: 'Welcome, {name}!',
          es: '¡Bienvenido, {name}!'
        }
      };

      const { result } = renderHook(() => useTranslations({ translations: interpolationTranslations }), { wrapper });
      expect(result.current('welcome', { name: 'John' })).toBe('Welcome, John!');
    });

    it('should handle rich text translations', () => {
      const wrapper = mockTranslationsProvider('en');

      const richTextTranslations = {
        richWelcome: {
          en: 'Welcome, <name>John</name>!',
          es: '¡Bienvenido, <name>Juan</name>!'
        }
      };

      const { result } = renderHook(() => useTranslations({ translations: richTextTranslations }), { wrapper });

      const value = result.current.rich('richWelcome', {
        name: (content) => <strong>{content}</strong>
      });
      expect(value).toEqual(['Welcome, ', <strong>John</strong>, '!']);
    });

    it('should return key if translation is not found', () => {
      const wrapper = mockTranslationsProvider('en');
      const { result } = renderHook(() => useTranslations(), { wrapper });

      expect(result.current('nonexistent.key' as any)).toBe('nonexistent.key');
    });

    it('should maintain separate translations for multiple hook calls', () => {
      const wrapper = mockTranslationsProvider('es');

      // Primera llamada al hook
      const { result: result1 } = renderHook(() =>
        useTranslations({
          translations: {
            key1: { es: 'Valor 1', en: 'Value 1' },
            shared: { es: 'Compartido 1', en: 'Shared 1' }
          }
        }), { wrapper });

      // Segunda llamada al hook
      const { result: result2 } = renderHook(() =>
        useTranslations({
          translations: {
            key2: { es: 'Valor 2', en: 'Value 2' },
            shared: { es: 'Compartido 2', en: 'Shared 2' }
          }
        }), { wrapper });

      // Verificar que cada hook mantiene sus propias traducciones
      expect(result1.current('key1')).toBe('Valor 1');
      expect(result2.current('key2')).toBe('Valor 2');

      // Verificar que las claves compartidas no se pisan entre sí
      expect(result1.current('shared')).toBe('Compartido 1');
      expect(result2.current('shared')).toBe('Compartido 2');

      // Verificar que las claves no definidas en un hook no afectan al otro
      expect(result1.current('key2' as any)).toBe('key2');
      expect(result2.current('key1' as any)).toBe('key1');
    });

    describe('handling non-existent keys', () => {
      let consoleSpy: jest.SpyInstance;

      const wrapper = mockTranslationsProvider('en');

      beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
      });

      afterEach(() => {
        consoleSpy.mockRestore();
      });

      const localTranslations = {
        existingKey: {
          en: 'Existing translation'
        },
        parent: {
          child: {
            en: 'Nested translation'
          }
        },
        richKey: {
          en: 'Rich <bold>translation</bold>'
        }
      };

      it('should return the key and log a warning when the translation key does not exist for static messages', () => {
        const { result } = renderHook(() => useTranslations({ translations: localTranslations }), { wrapper });

        const nonExistentKey = 'non.existent.key';
        const value = result.current(nonExistentKey as any);

        expect(value).toBe(nonExistentKey);
        expect(consoleSpy).toHaveBeenCalledWith(`Translation key "${nonExistentKey}" not found`);
      });

      it('should return the key for non-existent nested keys for static messages', () => {
        const { result } = renderHook(() => useTranslations({ translations: localTranslations }), { wrapper });

        const nonExistentNestedKey = 'parent.nonexistent.key';
        const value = result.current(nonExistentNestedKey as any);

        expect(value).toBe(nonExistentNestedKey);
        expect(consoleSpy).toHaveBeenCalledWith(`Translation key "${nonExistentNestedKey}" not found`);
      });

      it('should return the key and log a warning when the translation key does not exist for rich messages', () => {
        const { result } = renderHook(() => useTranslations({ translations: localTranslations }), { wrapper });

        const nonExistentKey = 'non.existent.rich.key';
        const value = result.current.rich(nonExistentKey as any);

        expect(value).toBe(nonExistentKey);
        expect(consoleSpy).toHaveBeenCalledWith(`Translation key "${nonExistentKey}" not found`);
      });

      it('should return the key for non-existent nested keys for rich messages', () => {
        const { result } = renderHook(() => useTranslations({ translations: localTranslations }), { wrapper });

        const nonExistentNestedKey = 'parent.nonexistent.rich.key';
        const value = result.current.rich(nonExistentNestedKey as any);

        expect(value).toBe(nonExistentNestedKey);
        expect(consoleSpy).toHaveBeenCalledWith(`Translation key "${nonExistentNestedKey}" not found`);
      });

      it('should handle existing keys correctly for both static and rich messages', () => {
        const { result } = renderHook(() => useTranslations({ translations: localTranslations }), { wrapper });

        expect(result.current('existingKey')).toBe('Existing translation');
        expect(result.current('parent.child')).toBe('Nested translation');

        const richResult = result.current.rich('richKey', { bold: (content) => <b>{content}</b> });
        expect(richResult).toEqual(['Rich ', <b>translation</b>]);

        expect(consoleSpy).not.toHaveBeenCalled();
      });
    });

    describe('checking if translation key exists', () => {
      const wrapper = mockTranslationsProvider('en');

      const localTranslations = {
        existingKey: {
          en: 'Existing translation'
        },
      };

      it('should return false if the key does not exist', () => {
        const { result } = renderHook(() => useTranslations({ translations: localTranslations }), { wrapper });

        const nonExistentKey = 'non.existent.key';
        const nonExistingResult = result.current.exists(nonExistentKey as any);
        const existingResult = result.current.exists('existingKey');

        expect(nonExistingResult).toBeFalsy();
        expect(existingResult).toBeTruthy();
      });
    })
  });
});