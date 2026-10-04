import React, { useState } from "react";
import { LatestRelease } from "@/types/release";
import { useLanguage } from "@/context/LanguageContext";
import {
  Download,
  Apple,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Copy,
  CheckCircle2,
} from "lucide-react";

interface DownloadMatrixProps {
  release: LatestRelease;
}

export function DownloadMatrix({ release }: DownloadMatrixProps) {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const { t, isVi } = useLanguage();

  const handleCopyCmd = () => {
    navigator.clipboard.writeText("xattr -cr /Applications/MVD.T.D.app");
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <section id="downloads" className="py-16 md:py-24 relative bg-slate-50 dark:bg-[#07090E] border-b border-slate-200 dark:border-white/[0.08] transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header: Left-Biased */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <Download size={11} />
              <span>{t("download.badge")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("download.title")} v{release.version}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              {t("download.desc")}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-600 dark:text-slate-400 self-start md:self-auto font-mono shadow-sm">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>{isVi ? "Xác thực checksum SHA-256" : "SHA-256 Checksum Verified"}</span>
          </div>
        </div>

        {/* 3 Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Mac Apple Silicon */}
          <div className="p-7 rounded-3xl bg-blue-50/70 dark:bg-[#0E1526] border-2 border-blue-600 dark:border-blue-500 flex flex-col justify-between group space-y-5 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Apple size={22} />
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/15 border border-blue-500/30 px-2.5 py-1 rounded-full whitespace-nowrap">
                  {t("download.macArm.rec")}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {t("download.macArm.title")}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {t("download.macArm.desc")}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-[#070A12] border border-slate-200 dark:border-white/[0.06] space-y-2 text-xs text-slate-700 dark:text-slate-300 font-mono shadow-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isVi ? "Tệp cài:" : "File:"}</span>
                  <span className="truncate max-w-[65%] text-slate-700 dark:text-slate-300">{release.downloads.macArm64.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isVi ? "Dung lượng:" : "Size:"}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold tabular-nums">{release.downloads.macArm64.formattedSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isVi ? "Yêu cầu:" : "Requires:"}</span>
                  <span>macOS 11.0 Big Sur+</span>
                </div>
              </div>
            </div>

            <a
              href={release.downloads.macArm64.url}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap transition-colors duration-150 shadow-sm"
            >
              <Download size={15} /> {t("download.macArm.btn")}
            </a>
          </div>

          {/* Mac Intel */}
          <div className="p-7 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16] flex flex-col justify-between group space-y-5 transition-colors shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Apple size={22} />
                </div>
                <span className="text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] px-2.5 py-1 rounded-full whitespace-nowrap">
                  Mac Intel x86_64
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {t("download.macIntel.title")}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {t("download.macIntel.desc")}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-white/[0.06] space-y-2 text-xs text-slate-700 dark:text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isVi ? "Tệp cài:" : "File:"}</span>
                  <span className="truncate max-w-[65%] text-slate-700 dark:text-slate-300">{release.downloads.macIntel.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isVi ? "Dung lượng:" : "Size:"}</span>
                  <span className="tabular-nums">{release.downloads.macIntel.formattedSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isVi ? "Yêu cầu:" : "Requires:"}</span>
                  <span>macOS 10.15 Catalina+</span>
                </div>
              </div>
            </div>

            <a
              href={release.downloads.macIntel.url}
              className="w-full py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-white dark:border-white/[0.08] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap transition-colors duration-150"
            >
              <Download size={15} /> {t("download.macIntel.btn")}
            </a>
          </div>

          {/* Windows */}
          <div className="p-7 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-blue-500/40 flex flex-col justify-between group space-y-5 transition-colors shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.901-1.799" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                  Windows 64-bit
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  {t("download.windows.title")}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {t("download.windows.desc")}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-white/[0.06] space-y-2 text-xs text-slate-700 dark:text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isVi ? "Tệp cài:" : "File:"}</span>
                  <span className="truncate max-w-[65%] text-slate-700 dark:text-slate-300">{release.downloads.windows.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isVi ? "Dung lượng:" : "Size:"}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold tabular-nums">{release.downloads.windows.formattedSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{isVi ? "Yêu cầu:" : "Requires:"}</span>
                  <span>Windows 10 / 11 (64-bit)</span>
                </div>
              </div>
            </div>

            <a
              href={release.downloads.windows.url}
              className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap transition-colors duration-150 shadow-sm"
            >
              <Download size={15} /> {t("download.windows.btn")}
            </a>
          </div>
        </div>

        {/* Release Notes & Security / Gatekeeper Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Release Notes */}
          <div className="p-7 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {t("download.notes.title")} {release.tagName}
              </span>
              <a
                href="https://github.com/minhvuogdzz/photo-picker-pro/releases"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center gap-1.5 transition-colors"
              >
                GitHub Releases <ExternalLink size={12} />
              </a>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-line leading-relaxed bg-slate-50 dark:bg-[#070A12] p-4 rounded-2xl border border-slate-200 dark:border-white/[0.04]">
              {release.releaseNotes}
            </div>
          </div>

          {/* Gatekeeper & SmartScreen Helper */}
          <div className="p-7 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] space-y-4 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm border-b border-slate-100 dark:border-white/[0.06] pb-3">
              <HelpCircle size={16} className="text-blue-500" />
              <span>{t("download.gatekeeper.title")}</span>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
              <div>
                <p className="text-slate-900 dark:text-slate-200 font-bold mb-1">{t("download.gatekeeper.mac")}</p>
                <p>
                  {t("download.gatekeeper.macDesc")}
                </p>
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#070A12] border border-slate-200 dark:border-white/[0.06] flex items-center justify-between font-mono text-xs text-emerald-700 dark:text-emerald-400">
                  <code>xattr -cr /Applications/MVD.T.D.app</code>
                  <button
                    onClick={handleCopyCmd}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent cursor-pointer transition-colors shadow-sm"
                    title={isVi ? "Copy lệnh" : "Copy command"}
                  >
                    {copiedCmd ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-slate-900 dark:text-slate-200 font-bold mb-1">{t("download.gatekeeper.win")}</p>
                <p>
                  {t("download.gatekeeper.winDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
