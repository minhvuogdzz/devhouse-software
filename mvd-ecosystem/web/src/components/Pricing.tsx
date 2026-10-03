import React from "react";
import { Link } from "react-router-dom";
import { Check, PhoneCall, Download, Info, ShieldCheck } from "lucide-react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { useLanguage } from "@/context/LanguageContext";

export function Pricing() {
  const { config, zaloUrl, telUrl } = useSiteConfig();
  const { t, isVi } = useLanguage();

  const plans = [
    {
      id: "trial",
      name: isVi ? "Bản Dùng Thử" : "Evaluation Trial",
      price: isVi ? "0đ" : "$0",
      period: isVi ? "7 ngày trải nghiệm" : "7 days evaluation",
      badge: isVi ? "MIỄN PHÍ" : "FREE",
      highlight: false,
      desc: isVi
        ? "Trải nghiệm đầy đủ 100% tính năng của hệ sinh thái MVD Studio trước khi quyết định đầu tư bản quyền."
        : "Evaluate 100% full features of the MVD Studio ecosystem before deciding on a studio investment.",
      features: isVi
        ? [
            "Đầy đủ 4 ứng dụng trong bộ cài đặt",
            "Không giới hạn số lượng ảnh lọc",
            "Tự động hóa Google Sheets & Drive",
            "Thống kê ảnh Photo Counter",
            "Hỗ trợ kỹ thuật qua Zalo",
          ]
        : [
            "Full 4 applications in 1 unified installer",
            "Unlimited photo culling capacity",
            "Google Sheets & Drive automation",
            "Photo Counter audit & contract tools",
            "Technical onboarding via Zalo/Remote",
          ],
      cta: t("pricing.trialCta"),
      link: "/download",
      isExternal: false,
    },
    {
      id: "pro_annual",
      name: isVi ? "Bản Quyền 1 Năm" : "1-Year License",
      price: isVi ? "499.000đ" : "499,000 VND",
      period: isVi ? "12 tháng sử dụng" : "12 months access",
      badge: isVi ? "KHUYÊN DÙNG" : "RECOMMENDED",
      highlight: true,
      desc: isVi
        ? "Lựa chọn tiết kiệm chi phí tối ưu dành cho thợ ảnh tự do (freelancer) và studio quy mô vừa."
        : "Cost-effective optimal plan tailored for freelance photographers and medium-sized studios.",
      features: isVi
        ? [
            "Sử dụng không giới hạn 365 ngày",
            "Trọn bộ Photo Picker Pro + Contact The Sheet",
            "Mở khóa toàn bộ kho Presets & Typography",
            "Cập nhật miễn phí mọi tính năng mới trong năm",
            "Hỗ trợ cài đặt từ xa qua UltraViewer / AnyDesk",
            "Ưu tiên hỗ trợ kỹ thuật 24/7",
          ]
        : [
            "Unlimited usage for 365 days",
            "Full suite: Photo Picker Pro + Contact The Sheet",
            "Unlock all Presets & Typography resources",
            "Free updates for all new features throughout the year",
            "Remote installation via UltraViewer / AnyDesk",
            "Priority 24/7 technical assistance",
          ],
      cta: isVi ? "Liên Hệ Tư Vấn Gói 1 Năm" : "Consult 1-Year Plan",
      link: zaloUrl,
      isExternal: true,
    },
    {
      id: "lifetime",
      name: isVi ? "Bản Quyền Vĩnh Viễn" : "Lifetime License",
      price: isVi ? "999.000đ" : "999,000 VND",
      period: isVi ? "Sở hữu trọn đời" : "Lifetime ownership",
      badge: isVi ? "SỞ HỮU MÃI MÃI" : "LIFETIME",
      highlight: false,
      desc: isVi
        ? "Đầu tư một lần duy nhất, sở hữu mãi mãi và nhận toàn bộ bản nâng cấp lớn trong tương lai."
        : "Single investment, permanent ownership, and all future major version upgrades included.",
      features: isVi
        ? [
            "Sở hữu vĩnh viễn không thời hạn",
            "Đầy đủ mọi ứng dụng hiện tại & tương lai",
            "Miễn phí mọi bản nâng cấp v3.x, v4.x trọn đời",
            "Mở khóa độc quyền kho tài nguyên VIP",
            "Hỗ trợ chuyển đổi máy khi nâng cấp thiết bị mới",
            "Kênh hỗ trợ VIP riêng biệt",
          ]
        : [
            "Permanent lifetime license with zero renewal fees",
            "All current & future studio applications",
            "Free lifetime v3.x, v4.x major version upgrades",
            "Exclusive access to VIP studio resources",
            "License transfer assistance when upgrading hardware",
            "Direct VIP support line",
          ],
      cta: isVi ? "Liên Hệ Tư Vấn Trọn Đời" : "Consult Lifetime Plan",
      link: zaloUrl,
      isExternal: true,
    },
  ];

  return (
    <section id="pricing" className="py-16 md:py-24 relative bg-slate-50 dark:bg-[#07090E] border-b border-slate-200 dark:border-white/[0.08] transition-colors duration-150">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header: Left-Biased */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <span>{t("pricing.badge")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("pricing.title")}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {t("pricing.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-600 dark:text-slate-400 self-start md:self-auto font-mono">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>{t("pricing.transparent")}</span>
          </div>
        </div>

        {/* Notice Banner */}
        <div className="mb-10 p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-start sm:items-center gap-3 text-xs text-blue-900 dark:text-blue-300">
          <Info size={18} className="shrink-0 text-blue-600 dark:text-blue-400 mt-0.5 sm:mt-0" />
          <div className="flex-1 leading-relaxed">
            <strong>{isVi ? "Lưu ý:" : "Note:"}</strong> {t("pricing.notice")}{" "}
            <a
              href={zaloUrl}
              target="_blank"
              rel="noreferrer"
              className="font-bold underline text-blue-700 dark:text-blue-300 hover:text-blue-500 font-mono"
            >
              {config.phoneFormatted}
            </a>
            .
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`p-7 rounded-3xl flex flex-col justify-between transition-colors relative space-y-6 ${
                plan.highlight
                  ? "bg-blue-50/70 dark:bg-[#0E1526] border-2 border-blue-600 dark:border-blue-500"
                  : "bg-white dark:bg-[#0A0E18] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-white/[0.16]"
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full ${
                      plan.highlight
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.08]"
                    }`}
                  >
                    {plan.badge}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    {plan.period}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono tabular-nums">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                      {t("pricing.ref")}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {plan.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06] space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="p-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {plan.isExternal ? (
                  <a
                    href={plan.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-xs transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                      plan.highlight
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-white dark:border-white/[0.08]"
                    }`}
                  >
                    <PhoneCall size={14} />
                    <span>{plan.cta}</span>
                  </a>
                ) : (
                  <Link
                    to={plan.link}
                    className="w-full py-3 px-4 rounded-2xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-white dark:border-white/[0.08] transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <Download size={14} />
                    <span>{plan.cta}</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Direct Contact Studio Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0E1526] border border-slate-200 dark:border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base tracking-tight">
              {t("pricing.studioNeed.title")}
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t("pricing.studioNeed.desc")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={telUrl}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors font-mono"
            >
              <PhoneCall size={13} className="text-blue-500" />
              <span>{config.phoneFormatted}</span>
            </a>
            <a
              href={zaloUrl}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap cursor-pointer"
            >
              <PhoneCall size={13} />
              <span>{t("pricing.zaloCta")}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
