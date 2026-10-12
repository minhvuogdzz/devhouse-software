import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api-client.js';
import { Input, Select } from '../ui/Input.jsx';

/**
 * Built-in static paths on the website with their Vietnamese and English labels
 * and the corresponding Home page featured section key (if applicable).
 */
export const STATIC_SITE_PATHS = [
  {
    group: 'Trang chính (Menu điều hướng)',
    path: '/',
    label: { vi: 'Trang chủ', en: 'Home' },
    homeSectionKey: 'hero',
  },
  {
    group: 'Trang chính (Menu điều hướng)',
    path: '/services',
    label: { vi: 'Dịch vụ', en: 'Services' },
    homeSectionKey: 'servicesIntro',
  },
  {
    group: 'Trang chính (Menu điều hướng)',
    path: '/packages',
    label: { vi: 'Bảng Giá & Gói Cước', en: 'Pricing & Packages' },
    homeSectionKey: 'packagesIntro',
  },
  {
    group: 'Trang chính (Menu điều hướng)',
    path: '/products',
    label: { vi: 'Mẫu website', en: 'Templates' },
    homeSectionKey: 'productsIntro',
  },
  {
    group: 'Trang chính (Menu điều hướng)',
    path: '/projects',
    label: { vi: 'Dự án', en: 'Projects' },
    homeSectionKey: 'projectsIntro',
  },
  {
    group: 'Trang chính (Menu điều hướng)',
    path: '/solutions',
    label: { vi: 'Giải pháp', en: 'Solutions' },
    homeSectionKey: 'solutionsIntro',
  },
  {
    group: 'Trang chính (Menu điều hướng)',
    path: '/technologies',
    label: { vi: 'Công nghệ', en: 'Technologies' },
    homeSectionKey: 'technologiesIntro',
  },
  {
    group: 'Trang chính (Menu điều hướng)',
    path: '/#process',
    label: { vi: 'Quy trình', en: 'How we work' },
    homeSectionKey: 'process',
  },
  {
    group: 'Trang chính (Menu điều hướng)',
    path: '/about',
    label: { vi: 'Về Devhouse', en: 'About Devhouse' },
    homeSectionKey: 'aboutIntro',
  },
  {
    group: 'Trang chính (Menu điều hướng)',
    path: '/blog',
    label: { vi: 'Bài viết / Tin tức', en: 'Tech Blog' },
    homeSectionKey: 'blogIntro',
  },
  {
    group: 'Trang chính (Menu điều hướng)',
    path: '/careers',
    label: { vi: 'Tuyển dụng', en: 'Careers' },
    homeSectionKey: 'careersIntro',
  },
  {
    group: 'Trang chính (Menu điều hướng)',
    path: '/contact',
    label: { vi: 'Liên hệ', en: 'Contact' },
    homeSectionKey: 'cta',
  },
  {
    group: 'Trang Dịch vụ chi tiết',
    path: '/services/thiet-ke-website',
    label: { vi: 'Thiết kế website & Shopify', en: 'Website & Shopify Design' },
  },
  {
    group: 'Trang Dịch vụ chi tiết',
    path: '/services/may-chu-va-ha-tang-dam-may',
    label: { vi: 'Hạ tầng Cloud & DevSecOps', en: 'Cloud & DevSecOps' },
  },
  {
    group: 'Trang Dịch vụ chi tiết',
    path: '/services/ten-mien-va-dns',
    label: { vi: 'Tên miền và DNS', en: 'Domain and DNS' },
  },
  {
    group: 'Trang Dịch vụ chi tiết',
    path: '/services/bao-mat-va-ho-tro',
    label: { vi: 'Bảo mật và hỗ trợ định kỳ', en: 'Security & Maintenance' },
  },
  {
    group: 'Trang Pháp lý & Chính sách',
    path: '/terms',
    label: { vi: 'Điều khoản dịch vụ', en: 'Terms of Service' },
  },
  {
    group: 'Trang Pháp lý & Chính sách',
    path: '/privacy',
    label: { vi: 'Chính sách bảo mật', en: 'Privacy Policy' },
  },
];

export const PATH_TO_HOME_SECTION = Object.fromEntries(
  STATIC_SITE_PATHS.filter(item => item.homeSectionKey && item.path !== '/').map(item => [
    item.path,
    item.homeSectionKey,
  ]),
);

let cachedDynamicPaths = null;
let pendingFetch = null;

function extractSlug(item) {
  if (!item?.slug) return '';
  if (typeof item.slug === 'string') return item.slug;
  return item.slug.vi || item.slug.en || '';
}

function extractLabel(item) {
  const src = item?.name || item?.title;
  if (!src) return { vi: '', en: '' };
  if (typeof src === 'string') return { vi: src, en: src };
  return { vi: src.vi || src.en || '', en: src.en || src.vi || '' };
}

async function fetchDynamicSitePaths() {
  if (cachedDynamicPaths) return cachedDynamicPaths;
  if (pendingFetch) return pendingFetch;

  pendingFetch = Promise.allSettled([
    apiClient('/admin/services?limit=100'),
    apiClient('/admin/projects?limit=100'),
    apiClient('/admin/solutions?limit=100'),
  ]).then(([servicesRes, projectsRes, solutionsRes]) => {
    const dynamic = [];
    const seen = new Set(STATIC_SITE_PATHS.map(p => p.path));

    if (servicesRes.status === 'fulfilled') {
      for (const s of servicesRes.value?.data || []) {
        const slug = extractSlug(s);
        const path = slug ? `/services/${slug}` : '';
        if (path && !seen.has(path)) {
          seen.add(path);
          dynamic.push({
            group: 'Trang Dịch vụ chi tiết',
            path,
            label: extractLabel(s),
          });
        }
      }
    }

    if (projectsRes.status === 'fulfilled') {
      for (const p of projectsRes.value?.data || []) {
        const slug = extractSlug(p);
        const path = slug ? `/projects/${slug}` : '';
        if (path && !seen.has(path)) {
          seen.add(path);
          dynamic.push({
            group: 'Trang Dự án chi tiết',
            path,
            label: extractLabel(p),
          });
        }
      }
    }

    if (solutionsRes.status === 'fulfilled') {
      for (const sol of solutionsRes.value?.data || []) {
        const slug = extractSlug(sol);
        const path = slug ? `/solutions/${slug}` : '';
        if (path && !seen.has(path)) {
          seen.add(path);
          dynamic.push({
            group: 'Trang Giải pháp chi tiết',
            path,
            label: extractLabel(sol),
          });
        }
      }
    }

    cachedDynamicPaths = [...STATIC_SITE_PATHS, ...dynamic];
    pendingFetch = null;
    return cachedDynamicPaths;
  });

  return pendingFetch;
}

export function useSitePaths() {
  const [paths, setPaths] = useState(cachedDynamicPaths || STATIC_SITE_PATHS);

  useEffect(() => {
    let active = true;
    fetchDynamicSitePaths().then(list => {
      if (active && list) setPaths(list);
    });
    return () => {
      active = false;
    };
  }, []);

  return paths;
}

/**
 * Input field for a `/path` or URL, paired with a categorized dropdown list and quick-select
 * chips so admins never have to memorize route paths.
 */
export function PathPickerInput({
  label = 'Đường dẫn (/path)',
  value = '',
  onChange,
  onSelectOption,
  placeholder = '/services hoặc https://…',
  showQuickChips = true,
}) {
  const allPaths = useSitePaths();

  const groups = allPaths.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {});

  const handlePick = selectedPath => {
    if (!selectedPath) return;
    onChange(selectedPath);
    if (onSelectOption) {
      const found = allPaths.find(p => p.path === selectedPath);
      if (found) onSelectOption(found);
    }
  };

  const mainNavOptions = STATIC_SITE_PATHS.filter(
    item => item.group === 'Trang chính (Menu điều hướng)',
  );

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <Input
          label={label}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <Select
          label="Chọn nhanh /path có sẵn trên website"
          value={allPaths.some(p => p.path === value) ? value : ''}
          onChange={e => handlePick(e.target.value)}
        >
          <option value="">-- Chọn đường dẫn /path từ danh sách --</option>
          {Object.entries(groups).map(([groupName, items]) => (
            <optgroup key={groupName} label={groupName}>
              {items.map(item => (
                <option key={item.path} value={item.path}>
                  {item.path} — {item.label.vi} ({item.label.en})
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </div>

      {showQuickChips && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-medium text-fg-subtle mr-1">Gợi ý nhanh:</span>
          {mainNavOptions.map(option => {
            const isSelected = value === option.path;
            return (
              <button
                key={option.path}
                type="button"
                onClick={() => handlePick(option.path)}
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-fg'
                    : 'border-border bg-surface-sunken/70 text-fg-muted hover:border-primary/50 hover:text-fg'
                }`}
                title={`${option.label.vi} (${option.path})`}
              >
                <span>{option.path}</span>
                <span className={isSelected ? 'text-primary-fg/80' : 'text-fg-subtle'}>
                  · {option.label.vi}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
