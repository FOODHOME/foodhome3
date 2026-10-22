import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { QuoteInquiry } from '../../types';
import { 
  FileSpreadsheet, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Send, 
  Paperclip, 
  ShieldCheck, 
  Eye, 
  AlertCircle,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  MessageSquare
} from 'lucide-react';

export const QuoteInquiriesManager: React.FC = () => {
  const { 
    state, 
    updateQuoteStatus, 
    updateQuoteReply, 
    deleteQuoteInquiry,
    showToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [selectedQuote, setSelectedQuote] = useState<QuoteInquiry | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [replyStatus, setReplyStatus] = useState('상담중');

  const quotes = state.quotes || [];

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = 
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.region && q.region.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === '전체' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectQuote = (q: QuoteInquiry) => {
    setSelectedQuote(q);
    setReplyInput(q.adminReply?.content || '');
    setReplyStatus(q.status || '상담중');
  };

  const handleSaveReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote || !replyInput.trim()) return;

    updateQuoteReply(selectedQuote.id, replyInput.trim(), replyStatus);
    setSelectedQuote(prev => prev ? {
      ...prev,
      status: replyStatus,
      adminReply: {
        content: replyInput.trim(),
        repliedAt: new Date().toISOString().slice(0, 10),
        author: '푸드홈 관리자'
      }
    } : null);
    showToast('관리자 답변이 저장되었습니다.');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '견적완료':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>견적완료</span>
          </span>
        );
      case '상담중':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>상담중</span>
          </span>
        );
      case '접수완료':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#872D35]/10 text-[#872D35] border border-[#872D35]/20">
            <Clock className="w-3 h-3 text-[#872D35]" />
            <span>접수완료</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#872D35]/10 text-[#872D35]">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-stone-900">1:1 대량 납품 견적 상담 관리</h3>
          </div>
          <p className="text-xs text-stone-500">
            외식업소 및 프랜차이즈 본사에서 신청한 대량 납품·OEM 견적 상담 내역을 실시간으로 확인하고 답변을 작성합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-stone-100 text-stone-700">
            총 {quotes.length}건 접수됨
          </span>
        </div>
      </div>

      {/* Main Grid: List & Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Quotes List */}
        <div className="lg:col-span-5 space-y-3">
          
          {/* Search & Filter */}
          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="제목, 상호명, 담당자 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#872D35] bg-stone-50"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              {['전체', '접수완료', '상담중', '견적완료'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-colors ${
                    statusFilter === st
                      ? 'bg-[#872D35] text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto no-scrollbar">
            {filteredQuotes.length === 0 ? (
              <div className="bg-white p-8 rounded-xl border border-stone-200 text-center text-stone-400">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 text-stone-300" />
                <p className="text-xs font-bold">해당 조건의 견적 상담이 없습니다.</p>
              </div>
            ) : (
              filteredQuotes.map((q) => (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuote(q)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedQuote?.id === q.id
                      ? 'border-[#872D35] bg-[#872D35]/5 shadow-2xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-stone-400">#{q.postNumber}</span>
                      {getStatusBadge(q.status)}
                    </div>
                    <span className="font-mono text-[11px] text-stone-400">{q.createdAt}</span>
                  </div>

                  <h5 className="text-xs font-extrabold text-stone-900 line-clamp-1 mb-1">
                    {q.title}
                  </h5>

                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="font-bold text-stone-700">{q.companyName} ({q.contactPerson})</span>
                    <span className="font-mono">{q.phone}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Selected Quote Detail & Admin Reply Form */}
        <div className="lg:col-span-7">
          {selectedQuote ? (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
              
              {/* Detail Header */}
              <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-stone-400">#{selectedQuote.postNumber}</span>
                    {getStatusBadge(selectedQuote.status)}
                    <span className="text-[11px] font-mono text-stone-400">접수일시: {selectedQuote.createdAt}</span>
                  </div>
                  <h4 className="text-base font-black text-stone-900">
                    {selectedQuote.title}
                  </h4>
                </div>

                <button
                  onClick={() => {
                    if (confirm('이 견적 상담글을 완전히 삭제하시겠습니까?')) {
                      deleteQuoteInquiry(selectedQuote.id);
                      setSelectedQuote(null);
                    }
                  }}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title="견적글 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Client Info Grid */}
              <div className="grid grid-cols-2 gap-3 bg-stone-50 p-4 rounded-xl text-xs border border-stone-200">
                <div>
                  <span className="text-[11px] text-stone-400 block">업체명 / 상호</span>
                  <span className="font-bold text-stone-800">{selectedQuote.companyName}</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block">담당자명</span>
                  <span className="font-bold text-stone-800">{selectedQuote.contactPerson}</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block">연락처</span>
                  <a href={`tel:${selectedQuote.phone}`} className="font-bold font-mono text-[#872D35] hover:underline">
                    {selectedQuote.phone}
                  </a>
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block">이메일</span>
                  <span className="font-mono text-stone-800">{selectedQuote.email || '미기재'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block">납품 희망 지역</span>
                  <span className="font-bold text-stone-800">{selectedQuote.region || '전국/미기재'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block">업종 형태</span>
                  <span className="font-bold text-stone-800">{selectedQuote.businessType || '일반음식점'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block">예상 월 납품 수량</span>
                  <span className="font-bold text-stone-800">{selectedQuote.monthlyVolume || '협의 예정'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block">희망 납품 일정</span>
                  <span className="font-bold text-stone-800">{selectedQuote.deliverySchedule || '협의 예정'}</span>
                </div>
              </div>

              {/* Products */}
              <div>
                <span className="text-xs font-bold text-stone-700 block mb-1.5">관심 제품</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedQuote.interestedProducts.map((p, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#872D35]/10 text-[#872D35] border border-[#872D35]/20">
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <span className="text-xs font-bold text-stone-700 block mb-1.5">상담 내용 및 요청사항</span>
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 whitespace-pre-wrap leading-relaxed">
                  {selectedQuote.message || '상세 상담 내용이 없습니다.'}
                </div>
              </div>

              {/* Attachments */}
              {selectedQuote.attachments && selectedQuote.attachments.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-stone-700 block mb-1.5">첨부파일</span>
                  <div className="space-y-1">
                    {selectedQuote.attachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-700">
                        <Paperclip className="w-3.5 h-3.5 text-stone-400" />
                        <span className="font-medium">{att.name}</span>
                        {att.size && <span className="text-stone-400 font-mono">({att.size})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Reply & Status Form */}
              <form onSubmit={handleSaveReply} className="pt-3 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#872D35]" />
                    <span>관리자 공식 답변 등록 & 상태 변경</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500 font-bold">접수상황:</span>
                    <select
                      value={replyStatus}
                      onChange={(e) => {
                        setReplyStatus(e.target.value);
                        updateQuoteStatus(selectedQuote.id, e.target.value);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-stone-300 text-xs font-bold bg-white"
                    >
                      <option value="접수완료">접수완료</option>
                      <option value="상담중">상담중</option>
                      <option value="견적완료">견적완료</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={4}
                  required
                  placeholder="고객이 게시글을 비밀번호로 열람할 때 보여질 공식 답변 내용을 입력하세요. (견적 요약, 발송 안내, 상담 결과 등)"
                  value={replyInput}
                  onChange={(e) => setReplyInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#872D35]"
                />

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>답변 저장 및 상태 반영</span>
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center text-stone-400">
              <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-stone-300" />
              <p className="text-sm font-bold text-stone-600">선택된 견적 상담글이 없습니다.</p>
              <p className="text-xs text-stone-400 mt-1">좌측 목록에서 열람하실 항목을 클릭해 주세요.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
