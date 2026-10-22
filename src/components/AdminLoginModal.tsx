import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Lock, 
  User, 
  ShieldCheck, 
  X, 
  Database, 
  Sparkles, 
  Loader2,
  KeyRound
} from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const { handleAdminLogin, isAdminLoggedIn, setIsAdminOpen, showToast } = useApp();
  const [emailOrId, setEmailOrId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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
      onClose();
      setIsAdminOpen(true);
    } else {
      setErrorMessage(result.error || '아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#872D35] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-[10px] font-black tracking-widest text-[#872D35] uppercase bg-[#872D35]/10 px-2.5 py-0.5 rounded-full">
            FOODHOME SECURITY
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mt-2">
            웹사이트 관리자 인증
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            푸드홈 공식 사이트 운영 및 신청서 조회를 위해 로그인해 주세요.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
        </form>
      </div>
    </div>
  );
};
