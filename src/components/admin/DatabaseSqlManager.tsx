import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  SUPABASE_FOODHOME_SETUP_SQL,
  SUPABASE_BOARD_SETUP_SQL,
  getSupabaseClient,
  isSiteAdmin,
  SITE_CONTENTS_ROW_ID
} from '../../lib/supabase';
import {
  Database,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Send,
  RotateCcw,
  Clock,
  CheckCircle2,
  Download,
  Loader2,
  MessageSquare,
  HardDrive,
  UploadCloud
} from 'lucide-react';

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
    pullPublicContentsFromSupabase,
    isBoardSyncing,
    boardSyncInfo,
    localStorageStats,
    localStorageQuotaError,
    refreshBoardsFromSupabase,
    migrateLocalBoardsToSupabase,
    migrateEmbeddedImagesToStorage
  } = useApp();
  const [sqlTab, setSqlTab] = useState<'board' | 'site'>('board');
  const [isMigratingBoards, setIsMigratingBoards] = useState(false);
  const [boardFeedback, setBoardFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isMigratingMedia, setIsMigratingMedia] = useState(false);
  const [mediaFeedback, setMediaFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
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

  const activeSqlScript = sqlTab === 'board' ? SUPABASE_BOARD_SETUP_SQL : SUPABASE_FOODHOME_SETUP_SQL;

  const handleCopySql = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeSqlScript);
      setCopied(true);
      showToast('선택한 SQL 스크립트가 클립보드에 복사되었습니다.');
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

      {/* Remote Board Sync & Local Post Migration Section */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#872D35]" />
              <span>게시판 원격 DB 동기화 &amp; 기존 게시글 이전</span>
            </h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              공지·레시피(<code className="font-mono text-stone-700">board_posts</code>)와 샘플·견적 문의(<code className="font-mono text-stone-700">board_private_inquiries</code>)를 모든 브라우저·기기와 실시간 공유합니다.
            </p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
              boardSyncInfo.postsTableMissing || boardSyncInfo.privateTableMissing
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : boardSyncInfo.syncedFromSupabase
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-stone-100 text-stone-600 border-stone-200'
            }`}
          >
            {boardSyncInfo.postsTableMissing || boardSyncInfo.privateTableMissing
              ? '2차 SQL 실행 필요'
              : boardSyncInfo.syncedFromSupabase
              ? '원격 게시판 연동 활성'
              : '연결 대기 중'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[11px] text-stone-500 block">공지·레시피 게시글</span>
            <strong className="text-stone-800 block">{(state.posts || []).length}건</strong>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[11px] text-stone-500 block">샘플신청 / B2B 문의</span>
            <strong className="text-stone-800 block">{(state.inquiries || []).length}건</strong>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[11px] text-stone-500 block">1:1 대량 견적상담</span>
            <strong className="text-stone-800 block">{(state.quotes || []).length}건</strong>
          </div>
        </div>

        {(boardSyncInfo.postsTableMissing || boardSyncInfo.privateTableMissing) && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              아래 <strong>[2차: 원격 게시판 &amp; 이미지 Storage]</strong> SQL 스크립트를 Supabase SQL Editor에서 먼저 실행해 주세요. 실행 전까지 기존 로컬 게시글은 모두 안전하게 보존됩니다.
            </span>
          </div>
        )}

        {boardFeedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-bold flex items-start gap-2 ${
              boardFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {boardFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{boardFeedback.message}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
          <button
            type="button"
            disabled={isBoardSyncing || !isConnected}
            onClick={async () => {
              setBoardFeedback(null);
              await refreshBoardsFromSupabase(isSupabaseAdminAuthed);
              setBoardFeedback({
                type: 'success',
                message: 'Supabase에서 최신 게시판 목록을 다시 불러왔습니다.'
              });
            }}
            className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isBoardSyncing ? 'animate-spin' : ''}`} />
            <span>Supabase에서 게시판 새로고침</span>
          </button>

          <button
            type="button"
            disabled={isMigratingBoards || !isConnected}
            onClick={async () => {
              setBoardFeedback(null);
              setIsMigratingBoards(true);
              const res = await migrateLocalBoardsToSupabase();
              setIsMigratingBoards(false);
              if (res.success) {
                setBoardFeedback({
                  type: 'success',
                  message: `게시글 ${res.postsCount}건, 샘플·견적 문의 ${res.inquiriesCount}건을 Supabase로 안전하게 이전했습니다.`
                });
              } else {
                setBoardFeedback({
                  type: 'error',
                  message: res.error || '게시글 이전에 실패했습니다.'
                });
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isMigratingBoards ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" />
            )}
            <span>기존 로컬 게시글 Supabase로 일괄 이전</span>
          </button>
        </div>
      </div>

      {/* Browser Storage (5MB) Diagnostics & Image Offloading Section */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-[#872D35]" />
              <span>브라우저 저장공간(5MB) 진단 및 이미지 Storage 분리</span>
            </h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              브라우저 <code className="font-mono text-stone-700">localStorage</code>에 내장된 대용량 이미지를 Supabase Storage(<code className="font-mono text-stone-700">foodhome-media</code>) URL로 분리해 5MB 용량 초과를 예방합니다.
            </p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
              localStorageStats.isNearLimit || localStorageQuotaError
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {localStorageStats.totalMB} MB / 5.00 MB ({localStorageStats.usagePercent}%)
          </span>
        </div>

        <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden border border-stone-200">
          <div
            className={`h-full transition-all ${
              localStorageStats.usagePercent >= 85
                ? 'bg-red-600'
                : localStorageStats.usagePercent >= 65
                ? 'bg-amber-500'
                : 'bg-emerald-600'
            }`}
            style={{ width: `${Math.min(100, localStorageStats.usagePercent)}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[11px] text-stone-500 block">전체 로컬 데이터 용량</span>
            <strong className="text-stone-800 block">{localStorageStats.totalMB} MB</strong>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[11px] text-stone-500 block">내장 이미지(Base64) 개수</span>
            <strong className="text-stone-800 block">{localStorageStats.dataUrlCount}개</strong>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <span className="text-[11px] text-stone-500 block">내장 이미지 점유 용량</span>
            <strong className="text-stone-800 block">{localStorageStats.dataUrlMB} MB</strong>
          </div>
        </div>

        {localStorageQuotaError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{localStorageQuotaError}</span>
          </div>
        )}

        {mediaFeedback && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-bold flex items-start gap-2 ${
              mediaFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {mediaFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span>{mediaFeedback.message}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
          <p className="text-[11px] text-stone-500">
            분리 완료 후 상단의 <strong>[현재 홈페이지 콘텐츠 Supabase에 게시]</strong>를 눌러 URL을 반영하세요.
          </p>
          <button
            type="button"
            disabled={isMigratingMedia || !isConnected || localStorageStats.dataUrlCount === 0}
            onClick={async () => {
              setMediaFeedback(null);
              setIsMigratingMedia(true);
              const res = await migrateEmbeddedImagesToStorage();
              setIsMigratingMedia(false);
              if (res.migratedCount > 0) {
                setMediaFeedback({
                  type: 'success',
                  message: `${res.migratedCount}개 이미지를 Supabase Storage URL로 안전하게 분리했습니다.${res.failedCount > 0 ? ` (미완료 ${res.failedCount}개)` : ''}`
                });
              } else {
                setMediaFeedback({
                  type: res.error ? 'error' : 'success',
                  message: res.error || '분리할 내장 이미지(Base64)가 없습니다.'
                });
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isMigratingMedia ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UploadCloud className="w-3.5 h-3.5" />
            )}
            <span>내장 이미지 Supabase Storage로 분리</span>
          </button>
        </div>
      </div>

      {/* SQL Migration Script Box */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#872D35]" />
              <span>Supabase 실행용 SQL 마이그레이션 스크립트</span>
            </h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              기존 테이블(site_admins, site_contents, form_definitions, form_submissions)을 보존하며 새 게시판 테이블과 Storage 정책만 안전하게 생성합니다.
            </p>
          </div>

          <button
            onClick={handleCopySql}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? '복사 완료!' : 'SQL 전체 복사'}</span>
          </button>
        </div>

        {/* SQL Script Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSqlTab('board')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
              sqlTab === 'board'
                ? 'bg-[#872D35] text-white border-[#872D35]'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            2차: 원격 게시판 &amp; 이미지 Storage (board_posts / board_private_inquiries)
          </button>
          <button
            type="button"
            onClick={() => setSqlTab('site')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
              sqlTab === 'site'
                ? 'bg-[#872D35] text-white border-[#872D35]'
                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
            }`}
          >
            1차: 홈페이지 공개 콘텐츠 (site_contents)
          </button>
        </div>

        {/* Code View Container */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 text-slate-100 p-4 font-mono text-xs leading-relaxed max-h-80 overflow-y-auto border border-slate-800">
          <pre className="whitespace-pre">{activeSqlScript}</pre>
        </div>

        {/* How to run guide */}
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1.5">
          <span className="font-bold text-stone-800 block">적용 방법 안내:</span>
          <ol className="list-decimal list-inside space-y-1 text-stone-600">
            <li>위의 <strong>[2차: 원격 게시판 &amp; 이미지 Storage]</strong> 탭이 선택된 상태에서 <strong>[SQL 전체 복사]</strong> 버튼을 클릭합니다.</li>
            <li>Supabase 콘솔 대시보드로 이동한 후 좌측 메뉴에서 <strong>SQL Editor</strong>를 엽니다.</li>
            <li><strong>+ New Query</strong>를 누르고 복사한 SQL을 붙여넣은 뒤 <strong>Run (실행)</strong>을 누르면 즉시 완료됩니다.</li>
          </ol>
        </div>
      </div>

    </div>
  );
};
