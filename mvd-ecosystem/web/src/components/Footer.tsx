import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ExternalLink } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useLanguage } from "@/context/LanguageContext";

export function Footer() {
  const { config, zaloUrl } = useSiteConfig();
  const { t, isVi } = useLanguage();

  return (
    <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-slate-100 dark:bg-[#05070C] text-slate-600 dark:text-slate-400 text-xs py-14 transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/brand/dh_app_icon_dark_squircle.png"
                alt="DH Studio Pro Logo"
                className="w-6 h-6 rounded-md shadow-sm border border-slate-300 dark:border-white/10 object-contain"
              />
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                DH Studio Pro
              </span>
            </Link>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("footer.desc")}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <ShieldCheck size={12} className="text-emerald-500" />
              <span>{t("footer.exclusive")}</span>
            </div>
          </div>

          {/* Apps */}
          <div className="space-y-2 text-[11px]">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              {t("footer.col.products")}
            </h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/apps/photo-picker" className="hover:text-blue-500 transition-colors">
                  Photo Picker Pro (Cull Engine)
                </Link>
              </li>
              <li>
                <Link to="/apps/contact-the-sheet" className="hover:text-blue-500 transition-colors">
                  Contact The Sheet (Automation)
                </Link>
              </li>
              <li>
                <Link to="/apps/photo-counter" className="hover:text-blue-500 transition-colors">
                  Photo Counter (Audit & Bill)
                </Link>
              </li>
              <li>
                <Link to="/benchmark" className="hover:text-blue-500 transition-colors">
                  {isVi ? "So sánh hiệu năng vs Lightroom" : "Benchmark vs Lightroom"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="space-y-2 text-[11px]">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              {t("footer.col.resources")}
            </h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/about" className="hover:text-blue-500 transition-colors font-semibold text-blue-600 dark:text-blue-400">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link to="/download" className="hover:text-blue-500 transition-colors">
                  {isVi ? "Tải bản macOS Apple Silicon (M1—M4)" : "Download for macOS Apple Silicon"}
                </Link>
              </li>
              <li>
                <Link to="/download" className="hover:text-blue-500 transition-colors">
                  {isVi ? "Tải bản macOS Intel & Windows 64-bit" : "Download for Mac Intel & Windows 64-bit"}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-blue-500 transition-colors">
                  {t("pricing.title")}
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-blue-500 transition-colors">
                  {isVi ? "Hướng dẫn cài đặt & FAQ" : "Installation Guide & FAQ"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-2 text-[11px]">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
              {t("footer.col.support")}
            </h4>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
              <li>
                Zalo / Hotline:{" "}
                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  {config.phoneFormatted}
                </a>
              </li>
              <li>{isVi ? "Hỗ trợ từ xa: UltraViewer / AnyDesk" : "Remote Support: UltraViewer / AnyDesk"}</li>
              <li>{isVi ? "Khung giờ: 8:00 — 23:00 hàng ngày" : "Hours: 8:00 — 23:00 daily"}</li>
              <li>{isVi ? "Kiến trúc: Local-First Air-Gapped" : "Architecture: Local-First Air-Gapped"}</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-slate-200 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500 font-mono">
          <p>&copy; {new Date().getFullYear()} DH Studio Pro. Bản quyền thuộc về DevHouse Software. {t("footer.rights")}</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-sans">
              {t("footer.developedBy")}{" "}
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                DevHouse Software
              </strong>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
