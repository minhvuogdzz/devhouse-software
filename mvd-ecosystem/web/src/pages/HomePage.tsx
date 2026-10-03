import React from "react";
import { Link } from "react-router-dom";
import { LatestRelease } from "@/types/release";
import { Hero } from "@/components/Hero";
import { StudioWorkbench } from "@/components/StudioWorkbench";
import { StudioWorkflow } from "@/components/StudioWorkflow";
import { useLanguage } from "@/context/LanguageContext";
import {
  Layers,
  FileSpreadsheet,
  FolderSync,
  ArrowRight,
  ShieldCheck,
  Zap,
  Gauge,
  CheckCircle2,
  HardDrive,
  Eye,
} from "lucide-react";

interface HomePageProps {
  release: LatestRelease;
}

export function HomePage({ release }: HomePageProps) {
  const { t, isVi } = useLanguage();

  return (
    <div className="space-y-24 pb-20 ambient-glow transition-colors duration-150">
      {/* 1. Flagship Hero with spacious padding */}
      <Hero release={release} />

      {/* 2. Interactive Studio Workbench Simulator */}
      <div className="pt-2">
        <StudioWorkbench />
      </div>

      {/* 3. Asymmetric Product Suite Showcase */}
      <section className="py-8 max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-white/[0.08] pb-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <span>{t("home.suite.badge")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("home.suite.title")}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("home.suite.subtitle")}
            </p>
          </div>
          <Link
            to="/download"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors shrink-0"
          >
            <span>{t("home.suite.downloadAll")}{release.version}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Feature 1: Prominent Spotlight for Photo Picker Pro (Wide Hero Card) */}
        <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-blue-500/30 transition-colors duration-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Layers size={22} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  CORE CULL ENGINE
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Photo Picker Pro</h3>
              </div>
            </div>

            <h4 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-200 leading-snug">
              {t("home.cull.heading")}
            </h4>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("home.cull.desc")}
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 block">{isVi ? "Độ trễ lướt ảnh" : "Switch latency"}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">&lt;16ms (60 FPS)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 block">{isVi ? "Bộ nhớ RAM" : "RAM footprint"}</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold tabular-nums">118 MB RSS</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/[0.04]">
                <span className="text-[10px] text-slate-500 block">{isVi ? "Phím tắt soi nét" : "Loupe shortcut"}</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">[Z] 1:1 Loupe</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/apps/photo-picker"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors duration-150 whitespace-nowrap shadow-sm"
              >
                <span>{t("home.cull.cta")}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-slate-100 dark:bg-[#07090F] p-5 border border-slate-200 dark:border-white/[0.06] space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.06] pb-2 text-[11px]">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-semibold">
                <Eye size={13} className="text-blue-500" />
                <span>Eye Focus Inspection</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">PIN SHARP</span>
            </div>
            <div className="relative rounded-xl overflow-hidden h-44 bg-black flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=85"
                alt="Eye focus sample"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 border-2 border-emerald-400/90 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                </div>
              </div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              <span>SONY ILCE-7M4 · 33.1 MP</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">1/4000s · f/1.4 · ISO 100</span>
            </div>
          </div>
        </div>

        {/* Features 2 & 3: Asymmetric 2-Column Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 2: Contact The Sheet */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-blue-500/30 transition-colors duration-200 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FileSpreadsheet size={22} />
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  AUTOMATION
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Contact The Sheet</h3>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("home.sheets.heading")}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                  {t("home.sheets.desc")}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/[0.04] space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>{isVi ? "Độ chính xác:" : "Accuracy:"}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% (Zero Missing Files)</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>{isVi ? "Hỗ trợ nguồn:" : "Supported sources:"}</span>
                  <span className="text-slate-700 dark:text-slate-200">Google Sheets, Drive, Zalo, Excel</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
              <Link
                to="/apps/contact-the-sheet"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
              >
                <span>{t("home.sheets.cta")}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Card 3: Photo Counter */}
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-blue-500/30 transition-colors duration-200 flex flex-col justify-between space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <FolderSync size={22} />
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  AUDIT & BILLING
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Photo Counter</h3>
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {t("home.counter.heading")}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                  {t("home.counter.desc")}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-white/[0.04] space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>{isVi ? "Quét thư mục con:" : "Subdirectory scan:"}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{isVi ? "Không giới hạn cấp đệ quy" : "Unlimited recursive depth"}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                  <span>{isVi ? "Biên bản nghiệm thu:" : "Handover report:"}</span>
                  <span className="text-slate-700 dark:text-slate-200">{isVi ? "1-Click xuất báo cáo file" : "1-Click instant file export"}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
              <Link
                to="/apps/photo-counter"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors"
              >
                <span>{t("home.counter.cta")}</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Closed-Loop Studio Workflow */}
      <StudioWorkflow />

      {/* 5. Engineering Benchmark Banner */}
      <section className="py-8 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-mono font-bold text-blue-600 dark:text-blue-300">
              <Gauge size={12} />
              <span>{t("home.banner.badge")}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t("home.banner.title")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("home.banner.desc")}
            </p>
          </div>

          <Link
            to="/benchmark"
            className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shrink-0 transition-colors duration-150 whitespace-nowrap shadow-sm cursor-pointer"
          >
            <span>{t("home.banner.btn")}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 6. Local-First & Air-Gapped Trust Guarantee */}
      <section className="py-6 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="p-8 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.06] text-center max-w-3xl mx-auto space-y-4 shadow-sm">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <ShieldCheck size={26} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t("home.trust.title")}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
            {t("home.trust.desc")}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-5 text-xs font-mono text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> 0 byte cloud upload</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> {isVi ? "Hoạt động offline 100%" : "100% offline operation"}</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-emerald-500" /> {isVi ? "Bảo mật local tuyệt đối" : "Strict local privacy"}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
