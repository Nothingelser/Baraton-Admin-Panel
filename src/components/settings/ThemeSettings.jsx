import React, { useEffect, useState } from 'react';
import { Check, Moon, Sun } from 'lucide-react';

function ThemeSettings() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('adminTheme') || 'light';
  });
  const [compactMode, setCompactMode] = useState(() => {
    return localStorage.getItem('compactMode') === 'true' || false;
  });
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem('highContrast') === 'true' || false;
  });

  useEffect(() => {
    applyTheme(currentTheme);
    applyCompactMode(compactMode);
    applyHighContrast(highContrast);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTheme, compactMode, highContrast]);

  const applyTheme = (themeId) => {
    setCurrentTheme(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('adminTheme', themeId);

    if (themeId === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    window.dispatchEvent(new CustomEvent('themeChanged', { detail: themeId }));
  };

  const applyCompactMode = (enabled) => {
    setCompactMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('compact-mode');
    } else {
      document.documentElement.classList.remove('compact-mode');
    }
    localStorage.setItem('compactMode', enabled.toString());

    window.dispatchEvent(new CustomEvent('compactModeChanged', { detail: enabled }));
  };

  const applyHighContrast = (enabled) => {
    setHighContrast(enabled);
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('highContrast', enabled.toString());

    window.dispatchEvent(new CustomEvent('highContrastChanged', { detail: enabled }));
  };

  const themes = [
    { id: 'light', name: 'Light', icon: Sun, color: 'bg-white' },
    { id: 'dark', name: 'Dark', icon: Moon, color: 'bg-gray-800' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Theme Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Choose your preferred theme for the admin panel</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => applyTheme(theme.id)}
            className={`p-4 rounded-xl border-2 transition-all ${
              currentTheme === theme.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-lg ${theme.color} flex items-center justify-center mb-3 border ${
                  theme.id === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}
              >
                <theme.icon className={`w-6 h-6 ${theme.id === 'dark' ? 'text-white' : 'text-gray-700'}`} />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{theme.name}</span>
              {currentTheme === theme.id && (
                <div className="mt-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-4">Advanced Settings</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Compact Mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Reduce spacing for more content</p>
            </div>
            <button
              onClick={() => applyCompactMode(!compactMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                compactMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  compactMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">High Contrast</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Increase contrast for accessibility</p>
            </div>
            <button
              onClick={() => applyHighContrast(!highContrast)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                highContrast ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  highContrast ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThemeSettings;

