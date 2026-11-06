import type { ReactNode } from "react";

import type { Dictionary, Locale } from "@/i18n/dictionaries";

type Props = {
  children: ReactNode;
  dictionary: Dictionary;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
};

export function ProductShell({ children, dictionary, locale, onLocaleChange }: Props) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="product-name" href="/new">
          <span className="product-mark">D</span>{" "}
          {dictionary.productName}
        </a>
        <nav aria-label={dictionary.navigation}>
          <a aria-current="page" href="/new">{dictionary.newDeck}</a>
          <a href="/history">{dictionary.history}</a>
        </nav>
        <div className="locale-switch" role="group" aria-label={dictionary.interfaceLanguage}>
          {(["pl", "en"] as const).map((option) => (
            <button
              aria-pressed={locale === option}
              className={locale === option ? "is-active" : ""}
              key={option}
              onClick={() => onLocaleChange(option)}
              type="button"
            >
              {option.toUpperCase()}
            </button>
          ))}
        </div>
      </header>
      {children}
    </div>
  );
}
