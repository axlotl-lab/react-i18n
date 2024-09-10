# react-i18n

The `useTranslations` hook provides a versatile way to manage translations in your React application, supporting nested keys, parameter interpolation, and rich content with React components.

### Usage

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

#### Parameters

| Parameter      | Type                      | Required | Default | Description                                    |
|----------------|---------------------------|----------|---------|------------------------------------------------|
| locale         | string                    | Yes      | -       | The locale to use for translations in the entire application |
| fallbackLocale | string                    | Yes      | -       | Fallback locale if translation is not found    |

Then, you can use the `useTranslations` hook in your components:

```jsx
import { useTranslations } from '@axlotl-lab/react-i18n';

const translations = {
  greetings: {
    hello: { en: 'Hello', es: 'Hola' },
    welcome: { en: 'Welcome, {name}!', es: '¡Bienvenido, {name}!' },
    richWelcome: { 
      en: 'Welcome to our <bold>website</bold>! <image/>',
      es: '¡Bienvenido a nuestro <bold>sitio web</bold>! <image/>'
    }
  }
};

function MyComponent() {
  const t = useTranslations({ translations });

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

### Parameter interpretation
Allows passing parameters to be interpolated into the translation strings.

#### Example:
```javascript
const translations = {
  greetings: {
    welcome: { en: 'Welcome, {name}!', es: '¡Bienvenido, {name}!' },
  }
};
```

```jsx
{t('greetings.welcome', { name: 'John' })}
{/*Output: Welcome, John! */}
```	

### Rich content
Supports embedding React components within translations.

#### Example:
```javascript
const translations = {
  greetings: {
    welcome: { en: 'Welcome, <name>!', es: '¡Bienvenido, <name>!' },
  }
};
```

```jsx
{t.rich('greetings.welcome', { name: (content) => <strong>{content}</strong> })}
{/*Output: Welcome, <strong>John</strong>! */}
```

#### Type Safety
It is completely type-safe, ensuring that all translation keys are properly defined and accessible.

### Global Translations

To set global translations:

```typescript
import { setGlobalTranslations } from '@axlotl-lab/react-i18n';

setGlobalTranslations({
  common: {
    submit: { en: 'Submit', es: 'Enviar' },
    cancel: { en: 'Cancel', es: 'Cancelar' }
  }
});
```

Global translations are merged with local translations, with local translations taking precedence in case of conflicts.

#### Autocomplete for Global Translations

To enable autocomplete for global translations in your IDE, you can define a type for your global translations and extend the `GlobalTranslations` interface. Here's how to set it up:

1. Define your global translations type:

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

2. Create a declaration file (e.g., `global.d.ts`) in your project root or src directory:

```typescript
// global.d.ts
import { common } from "./translations/common";

declare module "@axlotl-lab/react-i18n" {
  type GlobalTranslations = typeof common
}
```

3. Now, when you use the `useTranslations` hook, you'll get autocomplete for both global and local translations:

```typescript
import { useTranslations } from '@axlotl-lab/react-i18n';

function MyComponent() {
  const t = useTranslations({ translations });

  return (
    <div>
      <button>{t('common.submit')}</button> {/* Autocomplete works for global translations */}
      <p>{t('myLocalKey')}</p> {/* Autocomplete works for local translations */}
    </div>
  );
}
```

By following these steps, your IDE will provide autocomplete suggestions for global translation keys, improving developer experience and reducing errors.

Make sure your `tsconfig.json` includes the path to your declaration file.

This setup allows you to maintain type safety and get autocomplete for your global translations across your entire project.

#### Notes

- Ensure that all your translation objects follow the same structure across different locales.
- The hook will return the key itself if no translation is found (in case you use `as any`), allowing for easy identification of missing translations.
- When using rich translations, make sure to provide all necessary component functions to avoid unprocessed tags in the output.
- Global translations are merged with local translations using a deep merge function, ensuring that all nested structures are properly combined.