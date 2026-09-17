import { Router, Request, Response } from 'express';

export const authRouter = Router();

export function getBaseUrl(req: Request): string {
  if (process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL') {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const host = req.get('host') || 'localhost:3000';
  const proto = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${proto}://${host}`;
}

// Check configuration status of all OAuth providers
authRouter.get('/api/auth/providers', (req: Request, res: Response) => {
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/auth/callback`;

  const providers = {
    google: {
      name: 'Google',
      configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      redirectUri,
      requiredEnvVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    },
    tiktok: {
      name: 'TikTok',
      configured: Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET),
      clientKey: process.env.TIKTOK_CLIENT_KEY || '',
      redirectUri,
      requiredEnvVars: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
    },
    instagram: {
      name: 'Instagram',
      configured: Boolean(process.env.INSTAGRAM_CLIENT_ID && process.env.INSTAGRAM_CLIENT_SECRET),
      clientId: process.env.INSTAGRAM_CLIENT_ID || '',
      redirectUri,
      requiredEnvVars: ['INSTAGRAM_CLIENT_ID', 'INSTAGRAM_CLIENT_SECRET'],
    },
  };

  res.json({ providers, redirectUri });
});

// Get provider authorization URL
authRouter.get('/api/auth/:provider/url', (req: Request, res: Response) => {
  const { provider } = req.params;
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/auth/callback`;
  const state = `${provider}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (provider === 'google') {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      res.json({
        configured: false,
        provider: 'google',
        redirectUri,
        requiredEnvVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
      });
      return;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state,
    });

    res.json({
      configured: true,
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      redirectUri,
    });
    return;
  }

  if (provider === 'tiktok') {
    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    if (!clientKey) {
      res.json({
        configured: false,
        provider: 'tiktok',
        redirectUri,
        requiredEnvVars: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
      });
      return;
    }

    const params = new URLSearchParams({
      client_key: clientKey,
      scope: 'user.info.basic',
      response_type: 'code',
      redirect_uri: redirectUri,
      state,
    });

    res.json({
      configured: true,
      url: `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`,
      redirectUri,
    });
    return;
  }

  if (provider === 'instagram') {
    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    if (!clientId) {
      res.json({
        configured: false,
        provider: 'instagram',
        redirectUri,
        requiredEnvVars: ['INSTAGRAM_CLIENT_ID', 'INSTAGRAM_CLIENT_SECRET'],
      });
      return;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'user_profile',
      state,
    });

    res.json({
      configured: true,
      url: `https://api.instagram.com/oauth/authorize?${params.toString()}`,
      redirectUri,
    });
    return;
  }

  res.status(400).json({ error: `Неизвестный провайдер: ${provider}` });
});

// Demo / Simulation Social Login for immediate testing
authRouter.post('/api/auth/demo-social-login', (req: Request, res: Response) => {
  const { provider, name, handle } = req.body;

  let profile = {
    id: `${provider}-user-${Date.now()}`,
    name: name || 'Пользователь',
    email: `${handle || 'user'}@${provider}.com`,
    avatarColor: provider === 'google' ? 'bg-red-500' : provider === 'tiktok' ? 'bg-slate-900' : 'bg-pink-600',
    provider: provider as 'google' | 'tiktok' | 'instagram',
    createdAt: new Date().toISOString(),
  };

  if (provider === 'google') {
    profile = {
      id: `google-${Date.now()}`,
      name: name || 'Google Аккаунт',
      email: `${handle || 'user.google'}@gmail.com`,
      avatarColor: 'bg-red-500',
      provider: 'google',
      createdAt: new Date().toISOString(),
    };
  } else if (provider === 'tiktok') {
    profile = {
      id: `tiktok-${Date.now()}`,
      name: name || 'TikTok Творец',
      email: `@${handle || 'noire_creator'} (TikTok)`,
      avatarColor: 'bg-black',
      provider: 'tiktok',
      createdAt: new Date().toISOString(),
    };
  } else if (provider === 'instagram') {
    profile = {
      id: `instagram-${Date.now()}`,
      name: name || 'Instagram Профиль',
      email: `@${handle || 'noire.gram'} (Instagram)`,
      avatarColor: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600',
      provider: 'instagram',
      createdAt: new Date().toISOString(),
    };
  }

  res.json({ user: profile });
});

// OAuth Callback Handler (handles /auth/callback)
export async function handleOAuthCallback(req: Request, res: Response) {
  const { code, state, error, error_description } = req.query;

  // If provider returned an error directly
  if (error) {
    const errorMsg = String(error_description || error || 'Авторизация отменена');
    sendPopupResponse(res, null, errorMsg);
    return;
  }

  if (!code) {
    sendPopupResponse(res, null, 'Код авторизации не получен.');
    return;
  }

  const provider = typeof state === 'string' ? state.split('_')[0] : 'unknown';
  const baseUrl = getBaseUrl(req);
  const redirectUri = `${baseUrl}/auth/callback`;

  try {
    let userProfile: any = null;

    if (provider === 'google') {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('GOOGLE_CLIENT_ID или GOOGLE_CLIENT_SECRET не настроены на сервере.');
      }

      // 1. Exchange code for access token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: String(code),
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenRes.ok) {
        const errJson = await tokenRes.text();
        throw new Error(`Google token error: ${errJson}`);
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;

      // 2. Fetch User Profile
      const userRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userRes.ok) {
        throw new Error('Не удалось получить данные профиля Google.');
      }

      const gUser = await userRes.json();
      userProfile = {
        id: `google-${gUser.sub}`,
        name: gUser.name || gUser.email,
        email: gUser.email,
        avatarUrl: gUser.picture,
        avatarColor: 'bg-red-500',
        provider: 'google',
        createdAt: new Date().toISOString(),
      };
    } else if (provider === 'tiktok') {
      const clientKey = process.env.TIKTOK_CLIENT_KEY;
      const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

      if (!clientKey || !clientSecret) {
        throw new Error('TIKTOK_CLIENT_KEY или TIKTOK_CLIENT_SECRET не настроены на сервере.');
      }

      const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code: String(code),
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
        }),
      });

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.data?.access_token || tokenData.access_token;

      if (!accessToken) {
        throw new Error(`TikTok token error: ${JSON.stringify(tokenData)}`);
      }

      // Fetch TikTok User Info
      const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const userData = await userRes.json();
      const tUser = userData.data?.user || {};

      userProfile = {
        id: `tiktok-${tUser.open_id || Date.now()}`,
        name: tUser.display_name || 'TikTok Пользователь',
        email: `${tUser.display_name || 'user'}@tiktok.com`,
        avatarUrl: tUser.avatar_url,
        avatarColor: 'bg-slate-900',
        provider: 'tiktok',
        createdAt: new Date().toISOString(),
      };
    } else if (provider === 'instagram') {
      const clientId = process.env.INSTAGRAM_CLIENT_ID;
      const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error('INSTAGRAM_CLIENT_ID или INSTAGRAM_CLIENT_SECRET не настроены на сервере.');
      }

      const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code: String(code),
        }),
      });

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.access_token;
      const userId = tokenData.user_id;

      if (!accessToken) {
        throw new Error(`Instagram token error: ${JSON.stringify(tokenData)}`);
      }

      // Fetch Instagram user info
      const userRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);
      const iUser = await userRes.json();

      userProfile = {
        id: `instagram-${iUser.id || userId}`,
        name: iUser.username ? `@${iUser.username}` : 'Instagram Пользователь',
        email: iUser.username ? `${iUser.username}@instagram.com` : 'instagram@noire.ai',
        avatarColor: 'bg-pink-600',
        provider: 'instagram',
        createdAt: new Date().toISOString(),
      };
    } else {
      throw new Error(`Неизвестный провайдер OAuth: ${provider}`);
    }

    sendPopupResponse(res, userProfile, null);
  } catch (err: any) {
    console.error('OAuth token exchange error:', err);
    sendPopupResponse(res, null, err.message || 'Ошибка обмена токена OAuth');
  }
}

function sendPopupResponse(res: Response, user: any | null, error: string | null) {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Авторизация Noire-AI</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #090d16;
            color: #f8fafc;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
            text-align: center;
          }
          .box {
            background: #1e293b;
            border: 1px solid #334155;
            padding: 30px;
            border-radius: 16px;
            max-width: 400px;
            box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5);
          }
          .icon { font-size: 36px; margin-bottom: 12px; }
          h2 { margin: 0 0 10px 0; font-size: 18px; }
          p { margin: 0; font-size: 14px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="box">
          ${
            error
              ? `<div class="icon">⚠️</div>
                 <h2 style="color: #f87171;">Ошибка авторизации</h2>
                 <p>${escapeHtml(error)}</p>`
              : `<div class="icon">✨</div>
                 <h2 style="color: #38bdf8;">Вход выполнен успешно!</h2>
                 <p>Закрытие окна и возврат в Noire-AI...</p>`
          }
        </div>
        <script>
          try {
            if (window.opener) {
              window.opener.postMessage({
                type: ${error ? "'OAUTH_AUTH_ERROR'" : "'OAUTH_AUTH_SUCCESS'"},
                user: ${user ? JSON.stringify(user) : 'null'},
                error: ${error ? JSON.stringify(error) : 'null'}
              }, '*');
              setTimeout(() => {
                window.close();
              }, 800);
            } else {
              window.location.href = '/';
            }
          } catch (e) {
            console.error(e);
          }
        </script>
      </body>
    </html>
  `);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
