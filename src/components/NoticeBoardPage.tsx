import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { PostItem } from '../types';
import { 
  Megaphone, 
  Search, 
  Calendar, 
  Eye, 
  ChevronRight, 
  ChevronLeft,
  Pin, 
  FileText, 
  Clock, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';

export const NoticeBoardPage: React.FC = () => {
  const { 
    state, 
    setActivePage, 
    setSelectedPostForDetail, 
    incrementPostRead,
    setIsAdminOpen,
    isAdminLoggedIn
  } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter only notices (공지사항)
  const noticePosts = useMemo(() => {
    return state.posts.filter(p => p.category === '공지사항');
  }, [state.posts]);

  // Separate pinned and unpinned, apply search
  const filteredNotices = useMemo(() => {
    let list = noticePosts;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }
    // Sort pinned on top, then by date descending
    return [...list].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [noticePosts, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredNotices.length / itemsPerPage) || 1;
  const paginatedNotices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNotices.slice(start, start + itemsPerPage);
  }, [filteredNotices, currentPage, itemsPerPage]);

  const handleOpenNotice = (post: PostItem) => {
    incrementPostRead(post.id);
    setSelectedPostForDetail(post);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-[#2A2020] animate-in fade-in duration-200">
      {/* Top Hero Banner */}
      <section className="relative h-[240px] sm:h-[300px] flex items-center justify-center overflow-hidden bg-slate-900">
        <img
          src="./images/banner_b2b.jpg"
          alt="푸드홈 공지사항"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1616] via-[#2A2020]/75 to-transparent" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#872D35]/80 text-white text-xs font-bold mb-3 backdrop-blur-xs border border-white/20">
            <Megaphone className="w-3.5 h-3.5 text-amber-300" />
            <span>FOOD HOME NOTICE & NEWS</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            푸드홈 공지사항
          </h1>
          <p className="mt-2 text-sm sm:text-base text-stone-200 font-medium max-w-xl mx-auto drop-shadow-sm">
            푸드홈의 주요 생산 설비 소식, 납품 단가 정책, 물류 일정 및 중요 안내를 전해드립니다.
          </p>
        </div>
      </section>

      {/* Breadcrumb & Navigation */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-stone-500 font-medium">
            <button 
              onClick={() => setActivePage('home')} 
              className="hover:text-[#872D35] transition-colors cursor-pointer"
            >
              홈
            </button>
            <span>/</span>
            <span className="text-stone-700">고객센터</span>
            <span>/</span>
            <span className="font-bold text-[#872D35]">공지사항</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-stone-500 font-medium hidden sm:inline">
              총 <strong className="text-[#872D35] font-black">{noticePosts.length}</strong>개의 공지가 등록되어 있습니다.
            </span>
            {isAdminLoggedIn && (
              <button
                onClick={() => setIsAdminOpen(true)}
                className="text-[11px] font-bold text-stone-600 hover:text-[#872D35] flex items-center gap-1 cursor-pointer bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-md"
              >
                <span>관리자 공지 관리</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Search Bar & Filter Header */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#872D35]" />
            <h2 className="text-sm sm:text-base font-extrabold text-stone-900">
              전체 공지사항 목록
            </h2>
          </div>

          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="공지 제목 또는 내용 검색..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-300 focus:outline-none focus:border-[#872D35] focus:ring-1 focus:ring-[#872D35] bg-stone-50/50"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
              >
                초기화
              </button>
            )}
          </div>
        </div>

        {/* Notice Board Table */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          {/* Table Header (Desktop) */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-stone-100/80 border-b border-stone-200 text-xs font-bold text-stone-600">
            <div className="col-span-1 text-center">번호</div>
            <div className="col-span-2 text-center">구분</div>
            <div className="col-span-6">제목</div>
            <div className="col-span-2 text-center">작성일</div>
            <div className="col-span-1 text-center">조회수</div>
          </div>

          {/* Table Body */}
          {paginatedNotices.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {paginatedNotices.map((post, idx) => {
                const itemNumber = filteredNotices.length - ((currentPage - 1) * itemsPerPage + idx);
                return (
                  <div
                    key={post.id}
                    onClick={() => handleOpenNotice(post)}
                    className={`group px-4 sm:px-6 py-4 transition-colors cursor-pointer flex flex-col md:grid md:grid-cols-12 md:items-center gap-2 md:gap-4 ${
                      post.isPinned ? 'bg-amber-50/30 hover:bg-amber-50/60' : 'hover:bg-stone-50'
                    }`}
                  >
                    {/* Number / Pin (Desktop) */}
                    <div className="hidden md:block col-span-1 text-center text-xs font-semibold text-stone-500">
                      {post.isPinned ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#872D35] text-white">
                          <Pin className="w-3 h-3" />
                        </span>
                      ) : (
                        itemNumber
                      )}
                    </div>

                    {/* Badge / Category */}
                    <div className="md:col-span-2 flex items-center md:justify-center gap-2">
                      {post.isPinned ? (
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#872D35] text-white flex items-center gap-1 shadow-2xs">
                          <Pin className="w-2.5 h-2.5" />
                          <span>중요공지</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                          일반공지
                        </span>
                      )}
                      {/* Mobile Date display */}
                      <span className="md:hidden text-[11px] text-stone-400">
                        {post.date}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="md:col-span-6 flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900 group-hover:text-[#872D35] transition-colors line-clamp-1">
                        {post.title}
                      </span>
                      {post.isPinned && (
                        <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#872D35] shrink-0" />
                      )}
                    </div>

                    {/* Date (Desktop) */}
                    <div className="hidden md:flex col-span-2 items-center justify-center gap-1 text-xs text-stone-500">
                      <Calendar className="w-3 h-3 text-stone-400" />
                      <span>{post.date}</span>
                    </div>

                    {/* View Count */}
                    <div className="hidden md:flex col-span-1 items-center justify-center gap-1 text-xs text-stone-500">
                      <Eye className="w-3 h-3 text-stone-400" />
                      <span>{post.readCount.toLocaleString()}</span>
                    </div>

                    {/* Mobile Footer Meta */}
                    <div className="md:hidden flex items-center justify-between text-[11px] text-stone-400 pt-1">
                      <span>{post.author || '푸드홈'}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{post.readCount}회</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-stone-500 space-y-3">
              <Info className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-sm font-semibold">검색 조건에 맞는 공지사항이 없습니다.</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs font-bold text-[#872D35] underline cursor-pointer"
                >
                  전체 공지사항 다시 보기
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <span className="text-xs text-stone-500">
                페이지 {currentPage} / {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 text-stone-600" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      currentPage === page
                        ? 'bg-[#872D35] text-white shadow-2xs'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 text-stone-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Customer Support Help Card */}
        <div className="mt-8 bg-gradient-to-r from-stone-900 to-[#2A2020] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-md">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>고객센터 안내</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black">
              공지사항 외에 궁금하신 사항이 있으신가요?
            </h3>
            <p className="text-xs sm:text-sm text-stone-300">
              자주하는 질문(FAQ)을 확인하시거나 1:1 대량 납품 견적 상담을 통해 전담 상담원의 빠른 답변을 받으실 수 있습니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActivePage('faq-board')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors cursor-pointer"
            >
              자주하는 질문(FAQ) 바로가기
            </button>
            <button
              onClick={() => setActivePage('quote-board')}
              className="px-5 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6E1D24] text-white text-xs font-extrabold transition-colors cursor-pointer shadow-sm"
            >
              1:1 견적 상담 신청
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
