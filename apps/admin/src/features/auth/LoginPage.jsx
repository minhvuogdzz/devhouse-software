import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { useAuth } from '../../lib/auth-context.jsx';
import { useI18n } from '../../lib/i18n.jsx';
import { useTheme } from '../../lib/theme.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Logo } from '../../components/ui/Logo.jsx';
import { Lock, Sun, Moon, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/';

  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(
        err.message ||
          (locale === 'en' ? 'Invalid credentials' : 'Tài khoản hoặc mật khẩu không chính xác'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-bg text-fg relative">
      {/* Top right language & theme switches */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="flex items-center bg-surface-sunken p-1 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setLocale('vi')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              locale === 'vi' ? 'bg-surface text-primary shadow-xs font-bold' : 'text-fg-muted'
            }`}
          >
            VI
          </button>
          <button
            type="button"
            onClick={() => setLocale('en')}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              locale === 'en' ? 'bg-surface text-primary shadow-xs font-bold' : 'text-fg-muted'
            }`}
          >
            EN
          </button>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-sunken cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-warning" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Logo className="w-14 h-14 mx-auto" alt="Devhouse CMS" />
          <h1 className="text-2xl font-bold font-display text-fg tracking-tight">Devhouse CMS</h1>
          <p className="text-xs text-fg-muted">{t('auth.loginTitle')}</p>
        </div>

        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-danger-subtle text-danger border border-danger/20 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Input
              label={t('auth.email')}
              type="email"
              required
              autoComplete="username"
              placeholder="admin@devhouse.com.vn"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            <Input
              label={t('auth.password')}
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-fg-muted hover:text-fg">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <span>{t('auth.rememberMe')}</span>
              </label>

              <Link
                to="/forgot-password"
                className="text-primary hover:text-primary-hover font-semibold transition-colors"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              <Lock className="w-4 h-4 mr-1.5" />
              {isLoading ? t('auth.loggingIn') : t('auth.loginButton')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
