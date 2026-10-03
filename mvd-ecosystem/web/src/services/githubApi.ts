import { LatestRelease } from "@/types/release";

const GITHUB_REPO = "minhvuogdzz/photo-picker-pro";

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

export const FALLBACK_RELEASE: LatestRelease = {
  version: "2.6.6",
  tagName: "v2.6.6",
  name: "MVD Tech & Design Studio v2.6.6",
  publishedAt: "2026-10-01T09:26:57Z",
  releaseNotes: "- Tự động đăng xuất và làm mới phiên mỗi ngày lúc 0h00 (giờ Việt Nam).\n- Tối ưu hiệu năng đọc ảnh RAW tốc độ cao trên chip Apple Silicon.\n- Nâng cấp đồng bộ Google Sheets & Drive tự động bóc tách ảnh.\n- Cải thiện độ ổn định bộ nhớ đệm và bảo mật bản quyền offline.",
  downloads: {
    macArm64: {
      name: "MVD.T.D_2.6.6_aarch64.dmg",
      url: `https://github.com/${GITHUB_REPO}/releases/download/v2.6.6/MVD.T.D_2.6.6_aarch64.dmg`,
      size: 5274486,
      formattedSize: "5.0 MB",
    },
    macIntel: {
      name: "MVD.T.D_2.6.6_x64.dmg",
      url: `https://github.com/${GITHUB_REPO}/releases/download/v2.6.6/MVD.T.D_2.6.6_x64.dmg`,
      size: 5581967,
      formattedSize: "5.3 MB",
    },
    windows: {
      name: "MVD.T.D_2.6.6_x64-setup.exe",
      url: `https://github.com/${GITHUB_REPO}/releases/download/v2.6.6/MVD.T.D_2.6.6_x64-setup.exe`,
      size: 4827575,
      formattedSize: "4.6 MB",
    },
  },
};

export async function fetchLatestRelease(): Promise<LatestRelease> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!res.ok) {
      return FALLBACK_RELEASE;
    }

    const data = await res.json();
    const assets = (data.assets || []) as Array<{
      name: string;
      browser_download_url: string;
      size: number;
    }>;

    const findAsset = (predicate: (name: string) => boolean) => {
      const match = assets.find((a) => predicate(a.name.toLowerCase()));
      if (!match) return null;
      return {
        name: match.name,
        url: match.browser_download_url,
        size: match.size,
        formattedSize: formatBytes(match.size),
      };
    };

    const macArm64 =
      findAsset((n) => n.endsWith(".dmg") && (n.includes("aarch64") || n.includes("arm64"))) ||
      FALLBACK_RELEASE.downloads.macArm64;

    const macIntel =
      findAsset((n) => n.endsWith(".dmg") && (n.includes("x64") || n.includes("x86_64"))) ||
      FALLBACK_RELEASE.downloads.macIntel;

    const windows =
      findAsset((n) => n.endsWith(".exe") && !n.endsWith(".sig")) ||
      FALLBACK_RELEASE.downloads.windows;

    const rawTag = data.tag_name || "v2.6.6";
    const version = rawTag.startsWith("v") ? rawTag.slice(1) : rawTag;

    return {
      version,
      tagName: rawTag,
      name: data.name || `MVD Tech & Design Studio v${version}`,
      publishedAt: data.published_at || FALLBACK_RELEASE.publishedAt,
      releaseNotes: data.body && data.body.trim().length > 10 ? data.body : FALLBACK_RELEASE.releaseNotes,
      downloads: {
        macArm64,
        macIntel,
        windows,
      },
    };
  } catch {
    return FALLBACK_RELEASE;
  }
}
