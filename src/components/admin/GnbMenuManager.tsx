import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NavMenuItem, NavSubmenuItem } from '../../types';
import { initialData } from '../../data/initialData';
import { 
  Menu, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  ListTree, 
  Eye, 
  EyeOff, 
  Sparkles, 
  SlidersHorizontal,
  ExternalLink,
  Layers,
  FileText,
  MapPin,
  Check
} from 'lucide-react';

// Predefined page and subTarget options
export const AVAILABLE_PAGES = [
  { id: 'about', label: '회사소개 (Company About)' },
  { id: 'about-intro', label: '회사소개 & CEO 인사말 (독립 페이지)' },
  { id: 'about-system', label: '생산 & 물류시스템 (독립 페이지)' },
  { id: 'about-permits', label: '인허가사항 (독립 페이지)' },
  { id: 'about-location', label: '오시는 길 (독립 페이지)' },
  { id: 'products', label: '제품소개 (전체 제품 목록)' },
  { id: 'product-detail', label: '제품별 상세페이지 (개별 제품)' },
  { id: 'sample-board', label: '사업자 무료 샘플신청 게시판' },
  { id: 'sample-board-write', label: '샘플신청 작성 페이지' },
  { id: 'quote-board', label: '1:1 대량 납품 견적 상담 게시판' },
  { id: 'quote-board-write', label: '대량 납품 견적 작성 페이지' },
  { id: 'notice-board', label: '공지사항 게시판' },
  { id: 'faq-board', label: '자주하는 질문 (FAQ) 게시판' },
  { id: 'wholesale-guide', label: '납품안내 (Wholesale Guide)' },
  { id: 'posts', label: '소식 & 레시피 (Posts/Recipes)' },
  { id: 'home', label: '메인 홈 (Main Home)' }
];

export const normalizeActionType = (type?: string): 'page' | 'board' | 'quote' | 'sample' | 'section' | 'external' => {
  if (!type) return 'page';
  if (type === 'scroll') return 'section';
  if (type === 'url') return 'external';
  if (type === 'wholesale') return 'page';
  if (['page', 'board', 'quote', 'sample', 'section', 'external'].includes(type)) {
    return type as any;
  }
  return 'page';
};

export const SUB_MENU_OPTIONS: Record<string, { id: string; label: string }[]> = {
  about: [
    { id: 'intro', label: '회사소개 & CEO 인사말' },
    { id: 'system', label: '생산 & 물류시스템' },
    { id: 'permits', label: '인허가사항' },
    { id: 'location', label: '오시는 길 (본사/공장 위치)' }
  ],
  products: [
    { id: 'all', label: '전체 제품 카탈로그 목록' },
    { id: 'prod-1', label: '명품 보쌈무김치 상세페이지' },
    { id: 'prod-2', label: '비법 보쌈겉절이 상세페이지' },
    { id: 'prod-4', label: '업소용 대용량 (10kg) 상세페이지' },
    { id: 'prod-5', label: '소포장 & 밀키트 (500g) 상세페이지' }
  ],
  'product-detail': [
    { id: 'prod-1', label: '명품 보쌈무김치 (업소용)' },
    { id: 'prod-2', label: '비법 보쌈겉절이 (보쌈김칫속)' },
    { id: 'prod-3', label: '남도식 꼬들 무말랭이 무김치' },
    { id: 'prod-4', label: '업소용 대용량 (10kg)' },
    { id: 'prod-5', label: '소포장 & 밀키트 (500g)' },
    { id: 'prod-6', label: '알타리 총각무김치 (업소용)' }
  ],
  'wholesale-guide': [
    { id: 'steps', label: 'B2B 대량공급 절차 안내' },
    { id: 'oem', label: '프랜차이즈 맞춤 OEM/PB' },
    { id: 'sample-pack', label: '사업자 1kg 무료 샘플팩' }
  ],
  home: [
    { id: 'hero-section', label: '메인 상단 비주얼 배너' },
    { id: 'product-slider-section', label: '대표 제품 슬라이더' },
    { id: 'realtime-status-section', label: '실시간 샘플 접수 현황' },
    { id: 'process-section', label: '안심 위생 제조 공정' },
    { id: 'reviews-section', label: '외식업 파트너 후기' },
    { id: 'footer-section', label: '고객센터 & 하단 안내' }
  ],
  posts: [
    { id: 'all', label: '전체 소식 & 레시피' },
    { id: 'recipe', label: '조리·활용 레시피' },
    { id: 'story', label: 'B2B 납품스토리' }
  ]
};

export const AVAILABLE_BOARDS = [
  { id: 'notice-board', label: '공지사항 게시판' },
  { id: 'faq-board', label: '자주하는 질문 (FAQ) 게시판' },
  { id: 'quote-board', label: '1:1 대량 납품 견적 상담' },
  { id: 'sample-board', label: '사업자 무료 샘플 신청' }
];

export const GnbMenuManager: React.FC = () => {
  const { state, updateNavMenus, showToast } = useApp();

  const [menus, setMenus] = useState<NavMenuItem[]>(() => {
    return state.content.navMenus && state.content.navMenus.length > 0
      ? state.content.navMenus
      : initialData.content.navMenus;
  });

  const [showAdvancedSectionInput, setShowAdvancedSectionInput] = useState(false);

  const getSubOptions = (targetPage: string) => {
    if (targetPage === 'product-detail' || targetPage === 'products') {
      const productItems = state.products.map(p => ({
        id: p.id,
        label: p.name + (targetPage === 'product-detail' ? ' (상세페이지)' : '')
      }));
      if (targetPage === 'products') {
        return [
          { id: 'all', label: '전체 제품 카탈로그 목록' },
          ...productItems
        ];
      }
      return productItems;
    }
    return SUB_MENU_OPTIONS[targetPage] || [];
  };

  useEffect(() => {
    if (state.content.navMenus && state.content.navMenus.length > 0) {
      setMenus(state.content.navMenus);
    }
  }, [state.content.navMenus]);

  const handleSave = () => {
    updateNavMenus(menus);
    showToast('상단 네비게이션 메뉴(GNB)가 성공적으로 저장되었습니다.');
  };

  const handleReset = () => {
    if (confirm('상단 메뉴를 푸드홈 표준 기본값으로 복원하시겠습니까?')) {
      const defaults = initialData.content.navMenus;
      setMenus(defaults);
      updateNavMenus(defaults);
      showToast('기본 메뉴로 복원되었습니다.');
    }
  };

  const handleAddTopMenu = () => {
    const newMenu: NavMenuItem = {
      id: 'menu-' + Date.now(),
      name: '새 메뉴',
      visible: true,
      actionType: 'page',
      target: 'about',
      subTarget: 'intro',
      submenus: []
    };
    setMenus([...menus, newMenu]);
  };

  const handleDeleteTopMenu = (id: string) => {
    if (menus.length <= 1) {
      showToast('최소 1개 이상의 상단 메뉴가 유지되어야 합니다.');
      return;
    }
    setMenus(menus.filter(m => m.id !== id));
  };

  const handleMoveTopMenu = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= menus.length) return;
    const newMenus = [...menus];
    const [moved] = newMenus.splice(index, 1);
    newMenus.splice(targetIdx, 0, moved);
    setMenus(newMenus);
  };

  const handleUpdateTopMenu = (id: string, updates: Partial<NavMenuItem>) => {
    setMenus(menus.map(m => {
      if (m.id !== id) return m;
      const updated = { ...m, ...updates };
      // When actionType changes, set sensible defaults and sanitize targets
      if (updates.actionType && updates.actionType !== m.actionType) {
        if (updates.actionType === 'page') {
          const isTargetValidPage = AVAILABLE_PAGES.some(p => p.id === updated.target);
          if (!isTargetValidPage) {
            updated.target = 'about';
          }
          const subOpts = getSubOptions(updated.target || 'about');
          updated.subTarget = subOpts.some(s => s.id === updated.subTarget) ? updated.subTarget : (subOpts[0]?.id || '');
        } else if (updates.actionType === 'board') {
          const isTargetValidBoard = AVAILABLE_BOARDS.some(b => b.id === updated.target);
          if (!isTargetValidBoard) {
            updated.target = 'notice-board';
          }
          updated.subTarget = undefined;
        } else if (updates.actionType === 'quote') {
          updated.target = 'quote-board';
          updated.subTarget = undefined;
        } else if (updates.actionType === 'sample') {
          updated.target = 'sample-board';
          updated.subTarget = undefined;
        } else if (updates.actionType === 'section' || updates.actionType === 'scroll') {
          updated.target = updated.target || 'product-slider-section';
        }
      }
      return updated;
    }));
  };

  // Submenu handlers
  const handleAddSubmenu = (menuId: string) => {
    const newSub: NavSubmenuItem = {
      id: 'sub-' + Date.now(),
      label: '세부 메뉴',
      actionType: 'page',
      target: 'about',
      subTarget: 'intro'
    };
    setMenus(menus.map(m => m.id === menuId ? {
      ...m,
      submenus: [...(m.submenus || []), newSub]
    } : m));
  };

  const handleDeleteSubmenu = (menuId: string, subId: string) => {
    setMenus(menus.map(m => m.id === menuId ? {
      ...m,
      submenus: (m.submenus || []).filter(s => s.id !== subId)
    } : m));
  };

  const handleMoveSubmenu = (menuId: string, subIdx: number, direction: 'up' | 'down') => {
    setMenus(menus.map(m => {
      if (m.id !== menuId) return m;
      const subList = [...(m.submenus || [])];
      const targetIdx = direction === 'up' ? subIdx - 1 : subIdx + 1;
      if (targetIdx < 0 || targetIdx >= subList.length) return m;
      const [moved] = subList.splice(subIdx, 1);
      subList.splice(targetIdx, 0, moved);
      return { ...m, submenus: subList };
    }));
  };

  const handleUpdateSubmenu = (menuId: string, subId: string, updates: Partial<NavSubmenuItem>) => {
    setMenus(menus.map(m => {
      if (m.id !== menuId) return m;
      return {
        ...m,
        submenus: (m.submenus || []).map(s => {
          if (s.id !== subId) return s;
          const updated = { ...s, ...updates };
          if (updates.actionType && updates.actionType !== s.actionType) {
            if (updates.actionType === 'page') {
              const isTargetValidPage = AVAILABLE_PAGES.some(p => p.id === updated.target);
              if (!isTargetValidPage) {
                updated.target = 'about';
              }
              const subOpts = getSubOptions(updated.target || 'about');
              updated.subTarget = subOpts.some(opt => opt.id === updated.subTarget) ? updated.subTarget : (subOpts[0]?.id || '');
            } else if (updates.actionType === 'board') {
              const isTargetValidBoard = AVAILABLE_BOARDS.some(b => b.id === updated.target);
              if (!isTargetValidBoard) {
                updated.target = 'notice-board';
              }
              updated.subTarget = undefined;
            } else if (updates.actionType === 'quote') {
              updated.target = 'quote-board';
              updated.subTarget = undefined;
            } else if (updates.actionType === 'sample') {
              updated.target = 'sample-board';
              updated.subTarget = undefined;
            } else if (updates.actionType === 'section' || updates.actionType === 'scroll') {
              updated.target = updated.target || 'product-slider-section';
            }
          }
          return updated;
        })
      };
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#872D35]/10 text-[#872D35]">
              <Menu className="w-5 h-5" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              상단 네비게이션 메뉴 (GNB) 드롭다운 설정
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              메뉴 {menus.length}개
            </span>
          </div>
          <p className="text-xs text-slate-500">
            코드 입력 없이 드롭다운 선택만으로 이동할 페이지(회사소개, 오시는 길 등) 및 게시판(공지사항, FAQ 등)을 손쉽게 연결합니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAdvancedSectionInput(!showAdvancedSectionInput)}
            className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              showAdvancedSectionInput 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="섹션 ID 직접 입력 기능 토글"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>고급설정 (직접입력)</span>
          </button>
          
          <button
            onClick={handleReset}
            className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="초기 기본 메뉴로 복원"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>기본값 복원</span>
          </button>

          <button
            onClick={handleAddTopMenu}
            className="px-3 py-2 rounded-lg border border-[#872D35] text-[#872D35] hover:bg-[#872D35]/5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 메뉴 추가</span>
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[#872D35] hover:bg-[#6E1D24] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>상단 메뉴 저장</span>
          </button>
        </div>
      </div>

      {/* Guide Note */}
      <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-xl text-xs text-blue-900 space-y-1">
        <p className="font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>페이지 이동 및 세부 메뉴 연결 안내</span>
        </p>
        <p className="text-[11px] text-blue-800 leading-relaxed">
          <strong>페이지 이동</strong> 선택 시 해당 페이지의 세부 탭(예: 회사소개 &gt; 오시는 길)을 지정하면 방문객이 메뉴를 클릭했을 때 첫 화면이 아닌 <strong>오시는 길</strong> 콘텐츠가 즉시 선택된 상태로 열립니다.
        </p>
      </div>

      {/* Menus List */}
      <div className="space-y-4">
        {menus.map((menu, mIdx) => (
          <div
            key={menu.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4 transition-all"
          >
            {/* Top Row: Order, Name, Action, Target, Visibility, Delete */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {/* Reorder Buttons */}
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMoveTopMenu(mIdx, 'up')}
                    disabled={mIdx === 0}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="위로 이동"
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleMoveTopMenu(mIdx, 'down')}
                    disabled={mIdx === menus.length - 1}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="아래로 이동"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>

                {/* Order Badge */}
                <span className="w-6 h-6 rounded-md bg-[#872D35]/10 text-[#872D35] font-black text-xs flex items-center justify-center">
                  {mIdx + 1}
                </span>

                {/* Menu Name Input */}
                <div className="w-40 sm:w-48">
                  <label className="text-[10px] font-bold text-slate-400 block mb-0.5">상단 메뉴 이름 *</label>
                  <input
                    type="text"
                    value={menu.name}
                    onChange={(e) => handleUpdateTopMenu(menu.id, { name: e.target.value })}
                    placeholder="메뉴명 (예: 회사소개)"
                    className="w-full px-3 py-1.5 text-xs font-bold text-slate-900 border border-slate-300 rounded-lg focus:border-[#872D35] focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Selection Controls */}
              {/* Action Selection Controls */}
              {(() => {
                const currentActionType = normalizeActionType(menu.actionType);
                const currentTarget = AVAILABLE_PAGES.some(p => p.id === menu.target) ? (menu.target || 'about') : 'about';
                const currentBoardTarget = AVAILABLE_BOARDS.some(b => b.id === menu.target) ? (menu.target || 'notice-board') : 'notice-board';

                return (
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1 lg:justify-end">
                    {/* Action Type Dropdown */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">클릭 시 동작</label>
                      <select
                        value={currentActionType}
                        onChange={(e) => handleUpdateTopMenu(menu.id, { actionType: e.target.value as any })}
                        className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-slate-50 font-bold text-slate-800"
                      >
                        <option value="page">1. 페이지 이동</option>
                        <option value="board">2. 게시판 이동</option>
                        <option value="quote">3. 대량 납품 견적 신청</option>
                        <option value="sample">4. 무료 샘플 신청</option>
                        <option value="section">5. 페이지 내 특정 섹션 이동</option>
                        <option value="external">6. 외부 링크 이동</option>
                      </select>
                    </div>

                    {/* If Page Selected */}
                    {currentActionType === 'page' && (
                      <>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-0.5">이동할 페이지</label>
                          <select
                            value={currentTarget}
                            onChange={(e) => {
                              const newTarget = e.target.value;
                              const subOpts = getSubOptions(newTarget);
                              handleUpdateTopMenu(menu.id, { target: newTarget, subTarget: subOpts[0]?.id || '' });
                            }}
                            className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-medium"
                          >
                            {AVAILABLE_PAGES.map(p => (
                              <option key={p.id} value={p.id}>{p.label}</option>
                            ))}
                          </select>
                        </div>

                        {getSubOptions(currentTarget).length > 0 && (
                          <div>
                            <label className="text-[10px] font-bold text-slate-400 block mb-0.5">이동할 세부 메뉴 / 제품</label>
                            <select
                              value={menu.subTarget || ''}
                              onChange={(e) => handleUpdateTopMenu(menu.id, { subTarget: e.target.value })}
                              className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white text-[#872D35] font-bold"
                            >
                              <option value="">(기본 첫 화면)</option>
                              {getSubOptions(currentTarget).map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </>
                    )}

                    {/* If Board Selected */}
                    {currentActionType === 'board' && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">이동할 게시판</label>
                        <select
                          value={currentBoardTarget}
                          onChange={(e) => handleUpdateTopMenu(menu.id, { target: e.target.value })}
                          className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white font-bold text-purple-700"
                        >
                          {AVAILABLE_BOARDS.map(b => (
                            <option key={b.id} value={b.id}>{b.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* If Quote Selected */}
                    {currentActionType === 'quote' && (
                      <div className="flex items-end">
                        <span className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          대량 납품 견적상담 이동
                        </span>
                      </div>
                    )}

                    {/* If Sample Selected */}
                    {currentActionType === 'sample' && (
                      <div className="flex items-end">
                        <span className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          무료 샘플 신청 이동
                        </span>
                      </div>
                    )}

                    {/* If Section Selected */}
                    {currentActionType === 'section' && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">이동할 섹션</label>
                        <select
                          value={menu.target || 'product-slider-section'}
                          onChange={(e) => handleUpdateTopMenu(menu.id, { target: e.target.value })}
                          className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                        >
                          {SUB_MENU_OPTIONS.home.map(s => (
                            <option key={s.id} value={s.id}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* If External Link Selected */}
                    {currentActionType === 'external' && (
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">외부 URL 주소</label>
                        <input
                          type="text"
                          value={menu.target || ''}
                          onChange={(e) => handleUpdateTopMenu(menu.id, { target: e.target.value })}
                          placeholder="https://..."
                          className="text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg w-36"
                        />
                      </div>
                    )}

                    {/* Advanced Raw Section Input */}
                    {showAdvancedSectionInput && (
                      <div>
                        <label className="text-[10px] font-bold text-amber-700 block mb-0.5">섹션 ID (직접입력)</label>
                        <input
                          type="text"
                          value={menu.target || ''}
                          onChange={(e) => handleUpdateTopMenu(menu.id, { target: e.target.value })}
                          placeholder="direct-id"
                          className="text-xs px-2.5 py-1.5 border border-amber-300 bg-amber-50 rounded-lg w-28"
                        />
                      </div>
                    )}

                    {/* Visibility Toggle */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">노출 여부</label>
                      <button
                        type="button"
                        onClick={() => handleUpdateTopMenu(menu.id, { visible: menu.visible === false })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          menu.visible !== false 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {menu.visible !== false ? '노출 중' : '숨김 상태'}
                      </button>
                    </div>

                    {/* Delete Menu Button */}
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => handleDeleteTopMenu(menu.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="메뉴 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Submenus List */}
            <div className="bg-slate-50/70 rounded-xl p-4 space-y-3 border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ListTree className="w-4 h-4 text-[#872D35]" />
                  <span>하위 드롭다운 세부 메뉴 ({menu.submenus?.length || 0}개)</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleAddSubmenu(menu.id)}
                  className="text-xs font-bold text-[#872D35] hover:underline flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-md border border-[#872D35]/30 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>하위 항목 추가</span>
                </button>
              </div>

              {menu.submenus && menu.submenus.length > 0 ? (
                <div className="space-y-2">
                  {menu.submenus.map((sub, sIdx) => (
                    <div 
                      key={sub.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-2xs"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        {/* Sub Reorder */}
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => handleMoveSubmenu(menu.id, sIdx, 'up')}
                            disabled={sIdx === 0}
                            className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="위로"
                          >
                            <ChevronUp className="w-3 h-3 text-slate-600" />
                          </button>
                          <button
                            onClick={() => handleMoveSubmenu(menu.id, sIdx, 'down')}
                            disabled={sIdx === menu.submenus.length - 1}
                            className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="아래로"
                          >
                            <ChevronDown className="w-3 h-3 text-slate-600" />
                          </button>
                        </div>

                        <span className="text-xs text-stone-400 font-bold">›</span>

                        {/* Submenu Label */}
                        <input
                          type="text"
                          value={sub.label}
                          onChange={(e) => handleUpdateSubmenu(menu.id, sub.id, { label: e.target.value })}
                          placeholder="하위 메뉴명"
                          className="text-xs font-bold px-2.5 py-1.5 border border-slate-300 rounded-lg w-36 sm:w-44 focus:border-[#872D35] focus:outline-none"
                        />
                      </div>

                      {/* Sub Action Selection */}
                      {(() => {
                        const currentSubAction = normalizeActionType(sub.actionType);
                        const currentSubTarget = AVAILABLE_PAGES.some(p => p.id === sub.target) ? (sub.target || 'about') : 'about';
                        const currentSubBoardTarget = AVAILABLE_BOARDS.some(b => b.id === sub.target) ? (sub.target || 'notice-board') : 'notice-board';

                        return (
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Action Type */}
                            <select
                              value={currentSubAction}
                              onChange={(e) => handleUpdateSubmenu(menu.id, sub.id, { actionType: e.target.value as any })}
                              className="text-[11px] px-2 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-bold"
                            >
                              <option value="page">페이지 이동</option>
                              <option value="board">게시판 이동</option>
                              <option value="quote">대량 견적상담</option>
                              <option value="sample">무료 샘플신청</option>
                              <option value="section">섹션 스크롤</option>
                              <option value="external">외부 링크</option>
                            </select>

                            {/* If Page Selected */}
                            {currentSubAction === 'page' && (
                              <>
                                <select
                                  value={currentSubTarget}
                                  onChange={(e) => {
                                    const newTarget = e.target.value;
                                    const subOpts = getSubOptions(newTarget);
                                    handleUpdateSubmenu(menu.id, sub.id, { target: newTarget, subTarget: subOpts[0]?.id || '' });
                                  }}
                                  className="text-[11px] px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                                >
                                  {AVAILABLE_PAGES.map(p => (
                                    <option key={p.id} value={p.id}>{p.label}</option>
                                  ))}
                                </select>

                                {getSubOptions(currentSubTarget).length > 0 && (
                                  <select
                                    value={sub.subTarget || ''}
                                    onChange={(e) => handleUpdateSubmenu(menu.id, sub.id, { subTarget: e.target.value })}
                                    className="text-[11px] px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-[#872D35] font-bold"
                                  >
                                    <option value="">(기본 첫 화면)</option>
                                    {getSubOptions(currentSubTarget).map(opt => (
                                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                                    ))}
                                  </select>
                                )}
                              </>
                            )}

                            {/* If Board Selected */}
                            {currentSubAction === 'board' && (
                              <select
                                value={currentSubBoardTarget}
                                onChange={(e) => handleUpdateSubmenu(menu.id, sub.id, { target: e.target.value })}
                                className="text-[11px] px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-purple-700 font-bold"
                              >
                                {AVAILABLE_BOARDS.map(b => (
                                  <option key={b.id} value={b.id}>{b.label}</option>
                                ))}
                              </select>
                            )}

                            {/* If Quote Selected */}
                            {currentSubAction === 'quote' && (
                              <span className="text-[10px] font-bold px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                견적상담
                              </span>
                            )}

                            {/* If Sample Selected */}
                            {currentSubAction === 'sample' && (
                              <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                샘플신청
                              </span>
                            )}

                            {/* If Section Selected */}
                            {currentSubAction === 'section' && (
                              <select
                                value={sub.target || 'product-slider-section'}
                                onChange={(e) => handleUpdateSubmenu(menu.id, sub.id, { target: e.target.value })}
                                className="text-[11px] px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
                              >
                                {SUB_MENU_OPTIONS.home.map(s => (
                                  <option key={s.id} value={s.id}>{s.label}</option>
                                ))}
                              </select>
                            )}

                            {/* If External Link Selected */}
                            {currentSubAction === 'external' && (
                              <input
                                type="text"
                                value={sub.target || ''}
                                onChange={(e) => handleUpdateSubmenu(menu.id, sub.id, { target: e.target.value })}
                                placeholder="https://..."
                                className="text-[11px] px-2 py-1.5 border border-slate-200 rounded-lg w-28"
                              />
                            )}

                            {/* Advanced Raw Section */}
                            {showAdvancedSectionInput && (
                              <input
                                type="text"
                                value={sub.target || ''}
                                onChange={(e) => handleUpdateSubmenu(menu.id, sub.id, { target: e.target.value })}
                                placeholder="직접 섹션 ID"
                                className="text-[11px] px-2 py-1.5 border border-amber-300 bg-amber-50 rounded-lg w-24"
                              />
                            )}

                            {/* Delete Submenu */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSubmenu(menu.id, sub.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                              title="하위 메뉴 삭제"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-1">
                  등록된 하위 세부메뉴가 없습니다. (단독 메뉴 버튼으로 동작합니다)
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Save Bar */}
      <div className="bg-[#FAF8F5] p-5 rounded-xl border border-[#EEEAE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <p className="text-xs text-stone-600">
          ※ 메뉴명 및 이동 링크를 수정한 후 <strong className="text-[#872D35]">[상단 메뉴 저장]</strong> 버튼을 누르면 웹사이트 상단 헤더와 모바일 메뉴에 실시간으로 즉시 적용됩니다.
        </p>
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6E1D24] text-white text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-sm shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>상단 메뉴 설정 저장하기</span>
        </button>
      </div>
    </div>
  );
};
