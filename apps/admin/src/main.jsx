import React from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client.js';
import { I18nProvider } from './lib/i18n.jsx';
import { AuthProvider } from './lib/auth-context.jsx';
import { router } from './app/router.jsx';
import './styles/admin.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </I18nProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}
