import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QuoteInquiry } from '../types';
import { 
  Lock, 
  Unlock, 
  Search, 
  PenSquare, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Truck, 
  MessageSquare, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  Calendar, 
  User, 
  Store, 
  Phone, 
  MapPin, 
  Sparkles,
  Send,
  X,
  FileSpreadsheet,
  Paperclip,
  Check,
  Building,
  Mail,
  Package,
  Layers
} from 'lucide-react';

interface QuoteBoardPageProps {
  initialViewMode?: 'list' | 'write';
}

export const QuoteBoardPage: React.FC<QuoteBoardPageProps> = ({ initialViewMode = 'list' }) => {
  const { 
    state, 
    addQuoteInquiry, 
    updateQuoteReply, 
    updateQuoteStatus, 
    deleteQuoteInquiry,
    isAdminLoggedIn, 
    verifyQuotePassword, 
    showToast,
    setActivePage
  } = useApp();

  const [viewMode, setViewMode] = useState<'list' | 'write' | 'detail'>(initialViewMode);
  const [selectedQuote, setSelectedQuote] = useState<QuoteInquiry | null>(null);

  // Password Unlock Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [quoteToUnlock, setQuoteToUnlock] = useState<QuoteInquiry | null>(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('전체');

  // Write Form State
  const productChoices = state.formConfig?.quoteProductOptions || [
    '명품 보쌈무김치 (업소용 10kg)',
    '비법 보쌈김칫속 (업소용 10kg)',
    '수제 절임무 벌크 (20kg)',
    '프랜차이즈 맞춤 OEM/PB 전용 레시피'
  ];

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    region: '',
    businessType: '일반음식점 (보쌈·족발)',
    interestedProducts: ['명품 보쌈무김치 (업소용 10kg)'],
    monthlyVolume: '',
    deliverySchedule: '',
    message: '',
    attachedFileName: '',
    password: '',
    agreedPrivacy: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin Reply Input State
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminReplyStatus, setAdminReplyStatus] = useState<string>('상담중');
  const [isReplying, setIsReplying] = useState(false);

  const handleProductToggle = (productName: string) => {
    setFormData(prev => {
      const exists = prev.interestedProducts.includes(productName);
      if (exists) {
        if (prev.interestedProducts.length <= 1) {
          alert('최소 1개 이상의 관심 제품을 선택해 주세요.');
          return prev;
        }
        return {
          ...prev,
          interestedProducts: prev.interestedProducts.filter(p => p !== productName)
        };
      } else {
        return {
          ...prev,
          interestedProducts: [...prev.interestedProducts, productName]
        };
      }
    });
  };

  const handleRowClick = (quote: QuoteInquiry) => {
    if (isAdminLoggedIn) {
      setSelectedQuote(quote);
      setViewMode('detail');
      return;
    }

    // Customer click: require password
    setQuoteToUnlock(quote);
    setEnteredPassword('');
    setPasswordError(null);
    setPasswordModalOpen(true);
  };

  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteToUnlock) return;

    if (!enteredPassword) {
      setPasswordError('비밀번호를 입력해 주세요.');
      return;
    }

    setIsVerifying(true);
    const isValid = await verifyQuotePassword(quoteToUnlock.id, enteredPassword);
    setIsVerifying(false);

    if (isValid) {
      setPasswordModalOpen(false);
      setSelectedQuote(quoteToUnlock);
      setViewMode('detail');
      setPasswordError(null);
    } else {
      setPasswordError('비밀번호가 일치하지 않습니다. 다시 확인해 주세요.');
    }
  };

  const handleWriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('상담 제목을 입력해 주세요.');
      return;
    }
    if (!formData.companyName.trim()) {
      alert('업체명 / 상호명을 입력해 주세요.');
      return;
    }
    if (!formData.contactPerson.trim()) {
      alert('담당자 성함을 입력해 주세요.');
      return;
    }
    if (!formData.phone.trim()) {
      alert('연락처를 입력해 주세요.');
      return;
    }

    if (!formData.password || formData.password.length < 4) {
      alert('게시글 조회를 위한 비밀번호 4자리 이상을 입력해 주세요.');
      return;
    }

    if (!formData.agreedPrivacy) {
      alert('개인정보 수집 및 이용에 동의해 주셔야 상담 신청이 완료됩니다.');
      return;
    }

    setIsSubmitting(true);
    const attachments = formData.attachedFileName 
      ? [{ name: formData.attachedFileName, size: '2.4MB' }] 
      : [];

    const res = await addQuoteInquiry({
      title: formData.title.trim(),
      companyName: formData.companyName.trim(),
      contactPerson: formData.contactPerson.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      region: formData.region.trim(),
      businessType: formData.businessType,
      interestedProducts: formData.interestedProducts,
      monthlyVolume: formData.monthlyVolume.trim(),
      deliverySchedule: formData.deliverySchedule.trim(),
      message: formData.message.trim(),
      attachments,
      password: formData.password
    });

    setIsSubmitting(false);

    if (res.success) {
      setFormData({
        title: '',
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        region: '',
        businessType: '일반음식점 (보쌈·족발)',
        interestedProducts: ['명품 보쌈무김치 (업소용 10kg)'],
        monthlyVolume: '',
        deliverySchedule: '',
        message: '',
        attachedFileName: '',
        password: '',
        agreedPrivacy: true
      });
      setViewMode('list');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuote || !adminReplyText.trim()) return;

    setIsReplying(true);
    updateQuoteReply(selectedQuote.id, adminReplyText.trim(), adminReplyStatus);
    
    // Update local selected state
    setSelectedQuote(prev => prev ? {
      ...prev,
      status: adminReplyStatus,
      adminReply: {
        content: adminReplyText.trim(),
        repliedAt: new Date().toISOString().slice(0, 10),
        author: '푸드홈 B2B 납품팀'
      }
    } : null);

    setAdminReplyText('');
    setIsReplying(false);
  };

  const quotesList = state.quotes || [];

  // Filter & Search Logic
  const filteredQuotes = quotesList.filter(quote => {
    const matchesSearch = 
      quote.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quote.region && quote.region.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === '전체' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '견적완료':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>견적완료</span>
          </span>
        );
      case '상담중':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>상담중</span>
          </span>
        );
      case '접수완료':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#872D35]/10 text-[#872D35] border border-[#872D35]/20">
            <Clock className="w-3.5 h-3.5 text-[#872D35]" />
            <span>접수완료</span>
          </span>
        );
    }
  };

  // Masking for Privacy
  const getMaskedWriter = (quote: QuoteInquiry) => {
    const name = quote.contactPerson || '담당자';
    if (name.length <= 1) return name;
    if (name.length === 2) return `${name[0]}*`;
    return `${name[0]}*${name.slice(2)}`;
  };

  const getMaskedCompany = (quote: QuoteInquiry) => {
    const comp = quote.companyName || '업체';
    if (comp.length <= 2) return comp;
    return `${comp.slice(0, 2)}**`;
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-10 sm:py-14 animate-in fade-in duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Top Breadcrumb & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mb-2">
            <button 
              onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-[#872D35] transition-colors cursor-pointer"
            >
              홈
            </button>
            <span>›</span>
            <span>고객센터</span>
            <span>›</span>
            <span className="text-[#872D35] font-bold">1:1 대량 납품 견적 상담</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#872D35]/10 border border-[#872D35]/20 text-[#872D35] text-xs font-bold mb-2">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>B2B WHOLESALE & OEM</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                1:1 대량 납품 견적 상담 게시판
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                프랜차이즈, 대형 식당, 급식·외식업 대표님을 위한 단가 제안 및 OEM 맞춤 상담 창구입니다.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {viewMode !== 'list' && (
                <button
                  onClick={() => setViewMode('list')}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-bold hover:bg-stone-50 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>목록으로 돌아가기</span>
                </button>
              )}

              {viewMode !== 'write' && (
                <button
                  onClick={() => {
                    setViewMode('write');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 py-2.5 rounded-xl text-white text-xs sm:text-sm font-extrabold shadow-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
                  style={{ backgroundColor: state.theme.primaryColor || '#872D35' }}
                >
                  <PenSquare className="w-4 h-4" />
                  <span>견적 상담 신청서 작성</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notice Info Box */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 bg-amber-50/40 shadow-2xs mb-8 flex items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-[#872D35] shrink-0 mt-0.5" />
          <div className="text-xs text-stone-700 space-y-1">
            <p className="font-bold text-stone-900">
              비공개 보안 게시판 안내
            </p>
            <p className="text-stone-600 leading-relaxed">
              모든 견적 상담 글은 <strong>비공개로 보호</strong>되며, 글 작성 시 입력하신 비밀번호를 통해 본인만 열람하실 수 있습니다.
              영업 담당자가 접수 후 24시간 이내(영업일 기준) 유선 안내 및 공식 견적서를 제공해 드립니다.
            </p>
          </div>
        </div>

        {/* 1. LIST VIEW MODE */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            
            {/* Filter Tabs & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {['전체', '접수완료', '상담중', '견적완료'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      statusFilter === status
                        ? 'bg-[#872D35] text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="제목, 상호명 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#872D35] bg-stone-50"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
              
              {/* Desktop Table Header */}
              <div className="hidden md:grid grid-cols-12 bg-stone-50/90 px-6 py-3 border-b border-stone-200 text-xs font-bold text-stone-600">
                <div className="col-span-1 text-center">번호</div>
                <div className="col-span-2 text-center">접수상황</div>
                <div className="col-span-5">제목</div>
                <div className="col-span-2 text-center">작성자</div>
                <div className="col-span-1 text-center">작성일</div>
                <div className="col-span-1 text-center">조회수</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-stone-100">
                {filteredQuotes.length === 0 ? (
                  <div className="p-12 text-center text-stone-400 space-y-2">
                    <AlertCircle className="w-8 h-8 mx-auto text-stone-300" />
                    <p className="text-sm font-bold">등록된 견적 상담글이 없습니다.</p>
                    <p className="text-xs">상단의 [견적 상담 신청서 작성] 버튼을 눌러 첫 문의글을 남겨보세요.</p>
                  </div>
                ) : (
                  filteredQuotes.map((quote) => (
                    <div
                      key={quote.id}
                      onClick={() => handleRowClick(quote)}
                      className="px-5 sm:px-6 py-4 flex flex-col md:grid md:grid-cols-12 items-start md:items-center gap-2 md:gap-0 hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
                    >
                      {/* Number */}
                      <div className="md:col-span-1 font-mono text-xs font-bold text-stone-400 md:text-center">
                        #{quote.postNumber}
                      </div>

                      {/* Status */}
                      <div className="md:col-span-2 md:text-center">
                        {getStatusBadge(quote.status)}
                      </div>

                      {/* Title */}
                      <div className="md:col-span-5 flex items-center gap-2 pr-3">
                        <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold text-stone-800 group-hover:text-[#872D35] transition-colors line-clamp-1">
                          {quote.title}
                        </span>
                        {quote.attachments && quote.attachments.length > 0 && (
                          <span title="첨부파일 있음" className="inline-flex items-center">
                            <Paperclip className="w-3 h-3 text-stone-400 shrink-0" />
                          </span>
                        )}
                        {quote.adminReply && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 shrink-0">
                            답변완료
                          </span>
                        )}
                      </div>

                      {/* Writer */}
                      <div className="md:col-span-2 text-xs text-stone-600 md:text-center">
                        {isAdminLoggedIn ? (
                          <span className="font-bold text-stone-800">{quote.companyName} ({quote.contactPerson})</span>
                        ) : (
                          <span>{getMaskedCompany(quote)} ({getMaskedWriter(quote)})</span>
                        )}
                      </div>

                      {/* Date */}
                      <div className="md:col-span-1 font-mono text-xs text-stone-400 md:text-center">
                        {quote.createdAt}
                      </div>

                      {/* Read Count */}
                      <div className="md:col-span-1 font-mono text-xs text-stone-400 md:text-center">
                        {quote.readCount || 1}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Total Count */}
            <div className="text-right text-xs text-stone-400">
              총 <strong className="font-mono text-stone-700">{filteredQuotes.length}</strong>건의 견적 상담 내역
            </div>

          </div>
        )}

        {/* 2. WRITE FORM VIEW MODE */}
        {viewMode === 'write' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm">
            <div className="border-b border-stone-200 pb-5 mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                1:1 대량 납품 견적 상담 신청서
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                작성하신 내용은 비공개로 저장되며, 담당자가 확인 후 빠른 시일 내에 연락드립니다.
              </p>
            </div>

            <form onSubmit={handleWriteSubmit} className="space-y-6">
              
              {/* Title (Required) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  상담 제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: [경기 안양] 3개 매장 보쌈무김치 정기 납품 단가 견적 요청"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                />
              </div>

              {/* Company & Contact (Required) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    업체명 / 상호명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="사업자등록 상호명 또는 매장명"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    담당자 성함 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="담당자명 및 직책"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    연락처 (휴대전화) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010-0000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    이메일 주소
                  </label>
                  <input
                    type="email"
                    placeholder="견적서 수신용 이메일"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                  />
                </div>
              </div>

              {/* Region & Business Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    납품 희망 지역
                  </label>
                  <input
                    type="text"
                    placeholder="예: 서울 전역, 경기 일산, 대전 등"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    업종 형태
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                  >
                    <option value="일반음식점 (보쌈·족발)">일반음식점 (보쌈·족발)</option>
                    <option value="고깃집 (삼겹살·갈비)">고깃집 (삼겹살·갈비)</option>
                    <option value="국밥·해장국 전문점">국밥·해장국 전문점</option>
                    <option value="프랜차이즈 본사/직영">프랜차이즈 본사/직영</option>
                    <option value="단체급식·케이터링">단체급식·케이터링</option>
                    <option value="식자재 유통업체">식자재 유통업체</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>

              {/* Interested Products (Multi-select) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-2">
                  관심 제품 선택 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {productChoices.map((prod) => {
                    const isSelected = formData.interestedProducts.includes(prod);
                    return (
                      <button
                        type="button"
                        key={prod}
                        onClick={() => handleProductToggle(prod)}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer text-left ${
                          isSelected
                            ? 'border-[#872D35] bg-[#872D35]/5 text-[#872D35] shadow-2xs'
                            : 'border-stone-200 bg-stone-50/50 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span>{prod}</span>
                        {isSelected && <Check className="w-4 h-4 text-[#872D35]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monthly Volume & Schedule */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    예상 월 납품 수량
                  </label>
                  <input
                    type="text"
                    placeholder="예: 월 100kg, 월 500kg, 1톤 이상 등"
                    value={formData.monthlyVolume}
                    onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    희망 납품 일정
                  </label>
                  <input
                    type="text"
                    placeholder="예: 2026년 4월 초, 즉시 납품 등"
                    value={formData.deliverySchedule}
                    onChange={(e) => setFormData({ ...formData, deliverySchedule: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  상담 내용 및 요청사항
                </label>
                <textarea
                  rows={4}
                  placeholder="필요하신 공급 규격, 맛(맵기 강도, 단맛 배합 등), 기존 매장 현황이나 특별 요청사항을 자유롭게 기재해 주세요."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50 resize-y"
                />
              </div>

              {/* Attachment */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  첨부파일 (사업자등록증 또는 메뉴판 등)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="quote-file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData({ ...formData, attachedFileName: file.name });
                      }
                    }}
                  />
                  <label
                    htmlFor="quote-file"
                    className="px-4 py-2 rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>파일 선택</span>
                  </label>
                  <span className="text-xs text-stone-500 font-mono">
                    {formData.attachedFileName || '선택된 파일 없음'}
                  </span>
                </div>
              </div>

              {/* Password (Required) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  게시글 열람 비밀번호 (4자리 이상) <span className="text-red-500">*</span>
                </label>
                <div className="relative max-w-xs">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="비공개 글 열람용 비밀번호"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
                  />
                </div>
                <p className="text-[11px] text-stone-500 mt-1">
                  추후 게시글 상세 조회 및 관리자 답변 확인 시 사용되는 비밀번호입니다.
                </p>
              </div>

              {/* Privacy Agreement (Required) */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreedPrivacy}
                    onChange={(e) => setFormData({ ...formData, agreedPrivacy: e.target.checked })}
                    className="mt-0.5 rounded text-[#872D35] focus:ring-[#872D35]"
                  />
                  <div className="text-xs text-stone-700">
                    <span className="font-bold text-stone-900">
                      [필수] 개인정보 수집 및 이용에 동의합니다.
                    </span>
                    <p className="text-stone-500 text-[11px] mt-0.5">
                      {state.formConfig?.quotePrivacyText || '대량 납품 견적 산출 및 유선 안내를 위해 입력하신 정보를 수집 및 처리하며 관련 법령에 따라 철저히 비공개 보호됩니다.'}
                    </p>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-5 py-3 rounded-xl border border-stone-300 text-xs sm:text-sm font-bold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer"
                >
                  취소
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>접수 처리 중...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>견적 상담 신청서 등록</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        )}

        {/* 3. DETAIL VIEW MODE */}
        {viewMode === 'detail' && selectedQuote && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6">
            
            {/* Header info */}
            <div className="border-b border-stone-200 pb-5">
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(selectedQuote.status)}
                <span className="text-xs font-mono text-stone-400">#{selectedQuote.postNumber}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                {selectedQuote.title}
              </h2>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-stone-500 mt-2">
                <span>작성자: <strong>{isAdminLoggedIn ? selectedQuote.contactPerson : getMaskedWriter(selectedQuote)}</strong></span>
                <span>상호명: <strong>{isAdminLoggedIn ? selectedQuote.companyName : getMaskedCompany(selectedQuote)}</strong></span>
                <span>작성일: <strong className="font-mono">{selectedQuote.createdAt}</strong></span>
                <span>조회수: <strong className="font-mono">{selectedQuote.readCount}</strong></span>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-5 rounded-2xl border border-stone-200 text-xs">
              <div className="space-y-2">
                <div>
                  <span className="text-stone-400 block text-[11px]">업체명 / 상호</span>
                  <span className="font-bold text-stone-800">{selectedQuote.companyName}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">담당자 성함</span>
                  <span className="font-bold text-stone-800">{selectedQuote.contactPerson}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">연락처</span>
                  <span className="font-mono font-bold text-stone-800">
                    {isAdminLoggedIn ? selectedQuote.phone : selectedQuote.phone.slice(0, 7) + '****'}
                  </span>
                </div>
                {selectedQuote.email && (
                  <div>
                    <span className="text-stone-400 block text-[11px]">이메일</span>
                    <span className="font-mono text-stone-800">{selectedQuote.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-stone-400 block text-[11px]">납품 희망 지역</span>
                  <span className="font-bold text-stone-800">{selectedQuote.region || '미기재'}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">업종 형태</span>
                  <span className="font-bold text-stone-800">{selectedQuote.businessType || '일반음식점'}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">예상 월 납품 수량</span>
                  <span className="font-bold text-stone-800">{selectedQuote.monthlyVolume || '협의 예정'}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">희망 납품 일정</span>
                  <span className="font-bold text-stone-800">{selectedQuote.deliverySchedule || '협의 예정'}</span>
                </div>
              </div>
            </div>

            {/* Selected Products Badges */}
            <div>
              <span className="text-xs font-bold text-stone-700 block mb-2">관심 제품</span>
              <div className="flex flex-wrap gap-2">
                {selectedQuote.interestedProducts.map((p, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-[#872D35]/10 text-[#872D35] text-xs font-bold border border-[#872D35]/20">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Message Body */}
            <div>
              <span className="text-xs font-bold text-stone-700 block mb-2">상담 내용</span>
              <div className="p-5 rounded-2xl bg-white border border-stone-200 text-stone-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                {selectedQuote.message || '상세 상담 내용이 없습니다.'}
              </div>
            </div>

            {/* Attachments */}
            {selectedQuote.attachments && selectedQuote.attachments.length > 0 && (
              <div>
                <span className="text-xs font-bold text-stone-700 block mb-2">첨부파일</span>
                <div className="space-y-1">
                  {selectedQuote.attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      <Paperclip className="w-3.5 h-3.5 text-stone-400" />
                      <span className="font-medium">{att.name}</span>
                      {att.size && <span className="text-stone-400 font-mono">({att.size})</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Official Admin Reply (if exists) */}
            {selectedQuote.adminReply ? (
              <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-purple-900">
                      {selectedQuote.adminReply.author} 공식 답변
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-purple-500">
                    {selectedQuote.adminReply.repliedAt}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-purple-950 leading-relaxed whitespace-pre-wrap pt-1">
                  {selectedQuote.adminReply.content}
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-500 text-center">
                담당 영업팀에서 내용을 검토 중입니다. 곧 유선 연락 또는 답변이 등록됩니다.
              </div>
            )}

            {/* ADMIN ONLY CONTROLS */}
            {isAdminLoggedIn && (
              <div className="p-5 rounded-2xl bg-red-50/40 border border-red-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#872D35] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>관리자 전용 답변 및 상태 관리</span>
                  </span>

                  <button
                    onClick={() => {
                      if (confirm('정말 이 견적 상담글을 삭제하시겠습니까?')) {
                        deleteQuoteInquiry(selectedQuote.id);
                        setViewMode('list');
                      }
                    }}
                    className="text-xs text-red-600 hover:underline font-bold"
                  >
                    게시글 삭제
                  </button>
                </div>

                <form onSubmit={handleReplySubmit} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-700">진행 상태 변경:</span>
                    <select
                      value={adminReplyStatus}
                      onChange={(e) => {
                        setAdminReplyStatus(e.target.value);
                        updateQuoteStatus(selectedQuote.id, e.target.value);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold bg-white"
                    >
                      <option value="접수완료">접수완료</option>
                      <option value="상담중">상담중</option>
                      <option value="견적완료">견적완료</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      관리자 공식 답변 작성:
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="고객에게 안내할 견적 요약, 유선 상담 내역, 발송 사항 등을 입력하세요."
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-[#872D35] bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isReplying}
                    className="px-4 py-2 rounded-xl bg-[#872D35] text-white text-xs font-bold hover:bg-[#6D242B] cursor-pointer"
                  >
                    답변 저장 및 상태 업데이트
                  </button>
                </form>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewMode('list')}
                className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                목록으로 돌아가기
              </button>
            </div>

          </div>
        )}

      </div>

      {/* PASSWORD UNLOCK MODAL */}
      {passwordModalOpen && quoteToUnlock && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setPasswordModalOpen(false);
                setPasswordError(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-[#872D35]/10 text-[#872D35] flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-stone-900">비밀글 열람 인증</h3>
              <p className="text-xs text-stone-500 mt-1">
                작성 시 설정하신 비밀번호를 입력해 주세요.
              </p>
            </div>

            <form onSubmit={handleUnlockSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  autoFocus
                  placeholder="비밀번호 입력"
                  value={enteredPassword}
                  onChange={(e) => {
                    setEnteredPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-center tracking-widest focus:outline-none focus:border-[#872D35] bg-stone-50 font-mono"
                />
              </div>

              {passwordError && (
                <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs text-center font-bold">
                  {passwordError}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="flex-1 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold cursor-pointer"
                >
                  {isVerifying ? '확인 중...' : '확인'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
