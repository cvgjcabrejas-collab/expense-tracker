'use client';

export const dynamic = 'force-dynamic';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/hooks';
import { useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { settings, isLoading, updateSettings } = useSettings();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !settings) {
    return null;
  }

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'INR', 'MXN', 'PHP'];
  const themes = ['light', 'dark'];
  const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];

  const handleCurrencyChange = (currency: string) => {
    updateSettings.mutate({ currency });
  };

  const handleThemeChange = (theme: string) => {
    updateSettings.mutate({ theme });
    document.documentElement.classList.toggle('dark', theme === 'dark');
  };

  const handleDateFormatChange = (format: string) => {
    updateSettings.mutate({ date_format: format });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Currency */}
        <section className="mb-8 bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Currency
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {currencies.map((currency) => (
              <button
                key={currency}
                onClick={() => handleCurrencyChange(currency)}
                className={`py-2 px-3 rounded-lg font-medium transition-all ${
                  settings.currency === currency
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {currency}
              </button>
            ))}
          </div>
        </section>

        {/* Theme */}
        <section className="mb-8 bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Theme
          </h2>
          <div className="flex gap-4">
            {themes.map((theme) => (
              <button
                key={theme}
                onClick={() => handleThemeChange(theme)}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all capitalize ${
                  settings.theme === theme
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </section>

        {/* Date Format */}
        <section className="mb-8 bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Date Format
          </h2>
          <div className="space-y-2">
            {dateFormats.map((format) => (
              <button
                key={format}
                onClick={() => handleDateFormatChange(format)}
                className={`w-full text-left py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-between ${
                  settings.date_format === format
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <span>{format}</span>
                {settings.date_format === format && <Check className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </section>

        {/* Save Status */}
        {updateSettings.isPending && (
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            Saving...
          </div>
        )}
        {updateSettings.isSuccess && (
          <div className="text-center text-sm text-green-600 dark:text-green-400">
            ✓ Settings saved!
          </div>
        )}
      </main>
    </div>
  );
}
