import React, { useState } from "react";
import { ChevronDown, MessageSquare, PhoneCall } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useLanguage } from "@/context/LanguageContext";

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const { config, zaloUrl } = useSiteConfig();
  const { t, isVi } = useLanguage();

  const faqs = [
    {
      q: t("faq.q1"),
      a: t("faq.a1"),
    },
    {
      q: t("faq.q2"),
      a: t("faq.a2"),
    },
    {
      q: t("faq.q3"),
      a: t("faq.a3"),
    },
    {
      q: t("faq.q4"),
      a: t("faq.a4"),
    },
    {
      q: t("faq.q5"),
      a: t("faq.a5"),
    },
    {
      q: t("faq.q6"),
      a: t("faq.a6"),
    },
    {
      q: t("faq.q7"),
      a: t("faq.a7"),
    },
  ];

  return (
    <section id="faq" className="py-16 md:py-24 relative bg-slate-50 dark:bg-[#07090E] border-b border-slate-200 dark:border-white/[0.08] transition-colors duration-150">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header: Left-Biased */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <MessageSquare size={11} />
              <span>{t("faq.badge")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("faq.title")}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              {t("faq.subtitle")}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-600 dark:text-slate-400 self-start md:self-auto font-mono shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{t("faq.support247")}</span>
          </div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0A0E18] hover:border-slate-300 dark:hover:border-white/[0.14] transition-colors overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-300 transition-colors cursor-pointer"
              >
                <span className="leading-snug">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                    openIdx === idx ? "rotate-180 text-blue-500" : ""
                  }`}
                />
              </button>
              {openIdx === idx && (
                <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-white/[0.04]">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Zalo Support CTA */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
              {t("faq.cta.title")}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("faq.cta.desc")}
            </p>
          </div>
          <a
            href={zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors duration-150 shrink-0 whitespace-nowrap cursor-pointer shadow-sm"
          >
            <PhoneCall size={14} />
            <span>{isVi ? `Zalo Kỹ Thuật: ${config.phoneFormatted}` : `Technical Zalo: ${config.phoneFormatted}`}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
