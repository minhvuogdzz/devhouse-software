import React from "react";
import { Cpu, ShieldCheck, Zap, Terminal, Lock, RefreshCw, Layers } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function EngineeringSpecs() {
  const { t, isVi } = useLanguage();

  const pillars = [
    {
      badge: "CORE ENGINE",
      title: t("specs.pillar1.title"),
      subtitle: t("specs.pillar1.sub"),
      desc: t("specs.pillar1.desc"),
      codeSnippet: `// Rust LibRaw Embedded Decode Pipeline
let preview = raw_loader::extract_embedded_jpeg(&file_path)?;
gpu_surface.stream_texture(preview.as_slice(), 60.0 /* fps */);`,
    },
    {
      badge: "GPU PIPELINE",
      title: t("specs.pillar2.title"),
      subtitle: t("specs.pillar2.sub"),
      desc: t("specs.pillar2.desc"),
      codeSnippet: `// Instant Focus Inspection
const loupeRect = computeEyeTarget(cursorCoords, 1.0 /* 100% */);
renderContext.blitToScreen(loupeRect, { latencyMs: 0.01 });`,
    },
    {
      badge: "SECURITY & PRIVACY",
      title: t("specs.pillar3.title"),
      subtitle: t("specs.pillar3.sub"),
      desc: t("specs.pillar3.desc"),
      codeSnippet: `// Local File I/O Only
fs::copy_safe(source_raw, target_album_dir, CopyOptions::Atomic)?;
assert!(network_egress::is_blocked_for_photo_data());`,
    },
    {
      badge: "SESSION LIFECYCLE",
      title: t("specs.pillar4.title"),
      subtitle: t("specs.pillar4.sub"),
      desc: t("specs.pillar4.desc"),
      codeSnippet: `// 00:00 ICT Scheduled Session Renewal
cron::schedule("0 0 0 * * *", Timezone::Asia_HoChiMinh, || {
    auth_guard.validate_entitlement_and_refresh_session();
});`,
    },
  ];

  return (
    <section id="engineering" className="py-16 md:py-24 relative bg-slate-50 dark:bg-[#07090E] border-b border-slate-200 dark:border-white/[0.08] transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header: Left-Biased */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <Terminal size={11} />
              <span>{t("specs.badge")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("specs.title")}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {t("specs.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-600 dark:text-slate-400 self-start md:self-auto font-mono shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>Zero Electron bloat</span>
          </div>
        </div>

        {/* 2x2 Dense Technical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((item, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-blue-500/40 transition-colors flex flex-col justify-between space-y-5 group shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-full">
                    {item.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400 dark:text-slate-500">Spec 0{idx + 1}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors tracking-tight">
                  {item.title}
                </h3>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {item.subtitle}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                  {item.desc}
                </p>
              </div>

              {/* Code Snippet Box */}
              <div className="rounded-2xl bg-slate-100 dark:bg-[#070A12] p-4 border border-slate-200 dark:border-white/[0.04] font-mono text-xs text-slate-800 dark:text-slate-300 overflow-x-auto leading-relaxed">
                <pre>
                  <code>{item.codeSnippet}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
