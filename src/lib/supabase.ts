import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AppState, B2BInquiry, PostItem, QuoteInquiry } from '../types';

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
 * Upload an image file to Supabase Storage bucket 'foodhome-media'.
 * Automatically falls back to compact optimized DataURL when Storage is unavailable,
 * while returning storageType & warning metadata so callers can advise on 5MB localStorage limits.
 */
export async function uploadImageToStorage(
  file: File,
  folder = 'banners'
): Promise<{ url: string | null; storageType?: 'supabase' | 'dataurl'; warning?: string; error?: string }> {
  if (!isSupportedImageFile(file)) {
    return { url: null, error: '이미지 파일(PNG, JPG, JPEG, WEBP, GIF, SVG)만 업로드할 수 있습니다.' };
  }

  const safeFolder = (folder || 'media').replace(/[^a-zA-Z0-9_-]/g, '') || 'media';
  const client = getSupabaseClient();
  if (!client) {
    const localRes = await optimizeImageFileToDataUrl(file, safeFolder);
    return {
      ...localRes,
      storageType: 'dataurl',
      warning: localRes.url
        ? 'Supabase 미연결 상태여서 브라우저 내부에 저장되었습니다. (5MB 용량 초과 방지를 위해 Supabase Storage 연동을 권장합니다)'
        : undefined
    };
  }

  try {
    const rawExt = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
    const fileName = `${safeFolder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${rawExt}`;

    const { error: uploadError } = await client.storage
      .from('foodhome-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.warn('Supabase storage upload error, falling back to local optimized data URL:', uploadError);
      const localRes = await optimizeImageFileToDataUrl(file, safeFolder);
      return {
        ...localRes,
        storageType: 'dataurl',
        warning: localRes.url
          ? `Supabase Storage 업로드 권한/버킷 미설정(${uploadError.message})으로 임시 로컬 이미지로 저장되었습니다. 002_board_posts.sql 실행 및 관리자 이메일 로그인 후 Storage로 분리할 수 있습니다.`
          : undefined
      };
    }

    const { data } = client.storage.from('foodhome-media').getPublicUrl(fileName);
    return { url: data.publicUrl, storageType: 'supabase' };
  } catch {
    const localRes = await optimizeImageFileToDataUrl(file, safeFolder);
    return { ...localRes, storageType: 'dataurl' };
  }
}

export interface LocalStorageUsageStats {
  totalBytes: number;
  totalMB: number;
  usagePercent: number;
  isNearLimit: boolean;
  dataUrlCount: number;
  dataUrlBytes: number;
  dataUrlMB: number;
  inquiriesCount: number;
  quotesCount: number;
  postsCount: number;
}

/**
 * Measure approximate localStorage footprint (`foodhome_app_data_v4`) and embedded Base64 DataURLs.
 */
export function getLocalStorageUsageStats(state: AppState): LocalStorageUsageStats {
  let serialized = '';
  try {
    serialized = JSON.stringify(state);
  } catch {
    serialized = '';
  }

  const totalBytes = serialized.length * 2; // UTF-16 estimate for browser localStorage (~5MB quota)
  const totalMB = Number((totalBytes / (1024 * 1024)).toFixed(2));
  const quotaBytes = 5 * 1024 * 1024;
  const usagePercent = Math.min(100, Math.round((totalBytes / quotaBytes) * 100));

  let dataUrlCount = 0;
  let dataUrlChars = 0;
  const seen = new Set<string>();

  const scan = (val: unknown) => {
    if (typeof val === 'string') {
      if (val.startsWith('data:image/')) {
        dataUrlCount += 1;
        dataUrlChars += val.length;
        seen.add(val);
      }
      return;
    }
    if (Array.isArray(val)) {
      val.forEach(scan);
      return;
    }
    if (val && typeof val === 'object') {
      Object.values(val as Record<string, unknown>).forEach(scan);
    }
  };

  scan({
    content: state.content,
    products: state.products,
    posts: state.posts,
    seo: state.seo
  });

  const dataUrlBytes = dataUrlChars * 2;
  const dataUrlMB = Number((dataUrlBytes / (1024 * 1024)).toFixed(2));

  return {
    totalBytes,
    totalMB,
    usagePercent,
    isNearLimit: usagePercent >= 70,
    dataUrlCount,
    dataUrlBytes,
    dataUrlMB,
    inquiriesCount: (state.inquiries || []).length,
    quotesCount: (state.quotes || []).length,
    postsCount: (state.posts || []).length
  };
}

function dataUrlToFile(dataUrl: string, fileBaseName: string): File | null {
  try {
    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return null;
    const mime = match[1];
    const b64 = match[2];
    const binStr = atob(b64);
    const bytes = new Uint8Array(binStr.length);
    for (let i = 0; i < binStr.length; i++) {
      bytes[i] = binStr.charCodeAt(i);
    }
    const ext = mime.split('/')[1]?.replace('svg+xml', 'svg').replace('jpeg', 'jpg') || 'png';
    return new File([bytes], `${fileBaseName}.${ext}`, { type: mime });
  } catch {
    return null;
  }
}

/**
 * Safely upload embedded Base64 `data:image/...` strings inside AppState to Supabase Storage (`foodhome-media`)
 * without ever deleting an image if an upload fails.
 */
export async function migrateDataUrlsInStateToStorage(state: AppState): Promise<{
  success: boolean;
  nextState: AppState;
  migratedCount: number;
  failedCount: number;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      nextState: state,
      migratedCount: 0,
      failedCount: 0,
      error: 'Supabase 연결 정보가 설정되지 않았습니다.'
    };
  }

  const { data: sessionData } = await client.auth.getSession();
  const authUser = sessionData?.session?.user;
  if (!authUser) {
    return {
      success: false,
      nextState: state,
      migratedCount: 0,
      failedCount: 0,
      error: 'Supabase 관리자 이메일 계정으로 로그인한 상태에서만 Storage로 이전할 수 있습니다.'
    };
  }

  const adminOk = await isSiteAdmin(authUser.id);
  if (!adminOk) {
    return {
      success: false,
      nextState: state,
      migratedCount: 0,
      failedCount: 0,
      error: '현재 로그인한 계정에 관리자 권한(site_admins)이 없습니다.'
    };
  }

  const uploadedCache = new Map<string, string>();
  let migratedCount = 0;
  let failedCount = 0;

  const transformNode = async (val: unknown, folder: string): Promise<unknown> => {
    if (typeof val === 'string') {
      if (!val.startsWith('data:image/')) return val;
      if (uploadedCache.has(val)) return uploadedCache.get(val)!;
      const file = dataUrlToFile(val, `migrated_${Date.now()}`);
      if (!file) {
        failedCount += 1;
        return val;
      }
      const ext = file.name.split('.').pop() || 'png';
      const storagePath = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const { error: uploadError } = await client.storage
        .from('foodhome-media')
        .upload(storagePath, file, { cacheControl: '3600', upsert: false });
      if (uploadError) {
        failedCount += 1;
        return val;
      }
      const { data: urlData } = client.storage.from('foodhome-media').getPublicUrl(storagePath);
      if (urlData?.publicUrl) {
        uploadedCache.set(val, urlData.publicUrl);
        migratedCount += 1;
        return urlData.publicUrl;
      }
      failedCount += 1;
      return val;
    }
    if (Array.isArray(val)) {
      const nextArr: unknown[] = [];
      for (const item of val) {
        nextArr.push(await transformNode(item, folder));
      }
      return nextArr;
    }
    if (val && typeof val === 'object') {
      const nextObj: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
        nextObj[k] = await transformNode(v, folder);
      }
      return nextObj;
    }
    return val;
  };

  const nextContent = (await transformNode(state.content, 'site-media')) as AppState['content'];
  const nextProducts = (await transformNode(state.products, 'products')) as AppState['products'];
  const nextPosts = (await transformNode(state.posts, 'posts')) as AppState['posts'];
  const nextSeo = (await transformNode(state.seo, 'seo')) as AppState['seo'];

  return {
    success: failedCount === 0 || migratedCount > 0,
    nextState: {
      ...state,
      content: nextContent,
      products: nextProducts,
      posts: nextPosts,
      seo: nextSeo
    },
    migratedCount,
    failedCount,
    error:
      failedCount > 0 && migratedCount === 0
        ? 'Storage 업로드에 실패했습니다. 002_board_posts.sql의 foodhome-media 버킷 및 RLS 정책을 실행했는지 확인해 주세요.'
        : undefined
  };
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

export interface BoardPostRow {
  id: string;
  board_type: string;
  category: string;
  title: string;
  author_name: string;
  content: string;
  thumbnail?: string | null;
  tags?: string[] | null;
  is_pinned?: boolean | null;
  is_secret?: boolean | null;
  read_count?: number | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

function mapBoardPostRowToItem(row: BoardPostRow): PostItem {
  const createdStr = (row.created_at || new Date().toISOString()).slice(0, 10);
  return {
    id: row.id,
    title: row.title,
    category: row.category || '공지사항',
    author: row.author_name || '푸드홈',
    date: createdStr,
    content: row.content || '',
    readCount: Number(row.read_count) || 0,
    thumbnail: row.thumbnail || '',
    tags: Array.isArray(row.tags) ? row.tags : [],
    isPinned: Boolean(row.is_pinned)
  };
}

export interface FetchBoardPostsResult {
  ok: boolean;
  posts: PostItem[];
  tableMissing?: boolean;
  error?: string;
}

/**
 * Fetch public board posts from `public.board_posts`.
 * Uses cache-busted anonymous REST for visitors, or authenticated client for admins.
 */
export async function fetchBoardPosts(isAdminAuthed = false): Promise<FetchBoardPostsResult> {
  const cfg = getSavedSupabaseConfig();
  const activeUrl = normalizeSupabaseUrl(cfg.url || '');
  const activeKey = (cfg.anonKey || '').trim();

  if (!activeUrl || !activeKey) {
    return { ok: false, posts: [], error: 'Supabase 미연결' };
  }

  if (!isAdminAuthed && typeof fetch === 'function') {
    try {
      const endpoint = `${activeUrl}/rest/v1/board_posts?select=id,board_type,category,title,author_name,content,thumbnail,tags,is_pinned,is_secret,read_count,status,created_at,updated_at&order=is_pinned.desc,created_at.desc`;
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
        const rows = (await resp.json()) as BoardPostRow[];
        return {
          ok: true,
          posts: Array.isArray(rows) ? rows.map(mapBoardPostRowToItem) : []
        };
      }

      if (resp.status === 404) {
        return { ok: false, posts: [], tableMissing: true, error: 'board_posts 테이블이 아직 생성되지 않았습니다.' };
      }
    } catch {
      // Fall through to JS client
    }
  }

  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, posts: [], error: 'Supabase 클라이언트 초기화 실패' };
  }

  try {
    const { data, error } = await client
      .from('board_posts')
      .select('id, board_type, category, title, author_name, content, thumbnail, tags, is_pinned, is_secret, read_count, status, created_at, updated_at')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      const msg = error.message || '';
      const tableMissing =
        error.code === '42P01' ||
        error.code === 'PGRST205' ||
        msg.includes('board_posts');
      return { ok: false, posts: [], tableMissing, error: msg };
    }

    return {
      ok: true,
      posts: ((data || []) as BoardPostRow[]).map(mapBoardPostRowToItem)
    };
  } catch (e: any) {
    return { ok: false, posts: [], error: e?.message || '게시글 조회 오류' };
  }
}

export async function createBoardPostInDb(post: PostItem, visitorPassword?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  try {
    const boardType =
      post.category === '조리·활용 레시피'
        ? 'recipe'
        : post.category === 'B2B 납품스토리'
        ? 'story'
        : post.category === '이벤트'
        ? 'event'
        : post.category === '공지사항'
        ? 'notice'
        : 'community';

    if (visitorPassword && visitorPassword.trim()) {
      const pwHash = await hashPassword(visitorPassword.trim());
      const { error } = await client.rpc('create_visitor_board_post', {
        p_id: post.id,
        p_board_type: boardType,
        p_category: post.category || '고객소통',
        p_title: post.title,
        p_author_name: post.author || '방문자',
        p_content: post.content,
        p_thumbnail: post.thumbnail || '',
        p_tags: post.tags || [],
        p_password_hash: pwHash
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    }

    const { error } = await client.from('board_posts').insert([
      {
        id: post.id,
        board_type: boardType,
        category: post.category || '공지사항',
        title: post.title,
        author_name: post.author || '푸드홈',
        content: post.content,
        thumbnail: post.thumbnail || '',
        tags: post.tags || [],
        is_pinned: Boolean(post.isPinned),
        is_secret: false,
        read_count: post.readCount || 1,
        status: 'published',
        created_at: post.date ? `${post.date}T00:00:00.000Z` : new Date().toISOString()
      }
    ]);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || '게시글 저장 실패' };
  }
}

export async function updateBoardPostInDb(
  id: string,
  updates: Partial<PostItem>,
  visitorPassword?: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  try {
    if (visitorPassword && visitorPassword.trim()) {
      const pwHash = await hashPassword(visitorPassword.trim());
      const { data, error } = await client.rpc('update_visitor_board_post', {
        p_id: id,
        p_password_hash: pwHash,
        p_title: updates.title || '',
        p_content: updates.content || ''
      });
      if (error) return { success: false, error: error.message };
      if (!data) return { success: false, error: '비밀번호가 일치하지 않거나 권한이 없습니다.' };
      return { success: true };
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.category !== undefined) patch.category = updates.category;
    if (updates.author !== undefined) patch.author_name = updates.author;
    if (updates.content !== undefined) patch.content = updates.content;
    if (updates.thumbnail !== undefined) patch.thumbnail = updates.thumbnail;
    if (updates.tags !== undefined) patch.tags = updates.tags;
    if (updates.isPinned !== undefined) patch.is_pinned = updates.isPinned;

    const { error } = await client.from('board_posts').update(patch).eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || '게시글 수정 실패' };
  }
}

export async function deleteBoardPostInDb(
  id: string,
  visitorPassword?: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  try {
    if (visitorPassword && visitorPassword.trim()) {
      const pwHash = await hashPassword(visitorPassword.trim());
      const { data, error } = await client.rpc('delete_visitor_board_post', {
        p_id: id,
        p_password_hash: pwHash
      });
      if (error) return { success: false, error: error.message };
      if (!data) return { success: false, error: '비밀번호가 일치하지 않거나 권한이 없습니다.' };
      return { success: true };
    }

    const { error } = await client.from('board_posts').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || '게시글 삭제 실패' };
  }
}

export async function incrementBoardPostReadInDb(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) return;
  try {
    await client.rpc('increment_board_post_read', { p_id: id });
  } catch {
    // Ignore read count sync error gracefully
  }
}

export async function migrateLocalPostsToBoardTable(posts: PostItem[]): Promise<{
  success: boolean;
  count: number;
  error?: string;
}> {
  const client = getSupabaseClient();
  if (!client) return { success: false, count: 0, error: 'Supabase 미연결' };
  if (!posts || posts.length === 0) return { success: true, count: 0 };

  try {
    const rows = posts.map((post) => {
      const boardType =
        post.category === '조리·활용 레시피'
          ? 'recipe'
          : post.category === 'B2B 납품스토리'
          ? 'story'
          : post.category === '이벤트'
          ? 'event'
          : post.category === '공지사항'
          ? 'notice'
          : 'community';
      return {
        id: post.id,
        board_type: boardType,
        category: post.category || '공지사항',
        title: post.title,
        author_name: post.author || '푸드홈',
        content: post.content || '',
        thumbnail: post.thumbnail || '',
        tags: Array.isArray(post.tags) ? post.tags : [],
        is_pinned: Boolean(post.isPinned),
        is_secret: false,
        read_count: Number(post.readCount) || 1,
        status: 'published',
        created_at: post.date ? `${post.date}T00:00:00.000Z` : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    const { error } = await client.from('board_posts').upsert(rows, { onConflict: 'id' });
    if (error) return { success: false, count: 0, error: error.message };
    return { success: true, count: rows.length };
  } catch (e: any) {
    return { success: false, count: 0, error: e?.message || '공개 게시글 이전 실패' };
  }
}

export interface FetchPrivateBoardResult {
  ok: boolean;
  inquiries: B2BInquiry[];
  quotes: QuoteInquiry[];
  tableMissing?: boolean;
  error?: string;
}

function mapAdminPrivateRowToSampleInquiry(row: any): B2BInquiry {
  return {
    id: row.id,
    postNumber: Number(row.post_number) || 1,
    title: row.title || '',
    companyName: row.company_name || row.store_name || '',
    storeName: row.store_name || row.company_name || '',
    contactPerson: row.contact_person || '',
    writer: row.writer_masked || '고객',
    phone: row.phone || '',
    email: row.email || '',
    businessType: row.business_type || '외식업체',
    requestType: (row.request_type as any) || '무료 샘플 요청',
    monthlyUsage: row.monthly_usage || '',
    region: row.region || '',
    address: row.address || '',
    selectedProducts: Array.isArray(row.selected_products) ? row.selected_products : [],
    message: row.message || '',
    status: row.status || '접수완료',
    isSecret: row.is_secret ?? true,
    readCount: Number(row.read_count) || 1,
    createdAt: (row.created_at || new Date().toISOString()).slice(0, 10),
    adminReply: row.admin_reply || undefined,
    adminMemo: row.admin_memo || ''
  };
}

function mapAdminPrivateRowToQuoteInquiry(row: any): QuoteInquiry {
  return {
    id: row.id,
    postNumber: Number(row.post_number) || 1,
    title: row.title || '',
    companyName: row.company_name || '',
    contactPerson: row.contact_person || '',
    phone: row.phone || '',
    email: row.email || '',
    region: row.region || '',
    businessType: row.business_type || '',
    interestedProducts: Array.isArray(row.selected_products) ? row.selected_products : [],
    monthlyVolume: row.monthly_usage || '',
    deliverySchedule: row.delivery_schedule || '',
    message: row.message || '',
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    passwordHash: row.password_hash || undefined,
    isSecret: row.is_secret ?? true,
    status: row.status || '접수완료',
    readCount: Number(row.read_count) || 1,
    createdAt: (row.created_at || new Date().toISOString()).slice(0, 10),
    adminReply: row.admin_reply || undefined,
    adminMemo: row.admin_memo || ''
  };
}

/**
 * Fetch private inquiry boards (`sample` & `quote`):
 * - Admin (`isAdminAuthed = true`): Reads full rows via RLS (`is_site_admin()`).
 * - Public Visitor: Reads strictly masked summaries via `get_public_inquiry_board` RPC (ZERO PII).
 */
export async function fetchPrivateInquiriesForBoard(isAdminAuthed = false): Promise<FetchPrivateBoardResult> {
  const client = getSupabaseClient();
  if (!client) return { ok: false, inquiries: [], quotes: [], error: 'Supabase 미연결' };

  try {
    if (isAdminAuthed) {
      const { data, error } = await client
        .from('board_private_inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .order('post_number', { ascending: false });

      if (error) {
        const msg = error.message || '';
        const tableMissing =
          error.code === '42P01' || error.code === 'PGRST205' || msg.includes('board_private_inquiries');
        return { ok: false, inquiries: [], quotes: [], tableMissing, error: msg };
      }

      const rows = data || [];
      return {
        ok: true,
        inquiries: rows
          .filter((r: any) => r.inquiry_type === 'sample')
          .map(mapAdminPrivateRowToSampleInquiry),
        quotes: rows
          .filter((r: any) => r.inquiry_type === 'quote')
          .map(mapAdminPrivateRowToQuoteInquiry)
      };
    }

    // Anonymous / regular visitor: call masked summary RPC (NO PII exposed!)
    const { data, error } = await client.rpc('get_public_inquiry_board', {
      p_inquiry_type: null
    });

    if (error) {
      const msg = error.message || '';
      const tableMissing =
        error.code === '42883' ||
        error.code === 'PGRST202' ||
        msg.includes('get_public_inquiry_board');
      return { ok: false, inquiries: [], quotes: [], tableMissing, error: msg };
    }

    const rows = Array.isArray(data) ? data : [];
    const inquiries: B2BInquiry[] = [];
    const quotes: QuoteInquiry[] = [];

    for (const row of rows) {
      const createdAt = (row.created_at || new Date().toISOString()).slice(0, 10);
      if (row.inquiry_type === 'sample') {
        inquiries.push({
          id: row.id,
          postNumber: Number(row.post_number) || 1,
          title: row.title,
          companyName: row.store_masked || '비공개',
          storeName: row.store_masked || '비공개',
          contactPerson: row.writer_masked || '고객',
          writer: row.writer_masked || '고객',
          phone: '',
          email: '',
          businessType: '외식업체',
          requestType: '무료 샘플 요청',
          monthlyUsage: '',
          region: '',
          address: '',
          selectedProducts: [],
          message: '',
          status: row.status || '접수완료',
          isSecret: row.is_secret ?? true,
          readCount: Number(row.read_count) || 1,
          createdAt,
          adminReply: row.has_reply
            ? { author: '푸드홈', repliedAt: createdAt, content: '' }
            : undefined
        });
      } else if (row.inquiry_type === 'quote') {
        quotes.push({
          id: row.id,
          postNumber: Number(row.post_number) || 1,
          title: row.title,
          companyName: row.store_masked || '비공개',
          contactPerson: row.writer_masked || '고객',
          phone: '',
          interestedProducts: [],
          message: '',
          isSecret: row.is_secret ?? true,
          status: row.status || '접수완료',
          readCount: Number(row.read_count) || 1,
          createdAt,
          adminReply: row.has_reply
            ? { author: '푸드홈', repliedAt: createdAt, content: '' }
            : undefined
        });
      }
    }

    return { ok: true, inquiries, quotes };
  } catch (e: any) {
    return { ok: false, inquiries: [], quotes: [], error: e?.message || '비공개 게시판 조회 오류' };
  }
}

export async function submitPrivateInquiryToBoard(params: {
  id: string;
  inquiryType: 'sample' | 'quote';
  postNumber: number;
  title: string;
  companyName: string;
  storeName?: string;
  contactPerson: string;
  writerMasked: string;
  phone: string;
  email?: string;
  region?: string;
  address?: string;
  businessType?: string;
  requestType?: string;
  monthlyUsage?: string;
  deliverySchedule?: string;
  selectedProducts?: string[];
  attachments?: { name: string; url?: string; size?: string }[];
  message: string;
  password: string;
}): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  try {
    const passwordHash = await hashPassword((params.password || '').trim() || params.phone || '0000');
    const { error } = await client.from('board_private_inquiries').insert([
      {
        id: params.id,
        inquiry_type: params.inquiryType,
        post_number: params.postNumber,
        title: params.title,
        company_name: params.companyName || params.storeName || '',
        store_name: params.storeName || params.companyName || '',
        contact_person: params.contactPerson || '',
        writer_masked: params.writerMasked || '고객',
        phone: params.phone || '',
        email: params.email || '',
        region: params.region || '',
        address: params.address || '',
        business_type: params.businessType || '외식업체',
        request_type: params.requestType || (params.inquiryType === 'quote' ? '대량 납품 견적' : '무료 샘플 요청'),
        monthly_usage: params.monthlyUsage || '',
        delivery_schedule: params.deliverySchedule || '',
        selected_products: params.selectedProducts || [],
        attachments: params.attachments || [],
        message: params.message || '',
        password_hash: passwordHash,
        is_secret: true,
        status: '접수완료',
        read_count: 1
      }
    ]);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || '비공개 문의 저장 실패' };
  }
}

export async function unlockPrivateInquiryFromBoard(
  id: string,
  plainPassword: string
): Promise<{
  ok: boolean;
  passwordHash: string;
  sampleItem?: B2BInquiry;
  quoteItem?: QuoteInquiry;
  error?: string;
}> {
  const passwordHash = await hashPassword((plainPassword || '').trim());
  const client = getSupabaseClient();
  if (!client) return { ok: false, passwordHash, error: 'Supabase 미연결' };

  try {
    const { data, error } = await client.rpc('unlock_private_inquiry', {
      p_id: id,
      p_password_hash: passwordHash
    });

    if (error) return { ok: false, passwordHash, error: error.message };
    if (!data || !data.ok || !data.item) {
      return { ok: false, passwordHash, error: data?.error || '비밀번호가 일치하지 않습니다.' };
    }

    const row = data.item;
    if (row.inquiry_type === 'quote') {
      return {
        ok: true,
        passwordHash,
        quoteItem: mapAdminPrivateRowToQuoteInquiry(row)
      };
    }
    return {
      ok: true,
      passwordHash,
      sampleItem: mapAdminPrivateRowToSampleInquiry(row)
    };
  } catch (e: any) {
    return { ok: false, passwordHash, error: e?.message || '비밀글 열람 오류' };
  }
}

export async function updatePrivateInquiryByAuthorInBoard(
  id: string,
  passwordHash: string,
  title: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  try {
    const { data, error } = await client.rpc('update_private_inquiry_with_password', {
      p_id: id,
      p_password_hash: passwordHash,
      p_title: title,
      p_message: message
    });
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: '수정 권한이 없거나 비밀번호가 일치하지 않습니다.' };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || '수정 중 오류가 발생했습니다.' };
  }
}

export async function deletePrivateInquiryByAuthorInBoard(
  id: string,
  passwordHash: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  try {
    const { data, error } = await client.rpc('delete_private_inquiry_with_password', {
      p_id: id,
      p_password_hash: passwordHash
    });
    if (error) return { success: false, error: error.message };
    if (!data) return { success: false, error: '삭제 권한이 없거나 비밀번호가 일치하지 않습니다.' };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || '삭제 중 오류가 발생했습니다.' };
  }
}

export async function adminUpdatePrivateInquiryInBoard(
  id: string,
  patch: {
    status?: string;
    adminMemo?: string;
    adminReply?: { content: string; repliedAt: string; author: string };
    title?: string;
    message?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  try {
    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.status !== undefined) updatePayload.status = patch.status;
    if (patch.adminMemo !== undefined) updatePayload.admin_memo = patch.adminMemo;
    if (patch.adminReply !== undefined) updatePayload.admin_reply = patch.adminReply;
    if (patch.title !== undefined) updatePayload.title = patch.title;
    if (patch.message !== undefined) updatePayload.message = patch.message;

    const { error } = await client
      .from('board_private_inquiries')
      .update(updatePayload)
      .eq('id', id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || '문의 업데이트 실패' };
  }
}

export async function adminDeletePrivateInquiryInBoard(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, error: 'Supabase 미연결' };

  try {
    const { error } = await client.from('board_private_inquiries').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e?.message || '문의 삭제 실패' };
  }
}

export async function migrateLocalInquiriesAndQuotesToBoard(
  inquiries: B2BInquiry[],
  quotes: QuoteInquiry[]
): Promise<{ success: boolean; count: number; error?: string }> {
  const client = getSupabaseClient();
  if (!client) return { success: false, count: 0, error: 'Supabase 미연결' };

  try {
    const sampleRows = await Promise.all(
      (inquiries || []).map(async (inq, idx) => {
        const plainOrDefault = (inq.password || '').trim() || '1234';
        const pwHash = await hashPassword(plainOrDefault);
        const name = (inq.contactPerson || '').trim();
        const masked =
          inq.writer ||
          (name.length > 2 ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1] : name.length === 2 ? `${name[0]}*` : name || '고객');

        return {
          id: inq.id,
          inquiry_type: 'sample',
          post_number: Number(inq.postNumber) || inquiries.length - idx,
          title: inq.title || `[${inq.storeName || inq.companyName}] 무료 샘플 신청합니다.`,
          company_name: inq.companyName || inq.storeName || '',
          store_name: inq.storeName || inq.companyName || '',
          contact_person: inq.contactPerson || '',
          writer_masked: masked,
          phone: inq.phone || '',
          email: inq.email || '',
          region: inq.region || '',
          address: inq.address || '',
          business_type: inq.businessType || '외식업체',
          request_type: inq.requestType || '무료 샘플 요청',
          monthly_usage: inq.monthlyUsage || '',
          delivery_schedule: '',
          selected_products: Array.isArray(inq.selectedProducts) ? inq.selectedProducts : [],
          attachments: [],
          message: inq.message || '',
          password_hash: pwHash,
          is_secret: inq.isSecret ?? true,
          status: inq.status || '접수완료',
          read_count: Number(inq.readCount) || 1,
          admin_reply: inq.adminReply || null,
          admin_memo: inq.adminMemo || '',
          created_at: inq.createdAt && inq.createdAt.length >= 10
            ? `${inq.createdAt.slice(0, 10)}T00:00:00.000Z`
            : new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      })
    );

    const quoteRows = await Promise.all(
      (quotes || []).map(async (q, idx) => {
        const pwHash = q.passwordHash || (await hashPassword((q.rawPasswordHint || '').trim() || '1234'));
        const name = (q.contactPerson || '').trim();
        const masked =
          name.length > 2 ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1] : name.length === 2 ? `${name[0]}*` : name || '고객';

        return {
          id: q.id,
          inquiry_type: 'quote',
          post_number: Number(q.postNumber) || quotes.length - idx,
          title: q.title || `[${q.companyName}] 납품 견적 상담 문의`,
          company_name: q.companyName || '',
          store_name: q.companyName || '',
          contact_person: q.contactPerson || '',
          writer_masked: masked,
          phone: q.phone || '',
          email: q.email || '',
          region: q.region || '',
          address: '',
          business_type: q.businessType || '',
          request_type: '대량 납품 견적',
          monthly_usage: q.monthlyVolume || '',
          delivery_schedule: q.deliverySchedule || '',
          selected_products: Array.isArray(q.interestedProducts) ? q.interestedProducts : [],
          attachments: Array.isArray(q.attachments) ? q.attachments : [],
          message: q.message || '',
          password_hash: pwHash,
          is_secret: q.isSecret ?? true,
          status: q.status || '접수완료',
          read_count: Number(q.readCount) || 1,
          admin_reply: q.adminReply || null,
          admin_memo: q.adminMemo || '',
          created_at: q.createdAt && q.createdAt.length >= 10
            ? `${q.createdAt.slice(0, 10)}T00:00:00.000Z`
            : new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      })
    );

    const allRows = [...sampleRows, ...quoteRows];
    if (allRows.length === 0) return { success: true, count: 0 };

    const { error } = await client.from('board_private_inquiries').upsert(allRows, { onConflict: 'id' });
    if (error) return { success: false, count: 0, error: error.message };
    return { success: true, count: allRows.length };
  } catch (e: any) {
    return { success: false, count: 0, error: e?.message || '비공개 문의 이전 실패' };
  }
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

/**
 * Phase 2 Safe SQL Migration Script for Supabase (`board_posts`, `board_private_inquiries`, `foodhome-media` Storage)
 */
export const SUPABASE_BOARD_SETUP_SQL = `-- ============================================================================
-- FOODHOME (푸드홈) 2차 마이그레이션: 게시판 원격 DB 동기화 & Storage 버킷 설정
-- ============================================================================
-- [안전 원칙]
-- 1. 기존 테이블(site_admins, site_contents, form_definitions, form_submissions)
--    및 기존 데이터를 절대 삭제하거나 수정하지 않습니다.
-- 2. 공개 게시판(board_posts)과 개인정보 포함 비공개 문의(board_private_inquiries)를
--    엄격히 분리하여 일반 방문자에게 연락처/주소/이메일이 절대 노출되지 않습니다.
-- 3. localStorage 5MB 초과 방지를 위해 'foodhome-media' Storage 버킷과 정책을 생성합니다.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.board_posts (
  id TEXT PRIMARY KEY,
  board_type TEXT NOT NULL DEFAULT 'notice',
  category TEXT NOT NULL DEFAULT '공지사항',
  title TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT '푸드홈',
  content TEXT NOT NULL,
  thumbnail TEXT DEFAULT '',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_secret BOOLEAN NOT NULL DEFAULT false,
  read_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_board_posts_created_at
  ON public.board_posts (is_pinned DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_board_posts_category
  ON public.board_posts (category);

ALTER TABLE public.board_posts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.board_post_secrets (
  post_id TEXT PRIMARY KEY REFERENCES public.board_posts(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.board_post_secrets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'board_posts'
      AND policyname = 'Public can read published board posts'
  ) THEN
    CREATE POLICY "Public can read published board posts"
      ON public.board_posts FOR SELECT TO public
      USING (is_secret = false AND status = 'published');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'board_posts'
      AND policyname = 'Public can create board posts'
  ) THEN
    CREATE POLICY "Public can create board posts"
      ON public.board_posts FOR INSERT TO public
      WITH CHECK (
        is_secret = false AND status = 'published' AND is_pinned = false
        AND char_length(trim(title)) > 0 AND char_length(trim(content)) > 0
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'board_posts'
      AND policyname = 'Admins can manage all board posts'
  ) THEN
    CREATE POLICY "Admins can manage all board posts"
      ON public.board_posts FOR ALL TO authenticated
      USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'board_post_secrets'
      AND policyname = 'Admins can manage board post secrets'
  ) THEN
    CREATE POLICY "Admins can manage board post secrets"
      ON public.board_post_secrets FOR ALL TO authenticated
      USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.increment_board_post_read(p_id TEXT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_next INTEGER;
BEGIN
  UPDATE public.board_posts
  SET read_count = COALESCE(read_count, 0) + 1
  WHERE id = p_id AND (is_secret = false OR public.is_site_admin())
  RETURNING read_count INTO v_next;
  RETURN COALESCE(v_next, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.increment_board_post_read(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_board_post_read(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.create_visitor_board_post(
  p_id TEXT, p_board_type TEXT, p_category TEXT, p_title TEXT,
  p_author_name TEXT, p_content TEXT, p_thumbnail TEXT DEFAULT '',
  p_tags JSONB DEFAULT '[]'::jsonb, p_password_hash TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.board_posts%ROWTYPE;
BEGIN
  IF char_length(trim(COALESCE(p_title, ''))) = 0 OR char_length(trim(COALESCE(p_content, ''))) = 0 THEN
    RAISE EXCEPTION '제목과 본문을 입력해 주세요.';
  END IF;
  INSERT INTO public.board_posts (
    id, board_type, category, title, author_name, content, thumbnail, tags,
    is_pinned, is_secret, read_count, status, created_at, updated_at
  )
  VALUES (
    p_id, COALESCE(NULLIF(trim(p_board_type), ''), 'community'),
    COALESCE(NULLIF(trim(p_category), ''), '고객소통'), trim(p_title),
    COALESCE(NULLIF(trim(p_author_name), ''), '방문자'), trim(p_content),
    COALESCE(p_thumbnail, ''), COALESCE(p_tags, '[]'::jsonb),
    false, false, 1, 'published', now(), now()
  )
  RETURNING * INTO v_row;
  IF p_password_hash IS NOT NULL AND char_length(trim(p_password_hash)) > 0 THEN
    INSERT INTO public.board_post_secrets (post_id, password_hash)
    VALUES (v_row.id, trim(p_password_hash))
    ON CONFLICT (post_id) DO UPDATE SET password_hash = EXCLUDED.password_hash;
  END IF;
  RETURN to_jsonb(v_row);
END;
$$;

REVOKE ALL ON FUNCTION public.create_visitor_board_post(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_visitor_board_post(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.update_visitor_board_post(
  p_id TEXT, p_password_hash TEXT, p_title TEXT, p_content TEXT
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_is_admin BOOLEAN := public.is_site_admin(); v_match BOOLEAN := false;
BEGIN
  IF NOT v_is_admin THEN
    SELECT EXISTS (SELECT 1 FROM public.board_post_secrets WHERE post_id = p_id AND password_hash = trim(COALESCE(p_password_hash, ''))) INTO v_match;
    IF NOT v_match THEN RETURN false; END IF;
  END IF;
  UPDATE public.board_posts
  SET title = COALESCE(NULLIF(trim(p_title), ''), title),
      content = COALESCE(NULLIF(trim(p_content), ''), content),
      updated_at = now()
  WHERE id = p_id;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.update_visitor_board_post(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_visitor_board_post(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.delete_visitor_board_post(p_id TEXT, p_password_hash TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_is_admin BOOLEAN := public.is_site_admin(); v_match BOOLEAN := false;
BEGIN
  IF NOT v_is_admin THEN
    SELECT EXISTS (SELECT 1 FROM public.board_post_secrets WHERE post_id = p_id AND password_hash = trim(COALESCE(p_password_hash, ''))) INTO v_match;
    IF NOT v_match THEN RETURN false; END IF;
  END IF;
  DELETE FROM public.board_posts WHERE id = p_id;
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_visitor_board_post(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_visitor_board_post(TEXT, TEXT) TO anon, authenticated;

CREATE TABLE IF NOT EXISTS public.board_private_inquiries (
  id TEXT PRIMARY KEY,
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('sample', 'quote')),
  post_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL DEFAULT '',
  store_name TEXT DEFAULT '',
  contact_person TEXT NOT NULL DEFAULT '',
  writer_masked TEXT NOT NULL DEFAULT '고객',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT DEFAULT '',
  region TEXT DEFAULT '',
  address TEXT DEFAULT '',
  business_type TEXT DEFAULT '',
  request_type TEXT DEFAULT '무료 샘플 요청',
  monthly_usage TEXT DEFAULT '',
  delivery_schedule TEXT DEFAULT '',
  selected_products JSONB NOT NULL DEFAULT '[]'::jsonb,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  message TEXT DEFAULT '',
  password_hash TEXT NOT NULL,
  is_secret BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT '접수완료',
  read_count INTEGER NOT NULL DEFAULT 1,
  admin_reply JSONB,
  admin_memo TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_board_private_inquiries_type_created
  ON public.board_private_inquiries (inquiry_type, created_at DESC);

ALTER TABLE public.board_private_inquiries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'board_private_inquiries'
      AND policyname = 'Public can submit private inquiries'
  ) THEN
    CREATE POLICY "Public can submit private inquiries"
      ON public.board_private_inquiries FOR INSERT TO public
      WITH CHECK (
        inquiry_type IN ('sample', 'quote')
        AND char_length(trim(title)) > 0 AND char_length(trim(password_hash)) > 0
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'board_private_inquiries'
      AND policyname = 'Admins can manage all private inquiries'
  ) THEN
    CREATE POLICY "Admins can manage all private inquiries"
      ON public.board_private_inquiries FOR ALL TO authenticated
      USING (public.is_site_admin()) WITH CHECK (public.is_site_admin());
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.get_public_inquiry_board(p_inquiry_type TEXT DEFAULT NULL)
RETURNS TABLE (
  id TEXT, inquiry_type TEXT, post_number INTEGER, title TEXT,
  writer_masked TEXT, store_masked TEXT, status TEXT, is_secret BOOLEAN,
  has_reply BOOLEAN, read_count INTEGER, created_at TIMESTAMPTZ
)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT
    i.id, i.inquiry_type, i.post_number,
    regexp_replace(
      regexp_replace(COALESCE(i.title, ''), '\\d{2,3}[-\\s]?\\d{3,4}[-\\s]?\\d{4}', '***-****', 'g'),
      '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}', '****@****', 'g'
    ) AS title,
    COALESCE(NULLIF(i.writer_masked, ''), '고객') AS writer_masked,
    CASE
      WHEN char_length(COALESCE(NULLIF(i.store_name, ''), i.company_name, '')) <= 2
        THEN COALESCE(NULLIF(i.store_name, ''), i.company_name, '비공개')
      ELSE left(COALESCE(NULLIF(i.store_name, ''), i.company_name), 2) || '**'
    END AS store_masked,
    i.status, i.is_secret, (i.admin_reply IS NOT NULL) AS has_reply,
    COALESCE(i.read_count, 1) AS read_count, i.created_at
  FROM public.board_private_inquiries i
  WHERE (p_inquiry_type IS NULL OR i.inquiry_type = p_inquiry_type)
  ORDER BY i.created_at DESC, i.post_number DESC;
$$;

REVOKE ALL ON FUNCTION public.get_public_inquiry_board(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_inquiry_board(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.unlock_private_inquiry(p_id TEXT, p_password_hash TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.board_private_inquiries%ROWTYPE; v_is_admin BOOLEAN := public.is_site_admin();
BEGIN
  SELECT * INTO v_row FROM public.board_private_inquiries WHERE id = p_id;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', '게시글을 찾을 수 없습니다.'); END IF;
  IF NOT v_is_admin THEN
    IF v_row.password_hash IS DISTINCT FROM trim(COALESCE(p_password_hash, '')) THEN
      RETURN jsonb_build_object('ok', false, 'error', '비밀번호가 일치하지 않습니다.');
    END IF;
  END IF;
  UPDATE public.board_private_inquiries SET read_count = COALESCE(read_count, 0) + 1 WHERE id = p_id RETURNING * INTO v_row;
  RETURN jsonb_build_object(
    'ok', true,
    'item', jsonb_build_object(
      'id', v_row.id, 'inquiry_type', v_row.inquiry_type, 'post_number', v_row.post_number,
      'title', v_row.title, 'company_name', v_row.company_name, 'store_name', v_row.store_name,
      'contact_person', v_row.contact_person, 'writer_masked', v_row.writer_masked,
      'phone', v_row.phone, 'email', v_row.email, 'region', v_row.region, 'address', v_row.address,
      'business_type', v_row.business_type, 'request_type', v_row.request_type,
      'monthly_usage', v_row.monthly_usage, 'delivery_schedule', v_row.delivery_schedule,
      'selected_products', v_row.selected_products, 'attachments', v_row.attachments,
      'message', v_row.message, 'is_secret', v_row.is_secret, 'status', v_row.status,
      'read_count', v_row.read_count, 'admin_reply', v_row.admin_reply,
      'admin_memo', CASE WHEN v_is_admin THEN v_row.admin_memo ELSE NULL END,
      'created_at', v_row.created_at
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.unlock_private_inquiry(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.unlock_private_inquiry(TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.update_private_inquiry_with_password(
  p_id TEXT, p_password_hash TEXT, p_title TEXT, p_message TEXT
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_is_admin BOOLEAN := public.is_site_admin();
BEGIN
  UPDATE public.board_private_inquiries
  SET title = COALESCE(NULLIF(trim(p_title), ''), title), message = COALESCE(p_message, message), updated_at = now()
  WHERE id = p_id AND (v_is_admin OR password_hash = trim(COALESCE(p_password_hash, '')));
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.update_private_inquiry_with_password(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_private_inquiry_with_password(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.delete_private_inquiry_with_password(p_id TEXT, p_password_hash TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_is_admin BOOLEAN := public.is_site_admin();
BEGIN
  DELETE FROM public.board_private_inquiries
  WHERE id = p_id AND (v_is_admin OR password_hash = trim(COALESCE(p_password_hash, '')));
  RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_private_inquiry_with_password(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_private_inquiry_with_password(TEXT, TEXT) TO anon, authenticated;

INSERT INTO storage.buckets (id, name, public)
VALUES ('foodhome-media', 'foodhome-media', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public can view foodhome media'
  ) THEN
    CREATE POLICY "Public can view foodhome media"
      ON storage.objects FOR SELECT TO public USING (bucket_id = 'foodhome-media');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload foodhome media'
  ) THEN
    CREATE POLICY "Admins can upload foodhome media"
      ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'foodhome-media' AND public.is_site_admin());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can update foodhome media'
  ) THEN
    CREATE POLICY "Admins can update foodhome media"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'foodhome-media' AND public.is_site_admin())
      WITH CHECK (bucket_id = 'foodhome-media' AND public.is_site_admin());
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete foodhome media'
  ) THEN
    CREATE POLICY "Admins can delete foodhome media"
      ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'foodhome-media' AND public.is_site_admin());
  END IF;
END
$$;
`;
