import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { RequireAuth } from '../components/layout/RequireAuth.jsx';
import { RequirePermission } from '../components/layout/RequirePermission.jsx';
import { AdminShell } from '../components/layout/AdminShell.jsx';

// Auth
import LoginPage from '../features/auth/LoginPage.jsx';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../features/auth/ResetPasswordPage.jsx';

// Dashboard
import DashboardPage from '../features/dashboard/DashboardPage.jsx';

// Pages
import PageListPage from '../features/pages/PageListPage.jsx';
import PageEditorPage from '../features/pages/PageEditorPage.jsx';

// Catalog
import ServiceListPage from '../features/services/ServiceListPage.jsx';
import ServiceEditorPage from '../features/services/ServiceEditorPage.jsx';
import SolutionListPage from '../features/solutions/SolutionListPage.jsx';
import SolutionEditorPage from '../features/solutions/SolutionEditorPage.jsx';
import ProjectListPage from '../features/projects/ProjectListPage.jsx';
import ProjectEditorPage from '../features/projects/ProjectEditorPage.jsx';
import TechnologyListPage from '../features/technologies/TechnologyListPage.jsx';
import TechnologyEditorPage from '../features/technologies/TechnologyEditorPage.jsx';
import CategoryManagerPage from '../features/categories/CategoryManagerPage.jsx';

// Blog
import PostListPage from '../features/blog/PostListPage.jsx';
import PostEditorPage from '../features/blog/PostEditorPage.jsx';
import TagManagerPage from '../features/blog/TagManagerPage.jsx';
import AuthorManagerPage from '../features/blog/AuthorManagerPage.jsx';

// Media
import MediaLibraryPage from '../features/media/MediaLibraryPage.jsx';

// Contact
import ContactRequestListPage from '../features/contact-requests/ContactRequestListPage.jsx';
import ContactRequestDetailPage from '../features/contact-requests/ContactRequestDetailPage.jsx';

// Settings & Navigation & Redirects
import NavigationManagerPage from '../features/navigation/NavigationManagerPage.jsx';
import SettingsPage from '../features/settings/SettingsPage.jsx';
import RedirectManagerPage from '../features/redirects/RedirectManagerPage.jsx';

// Access Control & Audit
import UserListPage from '../features/users/UserListPage.jsx';
import UserEditorPage from '../features/users/UserEditorPage.jsx';
import RoleListPage from '../features/roles/RoleListPage.jsx';
import RoleEditorPage from '../features/roles/RoleEditorPage.jsx';
import AuditLogListPage from '../features/audit-logs/AuditLogListPage.jsx';

// Account & Errors
import AccountPage from '../features/account/AccountPage.jsx';
import ForbiddenPage from '../features/errors/ForbiddenPage.jsx';
import NotFoundPage from '../features/errors/NotFoundPage.jsx';

export const router = createBrowserRouter([
  // Public auth routes
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },

  // Protected admin routes
  {
    path: '/',
    element: (
      <RequireAuth>
        <AdminShell />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <RequirePermission permission="dashboard:read">
            <DashboardPage />
          </RequirePermission>
        ),
      },
      {
        path: 'pages',
        element: (
          <RequirePermission permission="pages:read">
            <PageListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'pages/:key',
        element: (
          <RequirePermission permission="pages:read">
            <PageEditorPage />
          </RequirePermission>
        ),
      },
      {
        path: 'services',
        element: (
          <RequirePermission permission="services:read">
            <ServiceListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'services/:id',
        element: (
          <RequirePermission permission="services:read">
            <ServiceEditorPage />
          </RequirePermission>
        ),
      },
      {
        path: 'solutions',
        element: (
          <RequirePermission permission="solutions:read">
            <SolutionListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'solutions/:id',
        element: (
          <RequirePermission permission="solutions:read">
            <SolutionEditorPage />
          </RequirePermission>
        ),
      },
      {
        path: 'projects',
        element: (
          <RequirePermission permission="projects:read">
            <ProjectListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'projects/:id',
        element: (
          <RequirePermission permission="projects:read">
            <ProjectEditorPage />
          </RequirePermission>
        ),
      },
      {
        path: 'technologies',
        element: (
          <RequirePermission permission="technologies:read">
            <TechnologyListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'technologies/:id',
        element: (
          <RequirePermission permission="technologies:read">
            <TechnologyEditorPage />
          </RequirePermission>
        ),
      },
      {
        path: 'categories',
        element: (
          <RequirePermission permission="categories:read">
            <CategoryManagerPage />
          </RequirePermission>
        ),
      },
      {
        path: 'categories/:type',
        element: (
          <RequirePermission permission="categories:read">
            <CategoryManagerPage />
          </RequirePermission>
        ),
      },
      {
        path: 'blog',
        element: (
          <RequirePermission permission="blog:read">
            <PostListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'blog/tags',
        element: (
          <RequirePermission permission="tags:read">
            <TagManagerPage />
          </RequirePermission>
        ),
      },
      {
        path: 'blog/authors',
        element: (
          <RequirePermission permission="authors:read">
            <AuthorManagerPage />
          </RequirePermission>
        ),
      },
      {
        path: 'blog/:id',
        element: (
          <RequirePermission permission="blog:read">
            <PostEditorPage />
          </RequirePermission>
        ),
      },
      {
        path: 'media',
        element: (
          <RequirePermission permission="media:read">
            <MediaLibraryPage />
          </RequirePermission>
        ),
      },
      {
        path: 'contact-requests',
        element: (
          <RequirePermission permission="contact:read">
            <ContactRequestListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'contact-requests/:id',
        element: (
          <RequirePermission permission="contact:read">
            <ContactRequestDetailPage />
          </RequirePermission>
        ),
      },
      {
        path: 'navigation',
        element: (
          <RequirePermission permission="navigation:read">
            <NavigationManagerPage />
          </RequirePermission>
        ),
      },
      {
        path: 'settings',
        element: (
          <RequirePermission permission="settings:read">
            <SettingsPage />
          </RequirePermission>
        ),
      },
      {
        path: 'redirects',
        element: (
          <RequirePermission permission="redirects:read">
            <RedirectManagerPage />
          </RequirePermission>
        ),
      },
      {
        path: 'users',
        element: (
          <RequirePermission permission="users:read">
            <UserListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'users/:id',
        element: (
          <RequirePermission permission="users:read">
            <UserEditorPage />
          </RequirePermission>
        ),
      },
      {
        path: 'roles',
        element: (
          <RequirePermission permission="roles:read">
            <RoleListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'roles/:id',
        element: (
          <RequirePermission permission="roles:read">
            <RoleEditorPage />
          </RequirePermission>
        ),
      },
      {
        path: 'audit-logs',
        element: (
          <RequirePermission permission="audit:read">
            <AuditLogListPage />
          </RequirePermission>
        ),
      },
      {
        path: 'account',
        element: <AccountPage />,
      },
      {
        path: '403',
        element: <ForbiddenPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
