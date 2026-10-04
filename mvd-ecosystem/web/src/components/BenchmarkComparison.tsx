import React from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  Check,
  ShieldAlert,
  Cpu,
  HardDrive,
  BatteryCharging,
  Gauge,
} from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useLanguage } from "@/context/LanguageContext";

export function BenchmarkComparison() {
  const { config } = useSiteConfig();
  const { t, isVi } = useLanguage();

  const comparisons = [
    {
      metric: t("benchmark.row1.metric"),
      icon: <Gauge size={14} className="text-blue-500" />,
      lrc: isVi ? "10 — 15 giây" : "10 — 15 seconds",
      mvd: isVi ? "0.25 giây (Tức thì)" : "0.25 seconds (Instant)",
      winner: "mvd",
      note: t("benchmark.row1.note"),
    },
    {
      metric: t("benchmark.row2.metric"),
      icon: <Cpu size={14} className="text-blue-500" />,
      lrc: "4,800 MB — 8,500 MB",
      mvd: "118 MB — 190 MB",
      winner: "mvd",
      note: t("benchmark.row2.note"),
    },
    {
      metric: t("benchmark.row3.metric"),
      icon: <HardDrive size={14} className="text-blue-500" />,
      lrc: isVi ? "12 — 18 phút (Tạo 1:1 Previews)" : "12 — 18 min (Build 1:1 Previews)",
      mvd: isVi ? "0.00 giây (Không cần chờ)" : "0.00s (Zero wait)",
      winner: "mvd",
      note: t("benchmark.row3.note"),
    },
    {
      metric: t("benchmark.row4.metric"),
      icon: <Zap size={14} className="text-blue-500" />,
      lrc: isVi ? "350ms — 800ms / ảnh" : "350ms — 800ms / photo",
      mvd: isVi ? "< 16ms (60 FPS mượt mà)" : "< 16ms (Smooth 60 FPS)",
      winner: "mvd",
      note: t("benchmark.row4.note"),
    },
    {
      metric: t("benchmark.row5.metric"),
      icon: <ShieldAlert size={14} className="text-blue-500" />,
      lrc: isVi ? "Không hỗ trợ (Phải dò tay từng số)" : "Unsupported (Manual eyeball search)",
      mvd: isVi ? "Tự động bóc tách trong 0.4 giây" : "Auto-extracted in 0.4 seconds",
      winner: "mvd",
      note: t("benchmark.row5.note"),
    },
    {
      metric: t("benchmark.row6.metric"),
      icon: <BatteryCharging size={14} className="text-blue-500" />,
      lrc: isVi ? "Tốn 25 — 35% pin / giờ (Quạt hú)" : "Drains 25 — 35% battery/hr (Fans screaming)",
      mvd: isVi ? "Chỉ tốn 6 — 8% pin / giờ (Máy mát)" : "Only 6 — 8% battery/hr (Runs cool)",
      winner: "mvd",
      note: t("benchmark.row6.note"),
    },
  ];

  return (
    <section id="benchmark" className="py-16 md:py-24 relative bg-slate-50 dark:bg-[#07090E] border-b border-slate-200 dark:border-white/[0.08] transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Header: Left-Biased */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <Gauge size={11} />
              <span>{t("benchmark.badge")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {isVi ? config.benchmarkTitle : "Real-World Benchmark: MVD vs Lightroom Classic"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {isVi ? config.benchmarkNotes : "Measured on a typical real-world wedding shoot (2,000 uncompressed 33MP Sony A7 IV RAW files). Native hardware decoding bypasses catalog rendering bottlenecks."}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-600 dark:text-slate-400 font-mono shadow-sm self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{t("benchmark.verified")}</span>
          </div>
        </div>

        {/* Technical Comparison Table */}
        <div className="rounded-3xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-[#0A0E18] overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-slate-100 dark:bg-[#0E1526] px-6 py-4 border-b border-slate-200 dark:border-white/[0.08] text-xs font-mono font-bold">
            <div className="col-span-5 text-slate-700 dark:text-slate-300">{t("benchmark.metricCol")}</div>
            <div className="col-span-3 text-slate-500 dark:text-slate-400 text-center">{t("benchmark.lrcCol")}</div>
            <div className="col-span-4 text-blue-600 dark:text-blue-400 text-center flex items-center justify-center gap-2">
              <span>{t("benchmark.mvdCol")}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 font-mono">
                Native Engine
              </span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {comparisons.map((row, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 px-6 py-4 items-center hover:bg-slate-50/60 dark:hover:bg-white/[0.015] transition-colors"
              >
                <div className="col-span-5 space-y-1 pr-4">
                  <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {row.icon}
                    <span>{row.metric}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">
                    {row.note}
                  </div>
                </div>

                <div className="col-span-3 text-center text-xs font-mono text-slate-500 dark:text-slate-400">
                  {row.lrc}
                </div>

                <div className="col-span-4 flex items-center justify-center gap-2 text-center text-xs sm:text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  <Check size={14} strokeWidth={3} className="shrink-0 text-emerald-500" />
                  <span>{row.mvd}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Summary Bar */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-[#070A12] border-t border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400 font-mono">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{t("benchmark.conclusion")}</span>
            </div>
            <Link
              to="/download"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-bold flex items-center gap-1.5 transition-colors duration-150 whitespace-nowrap"
            >
              <span>{t("benchmark.downloadTest")}</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
