import React, { createContext, useContext, useState } from 'react';

const translations = {
  vi: {
    nav: {
      dashboard: 'Bảng điều khiển',
      pages: 'Trang tĩnh',
      services: 'Dịch vụ',
      solutions: 'Giải pháp',
      projects: 'Dự án',
      technologies: 'Công nghệ',
      categories: 'Danh mục',
      blog: 'Bài viết Blog',
      tags: 'Thẻ tag',
      authors: 'Tác giả',
      media: 'Thư viện Media',
      contact: 'Yêu cầu liên hệ',
      navigation: 'Menu điều hướng',
      settings: 'Cài đặt hệ thống',
      redirects: 'Quản lý Điều hướng',
      users: 'Người dùng',
      roles: 'Vai trò & Quyền',
      audit: 'Nhật ký kiểm toán',
      account: 'Tài khoản của tôi',
    },
    common: {
      actions: 'Thao tác',
      create: 'Tạo mới',
      edit: 'Chỉnh sửa',
      delete: 'Xóa',
      restore: 'Khôi phục',
      save: 'Lưu thay đổi',
      saving: 'Đang lưu...',
      cancel: 'Hủy bỏ',
      search: 'Tìm kiếm...',
      filter: 'Lọc',
      all: 'Tất cả',
      status: 'Trạng thái',
      draft: 'Bản nháp',
      published: 'Đã xuất bản',
      archived: 'Đã lưu trữ',
      loading: 'Đang tải dữ liệu...',
      noData: 'Chưa có bản ghi nào.',
      confirmDelete: 'Bạn có chắc chắn muốn xóa mục này?',
      success: 'Thành công',
      error: 'Đã có lỗi xảy ra',
      logout: 'Đăng xuất',
      order: 'Thứ tự',
      preview: 'Xem trước',
      refresh: 'Làm mới',
      back: 'Quay lại',
      close: 'Đóng',
    },
    auth: {
      loginTitle: 'Đăng nhập Hệ thống Quản trị',
      email: 'Địa chỉ Email',
      password: 'Mật khẩu',
      loginButton: 'Đăng nhập',
      loggingIn: 'Đang xác thực...',
      forgotPassword: 'Quên mật khẩu?',
      rememberMe: 'Ghi nhớ đăng nhập',
    },
    dashboard: {
      title: 'Bảng điều khiển Tổng quan',
      subtitle: 'Theo dõi tổng thể trạng thái nội dung và yêu cầu liên hệ mới.',
      newContacts: 'Liên hệ mới',
      totalServices: 'Dịch vụ',
      totalProjects: 'Dự án',
      totalPosts: 'Bài viết blog',
      recentContacts: 'Yêu cầu liên hệ mới nhất',
      recentActivity: 'Hoạt động gần đây',
    },
  },
  en: {
    nav: {
      dashboard: 'Dashboard',
      pages: 'Static Pages',
      services: 'Services',
      solutions: 'Solutions',
      projects: 'Projects',
      technologies: 'Technologies',
      categories: 'Categories',
      blog: 'Blog Posts',
      tags: 'Tags',
      authors: 'Authors',
      media: 'Media Library',
      contact: 'Contact Inquiries',
      navigation: 'Navigation Menus',
      settings: 'Site Settings',
      redirects: 'Redirect Rules',
      users: 'User Accounts',
      roles: 'Roles & RBAC',
      audit: 'Audit Logs',
      account: 'My Account',
    },
    common: {
      actions: 'Actions',
      create: 'Create New',
      edit: 'Edit',
      delete: 'Delete',
      restore: 'Restore',
      save: 'Save Changes',
      saving: 'Saving...',
      cancel: 'Cancel',
      search: 'Search...',
      filter: 'Filter',
      all: 'All',
      status: 'Status',
      draft: 'Draft',
      published: 'Published',
      archived: 'Archived',
      loading: 'Loading data...',
      noData: 'No records found.',
      confirmDelete: 'Are you sure you want to delete this item?',
      success: 'Success',
      error: 'An error occurred',
      logout: 'Sign Out',
      order: 'Order',
      preview: 'Preview',
      refresh: 'Refresh',
      back: 'Back',
      close: 'Close',
    },
    auth: {
      loginTitle: 'Sign In to Dev House CMS',
      email: 'Email Address',
      password: 'Password',
      loginButton: 'Sign In',
      loggingIn: 'Authenticating...',
      forgotPassword: 'Forgot password?',
      rememberMe: 'Remember me',
    },
    dashboard: {
      title: 'CMS Operational Dashboard',
      subtitle: 'Overview of catalog entities, active publications, and incoming inquiries.',
      newContacts: 'New Inquiries',
      totalServices: 'Services',
      totalProjects: 'Projects',
      totalPosts: 'Blog Articles',
      recentContacts: 'Recent Inquiries',
      recentActivity: 'Recent Audit Logs',
    },
  },
};

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    try {
      return localStorage.getItem('dh-admin-locale') || 'vi';
    } catch {
      return 'vi';
    }
  });

  const setLocale = newLocale => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem('dh-admin-locale', newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      /* ignore storage error */
    }
  };

  const t = key => {
    const keys = key.split('.');
    let curr = translations[locale] || translations.vi;
    for (const k of keys) {
      if (curr && typeof curr === 'object' && k in curr) {
        curr = curr[k];
      } else {
        return key;
      }
    }
    return typeof curr === 'string' ? curr : key;
  };

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
