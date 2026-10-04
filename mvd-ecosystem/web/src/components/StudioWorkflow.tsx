import React from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Camera,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  ArrowRight,
  GitCommit,
} from "lucide-react";

export function StudioWorkflow() {
  const { t, isVi } = useLanguage();

  const steps = [
    {
      num: "01",
      icon: <Camera size={16} className="text-blue-500" />,
      title: t("workflow.step1.title"),
      desc: t("workflow.step1.desc"),
      timing: "0.00s latency",
    },
    {
      num: "02",
      icon: <Layers size={16} className="text-blue-500" />,
      title: t("workflow.step2.title"),
      desc: t("workflow.step2.desc"),
      timing: isVi ? "60 FPS mượt mà" : "Smooth 60 FPS",
    },
    {
      num: "03",
      icon: <FileSpreadsheet size={16} className="text-blue-500" />,
      title: t("workflow.step3.title"),
      desc: t("workflow.step3.desc"),
      timing: isVi ? "0.4s hoàn tất" : "0.4s completed",
    },
    {
      num: "04",
      icon: <CheckCircle2 size={16} className="text-blue-500" />,
      title: t("workflow.step4.title"),
      desc: t("workflow.step4.desc"),
      timing: isVi ? "Chính xác 100%" : "100% precision",
    },
  ];

  return (
    <section id="workflow" className="py-16 md:py-24 relative border-b border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-[#07090E] transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header: Left-Biased */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <GitCommit size={11} />
              <span>{t("workflow.badge")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("workflow.title")}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {t("workflow.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-600 dark:text-slate-400 self-start md:self-auto font-mono shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>{isVi ? "4 bước khép kín" : "4-step closed-loop"}</span>
          </div>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-blue-500/40 transition-colors relative flex flex-col justify-between group space-y-4 shadow-sm"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="font-mono font-bold text-xs text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors">
                    {step.num}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Benchmark:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">{step.timing}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
