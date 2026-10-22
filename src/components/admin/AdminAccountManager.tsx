import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getSupabaseClient } from '../../lib/supabase';
import { KeyRound, ShieldCheck, User, LogOut, Check, Lock, AlertCircle } from 'lucide-react';

export const AdminAccountManager: React.FC = () => {
  const { handleAdminLogout, showToast, setIsAdminOpen } = useApp();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setMsg({ text: '새 비밀번호는 6자리 이상이어야 합니다.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ text: '새 비밀번호와 확인 입력이 일치하지 않습니다.', type: 'error' });
      return;
    }

    setIsUpdating(true);
    setMsg(null);

    const client = getSupabaseClient();
    if (client) {
      try {
        const { error } = await client.auth.updateUser({ password: newPassword });
        if (error) {
          setMsg({ text: `Supabase Auth 비밀번호 변경 실패: ${error.message}`, type: 'error' });
        } else {
          setMsg({ text: '관리자 계정 비밀번호가 성공적으로 변경되었습니다.', type: 'success' });
          setNewPassword('');
          setConfirmPassword('');
        }
      } catch (e: any) {
        setMsg({ text: e?.message || '비밀번호 변경 중 오류가 발생했습니다.', type: 'error' });
      }
    } else {
      // Local session update
      sessionStorage.setItem('foodhome_admin_custom_pw', newPassword);
      setMsg({ text: '관리자 비밀번호가 성공적으로 갱신되었습니다.', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    }

    setIsUpdating(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#872D35]/10 text-[#872D35]">
              <KeyRound className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-stone-900">관리자 계정 및 보안 설정</h3>
          </div>
          <p className="text-xs text-stone-500">
            관리자 대시보드 접근 권한, 로그인 비밀번호 변경 및 세션을 관리합니다.
          </p>
        </div>

        <button
          onClick={() => {
            handleAdminLogout();
            setIsAdminOpen(false);
          }}
          className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>관리자 세션 로그아웃</span>
        </button>
      </div>

      {/* Account Info Box */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <h4 className="text-sm font-black text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>현재 관리자 세션 정보</span>
        </h4>

        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-stone-400 block text-[11px]">권한 레벨</span>
            <span className="font-bold text-stone-800">최고 관리자 (Super Admin)</span>
          </div>
          <div>
            <span className="text-stone-400 block text-[11px]">보안 상태</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>보안 인증 완료 (로그인 페이지 계정 숨김 적용됨)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Password Change Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <h4 className="text-sm font-black text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#872D35]" />
          <span>관리자 비밀번호 변경</span>
        </h4>

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              새 관리자 비밀번호
            </label>
            <input
              type="password"
              required
              placeholder="6자리 이상 비밀번호 입력"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#872D35]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              새 관리자 비밀번호 확인
            </label>
            <input
              type="password"
              required
              placeholder="비밀번호 다시 입력"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#872D35]"
            />
          </div>

          {msg && (
            <div className={`p-3 rounded-xl text-xs font-bold ${
              msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {msg.text}
            </div>
          )}

          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isUpdating ? '변경 처리 중...' : '비밀번호 변경 적용'}
          </button>
        </form>
      </div>

    </div>
  );
};
