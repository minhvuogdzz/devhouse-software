import React, { createContext, useContext, useEffect, useState } from "react";

export interface SiteConfig {
  phone: string;
  phoneFormatted: string;
  benchmarkTitle: string;
  benchmarkNotes: string;
}

const DEFAULT_CONFIG: SiteConfig = {
  phone: "0869528304",
  phoneFormatted: "0869 528 304",
  benchmarkTitle: "Hiệu Năng Thực Tế: DH Studio Pro vs Adobe Lightroom Classic",
  benchmarkNotes: "Thử nghiệm thực địa với 2,000 file RAW Sony 33MP (ILCE-7M4) trên máy MacBook Pro Apple Silicon (M-Series) và máy tính Windows 11 PC.",
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : "https://photo-picker-backend.onrender.com");

interface SiteConfigContextType {
  config: SiteConfig;
  zaloUrl: string;
  telUrl: string;
}

const SiteConfigContext = createContext<SiteConfigContextType>({
  config: DEFAULT_CONFIG,
  zaloUrl: `https://zalo.me/${DEFAULT_CONFIG.phone}`,
  telUrl: `tel:${DEFAULT_CONFIG.phone}`,
});

export function SiteConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);

  // Sync with backend public config if available (admin configures via photo-picker-pro-admin)
  useEffect(() => {
    let isMounted = true;
    async function fetchPublicConfig() {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch(`${API_BASE_URL}/config/public`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted) return;

        if (data?.supportZaloPhone && typeof data.supportZaloPhone === "string") {
          const rawPhone = data.supportZaloPhone.trim();
          if (rawPhone.length >= 9) {
            const clean = rawPhone.replace(/\D/g, "");
            const formatted =
              clean.length === 10
                ? `${clean.slice(0, 4)} ${clean.slice(4, 7)} ${clean.slice(7)}`
                : rawPhone;

            setConfig((prev) => ({
              ...prev,
              phone: clean,
              phoneFormatted: formatted,
            }));
          }
        }
      } catch {
        // Silently fall back to default official phone number (0869528304)
      }
    }

    fetchPublicConfig();
    return () => {
      isMounted = false;
    };
  }, []);

  const cleanPhone = config.phone.replace(/\D/g, "");
  const zaloUrl = `https://zalo.me/${cleanPhone}`;
  const telUrl = `tel:${cleanPhone}`;

  return (
    <SiteConfigContext.Provider
      value={{
        config,
        zaloUrl,
        telUrl,
      }}
    >
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error("useSiteConfig must be used within a SiteConfigProvider");
  }
  return context;
}
