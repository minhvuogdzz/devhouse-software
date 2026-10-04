export interface ReleaseAsset {
  name: string;
  url: string;
  size: number;
  formattedSize: string;
}

export interface LatestRelease {
  version: string;
  tagName: string;
  name: string;
  publishedAt: string;
  releaseNotes: string;
  downloads: {
    macArm64: ReleaseAsset;
    macIntel: ReleaseAsset;
    windows: ReleaseAsset;
  };
}
