import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { FaqItem } from '../types';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  PhoneCall, 
  MessageSquareText, 
  Package, 
  Truck, 
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';

export const FaqBoardPage: React.FC = () => {
  const { 
    state, 
    setActivePage, 
    setIsAdminOpen, 
    isAdminLoggedIn 
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const rawFaqs = state.content.faqItems || [];

  // Extract configured categories from state or fallback to unique categories
  const categories = useMemo(() => {
    if (state.content.faqCategories && state.content.faqCategories.length > 0) {
      return state.content.faqCategories
        .filter(c => c.visible !== false)
        .sort((a, b) => a.order - b.order)
        .map(c => c.name);
    }
    const set = new Set<string>();
    rawFaqs.forEach(f => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [rawFaqs, state.content.faqCategories]);

  // Filter FAQs by visibility, category, and search query
  const filteredFaqs = useMemo(() => {
    return rawFaqs.filter(faq => {
      // If visible is explicitly false, hide it
      if (faq.visible === false) return false;

      // Category filter
      if (activeCategory !== 'all' && faq.category !== activeCategory) {
        return false;
      }

      // Search term filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesQ = faq.question.toLowerCase().includes(q);
        const matchesA = faq.answer.toLowerCase().includes(q);
        const matchesC = faq.category.toLowerCase().includes(q);
        return matchesQ || matchesA || matchesC;
      }

      return true;
    });
  }, [rawFaqs, activeCategory, searchTerm]);

  const toggleAccordion = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-stone-50 text-[#2A2020] animate-in fade-in duration-200">
      {/* Top Hero Banner */}
      <section className="relative h-[240px] sm:h-[300px] flex items-center justify-center overflow-hidden bg-slate-900">
        <img
          src="./images/facility_cleanroom.jpg"
          alt="푸드홈 자주하는 질문"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1920&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1616] via-[#2A2020]/75 to-transparent" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#872D35]/80 text-white text-xs font-bold mb-3 backdrop-blur-xs border border-white/20">
            <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
            <span>CUSTOMER SUPPORT FAQ</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            자주하는 질문 (FAQ)
          </h1>
          <p className="mt-2 text-sm sm:text-base text-stone-200 font-medium max-w-xl mx-auto drop-shadow-sm">
            외식업 대표님들께서 가장 많이 문의하시는 무료 샘플 신청, 대량 발주, 물류 및 보관에 대한 질문과 답변입니다.
          </p>
        </div>
      </section>

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between text-xs">
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
            <span className="font-bold text-[#872D35]">자주하는 질문(FAQ)</span>
          </div>

          {isAdminLoggedIn && (
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-[11px] font-bold text-stone-600 hover:text-[#872D35] flex items-center gap-1 cursor-pointer bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-md"
            >
              <span>관리자 FAQ 편집</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Search Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-base sm:text-lg font-black text-stone-900">
            궁금하신 내용을 검색해 보세요
          </h2>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="질문 검색 (예: 샘플, 납품, 최소발주, 보관방법...)"
              className="w-full pl-11 pr-12 py-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#872D35] focus:ring-1 focus:ring-[#872D35] text-sm bg-stone-50/50 shadow-inner"
            />
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400 hover:text-stone-600 bg-stone-200 hover:bg-stone-300 rounded-full w-5 h-5 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          <p className="text-xs text-stone-500">
            원하시는 답변을 찾지 못하셨다면 <strong className="text-[#872D35] cursor-pointer" onClick={() => setActivePage('quote-board')}>1:1 견적 상담</strong>을 남겨주시면 빠르게 답변해 드립니다.
          </p>
        </div>

        {/* Category Tabs Filter */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-[#872D35] text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            전체 질문 ({rawFaqs.length})
          </button>
          {categories.map((cat) => {
            const count = rawFaqs.filter(f => f.category === cat).length;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#872D35] text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedId === faq.id || (filteredFaqs.length === 1);
              return (
                <div
                  key={faq.id || idx}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    isExpanded 
                      ? 'border-[#872D35]/50 shadow-md ring-1 ring-[#872D35]/10' 
                      : 'border-stone-200 shadow-2xs hover:border-stone-300'
                  }`}
                >
                  {/* Question Button Header */}
                  <button
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full px-5 sm:px-6 py-4.5 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 transition-colors ${
                        isExpanded 
                          ? 'bg-[#872D35] text-white' 
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        Q
                      </span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                            {faq.category || '일반안내'}
                          </span>
                        </div>
                        <h3 className={`text-sm sm:text-base font-bold transition-colors ${
                          isExpanded ? 'text-[#872D35]' : 'text-stone-900 hover:text-[#872D35]'
                        }`}>
                          {faq.question}
                        </h3>
                      </div>
                    </div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'bg-[#872D35]/10 text-[#872D35]' : 'bg-stone-100 text-stone-400'
                    }`}>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Answer Accordion Body */}
                  {isExpanded && (
                    <div className="px-5 sm:px-6 pb-6 pt-2 bg-stone-50/60 border-t border-stone-100 animate-in fade-in duration-200">
                      <div className="flex items-start gap-3 pl-1 sm:pl-2">
                        <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                          A
                        </span>
                        <div className="space-y-3 flex-1 text-xs sm:text-sm leading-relaxed text-stone-700">
                          <p className="whitespace-pre-line">
                            {faq.answer}
                          </p>

                          {/* Quick related CTA if relevant to sample or wholesale */}
                          {faq.category === '샘플신청' && (
                            <div className="pt-2">
                              <button
                                onClick={() => setActivePage('sample-board-write')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#872D35] text-white text-xs font-bold hover:bg-[#6E1D24] transition-colors cursor-pointer"
                              >
                                <Package className="w-3.5 h-3.5" />
                                <span>지금 바로 무료 샘플 1kg 신청하기 →</span>
                              </button>
                            </div>
                          )}

                          {faq.category === '납품·단가' && (
                            <div className="pt-2">
                              <button
                                onClick={() => setActivePage('quote-board-write')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
                              >
                                <MessageSquareText className="w-3.5 h-3.5" />
                                <span>1:1 대량 납품 맞춤 견적 문의하기 →</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500 space-y-3">
              <Info className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-sm font-semibold">검색 조건에 맞는 자주하는 질문이 없습니다.</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-xs font-bold text-[#872D35] underline cursor-pointer"
                >
                  검색어 초기화 및 전체 질문 보기
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Fast Action Support Box */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-stone-50 border border-stone-200/80 space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#872D35]/10 text-[#872D35] flex items-center justify-center mb-3">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="text-base font-extrabold text-stone-900">
                식당 사장님 전용 1kg 무료 샘플
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                현재 외식업 매장을 운영 중이시거나 신규 창업을 준비 중이시라면, 제품비와 냉장 택배비 전액 무료로 먼저 맛을 검증해 보세요.
              </p>
            </div>
            <button
              onClick={() => setActivePage('sample-board-write')}
              className="w-full py-2.5 rounded-lg bg-[#872D35] text-white text-xs font-bold hover:bg-[#6E1D24] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>무료 샘플팩 신청하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-6 rounded-xl bg-stone-50 border border-stone-200/80 space-y-3 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-stone-800 text-white flex items-center justify-center mb-3">
                <MessageSquareText className="w-5 h-5" />
              </div>
              <h4 className="text-base font-extrabold text-stone-900">
                1:1 대량 납품 & 프랜차이즈 OEM 견적
              </h4>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                월 300kg 이상 소진 대형 매장, 가맹 본부 전용 레시피 개발 및 전국 콜드체인 정기 배송 견적을 전문 상담원이 신속히 안내합니다.
              </p>
            </div>
            <button
              onClick={() => setActivePage('quote-board-write')}
              className="w-full py-2.5 rounded-lg bg-stone-800 text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>1:1 견적 상담 신청하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
