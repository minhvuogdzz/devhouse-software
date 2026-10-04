import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LatestRelease } from "@/types/release";
import { useLanguage } from "@/context/LanguageContext";
import {
  Layers,
  Zap,
  Eye,
  Camera,
  Star,
  Download,
  CheckCircle2,
  Cpu,
  ArrowRight,
  HardDrive,
  Sliders,
  Maximize2,
} from "lucide-react";

interface PhotoPickerPageProps {
  release: LatestRelease;
}

export function PhotoPickerPage({ release }: PhotoPickerPageProps) {
  const [loupeActive, setLoupeActive] = useState(true);
  const [activeStar, setActiveStar] = useState(5);
  const { t, isVi } = useLanguage();

  const supportedFormats = [
    { brand: "Sony", formats: ".ARW (A7R V 61MP, A7 IV 33MP, A1 50MP, A9 III)" },
    { brand: "Canon", formats: ".CR2 / .CR3 (EOS R5, R6 II, R3, 5D Mark IV)" },
    { brand: "Nikon", formats: ".NEF (Z8, Z9, Z6 III, D850)" },
    { brand: "Fujifilm", formats: ".RAF (X-T5, X-H2, GFX 100 II)" },
    { brand: isVi ? "Định Dạng Chung" : "Universal Formats", formats: ".JPG / .JPEG / .PNG / .TIFF sRGB & AdobeRGB" },
  ];

  const features = [
    {
      title: isVi ? "Giải Mã Trực Tiếp Embedded Preview" : "Direct Embedded Preview Decoding",
      desc: isVi
        ? "Thay vì de-mosaic toàn bộ cảm biến Bayer 60MP trên CPU gây nghẽn, MVD đọc trực tiếp khối preview độ phân giải cao từ phần cứng bằng LibRaw, cho tốc độ hiển thị tức thì trong 0.02 giây."
        : "Instead of CPU de-mosaicing full 60MP Bayer sensors, MVD decodes hardware embedded previews via LibRaw, rendering frames instantaneously in 0.02s.",
      stat: "0.02s",
      statLabel: isVi ? "Thời gian mở ảnh" : "Decode latency",
    },
    {
      title: isVi ? "Kính Lúp Soi Nét Mắt 1:1 Siêu Nét" : "1:1 Ultra-Sharp Eye Focus Loupe",
      desc: isVi
        ? "Nhấn giữ hoặc toggle phím Z để soi nét 100% tại tròng mắt và lông mi cô dâu chú rể. Kiểm tra ngay lập tức ảnh có bị out nét hoặc rung tay hay không mà không cần zoom toàn màn hình."
        : "Hold or toggle Z key to inspect 100% 1:1 pixel focus on iris and eyelashes. Verify focus accuracy instantly without full-screen zoom lags.",
      stat: "<16ms",
      statLabel: isVi ? "Độ trễ lúp 100%" : "Loupe latency",
    },
    {
      title: isVi ? "Đồng Bộ Phím Tắt Tiêu Chuẩn Studio" : "Studio-Standard Keyboard Shortcuts",
      desc: isVi
        ? "Bàn phím được tối ưu hóa cho thợ lọc ảnh chuyên nghiệp: phím 1..5 gán sao, phím 6..9 gán nhãn màu, phím Space lướt ảnh tiếp theo, phím Z soi nét mắt. Thao tác quen thuộc 100% như Lightroom."
        : "Designed for production speed: 1..5 keys for star ratings, 6..9 keys for color tags, Spacebar for advance, Z for loupe zoom. Matches familiar Lightroom muscle memory.",
      stat: "60 FPS",
      statLabel: isVi ? "Khung hình mượt mà" : "Fluid frame rate",
    },
    {
      title: isVi ? "Tiết Kiệm Bộ Nhớ Đệm RAM Vượt Trội" : "Ultralight RAM Memory Footprint",
      desc: isVi
        ? "Chỉ chiếm dụng từ 118MB đến 190MB RAM ngay cả khi nạp thư mục hơn 3,000 ảnh RAW. Máy tính không bị nóng, không hú quạt và hoạt động cực êm ái trên cả MacBook Air M1 cơ bản."
        : "Occupies only 118MB to 190MB RAM even with 3,000+ RAW images loaded. Laptops run cool without fan noise, preserving battery all day.",
      stat: "118 MB",
      statLabel: isVi ? "RAM trung bình" : "Average RAM RSS",
    },
  ];

  return (
    <div className="py-12 md:py-20 space-y-20 ambient-glow transition-colors duration-150">
      {/* 1. Product Hero - Left-Biased, Editorial & Spacious */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-600 dark:text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Photo Picker Pro · Cull Engine</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {isVi ? (
                <>Lọc Hàng Nghìn Ảnh RAW Thần Tốc. <span className="text-blue-600 dark:text-blue-400">Không Giật Lag.</span></>
              ) : (
                <>Cull Thousands of RAW Photos. <span className="text-blue-600 dark:text-blue-400">Zero Lag.</span></>
              )}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {isVi
                ? "Phần mềm chọn ảnh chuyên nghiệp thế hệ mới xây dựng trên Rust native. Giải quyết triệt để sự ì ạch của Lightroom khi phải lọc các buổi chụp tiệc cưới, phóng sự từ 1,500 đến 3,000 ảnh RAW."
                : "Next-generation native photo culling built in Rust. Solves Lightroom's sluggishness when reviewing high-volume wedding and event sessions with 1,500 to 3,000+ RAW images."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                to="/download"
                className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors duration-150 whitespace-nowrap shadow-sm"
              >
                <Download size={15} />
                <span>{isVi ? `Tải Photo Picker Pro v${release.version}` : `Download Photo Picker Pro v${release.version}`}</span>
              </Link>
              <Link
                to="/benchmark"
                className="px-5 py-3 rounded-2xl bg-white dark:bg-[#0E1422] hover:bg-slate-100 dark:hover:bg-[#161F33] text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-white/[0.08] transition-colors duration-150 flex items-center gap-1.5 whitespace-nowrap shadow-sm"
              >
                <span>{isVi ? "Xem So Sánh Benchmark" : "View Benchmark Matrix"}</span>
                <ArrowRight size={13} className="text-blue-500" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] space-y-4 font-mono text-xs shadow-sm">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">
              {isVi ? "Thông Số Động Cơ" : "Engine Metrics"}
            </div>
            <div className="space-y-2 divide-y divide-slate-100 dark:divide-white/[0.04]">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Engine Core:</span>
                <span className="text-slate-900 dark:text-white font-bold">Rust / Tauri Native</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? "Bộ nhớ RAM:" : "Memory:"}</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold tabular-nums">~118 MB RSS</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">{isVi ? "Tốc độ mở ảnh:" : "Decode speed:"}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">0.02s / frame</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">GPU Texture:</span>
                <span className="text-slate-900 dark:text-white">Metal / DirectX</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Feature Showcase Stage */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-[#0A0D15] overflow-hidden shadow-2xl">
          <div className="h-11 px-5 bg-[#07090F] border-b border-white/[0.08] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse" />
              <span className="text-slate-200 font-bold">SONY ILCE-7M4</span>
              <span className="text-slate-600">/</span>
              <span className="text-slate-400">DSC04892.ARW (33.1 MP Uncompressed RAW)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLoupeActive(!loupeActive)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors duration-150 flex items-center gap-1.5 cursor-pointer ${
                  loupeActive ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300 hover:text-white"
                }`}
              >
                <Eye size={12} /> {loupeActive ? (isVi ? "[Z] Soi Nét 100% Đang Bật" : "[Z] 100% Loupe Active") : (isVi ? "[Z] Bật Soi Nét 100%" : "[Z] Enable 100% Loupe")}
              </button>
            </div>
          </div>

          <div className="relative min-h-[440px] flex items-center justify-center p-6 bg-black/60">
            <img
              src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80"
              alt="Studio RAW Preview"
              className="max-h-[400px] w-auto object-contain rounded-xl shadow-2xl"
            />

            {/* Interactive Loupe Overlay */}
            {loupeActive && (
              <div className="absolute top-8 right-8 w-56 h-56 rounded-2xl border-2 border-blue-500 bg-[#090D17] shadow-2xl overflow-hidden flex flex-col pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                <div className="h-6 bg-blue-600 text-white px-2.5 flex items-center justify-between text-[10px] font-mono font-bold">
                  <span className="flex items-center gap-1">
                    <Eye size={11} /> 1:1 Eye Focus Reticle
                  </span>
                  <span className="tabular-nums">0.01s Latency</span>
                </div>
                <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=500&q=95"
                    alt="100% Loupe"
                    className="w-full h-full object-cover scale-150"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 border-2 border-emerald-400 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    </div>
                  </div>
                </div>
                <div className="h-5 bg-black/90 px-2.5 flex items-center justify-between text-[9px] font-mono text-emerald-400">
                  <span>Right Eye AF Locked</span>
                  <span className="font-bold">PIN SHARP 100%</span>
                </div>
              </div>
            )}

            {/* Camera EXIF Floating HUD */}
            <div className="absolute bottom-8 left-8 px-4 py-2.5 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-300 space-y-1 shadow-xl">
              <div className="flex items-center gap-2 text-white font-bold">
                <Camera size={13} className="text-blue-400" />
                <span>SONY ILCE-7M4</span>
                <span className="text-slate-500">|</span>
                <span>FE 50mm F1.4 GM</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                <span className="text-blue-400 font-bold tabular-nums">1/4000s</span>
                <span>f/1.4</span>
                <span className="tabular-nums">ISO 100</span>
                <span className="text-emerald-400">60 FPS Hardware Render</span>
              </div>
            </div>

            {/* Star Rating Interactive HUD */}
            <div className="absolute bottom-8 right-8 p-3 rounded-xl bg-[#0B0F1A]/90 backdrop-blur-md border border-white/10 flex items-center gap-3 shadow-xl">
              <span className="text-xs font-mono text-slate-400">{isVi ? "Đánh giá:" : "Rating:"}</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setActiveStar(star)}
                    className={`p-1 rounded cursor-pointer transition-colors duration-150 ${
                      star <= activeStar ? "text-amber-400 fill-amber-400" : "text-slate-600 hover:text-amber-300"
                    }`}
                  >
                    <Star size={16} className={star <= activeStar ? "fill-current" : ""} />
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">★ {activeStar}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Deep Features Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {isVi ? "Những Đột Phá Thiết Thực Cho Thợ Ảnh" : "Essential Breakthroughs for Professional Editors"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {isVi
              ? "Không màu mè, từng tính năng đều được tối ưu cho tốc độ và thao tác tay của thợ lọc ảnh."
              : "Zero unnecessary bloat. Every optimization is engineered for maximum hand speed and precision."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((item, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl bg-white dark:bg-[#0E1422] border border-slate-200 dark:border-white/[0.08] hover:border-slate-300 dark:hover:border-blue-500/30 transition-colors duration-200 flex flex-col justify-between space-y-4 shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <div className="text-right">
                    <span className="text-base font-mono font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
                      {item.stat}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block">
                      {item.statLabel}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. RAW Format Support Matrix */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#0E1422] p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-white/[0.06] pb-4">
            <Cpu size={18} className="text-blue-500" />
            <h3 className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              {isVi ? "Ma Trận Định Dạng Tương Thích (Hardware LibRaw Support)" : "Hardware Compatibility Matrix (LibRaw Native Support)"}
            </h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04] text-xs sm:text-sm font-mono">
            {supportedFormats.map((item, idx) => (
              <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-blue-600 dark:text-blue-400 font-bold min-w-36">{item.brand}</span>
                <span className="text-slate-700 dark:text-slate-300">{item.formats}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Bottom Action */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4 pt-4">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isVi ? "Sẵn sàng lọc ảnh với tốc độ 60 FPS mượt mà?" : "Ready to cull shoots with silky 60 FPS fluidity?"}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {isVi
            ? "Tải về dùng thử đầy đủ 100% tính năng trong 7 ngày trên macOS và Windows."
            : "Download and evaluate full unrestricted features for 7 days on macOS and Windows."}
        </p>
        <div className="flex justify-center gap-3 pt-3">
          <Link
            to="/download"
            className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors duration-150 whitespace-nowrap shadow-sm"
          >
            {isVi ? "Tải Ngay Bản Cài Đặt" : "Download Native Build"}
          </Link>
          <Link
            to="/pricing"
            className="px-5 py-3.5 rounded-2xl bg-white dark:bg-[#0E1422] hover:bg-slate-100 dark:hover:bg-[#161F33] text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition-colors duration-150 border border-slate-200 dark:border-white/[0.08] whitespace-nowrap shadow-sm"
          >
            {isVi ? "Xem Bảng Giá Tham Khảo" : "Reference Pricing"}
          </Link>
        </div>
      </section>
    </div>
  );
}
