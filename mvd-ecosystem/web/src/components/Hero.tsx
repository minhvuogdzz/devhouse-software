import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LatestRelease } from "@/types/release";
import {
  Download,
  Apple,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface HeroProps {
  release: LatestRelease;
}

export function Hero({ release }: HeroProps) {
  const { t, isVi } = useLanguage();
  const [detectedOs, setDetectedOs] = useState<"mac_arm" | "mac_intel" | "windows">("mac_arm");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.includes("win")) {
        setDetectedOs("windows");
      } else if (ua.includes("mac")) {
        setDetectedOs("mac_arm");
      }
    }
  }, []);

  const getDownload = () => {
    switch (detectedOs) {
      case "windows":
        return {
          title: isVi ? "Tải cho Windows 64-bit" : "Download for Windows (x64)",
          spec: `v${release.version} · ${release.downloads.windows.formattedSize} · Win 10/11`,
          url: release.downloads.windows.url,
          icon: (
            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.901-1.799" />
            </svg>
          ),
        };
      case "mac_intel":
        return {
          title: isVi ? "Tải cho macOS (Intel)" : "Download for macOS (Intel)",
          spec: `v${release.version} · ${release.downloads.macIntel.formattedSize} · Core i5/i7/i9`,
          url: release.downloads.macIntel.url,
          icon: <Apple className="w-4 h-4 shrink-0" />,
        };
      case "mac_arm":
      default:
        return {
          title: isVi ? "Tải cho macOS (Apple Silicon)" : "Download for macOS (Apple Silicon)",
          spec: `v${release.version} · ${release.downloads.macArm64.formattedSize} · M1—M4`,
          url: release.downloads.macArm64.url,
          icon: <Apple className="w-4 h-4 shrink-0" />,
        };
    }
  };

  const currentDownload = getDownload();

  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b border-slate-200 dark:border-white/[0.08] transition-colors duration-150">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 text-center">
        {/* Release Pill with gentle glow */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] text-xs font-mono text-slate-700 dark:text-slate-300 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
          <span className="text-blue-600 dark:text-blue-400 font-bold">DH Studio Pro v{release.version}</span>
          <span className="text-slate-400 dark:text-slate-600">/</span>
          <span className="text-slate-500 dark:text-slate-400">{t("hero.badge")}</span>
        </div>

        {/* Headline */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            {t("hero.title")}{" "}
            <span className="text-blue-600 dark:text-blue-400">{t("hero.titleHighlight")}</span>{" "}
            {t("hero.titleSuffix")}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t("hero.subtitle")}
          </p>
        </div>

        {/* Architecture Switcher */}
        <div className="inline-flex p-1 rounded-2xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 shadow-sm">
          <button
            onClick={() => setDetectedOs("mac_arm")}
            className={`px-3.5 py-1.5 rounded-xl transition-colors duration-150 flex items-center gap-1.5 cursor-pointer ${
              detectedOs === "mac_arm"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Apple size={14} /> {t("hero.arch.macArm")}
          </button>
          <button
            onClick={() => setDetectedOs("mac_intel")}
            className={`px-3.5 py-1.5 rounded-xl transition-colors duration-150 flex items-center gap-1.5 cursor-pointer ${
              detectedOs === "mac_intel"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Apple size={14} /> {t("hero.arch.macIntel")}
          </button>
          <button
            onClick={() => setDetectedOs("windows")}
            className={`px-3.5 py-1.5 rounded-xl transition-colors duration-150 flex items-center gap-1.5 cursor-pointer ${
              detectedOs === "windows"
                ? "bg-blue-600 text-white font-semibold shadow-sm"
                : "hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.901-1.799" />
            </svg>
            {t("hero.arch.windows")}
          </button>
        </div>

        {/* Download Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
          <a
            href={currentDownload.url}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shadow-sm"
          >
            {currentDownload.icon}
            <span>{currentDownload.title}</span>
            <span className="text-[10px] font-mono text-blue-200 bg-blue-700/60 px-2 py-0.5 rounded-md">
              v{release.version}
            </span>
          </a>

          <Link
            to="/download"
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-white dark:bg-[#0E1422] hover:bg-slate-100 dark:hover:bg-[#151D30] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-xs sm:text-sm border border-slate-200 dark:border-white/[0.08] transition-colors duration-150 flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
          >
            <span>{t("hero.allPlatforms")}</span>
            <ArrowRight size={14} className="text-blue-500" />
          </Link>
        </div>

        {/* Technical Highlights Row */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-blue-500" />
            <span>{t("hero.highlights.rust")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-blue-500" />
            <span>{t("hero.highlights.ram")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-blue-500" />
            <span>{t("hero.highlights.offline")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-blue-500" />
            <span>{t("hero.highlights.trial")}</span>
          </div>
        </div>

        {/* Studio Keyboard Shortcuts Bar */}
        <div className="pt-2">
          <div className="inline-flex flex-wrap items-center justify-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.06] text-[11px] font-mono text-slate-600 dark:text-slate-400 shadow-sm">
            <span className="text-slate-500 dark:text-slate-400 font-sans text-xs font-medium">{t("hero.shortcuts.title")}</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 font-bold">{t("hero.shortcuts.stars")}</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 font-bold">{t("hero.shortcuts.colors")}</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 font-bold">{t("hero.shortcuts.space")}</span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 font-bold">{t("hero.shortcuts.loupe")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
