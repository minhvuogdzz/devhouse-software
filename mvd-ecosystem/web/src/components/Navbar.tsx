import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Download,
  Menu,
  X,
  ChevronDown,
  Layers,
  FileSpreadsheet,
  FolderSync,
  Sun,
  Moon,
  Laptop,
  Languages,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

interface NavbarProps {
  version: string;
}

export function Navbar({ version }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appsDropdownOpen, setAppsDropdownOpen] = useState(false);
  const location = useLocation();
  const { mode, setMode } = useTheme();
  const { language, setLanguage, t, isVi } = useLanguage();

  const cycleTheme = () => {
    if (mode === "system") {
      setMode("light");
    } else if (mode === "light") {
      setMode("dark");
    } else {
      setMode("system");
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navLinks = [
    { label: t("nav.overview"), path: "/" },
    { label: t("nav.benchmark"), path: "/benchmark" },
    { label: t("nav.pricing"), path: "/pricing" },
    { label: t("nav.download"), path: "/download" },
    { label: t("nav.support"), path: "/support" },
    { label: t("nav.about"), path: "/about" },
  ];

  const appItems = [
    {
      name: "Photo Picker Pro",
      desc: isVi ? "Lọc RAW 33MP-61MP 60fps & Loupe 100%" : "Cull RAW 33MP-61MP at 60fps with 100% Loupe",
      path: "/apps/photo-picker",
      icon: <Layers size={15} className="text-blue-500" />,
      tag: "CORE CULL",
    },
    {
      name: "Contact The Sheet",
      desc: isVi ? "Tự động hóa bóc tách Google Sheets & Drive" : "Google Sheets & Drive code automation",
      path: "/apps/contact-the-sheet",
      icon: <FileSpreadsheet size={15} className="text-blue-500" />,
      tag: "AUTOMATION",
    },
    {
      name: "Photo Counter",
      desc: isVi ? "Đối soát hợp đồng & kiểm kê số lượng file" : "Contract audit & deep folder inspection",
      path: "/apps/photo-counter",
      icon: <FolderSync size={15} className="text-blue-500" />,
      tag: "AUDIT",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#07090E]/95 backdrop-blur-md transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/brand/dh_app_icon_dark_squircle.png"
              alt="DH Studio Pro"
              className="w-7 h-7 rounded-lg border border-slate-300 dark:border-white/10 group-hover:border-blue-500 transition-colors object-contain"
            />
            <div className="flex items-center gap-2">
              <div className="flex flex-col justify-center leading-tight">
                <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  DH Studio Pro
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-medium tracking-wider leading-none">
                  DevHouse Software
                </span>
              </div>
              <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[9px] font-mono font-medium rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 tabular-nums">
                v{version}
              </span>
            </div>
          </Link>

          {/* Apps Dropdown */}
          <div
            className="relative hidden md:block"
            onMouseEnter={() => setAppsDropdownOpen(true)}
            onMouseLeave={() => setAppsDropdownOpen(false)}
          >
            <button
              className={`flex items-center gap-1.5 text-xs py-1 transition-colors cursor-pointer ${
                location.pathname.startsWith("/apps")
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>{t("nav.apps")}</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-150 ${appsDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {appsDropdownOpen && (
              <div className="absolute top-full left-0 pt-2 w-72 animate-in fade-in duration-100">
                <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0A0E18] p-2 shadow-2xl space-y-1">
                  {appItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setAppsDropdownOpen(false)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                        location.pathname === item.path
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-white/[0.06] mt-0.5 shrink-0">
                        {item.icon}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs truncate text-slate-900 dark:text-white">
                            {item.name}
                          </span>
                          <span className="text-[9px] font-mono px-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {item.desc}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Main Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-colors py-1 ${
                isActive(link.path)
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Language Switcher, Theme Switcher & Download CTA */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Language Switcher Button */}
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300 font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            title={isVi ? "Chuyển sang Tiếng Anh (Switch to English)" : "Chuyển sang Tiếng Việt (Switch to Vietnamese)"}
          >
            <Languages size={14} className="text-blue-500" />
            <span className={isVi ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}>VI</span>
            <span className="text-[10px] text-slate-300 dark:text-slate-600">/</span>
            <span className={!isVi ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}>EN</span>
          </button>

          {/* Theme Switcher Button */}
          <button
            onClick={cycleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title={`Theme: ${mode === "system" ? t("nav.theme.system") : mode === "light" ? t("nav.theme.light") : t("nav.theme.dark")}`}
          >
            {mode === "system" ? (
              <>
                <Laptop size={15} className="text-blue-500" />
                <span className="text-[11px] font-mono hidden lg:inline">{t("nav.theme.system")}</span>
              </>
            ) : mode === "light" ? (
              <>
                <Sun size={15} className="text-amber-500" />
                <span className="text-[11px] font-mono hidden lg:inline">{t("nav.theme.light")}</span>
              </>
            ) : (
              <>
                <Moon size={15} className="text-blue-400" />
                <span className="text-[11px] font-mono hidden lg:inline">{t("nav.theme.dark")}</span>
              </>
            )}
          </button>

          <Link
            to="/download"
            className="text-xs font-semibold px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-150 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Download size={14} className="stroke-[2.5]" />
            <span>{t("nav.downloadBtn")}{version}</span>
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="md:hidden flex items-center gap-1.5">
          {/* Mobile Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-white/[0.08] text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300"
          >
            {language.toUpperCase()}
          </button>

          <button
            onClick={cycleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400"
            title="Đổi theme"
          >
            {mode === "system" ? (
              <Laptop size={16} />
            ) : mode === "light" ? (
              <Sun size={16} className="text-amber-500" />
            ) : (
              <Moon size={16} className="text-blue-400" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#07090E] px-4 py-4 space-y-4 animate-in slide-in-from-top duration-150">
          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              {t("nav.apps")}
            </div>
            {appItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] text-xs font-medium text-slate-800 dark:text-slate-200"
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.name}</span>
                </div>
                <span className="text-[9px] font-mono px-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  {item.tag}
                </span>
              </Link>
            ))}
          </div>

          <div className="h-px bg-slate-200 dark:bg-white/[0.06]" />

          <div className="space-y-1">
            <div className="px-3 py-1 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              {isVi ? "Trang Chính" : "Main Pages"}
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  isActive(link.path)
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2">
            <Link
              to="/download"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Download size={14} />
              <span>{t("nav.downloadBtn")}{version}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
