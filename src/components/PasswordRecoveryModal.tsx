import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Send,
  Clock
} from 'lucide-react';

export const PasswordRecoveryModal: React.FC = () => {
  const {
    isPasswordRecoveryMode,
    isCheckingRecoverySession,
    hasValidRecoverySession,
    passwordRecoveryEmail,
    passwordRecoveryError,
    supabaseConfig,
    requestPasswordResetOtp,
    verifyPasswordResetOtp,
    submitPasswordRecoveryUpdate,
    finishPasswordRecoveryToLogin,
    cancelPasswordRecovery
  } = useApp();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // OTP fallback state when session is missing/expired
  const [otpEmail, setOtpEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [otpErrorMsg, setOtpErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (passwordRecoveryEmail && !otpEmail) {
      setOtpEmail(passwordRecoveryEmail);
    }
  }, [passwordRecoveryEmail, otpEmail]);

  useEffect(() => {
    setErrorMessage(passwordRecoveryError || null);
  }, [passwordRecoveryError]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!isCompleted) return;
    const timer = window.setTimeout(() => {
      finishPasswordRecoveryToLogin();
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [isCompleted, finishPasswordRecoveryToLogin]);

  if (!isPasswordRecoveryMode) return null;

  const isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

  const handleSubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage(null);

    if (!hasValidRecoverySession) {
      setErrorMessage('유효한 인증 세션이 없습니다. 이메일 인증번호 확인을 다시 진행해 주세요.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErrorMessage('새 비밀번호와 새 비밀번호 확인을 모두 입력해 주세요.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('새 비밀번호는 최소 6자리 이상으로 입력해 주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsSubmitting(true);
    const result = await submitPasswordRecoveryUpdate(newPassword);
    setIsSubmitting(false);

    if (result.success) {
      setNewPassword('');
      setConfirmPassword('');
      setIsCompleted(true);
    } else {
      setErrorMessage(result.error || '비밀번호 변경에 실패했습니다.');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSendingOtp || cooldown > 0) return;

    setOtpErrorMsg(null);
    setOtpSuccessMsg(null);

    setIsSendingOtp(true);
    const res = await requestPasswordResetOtp(otpEmail.trim());
    setIsSendingOtp(false);

    if (res.success) {
      setCooldown(res.cooldownSeconds || 60);
      setOtpSuccessMsg(`${otpEmail.trim()} 주소로 인증번호를 발송했습니다.`);
    } else {
      if (res.cooldownSeconds && res.cooldownSeconds > 0) {
        setCooldown(res.cooldownSeconds);
      }
      setOtpErrorMsg(res.error || '인증번호 발송에 실패했습니다.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifyingOtp) return;

    setOtpErrorMsg(null);
    setIsVerifyingOtp(true);
    const res = await verifyPasswordResetOtp(otpEmail.trim(), otpToken.trim());
    setIsVerifyingOtp(false);

    if (!res.success) {
      setOtpErrorMsg(res.error || '인증번호 확인에 실패했습니다.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-70 bg-stone-950/92 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto"
      data-admin-area="true"
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden my-auto"
        data-admin-area="true"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#872D35] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            {isCheckingRecoverySession ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-7 h-7" />
            ) : (
              <KeyRound className="w-7 h-7" />
            )}
          </div>
          <span className="text-[10px] font-black tracking-widest text-[#872D35] uppercase bg-[#872D35]/10 px-2.5 py-0.5 rounded-full">
            FOODHOME AUTH RECOVERY
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-2">
            {isCheckingRecoverySession
              ? '인증 세션 확인 중'
              : isCompleted
              ? '비밀번호 변경 완료'
              : 'FOODHOME 관리자 비밀번호 재설정'}
          </h2>
          {passwordRecoveryEmail && hasValidRecoverySession && !isCompleted && !isCheckingRecoverySession && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-[11px] font-bold text-stone-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>인증 완료: {passwordRecoveryEmail}</span>
            </div>
          )}
        </div>

        {isCheckingRecoverySession ? (
          <div className="py-6 text-center space-y-3">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-stone-600 text-xs font-semibold flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#872D35]" />
              <span>Supabase 인증 세션을 확인하고 있습니다...</span>
            </div>
            <button
              type="button"
              onClick={cancelPasswordRecovery}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 underline underline-offset-4 cursor-pointer"
            >
              취소하고 홈페이지로 돌아가기
            </button>
          </div>
        ) : isCompleted ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 관리자 로그인을 진행해 주세요.
              </span>
            </div>

            <button
              type="button"
              onClick={finishPasswordRecoveryToLogin}
              className="w-full py-3 rounded-xl bg-[#872D35] hover:bg-[#9E2A2B] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>로그인 화면으로 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : !hasValidRecoverySession ? (
          <div className="space-y-4">
            {passwordRecoveryError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{passwordRecoveryError}</span>
              </div>
            )}

            {isSupabaseConfigured ? (
              <div className="space-y-3">
                <form onSubmit={handleSendOtp} className="space-y-2.5">
                  <label className="block text-xs font-bold text-stone-700">관리자 이메일</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => {
                          setOtpEmail(e.target.value);
                          setOtpErrorMsg(null);
                        }}
                        placeholder="admin@example.com"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSendingOtp || cooldown > 0}
                      className="px-3 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#9E2A2B] text-white font-bold text-xs cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{cooldown > 0 ? `${cooldown}초` : '발송'}</span>
                    </button>
                  </div>
                  {cooldown > 0 && (
                    <p className="text-[11px] text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{cooldown}초 후 인증번호 재발송 가능</span>
                    </p>
                  )}
                </form>

                {otpSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    {otpSuccessMsg}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-2.5 pt-2 border-t border-stone-100">
                  <label className="block text-xs font-bold text-stone-700">이메일 OTP 인증번호</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpToken}
                    onChange={(e) => {
                      setOtpToken(e.target.value);
                      setOtpErrorMsg(null);
                    }}
                    placeholder="이메일 본문의 인증번호 입력"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm tracking-widest font-bold focus:outline-none focus:border-[#872D35] bg-stone-50"
                  />

                  {otpErrorMsg && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                      {otpErrorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifyingOtp || !otpToken.trim()}
                    className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                  >
                    {isVerifyingOtp ? '인증번호 확인 중...' : '인증번호 확인'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                현재 브라우저에 Supabase URL / Anon Key가 설정되어 있지 않습니다.
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={finishPasswordRecoveryToLogin}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs cursor-pointer"
              >
                로그인 화면으로 돌아가기
              </button>
              <button
                type="button"
                onClick={cancelPasswordRecovery}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 font-semibold text-xs cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitNewPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">새 비밀번호</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  autoFocus
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="6자리 이상 새 비밀번호 입력"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  aria-label={showNewPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">새 비밀번호 확인</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="새 비밀번호 다시 입력"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !hasValidRecoverySession}
              className="w-full py-3 rounded-xl bg-[#872D35] hover:bg-[#9E2A2B] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>비밀번호 변경 처리 중...</span>
                </>
              ) : (
                <span>비밀번호 변경</span>
              )}
            </button>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={finishPasswordRecoveryToLogin}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800 underline underline-offset-4 cursor-pointer"
              >
                로그인 화면으로 돌아가기
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
