import { Logo } from '../ui/Logo.jsx';
import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../lib/auth-context.jsx';
import { useTheme } from '../../lib/theme.js';
import { useI18n } from '../../lib/i18n.jsx';
import { hasPermission } from '../../lib/permissions.js';
import {
  LayoutDashboard,
  FileText,
  Layers,
  Cpu,
  Briefcase,
  Boxes,
  FolderTree,
  BookOpen,
  Tag,
  Users as UsersIcon,
  Image as ImageIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Compass,
  Inbox,
  UserCheck,
  ShieldAlert,
  History,
  User,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  X,
} from 'lucide-react';

export function AdminShell() {
  const { user, permissions, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navSections = [
    {
      title: locale === 'en' ? 'Core' : 'Tổng quan',
      items: [
        {
          to: '/',
          label: t('nav.dashboard'),
          icon: LayoutDashboard,
          permission: 'dashboard:read',
          end: true,
        },
      ],
    },
    {
      title: locale === 'en' ? 'Content & Catalog' : 'Nội dung & Danh mục',
      items: [
        { to: '/content/pages', label: t('nav.pages'), icon: FileText, permission: 'pages:read' },
        { to: '/services', label: t('nav.services'), icon: Layers, permission: 'services:read' },
        { to: '/solutions', label: t('nav.solutions'), icon: Boxes, permission: 'solutions:read' },
        { to: '/projects', label: t('nav.projects'), icon: Briefcase, permission: 'projects:read' },
        {
          to: '/technologies',
          label: t('nav.technologies'),
          icon: Cpu,
          permission: 'technologies:read',
        },
        {
          to: '/categories/service',
          label: t('nav.categories'),
          icon: FolderTree,
          permission: 'categories:read',
        },
        { to: '/blog/posts', label: t('nav.blog'), icon: BookOpen, permission: 'blog:read' },
        { to: '/blog/tags', label: t('nav.tags'), icon: Tag, permission: 'tags:read' },
        {
          to: '/blog/authors',
          label: t('nav.authors'),
          icon: UserCheck,
          permission: 'authors:read',
        },
        { to: '/media', label: t('nav.media'), icon: ImageIcon, permission: 'media:read' },
      ],
    },
    {
      title: locale === 'en' ? 'Site Configuration' : 'Cấu hình Hệ thống',
      items: [
        {
          to: '/navigation',
          label: t('nav.navigation'),
          icon: MenuIcon,
          permission: 'navigation:read',
        },
        {
          to: '/settings/company',
          label: t('nav.settings'),
          icon: SettingsIcon,
          permission: 'settings:read',
        },
        {
          to: '/seo/redirects',
          label: t('nav.redirects'),
          icon: Compass,
          permission: 'redirects:read',
        },
      ],
    },
    {
      title: locale === 'en' ? 'Operations' : 'Vận hành & Quản trị',
      items: [
        {
          to: '/contact-requests',
          label: t('nav.contact'),
          icon: Inbox,
          permission: 'contact:read',
        },
        { to: '/users', label: t('nav.users'), icon: UsersIcon, permission: 'users:read' },
        { to: '/roles', label: t('nav.roles'), icon: ShieldAlert, permission: 'roles:read' },
        { to: '/audit-logs', label: t('nav.audit'), icon: History, permission: 'audit:read' },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderNavLinks = () => (
    <div className="space-y-6">
      {navSections.map((section, sIdx) => {
        const visibleItems = section.items.filter(
          item => !item.permission || hasPermission(permissions, item.permission),
        );
        if (visibleItems.length === 0) return null;

        return (
          <div key={sIdx} className="space-y-1">
            <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-fg-subtle">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {visibleItems.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-primary text-primary-fg shadow-xs'
                          : 'text-fg-muted hover:text-fg hover:bg-surface-sunken'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen flex bg-bg text-fg">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-surface shrink-0 h-screen sticky top-0 overflow-y-auto">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo className="h-8 w-auto" />
            <div className="leading-tight">
              <span className="font-bold text-sm text-fg tracking-tight block">Dev House</span>
              <span className="text-[10px] text-fg-subtle font-medium block">Administration</span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-4 py-5">{renderNavLinks()}</div>

        {/* Footer Account Link */}
        <div className="p-4 border-t border-border bg-surface-raised/30">
          <NavLink
            to="/account"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-primary text-primary-fg'
                  : 'text-fg-muted hover:text-fg hover:bg-surface-sunken'
              }`
            }
          >
            <User className="w-4 h-4 shrink-0" />
            <div className="truncate flex-1">
              <span className="block truncate font-bold text-xs">{user?.name || user?.email}</span>
              <span className="block text-[10px] text-fg-subtle uppercase">
                {user?.role?.name || 'Admin'}
              </span>
            </div>
          </NavLink>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-fg/50 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="relative flex flex-col w-72 max-w-full bg-surface border-r border-border h-full overflow-y-auto z-10 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <span className="font-bold text-base font-display">Dev House CMS</span>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md text-fg-muted hover:text-fg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 py-4">{renderNavLinks()}</div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-sunken"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-fg-subtle hidden sm:inline-block">
              Dev House CMS / {location.pathname}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switch */}
            <div className="flex items-center bg-surface-sunken p-1 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLocale('vi')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  locale === 'vi'
                    ? 'bg-surface text-primary shadow-xs font-bold'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                VI
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                  locale === 'en'
                    ? 'bg-surface text-primary shadow-xs font-bold'
                    : 'text-fg-muted hover:text-fg'
                }`}
              >
                EN
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-sunken transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-warning" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(prev => !prev)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-sunken transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-primary-subtle text-primary font-bold text-xs flex items-center justify-center">
                  {(user?.name || user?.email || 'A')[0].toUpperCase()}
                </div>
                <span className="text-xs font-semibold text-fg hidden md:inline-block">
                  {user?.name || user?.email}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-fg-subtle" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-surface border border-border shadow-lg py-1.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-border/50">
                    <p className="font-semibold text-fg truncate">{user?.name}</p>
                    <p className="text-fg-subtle truncate text-[11px]">{user?.email}</p>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-fg hover:bg-surface-raised transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>{t('nav.account')}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-danger hover:bg-danger-subtle transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('common.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Viewport Outlet */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
