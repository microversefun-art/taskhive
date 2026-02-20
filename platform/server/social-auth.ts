import axios from 'axios';

export interface SocialAuthProvider {
  name: 'vk' | 'telegram' | 'google';
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface SocialAuthConfig {
  vk: SocialAuthProvider;
  telegram: SocialAuthProvider;
  google: SocialAuthProvider;
}

// VK OAuth
export async function getVKAuthUrl(clientId: string, redirectUri: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    display: 'page',
    scope: 'email,phone',
    response_type: 'code',
    v: '5.131',
  });
  
  return `https://oauth.vk.com/authorize?${params.toString()}`;
}

export async function exchangeVKCode(code: string, clientId: string, clientSecret: string, redirectUri: string) {
  try {
    const response = await axios.get('https://oauth.vk.com/access_token', {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code,
      },
    });
    
    return {
      accessToken: response.data.access_token,
      userId: response.data.user_id,
      email: response.data.email,
    };
  } catch (error) {
    throw new Error('VK OAuth exchange failed');
  }
}

// Telegram OAuth
export async function getTelegramAuthUrl(botUsername: string, redirectUri: string): Promise<string> {
  const params = new URLSearchParams({
    bot_id: botUsername,
    origin: new URL(redirectUri).origin,
    return_to: redirectUri,
  });
  
  return `https://oauth.telegram.org/auth?${params.toString()}`;
}

export async function verifyTelegramAuth(data: any, botToken: string): Promise<boolean> {
  const checkString = Object.keys(data)
    .filter((key) => key !== 'hash')
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join('\n');
  
  const crypto = require('crypto');
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hash = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');
  
  return hash === data.hash && Date.now() - data.auth_date * 1000 < 86400000;
}

// Google OAuth
export async function getGoogleAuthUrl(clientId: string, redirectUri: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(code: string, clientId: string, clientSecret: string, redirectUri: string) {
  try {
    const response = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });
    
    return {
      accessToken: response.data.access_token,
      idToken: response.data.id_token,
    };
  } catch (error) {
    throw new Error('Google OAuth exchange failed');
  }
}

// Push-уведомления для верификации
export interface PushVerificationRequest {
  userId: number;
  action: 'login' | 'sensitive_action';
  device: string;
  timestamp: number;
}

export async function sendPushVerification(request: PushVerificationRequest): Promise<string> {
  const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return verificationCode;
}

export async function verifyPushCode(userId: number, code: string, storedCode: string): Promise<boolean> {
  return code === storedCode;
}

// Двухфакторная аутентификация через push
export interface TwoFactorPushAuth {
  userId: number;
  deviceId: string;
  pushToken: string;
  isVerified: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export async function initiateTwoFactorPush(userId: number, deviceId: string): Promise<TwoFactorPushAuth> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 5 * 60000); // 5 минут
  
  return {
    userId,
    deviceId,
    pushToken: Math.random().toString(36).substring(2, 15),
    isVerified: false,
    createdAt: now,
    expiresAt,
  };
}

export async function completeTwoFactorPush(auth: TwoFactorPushAuth, approved: boolean): Promise<boolean> {
  if (!approved) {
    return false;
  }
  
  if (new Date() > auth.expiresAt) {
    return false;
  }
  
  return true;
}
