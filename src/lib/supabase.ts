import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, QuoteInquiry } from '../types';

// Default Supabase config (can be configured via environment variables or in Admin settings)
const DEFAULT_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const DEFAULT_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Local storage key for runtime Supabase credentials if configured in admin UI
const STORAGE_SUPABASE_CONFIG_KEY = 'foodhome_supabase_config_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

function normalizeSupabaseUrl(rawUrl: string): string {
  return (rawUrl || '').trim().replace(/\/+$/, '');
}

export function isServiceRoleJwt(key: string): boolean {
  try {
    const parts = (key || '').trim().split('.');
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    return parsed?.role === 'service_role';
  } catch {
    return false;
  }
}

let runtimePublicSupabaseConfig: SupabaseConfig | null = null;
let runtimePublicConfigPromise: Promise<SupabaseConfig | null> | null = null;

export function getSavedSupabaseConfig(): SupabaseConfig {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_SUPABASE_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const url = normalizeSupabaseUrl(parsed?.url || '');
        const anonKey = (parsed?.anonKey || '').trim();
        if (url && anonKey && !isServiceRoleJwt(anonKey)) {
          return { url, anonKey };
        }
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved supabase config:', e);
  }

  const envUrl = normalizeSupabaseUrl(DEFAULT_SUPABASE_URL);
  const envKey = (DEFAULT_SUPABASE_ANON_KEY || '').trim();
  if (envUrl && envKey && !isServiceRoleJwt(envKey)) {
    return { url: envUrl, anonKey: envKey };
  }

  if (runtimePublicSupabaseConfig?.url && runtimePublicSupabaseConfig?.anonKey) {
    return runtimePublicSupabaseConfig;
  }

  return {
    url: envUrl || runtimePublicSupabaseConfig?.url || '',
    anonKey: envKey || runtimePublicSupabaseConfig?.anonKey || ''
  };
}

/**
 * Loads public runtime Supabase config (`./supabase-config.json`) when build-time
 * VITE_SUPABASE_* env vars are absent (e.g. GitHub Pages `/docs` static deployments).
 */
export async function loadPublicRuntimeSupabaseConfig(): Promise<SupabaseConfig | null> {
  if (runtimePublicSupabaseConfig?.url && runtimePublicSupabaseConfig?.anonKey) {
    return runtimePublicSupabaseConfig;
  }

  const envUrl = normalizeSupabaseUrl(DEFAULT_SUPABASE_URL);
  const envKey = (DEFAULT_SUPABASE_ANON_KEY || '').trim();
  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  if (typeof window === 'undefined' || typeof fetch !== 'function') {
    return null;
  }

  if (!runtimePublicConfigPromise) {
    runtimePublicConfigPromise = (async () => {
      try {
        const res = await fetch('./supabase-config.json', { cache: 'no-store' });
        if (!res.ok) return null;
        const json = await res.json();
        const url = normalizeSupabaseUrl(json?.url || '');
        const anonKey = (json?.anonKey || '').trim();
        if (
          url &&
          anonKey &&
          !url.includes('your-project') &&
          !anonKey.includes('your-anon-key') &&
          !isServiceRoleJwt(anonKey)
        ) {
          runtimePublicSupabaseConfig = { url, anonKey };
          return runtimePublicSupabaseConfig;
        }
      } catch {
        // Optional static config absent or invalid; ignore safely
      }
      return null;
    })();
  }

  return runtimePublicConfigPromise;
}

export interface SupabaseConnectionDiagnostics {
  activeUrl: string;
  recoverEndpoint: string;
  source: 'localStorage' | 'env' | 'runtimeJson' | 'none';
  envUrl: string;
  localStorageUrl: string;
  hasEnvConflict: boolean;
  hasPublicBuildConfig: boolean;
}

export function getSupabaseConnectionDiagnostics(): SupabaseConnectionDiagnostics {
  const envUrl = normalizeSupabaseUrl(DEFAULT_SUPABASE_URL);
  const envKey = (DEFAULT_SUPABASE_ANON_KEY || '').trim();
  let localStorageUrl = '';
  let localStorageKey = '';

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(STORAGE_SUPABASE_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        localStorageUrl = normalizeSupabaseUrl(parsed?.url || '');
        localStorageKey = (parsed?.anonKey || '').trim();
      }
    }
  } catch {}

  const hasLocal = Boolean(localStorageUrl && localStorageKey && !isServiceRoleJwt(localStorageKey));
  const hasEnv = Boolean(envUrl && envKey && !isServiceRoleJwt(envKey));
  const hasRuntimeJson = Boolean(
    runtimePublicSupabaseConfig?.url &&
      runtimePublicSupabaseConfig?.anonKey &&
      !isServiceRoleJwt(runtimePublicSupabaseConfig.anonKey)
  );
  const activeUrl = hasLocal
    ? localStorageUrl
    : hasEnv
    ? envUrl
    : hasRuntimeJson
    ? runtimePublicSupabaseConfig!.url
    : '';
  const source: SupabaseConnectionDiagnostics['source'] = hasLocal
    ? 'localStorage'
    : hasEnv
    ? 'env'
    : hasRuntimeJson
    ? 'runtimeJson'
    : 'none';
  const hasEnvConflict = Boolean(hasLocal && hasEnv && localStorageUrl !== envUrl);

  return {
    activeUrl,
    recoverEndpoint: activeUrl ? `${activeUrl}/auth/v1/recover` : '',
    source,
    envUrl,
    localStorageUrl,
    hasEnvConflict,
    hasPublicBuildConfig: hasEnv || hasRuntimeJson
  };
}

export function saveSupabaseConfig(config: SupabaseConfig): void {
  const cleanKey = (config.anonKey || '').trim();
  if (isServiceRoleJwt(cleanKey)) {
    throw new Error('service_role 키는 보안상 프론트엔드에 저장할 수 없습니다. anon public key를 입력해 주세요.');
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        STORAGE_SUPABASE_CONFIG_KEY,
        JSON.stringify({
          url: normalizeSupabaseUrl(config.url),
          anonKey: cleanKey
        })
      );
    }
  } catch (e) {
    console.warn('Failed to save supabase config:', e);
  }
}

export const PASSWORD_RECOVERY_STORAGE_KEY = 'foodhome_password_recovery_pending';
export const PASSWORD_RECOVERY_EMAIL_KEY = 'foodhome_password_recovery_email';

export type RecoveryFailureReason =
  | 'otp_expired'
  | 'access_denied'
  | 'code_verifier_error'
  | 'session_creation_failed'
  | 'supabase_not_configured';

export type OtpRecoveryErrorType =
  | 'invalid_email_format'
  | 'rate_limit_exceeded'
  | 'invalid_otp'
  | 'otp_expired'
  | 'otp_already_used'
  | 'supabase_connection_error'
  | 'session_creation_failed'
  | 'password_update_failed';

export function isValidEmailFormat(email: string): boolean {
  const trimmed = (email || '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function isAuthCallbackHash(rawHash: string): boolean {
  const clean = (rawHash || '').replace(/^#/, '');
  if (!clean) return false;
  return (
    clean.includes('access_token=') ||
    clean.includes('refresh_token=') ||
    clean.includes('type=recovery') ||
    clean.includes('error_description=') ||
    (clean.includes('error=') && (clean.includes('error_code=') || clean.includes('access_denied')))
  );
}

export interface AuthCallbackUrlInspection {
  hasAuthParams: boolean;
  isError: boolean;
  errorCode: string | null;
  errorParam: string | null;
  errorDescription: string | null;
  code: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenHash: string | null;
  type: string | null;
  rawKey: string;
}

export function inspectAuthCallbackUrl(): AuthCallbackUrlInspection {
  if (typeof window === 'undefined') {
    return {
      hasAuthParams: false,
      isError: false,
      errorCode: null,
      errorParam: null,
      errorDescription: null,
      code: null,
      accessToken: null,
      refreshToken: null,
      tokenHash: null,
      type: null,
      rawKey: ''
    };
  }

  try {
    const rawSearch = window.location.search || '';
    const rawHash = (window.location.hash || '').replace(/^#/, '');
    const searchParams = new URLSearchParams(rawSearch);
    const hashParams = new URLSearchParams(rawHash.includes('=') ? rawHash : '');

    const errorCode = hashParams.get('error_code') || searchParams.get('error_code');
    const errorParam = hashParams.get('error') || searchParams.get('error');
    const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');
    const code = searchParams.get('code') || hashParams.get('code');
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');
    const tokenHash = searchParams.get('token_hash') || hashParams.get('token_hash');
    const type = hashParams.get('type') || searchParams.get('type');

    const isError = Boolean(
      errorCode ||
        errorDescription ||
        (errorParam && (isAuthCallbackHash(window.location.hash) || searchParams.has('error')))
    );

    const hasAuthParams = Boolean(
      isError ||
        code ||
        accessToken ||
        (tokenHash && type === 'recovery') ||
        (type === 'recovery' && isAuthCallbackHash(window.location.hash))
    );

    return {
      hasAuthParams,
      isError,
      errorCode,
      errorParam,
      errorDescription,
      code,
      accessToken,
      refreshToken,
      tokenHash,
      type,
      rawKey: `${rawSearch}|${rawHash}`
    };
  } catch {
    return {
      hasAuthParams: false,
      isError: false,
      errorCode: null,
      errorParam: null,
      errorDescription: null,
      code: null,
      accessToken: null,
      refreshToken: null,
      tokenHash: null,
      type: null,
      rawKey: ''
    };
  }
}

export function setPasswordRecoveryPending(pending: boolean, email?: string | null): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    if (pending) {
      window.sessionStorage.setItem(PASSWORD_RECOVERY_STORAGE_KEY, 'true');
      if (email) {
        window.sessionStorage.setItem(PASSWORD_RECOVERY_EMAIL_KEY, email);
      }
    } else {
      window.sessionStorage.removeItem(PASSWORD_RECOVERY_STORAGE_KEY);
      window.sessionStorage.removeItem(PASSWORD_RECOVERY_EMAIL_KEY);
    }
  } catch {
    //
  }
}

export function getSavedRecoveryEmail(): string | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem(PASSWORD_RECOVERY_EMAIL_KEY);
    }
  } catch {}
  return null;
}

export function isPasswordRecoveryPending(): boolean {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (window.sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY) === 'true') {
        return true;
      }
    }
  } catch {}
  return false;
}

export function clearAuthUrlParams(): void {
  if (typeof window === 'undefined') return;
  try {
    const url = new URL(window.location.href);
    let changed = false;

    const authQueryKeys = ['code', 'flow_id', 'token_hash', 'type', 'error', 'error_code', 'error_description', 'sb'];
    authQueryKeys.forEach((key) => {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    });

    if (isAuthCallbackHash(url.hash)) {
      url.hash = '';
      changed = true;
    }

    if (changed) {
      const nextUrl = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '') + url.hash;
      window.history.replaceState(null, '', nextUrl);
    }
  } catch {
    //
  }
}

/**
 * Cleans up legacy link-callback URL parameters (e.g., #error=access_denied&error_code=otp_expired)
 * without triggering link-based session exchange or verifyOtp().
 */
export function consumeLegacyAuthUrlNotice(): { detected: boolean; message: string | null } {
  const inspected = inspectAuthCallbackUrl();
  if (!inspected.hasAuthParams) {
    return { detected: false, message: null };
  }

  clearAuthUrlParams();

  if (inspected.isError) {
    const code = (inspected.errorCode || '').toLowerCase();
    const desc = (inspected.errorDescription || '').toLowerCase();
    if (code.includes('otp_expired') || desc.includes('expired')) {
      return {
        detected: true,
        message:
          '기존 이메일 링크 인증이 만료되었거나 사용할 수 없습니다. 아래에서 이메일 인증번호(OTP)를 발송해 직접 입력해 주세요.'
      };
    }
    return {
      detected: true,
      message:
        '이메일 링크 인증을 처리할 수 없습니다. 아래에서 이메일 인증번호(OTP)를 발송해 비밀번호를 재설정해 주세요.'
    };
  }

  return {
    detected: true,
    message:
      '보안 정책상 이메일 인증번호(OTP) 직접 입력 방식으로 전환되었습니다. 아래에서 인증번호를 발송해 입력해 주세요.'
  };
}

let cachedClient: SupabaseClient | null = null;
let lastUsedConfig: SupabaseConfig | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const currentConfig = getSavedSupabaseConfig();

  // If no URL or key is set, return null (fallback to local mock)
  if (!currentConfig.url || !currentConfig.anonKey) {
    return null;
  }

  if (
    cachedClient &&
    lastUsedConfig &&
    lastUsedConfig.url === currentConfig.url &&
    lastUsedConfig.anonKey === currentConfig.anonKey
  ) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(currentConfig.url, currentConfig.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Disable automatic URL hash/query consumption to avoid hash-routing conflicts
        // and duplicate recovery handling; password recovery uses manual verifyOtp().
        detectSessionInUrl: false
      }
    });
    lastUsedConfig = currentConfig;
    return cachedClient;
  } catch (e) {
    console.error('Error creating Supabase client:', e);
    return null;
  }
}

function isNetworkOrConnectionError(msg: string, name?: string): boolean {
  const lower = (msg || '').toLowerCase();
  const lowerName = (name || '').toLowerCase();
  return (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('network request failed') ||
    lower.includes('load failed') ||
    lower.includes('timeout') ||
    lowerName.includes('fetch') ||
    lowerName.includes('retryablefetcherror')
  );
}

function extractWaitSeconds(msg: string, fallback = 60): number {
  const match = (msg || '').match(/(\d+)\s*(?:second|sec|초)/i);
  if (match && match[1]) {
    const parsed = Number(match[1]);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.min(Math.max(parsed, 15), 300);
    }
  }
  return fallback;
}

export function classifyOtpSendError(err: {
  code?: string | null;
  message?: string | null;
  name?: string | null;
  status?: number | null;
}): { errorType: OtpRecoveryErrorType; message: string; cooldownSeconds?: number } {
  const code = (err.code || '').toLowerCase();
  const msg = err.message || '';
  const lowerMsg = msg.toLowerCase();
  const status = err.status || 0;

  if (isNetworkOrConnectionError(msg, err.name || undefined)) {
    return {
      errorType: 'supabase_connection_error',
      message: 'Supabase 서버에 연결할 수 없습니다. 네트워크 상태 또는 Supabase 설정(URL / Anon Key)을 확인해 주세요.'
    };
  }

  if (
    status === 429 ||
    code.includes('over_email_send_rate_limit') ||
    code.includes('rate_limit') ||
    lowerMsg.includes('rate limit') ||
    lowerMsg.includes('too many requests') ||
    lowerMsg.includes('security purposes') ||
    lowerMsg.includes('only request this after')
  ) {
    const waitSec = extractWaitSeconds(msg, 60);
    return {
      errorType: 'rate_limit_exceeded',
      cooldownSeconds: waitSec,
      message: `이메일 발송 제한(rate limit)에 도달했습니다. 보안 정책상 약 ${waitSec}초 후 다시 시도해 주세요.`
    };
  }

  if (
    code.includes('validation_failed') ||
    lowerMsg.includes('unable to validate email') ||
    lowerMsg.includes('invalid email') ||
    lowerMsg.includes('invalid format')
  ) {
    return {
      errorType: 'invalid_email_format',
      message: '이메일 주소 형식이 올바르지 않습니다. 정확한 관리자 이메일을 입력해 주세요.'
    };
  }

  return {
    errorType: 'supabase_connection_error',
    message: msg
      ? `인증번호 이메일 발송에 실패했습니다: ${msg}`
      : '인증번호 이메일 발송 중 Supabase 연결 오류가 발생했습니다.'
  };
}

export function classifyOtpVerifyError(err: {
  code?: string | null;
  message?: string | null;
  name?: string | null;
  status?: number | null;
}): { errorType: OtpRecoveryErrorType; message: string } {
  const code = (err.code || '').toLowerCase();
  const msg = err.message || '';
  const lowerMsg = msg.toLowerCase();

  if (isNetworkOrConnectionError(msg, err.name || undefined)) {
    return {
      errorType: 'supabase_connection_error',
      message: 'Supabase 서버와 통신할 수 없습니다. 인터넷 연결 또는 Supabase 연결 설정을 확인해 주세요.'
    };
  }

  if (
    lowerMsg.includes('already used') ||
    lowerMsg.includes('already been used') ||
    lowerMsg.includes('already verified') ||
    lowerMsg.includes('consumed') ||
    code.includes('already_used')
  ) {
    return {
      errorType: 'otp_already_used',
      message: '이미 사용된 인증번호입니다. "인증번호 재발송" 버튼으로 새 인증번호를 발급받아 주세요.'
    };
  }

  if (
    code.includes('otp_expired') ||
    lowerMsg.includes('otp_expired') ||
    (lowerMsg.includes('expired') && !lowerMsg.includes('invalid'))
  ) {
    return {
      errorType: 'otp_expired',
      message: '인증번호 유효시간이 만료되었습니다. "인증번호 재발송" 버튼을 눌러 새 인증번호를 받아 주세요.'
    };
  }

  if (lowerMsg.includes('expired or is invalid') || lowerMsg.includes('has expired or is invalid')) {
    return {
      errorType: 'otp_expired',
      message:
        '인증번호가 만료되었거나 이미 사용되었거나 일치하지 않습니다. 최신 메일의 인증번호를 다시 확인하거나 "인증번호 재발송"을 눌러 주세요.'
    };
  }

  if (
    code.includes('otp_disabled') ||
    code.includes('invalid') ||
    lowerMsg.includes('invalid') ||
    lowerMsg.includes('token') ||
    lowerMsg.includes('otp') ||
    lowerMsg.includes('mismatch') ||
    lowerMsg.includes('incorrect')
  ) {
    return {
      errorType: 'invalid_otp',
      message: '잘못된 인증번호입니다. 이메일 본문에 표시된 숫자를 정확히 다시 입력해 주세요.'
    };
  }

  return {
    errorType: 'invalid_otp',
    message: msg ? `인증번호 확인에 실패했습니다: ${msg}` : '인증번호 확인에 실패했습니다. 다시 시도해 주세요.'
  };
}

export async function sendPasswordResetOtpEmail(
  email: string
): Promise<{
  success: boolean;
  cooldownSeconds?: number;
  recoverEndpoint?: string;
  errorType?: OtpRecoveryErrorType;
  error?: string;
}> {
  const diagnostics = getSupabaseConnectionDiagnostics();
  const recoverEndpoint = diagnostics.recoverEndpoint;
  const trimmedEmail = (email || '').trim();
  if (!isValidEmailFormat(trimmedEmail)) {
    return {
      success: false,
      recoverEndpoint,
      errorType: 'invalid_email_format',
      error: '이메일 주소 형식이 올바르지 않습니다. (예: admin@example.com)'
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      recoverEndpoint,
      errorType: 'supabase_connection_error',
      error: 'Supabase 연결 설정(URL / Anon Key)이 필요합니다.'
    };
  }

  try {
    // Call resetPasswordForEmail(email) without redirectTo link dependency
    // Sends POST ${activeUrl}/auth/v1/recover
    const { error } = await client.auth.resetPasswordForEmail(trimmedEmail);

    if (error) {
      const classified = classifyOtpSendError({
        code: (error as any)?.code || null,
        message: error.message || '',
        name: error.name || null,
        status: (error as any)?.status || null
      });
      return {
        success: false,
        recoverEndpoint,
        errorType: classified.errorType,
        cooldownSeconds: classified.cooldownSeconds,
        error: classified.message
      };
    }

    return {
      success: true,
      recoverEndpoint,
      cooldownSeconds: 60
    };
  } catch (e: any) {
    const classified = classifyOtpSendError({
      code: e?.code || null,
      message: e?.message || '네트워크 오류가 발생했습니다.',
      name: e?.name || null,
      status: e?.status || null
    });
    return {
      success: false,
      recoverEndpoint,
      errorType: classified.errorType,
      cooldownSeconds: classified.cooldownSeconds,
      error: classified.message
    };
  }
}

let inFlightOtpVerifyPromise: Promise<{
  success: boolean;
  email?: string;
  errorType?: OtpRecoveryErrorType;
  error?: string;
}> | null = null;
let manualOtpRecoveryActive = false;

export function isManualOtpRecoveryActive(): boolean {
  return manualOtpRecoveryActive;
}

/**
 * Single authoritative verifyOtp() entry point for password recovery.
 * Enforces in-flight deduplication and verifies session creation via getSession().
 */
export async function verifyPasswordRecoveryOtp(
  email: string,
  token: string
): Promise<{
  success: boolean;
  email?: string;
  errorType?: OtpRecoveryErrorType;
  error?: string;
}> {
  if (inFlightOtpVerifyPromise) {
    return inFlightOtpVerifyPromise;
  }

  const run = async (): Promise<{
    success: boolean;
    email?: string;
    errorType?: OtpRecoveryErrorType;
    error?: string;
  }> => {
    const trimmedEmail = (email || '').trim();
    const trimmedToken = (token || '').trim();

    if (!isValidEmailFormat(trimmedEmail)) {
      return {
        success: false,
        errorType: 'invalid_email_format',
        error: '이메일 주소 형식이 올바르지 않습니다.'
      };
    }

    if (!trimmedToken) {
      return {
        success: false,
        errorType: 'invalid_otp',
        error: '이메일로 받은 인증번호를 입력해 주세요.'
      };
    }

    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        errorType: 'supabase_connection_error',
        error: 'Supabase 연결 설정(URL / Anon Key)이 확인되지 않습니다.'
      };
    }

    manualOtpRecoveryActive = true;
    try {
      const { data, error } = await client.auth.verifyOtp({
        email: trimmedEmail,
        token: trimmedToken,
        type: 'recovery'
      });

      if (error) {
        const classified = classifyOtpVerifyError({
          code: (error as any)?.code || null,
          message: error.message || '',
          name: error.name || null,
          status: (error as any)?.status || null
        });
        return {
          success: false,
          errorType: classified.errorType,
          error: classified.message
        };
      }

      // Explicitly verify that an active Supabase Auth session was created
      const { data: sessionData, error: sessionErr } = await client.auth.getSession();
      const verifiedUser = sessionData?.session?.user || data?.session?.user;

      if (sessionErr || !sessionData?.session || !verifiedUser) {
        return {
          success: false,
          errorType: 'session_creation_failed',
          error: '인증번호 확인 후 인증 세션을 생성하지 못했습니다. 인증번호를 다시 요청해 시도해 주세요.'
        };
      }

      const verifiedEmail = verifiedUser.email || trimmedEmail;
      setPasswordRecoveryPending(true, verifiedEmail);
      return {
        success: true,
        email: verifiedEmail
      };
    } catch (e: any) {
      const classified = classifyOtpVerifyError({
        code: e?.code || null,
        message: e?.message || '',
        name: e?.name || null,
        status: e?.status || null
      });
      return {
        success: false,
        errorType: classified.errorType,
        error: classified.message
      };
    } finally {
      manualOtpRecoveryActive = false;
    }
  };

  inFlightOtpVerifyPromise = run().finally(() => {
    inFlightOtpVerifyPromise = null;
  });

  return inFlightOtpVerifyPromise;
}

export async function updatePasswordInRecovery(newPassword: string): Promise<{
  success: boolean;
  errorType?: OtpRecoveryErrorType;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      errorType: 'supabase_connection_error',
      error: 'Supabase 연결 설정(URL / Anon Key)이 확인되지 않습니다.'
    };
  }

  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      errorType: 'password_update_failed',
      error: '새 비밀번호는 최소 6자리 이상으로 입력해 주세요.'
    };
  }

  try {
    const { data: sessionData, error: sessionErr } = await client.auth.getSession();
    if (sessionErr || !sessionData?.session?.user) {
      return {
        success: false,
        errorType: 'session_creation_failed',
        error: '비밀번호 재설정 인증 세션이 유효하지 않거나 만료되었습니다. 이메일 인증번호 확인부터 다시 진행해 주세요.'
      };
    }

    const { data, error } = await client.auth.updateUser({ password: newPassword });
    if (error || !data?.user) {
      const msg = error?.message || '';
      if (isNetworkOrConnectionError(msg, error?.name)) {
        return {
          success: false,
          errorType: 'supabase_connection_error',
          error: 'Supabase 서버 연결 오류로 비밀번호를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요.'
        };
      }
      if (msg.toLowerCase().includes('different from the old password')) {
        return {
          success: false,
          errorType: 'password_update_failed',
          error: '새 비밀번호는 기존 비밀번호와 다르게 입력해 주세요.'
        };
      }
      if (msg.toLowerCase().includes('at least') || msg.toLowerCase().includes('weak')) {
        return {
          success: false,
          errorType: 'password_update_failed',
          error: '비밀번호 보안 기준을 충족하지 않습니다. 6자리 이상으로 안전하게 입력해 주세요.'
        };
      }
      return {
        success: false,
        errorType: 'password_update_failed',
        error: msg ? `비밀번호 변경 실패: ${msg}` : '비밀번호 변경에 실패했습니다.'
      };
    }

    return { success: true };
  } catch (e: any) {
    if (isNetworkOrConnectionError(e?.message || '', e?.name)) {
      return {
        success: false,
        errorType: 'supabase_connection_error',
        error: '네트워크 오류로 비밀번호를 변경하지 못했습니다.'
      };
    }
    return {
      success: false,
      errorType: 'password_update_failed',
      error: e?.message || '비밀번호 변경 중 오류가 발생했습니다.'
    };
  }
}

/**
 * Hash password securely with Web Crypto SHA-256
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  if (!plainPassword) return '';
  try {
    const enc = new TextEncoder();
    const data = enc.encode(plainPassword);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Basic fallback if crypto.subtle is not supported
    let hash = 0;
    for (let i = 0; i < plainPassword.length; i++) {
      hash = (hash << 5) - hash + plainPassword.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
}

/**
 * Checks if a user is registered as a site admin in Supabase.
 * Uses the requested `is_site_admin()` RPC function or queries `site_admins`.
 */
export async function isSiteAdmin(userId?: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // 1. Try calling the RPC function `is_site_admin()`
    const { data: rpcData, error: rpcError } = await client.rpc('is_site_admin');
    if (!rpcError && typeof rpcData === 'boolean') {
      return rpcData;
    }

    // 2. Fallback: Query the `site_admins` table directly (actual columns: user_id, created_at)
    const targetUserId = userId || (await client.auth.getUser()).data.user?.id;
    if (!targetUserId) return false;

    const { data, error } = await client
      .from('site_admins')
      .select('user_id, created_at')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (!error && data) {
      return true;
    }
  } catch (e) {
    console.warn('isSiteAdmin check encountered an error:', e);
  }

  return false;
}

export const SITE_CONTENTS_ROW_ID = 'main_contents';

export type PublicSitePayload = Omit<AppState, 'inquiries' | 'quotes'>;

const PUBLIC_SITE_PAYLOAD_KEYS: Array<keyof PublicSitePayload> = [
  'content',
  'theme',
  'products',
  'posts',
  'reviews',
  'formConfig',
  'seo',
  'social',
  'formspreeEndpoint'
];

/**
 * Extract ONLY public website contents from AppState.
 * Strictly excludes private customer inquiries (`inquiries`, `quotes`) and credentials.
 */
export function extractPublicSitePayload(state: AppState): PublicSitePayload {
  return {
    content: state.content,
    theme: state.theme,
    products: state.products,
    posts: state.posts,
    reviews: state.reviews,
    formConfig: state.formConfig,
    seo: state.seo,
    social: state.social,
    formspreeEndpoint: state.formspreeEndpoint
  };
}

/**
 * Pick only recognized public keys from an incoming remote payload object.
 * Returns null if the payload is empty or invalid.
 */
export function sanitizeIncomingPublicPayload(raw: unknown): Partial<PublicSitePayload> | null {
  let target = raw;
  if (typeof target === 'string') {
    try {
      target = JSON.parse(target);
    } catch {
      return null;
    }
  }

  if (!target || typeof target !== 'object' || Array.isArray(target)) {
    return null;
  }

  const source = target as Record<string, unknown>;
  const sanitized: Partial<PublicSitePayload> = {};
  let hasValidKey = false;

  for (const key of PUBLIC_SITE_PAYLOAD_KEYS) {
    if (source[key] !== undefined && source[key] !== null) {
      (sanitized as Record<string, unknown>)[key] = source[key];
      hasValidKey = true;
    }
  }

  return hasValidKey ? sanitized : null;
}

export interface FetchPublicSiteContentsResult {
  ok: boolean;
  exists: boolean;
  payload: Partial<PublicSitePayload> | null;
  updatedAt: string | null;
  error?: string;
}

/**
 * Fetch public homepage contents from Supabase `site_contents` (`main_contents`).
 * Uses cache-busted anonymous public access so unauthenticated visitors across all
 * browsers/devices (and GitHub Pages) always receive the latest published content
 * without being blocked by stale HTTP caches or expired local Auth JWTs.
 * Never throws or wipes local data on failure.
 */
export async function fetchPublicSiteContents(
  configOverride?: SupabaseConfig
): Promise<FetchPublicSiteContentsResult> {
  const cfg = configOverride?.url && configOverride?.anonKey ? configOverride : getSavedSupabaseConfig();
  const activeUrl = normalizeSupabaseUrl(cfg.url || '');
  const activeKey = (cfg.anonKey || '').trim();

  if (!activeUrl || !activeKey) {
    return {
      ok: false,
      exists: false,
      payload: null,
      updatedAt: null,
      error: 'Supabase 연결 정보가 설정되지 않았습니다.'
    };
  }

  // 1. Direct anonymous REST fetch with cache: 'no-store' (bypasses stale caches & expired user JWTs)
  if (typeof fetch === 'function') {
    try {
      const endpoint = `${activeUrl}/rest/v1/site_contents?select=id,payload,updated_at&id=eq.${encodeURIComponent(SITE_CONTENTS_ROW_ID)}&limit=1`;
      const resp = await fetch(endpoint, {
        method: 'GET',
        headers: {
          apikey: activeKey,
          Authorization: `Bearer ${activeKey}`,
          Accept: 'application/json'
        },
        cache: 'no-store'
      });

      if (resp.ok) {
        const rows = await resp.json();
        const row = Array.isArray(rows) ? rows[0] : rows;
        if (!row) {
          return {
            ok: true,
            exists: false,
            payload: null,
            updatedAt: null
          };
        }

        const sanitized = sanitizeIncomingPublicPayload(row.payload);
        if (!sanitized) {
          return {
            ok: true,
            exists: false,
            payload: null,
            updatedAt: row.updated_at || null
          };
        }

        return {
          ok: true,
          exists: true,
          payload: sanitized,
          updatedAt: row.updated_at || null
        };
      }

      // If PostgREST returned an explicit HTTP error, capture message before attempting client fallback
      let restErrorMsg = `HTTP ${resp.status}`;
      try {
        const errBody = await resp.json();
        if (errBody?.message) restErrorMsg = errBody.message;
      } catch {}

      const client = getSupabaseClient();
      if (!client) {
        return {
          ok: false,
          exists: false,
          payload: null,
          updatedAt: null,
          error: restErrorMsg
        };
      }
    } catch {
      // Fall through to Supabase JS client fallback below
    }
  }

  // 2. Fallback via Supabase JS client
  const client = getSupabaseClient();
  if (!client) {
    return {
      ok: false,
      exists: false,
      payload: null,
      updatedAt: null,
      error: 'Supabase 클라이언트 초기화에 실패했습니다.'
    };
  }

  try {
    const { data, error } = await client
      .from('site_contents')
      .select('id, payload, updated_at')
      .eq('id', SITE_CONTENTS_ROW_ID)
      .maybeSingle();

    if (error) {
      return {
        ok: false,
        exists: false,
        payload: null,
        updatedAt: null,
        error: error.message
      };
    }

    if (!data) {
      return {
        ok: true,
        exists: false,
        payload: null,
        updatedAt: null
      };
    }

    const sanitized = sanitizeIncomingPublicPayload(data.payload);
    if (!sanitized) {
      return {
        ok: true,
        exists: false,
        payload: null,
        updatedAt: data.updated_at || null
      };
    }

    return {
      ok: true,
      exists: true,
      payload: sanitized,
      updatedAt: data.updated_at || null
    };
  } catch (e: any) {
    return {
      ok: false,
      exists: false,
      payload: null,
      updatedAt: null,
      error: e?.message || 'Supabase 조회 중 네트워크 오류가 발생했습니다.'
    };
  }
}

export interface PublishPublicSiteContentsResult {
  success: boolean;
  updatedAt?: string;
  error?: string;
}

/**
 * Publish public homepage contents to Supabase `site_contents` (`main_contents`).
 * Requires authenticated Supabase Auth user present in `site_admins` (`is_site_admin()`).
 */
export async function publishPublicSiteContents(state: AppState): Promise<PublishPublicSiteContentsResult> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: 'Supabase 연결 설정(Project URL / Anon Key)이 먼저 필요합니다.'
    };
  }

  try {
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    const authUser = sessionData?.session?.user;
    if (sessionError || !authUser) {
      return {
        success: false,
        error: 'Supabase 관리자 이메일 계정으로 로그인한 상태에서만 DB에 게시할 수 있습니다.'
      };
    }

    const adminAuthorized = await isSiteAdmin(authUser.id);
    if (!adminAuthorized) {
      return {
        success: false,
        error: '현재 로그인한 계정에 관리자 권한(site_admins / is_site_admin)이 없습니다.'
      };
    }

    const publicPayload = extractPublicSitePayload(state);
    const nowIso = new Date().toISOString();

    const { data, error } = await client
      .from('site_contents')
      .upsert(
        {
          id: SITE_CONTENTS_ROW_ID,
          payload: publicPayload,
          updated_at: nowIso
        },
        { onConflict: 'id' }
      )
      .select('id, updated_at')
      .single();

    if (error) {
      const msg = error.message || '';
      if (msg.includes('site_contents') && (msg.includes('does not exist') || msg.includes('Could not find the table') || error.code === '42P01' || error.code === 'PGRST205')) {
        return {
          success: false,
          error: 'Supabase에 site_contents 테이블이 아직 생성되지 않았습니다. SQL Editor에서 001_site_contents.sql을 먼저 실행해 주세요.'
        };
      }
      return {
        success: false,
        error: `Supabase 저장 실패: ${msg}`
      };
    }

    return {
      success: true,
      updatedAt: data?.updated_at || nowIso
    };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || 'Supabase 게시 중 예기치 않은 오류가 발생했습니다.'
    };
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('이미지 데이터 변환에 실패했습니다.'));
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기에 실패했습니다.'));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('이미지 디코딩에 실패했습니다.'));
    img.src = src;
  });
}

function canvasHasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    // Sample image pixels at a manageable grid to detect any non-opaque alpha channel
    const data = ctx.getImageData(0, 0, width, height).data;
    const step = Math.max(4, Math.floor(data.length / 40000) * 4);
    for (let i = 3; i < data.length; i += step) {
      if (data[i] < 250) return true;
    }
  } catch {
    // Ignore pixel inspection error
  }
  return false;
}

function isSupportedImageFile(file: File): boolean {
  if (file.type && file.type.startsWith('image/')) return true;
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(file.name || '');
}

/**
 * Optimizes an uploaded image into a compact Data URL for reliable localStorage persistence
 * when external cloud storage is not configured.
 */
export async function optimizeImageFileToDataUrl(
  file: File,
  folder = 'banners'
): Promise<{ url: string | null; error?: string }> {
  try {
    if (!isSupportedImageFile(file)) {
      return { url: null, error: '이미지 파일(JPG, PNG, WEBP, GIF, SVG)만 업로드할 수 있습니다.' };
    }

    const lowerName = (file.name || '').toLowerCase();
    const isSvg = file.type === 'image/svg+xml' || lowerName.endsWith('.svg');
    const isGif = file.type === 'image/gif' || lowerName.endsWith('.gif');
    const isPng = file.type === 'image/png' || lowerName.endsWith('.png');
    const isWebp = file.type === 'image/webp' || lowerName.endsWith('.webp');

    // Keep SVG as-is (size capped reasonably)
    if (isSvg) {
      if (file.size > 512 * 1024) {
        return { url: null, error: 'SVG 파일은 500KB 이하만 업로드할 수 있습니다.' };
      }
      const dataUrl = await readFileAsDataUrl(file);
      return { url: dataUrl };
    }

    // Preserve animated/small GIF if under 450KB
    if (isGif && file.size <= 450 * 1024) {
      const dataUrl = await readFileAsDataUrl(file);
      return { url: dataUrl };
    }

    const isLogoOrSignature = folder === 'logos' || folder === 'signatures';
    const maxDimension = isLogoOrSignature ? 800 : 1280;
    const targetMaxChars = isLogoOrSignature ? 260_000 : 380_000;

    const objectUrl = typeof URL !== 'undefined' && URL.createObjectURL ? URL.createObjectURL(file) : null;
    const rawDataUrl = objectUrl ? null : await readFileAsDataUrl(file);

    try {
      const img = await loadImageElement(objectUrl || (rawDataUrl as string));
      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;

      if (!origW || !origH) {
        const fallback = rawDataUrl || (await readFileAsDataUrl(file));
        return { url: fallback };
      }

      // If already compact and within dimensions, return original untouched (100% original PNG/WebP/JPG)
      if (file.size <= 160 * 1024 && origW <= maxDimension && origH <= maxDimension) {
        const directUrl = rawDataUrl || (await readFileAsDataUrl(file));
        return { url: directUrl };
      }

      const scale = Math.min(1, maxDimension / Math.max(origW, origH));
      const targetW = Math.max(1, Math.round(origW * scale));
      const targetH = Math.max(1, Math.round(origH * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) {
        const fallback = rawDataUrl || (await readFileAsDataUrl(file));
        return { url: fallback };
      }

      ctx.clearRect(0, 0, targetW, targetH);
      ctx.drawImage(img, 0, 0, targetW, targetH);

      // NEVER convert PNG or WebP uploads to JPEG — always preserve transparency & alpha channel
      const keepAlpha = isPng || isWebp || isLogoOrSignature || canvasHasTransparency(ctx, targetW, targetH);

      if (keepAlpha) {
        // Keep exact PNG format whenever it fits within localStorage budget
        let out = canvas.toDataURL('image/png');
        if (out.length > targetMaxChars) {
          // Try alpha-capable WebP first to preserve transparency at smaller size
          const webpOut = canvas.toDataURL('image/webp', 0.88);
          if (webpOut.startsWith('data:image/webp') && webpOut.length < out.length) {
            out = webpOut;
          }
        }
        // Step down dimensions if still above budget, always using alpha-supporting format
        let shrink = 0.8;
        while (out.length > targetMaxChars && shrink >= 0.35) {
          const sw = Math.max(1, Math.round(targetW * shrink));
          const sh = Math.max(1, Math.round(targetH * shrink));
          const c2 = document.createElement('canvas');
          c2.width = sw;
          c2.height = sh;
          const ctx2 = c2.getContext('2d', { alpha: true });
          if (!ctx2) break;
          ctx2.clearRect(0, 0, sw, sh);
          ctx2.drawImage(img, 0, 0, sw, sh);
          const png2 = c2.toDataURL('image/png');
          if (png2.length <= targetMaxChars) {
            out = png2;
            break;
          }
          const candidateWebp = c2.toDataURL('image/webp', 0.84);
          out = candidateWebp.startsWith('data:image/webp') && candidateWebp.length < png2.length ? candidateWebp : png2;
          shrink -= 0.15;
        }
        return { url: out };
      }

      // Opaque JPEG photos: use JPEG with adaptive quality & gentle resolution step-down if needed
      let quality = 0.84;
      let out = canvas.toDataURL('image/jpeg', quality);
      while (out.length > targetMaxChars && quality > 0.48) {
        quality = Math.max(0.45, quality - 0.12);
        out = canvas.toDataURL('image/jpeg', quality);
      }

      let shrink = 0.8;
      while (out.length > targetMaxChars && shrink >= 0.5) {
        const sw = Math.max(1, Math.round(targetW * shrink));
        const sh = Math.max(1, Math.round(targetH * shrink));
        const c2 = document.createElement('canvas');
        c2.width = sw;
        c2.height = sh;
        const ctx2 = c2.getContext('2d');
        if (!ctx2) break;
        ctx2.drawImage(img, 0, 0, sw, sh);
        out = c2.toDataURL('image/jpeg', 0.72);
        shrink -= 0.15;
      }

      return { url: out };
    } finally {
      if (objectUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) {
        URL.revokeObjectURL(objectUrl);
      }
    }
  } catch (err: any) {
    try {
      const fallback = await readFileAsDataUrl(file);
      return { url: fallback };
    } catch {
      return { url: null, error: err?.message || '이미지 처리에 실패했습니다.' };
    }
  }
}

/**
 * Upload an image file to Supabase Storage bucket 'foodhome-media'
 */
export async function uploadImageToStorage(file: File, folder = 'banners'): Promise<{ url: string | null; error?: string }> {
  if (!isSupportedImageFile(file)) {
    return { url: null, error: '이미지 파일(PNG, JPG, JPEG, WEBP, GIF, SVG)만 업로드할 수 있습니다.' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return optimizeImageFileToDataUrl(file, folder);
  }

  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { error: uploadError } = await client.storage
      .from('foodhome-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.warn('Supabase storage upload error, falling back to local optimized data URL:', uploadError);
      return optimizeImageFileToDataUrl(file, folder);
    }

    const { data } = client.storage.from('foodhome-media').getPublicUrl(fileName);
    return { url: data.publicUrl };
  } catch {
    return optimizeImageFileToDataUrl(file, folder);
  }
}

/**
 * Interface representing form_definitions table
 */
export interface FormDefinition {
  id: string;
  form_slug: string;
  title: string;
  description?: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'tel' | 'email' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'password';
    required: boolean;
    options?: string[];
    placeholder?: string;
    default_value?: any;
  }>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface representing form_submissions table
 */
export interface FormSubmission {
  id: string;
  form_slug: string;
  title?: string;
  author_name?: string;
  phone?: string;
  email?: string;
  store_name?: string;
  address?: string;
  selected_items?: string[];
  payload: Record<string, any>;
  password_hash?: string;
  status: '접수대기' | '접수완료' | '답변완료' | '배송준비' | '배송완료' | '상담완료' | '보류' | string;
  admin_reply?: string;
  admin_replied_at?: string;
  admin_replied_by?: string;
  tracking_number?: string;
  created_at: string;
}

/**
 * Fetch public sample board posts
 */
export async function fetchSampleBoardPosts(): Promise<FormSubmission[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('form_submissions')
      .select('id, form_slug, title, author_name, store_name, status, created_at, admin_replied_at')
      .eq('form_slug', 'sample-request')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching sample posts from Supabase:', error);
      return [];
    }

    return (data || []) as FormSubmission[];
  } catch (e) {
    console.error('Supabase fetchSampleBoardPosts failed:', e);
    return [];
  }
}

/**
 * Submit a customer sample post
 */
export async function submitSampleBoardPost(params: {
  title: string;
  authorName: string;
  storeName: string;
  phone: string;
  address: string;
  selectedItems: string[];
  message: string;
  password: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const passwordHash = await hashPassword(params.password);
    const { data, error } = await client
      .from('form_submissions')
      .insert([
        {
          form_slug: 'sample-request',
          title: params.title,
          author_name: params.authorName,
          store_name: params.storeName,
          phone: params.phone,
          address: params.address,
          selected_items: params.selectedItems,
          password_hash: passwordHash,
          status: '접수완료',
          payload: {
            message: params.message,
            submittedAt: new Date().toISOString()
          }
        }
      ])
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Submission failed' };
  }
}

/**
 * Fetch 1:1 Quote Consultation inquiries from Supabase
 */
export async function fetchQuoteInquiries(): Promise<QuoteInquiry[]> {
  const client = getSupabaseClient();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('quote_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching quote inquiries from Supabase:', error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      postNumber: Number(row.post_number) || 1,
      title: row.title,
      companyName: row.company_name,
      contactPerson: row.contact_person,
      phone: row.phone,
      email: row.email,
      region: row.region,
      businessType: row.business_type,
      interestedProducts: row.interested_products || [],
      monthlyVolume: row.monthly_volume,
      deliverySchedule: row.delivery_schedule,
      message: row.message,
      attachments: row.attachments || [],
      passwordHash: row.password_hash,
      isSecret: row.is_secret ?? true,
      status: row.status || '접수완료',
      readCount: row.read_count || 1,
      createdAt: row.created_at,
      adminReply: row.admin_reply,
      adminMemo: row.admin_memo
    }));
  } catch (e) {
    console.error('Supabase fetchQuoteInquiries failed:', e);
    return [];
  }
}

/**
 * Submit 1:1 Quote Consultation inquiry to Supabase
 */
export async function submitQuoteInquiryToDb(params: {
  title: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  region?: string;
  businessType?: string;
  interestedProducts: string[];
  monthlyVolume?: string;
  deliverySchedule?: string;
  message: string;
  attachments?: { name: string; url?: string; size?: string }[];
  password: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const passwordHash = await hashPassword(params.password);
    const { data, error } = await client
      .from('quote_inquiries')
      .insert([
        {
          title: params.title,
          company_name: params.companyName,
          contact_person: params.contactPerson,
          phone: params.phone,
          email: params.email,
          region: params.region,
          business_type: params.businessType,
          interested_products: params.interestedProducts,
          monthly_volume: params.monthlyVolume,
          delivery_schedule: params.deliverySchedule,
          message: params.message,
          attachments: params.attachments || [],
          password_hash: passwordHash,
          is_secret: true,
          status: '접수완료',
          read_count: 1
        }
      ])
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Quote inquiry submission failed' };
  }
}

/**
 * Verifies if entered password matches the post's SHA-256 hash
 */
export async function verifyQuotePasswordWithHash(plainPassword: string, storedHash?: string, rawFallback?: string): Promise<boolean> {
  if (!storedHash && !rawFallback) return true;
  if (!plainPassword) return false;

  // 1. Direct match with plain text if stored in raw form
  if (rawFallback && plainPassword.trim() === rawFallback.trim()) {
    return true;
  }

  // 2. SHA-256 hash check
  const hashedInput = await hashPassword(plainPassword.trim());
  if (storedHash && hashedInput.toLowerCase() === storedHash.toLowerCase()) {
    return true;
  }

  return false;
}

/**
 * Phase 1 Safe SQL Migration Script for Supabase (`site_contents` only)
 */
export const SUPABASE_FOODHOME_SETUP_SQL = `-- ============================================================================
-- FOODHOME (푸드홈) 1차 마이그레이션: 홈페이지 공개 콘텐츠 저장 테이블 (site_contents)
-- ============================================================================
-- [안전 원칙]
-- 1. 기존 테이블(site_admins, form_definitions, form_submissions) 및 데이터를
--    절대 삭제하거나 수정하지 않습니다.
-- 2. 기존 is_site_admin() 함수와 기존 RLS 정책을 변경하지 않습니다.
-- 3. 공개 콘텐츠(회사소개, 배너, 제품, 공지, FAQ, 후기, 테마, SEO, 폼설정)만
--    저장하며, 고객 문의/견적/비밀번호 등 개인정보(inquiries, quotes)는
--    payload에 저장하지 않습니다.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.site_contents (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS 활성화 (반복 실행 가능)
ALTER TABLE public.site_contents ENABLE ROW LEVEL SECURITY;

-- 기존 정책 존재 여부를 확인하여 중복 없이 안전하게 정책 생성
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_contents'
      AND policyname = 'Public can read site contents'
  ) THEN
    CREATE POLICY "Public can read site contents"
      ON public.site_contents
      FOR SELECT
      TO public
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'site_contents'
      AND policyname = 'Admins can manage site contents'
  ) THEN
    CREATE POLICY "Admins can manage site contents"
      ON public.site_contents
      FOR ALL
      TO authenticated
      USING (public.is_site_admin())
      WITH CHECK (public.is_site_admin());
  END IF;
END
$$;
`;
