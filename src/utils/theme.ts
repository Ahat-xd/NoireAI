import { ThemeMode } from '../types';

const THEME_KEY = 'noire_ai_theme';

export function getSavedTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch (e) {
    console.error('Error reading theme', e);
  }
  return 'dark'; // Default to sleek Noire dark
}

export function applyTheme(theme: ThemeMode) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    console.error('Error saving theme', e);
  }

  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
  }
}
