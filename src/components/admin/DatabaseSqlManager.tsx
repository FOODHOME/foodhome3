import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SUPABASE_FOODHOME_SETUP_SQL, getSupabaseClient, isSiteAdmin, SITE_CONTENTS_ROW_ID } from '../../lib/supabase';
import { Database, KeyRound, Copy, Check, RefreshCw, AlertCircle, Send, RotateCcw, Clock, CheckCircle2, Download, Loader2 } from 'lucide-react';

export const DatabaseSqlManager: React.FC = () => {
  const {
    state,
    supabaseConfig,
    updateSupabaseConfig,
    showToast,
    isSupabaseAdminAuthed,
    supabaseAdminEmail,
    isPublishingToSupabase,
    isSyncingFromSupabase,
    hasUnpublishedChanges,
    lastSupabasePublishAt,
    lastSupabaseSyncError,
    remoteSiteContentsInfo,
    publishPublicContentsToSupabase,
    pullPublicContentsFromSupabase
  } = useApp();
  const [urlInput, setUrlInput] = useState(supabaseConfig.url || '');
  const [keyInput, setKeyInput] = useState(supabaseConfig.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    timestamp?: string;
  } | null>(null);
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

      // Test light ping query against public site_contents table
      const { data, error } = await client
        .from('site_contents')
        .select('id, updated_at')
        .eq('id', SITE_CONTENTS_ROW_ID)
        .maybeSingle();

      if (error) {
        setTestResult(`연결 확인됨 (알림: ${error.message}). site_contents 테이블 생성을 위해 아래 SQL 스크립트를 실행해 주세요.`);
      } else {
        const { data: sessionData } = await client.auth.getSession();
        const authUser = sessionData?.session?.user;
        const adminOk = authUser ? await isSiteAdmin(authUser.id) : false;
        const rowInfo = data ? '게시 데이터 확인됨' : '테이블 정상 (아직 게시 전)';
        const authInfo = adminOk ? '관리자 Auth 인증됨' : '로컬 로그인 상태 (게시는 이메일 로그인 필요)';
        setTestResult(`Supabase 데이터베이스 연결 성공! (${rowInfo} / ${authInfo})`);
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

      {/* Homepage Public Contents Sync Section */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#872D35]" />
              <span>홈페이지 콘텐츠 동기화</span>
            </h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              브라우저 <code className="font-mono text-stone-700">foodhome_app_data_v4</code>의 공개 콘텐츠만 Supabase에 게시하거나 불러옵니다.
            </p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
              isSupabaseAdminAuthed
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {isSupabaseAdminAuthed
              ? `Supabase 인증됨 (${supabaseAdminEmail || 'admin'})`
              : '로컬 로그인 상태 (DB 게시는 이메일 로그인 필요)'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[11px] text-stone-500 block">현재 DB 연결 상태</span>
            <strong className="text-stone-800 block">
              {!isConnected
                ? '미연결 (키 미설정)'
                : isSupabaseAdminAuthed
                ? '연결 및 관리자 인증 완료'
                : 'DB 연결됨 (이메일 인증 필요)'}
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[11px] text-stone-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>마지막 게시 시각</span>
            </span>
            <strong className="text-stone-800 block">
              {lastSupabasePublishAt
                ? new Date(lastSupabasePublishAt).toLocaleString('ko-KR')
                : remoteSiteContentsInfo?.updatedAt
                ? new Date(remoteSiteContentsInfo.updatedAt).toLocaleString('ko-KR')
                : '기록 없음'}
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[11px] text-stone-500 block">원격 DB 콘텐츠 상태</span>
            <strong className="text-stone-800 block">
              {remoteSiteContentsInfo?.exists
                ? '게시된 콘텐츠 있음'
                : isConnected
                ? '미게시 (로컬 데이터 보존 중)'
                : 'Supabase 미연결'}
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[11px] text-stone-500 block">로컬 변경 상태</span>
            <strong className={hasUnpublishedChanges ? 'text-[#872D35]' : 'text-emerald-700'}>
              {hasUnpublishedChanges ? '게시 대기 변경사항 있음' : '동기화됨'}
            </strong>
          </div>
        </div>

        {syncFeedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              syncFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {syncFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{syncFeedback.message}</p>
              {syncFeedback.timestamp && (
                <p className="text-[11px] opacity-80">
                  처리 시각: {new Date(syncFeedback.timestamp).toLocaleString('ko-KR')}
                </p>
              )}
            </div>
          </div>
        )}

        {!syncFeedback && lastSupabaseSyncError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>동기화 오류: {lastSupabaseSyncError}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
                const anchor = document.createElement('a');
                anchor.setAttribute('href', dataStr);
                anchor.setAttribute('download', `foodhome_backup_${new Date().toISOString().slice(0, 10)}.json`);
                document.body.appendChild(anchor);
                anchor.click();
                anchor.remove();
                showToast('백업 JSON 파일이 성공적으로 다운로드되었습니다.');
              }}
              className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>게시 전 JSON 백업</span>
            </button>

            <button
              type="button"
              disabled={isSyncingFromSupabase || isPublishingToSupabase || !isConnected}
              onClick={async () => {
                if (
                  window.confirm(
                    'Supabase에 저장된 공개 콘텐츠를 현재 관리자 화면으로 불러오시겠습니까?\n(문의/견적 내역 및 로컬 백업은 그대로 유지됩니다.)'
                  )
                ) {
                  setSyncFeedback(null);
                  const res = await pullPublicContentsFromSupabase();
                  if (res.success) {
                    setSyncFeedback({
                      type: 'success',
                      message: 'Supabase에서 홈페이지 공개 콘텐츠를 성공적으로 불러왔습니다.',
                      timestamp: new Date().toISOString()
                    });
                  } else {
                    setSyncFeedback({
                      type: 'error',
                      message: res.error || 'Supabase에서 홈페이지 콘텐츠를 불러오지 못했습니다.'
                    });
                  }
                }
              }}
              className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSyncingFromSupabase ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              <span>Supabase에서 홈페이지 콘텐츠 불러오기</span>
            </button>
          </div>

          <button
            type="button"
            disabled={isPublishingToSupabase || isSyncingFromSupabase || !isConnected}
            onClick={async () => {
              setSyncFeedback(null);
              const res = await publishPublicContentsToSupabase();
              if (res.success) {
                setSyncFeedback({
                  type: 'success',
                  message: '현재 홈페이지 공개 콘텐츠가 Supabase에 성공적으로 게시되었습니다.',
                  timestamp: res.updatedAt || new Date().toISOString()
                });
              } else {
                setSyncFeedback({
                  type: 'error',
                  message: res.error || 'Supabase 게시에 실패했습니다.'
                });
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isPublishingToSupabase ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>현재 홈페이지 콘텐츠 Supabase에 게시</span>
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
              기존 테이블(site_admins, form_definitions, form_submissions)을 보존하며 홈페이지 공개 콘텐츠(site_contents) 테이블과 RLS 정책만 안전하게 생성합니다.
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
