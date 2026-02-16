import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { DEFAULT_SITE_CONTENT } from '../config/defaultSiteContent';
import { SiteContent } from '../types/siteContent';
import { getSiteContent, initializeStorage, resetSiteContent, saveSiteContent } from '../utils/storage';

interface SiteContentContextValue {
  siteContent: SiteContent;
  updateSiteContent: (nextContent: SiteContent) => void;
  updateSiteContentFromJson: (json: string) => { ok: boolean; error?: string };
  resetSiteContentToDefault: () => void;
}

const SiteContentContext = createContext<SiteContentContextValue | undefined>(undefined);

export const SiteContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [siteContent, setSiteContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);

  useEffect(() => {
    initializeStorage();
    setSiteContent(getSiteContent());
  }, []);

  const updateSiteContent = (nextContent: SiteContent) => {
    setSiteContent(nextContent);
    saveSiteContent(nextContent);
  };

  const updateSiteContentFromJson = (json: string) => {
    try {
      const parsed = JSON.parse(json) as SiteContent;
      updateSiteContent(parsed);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Некорректный JSON. Проверьте формат и скобки.' };
    }
  };

  const resetSiteContentToDefault = () => {
    resetSiteContent();
    setSiteContent(DEFAULT_SITE_CONTENT);
  };

  const value: SiteContentContextValue = {
    siteContent,
    updateSiteContent,
    updateSiteContentFromJson,
    resetSiteContentToDefault
  };

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
};

export const useSiteContent = () => {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within SiteContentProvider');
  }
  return context;
};
