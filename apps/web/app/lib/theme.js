import { useState, useEffect } from 'react';

export const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('dh-theme');
    var theme = stored;
    if (!theme || theme === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export function useTheme() {
  const [theme, setTheme] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');

  useEffect(() => {
    const stored = localStorage.getItem('dh-theme') || 'system';
    setTheme(stored);
    const isDark =
      stored === 'dark' ||
      (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setResolvedTheme(isDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('dh-theme', next);
    setTheme(next);
    setResolvedTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return { theme, resolvedTheme, toggleTheme };
}
