import React from "react";
import { Link } from "react-router-dom";
import { LatestRelease } from "@/types/release";
import {
  FolderSync,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Download,
  ArrowRight,
  HardDrive,
  BarChart3,
  FileText,
  ShieldCheck,
} from "lucide-react";

interface PhotoCounterPageProps {
  release: LatestRelease;
}

export function PhotoCounterPage({ release }: PhotoCounterPageProps) {
  const auditData = [
    { type: "Sony RAW Uncompressed (.ARW)", count: "1,840 files", size: "82.4 GB", status: "Hoàn tất chụp gốc" },
    { type: "Photoshop Retouched Master (.PSD)", count: "35 files", size: "4.2 GB", status: "Đạt cam kết hợp đồng (35/35)" },
    { type: "High-Res JPEG Export (300 DPI)", count: "35 files", size: "280 MB", status: "Sẵn sàng in Album 30x30" },
    { type: "Ảnh Phóng Lớn (Cổng Cưới 60x90)", count: "2 files", size: "45 MB", status: "Sẵn sàng gửi xưởng in" },
    { type: "Video Highlight 4K (.MP4)", count: "1 file", size: "3.6 GB", status: "Đã render hoàn tất" },
  ];

  return (
    <div className="py-12 md:py-20 space-y-20 ambient-glow transition-colors duration-150">
      {/* 1. Hero - Left-Biased, Spacious & Editorial */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-600 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Photo Counter · Audit & Delivery Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Kiểm Kê File & Đối Soát Hợp Đồng.{" "}
              <span className="text-blue-600 dark:text-blue-400">Chuẩn Xác 100%.</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Công cụ đếm số lượng và phân loại file chuyên sâu cho quản lý studio và thợ chụp. Quét đệ quy mọi thư mục con, đối chiếu số lượng cam kết trong hợp đồng chụp và xuất biên bản nghiệm thu bàn giao khách hàng.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                to="/download"
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors duration-150 whitespace-nowrap shadow-sm"
              >
                <Download size={15} />
                <span>Tải Photo Counter v{release.version}</span>
              </Link>
              <Link
                to="/pricing"
                className="px-5 py-3 rounded-2xl bg-white dark:bg-[#0E1422] hover:bg-slate-100 dark:hover:bg-[#161F33] text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-white/[0.08] transition-colors duration-150 flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <span>Xem Bảng Giá Tham Khảo</span>
                <ArrowRight size={13} className="text-blue-500" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] space-y-4 font-mono text-xs shadow-sm">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              Kiểm Kê Hợp Đồng
            </div>
            <div className="space-y-2 divide-y divide-slate-100 dark:divide-white/[0.04]">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Trạng thái:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Đủ 100% Chỉ Tiêu</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Ảnh Retouch:</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold tabular-nums">35 / 35 Master PSD</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Ảnh In Cổng:</span>
                <span className="text-slate-900 dark:text-white font-bold tabular-nums">2 / 2 Khổ 60x90</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Báo cáo:</span>
                <span className="text-slate-900 dark:text-white">Xuất Excel / PDF</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Audit Report Simulator */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0A0D15] p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/[0.08] pb-5">
            <div>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider font-bold">
                Biên Bản Kiểm Kê Dự Án (Live Inspection)
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                Dự án: 2026-Wedding-TrangMinh-SSD_T7
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Đủ Điều Kiện Nghiệm Thu
              </span>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#06080E] border border-slate-200 dark:border-white/[0.06] space-y-1.5">
              <span className="text-[11px] font-mono text-slate-500 uppercase">Tổng dung lượng</span>
              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">90.5 GB</div>
              <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">1,913 files trên ổ đĩa SSD</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#06080E] border border-slate-200 dark:border-white/[0.06] space-y-1.5">
              <span className="text-[11px] font-mono text-slate-500 uppercase">Cam kết hợp đồng</span>
              <div className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400 tabular-nums">35 / 35 Ảnh Sửa</div>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">100% chỉ tiêu hợp đồng</span>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#06080E] border border-slate-200 dark:border-white/[0.06] space-y-1.5">
              <span className="text-[11px] font-mono text-slate-500 uppercase">Ảnh phóng cổng cưới</span>
              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">2 / 2 Khổ 60x90</div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Sẵn sàng gửi nhà in</span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden">
            <div className="bg-slate-100 dark:bg-[#0E1422] px-5 py-3 border-b border-slate-200 dark:border-white/[0.06] text-xs font-bold text-slate-800 dark:text-white flex justify-between">
              <span>Bảng Chi Tiết Định Dạng File</span>
              <span className="font-mono text-slate-500 dark:text-slate-400 text-xs">Deep Recursive Tree</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/[0.04] bg-white dark:bg-[#06080E] font-mono text-xs">
              {auditData.map((row, idx) => (
                <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/60 dark:hover:bg-white/[0.01]">
                  <div className="space-y-0.5">
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{row.type}</span>
                    <span className="text-[11px] text-slate-500 block">{row.status}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-blue-600 dark:text-blue-400 font-bold tabular-nums">{row.count}</span>
                    <span className="text-slate-500 text-xs block tabular-nums">{row.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Values Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Kiểm Soát Hồ Sơ Khách Hàng Chuyên Nghiệp
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Giúp chủ studio và thợ chụp luôn nắm rõ tiến độ bàn giao từng bộ ảnh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BarChart3 size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Quét Đệ Quy Không Giới Hạn</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Tự động đi sâu vào từng thư mục con của máy 1, máy 2, flycam, thẻ nhớ phụ mà không bỏ sót bất kỳ một tệp tin hình ảnh nào.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileCheck size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Chống Thiếu & Thừa File</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Cảnh báo ngay lập tức nếu số lượng ảnh chỉnh sửa thiếu so với cam kết gói chụp trong hợp đồng, giúp tránh khiếu nại từ khách hàng.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FileText size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Xuất Báo Cáo Nghiệm Thu 1-Click</h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Xuất biên bản thống kê rõ ràng để kẹp vào hồ sơ trả khách hoặc gửi xưởng gia công album ảnh cưới kiểm đếm.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Action Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 pt-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          Kiểm soát chính xác mọi bàn giao studio của bạn
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Có sẵn trong bộ cài MVD Studio v{release.version}.
        </p>
        <div className="flex justify-center gap-3 pt-3">
          <Link
            to="/download"
            className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors duration-150 whitespace-nowrap shadow-sm"
          >
            Tải Ngay Bộ Cài Đặt
          </Link>
          <Link
            to="/pricing"
            className="px-5 py-3.5 rounded-2xl bg-white dark:bg-[#0E1422] hover:bg-slate-100 dark:hover:bg-[#161F33] text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-colors duration-150 border border-slate-200 dark:border-white/[0.08] whitespace-nowrap shadow-sm"
          >
            Xem Bảng Giá Tham Khảo
          </Link>
        </div>
      </section>
    </div>
  );
}
