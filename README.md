# react-i18n

The `useTranslations` hook provides a versatile way to manage translations in your React application, supporting nested keys, parameter interpolation, and rich content with React components.

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
| fallbackLocale | string | Yes      | -       | Fallback locale if translation is not found             |

## Basic Translation Usage

Use the `useTranslations` hook in your components:

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

## Features

### Parameter Interpolation

Pass parameters to be interpolated into translation strings using `{parameterName}` syntax:

```javascript
const translations = {
  messages: {
    itemCount: { 
      en: 'You have {count} item{count}', 
      es: 'Tienes {count} elemento{count}' 
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

Rich content also supports self-closing tags for components without content:

```javascript
const translations = {
  ui: {
    separator: { 
      en: 'Before <divider/> After',
      es: 'Antes <divider/> Después'
    }
  }
};
```

```jsx
{t.rich('ui.separator', {
  divider: () => <hr className="my-4" />
})}
```

### Translation Key Existence Check

Check if a translation key exists before using it:

```jsx
const t = useTranslations({ translations });

if (t.exists('greetings.hello')) {
  return <p>{t('greetings.hello')}</p>;
}
```

### Current Locale Access

Access the current locale from the hook:

```jsx
const t = useTranslations({ translations });

return (
  <div>
    <p>Current language: {t.locale}</p>
    <p>{t('greetings.hello')}</p>
  </div>
);
```

## Global Translations

Set translations that are available throughout your entire application:

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

Global translations are automatically merged with local translations. Local translations take precedence in case of conflicts.

```jsx
function MyComponent() {
  const localTranslations = {
    page: {
      title: { en: 'My Page', es: 'Mi Página' }
    }
  };
  
  const t = useTranslations({ translations: localTranslations });

  return (
    <div>
      <h1>{t('page.title')}</h1> {/* Local translation */}
      <button>{t('common.submit')}</button> {/* Global translation */}
    </div>
  );
}
```

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
  const t = useTranslations({ translations });

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

The hook is fully type-safe, ensuring that:

- All translation keys are properly defined and accessible
- Parameter names in interpolation match the translation strings
- Component functions in rich content correspond to the tags used
- Global and local translation keys are both autocompleted

## Best Practices

- Ensure all translation objects follow the same structure across different locales
- Use meaningful, nested keys for better organization (e.g., `common.buttons.save` instead of `saveButton`)
- Define global translations for commonly used text across your application
- Use the `exists` method to conditionally render content based on translation availability
- When using rich translations, always provide all necessary component functions to avoid unprocessed tags

## Notes

- Global translations are merged with local translations using a deep merge function
- The hook will return the key itself if no translation is found, making it easy to identify missing translations during development
- Rich content uses a regex-based parser to handle XML-like tags within translation strings