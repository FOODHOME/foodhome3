import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  ProductItem, 
  CustomSectionItem, 
  MainSectionConfig, 
  ProductFeatureCard, 
  SiteContent 
} from '../../../types';
import { DeviceMode, SelectedElement } from './types';
import { VisualPageTree } from './VisualPageTree';
import { VisualInspectorPanel } from './VisualInspectorPanel';
import { SectionAddModal } from './SectionAddModal';
import { getDefaultProductSections, getDefaultPageSections } from '../../../data/defaultPageSections';

// Pages to render in canvas
import { Header } from '../../Header';
import { Footer } from '../../Footer';
import { HeroSection } from '../../HeroSection';
import { ProductSliderSection } from '../../ProductSliderSection';
import { RealtimeSampleStatusSection } from '../../RealtimeSampleStatusSection';
import { ActionBannersSection } from '../../ActionBannersSection';
import { ProductCategoriesSection } from '../../ProductCategoriesSection';
import { ProductSection } from '../../ProductSection';
import { StorySection } from '../../StorySection';
import { ManufacturingProcess } from '../../ManufacturingProcess';
import { PartnersAndReviews } from '../../PartnersAndReviews';
import { BlogNoticeSection } from '../../BlogNoticeSection';
import { SampleInquirySection } from '../../SampleInquirySection';
import { CompanyAboutPage } from '../../CompanyAboutPage';
import { ProductsPage } from '../../ProductsPage';
import { ProductDetailPage } from '../../ProductDetailPage';
import { SampleBoardPage } from '../../SampleBoardPage';
import { QuoteBoardPage } from '../../QuoteBoardPage';
import { NoticeBoardPage } from '../../NoticeBoardPage';
import { FaqBoardPage } from '../../FaqBoardPage';

import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  RotateCcw, 
  RotateCw, 
  Save, 
  Upload, 
  Check, 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown, 
  Sliders, 
  Layout, 
  Layers, 
  Sparkles, 
  ArrowLeft, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Send,
  Building2,
  CreditCard
} from 'lucide-react';

interface VisualEditorProps {
  onClose: () => void;
  onSwitchToClassic: () => void;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({
  onClose,
  onSwitchToClassic
}) => {
  const { 
    state, 
    activePage, 
    setActivePage, 
    selectedProductId, 
    setSelectedProductId,
    updateContent,
    updateProduct,
    updatePageSections,
    updateMainSections,
    supabaseConfig,
    isSupabaseAdminAuthed,
    isPublishingToSupabase,
    publishPublicContentsToSupabase,
    hasUnpublishedChanges: contextUnpublished,
    setHasUnpublishedChanges: setContextUnpublished,
    showToast 
  } = useApp();

  // 1. Device Preview Mode
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('pc');

  // 2. Selected Editable Element
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);

  // 3. Hovered Block Identifier
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);

  // 4. Section Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 5. Staging / Draft Tracking
  const [hasLocalUnpublished, setHasLocalUnpublished] = useState(false);
  const hasUnpublishedChanges = hasLocalUnpublished || contextUnpublished;
  const setHasUnpublishedChanges = (dirty: boolean) => {
    setHasLocalUnpublished(dirty);
    setContextUnpublished(dirty);
  };
  const [publishError, setPublishError] = useState<string | null>(null);
  const [lastPublishedTime, setLastPublishedTime] = useState<string>(() => {
    return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  });

  // 6. Undo / Redo History Stack
  const [history, setHistory] = useState<any[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  // Active product item
  const activeProduct = state.products.find(p => p.id === selectedProductId) || state.products[0];

  // Active page sections (if page has dynamic custom sections)
  const currentPageKey = activePage.startsWith('about') 
    ? activePage 
    : (activePage === 'product-detail' ? `prod-${selectedProductId}` : activePage);

  const activePageSections = React.useMemo(() => {
    if (activePage === 'product-detail' && activeProduct) {
      return activeProduct.customSections && activeProduct.customSections.length > 0
        ? activeProduct.customSections
        : getDefaultProductSections(activeProduct);
    }
    const saved = state.content.pageSections?.[currentPageKey];
    if (saved && saved.length > 0) return saved;
    return getDefaultPageSections(currentPageKey, state.content || {});
  }, [activePage, activeProduct, currentPageKey, state.content.pageSections]);

  // Main page sections list
  const mainSectionsList = React.useMemo(() => {
    if (state.content.mainSections && state.content.mainSections.length > 0) {
      return [...state.content.mainSections].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return [
      { id: 'hero', name: '메인 비주얼 히어로 슬라이더', visible: true, order: 1 },
      { id: 'productSlider', name: '대표 제품 캐러셀 슬라이더', visible: true, order: 2 },
      { id: 'sampleRealtimeStatus', name: '실시간 샘플 발송 현황', visible: true, order: 3 },
      { id: 'actionBanners', name: '외식업 대표 맞춤 바로가기 배너', visible: true, order: 4 },
      { id: 'productCategories', name: '제품 카테고리 갤러리', visible: true, order: 5 },
      { id: 'products', name: '전체 제품 라인업 쇼케이스', visible: true, order: 6 },
      { id: 'features', name: '푸드홈 차별화 브랜드 스토리', visible: true, order: 7 },
      { id: 'process', name: 'HACCP 스마트 제조공정', visible: true, order: 8 },
      { id: 'reviews', name: '외식업 파트너사 리뷰 & 납품처', visible: true, order: 9 },
      { id: 'posts', name: '공지사항 & 레시피 블로그', visible: true, order: 10 },
      { id: 'inquiry', name: '하단 무료 샘플 & 견적 신청', visible: true, order: 11 }
    ];
  }, [state.content.mainSections]);

  // Selection handlers
  const handleSelectTarget = (type: any, id: string, title: string, data?: any) => {
    setSelectedElement({
      type,
      pageId: activePage,
      targetId: id,
      title,
      data
    });
  };

  // Section Action Handlers (Edit, Clone, Hide, Delete, Move Up, Move Down)
  const handleSectionAction = (
    action: 'edit' | 'clone' | 'toggle' | 'delete' | 'move_up' | 'move_down',
    sectionId: string
  ) => {
    setHasUnpublishedChanges(true);

    if (activePage === 'home') {
      // Main section config actions
      const curList = [...mainSectionsList];
      const sIdx = curList.findIndex(s => s.id === sectionId);
      if (sIdx === -1) return;

      if (action === 'toggle') {
        curList[sIdx] = { ...curList[sIdx], visible: !curList[sIdx].visible };
        updateMainSections(curList);
        showToast(`'${curList[sIdx].name}' 표시 상태가 변경되었습니다.`);
      } else if (action === 'move_up' && sIdx > 0) {
        const [moved] = curList.splice(sIdx, 1);
        curList.splice(sIdx - 1, 0, moved);
        const reordered = curList.map((s, i) => ({ ...s, order: i + 1 }));
        updateMainSections(reordered);
      } else if (action === 'move_down' && sIdx < curList.length - 1) {
        const [moved] = curList.splice(sIdx, 1);
        curList.splice(sIdx + 1, 0, moved);
        const reordered = curList.map((s, i) => ({ ...s, order: i + 1 }));
        updateMainSections(reordered);
      }
      return;
    }

    // Dynamic custom sections (e.g. product detail customSections or about subpages)
    const list = [...activePageSections];
    const sIdx = list.findIndex(s => s.id === sectionId);
    if (sIdx === -1) return;

    if (action === 'edit') {
      handleSelectTarget('custom_section', sectionId, list[sIdx].title || '섹션 블록');
    } else if (action === 'clone') {
      const cloned = { ...list[sIdx], id: `sec-${Date.now()}`, title: `${list[sIdx].title || '섹션'} (복제)` };
      list.splice(sIdx + 1, 0, cloned);
      const reordered = list.map((s, i) => ({ ...s, order: i + 1 }));
      saveUpdatedSections(reordered);
      showToast('섹션이 복제되었습니다.');
    } else if (action === 'toggle') {
      list[sIdx] = { ...list[sIdx], visible: list[sIdx].visible === false ? true : false };
      saveUpdatedSections(list);
      showToast(`섹션이 ${list[sIdx].visible ? '표시' : '숨김'} 처리되었습니다.`);
    } else if (action === 'delete') {
      if (confirm('이 섹션 블록을 정말 삭제하시겠습니까?')) {
        const next = list.filter((_, i) => i !== sIdx).map((s, i) => ({ ...s, order: i + 1 }));
        saveUpdatedSections(next);
        if (selectedElement?.targetId === sectionId) {
          setSelectedElement(null);
        }
        showToast('섹션이 삭제되었습니다.');
      }
    } else if (action === 'move_up' && sIdx > 0) {
      const [moved] = list.splice(sIdx, 1);
      list.splice(sIdx - 1, 0, moved);
      const reordered = list.map((s, i) => ({ ...s, order: i + 1 }));
      saveUpdatedSections(reordered);
    } else if (action === 'move_down' && sIdx < list.length - 1) {
      const [moved] = list.splice(sIdx, 1);
      list.splice(sIdx + 1, 0, moved);
      const reordered = list.map((s, i) => ({ ...s, order: i + 1 }));
      saveUpdatedSections(reordered);
    }
  };

  const saveUpdatedSections = (updated: CustomSectionItem[]) => {
    if (activePage === 'product-detail' && activeProduct) {
      updateProduct(activeProduct.id, {
        customSections: updated
      });
    } else {
      updatePageSections(currentPageKey, updated);
    }
  };

  // Add Section
  const handleAddNewSection = (newSection: CustomSectionItem) => {
    setHasUnpublishedChanges(true);
    const next = [...activePageSections, newSection].map((s, i) => ({ ...s, order: i + 1 }));
    saveUpdatedSections(next);
    handleSelectTarget('custom_section', newSection.id, newSection.title || '새 섹션');
    showToast('새로운 섹션이 추가되었습니다.');
  };

  // Publish changes to live site (and Supabase site_contents if configured)
  const handlePublish = async () => {
    setPublishError(null);
    const isSupabaseConfigured = Boolean(supabaseConfig.url && supabaseConfig.anonKey);

    if (isSupabaseConfigured) {
      const res = await publishPublicContentsToSupabase();
      if (!res.success) {
        const errMsg = res.error || 'Supabase 게시에 실패했습니다.';
        setPublishError(errMsg);
        return;
      }
      setHasUnpublishedChanges(false);
      const nowStr = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      setLastPublishedTime(nowStr);
      showToast(`Supabase DB 및 실제 홈페이지에 게시 완료되었습니다! (${nowStr})`);
      return;
    }

    setHasUnpublishedChanges(false);
    const nowStr = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    setLastPublishedTime(nowStr);
    showToast(`로컬 브라우저에 반영되었습니다. (Supabase 미설정: ${nowStr})`);
  };

  // Safe Close with Confirmation if unpublished
  const handleSafeClose = () => {
    if (hasUnpublishedChanges) {
      if (!confirm('아직 게시되지 않은 변경사항이 있습니다. 저장/게시하지 않고 나가시겠습니까?')) {
        return;
      }
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#1A1515] flex flex-col overflow-hidden text-stone-900 select-none animate-in fade-in duration-150"
      data-admin-area="true"
    >
      
      {/* 1. TOP GLOBAL TOOLBAR */}
      <header className="h-14 bg-[#2A2020] text-white px-4 sm:px-6 flex items-center justify-between shrink-0 border-b border-[#3D2E2E] shadow-md z-30">
        
        {/* Left: Brand & Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#872D35] flex items-center justify-center font-black text-sm text-white shadow-xs">
            푸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xs sm:text-sm tracking-tight text-white">
                FOODHOME 시각적 비주얼 에디터
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                실시간 화면 편집
              </span>
            </div>
            <div className="text-[11px] text-stone-400 flex items-center gap-1">
              <span>현재 위치:</span>
              <strong className="text-stone-200">
                {activePage === 'home' && '메인 홈페이지'}
                {activePage === 'about-intro' && '회사소개 > CEO 인사말'}
                {activePage === 'about-system' && '회사소개 > 제조가공센터 & 설비'}
                {activePage === 'about-permits' && '회사소개 > 식품안전 인증서'}
                {activePage === 'about-location' && '회사소개 > 오시는 길'}
                {activePage === 'products' && '제품소개 > 전체 카탈로그'}
                {activePage === 'product-detail' && `제품소개 > ${activeProduct?.name || '제품 상세'}`}
                {activePage === 'sample-board' && '고객센터 > 무료 샘플 신청'}
                {activePage === 'quote-board' && '고객센터 > 대량 견적 문의'}
                {activePage === 'notice-board' && '고객센터 > 공지사항'}
                {activePage === 'faq-board' && '고객센터 > 자주 묻는 질문'}
              </strong>
            </div>
          </div>
        </div>

        {/* Center: Device Viewport Switcher */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-white/10">
          <button
            onClick={() => setDeviceMode('pc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              deviceMode === 'pc' ? 'bg-[#872D35] text-white shadow-xs' : 'text-stone-400 hover:text-white'
            }`}
            title="PC 화면 모드 (100% 와이드)"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>PC 화면</span>
          </button>
          <button
            onClick={() => setDeviceMode('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              deviceMode === 'tablet' ? 'bg-[#872D35] text-white shadow-xs' : 'text-stone-400 hover:text-white'
            }`}
            title="태블릿 화면 모드 (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>태블릿 (768px)</span>
          </button>
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              deviceMode === 'mobile' ? 'bg-[#872D35] text-white shadow-xs' : 'text-stone-400 hover:text-white'
            }`}
            title="모바일 화면 모드 (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>모바일 (375px)</span>
          </button>
        </div>

        {/* Right: Publish, Classic Toggle & Close */}
        <div className="flex items-center gap-2.5">
          
          {/* Status Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-stone-400 mr-2">
            {hasUnpublishedChanges ? (
              <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                게시 대기 변경사항 있음
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-3.5 h-3.5" />
                모든 변경사항 게시 완료 ({lastPublishedTime})
              </span>
            )}
          </div>

          {/* Switch to Classic Form Dashboard */}
          <button
            onClick={onSwitchToClassic}
            className="px-3 py-1.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="기존 폼 기반 관리자로 전환"
          >
            <Sliders className="w-3.5 h-3.5 text-stone-300" />
            <span className="hidden sm:inline">기존 폼 관리자</span>
          </button>

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            disabled={isPublishingToSupabase}
            className={`px-4 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-60 ${
              hasUnpublishedChanges
                ? 'bg-[#872D35] hover:bg-[#A3343E] text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>
              {isPublishingToSupabase
                ? 'Supabase 게시 중...'
                : supabaseConfig.url && supabaseConfig.anonKey
                ? 'Supabase에 게시하기'
                : '실제 홈페이지 게시하기'}
            </span>
          </button>

          {/* Close Editor */}
          <button
            onClick={handleSafeClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
            title="편집기 닫기"
          >
            <X className="w-5 h-5" />
          </button>

        </div>

      </header>

      {publishError && (
        <div className="bg-red-950 text-red-100 px-4 py-2 text-xs flex items-center justify-between border-b border-red-800 shrink-0">
          <span className="font-bold">
            Supabase 게시 오류: {publishError}
            {!isSupabaseAdminAuthed && ' (관리자 로그인 모달에서 Supabase 이메일 계정으로 로그인해 주세요.)'}
          </span>
          <button
            onClick={() => setPublishError(null)}
            className="px-2 py-0.5 rounded bg-red-900 hover:bg-red-800 text-white text-[11px] font-bold cursor-pointer"
          >
            닫기
          </button>
        </div>
      )}

      {/* 2. THREE-PANEL WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* LEFT PANEL: PAGE TREE */}
        <VisualPageTree
          activePage={activePage}
          onSelectPage={(page, prodId) => {
            setActivePage(page);
            if (prodId) {
              setSelectedProductId(prodId);
            }
            setSelectedElement(null);
          }}
          selectedProductId={selectedProductId}
          products={state.products}
          mainSections={mainSectionsList}
          onSelectTarget={(type, id, title) => handleSelectTarget(type, id, title)}
        />

        {/* MIDDLE PANEL: LIVE WEBSITE PREVIEW CANVAS */}
        <div className="flex-1 bg-stone-300 overflow-y-auto flex flex-col items-center p-3 sm:p-6 relative">

          {/* Device Frame Wrapper */}
          <div 
            className={`transition-all duration-300 bg-white shadow-2xl relative flex flex-col ${
              deviceMode === 'pc' 
                ? 'w-full max-w-7xl rounded-2xl min-h-full border border-stone-300' 
                : deviceMode === 'tablet' 
                ? 'w-[768px] min-h-[900px] rounded-3xl border-8 border-stone-800 my-4' 
                : 'w-[375px] min-h-[750px] rounded-[40px] border-[10px] border-stone-900 my-4'
            }`}
          >
            {/* Mobile Top Speaker/Cam Bezel */}
            {deviceMode === 'mobile' && (
              <div className="h-6 bg-stone-900 rounded-t-[30px] flex items-center justify-center shrink-0">
                <div className="w-16 h-1.5 rounded-full bg-stone-700" />
              </div>
            )}

            {/* In-Canvas Notification Bar */}
            <div className="bg-stone-900 text-stone-200 px-4 py-2 text-xs flex items-center justify-between border-b border-stone-800">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-extrabold text-[11px] text-white">시각적 인터랙티브 편집 모드</span>
                <span className="text-stone-400 text-[10px] hidden sm:inline">| 화면의 요소를 마우스로 직접 클릭하면 우측에서 즉시 수정됩니다</span>
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-[#872D35] hover:bg-[#6D242B] text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>+ 새 섹션 추가</span>
              </button>
            </div>

            {/* Actual Live Website Component Container */}
            <div className="flex-1 relative">

              {/* Editable Target Listeners Wrapper */}
              <div 
                className="relative"
                onClick={(e) => {
                  const target = e.target as HTMLElement | null;
                  if (!target) return;

                  // 1. Feature Cards Clicked
                  const featureCardArea = target.closest('[data-editable-id="product_feature_cards"]');
                  if (featureCardArea) {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectTarget('product_feature_cards', 'product-feature-cards', '제품 특징 카드 (특허/국산/HACCP/배송)');
                    return;
                  }

                  // 2. Product Image Clicked
                  const imgElem = target.closest('img');
                  if (imgElem && activePage === 'product-detail') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectTarget('product_image', activeProduct.id, `${activeProduct.name} 대표 이미지`);
                    return;
                  }

                  // 3. Product Title Clicked
                  const heading = target.closest('h1, h2, h3');
                  if (heading && activePage === 'product-detail') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectTarget('product_info', activeProduct.id, `${activeProduct.name} 제품 정보`);
                    return;
                  }
                }}
              >
                {/* Global Header */}
                <div 
                  className="relative group/hdr cursor-pointer"
                  onClick={() => handleSelectTarget('header_footer', 'header', '상단 헤더 설정')}
                >
                  <Header />
                  <div className="absolute inset-0 border-2 border-transparent group-hover/hdr:border-[#872D35] transition-all pointer-events-none flex items-start justify-end p-2">
                    <span className="px-2 py-0.5 rounded bg-[#872D35] text-white text-[10px] font-bold opacity-0 group-hover/hdr:opacity-100 transition-opacity shadow-xs">
                      클릭: 헤더 로고 크기 수정
                    </span>
                  </div>
                </div>

                {/* Main Content by Active Page */}
                <main className="min-h-[500px]">
                  {activePage === 'home' && (
                    <div className="space-y-4">
                      {mainSectionsList.map((sec) => (
                        <div 
                          key={sec.id}
                          className={`relative group/msec border-2 transition-all ${
                            sec.visible === false ? 'opacity-40 bg-stone-100' : ''
                          } ${
                            selectedElement?.targetId === sec.id 
                              ? 'border-[#872D35] ring-2 ring-[#872D35]/30' 
                              : 'border-transparent hover:border-dashed hover:border-[#872D35]'
                          }`}
                        >
                          {/* Floating Section Toolbar */}
                          <div className="absolute top-3 right-3 z-20 opacity-0 group-hover/msec:opacity-100 transition-opacity flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-xl shadow-lg border border-stone-200">
                            <span className="text-[10px] font-bold px-2 py-0.5 text-stone-700">
                              {sec.name}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSectionAction('move_up', sec.id);
                              }}
                              className="p-1 rounded hover:bg-stone-100 text-stone-600 cursor-pointer"
                              title="위로 이동"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSectionAction('move_down', sec.id);
                              }}
                              className="p-1 rounded hover:bg-stone-100 text-stone-600 cursor-pointer"
                              title="아래로 이동"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSectionAction('toggle', sec.id);
                              }}
                              className="p-1 rounded hover:bg-stone-100 text-stone-600 cursor-pointer"
                              title={sec.visible ? '숨기기' : '다시 표시'}
                            >
                              {sec.visible ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-amber-600" />}
                            </button>
                          </div>

                          {/* Render Section */}
                          {sec.id === 'hero' && <HeroSection />}
                          {sec.id === 'productSlider' && <ProductSliderSection />}
                          {sec.id === 'sampleRealtimeStatus' && <RealtimeSampleStatusSection />}
                          {sec.id === 'actionBanners' && <ActionBannersSection />}
                          {sec.id === 'productCategories' && <ProductCategoriesSection />}
                          {sec.id === 'products' && <ProductSection />}
                          {sec.id === 'features' && <StorySection />}
                          {sec.id === 'process' && <ManufacturingProcess />}
                          {sec.id === 'reviews' && <PartnersAndReviews />}
                          {sec.id === 'posts' && <BlogNoticeSection />}
                          {sec.id === 'inquiry' && <SampleInquirySection />}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* About Subpages */}
                  {(activePage === 'about' || activePage === 'about-intro') && (
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleSelectTarget('ceo_greeting', 'ceo', 'CEO 인사말 및 대표자 정보')}
                    >
                      <CompanyAboutPage targetTab="intro" />
                    </div>
                  )}
                  {activePage === 'about-system' && <CompanyAboutPage targetTab="system" />}
                  {activePage === 'about-permits' && <CompanyAboutPage targetTab="permits" />}
                  {activePage === 'about-location' && <CompanyAboutPage targetTab="location" />}

                  {/* Products Catalog */}
                  {activePage === 'products' && <ProductsPage />}

                  {/* Product Detail Page */}
                  {(activePage === 'product-detail' || activePage.startsWith('product:')) && (
                    <div className="relative">
                      
                      {/* Floating Quick Edit Bar for Product */}
                      <div className="sticky top-0 z-20 bg-stone-900 text-white px-4 py-2 text-xs flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[#FAF8F5]">
                            {activeProduct?.name}
                          </span>
                          <span className="text-stone-400 text-[11px]">개별 독립 커스텀 편집 중</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSelectTarget('product_feature_cards', 'pfc', '제품 특징 카드')}
                            className="px-2 py-1 rounded bg-[#872D35] hover:bg-[#6D242B] font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>특징 카드 관리</span>
                          </button>
                          <button
                            onClick={() => handleSelectTarget('product_info', activeProduct.id, '제품 정보')}
                            className="px-2 py-1 rounded bg-stone-700 hover:bg-stone-600 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>기본 정보 수정</span>
                          </button>
                        </div>
                      </div>

                      <ProductDetailPage />

                      {/* Custom Section Floating Manager Bar above dynamic sections */}
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                        <div className="p-4 rounded-2xl bg-stone-100 border border-dashed border-[#872D35] flex items-center justify-between">
                          <div>
                            <h4 className="font-extrabold text-xs text-stone-800">
                              이 제품만의 독립적인 추가 섹션 ({activePageSections.length}개)
                            </h4>
                            <p className="text-[11px] text-stone-500">
                              이 제품에만 표시되는 상세 블록을 자유롭게 추가하거나 순서를 바꿀 수 있습니다.
                            </p>
                          </div>
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ 새 섹션 추가</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Boards */}
                  {activePage === 'sample-board' && <SampleBoardPage initialViewMode="list" />}
                  {activePage === 'quote-board' && <QuoteBoardPage initialViewMode="list" />}
                  {activePage === 'notice-board' && <NoticeBoardPage />}
                  {activePage === 'faq-board' && <FaqBoardPage />}

                </main>

                {/* Global Footer */}
                <div 
                  className="relative group/ftr cursor-pointer"
                  onClick={() => handleSelectTarget('header_footer', 'footer', '하단 푸터 정보 수정')}
                >
                  <Footer />
                  <div className="absolute inset-0 border-2 border-transparent group-hover/ftr:border-[#872D35] transition-all pointer-events-none flex items-center justify-center">
                    <span className="px-3 py-1 rounded-xl bg-[#872D35] text-white text-xs font-bold opacity-0 group-hover/ftr:opacity-100 transition-opacity shadow-md">
                      클릭: 푸터 회사 정보 / 로고 크기 수정
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT PANEL: CONTEXTUAL INSPECTOR */}
        <VisualInspectorPanel
          selectedElement={selectedElement}
          onClearSelection={() => setSelectedElement(null)}
          product={activeProduct}
          onUpdateProduct={(prodId, updates) => {
            setHasUnpublishedChanges(true);
            updateProduct(prodId, updates);
          }}
          section={activePageSections.find(s => s.id === selectedElement?.targetId)}
          onUpdateSection={(secId, updates) => {
            setHasUnpublishedChanges(true);
            const next = activePageSections.map(s => s.id === secId ? { ...s, ...updates } : s);
            saveUpdatedSections(next);
          }}
          content={state.content}
          onUpdateContent={(updates) => {
            setHasUnpublishedChanges(true);
            updateContent(updates);
          }}
        />

      </div>

      {/* 3. MODULAR SECTION ADD MODAL */}
      <SectionAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSection={handleAddNewSection}
        currentCount={activePageSections.length}
      />

    </div>
  );
};
