import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodhomeLogo } from './FoodhomeLogo';
import { 
  Phone, 
  Settings, 
  Sparkles, 
  Menu, 
  X, 
  ChevronDown, 
  ExternalLink,
  ShieldCheck,
  Clock,
  Store
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    state, 
    setIsAdminOpen, 
    setIsSampleModalOpen, 
    setIsWholesaleModalOpen,
    setActivePage,
    activePage,
    setCompanyAboutTab,
    navigateToProductDetail
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const pendingInquiriesCount = state.inquiries.filter(i => i.status === '접수대기').length;

  const navigateTo = (page: string, sectionId?: string) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    setActiveDropdown(null);

    if (sectionId && page === 'home') {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          const offset = 90;
          const bodyRect = document.body.getBoundingClientRect().top;
          const elementRect = el.getBoundingClientRect().top;
          const elementPosition = elementRect - bodyRect;
          const offsetPosition = elementPosition - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navMenus = (state.content.navMenus && state.content.navMenus.length > 0)
    ? state.content.navMenus.filter(m => m.visible !== false)
    : [
        {
          id: 'about',
          name: '회사소개',
          visible: true,
          actionType: 'page' as const,
          target: 'about',
          submenus: [
            { id: 'sub-about-1', label: '회사소개 & CEO 인사말', actionType: 'page' as const, target: 'about-intro' },
            { id: 'sub-about-2', label: '생산 & 물류시스템', actionType: 'page' as const, target: 'about-system' },
            { id: 'sub-about-3', label: '인허가사항', actionType: 'page' as const, target: 'about-permits' },
            { id: 'sub-about-4', label: '오시는 길', actionType: 'page' as const, target: 'about-location' }
          ]
        },
        {
          id: 'products',
          name: '제품소개',
          visible: true,
          actionType: 'page' as const,
          target: 'products',
          submenus: [
            { id: 'sub-prod-1', label: '명품 보쌈무김치', actionType: 'page' as const, target: 'product-detail', subTarget: 'prod-1' },
            { id: 'sub-prod-2', label: '비법 보쌈겉절이', actionType: 'page' as const, target: 'product-detail', subTarget: 'prod-2' },
            { id: 'sub-prod-3', label: '업소용 대용량 (10kg)', actionType: 'page' as const, target: 'product-detail', subTarget: 'prod-4' },
            { id: 'sub-prod-4', label: '소포장 & 밀키트 (500g)', actionType: 'page' as const, target: 'product-detail', subTarget: 'prod-5' }
          ]
        },
        {
          id: 'sample-board',
          name: '샘플신청',
          visible: true,
          actionType: 'page' as const,
          target: 'sample-board',
          submenus: [
            { id: 'sub-sample-1', label: '샘플신청 게시판', actionType: 'page' as const, target: 'sample-board' },
            { id: 'sub-sample-2', label: '신청글 작성하기', actionType: 'page' as const, target: 'sample-board-write' },
            { id: 'sub-sample-3', label: '샘플 발송 현황 조회', actionType: 'page' as const, target: 'sample-board' }
          ]
        },
        {
          id: 'wholesale',
          name: '납품안내',
          visible: true,
          actionType: 'wholesale' as const,
          target: '',
          submenus: [
            { id: 'sub-who-1', label: 'B2B 대량공급 절차 안내', actionType: 'wholesale' as const, target: '' },
            { id: 'sub-who-2', label: '프랜차이즈 맞춤 OEM/PB', actionType: 'wholesale' as const, target: '' },
            { id: 'sub-who-3', label: '사업자 1kg 무료 샘플팩', actionType: 'page' as const, target: 'sample-board-write' }
          ]
        },
        {
          id: 'cs',
          name: '고객센터',
          visible: true,
          actionType: 'scroll' as const,
          target: 'footer-section',
          submenus: [
            { id: 'sub-cs-1', label: '공지사항', actionType: 'board' as const, target: 'notice-board' },
            { id: 'sub-cs-2', label: '자주하는 질문 (FAQ)', actionType: 'board' as const, target: 'faq-board' },
            { id: 'sub-cs-3', label: '1:1 대량 납품 견적 상담', actionType: 'quote' as const, target: 'quote-board' },
            { id: 'sub-cs-4', label: '사업자 무료 샘플 신청', actionType: 'sample' as const, target: 'sample-board' },
            { id: 'sub-cs-5', label: '고객센터 유선 전화안내', actionType: 'scroll' as const, target: 'footer-section' }
          ]
        }
      ];

  const handleMenuAction = (
    actionType?: string, 
    target?: string, 
    fallbackTarget?: string, 
    menuId?: string,
    subTarget?: string,
    label?: string
  ) => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);

    const checkLabel = (label || '').toLowerCase();
    const checkTarget = (target || '').toLowerCase();

    // 1. Notice Board
    if (
      checkTarget === 'notice-board' || 
      checkTarget === 'notices' || 
      checkTarget === 'notice' || 
      subTarget === 'notice-board' ||
      checkLabel.includes('공지') ||
      (actionType === 'board' && (checkTarget.includes('notice') || checkLabel.includes('공지')))
    ) {
      setActivePage('notice-board');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 2. FAQ Board
    if (
      checkTarget === 'faq-board' || 
      checkTarget === 'faq' || 
      checkTarget === 'faqs' || 
      subTarget === 'faq-board' ||
      checkLabel.includes('자주') ||
      checkLabel.includes('faq') ||
      (actionType === 'board' && (checkTarget.includes('faq') || checkLabel.includes('자주') || checkLabel.includes('faq')))
    ) {
      setActivePage('faq-board');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 3. Quote Board
    if (
      checkTarget === 'quote-board' || 
      checkTarget === 'quote-board-write' || 
      actionType === 'quote' ||
      checkLabel.includes('대량') ||
      checkLabel.includes('견적')
    ) {
      setActivePage(checkTarget === 'quote-board-write' ? 'quote-board-write' : 'quote-board');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 4. Sample Board
    if (
      checkTarget === 'sample-board' || 
      checkTarget === 'sample-board-write' || 
      actionType === 'sample' ||
      checkLabel.includes('샘플')
    ) {
      setActivePage(checkTarget === 'sample-board-write' ? 'sample-board-write' : 'sample-board');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 5. Posts & Recipes
    if (checkTarget === 'recipe-board' || checkTarget === 'event-board' || checkTarget === 'posts' || checkLabel.includes('레시피')) {
      setActivePage('posts');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 6. Company About Page & Sub-tabs Routing
    if (
      checkTarget === 'about' || 
      checkTarget === 'company-about' || 
      checkTarget.startsWith('about-') ||
      checkLabel.includes('회사소개') ||
      checkLabel.includes('인사말') ||
      checkLabel.includes('생산') ||
      checkLabel.includes('인허가') ||
      checkLabel.includes('오시는') ||
      subTarget === 'intro' ||
      subTarget === 'system' ||
      subTarget === 'permits' ||
      subTarget === 'location'
    ) {
      let selectedTab: 'intro' | 'system' | 'permits' | 'location' = 'intro';
      if (subTarget && ['intro', 'system', 'permits', 'location'].includes(subTarget)) {
        selectedTab = subTarget as any;
      } else if (checkTarget.startsWith('about-')) {
        const t = checkTarget.replace('about-', '');
        if (['intro', 'system', 'permits', 'location'].includes(t)) {
          selectedTab = t as any;
        }
      } else if (checkLabel.includes('생산') || checkLabel.includes('물류')) {
        selectedTab = 'system';
      } else if (checkLabel.includes('인허가') || checkLabel.includes('인증')) {
        selectedTab = 'permits';
      } else if (checkLabel.includes('오시는') || checkLabel.includes('위치')) {
        selectedTab = 'location';
      }

      setCompanyAboutTab(selectedTab);
      setActivePage('about-' + selectedTab);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 7. Individual Product Detail Page Routing
    if (
      checkTarget === 'product-detail' ||
      checkTarget.startsWith('product:') ||
      (checkTarget === 'products' && subTarget && subTarget !== 'all') ||
      subTarget?.startsWith('prod-') ||
      checkLabel.includes('명품 보쌈무김치') ||
      checkLabel.includes('보쌈김칫속') ||
      checkLabel.includes('보쌈겉절이') ||
      checkLabel.includes('대용량') ||
      checkLabel.includes('소포장') ||
      checkLabel.includes('밀키트')
    ) {
      let targetProdId = '';
      if (checkTarget.startsWith('product:')) {
        targetProdId = target!.replace(/^product:/i, '');
      } else if (subTarget && subTarget.startsWith('prod-')) {
        targetProdId = subTarget;
      } else if (checkLabel.includes('명품 보쌈무김치') || subTarget === 'bossam') {
        targetProdId = 'prod-1';
      } else if (checkLabel.includes('보쌈김칫속') || checkLabel.includes('보쌈겉절이') || subTarget === 'seasoning') {
        targetProdId = 'prod-2';
      } else if (checkLabel.includes('대용량') || subTarget === 'bulk') {
        targetProdId = 'prod-4';
      } else if (checkLabel.includes('소포장') || checkLabel.includes('밀키트') || subTarget === 'pouch') {
        targetProdId = 'prod-5';
      } else if (subTarget && state.products.some(p => p.id === subTarget)) {
        targetProdId = subTarget;
      }

      if (targetProdId) {
        navigateToProductDetail(targetProdId);
        return;
      }
    }

    // 8. General Products Catalog Routing
    if (checkTarget === 'products' || checkLabel.includes('제품')) {
      setActivePage('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // 8. External URL
    if ((actionType === 'url' || actionType === 'external') && target) {
      if (target.startsWith('http')) {
        window.open(target, '_blank');
      } else {
        window.location.href = target;
      }
      return;
    }

    const finalTarget = target || fallbackTarget;
    if (finalTarget) {
      navigateTo('home', finalTarget);
    } else {
      navigateTo('home');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-[#EEEAE6] shadow-2xs">
      {/* Top Thin Information Bar */}
      <div className="bg-[#2A2020] text-[#D8CDC9] text-[11px] py-2 px-4 sm:px-8 border-b border-[#3D2E2E]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-bold text-white tracking-wide text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              우리 가족이 먹을 수 있는 안전한 푸드를 제공하는 푸드홈 입니다.
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href={`tel:${state.content.phone}`}
              className="inline-flex items-center gap-1 font-bold text-white hover:text-[#E8B4B8] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#B64346]" />
              <span>고객상담: {state.content.phone}</span>
            </a>
            <span className="text-[#554343] hidden sm:inline">|</span>
            <span className="hidden sm:inline text-[#C0B2AE]">
              <Clock className="w-3 h-3 inline mr-1 text-[#872D35]" />
              {state.content.csHours}
            </span>
            <span className="text-[#554343] hidden lg:inline">|</span>
            <a 
              href={state.social.smartStoreUrl || 'https://smartstore.naver.com/foodhome/products/4266908131'}
              target="_blank" 
              rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1 text-[#E8B4B8] hover:text-white font-bold"
            >
              <Store className="w-3 h-3" />
              <span>공식 스마트스토어</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar (PC Height: 78px) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-[78px] flex items-center justify-between">
        
        {/* Left: Foodhome Logo */}
        <a 
          href="#"
          onClick={(e) => { e.preventDefault(); navigateTo('home'); }}
          className="cursor-pointer group py-2"
        >
          <FoodhomeLogo variant="dark" height={44} />
        </a>

        {/* Center: Horizontal Menus with Dropdown */}
        <nav className="hidden lg:flex items-center gap-8 h-full">
          {navMenus.map((item) => {
            const hasSubmenus = item.submenus && item.submenus.length > 0;
            return (
              <div 
                key={item.id}
                className="relative h-full flex items-center group cursor-pointer"
                onMouseEnter={() => setActiveDropdown(item.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => handleMenuAction(item.actionType, item.target, undefined, item.id, item.subTarget, item.name)}
                  className="text-sm font-bold text-[#332525] group-hover:text-[#872D35] flex items-center gap-1 transition-colors py-2"
                >
                  <span>{item.name}</span>
                  {hasSubmenus && (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#872D35] transition-transform group-hover:rotate-180" />
                  )}
                </button>

                {/* Hover Dropdown Submenu */}
                {hasSubmenus && activeDropdown === item.id && (
                  <div className="absolute top-[70px] left-1/2 -translate-x-1/2 w-48 bg-white rounded-xl shadow-xl border border-[#EEEAE6] py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    {item.submenus.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleMenuAction(sub.actionType, sub.target, undefined, item.id, sub.subTarget, sub.label)}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#554343] hover:text-[#872D35] hover:bg-[#FAF8F5] transition-colors flex items-center justify-between group/sub"
                      >
                        <span>{sub.label}</span>
                        <span className="text-[10px] text-slate-300 group-hover/sub:text-[#872D35] font-sans">›</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Primary CTA: Free Sample Request */}
          <button
            onClick={() => {
              setActivePage('sample-board-write');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-white rounded-xl shadow-sm hover:opacity-95 hover:shadow-md transition-all cursor-pointer"
            style={{ backgroundColor: state.theme.primaryColor || '#872D35' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>무료 샘플 1kg 신청</span>
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#332525] hover:bg-[#FAF8F5] lg:hidden cursor-pointer"
            aria-label="메뉴 열기"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#EEEAE6] bg-white px-5 py-4 space-y-4 shadow-xl">
          {navMenus.map((item) => (
            <div key={item.id} className="border-b border-[#FAF8F5] pb-2">
              <button
                onClick={() => handleMenuAction(item.actionType, item.target, undefined, item.id, item.subTarget, item.name)}
                className="text-xs font-black text-[#872D35] uppercase tracking-wider block mb-1 hover:underline text-left cursor-pointer"
              >
                {item.name}
              </button>
              {item.submenus && item.submenus.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5 pl-2">
                  {item.submenus.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleMenuAction(sub.actionType, sub.target, undefined, item.id, sub.subTarget, sub.label)}
                      className="text-left py-1 text-xs text-[#554343] hover:text-[#872D35] font-medium cursor-pointer"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setActivePage('sample-board-write');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-2.5 rounded-lg text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              style={{ backgroundColor: state.theme.primaryColor || '#872D35' }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>사업자 무료 샘플 1kg 신청</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setActivePage('quote-board-write');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full py-2.5 rounded-lg border border-[#EEEAE6] bg-[#FAF8F5] text-[#332525] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>1:1 대량 납품 및 견적 상담</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
