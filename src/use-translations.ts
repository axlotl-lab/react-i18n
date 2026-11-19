import React from "react";
import { TranslationsProviderContext } from "./translations-provider";
import { FlattenObjectKeys, NestedTranslations } from "./types";

declare global {
  type GlobalTranslations = never
}

type AllTranslations<T> = GlobalTranslations extends never
  ? T
  : T extends {} ? T | GlobalTranslations : GlobalTranslations

type TranslationKey<T> = FlattenObjectKeys<AllTranslations<T>>;

type UseTranslationsProps<T> = { translations?: NestedTranslations<T> }

type ComponentFunction = (text?: string) => React.ReactNode;

type StaticTranslationFunction<T> = (
  key: TranslationKey<T>, values?: Record<string, string | number>
) => string

type RichTranslationFunction<T> = (
  key: TranslationKey<T>, components?: Record<string, ComponentFunction>
) => React.ReactNode

let globalTranslations: unknown = {};

/**
 * Walks `path` (dot-separated) inside `obj` and returns the object found there, if any.
 */
function getNode(obj: unknown, path: string): Record<string, string> | undefined {
  let current: any = obj;
  for (const part of path.split('.')) {
    if (current == null || current[part] === undefined) {
      return undefined;
    }
    current = current[part];
  }
  return current !== null && typeof current === 'object' ? current : undefined;
}

export function setGlobalTranslations<T>(translations: NestedTranslations<T>) {
  globalTranslations = translations;
}

/**
 * @deprecated Use `useTranslations(translations)` instead of `useTranslations({ translations })`
 */
export function useTranslations<T>(props: UseTranslationsProps<T>): StaticTranslationFunction<T> & {
  rich: RichTranslationFunction<T>;
  exists: (key: string) => boolean;
  locale: string;
};

export function useTranslations<T>(translations?: NestedTranslations<T>): StaticTranslationFunction<T> & {
  rich: RichTranslationFunction<T>;
  exists: (key: string) => boolean;
  locale: string;
};

export function useTranslations<T>(
  translationsOrProps?: NestedTranslations<T> | UseTranslationsProps<T>
) {
  // Detectar si se pasó el formato antiguo { translations } o el nuevo (directamente)
  const translations = translationsOrProps && typeof translationsOrProps === 'object' && 'translations' in translationsOrProps
    ? translationsOrProps.translations
    : translationsOrProps as NestedTranslations<T> | undefined;
  const context = React.useContext(TranslationsProviderContext);

  if (!context) {
    throw new Error('It seems that the provider `<TranslationsProvider />` is not implemented.');
  }

  const { locale, fallbackLocale } = context;

  return React.useMemo(() => {
    // Local translations take precedence over global ones, locale by locale.
    // Globals are read on each call, so translations set after mount are still found.
    const getNestedValue = (path: string): string | undefined => {
      const globalLeaf = getNode(globalTranslations, path);
      const localLeaf = getNode(translations, path);

      if (!globalLeaf && !localLeaf) {
        return undefined;
      }

      const leaf = { ...globalLeaf, ...localLeaf };
      return leaf[locale] || leaf[fallbackLocale];
    };

    const staticMessages: StaticTranslationFunction<T> = (key, values): string => {
      const translation = getNestedValue(key as string);

      if (translation === undefined) {
        console.warn(`Translation key "${key}" not found`);
        return key as string;
      }

      if (!values) return translation;

      return translation.replace(/\{([^{}]+)\}/g, (match, param: string) =>
        Object.prototype.hasOwnProperty.call(values, param) ? String(values[param]) : match
      );
    };

    const richMessages: RichTranslationFunction<T> = (key, components = {}) => {
      const translation = getNestedValue(key as string);

      if (translation === undefined) {
        console.warn(`Translation key "${key}" not found`);
        return key;
      }

      const regex = /<(\w+)\s*\/>|<(\w+)>([^<]*)<\/\2>/g;

      let lastIndex = 0;
      const result: React.ReactNode[] = [];

      translation.replace(regex, (match, selfClosingTag, pairedTag, content, index) => {
        const tag = selfClosingTag ?? pairedTag;

        if (index > lastIndex) {
          result.push(translation.slice(lastIndex, index));
        }

        if (components[tag]) {
          const key = `${tag}-${index}`;
          const componentContent = content?.trim();
          const element = components[tag](componentContent);
          result.push(React.createElement(React.Fragment, { key }, element));
        } else {
          result.push(match);
        }

        lastIndex = index + match.length;
        return match;
      });

      if (lastIndex < translation.length) {
        result.push(translation.slice(lastIndex));
      }

      return result;
    };

    const exists = (key: string): boolean => {
      return Boolean(getNestedValue(key))
    }

    return Object.assign(staticMessages, {
      rich: richMessages, exists,
      locale
    });
  }, [translations, locale, fallbackLocale]);
};