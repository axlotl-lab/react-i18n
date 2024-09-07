import React from "react";
import { TranslationsProviderContext } from "./translations-provider";

export const useLocale = () => {
  const context = React.useContext(TranslationsProviderContext);

  if (!context) {
    throw new Error('It seems that the provider `<TranslationsProvider />` is not implemented.');
  }

  return context.locale;
};
