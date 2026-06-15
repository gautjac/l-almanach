import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DICT, LOCALE, type DictKey, type Lang } from "./dict";
import { getSettings, saveSettings } from "../db";

export type { Lang } from "./dict";
export { LOCALE } from "./dict";

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  /** translate a chrome string by key */
  t: (key: DictKey) => string;
  /** true until the persisted language has loaded */
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * Provides the active UI language app-wide. Default is French; the choice is
 * persisted in the Dexie settings row (Settings.language) and mirrored to
 * <html lang>. We read the persisted value once on boot.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    getSettings().then((s) => {
      if (!alive) return;
      setLangState(s.language ?? "fr");
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Keep <html lang> in sync for accessibility / correct hyphenation.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    void saveSettings({ language: l });
  }, []);

  const toggle = useCallback(() => {
    setLangState((cur) => {
      const next: Lang = cur === "fr" ? "en" : "fr";
      void saveSettings({ language: next });
      return next;
    });
  }, []);

  const t = useCallback(
    (key: DictKey) => DICT[key][lang],
    [lang],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, toggle, t, ready }),
    [lang, setLang, toggle, t, ready],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLang must be used within a LanguageProvider");
  return ctx;
}

/** Convenience: just the translator + active lang, the common case. */
export function useT(): { t: (key: DictKey) => string; lang: Lang } {
  const { t, lang } = useLang();
  return { t, lang };
}

export { LOCALE as _LOCALE };
