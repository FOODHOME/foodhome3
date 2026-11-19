import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getSupabaseConnectionDiagnostics } from '../lib/supabase';
import {
  Lock,
  User,
  X,
  Loader2,
  KeyRound,
  CheckCircle2,
  Mail,
  Send,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  Eye,
  EyeOff,
  Clock,
  RefreshCw
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalStep = 'login' | 'otp' | 'new_password';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const {
    handleAdminLogin,
    setIsAdminOpen,
    supabaseConfig,
    hasValidRecoverySession,
    passwordRecoveryEmail,
    passwordResetSuccessNotice,
    legacyAuthLinkNotice,
    clearPasswordResetSuccessNotice,
    clearLegacyAuthLinkNotice,
    requestPasswordResetOtp,
    verifyPasswordResetOtp,
    submitPasswordRecoveryUpdate,
    cancelPasswordRecovery
  } = useApp();

  // Login step state
  const [step, setStep] = useState<ModalStep>('login');
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // OTP request & verification state
  const [resetEmail, setResetEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpSendSuccessMsg, setOtpSendSuccessMsg] = useState<string | null>(null);
  const [otpErrorMsg, setOtpErrorMsg] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  // New password step state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [updateErrorMsg, setUpdateErrorMsg] = useState<string | null>(null);

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  // If user landed via an expired legacy email link, switch directly to OTP step with guidance
  useEffect(() => {
    if (isOpen && legacyAuthLinkNotice) {
      setStep('otp');
      setOtpErrorMsg(legacyAuthLinkNotice);
    }
  }, [isOpen, legacyAuthLinkNotice]);

  if (!isOpen) return null;

  const isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey);
  const diagnostics = getSupabaseConnectionDiagnostics();

  const resetRecoveryLocalState = () => {
    setOtpCode('');
    setOtpSent(false);
    setOtpSendSuccessMsg(null);
    setOtpErrorMsg(null);
    setVerifiedEmail(null);
    setNewPassword('');
    setConfirmPassword('');
    setUpdateErrorMsg(null);
  };

  const handleCloseModal = async () => {
    clearPasswordResetSuccessNotice();
    clearLegacyAuthLinkNotice();
    if (step === 'new_password' || hasValidRecoverySession) {
      await cancelPasswordRecovery();
    }
    resetRecoveryLocalState();
    setStep('login');
    setErrorMessage(null);
    onClose();
  };

  const handleOpenOtpStep = () => {
    clearPasswordResetSuccessNotice();
    clearLegacyAuthLinkNotice();
    setErrorMessage(null);
    resetRecoveryLocalState();
    if (emailOrId.includes('@') && !resetEmail) {
      setResetEmail(emailOrId.trim());
    }
    setStep('otp');
  };

  const handleBackToLogin = async () => {
    clearLegacyAuthLinkNotice();
    if (step === 'new_password' || hasValidRecoverySession) {
      await cancelPasswordRecovery();
    }
    resetRecoveryLocalState();
    setErrorMessage(null);
    setStep('login');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMessage('비밀번호를 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await handleAdminLogin({
      email: emailOrId.trim(),
      password: password.trim()
    });

    setIsLoading(false);

    if (result.success) {
      clearPasswordResetSuccessNotice();
      clearLegacyAuthLinkNotice();
      onClose();
      setIsAdminOpen(true);
    } else {
      setErrorMessage(result.error || '아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSendingOtp || resendCooldown > 0) return;

    clearLegacyAuthLinkNotice();
    setOtpErrorMsg(null);
    setOtpSendSuccessMsg(null);

    const targetEmail = resetEmail.trim();
    if (!targetEmail) {
      setOtpErrorMsg('관리자 이메일 주소를 입력해 주세요.');
      return;
    }

    setIsSendingOtp(true);
    const res = await requestPasswordResetOtp(targetEmail);
    setIsSendingOtp(false);

    if (res.success) {
      setOtpSent(true);
      setResendCooldown(res.cooldownSeconds || 60);
      setOtpSendSuccessMsg(
        `${targetEmail} 주소로 비밀번호 재설정 인증번호를 발송했습니다. 이메일 본문에 표시된 인증번호를 아래에 입력해 주세요.${
          res.recoverEndpoint ? ` (요청 엔드포인트: ${res.recoverEndpoint})` : ''
        }`
      );
    } else {
      if (res.cooldownSeconds && res.cooldownSeconds > 0) {
        setResendCooldown(res.cooldownSeconds);
      }
      setOtpErrorMsg(res.error || '인증번호 발송에 실패했습니다.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerifyingOtp) return;

    setOtpErrorMsg(null);

    const targetEmail = resetEmail.trim();
    const token = otpCode.trim();

    if (!targetEmail) {
      setOtpErrorMsg('관리자 이메일 주소를 입력해 주세요.');
      return;
    }

    if (!token) {
      setOtpErrorMsg('이메일로 받은 인증번호를 입력해 주세요.');
      return;
    }

    setIsVerifyingOtp(true);
    const res = await verifyPasswordResetOtp(targetEmail, token);
    setIsVerifyingOtp(false);

    if (res.success) {
      setVerifiedEmail(res.email || targetEmail);
      setOtpErrorMsg(null);
      setUpdateErrorMsg(null);
      setStep('new_password');
    } else {
      setOtpErrorMsg(res.error || '인증번호 확인에 실패했습니다.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdatingPassword) return;

    setUpdateErrorMsg(null);

    if (!hasValidRecoverySession) {
      setUpdateErrorMsg('인증 세션이 확인되지 않았습니다. 인증번호 확인부터 다시 진행해 주세요.');
      setStep('otp');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setUpdateErrorMsg('새 비밀번호와 새 비밀번호 확인을 모두 입력해 주세요.');
      return;
    }

    if (newPassword.length < 6) {
      setUpdateErrorMsg('새 비밀번호는 최소 6자리 이상으로 입력해 주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setUpdateErrorMsg('새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsUpdatingPassword(true);
    const res = await submitPasswordRecoveryUpdate(newPassword);
    setIsUpdatingPassword(false);

    if (res.success) {
      const targetEmail = verifiedEmail || passwordRecoveryEmail || resetEmail.trim();
      if (targetEmail) {
        setEmailOrId(targetEmail);
      }
      setPassword('');
      resetRecoveryLocalState();
      setStep('login');
    } else {
      if (res.errorType === 'session_creation_failed') {
        setOtpErrorMsg(res.error || '인증 세션이 만료되었습니다. 인증번호를 다시 확인해 주세요.');
        setVerifiedEmail(null);
        setStep('otp');
      } else {
        setUpdateErrorMsg(res.error || '비밀번호 변경에 실패했습니다.');
      }
    }
  };

  const canShowPasswordChangeForm =
    step === 'new_password' && hasValidRecoverySession && Boolean(verifiedEmail || passwordRecoveryEmail);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 overflow-y-auto"
      data-admin-area="true"
    >
      <div
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
        data-admin-area="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleCloseModal}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#872D35] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            {canShowPasswordChangeForm ? (
              <KeyRound className="w-7 h-7" />
            ) : step === 'otp' ? (
              <Mail className="w-7 h-7" />
            ) : (
              <Lock className="w-7 h-7" />
            )}
          </div>
          <span className="text-[10px] font-black tracking-widest text-[#872D35] uppercase bg-[#872D35]/10 px-2.5 py-0.5 rounded-full">
            {canShowPasswordChangeForm
              ? 'FOODHOME NEW PASSWORD'
              : step === 'otp'
              ? 'FOODHOME OTP VERIFICATION'
              : 'FOODHOME SECURITY'}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-2">
            {canShowPasswordChangeForm
              ? '새 비밀번호 설정'
              : step === 'otp'
              ? '관리자 비밀번호 찾기 (OTP)'
              : '웹사이트 관리자 인증'}
          </h2>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            {canShowPasswordChangeForm
              ? '이메일 인증번호 확인이 완료되었습니다. 새 비밀번호를 입력해 주세요.'
              : step === 'otp'
              ? '관리자 이메일로 OTP 인증번호를 받아 입력하시면 비밀번호를 재설정할 수 있습니다.'
              : '푸드홈 공식 사이트 운영 및 신청서 조회를 위해 로그인해 주세요.'}
          </p>
          {canShowPasswordChangeForm && (verifiedEmail || passwordRecoveryEmail) && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-[11px] font-bold text-stone-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>인증 완료: {verifiedEmail || passwordRecoveryEmail}</span>
            </div>
          )}
        </div>

        {/* Success Notice after password update */}
        {passwordResetSuccessNotice && step === 'login' && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{passwordResetSuccessNotice}</span>
          </div>
        )}

        {/* STEP 3: Password Change Form (Only shown when verifyOtp + getSession succeeded) */}
        {canShowPasswordChangeForm ? (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                새 비밀번호
              </label>
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
                    setUpdateErrorMsg(null);
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
              <label className="block text-xs font-bold text-stone-700 mb-1">
                새 비밀번호 확인
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setUpdateErrorMsg(null);
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

            {updateErrorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{updateErrorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full py-3 rounded-xl bg-[#872D35] hover:bg-[#9E2A2B] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>비밀번호 변경 중...</span>
                </>
              ) : (
                <span>비밀번호 변경</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              disabled={isUpdatingPassword}
              className="w-full py-2 text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>로그인 화면으로 돌아가기</span>
            </button>
          </form>
        ) : step === 'otp' ? (
          /* STEP 2: Email OTP Send & Verify */
          <div className="space-y-4">
            {!isSupabaseConfigured && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  현재 브라우저에 Supabase URL / Anon Key가 설정되어 있지 않아 인증번호 메일을 발송할 수 없습니다.
                </span>
              </div>
            )}

            {/* Send OTP Form */}
            <form onSubmit={handleSendOtp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  관리자 이메일
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      autoFocus
                      required
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        setOtpErrorMsg(null);
                      }}
                      placeholder="admin@example.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSendingOtp || resendCooldown > 0 || !isSupabaseConfigured}
                    className="px-3.5 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#9E2A2B] text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    {isSendingOtp ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>발송 중</span>
                      </>
                    ) : otpSent ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>인증번호 재발송</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>인증번호 발송</span>
                      </>
                    )}
                  </button>
                </div>
                {resendCooldown > 0 && (
                  <p className="mt-1.5 text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#872D35]" />
                    <span>재발송 대기시간: {resendCooldown}초 후 다시 보낼 수 있습니다.</span>
                  </p>
                )}

                {diagnostics.recoverEndpoint && (
                  <div className="mt-2 p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[10px] text-stone-600 space-y-1">
                    <div className="font-bold text-stone-700">
                      연결된 Supabase 요청 주소 ({diagnostics.source === 'localStorage' ? '관리자 저장 설정' : 'VITE_SUPABASE_URL 환경변수'}):
                    </div>
                    <div className="font-mono break-all text-stone-800 bg-white px-2 py-1 rounded border border-stone-200">
                      {diagnostics.recoverEndpoint}
                    </div>
                    {diagnostics.hasEnvConflict && (
                      <p className="text-amber-700 font-bold">
                        주의: 브라우저 저장 URL({diagnostics.localStorageUrl})과 환경변수 URL({diagnostics.envUrl})이 달라 브라우저 저장 설정이 우선 적용 중입니다.
                      </p>
                    )}
                    <p className="text-stone-500 leading-relaxed">
                      만약 여전히 영문 기본 메일(Reset your password)이 온다면, Supabase Dashboard → Authentication → Emails → Reset password 템플릿 저장 유지 여부와 SMTP 설정(기본 메일 서비스 제한 시 Custom SMTP 필요 여부)을 확인해 주세요.
                    </p>
                  </div>
                )}
              </div>
            </form>

            {otpSendSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{otpSendSuccessMsg}</span>
              </div>
            )}

            {/* OTP Token Input & Verification Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-3 pt-1 border-t border-stone-100">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">
                    이메일 OTP 인증번호
                  </label>
                  <span className="text-[10px] font-semibold text-stone-400">
                    이메일로 받은 숫자 그대로 입력
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value);
                      setOtpErrorMsg(null);
                    }}
                    placeholder="이메일 본문의 인증번호 입력 (예: 6자리 또는 8자리)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm tracking-widest font-bold focus:outline-none focus:border-[#872D35] bg-stone-50"
                  />
                </div>
              </div>

              {otpErrorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{otpErrorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifyingOtp || !isSupabaseConfigured || !otpCode.trim()}
                className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>인증번호 확인 중...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>인증번호 확인</span>
                  </>
                )}
              </button>

              {!otpSent && (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={isSendingOtp || resendCooldown > 0 || !isSupabaseConfigured || !resetEmail.trim()}
                  className="w-full py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {resendCooldown > 0
                    ? `인증번호 재발송 (${resendCooldown}초)`
                    : '인증번호 재발송'}
                </button>
              )}
            </form>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full py-2 text-xs font-bold text-stone-600 hover:text-stone-900 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>로그인 화면으로 돌아가기</span>
            </button>
          </div>
        ) : (
          /* STEP 1: Existing Admin Login Form */
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                관리자 계정 ID / 이메일
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  value={emailOrId}
                  onChange={(e) => {
                    setEmailOrId(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="관리자 ID 또는 이메일"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                관리자 비밀번호
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="관리자 비밀번호 입력"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#872D35] hover:bg-[#9E2A2B] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>관리자 권한 확인 중...</span>
                </>
              ) : (
                <span>관리자 대시보드 로그인</span>
              )}
            </button>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={handleOpenOtpStep}
                className="text-xs font-semibold text-stone-500 hover:text-[#872D35] underline underline-offset-4 cursor-pointer"
              >
                비밀번호 찾기 (이메일 인증번호로 재설정)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
