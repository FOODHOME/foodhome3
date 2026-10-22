import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { B2BInquiry } from '../types';
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
  X
} from 'lucide-react';

interface SampleBoardPageProps {
  initialViewMode?: 'list' | 'write';
}

export const SampleBoardPage: React.FC<SampleBoardPageProps> = ({ initialViewMode = 'list' }) => {
  const { 
    state, 
    addSamplePost, 
    updateSamplePostReply, 
    updateInquiryStatus, 
    deleteInquiry,
    isAdminLoggedIn, 
    verifyPostPassword, 
    showToast,
    setActivePage
  } = useApp();

  const [viewMode, setViewMode] = useState<'list' | 'write' | 'detail'>(initialViewMode);
  const [selectedPost, setSelectedPost] = useState<B2BInquiry | null>(null);

  // Password Unlock Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [postToUnlock, setPostToUnlock] = useState<B2BInquiry | null>(null);
  const [enteredPassword, setEnteredPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('전체');

  // Write Form State
  const [formData, setFormData] = useState({
    title: '',
    storeName: '',
    contactPerson: '',
    phone: '',
    address: '',
    selectedProducts: ['명품 보쌈무김치 1kg', '비법 보쌈김칫속 1kg'],
    message: '',
    password: '',
    agreedPrivacy: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin Reply Input State
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminReplyStatus, setAdminReplyStatus] = useState<B2BInquiry['status']>('답변완료');
  const [isReplying, setIsReplying] = useState(false);

  const sampleProductsList = [
    '명품 보쌈무김치 1kg',
    '비법 보쌈김칫속 1kg',
    '업소용 특제 굴보쌈 양념 500g',
    '특허 수분제어 맞춤 절임무 1kg'
  ];

  const handleProductToggle = (productName: string) => {
    setFormData(prev => {
      const exists = prev.selectedProducts.includes(productName);
      if (exists) {
        if (prev.selectedProducts.length <= 1) {
          alert('최소 1개 이상의 샘플 품목을 선택해 주세요.');
          return prev;
        }
        return {
          ...prev,
          selectedProducts: prev.selectedProducts.filter(p => p !== productName)
        };
      } else {
        return {
          ...prev,
          selectedProducts: [...prev.selectedProducts, productName]
        };
      }
    });
  };

  const handleRowClick = (post: B2BInquiry) => {
    if (isAdminLoggedIn) {
      setSelectedPost(post);
      setViewMode('detail');
      return;
    }

    // Customer click: require password
    setPostToUnlock(post);
    setEnteredPassword('');
    setPasswordError(null);
    setPasswordModalOpen(true);
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postToUnlock) return;

    if (!enteredPassword) {
      setPasswordError('비밀번호 4자리를 입력해 주세요.');
      return;
    }

    const isValid = verifyPostPassword(postToUnlock.id, enteredPassword);
    if (isValid) {
      setPasswordModalOpen(false);
      setSelectedPost(postToUnlock);
      setViewMode('detail');
      setPasswordError(null);
    } else {
      setPasswordError('비밀번호가 일치하지 않습니다. 다시 확인해 주세요.');
    }
  };

  const handleWriteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.storeName.trim() || !formData.contactPerson.trim() || !formData.phone.trim() || !formData.address.trim()) {
      alert('상호명, 담당자명, 연락처, 배송지 주소는 필수 입력 사항입니다.');
      return;
    }

    if (!formData.password || formData.password.length < 4) {
      alert('게시글 조회를 위한 비밀번호 4자리 이상을 입력해 주세요.');
      return;
    }

    if (!formData.agreedPrivacy) {
      alert('개인정보 수집 및 이용에 동의해 주셔야 신청이 완료됩니다.');
      return;
    }

    setIsSubmitting(true);
    const finalTitle = formData.title.trim() 
      ? formData.title.trim() 
      : `[${formData.storeName}] 무료 샘플 신청합니다.`;

    const res = await addSamplePost({
      title: finalTitle,
      companyName: formData.storeName,
      storeName: formData.storeName,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      address: formData.address,
      selectedProducts: formData.selectedProducts,
      message: formData.message,
      password: formData.password
    });

    setIsSubmitting(false);

    if (res.success) {
      // Reset form and go back to list
      setFormData({
        title: '',
        storeName: '',
        contactPerson: '',
        phone: '',
        address: '',
        selectedProducts: ['명품 보쌈무김치 1kg', '비법 보쌈김칫속 1kg'],
        message: '',
        password: '',
        agreedPrivacy: true
      });
      setViewMode('list');
    }
  };

  const handleAdminReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !adminReplyText.trim()) return;

    setIsReplying(true);
    updateSamplePostReply(selectedPost.id, adminReplyText.trim(), adminReplyStatus);
    setIsReplying(false);
    
    // Update local selected post
    setSelectedPost(prev => prev ? {
      ...prev,
      status: adminReplyStatus,
      adminReply: {
        content: adminReplyText.trim(),
        repliedAt: new Date().toISOString().slice(0, 10),
        author: '푸드홈 배송관리팀'
      }
    } : null);

    setAdminReplyText('');
    showToast('관리자 답변 및 배송 현황이 등록되었습니다.');
  };

  // Filter inquiries
  const filteredPosts = state.inquiries.filter(post => {
    const matchesSearch = 
      (post.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.storeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.writer || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === '전체' ||
      post.status === statusFilter ||
      (statusFilter === '답변완료' && (post.status === '답변완료' || post.status === '상담완료')) ||
      (statusFilter === '배송완료' && (post.status === '배송완료' || post.status === '샘플발송완료'));

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '접수대기':
      case '접수완료':
      case '접수':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200">
            <Clock className="w-3 h-3 text-slate-500" /> 접수완료
          </span>
        );
      case '답변완료':
      case '상담완료':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
            <MessageSquare className="w-3 h-3 text-blue-600" /> 답변완료
          </span>
        );
      case '배송준비':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
            <Truck className="w-3 h-3 text-amber-600" /> 배송준비
          </span>
        );
      case '배송완료':
      case '샘플발송완료':
      case '완료':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 발송완료
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-[#2A2020] animate-in fade-in duration-200 pb-20">
      
      {/* Top Banner */}
      <section className="relative h-[220px] sm:h-[260px] flex items-center justify-center overflow-hidden bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1583032015879-67990c74900a?auto=format&fit=crop&w=1920&q=80"
          alt="푸드홈 샘플 신청"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1616] via-[#2A2020]/75 to-transparent" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#872D35]/80 text-white text-xs font-bold mb-2 backdrop-blur-xs border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>BUSINESS SAMPLE PACK</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            샘플신청 게시판
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-200 font-medium max-w-xl mx-auto drop-shadow-sm">
            외식업 대표님을 위한 1kg 무료 샘플팩 신청 게시판입니다. 개인정보 보호를 위해 안전한 비밀글로 접수됩니다.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* VIEW MODE 1: LIST VIEW (Image 1 Style) */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            
            {/* Top Security & Benefit Notice Card */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-stone-900">
                    외식업 사업자 안심 샘플 신청 서비스
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    게시글은 4자리 비밀번호로 보호되며, 작성자와 관리자만 안전하게 열람할 수 있습니다.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewMode('write')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#9E2A2B] text-white font-black text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-105"
              >
                <PenSquare className="w-4 h-4" />
                <span>샘플 신청글 쓰기</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-center">
                <span className="text-[11px] font-bold text-stone-400 block">전체 신청글</span>
                <span className="text-xl font-black text-stone-900">{state.inquiries.length}건</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-center">
                <span className="text-[11px] font-bold text-stone-400 block">접수 완료</span>
                <span className="text-xl font-black text-slate-700">
                  {state.inquiries.filter(i => i.status === '접수완료' || i.status === '접수대기' || i.status === '접수').length}건
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-center">
                <span className="text-[11px] font-bold text-stone-400 block">답변 완료</span>
                <span className="text-xl font-black text-blue-600">
                  {state.inquiries.filter(i => i.status === '답변완료' || i.status === '상담완료').length}건
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-stone-200 text-center">
                <span className="text-[11px] font-bold text-stone-400 block">발송 완료</span>
                <span className="text-xl font-black text-emerald-600">
                  {state.inquiries.filter(i => i.status === '배송완료' || i.status === '샘플발송완료' || i.status === '완료').length}건
                </span>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto no-scrollbar">
                {['전체', '접수완료', '답변완료', '배송완료'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#872D35] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="제목, 작성자, 상호명 검색..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#872D35] bg-stone-50"
                />
              </div>
            </div>

            {/* Board Table (Image 1 Style) */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-600 font-extrabold text-[11px] sm:text-xs">
                      <th className="py-3.5 px-4 text-center w-14 sm:w-16">번호</th>
                      <th className="py-3.5 px-3 text-center w-24 sm:w-28">접수상황</th>
                      <th className="py-3.5 px-4">제목</th>
                      <th className="py-3.5 px-4 w-24 sm:w-28 text-center">작성자</th>
                      <th className="py-3.5 px-3 w-24 sm:w-28 text-center">작성일</th>
                      <th className="py-3.5 px-3 w-16 text-center hidden sm:table-cell">조회수</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {filteredPosts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-400">
                          검색된 샘플 신청 내역이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      filteredPosts.map((post, idx) => {
                        const postNo = post.postNumber || (filteredPosts.length - idx);
                        const hasReply = !!post.adminReply;

                        return (
                          <tr
                            key={post.id}
                            onClick={() => handleRowClick(post)}
                            className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                          >
                            <td className="py-3.5 px-4 text-center text-stone-400 font-mono text-xs">
                              {postNo}
                            </td>
                            <td className="py-3.5 px-3 text-center">
                              {getStatusBadge(post.status)}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <Lock className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#872D35] shrink-0" />
                                <span className="font-bold text-stone-800 group-hover:text-[#872D35] transition-colors line-clamp-1">
                                  {post.title || `[${post.storeName || post.companyName}] 무료 샘플 신청합니다.`}
                                </span>
                                {hasReply && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-black shrink-0">
                                    답변 [1]
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center text-stone-600 font-medium text-xs">
                              {post.writer || '박*우'}
                            </td>
                            <td className="py-3.5 px-3 text-center text-stone-400 text-xs font-mono">
                              {post.createdAt.slice(0, 10)}
                            </td>
                            <td className="py-3.5 px-3 text-center text-stone-400 text-xs font-mono hidden sm:table-cell">
                              {post.readCount || 1}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Board Footer Action */}
              <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-between">
                <span className="text-xs text-stone-500 font-medium">
                  총 <strong className="text-stone-900">{filteredPosts.length}</strong>개의 신청글이 등록되어 있습니다.
                </span>
                <button
                  onClick={() => setViewMode('write')}
                  className="px-4 py-2 rounded-xl bg-[#872D35] hover:bg-[#9E2A2B] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>글쓰기</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* VIEW MODE 2: WRITE FORM (Images 2 & 3 Style, Modern Clean Redesign) */}
        {viewMode === 'write' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setViewMode('list')}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>목록으로 돌아가기</span>
              </button>
              <span className="text-xs text-stone-400 font-medium">샘플 신청글 작성</span>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm">
              <div className="border-b border-stone-100 pb-5 mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                  사업자 1kg 무료 샘플팩 신청
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  외식업 매장 주방에서 직접 품질과 식감을 검증해 보실 수 있도록 익일 냉장 발송해 드립니다.
                </p>
              </div>

              <form onSubmit={handleWriteSubmit} className="space-y-6">
                {/* 1. Post Title */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    게시글 제목 <span className="text-stone-400 font-normal">(미입력 시 상호명으로 자동 생성)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="예: [서울 강남] 보쌈 전문점 무료 샘플 신청합니다."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50/50"
                  />
                </div>

                {/* 2. Store Name & Contact Person */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      매장명 (상호명) <span className="text-[#872D35]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      placeholder="예: 압구정 대박보쌈"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      대표자 / 담당자 성함 <span className="text-[#872D35]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="예: 홍길동 대표"
                      className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50/50"
                    />
                  </div>
                </div>

                {/* 3. Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    연락처 (휴대폰 번호) <span className="text-[#872D35]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="예: 010-1234-5678 (배송 안내 문자 발송용)"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50/50"
                  />
                </div>

                {/* 4. Address */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    샘플 수령 주소 (도로명 / 상세주소) <span className="text-[#872D35]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="예: 서울특별시 강남구 신사동 512-4번지 1층 매장"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50/50"
                  />
                </div>

                {/* 5. Sample Products Selection */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-2">
                    희망 샘플 품목 선택 <span className="text-[#872D35]">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {sampleProductsList.map((prod) => {
                      const isSelected = formData.selectedProducts.includes(prod);
                      return (
                        <div
                          key={prod}
                          onClick={() => handleProductToggle(prod)}
                          className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'border-[#872D35] bg-[#872D35]/5 text-[#872D35]'
                              : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300'
                          }`}
                        >
                          <span>{prod}</span>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isSelected ? 'bg-[#872D35] text-white' : 'border border-stone-300'}`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 6. Message / Store Note */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    상세 요청사항 / 매장 정보 <span className="text-stone-400 font-normal">(월 예상 사용량, 개업일, 선호하는 맛 등)</span>
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="예: 현재 보쌈 전문점을 운영 중이며 물이 덜 생기는 보쌈무김치를 찾고 있습니다. 월 예상량은 약 200kg입니다."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50/50 resize-none"
                  />
                </div>

                {/* 7. Password Setting (Post Protection) */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                  <label className="block text-xs font-bold text-stone-800">
                    게시글 비밀번호 설정 <span className="text-[#872D35]">*</span>
                  </label>
                  <p className="text-[11px] text-stone-500">
                    신청글 조회 및 관리자 답변 확인 시 사용할 4자리 비밀번호를 입력해 주세요. (타인은 열람할 수 없습니다)
                  </p>
                  <input
                    type="password"
                    maxLength={10}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="비밀번호 4자리 입력"
                    className="w-full sm:w-60 px-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-white font-mono"
                  />
                </div>

                {/* 8. Privacy Agreement */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.agreedPrivacy}
                      onChange={(e) => setFormData({ ...formData, agreedPrivacy: e.target.checked })}
                      className="mt-0.5 rounded text-[#872D35] focus:ring-[#872D35] w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs text-stone-600 leading-tight">
                      <strong className="text-stone-800">[필수]</strong> 개인정보 수집 및 이용 동의 (수집항목: 상호명, 담당자명, 연락처, 주소 / 이용목적: 무료 샘플 배송 및 상담 확인 / 보유기간: 목적 달성 시 즉시 파기)
                    </span>
                  </label>
                </div>

                {/* Submit & Cancel Buttons */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="px-5 py-3 rounded-xl border border-stone-300 text-stone-700 text-xs sm:text-sm font-bold hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-xl bg-[#872D35] hover:bg-[#9E2A2B] text-white text-xs sm:text-sm font-black shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-105 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? '신청글 접수 중...' : '샘플 신청 완료하기'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW MODE 3: DETAIL VIEW (Unlocked Post & Admin Reply) */}
        {viewMode === 'detail' && selectedPost && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-150">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setViewMode('list')}
                className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>목록으로 돌아가기</span>
              </button>
              <div className="flex items-center gap-2">
                {isAdminLoggedIn && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                    관리자 권한 열람
                  </span>
                )}
                <span className="text-xs text-stone-400 font-mono">
                  글 번호 #{selectedPost.postNumber || selectedPost.id}
                </span>
              </div>
            </div>

            {/* Post Header Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
              <div className="border-b border-stone-100 pb-5">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge(selectedPost.status)}
                  <span className="text-xs text-stone-400 font-mono">
                    {selectedPost.createdAt}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                  {selectedPost.title || `[${selectedPost.storeName || selectedPost.companyName}] 무료 샘플 신청합니다.`}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-stone-400" />
                    작성자: <strong>{isAdminLoggedIn ? selectedPost.contactPerson : selectedPost.writer}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Store className="w-3.5 h-3.5 text-stone-400" />
                    상호명: <strong>{selectedPost.storeName || selectedPost.companyName}</strong>
                  </span>
                </div>
              </div>

              {/* Inquiry Customer Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200/70">
                <div>
                  <span className="text-stone-400 font-semibold block">연락처</span>
                  <p className="font-bold text-stone-800 mt-0.5">
                    {isAdminLoggedIn ? selectedPost.phone : selectedPost.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1-****-$2')}
                  </p>
                </div>
                <div>
                  <span className="text-stone-400 font-semibold block">수령 주소</span>
                  <p className="font-bold text-stone-800 mt-0.5">
                    {selectedPost.address || selectedPost.region || '상세 주소 확인 완료'}
                  </p>
                </div>
                {selectedPost.selectedProducts && selectedPost.selectedProducts.length > 0 && (
                  <div className="sm:col-span-2 pt-2 border-t border-stone-200/50">
                    <span className="text-stone-400 font-semibold block mb-1.5">신청 샘플 품목</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPost.selectedProducts.map((p, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 font-bold text-[#872D35] text-[11px]">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div>
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">상세 요청사항</h4>
                <div className="p-4 rounded-2xl bg-white border border-stone-200 text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">
                  {selectedPost.message || '상세 요청사항이 등록되지 않았습니다.'}
                </div>
              </div>

              {/* Administrator's Official Reply */}
              {selectedPost.adminReply ? (
                <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] border-2 border-[#872D35]/20 relative">
                  <div className="flex items-center justify-between mb-3 border-b border-stone-200/70 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#872D35] text-white flex items-center justify-center font-bold text-xs">
                        푸
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-stone-900 block">
                          {selectedPost.adminReply.author || '푸드홈 배송관리팀'}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          답변일: {selectedPost.adminReply.repliedAt}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#872D35]/10 text-[#872D35] text-[10px] font-extrabold">
                      공식 답변
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">
                    {selectedPost.adminReply.content}
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                  <p className="text-xs text-stone-500">
                    관리자가 신청 내역을 확인하고 있습니다. 확인 즉시 배송 일정과 운송장 번호를 본 게시글 답변으로 등록해 드립니다.
                  </p>
                </div>
              )}

              {/* Admin-only Reply Box & Status Manager */}
              {isAdminLoggedIn && (
                <div className="mt-8 p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>관리자 답변 등록 및 배송 상태 변경</span>
                    </h4>
                    <span className="text-[10px] font-bold text-amber-700">ADMIN ONLY</span>
                  </div>

                  <form onSubmit={handleAdminReplySubmit} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-stone-700">진행 상태:</label>
                      <select
                        value={adminReplyStatus}
                        onChange={(e) => setAdminReplyStatus(e.target.value as any)}
                        className="px-3 py-1.5 rounded-lg border border-amber-300 text-xs bg-white font-bold"
                      >
                        <option value="접수완료">접수완료</option>
                        <option value="답변완료">답변완료</option>
                        <option value="배송준비">배송준비</option>
                        <option value="배송완료">배송완료</option>
                      </select>
                    </div>

                    <textarea
                      rows={3}
                      value={adminReplyText}
                      onChange={(e) => setAdminReplyText(e.target.value)}
                      placeholder="고객에게 안내할 답변 내용 (예: 냉장택배 송장번호, 배송 예정일, 상담 안내 등)"
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs focus:outline-none focus:border-[#872D35] bg-white"
                    />

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isReplying || !adminReplyText.trim()}
                        className="px-4 py-2 rounded-xl bg-[#872D35] text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-[#9E2A2B] disabled:opacity-50"
                      >
                        답변 등록하기
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Password Unlock Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#872D35] flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="text-center font-black text-lg text-stone-900 mb-1">
              비밀글 열람 비밀번호
            </h3>
            <p className="text-center text-xs text-stone-500 mb-6">
              작성 시 입력하신 4자리 비밀번호를 입력해 주세요.
            </p>

            <form onSubmit={handleUnlockSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={10}
                  autoFocus
                  value={enteredPassword}
                  onChange={(e) => {
                    setEnteredPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  placeholder="비밀번호 4자리"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 text-center text-base tracking-widest font-mono focus:outline-none focus:border-[#872D35]"
                />
                {passwordError && (
                  <p className="text-xs text-red-600 font-bold text-center mt-2">
                    {passwordError}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#9E2A2B] text-white text-xs font-black shadow-sm cursor-pointer"
                >
                  확인하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
