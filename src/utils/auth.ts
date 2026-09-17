import { UserAccount } from '../types';

const USERS_STORAGE_KEY = 'noire_ai_users';
const CURRENT_USER_KEY = 'noire_ai_current_user';

// Pre-seeded default demo account
const INITIAL_DEMO_USERS = [
  {
    id: 'user-demo-1',
    name: 'Алексей',
    email: 'alex@noire.ai',
    password: 'password123',
    avatarColor: 'bg-emerald-600',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-demo-2',
    name: 'Елена Смирнова',
    email: 'elena@noire.ai',
    password: 'password123',
    avatarColor: 'bg-indigo-600',
    createdAt: new Date().toISOString(),
  },
];

export const GUEST_USER: UserAccount = {
  id: 'guest',
  name: 'Гость',
  email: 'guest@noire.local',
  avatarColor: 'bg-slate-600',
  createdAt: new Date().toISOString(),
};

function getUsersList(): any[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading users', e);
  }
  // Initialize with demo users
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_USERS));
  return INITIAL_DEMO_USERS;
}

export function getCurrentUser(): UserAccount {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading current user', e);
  }
  return GUEST_USER;
}

export function setCurrentUser(user: UserAccount) {
  try {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving current user', e);
  }
}

const AVATAR_COLORS = [
  'bg-indigo-600',
  'bg-sky-600',
  'bg-emerald-600',
  'bg-purple-600',
  'bg-rose-600',
  'bg-amber-600',
  'bg-cyan-600',
];

export function loginUser(emailOrName: string, password: string): { user?: UserAccount; error?: string } {
  const users = getUsersList();
  const found = users.find(
    (u) =>
      (u.email.toLowerCase() === emailOrName.trim().toLowerCase() ||
        u.name.toLowerCase() === emailOrName.trim().toLowerCase()) &&
      u.password === password
  );

  if (!found) {
    return { error: 'Неверное имя пользователя/email или пароль.' };
  }

  const userAccount: UserAccount = {
    id: found.id,
    name: found.name,
    email: found.email,
    avatarColor: found.avatarColor || 'bg-indigo-600',
    createdAt: found.createdAt,
  };

  setCurrentUser(userAccount);
  return { user: userAccount };
}

export function registerUser(name: string, email: string, password: string): { user?: UserAccount; error?: string } {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName) {
    return { error: 'Введите имя.' };
  }
  if (!trimmedEmail || !trimmedEmail.includes('@')) {
    return { error: 'Введите корректный email.' };
  }
  if (!password || password.length < 4) {
    return { error: 'Пароль должен содержать минимум 4 символа.' };
  }

  const users = getUsersList();
  const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);
  if (existing) {
    return { error: 'Пользователь с таким email уже зарегистрирован.' };
  }

  const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const newUser = {
    id: `user-${Date.now()}`,
    name: trimmedName,
    email: trimmedEmail,
    password,
    avatarColor: randomColor,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  const userAccount: UserAccount = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    avatarColor: newUser.avatarColor,
    createdAt: newUser.createdAt,
  };

  setCurrentUser(userAccount);
  return { user: userAccount };
}

export function logoutUser(): UserAccount {
  setCurrentUser(GUEST_USER);
  return GUEST_USER;
}

export interface OAuthResult {
  success: boolean;
  user?: UserAccount;
  error?: string;
  unconfigured?: boolean;
  requiredEnvVars?: string[];
  redirectUri?: string;
}

export function openOAuthPopup(url: string, providerName: string): Promise<{ success: boolean; user?: UserAccount; error?: string }> {
  return new Promise((resolve) => {
    const width = 520;
    const height = 660;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      `oauth_${providerName}_${Date.now()}`,
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      resolve({
        success: false,
        error: 'Всплывающее окно заблокировано браузером. Пожалуйста, разрешите всплывающие окна в настройках браузера.',
      });
      return;
    }

    let resolved = false;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.user) {
        window.removeEventListener('message', handleMessage);
        clearInterval(checkClosedInterval);
        resolved = true;
        resolve({ success: true, user: event.data.user });
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        window.removeEventListener('message', handleMessage);
        clearInterval(checkClosedInterval);
        resolved = true;
        resolve({ success: false, error: event.data.error || 'Ошибка входа' });
      }
    };

    window.addEventListener('message', handleMessage);

    const checkClosedInterval = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosedInterval);
        window.removeEventListener('message', handleMessage);
        if (!resolved) {
          resolve({ success: false, error: 'Окно авторизации было закрыто до завершения входа.' });
        }
      }
    }, 500);
  });
}

export async function loginWithOAuthProvider(provider: 'google' | 'tiktok' | 'instagram'): Promise<OAuthResult> {
  try {
    const res = await fetch(`/api/auth/${provider}/url`);
    if (!res.ok) {
      throw new Error(`Ошибка сервера (${res.status})`);
    }

    const data = await res.json();

    if (!data.configured) {
      return {
        success: false,
        unconfigured: true,
        requiredEnvVars: data.requiredEnvVars || [],
        redirectUri: data.redirectUri,
      };
    }

    const popupResult = await openOAuthPopup(data.url, provider);
    if (popupResult.success && popupResult.user) {
      // Save user to users storage & set current user
      const users = getUsersList();
      const existingIndex = users.findIndex((u) => u.id === popupResult.user!.id || u.email === popupResult.user!.email);
      if (existingIndex >= 0) {
        users[existingIndex] = { ...users[existingIndex], ...popupResult.user };
      } else {
        users.push(popupResult.user);
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      setCurrentUser(popupResult.user);
      return { success: true, user: popupResult.user };
    }

    return { success: false, error: popupResult.error || 'Не удалось завершить вход' };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Не удалось связаться с сервером авторизации' };
  }
}

export async function demoSocialLogin(provider: 'google' | 'tiktok' | 'instagram', name?: string, handle?: string): Promise<UserAccount> {
  try {
    const res = await fetch('/api/auth/demo-social-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, name, handle }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        const users = getUsersList();
        users.push(data.user);
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        setCurrentUser(data.user);
        return data.user;
      }
    }
  } catch (e) {
    console.error('Demo social login fetch failed, falling back to local creation', e);
  }

  // Fallback direct creation
  const fallbackUser: UserAccount = {
    id: `${provider}-${Date.now()}`,
    name: name || (provider === 'google' ? 'Google Пользователь' : provider === 'tiktok' ? 'TikTok Автор' : 'Instagram Профиль'),
    email: `${handle || 'user'}@${provider}.com`,
    avatarColor: provider === 'google' ? 'bg-red-500' : provider === 'tiktok' ? 'bg-slate-900' : 'bg-pink-600',
    provider,
    createdAt: new Date().toISOString(),
  };

  const users = getUsersList();
  users.push(fallbackUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  setCurrentUser(fallbackUser);
  return fallbackUser;
}
