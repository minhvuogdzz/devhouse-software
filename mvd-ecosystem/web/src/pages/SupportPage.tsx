import React, { useState } from "react";
import { FAQ } from "@/components/FAQ";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  HelpCircle,
  PhoneCall,
  MessageSquare,
  Monitor,
  Terminal,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ArrowRight,
} from "lucide-react";

export function SupportPage() {
  const [copiedMacCmd, setCopiedMacCmd] = useState(false);
  const { config, zaloUrl, telUrl } = useSiteConfig();
  const { t, isVi } = useLanguage();

  const handleCopyCmd = () => {
    navigator.clipboard.writeText("xattr -cr /Applications/MVD.T.D.app");
    setCopiedMacCmd(true);
    setTimeout(() => setCopiedMacCmd(false), 2000);
  };

  const supportChannels = [
    {
      icon: <PhoneCall size={22} className="text-blue-500" />,
      title: t("support.channel.hotline.title"),
      detail: config.phoneFormatted,
      sub: t("support.channel.hotline.desc"),
      action: telUrl,
      actionText: t("support.channel.hotline.btn"),
      primary: true,
    },
    {
      icon: <MessageSquare size={22} className="text-blue-500" />,
      title: t("support.channel.zalo.title"),
      detail: config.phoneFormatted,
      sub: t("support.channel.zalo.desc"),
      action: zaloUrl,
      actionText: t("support.channel.zalo.btn"),
      primary: true,
    },
    {
      icon: <Monitor size={22} className="text-blue-500" />,
      title: t("support.channel.remote.title"),
      detail: "UltraViewer / AnyDesk",
      sub: t("support.channel.remote.desc"),
      action: zaloUrl,
      actionText: t("support.channel.remote.btn"),
      primary: false,
    },
  ];

  return (
    <div className="py-12 md:py-20 space-y-20 ambient-glow transition-colors duration-150">
      {/* 1. Page Header - Left-Biased, Editorial & Spacious */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-600 dark:text-blue-400">
              <HelpCircle size={13} />
              <span>{t("support.badge")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {t("support.title")}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {t("support.desc")}
            </p>
          </div>

          <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] space-y-4 font-mono text-xs shadow-sm">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              {t("support.hours.title")}
            </div>
            <div className="space-y-2 divide-y divide-slate-100 dark:divide-white/[0.04]">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? "Khung giờ:" : "Hours:"}</span>
                <span className="text-slate-900 dark:text-white font-bold tabular-nums">8:00 — 23:00</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? "Ngày làm việc:" : "Days:"}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isVi ? "Tất cả các ngày" : "All 7 Days"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? "Hỗ trợ từ xa:" : "Remote support:"}</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">UltraViewer / AnyDesk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Direct Support Channels - Asymmetric & Featured */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {t("support.channels.title")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t("support.channels.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportChannels.map((ch, idx) => (
            <div
              key={idx}
              className={`p-7 sm:p-8 rounded-3xl border flex flex-col justify-between space-y-6 transition-colors duration-200 shadow-sm ${
                ch.primary
                  ? "bg-white dark:bg-[#0E1422] border-slate-200 dark:border-white/[0.1] hover:border-blue-500/40"
                  : "bg-white dark:bg-[#0A0E18] border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12]"
              }`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                  {ch.icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{ch.title}</h3>
                  <div className="text-xl font-mono font-bold text-blue-600 dark:text-blue-400 mt-1 tabular-nums">
                    {ch.detail}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{ch.sub}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06]">
                <a
                  href={ch.action}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-colors duration-150 whitespace-nowrap cursor-pointer ${
                    ch.primary
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-white dark:border-white/[0.08]"
                  }`}
                >
                  <span>{ch.actionText}</span>
                  <ArrowRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Quick Diagnostics Terminal Guide */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0E1422] p-7 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/[0.06] pb-4">
            <Terminal size={18} className="text-blue-500" />
            <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t("download.gatekeeper.title")}
            </h3>
          </div>
          <div className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              {t("download.gatekeeper.macDesc")}
            </p>
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#06080E] border border-slate-200 dark:border-white/[0.08] font-mono text-xs text-emerald-700 dark:text-emerald-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <code>xattr -cr /Applications/MVD.T.D.app</code>
              <button
                onClick={handleCopyCmd}
                className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent flex items-center gap-1.5 text-xs cursor-pointer transition-colors duration-150 self-start sm:self-auto shrink-0 shadow-sm"
              >
                {copiedMacCmd ? <CheckCircle2 size={13} className="text-emerald-500" /> : <Copy size={13} />}
                <span>{copiedMacCmd ? (isVi ? "Đã copy lệnh" : "Copied") : (isVi ? "Copy lệnh" : "Copy command")}</span>
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {isVi
                ? "Lệnh này gỡ bỏ thuộc tính cách ly (quarantine attribute) của macOS cho ứng dụng an toàn."
                : "This command clears macOS quarantine flags for verified safe execution."}
            </p>
          </div>
        </div>
      </section>

      {/* 4. FAQ Component */}
      <FAQ />
    </div>
  );
}
