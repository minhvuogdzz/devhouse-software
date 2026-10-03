import React from "react";
import { LatestRelease } from "@/types/release";
import { DownloadMatrix } from "@/components/DownloadMatrix";
import { useLanguage } from "@/context/LanguageContext";
import { Download, ShieldCheck, Cpu, HardDrive, Terminal } from "lucide-react";

interface DownloadPageProps {
  release: LatestRelease;
}

export function DownloadPage({ release }: DownloadPageProps) {
  const { t, isVi } = useLanguage();

  const sysReqs = [
    {
      os: "macOS Apple Silicon",
      cpu: isVi ? "Apple M1 / M2 / M3 / M4 (Mọi biến thể Pro, Max, Ultra)" : "Apple M1 / M2 / M3 / M4 (All Pro, Max, Ultra variants)",
      osVer: isVi ? "macOS 11.0 (Big Sur) trở lên" : "macOS 11.0 (Big Sur) or later",
      ram: isVi ? "8 GB RAM trở lên (Khuyến nghị 16 GB)" : "8 GB RAM minimum (16 GB recommended)",
      disk: isVi ? "200 MB dung lượng trống" : "200 MB free space",
    },
    {
      os: "macOS Intel",
      cpu: isVi ? "Intel Core i5 / i7 / i9 (MacBook, iMac, Mac mini 2020 trở về trước)" : "Intel Core i5 / i7 / i9 (MacBook, iMac, Mac mini 2020 and earlier)",
      osVer: isVi ? "macOS 10.15 (Catalina) trở lên" : "macOS 10.15 (Catalina) or later",
      ram: isVi ? "8 GB RAM trở lên" : "8 GB RAM minimum",
      disk: isVi ? "250 MB dung lượng trống" : "250 MB free space",
    },
    {
      os: "Windows 64-bit",
      cpu: isVi ? "Intel Core i3/i5/i7/i9 hoặc AMD Ryzen 64-bit" : "Intel Core i3/i5/i7/i9 or AMD Ryzen 64-bit",
      osVer: "Windows 10 / Windows 11 (64-bit)",
      ram: isVi ? "8 GB RAM trở lên (Khuyến nghị 16 GB)" : "8 GB RAM minimum (16 GB recommended)",
      disk: isVi ? "200 MB dung lượng trống" : "200 MB free space",
    },
  ];

  return (
    <div className="py-12 md:py-20 space-y-20 ambient-glow transition-colors duration-150">
      {/* 1. Page Header - Left-Biased, Editorial & Spacious */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-600 dark:text-blue-400">
              <Download size={13} />
              <span>{t("download.badge")}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {t("download.title")} v{release.version}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {t("download.desc")}
            </p>
          </div>

          <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] space-y-4 font-mono text-xs shadow-sm">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              {t("download.buildInfo")}
            </div>
            <div className="space-y-2 divide-y divide-slate-100 dark:divide-white/[0.04]">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">{t("download.version")}</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold tabular-nums">v{release.version}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? "Kênh phát hành:" : "Release channel:"}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Official Release</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? "Bảo mật SHA:" : "Security SHA:"}</span>
                <span className="text-slate-700 dark:text-slate-200">Verified Checksum</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Download Matrix Component */}
      <DownloadMatrix release={release} />

      {/* 3. System Requirements Table with Tabular-Nums */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0E1422] p-7 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/[0.06] pb-4">
            <Cpu size={18} className="text-blue-500" />
            <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {t("download.sysReqs")}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs divide-y divide-slate-100 dark:divide-white/[0.06]">
              <thead>
                <tr className="text-slate-500 text-[11px]">
                  <th className="py-2.5 pr-4">{t("download.osCol")}</th>
                  <th className="py-2.5 pr-4">{t("download.cpuCol")}</th>
                  <th className="py-2.5 pr-4">{t("download.osVerCol")}</th>
                  <th className="py-2.5 pr-4">{t("download.ramCol")}</th>
                  <th className="py-2.5">{t("download.diskCol")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {sysReqs.map((req, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-slate-900 dark:text-white">{req.os}</td>
                    <td className="py-3.5 pr-4 text-slate-600 dark:text-slate-400">{req.cpu}</td>
                    <td className="py-3.5 pr-4">{req.osVer}</td>
                    <td className="py-3.5 pr-4 text-blue-600 dark:text-blue-400 tabular-nums">{req.ram}</td>
                    <td className="py-3.5 tabular-nums">{req.disk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
