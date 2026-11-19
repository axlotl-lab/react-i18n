# react-i18n

The `useTranslations` hook provides a versatile way to manage translations in your React application, supporting nested keys, parameter interpolation, and rich content with React components.

[![npm version](https://img.shields.io/npm/v/@axlotl-lab/react-i18n.svg)](https://www.npmjs.com/package/@axlotl-lab/react-i18n)

## Installation

```bash
npm install @axlotl-lab/react-i18n
```

Requires React 18 or 19.

## Usage

Add the `TranslationsProvider` component to your application:

```jsx
import { TranslationsProvider } from '@axlotl-lab/react-i18n';

function App() {
  return (
    <TranslationsProvider locale="es" fallbackLocale="en">
      <MyApp />
    </TranslationsProvider>
  );
}
```

### Parameters

| Parameter      | Type   | Required | Default | Description                                              |
|----------------|--------|----------|---------|----------------------------------------------------------|
| locale         | string | Yes      | -       | The locale to use for translations in the entire application |
| fallbackLocale | string | Yes      | -       | Locale used when a translation is missing for `locale`   |

## Basic Translation Usage

Define your translations, with one entry per locale on each key, and pass them to the `useTranslations` hook:

```jsx
import { useTranslations } from '@axlotl-lab/react-i18n';

const translations = {
  greetings: {
    hello: { en: 'Hello', es: 'Hola' },
    welcome: { en: 'Welcome, {name}!', es: '¡Bienvenido, {name}!' },
    richWelcome: {
      en: 'Welcome to our <bold>amazing website</bold>! <image/>',
      es: '¡Bienvenido a nuestro <bold>increíble sitio web</bold>! <image/>'
    }
  }
};

function MyComponent() {
  const t = useTranslations(translations);

  return (
    <div>
      <p>{t('greetings.hello')}</p>
      <p>{t('greetings.welcome', { name: 'John' })}</p>
      {t.rich('greetings.richWelcome', {
        bold: (text) => <strong>{text}</strong>,
        image: () => <img src="/logo.png" alt="Logo" />
      })}
    </div>
  );
}
```

Define the translations object outside the component (or memoize it). The `t` function keeps the same reference between renders while the translations object and the locales don't change, so it is safe to use in `useEffect`, `useMemo` and `useCallback` dependencies. An object literal created inside the component produces a new `t` on every render.

> The `useTranslations({ translations })` form is still supported but deprecated. Use `useTranslations(translations)` instead.

## Features

### Parameter Interpolation

Pass parameters to be interpolated into translation strings using `{parameterName}` syntax:

```javascript
const translations = {
  messages: {
    itemCount: {
      en: 'You have {count} items',
      es: 'Tienes {count} elementos'
    },
    userProfile: {
      en: 'Hello {name}, you are {age} years old',
      es: 'Hola {name}, tienes {age} años'
    }
  }
};
```

```jsx
{t('messages.itemCount', { count: 5 })}
{/* Output: You have 5 items */}

{t('messages.userProfile', { name: 'John', age: 25 })}
{/* Output: Hello John, you are 25 years old */}
```

Values are inserted as-is: characters like `$` or placeholders inside a value (`{other}`) are not interpreted. Placeholders without a matching value are left untouched.

### Rich Content with React Components

Embed React components within translations using XML-like tags:

```javascript
const translations = {
  content: {
    announcement: {
      en: 'Visit our <link>documentation</link> and join our <discord>Discord</discord>!',
      es: '¡Visita nuestra <link>documentación</link> y únete a nuestro <discord>Discord</discord>!'
    }
  }
};
```

```jsx
{t.rich('content.announcement', {
  link: (text) => <a href="/docs" className="text-blue-500">{text}</a>,
  discord: (text) => <a href="/discord" className="text-purple-500">{text}</a>
})}
{/* Output: Visit our <a href="/docs" class="text-blue-500">documentation</a> and join our <a href="/discord" class="text-purple-500">Discord</a>! */}
```

### Self-Closing Tags

Rich content also supports self-closing tags (`<tag/>` or `<tag />`) for components without content:

```javascript
const translations = {
  ui: {
    separator: {
      en: 'Before <divider/> After',
      es: 'Antes <divider /> Después'
    }
  }
};
```

```jsx
{t.rich('ui.separator', {
  divider: () => <hr className="my-4" />
})}
```

#### Rich content limitations

- Tags cannot be nested (`<bold><link>text</link></bold>` is not supported).
- Tags without a matching component are rendered as plain text.
- The text inside a tag is trimmed before being passed to the component.
- `t.rich` does not interpolate `{parameters}`; pass dynamic values through the component functions instead.

### Translation Key Existence Check

Check if a translation key exists before using it:

```jsx
const t = useTranslations(translations);

if (t.exists('greetings.hello')) {
  return <p>{t('greetings.hello')}</p>;
}
```

### Current Locale Access

Access the current locale from the hook:

```jsx
const t = useTranslations(translations);

return (
  <div>
    <p>Current language: {t.locale}</p>
    <p>{t('greetings.hello')}</p>
  </div>
);
```

If you only need the locale, use the `useLocale` hook:

```jsx
import { useLocale } from '@axlotl-lab/react-i18n';

function LanguageBadge() {
  const locale = useLocale();
  return <span>{locale}</span>;
}
```

## Global Translations

Set translations that are available throughout your entire application. Call `setGlobalTranslations` once, at startup, before rendering. Each call replaces the previous global translations.

```typescript
import { setGlobalTranslations } from '@axlotl-lab/react-i18n';

setGlobalTranslations({
  common: {
    submit: { en: 'Submit', es: 'Enviar' },
    cancel: { en: 'Cancel', es: 'Cancelar' },
    loading: { en: 'Loading...', es: 'Cargando...' }
  },
  navigation: {
    home: { en: 'Home', es: 'Inicio' },
    about: { en: 'About', es: 'Acerca de' }
  }
});
```

Global translations are available from every `useTranslations` call, together with the local translations passed to it:

```jsx
const localTranslations = {
  page: {
    title: { en: 'My Page', es: 'Mi Página' }
  }
};

function MyComponent() {
  const t = useTranslations(localTranslations);

  return (
    <div>
      <h1>{t('page.title')}</h1> {/* Local translation */}
      <button>{t('common.submit')}</button> {/* Global translation */}
    </div>
  );
}
```

When the same key exists in both, local translations take precedence locale by locale: if the local key doesn't define the current locale, the global translation for that locale is used before falling back to `fallbackLocale`.

### TypeScript Autocomplete for Global Translations

To enable IDE autocomplete for global translations:

1. **Define your global translations:**

```typescript
// globalTranslations.ts
export const globalTranslations = {
  common: {
    submit: { en: 'Submit', es: 'Enviar' },
    cancel: { en: 'Cancel', es: 'Cancelar' }
  },
  navigation: {
    home: { en: 'Home', es: 'Inicio' },
    about: { en: 'About', es: 'Acerca de' }
  }
};

export type GlobalTranslationsType = typeof globalTranslations;
```

2. **Create a type declaration file:**

```typescript
// global.d.ts or types/react-i18n.d.ts
import { GlobalTranslationsType } from './globalTranslations';

declare module "@axlotl-lab/react-i18n" {
  type GlobalTranslations = GlobalTranslationsType;
}
```

3. **Use with full autocomplete support:**

```typescript
import { useTranslations } from '@axlotl-lab/react-i18n';

function MyComponent() {
  const t = useTranslations(translations);

  return (
    <div>
      <button>{t('common.submit')}</button> {/* ✅ Autocomplete works */}
      <p>{t('myLocalKey')}</p> {/* ✅ Autocomplete works */}
    </div>
  );
}
```

Make sure your `tsconfig.json` includes the path to your declaration file.

## Type Safety

With TypeScript, translation keys are type-checked:

- Only keys defined in the local or global translations are accepted by `t`, `t.rich` and autocompleted by the IDE
- Nested keys are supported up to 6 levels deep

Parameter names in `t()` and component names in `t.rich()` are not type-checked against the translation strings.

## Best Practices

- Ensure all translation objects follow the same structure across different locales
- Use meaningful, nested keys for better organization (e.g., `common.buttons.save` instead of `saveButton`)
- Define global translations for commonly used text across your application
- Define translations outside your components so `t` stays stable between renders
- Use the `exists` method to conditionally render content based on translation availability
- When using rich translations, always provide all necessary component functions to avoid unprocessed tags

## Notes

- When a key is not found, the hook returns the key itself and logs a warning with `console.warn`, making it easy to identify missing translations during development
- If a translation is missing for the current locale, the `fallbackLocale` translation is used
- Rich content uses a regex-based parser to handle XML-like tags within translation strings
