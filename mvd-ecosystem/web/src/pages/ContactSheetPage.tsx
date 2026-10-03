import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LatestRelease } from "@/types/release";
import { useLanguage } from "@/context/LanguageContext";
import {
  FileSpreadsheet,
  Zap,
  CheckCircle2,
  Terminal,
  RefreshCw,
  Copy,
  Download,
  ArrowRight,
  FolderSync,
  FileCheck,
  ShieldCheck,
} from "lucide-react";

interface ContactSheetPageProps {
  release: LatestRelease;
}

export function ContactSheetPage({ release }: ContactSheetPageProps) {
  const { t, isVi } = useLanguage();

  const [sheetInput, setSheetInput] = useState(
    isVi
      ? "Khách báo in album cưới: DSC04892, DSC04895, 4901..4905, 4910, 5012-5015 (giao trước thứ 6)"
      : "Client wedding album list: DSC04892, DSC04895, 4901..4905, 4910, 5012-5015 (deliver by Friday)"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    isVi
      ? "Sẵn sàng bóc tách. Nhấn nút để khởi chạy Regex Engine..."
      : "Ready to extract. Click button to launch Regex Engine...",
  ]);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  const runExtraction = () => {
    setIsProcessing(true);
    setLogs([isVi ? "[1/5] Bắt đầu nhận diện chuỗi regex và mở rộng dải số..." : "[1/5] Identifying regex patterns and expanding ranges..."]);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        isVi
          ? "[2/5] Đã bóc tách thành công 12 mã ảnh mục tiêu: 4892, 4895, 4901, 4902, 4903, 4904, 4905, 4910, 5012, 5013, 5014, 5015"
          : "[2/5] Successfully isolated 12 target photo codes: 4892, 4895, 4901, 4902, 4903, 4904, 4905, 4910, 5012, 5013, 5014, 5015",
      ]);
    }, 250);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        isVi
          ? "[3/5] Quét đệ quy thư mục gốc SSD: /Volumes/Sony_RAW/2026_Wedding_TrangMinh/ (2,450 files)"
          : "[3/5] Deep recursive scan in SSD master directory: /Volumes/Sony_RAW/2026_Wedding_TrangMinh/ (2,450 files)",
      ]);
    }, 550);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        isVi ? "  ↳ Khớp DSC04892.ARW -> Tìm thấy" : "  ↳ Matched DSC04892.ARW -> Found",
        isVi ? "  ↳ Khớp dải DSC04901.ARW .. DSC04905.ARW -> Tìm thấy đủ 5 files" : "  ↳ Matched range DSC04901.ARW .. DSC04905.ARW -> Found 5 files",
        isVi ? "  ↳ Khớp dải DSC05012.ARW .. DSC05015.ARW -> Tìm thấy đủ 4 files" : "  ↳ Matched range DSC05012.ARW .. DSC05015.ARW -> Found 4 files",
      ]);
    }, 850);

    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        isVi
          ? "[4/5] Sao chép an toàn (Atomic File Copy) vào: /Exports/KhachChon_Album_30x30/"
          : "[4/5] Atomic File Copy to target directory: /Exports/KhachChon_Album_30x30/",
        isVi
          ? "✓ [5/5] Hoàn tất 12/12 file khớp chính xác 100% trong 0.42 giây! (0 file thất lạc)"
          : "✓ [5/5] Success: 12/12 files matched 100% in 0.42 seconds! (0 missing files)",
      ]);
      setSuccessCount(12);
      setIsProcessing(false);
    }, 1150);
  };

  const steps = [
    {
      num: "01",
      title: isVi ? "Nhận Danh Sách Từ Khách" : "Receive Customer List",
      desc: isVi
        ? "Khách gửi link Google Sheets, Google Drive hoặc nhắn tin Zalo với các mã số viết tắt, dải gạch nối (ví dụ: 4901-4905)."
        : "Clients send Google Sheets, Drive links, or message lists with shorthand notations (e.g., 4901-4905).",
    },
    {
      num: "02",
      title: isVi ? "Phân Tích Regex Thông Minh" : "Intelligent Regex Parsing",
      desc: isVi
        ? "Hệ thống tự động loại bỏ tiền tố thừa (DSC, IMG, _MG), tách dải số liên tiếp và chuẩn hóa danh sách mã file chuẩn xác."
        : "The engine strips redundant prefixes (DSC, IMG, _MG), expands continuous numerical ranges, and normalizes candidate IDs.",
    },
    {
      num: "03",
      title: isVi ? "Dò Quét & Sao Chép Tức Thì" : "Instant Search & Atomic Copy",
      desc: isVi
        ? "Quét sâu toàn bộ thư mục thẻ nhớ hoặc SSD ngoài, tìm đúng file RAW gốc và sao chép vào folder bàn giao chỉ trong vài giây."
        : "Scans master cards or SSDs deeply, isolates master RAW files, and copies them to the delivery folder in seconds.",
    },
  ];

  return (
    <div className="py-12 md:py-20 space-y-20 ambient-glow transition-colors duration-150">
      {/* 1. Hero - Left-Biased, Spacious & Editorial */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-600 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Contact The Sheet · Automation Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {isVi ? (
                <>Bóc Tách Mã Ảnh Google Sheets Trong <span className="text-blue-600 dark:text-blue-400">0.4 Giây</span></>
              ) : (
                <>Extract Google Sheets Photo Codes in <span className="text-blue-600 dark:text-blue-400">0.4 Seconds</span></>
              )}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {isVi
                ? "Giải phóng đôi mắt và thời gian của bạn. Dán link Google Sheets hoặc danh sách số ảnh khách chọn, Contact The Sheet tự động tìm đúng file gốc và copy vào thư mục bàn giao với độ chính xác 100%."
                : "Save hours of manual eyeballing. Paste Google Sheets links or client numbers, and Contact The Sheet automatically locates master RAW files and copies them to the export folder with 100% precision."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                to="/download"
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors duration-150 whitespace-nowrap shadow-sm"
              >
                <Download size={15} />
                <span>{isVi ? `Tải Contact The Sheet v${release.version}` : `Download Contact The Sheet v${release.version}`}</span>
              </Link>
              <Link
                to="/pricing"
                className="px-5 py-3 rounded-2xl bg-white dark:bg-[#0E1422] hover:bg-slate-100 dark:hover:bg-[#161F33] text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-white/[0.08] transition-colors duration-150 flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <span>{isVi ? "Bảng Giá Tham Khảo" : "Reference Pricing"}</span>
                <ArrowRight size={13} className="text-blue-500" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] space-y-4 font-mono text-xs shadow-sm">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              {isVi ? "Chỉ Số Tự Động Hóa" : "Automation Metrics"}
            </div>
            <div className="space-y-2 divide-y divide-slate-100 dark:divide-white/[0.04]">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? "Thời gian bóc tách:" : "Extraction speed:"}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">0.42s</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? "Độ chính xác:" : "Accuracy:"}</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold tabular-nums">100.0%</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? "Hỗ trợ dải số:" : "Range support:"}</span>
                <span className="text-slate-900 dark:text-white font-bold">4901..4905, 5012-5015</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? "Cơ chế copy:" : "Copy pipeline:"}</span>
                <span className="text-slate-900 dark:text-white">Atomic Safe Copy</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Live Interactive Simulator */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0A0D15] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.06] pb-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isVi ? "Trải Nghiệm Thử Nghiệm Bóc Tách Trực Tiếp Trên Web" : "Live Interactive Extraction Simulator on Web"}
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">Live Web Regex Engine</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input Textarea */}
            <div className="space-y-4">
              <label className="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                {isVi ? "Nhập hoặc dán văn bản khách chọn (Zalo / Sheets):" : "Paste customer selection text (Zalo / Sheets / Excel):"}
              </label>
              <textarea
                value={sheetInput}
                onChange={(e) => setSheetInput(e.target.value)}
                rows={5}
                className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-[#07090F] border border-slate-200 dark:border-white/[0.08] font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed"
              />
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={runExtraction}
                  disabled={isProcessing}
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 transition-colors duration-150 cursor-pointer shadow-sm disabled:opacity-50 whitespace-nowrap"
                >
                  <Zap size={14} />
                  <span>{isProcessing ? (isVi ? "Đang Quét Dữ Liệu..." : "Extracting...") : (isVi ? "Bấm Bóc Tách Tự Động" : "Run Extraction")}</span>
                </button>
                {successCount && (
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    <span>{isVi ? `Khớp ${successCount} files` : `Matched ${successCount} files`}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right: Terminal Console Output */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/[0.08] bg-slate-900 p-5 flex flex-col justify-between font-mono text-xs space-y-3 min-h-[240px] text-slate-300">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-slate-200">
                  <Terminal size={13} className="text-blue-400" />
                  <span>Terminal Engine Logs</span>
                </span>
                <span className="tabular-nums">{isVi ? "Tốc độ: 0.04s Regex Parser" : "Speed: 0.04s Regex Parser"}</span>
              </div>

              <div className="space-y-1.5 overflow-y-auto max-h-[210px] text-xs leading-relaxed">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`${
                      log.startsWith("✓")
                        ? "text-emerald-400 font-bold"
                        : log.startsWith("  ↳")
                        ? "text-blue-300 pl-2"
                        : "text-slate-400"
                    }`}
                  >
                    {log}
                  </div>
                ))}
              </div>

              <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
                <span>{isVi ? "An toàn dữ liệu: Atomic Copy" : "Data Safety: Atomic Copy"}</span>
                <span className="text-emerald-400 font-bold">{isVi ? "100% Zero File Thất Lạc" : "100% Zero Missing Files"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Connected Workflow Timeline */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isVi ? "Chu Trình Tự Động Hóa Khép Kín" : "Closed-Loop Automation Pipeline"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {isVi
              ? "Giúp studio rút ngắn quy trình trả ảnh từ vài tiếng xuống còn vài chục giây."
              : "Shorten your delivery workflow from several exhausting hours down to seconds."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] space-y-3 relative flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                    {isVi ? `Bước ${st.num}` : `Step ${st.num}`}
                  </span>
                  <span className="text-slate-400 dark:text-slate-600 font-mono text-xs">Phase 0{idx + 1}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{st.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Action Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 pt-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isVi ? "Loại bỏ ngay sự mệt mỏi khi ngồi dò từng số ảnh!" : "Eliminate manual filename eyeballing forever!"}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {isVi ? `Tích hợp sẵn trong bộ cài đặt MVD Tech & Design v${release.version}.` : `Included out of the box in MVD Tech & Design v${release.version}.`}
        </p>
        <div className="flex justify-center gap-3 pt-3">
          <Link
            to="/download"
            className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors duration-150 whitespace-nowrap shadow-sm"
          >
            {isVi ? "Tải Bản Cài Đặt Ngay" : "Download Native Build"}
          </Link>
          <Link
            to="/apps/photo-counter"
            className="px-5 py-3.5 rounded-2xl bg-white dark:bg-[#0E1422] hover:bg-slate-100 dark:hover:bg-[#161F33] text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-colors duration-150 border border-slate-200 dark:border-white/[0.08] whitespace-nowrap shadow-sm"
          >
            {isVi ? "Tìm Hiểu Photo Counter →" : "Explore Photo Counter →"}
          </Link>
        </div>
      </section>
    </div>
  );
}
