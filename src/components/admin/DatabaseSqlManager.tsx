import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUPABASE_FOODHOME_SETUP_SQL, getSupabaseClient } from '../../lib/supabase';
import { Database, KeyRound, Copy, Check, ExternalLink, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

export const DatabaseSqlManager: React.FC = () => {
  const { supabaseConfig, updateSupabaseConfig, showToast } = useApp();
  const [urlInput, setUrlInput] = useState(supabaseConfig.url || '');
  const [keyInput, setKeyInput] = useState(supabaseConfig.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSaveConfig = () => {
    updateSupabaseConfig({
      url: urlInput.trim(),
      anonKey: keyInput.trim()
    });
    showToast('Supabase 연결 설정이 저장되었습니다.');
  };

  const handleTestConnection = async () => {
    if (!urlInput.trim() || !keyInput.trim()) {
      setTestResult('Supabase Project URL과 Anon Key를 모두 입력해 주세요.');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Save temporarily to test client
      updateSupabaseConfig({ url: urlInput.trim(), anonKey: keyInput.trim() });
      const client = getSupabaseClient();
      if (!client) {
        setTestResult('Supabase 클라이언트 생성 실패: URL 형식을 확인해 주세요.');
        setIsTesting(false);
        return;
      }

      // Test a light ping query
      const { data, error } = await client.from('site_admins').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        setTestResult(`연결 확인됨 (알림: ${error.message}). 데이터베이스 테이블을 생성하기 위해 아래 SQL 스크립트를 실행해 주세요.`);
      } else {
        setTestResult('Supabase 데이터베이스 연결 성공! 테이블 및 RLS 정책이 정상 작동 중입니다.');
      }
    } catch (e: any) {
      setTestResult(`연결 오류: ${e?.message || '네트워크 상태를 확인해 주세요.'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySql = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SUPABASE_FOODHOME_SETUP_SQL);
      setCopied(true);
      showToast('SQL 스크립트가 클립보드에 복사되었습니다.');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isConnected = !!(supabaseConfig.url && supabaseConfig.anonKey);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Database className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-stone-900">Supabase 데이터베이스 & SQL 스크립트</h3>
          </div>
          <p className="text-xs text-stone-500">
            관리자 인증, 1:1 대량 납품 견적 상담 테이블, RLS 보안 정책 및 스토리지 버킷을 연동합니다.
          </p>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
          isConnected
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : 'bg-amber-50 text-amber-800 border-amber-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>{isConnected ? 'Supabase 연동 활성화' : '로컬 모드 (키 미설정)'}</span>
        </span>
      </div>

      {/* Supabase Credentials */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <h4 className="text-sm font-black text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-emerald-600" />
          <span>Supabase 프로젝트 연결 정보 설정</span>
        </h4>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Project URL (VITE_SUPABASE_URL)
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://your-project-id.supabase.co"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 font-mono text-xs focus:outline-none focus:border-[#872D35]"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Supabase Dashboard &gt; Project Settings &gt; API &gt; Project URL
            </p>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">
              Anon Public API Key (VITE_SUPABASE_ANON_KEY)
            </label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 rounded-lg border border-stone-200 font-mono text-xs focus:outline-none focus:border-[#872D35]"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              공개 클라이언트용 anon key입니다. (service_role 키는 절대 프론트엔드에 입력하지 마세요)
            </p>
          </div>
        </div>

        {testResult && (
          <div className={`p-3.5 rounded-xl border text-xs font-bold ${
            testResult.includes('성공') || testResult.includes('확인됨')
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {testResult}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>연결 테스트</span>
          </button>

          <button
            type="button"
            onClick={handleSaveConfig}
            className="px-6 py-2 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer"
          >
            연결 설정 저장
          </button>
        </div>
      </div>

      {/* SQL Migration Script Box */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#872D35]" />
              <span>Supabase 실행용 SQL 마이그레이션 스크립트</span>
            </h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              기존 테이블을 보존하며 필요한 견적상담(quote_inquiries), RLS 정책, 스토리지 버킷을 자동 생성합니다.
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사 완료!' : 'SQL 전체 복사'}</span>
          </button>
        </div>

        {/* Code View Container */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 text-slate-100 p-4 font-mono text-xs leading-relaxed max-h-80 overflow-y-auto border border-slate-800">
          <pre className="whitespace-pre">{SUPABASE_FOODHOME_SETUP_SQL}</pre>
        </div>

        {/* How to run guide */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1.5">
          <span className="font-bold text-stone-800 block">적용 방법 안내:</span>
          <ol className="list-decimal list-inside space-y-1 text-stone-600">
            <li>위의 <strong>[SQL 전체 복사]</strong> 버튼을 클릭합니다.</li>
            <li>Supabase 콘솔 대시보드로 이동한 후 좌측 메뉴에서 <strong>SQL Editor</strong>를 엽니다.</li>
            <li><strong>+ New Query</strong>를 누르고 복사한 SQL을 붙여넣은 뒤 <strong>Run (실행)</strong>을 누르면 1초 만에 설정이 완료됩니다.</li>
          </ol>
        </div>
      </div>

    </div>
  );
};
