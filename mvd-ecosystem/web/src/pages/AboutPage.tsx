import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  User,
  Cpu,
  Code2,
  Lock,
  Clock,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Terminal,
  FileText,
  Award,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteConfig } from "@/context/SiteConfigContext";

export function AboutPage() {
  const { t, isVi } = useLanguage();
  const { config, zaloUrl, telUrl } = useSiteConfig();

  return (
    <div className="py-12 md:py-20 space-y-20 ambient-glow transition-colors duration-150">
      {/* 1. Header */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-600 dark:text-blue-400">
            <Sparkles size={13} />
            <span>{t("about.badge")}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {t("about.title")}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            {t("about.subtitle")}
          </p>
        </div>
      </section>

      {/* 2. Founder Profile: Duong Minh Vuong & The Dev House Group */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 space-y-4 text-center lg:text-left">
            <div className="relative inline-block">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-700 p-1 shadow-xl mx-auto lg:mx-0">
                <div className="w-full h-full rounded-[22px] bg-slate-900 flex items-center justify-center text-white font-bold text-3xl font-mono">
                  <span>DMV</span>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-mono font-bold shadow-md border border-white/20">
                Vuong Dev
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {t("about.founder.name")}
              </h2>
              <p className="text-xs sm:text-sm font-mono text-blue-600 dark:text-blue-400 font-semibold mt-0.5">
                {t("about.founder.role")}
              </p>
              <p className="text-xs text-slate-500 font-mono mt-1">
                The Dev House Group
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                Rust / Tauri
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                Metal / DirectX
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-300">
                Local-First
              </span>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-5 text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/[0.06] pt-6 lg:pt-0 lg:pl-8">
            <p>{t("about.founder.bio1")}</p>
            <p>{t("about.founder.bio2")}</p>

            {/* The Dev House Group Callout */}
            <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-sm">
                <Code2 size={16} />
                <span>{t("about.group.title")}</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {t("about.group.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Architectural Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isVi ? "Kỹ Thuật Native Siêu Nhẹ" : "Ultra-Lightweight Native Stack"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isVi
                ? "Bộ cài đặt chỉ ~5MB, tiêu thụ RAM dưới 150MB, nói không với sự nặng nề của Electron."
                : "Compact ~5MB installer footprint with sub-150MB RAM usage. Zero Electron bloat."}
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Lock size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isVi ? "Bảo Mật Local-First 100%" : "100% Local-First Security"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isVi
                ? "0 byte ảnh được đưa lên cloud. Toàn bộ hình ảnh cưới và file khách hàng xử lý cục bộ trên ổ đĩa SSD."
                : "Zero bytes uploaded to the cloud. All client wedding photos remain strictly on your local NVMe/SSD drive."}
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isVi ? "Đồng Hành Studio 24/7" : "24/7 Studio Remote Support"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isVi
                ? "Hỗ trợ kỹ thuật tận tâm qua UltraViewer, Zalo hotline 0869 528 304 từ 8:00 đến 23:00 hàng ngày."
                : "Dedicated remote technical onboarding via UltraViewer and hotline 0869 528 304 from 8:00 to 23:00 daily."}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Terms of Service & Customer Policies */}
      <section id="terms" className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-600 dark:text-blue-400">
            <FileText size={13} />
            <span>{isVi ? "Văn Bản Pháp Lý & Cam Kết" : "Legal Terms & Commitments"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("about.terms.title")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t("about.terms.subtitle")}
          </p>
        </div>

        <div className="space-y-6">
          {/* Section 1 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-base">
              <ShieldCheck size={18} />
              <h3>{t("about.terms.sec1.title")}</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t("about.terms.sec1.content")}
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-base">
              <Award size={18} />
              <h3>{t("about.terms.sec2.title")}</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t("about.terms.sec2.content")}
            </p>
          </div>

          {/* Section 3 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-base">
              <Clock size={18} />
              <h3>{t("about.terms.sec3.title")}</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t("about.terms.sec3.content")}
            </p>
          </div>

          {/* Section 4 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-base">
              <PhoneCall size={18} />
              <h3>{t("about.terms.sec4.title")}</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t("about.terms.sec4.content")}
            </p>
          </div>

          {/* Section 5 */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-base">
              <Terminal size={18} />
              <h3>{t("about.terms.sec5.title")}</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t("about.terms.sec5.content")}
            </p>
          </div>
        </div>
      </section>

      {/* 5. Contact CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 pt-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isVi ? "Liên Hệ Trực Tiếp Với Đội Ngũ Phát Triển" : "Get in Touch with Our Core Engineering Team"}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          {isVi
            ? `Hotline & Zalo: ${config.phoneFormatted}. Hỗ trợ tư vấn giải pháp tối ưu cho studio và ekip chụp ảnh.`
            : `Hotline & Zalo: ${config.phoneFormatted}. Direct consultation on workflow optimization for your studio.`}
        </p>
        <div className="flex justify-center gap-3 pt-3">
          <a
            href={zaloUrl}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors duration-150 whitespace-nowrap shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <PhoneCall size={15} />
            <span>{isVi ? "Nhắn Zalo Kỹ Thuật" : "Message on Zalo"}</span>
          </a>
          <Link
            to="/download"
            className="px-6 py-3.5 rounded-2xl bg-white dark:bg-[#0E1422] hover:bg-slate-100 dark:hover:bg-[#161F33] text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-colors duration-150 border border-slate-200 dark:border-white/[0.08] whitespace-nowrap shadow-sm flex items-center gap-2"
          >
            <span>{isVi ? "Tải Bản Dùng Thử" : "Download Free Trial"}</span>
            <ArrowRight size={14} className="text-blue-500" />
          </Link>
        </div>
      </section>
    </div>
  );
}
