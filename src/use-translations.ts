import React from "react";
import { deepMerge } from "./deep-merge";
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
  key: TranslationKey<T>, values?: Record<string, string>
) => string

type RichTranslationFunction<T> = (
  key: TranslationKey<T>, components?: Record<string, ComponentFunction>
) => React.ReactNode

let globalTranslations = {};

export function setGlobalTranslations<T>(translations: NestedTranslations<T>) {
  globalTranslations = translations;
}

export const useTranslations = <T>({ translations }: UseTranslationsProps<T> = {}) => {
  const context = React.useContext(TranslationsProviderContext);

  if (!context) {
    throw new Error('It seems that the provider `<TranslationsProvider />` is not implemented.');
  }

  const combinedTranslations = deepMerge({}, globalTranslations, translations || {});

  const getNestedValue = (obj: any, path: string): string | undefined => {
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current[part] === undefined) {
        return undefined;
      }
      current = current[part];
    }
    return typeof current === 'object' ? current[context.locale] || current[context.fallbackLocale] : undefined;
  };

  const staticMessages: StaticTranslationFunction<T> = (key, values): string => {
    const translation = getNestedValue(combinedTranslations, key as string);

    if (translation === undefined) {
      console.warn(`Translation key "${key}" not found`);
      return key as string;
    }

    let result = translation;
    if (values) {
      Object.entries(values).forEach(([param, value]) => {
        result = result.replace(new RegExp(`{${param}}`, 'g'), String(value));
      });
    }

    return result;
  };

  const richMessages: RichTranslationFunction<T> = (key, components = {}) => {
    const translation = getNestedValue(combinedTranslations, key as string);

    if (translation === undefined) {
      console.warn(`Translation key "${key}" not found`);
      return key;
    }

    const regex = /<(\w+)(\s*\/>|>([^<]*))<\/\1>/g;

    let lastIndex = 0;
    const result: React.ReactNode[] = [];

    translation.replace(regex, (match, tag, _, content, index) => {
      if (index > lastIndex) {
        result.push(translation.slice(lastIndex, index));
      }

      if (components[tag]) {
        result.push(components[tag](content?.trim()));
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
    return Boolean(getNestedValue(combinedTranslations, key))
  }

  const t = Object.assign(staticMessages, { rich: richMessages, exists });

  return t;
};