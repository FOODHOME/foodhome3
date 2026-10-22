import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ProductItem, 
  ProductCategoryItem, 
  CompanySubpageItem, 
  HistoryItem, 
  ProcessStepItem, 
  WholesaleStepItem 
} from '../../types';
import { uploadImageToStorage } from '../../lib/supabase';
import { SectionManager } from './SectionManager';
import { getDefaultPageSections, getDefaultProductSections } from '../../data/defaultPageSections';
import { 
  Building, 
  Package, 
  Cpu, 
  Truck, 
  PhoneCall, 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  FileText, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  Edit3, 
  Sliders, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Award, 
  MapPin, 
  RotateCcw, 
  FolderTree, 
  Image as ImageIcon,
  Clock,
  Thermometer,
  Phone,
  CheckCircle2
} from 'lucide-react';

export const ContentManager: React.FC = () => {
  const { 
    state, 
    updateContent, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    reorderProducts,
    updateProductCategories,
    updateCompanySubpages,
    updatePageSections,
    showToast 
  } = useApp();

  // Navigation: main top menu selection
  // 'about' = 회사소개, 'products' = 제품소개, 'process' = 제조공정, 'wholesale' = 납품안내, 'cs' = 고객센터
  const [activeMainMenu, setActiveMainMenu] = useState<'about' | 'products' | 'process' | 'wholesale' | 'cs'>('about');

  // Sub-navigation for 회사소개
  const [selectedAboutSubId, setSelectedAboutSubId] = useState<string>('intro');

  // Sub-navigation for 제품소개
  const [selectedProductId, setSelectedProductId] = useState<string>(state.products[0]?.id || '');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [productPreviewMode, setProductPreviewMode] = useState<'none' | 'card' | 'modal'>('card');
  const [productSubTab, setProductSubTab] = useState<'items' | 'categories'>('items');

  // Local form for general site content
  const [contentForm, setContentForm] = useState(state.content);
  const [isUploading, setIsUploading] = useState(false);

  // Sync content form when state changes
  useEffect(() => {
    setContentForm(state.content);
  }, [state.content]);

  // Ensure selected product is valid
  useEffect(() => {
    if (state.products.length > 0 && (!selectedProductId || !state.products.some(p => p.id === selectedProductId))) {
      setSelectedProductId(state.products[0].id);
    }
  }, [state.products, selectedProductId]);

  // -------------------------------------------------------------
  // General Content Handlers
  // -------------------------------------------------------------
  const handleFieldChange = (field: keyof typeof contentForm, value: any) => {
    setContentForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAllContent = () => {
    updateContent(contentForm);
    if (contentForm.companySubpages) {
      updateCompanySubpages(contentForm.companySubpages);
    }
    showToast('상단 메뉴 콘텐츠 전체가 성공적으로 저장되었습니다.');
  };

  const handleImageUpload = async (
    fieldOrCallback: keyof typeof contentForm | ((url: string) => void),
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const res = await uploadImageToStorage(file, 'content');
    setIsUploading(false);

    if (res.url) {
      if (typeof fieldOrCallback === 'function') {
        fieldOrCallback(res.url);
      } else {
        handleFieldChange(fieldOrCallback, res.url);
      }
      showToast('이미지가 성공적으로 업로드되었습니다.');
    } else {
      alert(res.error || '이미지 업로드에 실패했습니다.');
    }
  };

  // -------------------------------------------------------------
  // 회사소개 (Company Subpages) Helpers
  // -------------------------------------------------------------
  const subpages: CompanySubpageItem[] = contentForm.companySubpages && contentForm.companySubpages.length > 0
    ? contentForm.companySubpages
    : [
        { id: 'intro', menuLabel: 'CEO 인사말', badgeTitle: 'CEO 인사말', title: '우리 가족이 먹는다는 마음으로,\n끝까지 아삭하고 정직한 맛을 지켜갑니다.', subtitle: 'SINCE 1996 · 30년의 고집', description: '원가와 타협하지 않는 100% 국산 농산물과 특허 수분제어 공법으로 최고의 파트너가 되겠습니다.', visible: true, order: 1 },
        { id: 'history', menuLabel: '회사 연혁', badgeTitle: 'HISTORY', title: '30년 전통 푸드홈의 발자취', subtitle: 'TRADITION & INNOVATION', description: '1996년 설립 이래 대한민국 대표 김치 전문 제조업체로 성장해 온 역사입니다.', visible: true, order: 2 },
        { id: 'system', menuLabel: '생산 & 물류시스템', badgeTitle: 'PRODUCTION SYSTEM', title: '스마트 자동화 생산 공정 프로세스', subtitle: 'CLEAN AUTOMATION', description: '산지 직송부터 매장 주방 도착까지, 푸드홈만의 6단계 안심 품질 관리 시스템을 운영합니다.', visible: true, order: 3 },
        { id: 'permits', menuLabel: '인허가사항', badgeTitle: 'LEGAL & CERTIFICATIONS', title: '공식 영업등록 및 품질 안전 인허가', subtitle: 'SAFETY & TRUST', description: '식품위생법 및 관련 법령에 따른 엄격한 정식 인허가를 필하여 안심하고 납품받으실 수 있습니다.', visible: true, order: 4 },
        { id: 'location', menuLabel: '오시는 길', badgeTitle: 'LOCATION', title: '오시는 길 & 제조 가공 센터', subtitle: 'HEADQUARTERS & FACTORY', description: '충청북도 진천군 덕산읍 신척산단로 128 (신척산업단지 내 푸드홈 식품가공센터)', visible: true, order: 5 }
      ];

  const currentSubpage = subpages.find(s => s.id === selectedAboutSubId) || subpages[0];

  const handleUpdateSubpageField = (id: string, field: keyof CompanySubpageItem, value: any) => {
    const updated = subpages.map(s => s.id === id ? { ...s, [field]: value } : s);
    handleFieldChange('companySubpages', updated);
  };

  const handleMoveSubpage = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === subpages.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const copy = [...subpages];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    const reordered = copy.map((item, idx) => ({ ...item, order: idx + 1 }));
    handleFieldChange('companySubpages', reordered);
  };

  // -------------------------------------------------------------
  // 제품소개 (Products) Helpers
  // -------------------------------------------------------------
  const productCategories: ProductCategoryItem[] = contentForm.productCategoriesList && contentForm.productCategoriesList.length > 0
    ? contentForm.productCategoriesList
    : [
        { id: 'cat-bossam', name: '보쌈무김치', englishName: 'BOSSAM RADISH KIMCHI', description: '물 생김 없이 끝까지 아삭하고 꼬들한 시그니처', order: 1, visible: true },
        { id: 'cat-seasoning', name: '비법김칫속', englishName: 'ARTISAN KIMCHI PASTE', description: '생과일 천연 단맛과 토굴 젓갈의 깊은 감칠맛', order: 2, visible: true },
        { id: 'cat-bulk', name: '업소용 대용량(10kg)', englishName: 'B2B BULK PACKAGE', description: '전국 480개 외식 가맹점 공급용 경제형 규격', order: 3, visible: true },
        { id: 'cat-pouch', name: '소포장 & 밀키트', englishName: 'POUCH & MEAL KIT', description: '배달전문점, 밀키트 세트용 위생 실링팩', order: 4, visible: true }
      ];

  const currentProduct = state.products.find(p => p.id === selectedProductId) || state.products[0];

  const handleUpdateCurrentProduct = (fields: Partial<ProductItem>) => {
    if (!currentProduct) return;
    updateProduct(currentProduct.id, fields);
  };

  const handleCreateNewProduct = () => {
    const defaultCategory = productCategories[0]?.name || '보쌈무김치';
    const newProd: Omit<ProductItem, 'id'> = {
      name: '새 제품명 입력',
      subtitle: '제품의 한 줄 핵심 소개 문구를 입력하세요',
      category: defaultCategory,
      tag: 'NEW 신제품',
      weight: '1kg 진공팩',
      storage: '0~10℃ 냉장보관',
      shelfLife: '제조일로부터 30일',
      ingredients: '절임무 80%(국내산), 고춧가루(국내산), 마늘, 생강, 멸치액젓',
      description: '푸드홈만의 특허 수분제어 절임 공법으로 아삭함이 오래 유지되는 신제품입니다.',
      imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80',
      bulkPriceGuide: '외식업 사업자 회원 전용 도매 납품단가 제공 (전화 문의)',
      buttonText: '무료 샘플 1kg 신청',
      buttonAction: 'sample-board-write',
      visible: true,
      order: state.products.length + 1
    };
    addProduct(newProd);
    showToast('새 제품이 추가되었습니다.');
  };

  const handleDeleteCurrentProduct = () => {
    if (!currentProduct) return;
    if (confirm(`'${currentProduct.name}' 제품을 정말로 삭제하시겠습니까?`)) {
      deleteProduct(currentProduct.id);
      showToast('제품이 삭제되었습니다.');
    }
  };

  const handleMoveProductOrder = (direction: 'up' | 'down') => {
    if (!currentProduct) return;
    const curIdx = state.products.findIndex(p => p.id === currentProduct.id);
    if (curIdx === -1) return;
    if ((direction === 'up' && curIdx === 0) || (direction === 'down' && curIdx === state.products.length - 1)) return;

    const targetIdx = direction === 'up' ? curIdx - 1 : curIdx + 1;
    const copy = [...state.products];
    const [moved] = copy.splice(curIdx, 1);
    copy.splice(targetIdx, 0, moved);
    const reordered = copy.map((p, i) => ({ ...p, order: i + 1 }));
    reorderProducts(reordered);
    showToast('제품 순서가 변경되었습니다.');
  };

  // Product Category Management Modal State
  const [editableCats, setEditableCats] = useState<ProductCategoryItem[]>(productCategories);
  const [newCatName, setNewCatName] = useState('');

  const handleSaveCategories = () => {
    updateProductCategories(editableCats);
    handleFieldChange('productCategoriesList', editableCats);
    setIsCategoryModalOpen(false);
    showToast('제품 카테고리 설정이 성공적으로 저장되었습니다.');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#872D35]/10 text-[#872D35]">
              <FileText className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-black text-stone-900">
              상단 메뉴 콘텐츠 관리
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#872D35]/10 text-[#872D35] border border-[#872D35]/20">
              GNB 통합 관리
            </span>
          </div>
          <p className="text-xs text-stone-500">
            홈페이지 상단 메뉴(회사소개, 제품소개, 제조공정, 납품안내, 고객센터)의 모든 하위 페이지 및 제품별 콘텐츠를 통합 편집합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAllContent}
            className="px-5 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>콘텐츠 전체 저장</span>
          </button>
        </div>
      </div>

      {/* 2. GNB TOP MENUS NAVIGATOR TABS */}
      <div className="bg-white p-2 sm:p-3 rounded-2xl border border-stone-200 shadow-2xs flex items-center gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'about', label: '1. 회사소개', count: subpages.length, icon: Building },
          { id: 'products', label: '2. 제품소개', count: state.products.length, icon: Package },
          { id: 'process', label: '3. 제조공정', count: 4, icon: Cpu },
          { id: 'wholesale', label: '4. 납품안내', count: 3, icon: Truck },
          { id: 'cs', label: '5. 고객센터', count: undefined, icon: PhoneCall },
        ].map(menu => {
          const Icon = menu.icon;
          const isActive = activeMainMenu === menu.id;

          return (
            <button
              key={menu.id}
              onClick={() => setActiveMainMenu(menu.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#872D35] text-white shadow-xs font-black ring-2 ring-[#872D35]/20'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
              <span>{menu.label}</span>
              {menu.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-white text-[#872D35]' : 'bg-stone-200 text-stone-700'
                }`}>
                  {menu.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 1: 회사소개 관리 (하위 페이지 개별 편집)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeMainMenu === 'about' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: 회사소개 하위 메뉴 트리 목록 */}
          <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h4 className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                  <FolderTree className="w-4 h-4 text-[#872D35]" />
                  <span>회사소개 하위 페이지 목록</span>
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">클릭 시 우측에서 문구·이미지 편집</p>
              </div>
            </div>

            <div className="space-y-1.5">
              {subpages.map((sub, idx) => {
                const isSelected = selectedAboutSubId === sub.id;

                return (
                  <div
                    key={sub.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-[#872D35] bg-[#872D35]/5 shadow-2xs'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedAboutSubId(sub.id)}
                      className="flex-1 text-left flex items-center gap-2 min-w-0 cursor-pointer"
                    >
                      <span className="w-5 h-5 rounded-md bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-600 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span className={`text-xs block truncate ${isSelected ? 'font-black text-[#872D35]' : 'font-bold text-stone-800'}`}>
                          {sub.menuLabel || sub.title}
                        </span>
                        <span className="text-[10px] text-stone-400 truncate block">
                          {sub.badgeTitle || sub.id}
                        </span>
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateSubpageField(sub.id, 'visible', !sub.visible)}
                        className={`p-1 rounded cursor-pointer ${sub.visible !== false ? 'text-emerald-600 hover:bg-emerald-50' : 'text-stone-300 hover:bg-stone-100'}`}
                        title={sub.visible !== false ? '홈페이지 노출 중' : '숨김 상태'}
                      >
                        {sub.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSubpage(idx, 'up')}
                        className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700 disabled:opacity-20 cursor-pointer text-xs"
                        title="위로 이동"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === subpages.length - 1}
                        onClick={() => handleMoveSubpage(idx, 'down')}
                        className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700 disabled:opacity-20 cursor-pointer text-xs"
                        title="아래로 이동"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 leading-relaxed">
              💡 <strong>메뉴 이름 수정 팁:</strong> 'CEO 인사말'을 '대표이사 인사말'로 수정하면 관리자와 실제 홈페이지 상단 메뉴, 탭에 즉시 반영됩니다.
            </div>
          </div>

          {/* Right: 선택된 회사소개 하위 페이지 상세 편집 폼 */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#872D35] uppercase tracking-wider block">
                  SUBPAGE CONTENT EDITOR
                </span>
                <h4 className="text-base font-black text-stone-900">
                  '{currentSubpage.menuLabel}' 페이지 상세 콘텐츠 편집
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentSubpage.visible !== false}
                    onChange={(e) => handleUpdateSubpageField(currentSubpage.id, 'visible', e.target.checked)}
                    className="rounded text-[#872D35]"
                  />
                  <span>메뉴 및 페이지 노출</span>
                </label>
              </div>
            </div>

            {/* Common fields: 메뉴 이름, 배지 태그, 콘텐츠 메인 제목, 부제목 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ① 상단 메뉴 및 탭 표시 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentSubpage.menuLabel}
                  onChange={(e) => handleUpdateSubpageField(currentSubpage.id, 'menuLabel', e.target.value)}
                  placeholder="예: CEO 인사말 또는 대표이사 인사말"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white focus:border-[#872D35]"
                />
                <p className="text-[10px] text-stone-400 mt-1">상단 GNB 드롭다운 및 회사소개 서브탭에 표시되는 이름</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ② 배지 / 태그 문구
                </label>
                <input
                  type="text"
                  value={currentSubpage.badgeTitle || ''}
                  onChange={(e) => handleUpdateSubpageField(currentSubpage.id, 'badgeTitle', e.target.value)}
                  placeholder="예: CEO 인사말 또는 PRODUCTION SYSTEM"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                />
                <p className="text-[10px] text-stone-400 mt-1">본문 상단에 작게 표시되는 강조 배지</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ③ 본문 콘텐츠 메인 제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentSubpage.title}
                  onChange={(e) => handleUpdateSubpageField(currentSubpage.id, 'title', e.target.value)}
                  placeholder="페이지 본문에 표시될 핵심 타이틀"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ④ 부제목 / 설명 요약
                </label>
                <input
                  type="text"
                  value={currentSubpage.subtitle || ''}
                  onChange={(e) => handleUpdateSubpageField(currentSubpage.id, 'subtitle', e.target.value)}
                  placeholder="예: SINCE 1996 · 30년의 고집"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  ⑤ 본문 설명 문구
                </label>
                <textarea
                  rows={3}
                  value={currentSubpage.description || ''}
                  onChange={(e) => handleUpdateSubpageField(currentSubpage.id, 'description', e.target.value)}
                  placeholder="페이지의 총괄 소개 설명을 입력하세요"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                />
              </div>
            </div>

            {/* Subpage Specific Data Editors */}
            {currentSubpage.id === 'intro' && (
              <div className="pt-4 border-t border-stone-100 space-y-4">
                <h5 className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#872D35]" />
                  <span>CEO 인사말 및 대표자 상세 정보</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">대표자 직책</label>
                    <input
                      type="text"
                      value={contentForm.ceoRole || '대표이사'}
                      onChange={(e) => handleFieldChange('ceoRole', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">대표자 성함</label>
                    <input
                      type="text"
                      value={contentForm.ceoName || '김진성'}
                      onChange={(e) => handleFieldChange('ceoName', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">강조 슬로건</label>
                    <input
                      type="text"
                      value={contentForm.ceoHighlight || '안전하고 정직한 김치만 만듭니다'}
                      onChange={(e) => handleFieldChange('ceoHighlight', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    인사말 본문 전체 (문단 구분을 위해 엔터 2번 입력)
                  </label>
                  <textarea
                    rows={5}
                    value={contentForm.ceoGreeting || ''}
                    onChange={(e) => handleFieldChange('ceoGreeting', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">장인 / 대표 이미지</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={contentForm.ceoImageUrl || ''}
                        onChange={(e) => handleFieldChange('ceoImageUrl', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                      />
                      <label className="px-3 py-1.5 bg-stone-800 text-white text-xs font-bold rounded-lg cursor-pointer shrink-0">
                        <span>업로드</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('ceoImageUrl', e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">대표자 친필 서명 이미지</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={contentForm.ceoSignatureImage || ''}
                        onChange={(e) => handleFieldChange('ceoSignatureImage', e.target.value)}
                        placeholder="서명 PNG 투명 이미지 URL"
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg"
                      />
                      <label className="px-3 py-1.5 bg-stone-800 text-white text-xs font-bold rounded-lg cursor-pointer shrink-0">
                        <span>업로드</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload('ceoSignatureImage', e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentSubpage.id === 'system' && (
              <div className="pt-4 border-t border-stone-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#872D35]" />
                    <span>생산 & 물류시스템 6단계 프로세스</span>
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = contentForm.systemSteps || [];
                      const newStep = {
                        step: `STEP 0${cur.length + 1}`,
                        title: '새 공정 단계명',
                        desc: '공정에 대한 세부 설명 내용을 입력합니다.'
                      };
                      handleFieldChange('systemSteps', [...cur, newStep]);
                    }}
                    className="px-3 py-1 rounded-lg bg-stone-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>단계 추가</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(contentForm.systemSteps || []).map((step, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={step.step}
                          onChange={(e) => {
                            const updated = [...(contentForm.systemSteps || [])];
                            updated[idx].step = e.target.value;
                            handleFieldChange('systemSteps', updated);
                          }}
                          className="w-24 px-2 py-1 text-xs font-mono font-bold border border-stone-300 rounded bg-white text-[#872D35]"
                        />
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => {
                            const updated = [...(contentForm.systemSteps || [])];
                            updated[idx].title = e.target.value;
                            handleFieldChange('systemSteps', updated);
                          }}
                          className="flex-1 px-2.5 py-1 text-xs font-bold border border-stone-300 rounded bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (contentForm.systemSteps || []).filter((_, i) => i !== idx);
                            handleFieldChange('systemSteps', updated);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={step.desc}
                        onChange={(e) => {
                          const updated = [...(contentForm.systemSteps || [])];
                          updated[idx].desc = e.target.value;
                          handleFieldChange('systemSteps', updated);
                        }}
                        className="w-full px-2.5 py-1 text-xs border border-stone-200 rounded bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentSubpage.id === 'permits' && (
              <div className="pt-4 border-t border-stone-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#872D35]" />
                    <span>인허가 및 품질 검사 인증 내역</span>
                  </h5>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = contentForm.permitsList || [];
                      const newCert = {
                        title: '새 인증/인허가 항목',
                        issuer: '발급 기관',
                        number: '제 2026-00호',
                        desc: '상세 인증 내역 설명',
                        status: '정상 등록 유지'
                      };
                      handleFieldChange('permitsList', [...cur, newCert]);
                    }}
                    className="px-3 py-1 rounded-lg bg-stone-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>인증 추가</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(contentForm.permitsList || []).map((cert, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={cert.title}
                          onChange={(e) => {
                            const updated = [...(contentForm.permitsList || [])];
                            updated[idx].title = e.target.value;
                            handleFieldChange('permitsList', updated);
                          }}
                          className="px-2 py-1 text-xs font-bold border border-stone-300 rounded bg-white"
                          placeholder="인증명"
                        />
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => {
                            const updated = [...(contentForm.permitsList || [])];
                            updated[idx].issuer = e.target.value;
                            handleFieldChange('permitsList', updated);
                          }}
                          className="px-2 py-1 text-xs border border-stone-200 rounded bg-white"
                          placeholder="발급기관"
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={cert.number}
                            onChange={(e) => {
                              const updated = [...(contentForm.permitsList || [])];
                              updated[idx].number = e.target.value;
                              handleFieldChange('permitsList', updated);
                            }}
                            className="flex-1 px-2 py-1 text-xs font-mono font-bold text-[#872D35] border border-stone-200 rounded bg-white"
                            placeholder="인가번호"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (contentForm.permitsList || []).filter((_, i) => i !== idx);
                              handleFieldChange('permitsList', updated);
                            }}
                            className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={cert.desc}
                        onChange={(e) => {
                          const updated = [...(contentForm.permitsList || [])];
                          updated[idx].desc = e.target.value;
                          handleFieldChange('permitsList', updated);
                        }}
                        className="w-full px-2 py-1 text-xs border border-stone-200 rounded bg-white"
                        placeholder="인증 설명 문구"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentSubpage.id === 'location' && (
              <div className="pt-4 border-t border-stone-100 space-y-4">
                <h5 className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#872D35]" />
                  <span>공장 및 본사 위치 정보</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">제조공장 및 본사 주소</label>
                    <input
                      type="text"
                      value={contentForm.factoryAddress || ''}
                      onChange={(e) => handleFieldChange('factoryAddress', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">단지 및 위치 안내</label>
                    <input
                      type="text"
                      value={contentForm.locationGuide || ''}
                      onChange={(e) => handleFieldChange('locationGuide', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">교통편 안내</label>
                    <input
                      type="text"
                      value={contentForm.transitInfo || ''}
                      onChange={(e) => handleFieldChange('transitInfo', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">주차 안내</label>
                    <input
                      type="text"
                      value={contentForm.parkingInfo || ''}
                      onChange={(e) => handleFieldChange('parkingInfo', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Subpage Specific Data Editors */}
            {/* Modular Universal Section Manager for this Subpage */}
            <div className="pt-6 border-t border-stone-200">
              <SectionManager
                title={`'${currentSubpage.menuLabel}' 본문 섹션 블록 관리`}
                subtitle="페이지에 노출되는 이미지, 소개글, 특징 카드, 프로세스, CTA 안내 블록을 자유롭게 추가·수정·순서변경합니다."
                sections={contentForm.pageSections?.[`about-${currentSubpage.id}`] || contentForm.pageSections?.[currentSubpage.id] || []}
                fallbackSections={getDefaultPageSections(`about-${currentSubpage.id}`, contentForm)}
                onChange={(newSecs) => {
                  const updatedSections = {
                    ...(contentForm.pageSections || {}),
                    [`about-${currentSubpage.id}`]: newSecs,
                    [currentSubpage.id]: newSecs
                  };
                  handleFieldChange('pageSections', updatedSections);
                  updatePageSections(`about-${currentSubpage.id}`, newSecs);
                }}
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-stone-100">
              <button
                onClick={handleSaveAllContent}
                className="px-6 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>회사소개 변경사항 저장 및 즉시 반영</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 2: 제품소개 관리 (Requirement 5 완벽 통합)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeMainMenu === 'products' && (
        <div className="space-y-6">
          {/* Sub-Navigation: Products vs Categories */}
          <div className="bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setProductSubTab('items')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  productSubTab === 'items'
                    ? 'bg-[#872D35] text-white shadow-2xs font-black ring-2 ring-[#872D35]/20'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>1. 개별 제품 콘텐츠 & 블록 관리</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  productSubTab === 'items' ? 'bg-white text-[#872D35]' : 'bg-stone-200 text-stone-700'
                }`}>
                  {state.products.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setProductSubTab('categories')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  productSubTab === 'categories'
                    ? 'bg-[#872D35] text-white shadow-2xs font-black ring-2 ring-[#872D35]/20'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>2. 제품 카테고리 관리</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  productSubTab === 'categories' ? 'bg-white text-[#872D35]' : 'bg-stone-200 text-stone-700'
                }`}>
                  {productCategories.length}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCreateNewProduct}
                className="px-4 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-black flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>새 제품 추가</span>
              </button>
            </div>
          </div>

          {/* SubTab 1: Product Items & Detail Page Editor */}
          {productSubTab === 'items' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: 제품 목록 (하위 메뉴 네비게이션) */}
              <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                  <span className="text-xs font-black text-stone-800">등록 제품 선택</span>
                  <span className="text-[11px] text-stone-400 font-mono">총 {state.products.length}개</span>
                </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto no-scrollbar">
                {state.products.map((prod, idx) => {
                  const isSelected = selectedProductId === prod.id;

                  return (
                    <div
                      key={prod.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-[#872D35] bg-[#872D35]/5 shadow-xs ring-1 ring-[#872D35]'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <button
                        onClick={() => setSelectedProductId(prod.id)}
                        className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                      >
                        <img
                          src={prod.imageUrl}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover border border-stone-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-[#872D35] block truncate">
                            {prod.category}
                          </span>
                          <h5 className={`text-xs truncate ${isSelected ? 'font-black text-[#872D35]' : 'font-extrabold text-stone-900'}`}>
                            {prod.name}
                          </h5>
                          <span className="text-[10px] text-stone-500 font-mono block">
                            {prod.weight} · {prod.tag}
                          </span>
                        </div>
                      </button>

                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateCurrentProduct({ visible: prod.visible === false })}
                          className={`p-1 rounded cursor-pointer ${prod.visible !== false ? 'text-emerald-600' : 'text-stone-300'}`}
                          title={prod.visible !== false ? '노출 중' : '숨김'}
                        >
                          {prod.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: 선택된 제품의 18가지 필수 항목 종합 편집 에디터 */}
            {currentProduct && (
              <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
                
                {/* Editor Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentProduct.imageUrl}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                    />
                    <div>
                      <span className="text-[10px] font-black text-[#872D35] uppercase tracking-wider block">
                        {currentProduct.category}
                      </span>
                      <h4 className="text-base font-black text-stone-900">
                        {currentProduct.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Move order buttons */}
                    <button
                      onClick={() => handleMoveProductOrder('up')}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                      title="제품 순서 위로 이동"
                    >
                      ▲ 위로
                    </button>
                    <button
                      onClick={() => handleMoveProductOrder('down')}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                      title="제품 순서 아래로 이동"
                    >
                      ▼ 아래로
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={handleDeleteCurrentProduct}
                      className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                      title="제품 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 18개 수정 가능 항목 입력 폼 */}
                <div className="space-y-4">
                  
                  {/* ① 제품명 & ② 제품 카테고리 & ③ 배지 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        ② 제품명 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={currentProduct.name}
                        onChange={(e) => handleUpdateCurrentProduct({ name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-extrabold bg-white focus:border-[#872D35]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        ③ 대표 카테고리 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={currentProduct.category}
                        onChange={(e) => {
                          const newPrimary = e.target.value;
                          const curCats = currentProduct.categories || [currentProduct.category];
                          const merged = curCats.includes(newPrimary) ? curCats : [newPrimary, ...curCats];
                          handleUpdateCurrentProduct({ category: newPrimary, categories: merged });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white focus:border-[#872D35]"
                      >
                        {productCategories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Multi-category Checkbox Group (Requirement 1-6 & 1-7) */}
                  <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-stone-800">
                        소속 카테고리 다중 지정 (하나의 제품을 여러 카테고리에 동시 노출 가능)
                      </label>
                      <span className="text-[10px] text-stone-400">클릭하여 선택/해제</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productCategories.map(cat => {
                        const curCats = currentProduct.categories || [currentProduct.category];
                        const isChecked = curCats.includes(cat.name);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              let nextCats = [...curCats];
                              if (isChecked) {
                                nextCats = nextCats.filter(c => c !== cat.name);
                                if (nextCats.length === 0) nextCats = [cat.name]; // keep at least 1
                              } else {
                                nextCats.push(cat.name);
                              }
                              handleUpdateCurrentProduct({
                                categories: nextCats,
                                category: nextCats.includes(currentProduct.category) ? currentProduct.category : nextCats[0]
                              });
                            }}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-[#872D35] text-white border-[#872D35] shadow-2xs'
                                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                            }`}
                          >
                            <span>{isChecked ? '✓' : '+'}</span>
                            <span>{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ⑬ 배지 및 강조 문구 & 부제목 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        ⑬ 제품 배지 / 태그 문구
                      </label>
                      <input
                        type="text"
                        value={currentProduct.tag || ''}
                        onChange={(e) => handleUpdateCurrentProduct({ tag: e.target.value })}
                        placeholder="예: BEST B2B 1위"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-bold text-[#872D35]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        제품 한 줄 소개 문구 (부제목)
                      </label>
                      <input
                        type="text"
                        value={currentProduct.subtitle || ''}
                        onChange={(e) => handleUpdateCurrentProduct({ subtitle: e.target.value })}
                        placeholder="예: 30년 전통 비법과 특허 수분제어 공법의 시그니처"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* ④ 제품 대표 이미지 & ⑤ 제품 상세 이미지 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        ④ 제품 대표 이미지 URL (카드 및 메인)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={currentProduct.imageUrl}
                          onChange={(e) => handleUpdateCurrentProduct({ imageUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-mono"
                        />
                        <label className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold cursor-pointer shrink-0">
                          <span>업로드</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              handleImageUpload((url) => handleUpdateCurrentProduct({ imageUrl: url }), e);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        ⑤ 제품 상세 이미지 URL (팝업용)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={currentProduct.detailImageUrl || currentProduct.imageUrl}
                          onChange={(e) => handleUpdateCurrentProduct({ detailImageUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-mono"
                        />
                        <label className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold cursor-pointer shrink-0">
                          <span>업로드</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              handleImageUpload((url) => handleUpdateCurrentProduct({ detailImageUrl: url }), e);
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* ⑥ 제품 상세 설명 */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      ⑥ 제품 상세 설명 (Description)
                    </label>
                    <textarea
                      rows={3}
                      value={currentProduct.description}
                      onChange={(e) => handleUpdateCurrentProduct({ description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white leading-relaxed"
                    />
                  </div>

                  {/* ⑧ 포장 중량, ⑨ 보관 방법, ⑩ 소비기한 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-100">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        ⑧ 포장 중량
                      </label>
                      <input
                        type="text"
                        value={currentProduct.weight}
                        onChange={(e) => handleUpdateCurrentProduct({ weight: e.target.value })}
                        placeholder="예: 1kg / 5kg / 10kg"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        ⑨ 보관 방법
                      </label>
                      <input
                        type="text"
                        value={currentProduct.storage}
                        onChange={(e) => handleUpdateCurrentProduct({ storage: e.target.value })}
                        placeholder="예: 0~10℃ 냉장보관"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        ⑩ 소비기한 / 유통기한
                      </label>
                      <input
                        type="text"
                        value={currentProduct.shelfLife}
                        onChange={(e) => handleUpdateCurrentProduct({ shelfLife: e.target.value })}
                        placeholder="예: 제조일로부터 30일"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-semibold"
                      />
                    </div>
                  </div>

                  {/* ⑪ 원재료 및 함량 */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      ⑪ 원재료 및 함량
                    </label>
                    <textarea
                      rows={2}
                      value={currentProduct.ingredients}
                      onChange={(e) => handleUpdateCurrentProduct({ ingredients: e.target.value })}
                      placeholder="예: 절임무 80%(국내산), 고춧가루(국내산), 마늘, 생강, 멸치액젓..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                    />
                  </div>

                  {/* ⑫ 납품 관련 안내 & ⑭ 제품 버튼 문구 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        ⑫ 납품 단가 안내 문구
                      </label>
                      <input
                        type="text"
                        value={currentProduct.bulkPriceGuide}
                        onChange={(e) => handleUpdateCurrentProduct({ bulkPriceGuide: e.target.value })}
                        placeholder="예: 외식업 사업자 회원 전용 도매 단가 제공"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        ⑭ 제품 신청 버튼 문구
                      </label>
                      <input
                        type="text"
                        value={currentProduct.buttonText || '무료 샘플 1kg 신청'}
                        onChange={(e) => handleUpdateCurrentProduct({ buttonText: e.target.value })}
                        placeholder="예: 무료 샘플 1kg 신청"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-bold text-[#872D35]"
                      />
                    </div>
                  </div>

                  {/* 상세페이지 스펙 추가 설정 (원산지, 포장형태, 최소발주, 배송안내) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-stone-100">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        원산지 정보
                      </label>
                      <input
                        type="text"
                        value={currentProduct.origin || ''}
                        onChange={(e) => handleUpdateCurrentProduct({ origin: e.target.value })}
                        placeholder="예: 절임무(국내산), 고춧가루(국내산)"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        포장 형태
                      </label>
                      <input
                        type="text"
                        value={currentProduct.packagingType || ''}
                        onChange={(e) => handleUpdateCurrentProduct({ packagingType: e.target.value })}
                        placeholder="예: 2중 안심 진공 실링백"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        최소 발주 단위
                      </label>
                      <input
                        type="text"
                        value={currentProduct.minOrder || ''}
                        onChange={(e) => handleUpdateCurrentProduct({ minOrder: e.target.value })}
                        placeholder="예: 1박스 (10kg) 이상"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        배송 조건
                      </label>
                      <input
                        type="text"
                        value={currentProduct.deliveryInfo || ''}
                        onChange={(e) => handleUpdateCurrentProduct({ deliveryInfo: e.target.value })}
                        placeholder="예: 전국 익일 냉장 콜드체인 직배송"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                      />
                    </div>
                  </div>

                  {/* ⑮ 제품 표시/숨김 설정 */}
                  <div className="flex items-center gap-4 pt-2 border-t border-stone-100">
                    <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={currentProduct.visible !== false}
                        onChange={(e) => handleUpdateCurrentProduct({ visible: e.target.checked })}
                        className="rounded text-[#872D35]"
                      />
                      <span>⑮ 홈페이지 및 팝업에 제품 표시</span>
                    </label>
                  </div>
                </div>

                {/* ⑯ Modular Universal Section Manager for Product Detail Page */}
                <div className="pt-6 border-t border-stone-200">
                  <SectionManager
                    title={`"${currentProduct.name}" 상세페이지 맞춤 콘텐츠 블록 관리`}
                    subtitle="상세페이지 하단에 표시될 특징 카드, 공인 규격표, B2B 납품 절차, CTA 배너를 자유롭게 추가·편집·순서변경합니다."
                    sections={currentProduct.customSections || []}
                    fallbackSections={getDefaultProductSections(currentProduct)}
                    onChange={(newSecs) => handleUpdateCurrentProduct({ customSections: newSecs })}
                  />
                </div>

                {/* 3. Live Preview Section (Card & Detail Popup) */}
                <div className="pt-6 border-t border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-stone-800">실시간 반영 미리보기:</span>
                      <div className="flex rounded-lg border border-stone-200 p-0.5 bg-stone-50">
                        <button
                          type="button"
                          onClick={() => setProductPreviewMode('card')}
                          className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                            productPreviewMode === 'card' ? 'bg-white shadow-2xs text-[#872D35]' : 'text-stone-500'
                          }`}
                        >
                          홈페이지 제품 카드
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductPreviewMode('modal')}
                          className={`px-3 py-1 rounded text-xs font-bold cursor-pointer ${
                            productPreviewMode === 'modal' ? 'bg-white shadow-2xs text-[#872D35]' : 'text-stone-500'
                          }`}
                        >
                          제품 상세보기 팝업
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Preview */}
                  {productPreviewMode === 'card' && (
                    <div className="p-4 bg-stone-100 rounded-2xl flex justify-center">
                      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-md max-w-sm w-full">
                        <div className="relative aspect-4/3 bg-stone-100">
                          <img src={currentProduct.imageUrl} alt="" className="w-full h-full object-cover" />
                          {currentProduct.tag && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#872D35] text-white text-[10px] font-black shadow-xs">
                              {currentProduct.tag}
                            </span>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <span className="text-[10px] font-bold text-[#872D35]">{currentProduct.category}</span>
                          <h5 className="text-base font-black text-stone-900 leading-snug">{currentProduct.name}</h5>
                          <p className="text-xs text-stone-500 line-clamp-2">{currentProduct.description}</p>
                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                            <span>{currentProduct.weight}</span>
                            <span className="font-bold text-[#872D35]">{currentProduct.bulkPriceGuide}</span>
                          </div>
                          <button className="w-full py-2 bg-[#872D35] text-white text-xs font-bold rounded-lg mt-2">
                            {currentProduct.buttonText || '무료 샘플 1kg 신청'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Detail Popup Preview */}
                  {productPreviewMode === 'modal' && (
                    <div className="p-4 bg-stone-100 rounded-2xl flex justify-center">
                      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-lg max-w-md w-full space-y-4 text-xs">
                        <div className="flex items-center gap-3">
                          <img src={currentProduct.detailImageUrl || currentProduct.imageUrl} alt="" className="w-20 h-20 rounded-xl object-cover border border-stone-200" />
                          <div className="flex-1">
                            <span className="text-[10px] font-bold text-[#872D35]">{currentProduct.tag}</span>
                            <h4 className="text-sm font-black text-stone-900">{currentProduct.name}</h4>
                            <p className="text-[11px] text-stone-500">{currentProduct.subtitle}</p>
                          </div>
                        </div>
                        <div className="p-2.5 bg-stone-50 rounded-lg text-stone-600">
                          {currentProduct.description}
                        </div>
                        <div className="border border-stone-200 rounded-lg divide-y divide-stone-100">
                          <div className="grid grid-cols-3 p-2 font-bold bg-stone-50 text-stone-700">
                            <span>규격 항목</span>
                            <span className="col-span-2">상세 내역</span>
                          </div>
                          <div className="grid grid-cols-3 p-2">
                            <span className="font-semibold text-stone-500">포장 중량</span>
                            <span className="col-span-2">{currentProduct.weight}</span>
                          </div>
                          <div className="grid grid-cols-3 p-2">
                            <span className="font-semibold text-stone-500">보관 방법</span>
                            <span className="col-span-2">{currentProduct.storage}</span>
                          </div>
                          <div className="grid grid-cols-3 p-2">
                            <span className="font-semibold text-stone-500">소비 기한</span>
                            <span className="col-span-2">{currentProduct.shelfLife}</span>
                          </div>
                          <div className="grid grid-cols-3 p-2">
                            <span className="font-semibold text-stone-500">원재료</span>
                            <span className="col-span-2 truncate">{currentProduct.ingredients}</span>
                          </div>
                        </div>
                        <div className="p-2 bg-amber-50 text-amber-900 rounded-lg text-[11px]">
                          <strong>단가 안내:</strong> {currentProduct.bulkPriceGuide}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-3 border-t border-stone-100">
                  <button
                    onClick={() => {
                      showToast(`"${currentProduct.name}" 제품 정보가 성공적으로 저장되었습니다.`);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>이 제품 수정사항 저장</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          )}

          {/* SubTab 2: Product Categories Management (Requirement 1-1 ~ 1-8) */}
          {productSubTab === 'categories' && (
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1 rounded-md bg-[#872D35]/10 text-[#872D35]">
                      <Sliders className="w-4 h-4" />
                    </span>
                    <h4 className="text-base font-black text-stone-900">
                      제품 분류 카테고리 관리 ({productCategories.length}개)
                    </h4>
                  </div>
                  <p className="text-xs text-stone-500">
                    홈페이지 상단 카테고리 탭 및 제품 필터를 관리합니다. 카테고리를 삭제하더라도 소속된 제품은 삭제되지 않고 안전하게 유지됩니다.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveCategories}
                    className="px-5 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>카테고리 변경사항 저장</span>
                  </button>
                </div>
              </div>

              {/* Add Category Input */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center gap-2.5">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!newCatName.trim()) return;
                      const newCat: ProductCategoryItem = {
                        id: 'cat-' + Date.now(),
                        name: newCatName.trim(),
                        order: editableCats.length + 1,
                        visible: true
                      };
                      const updated = [...editableCats, newCat];
                      setEditableCats(updated);
                      updateProductCategories(updated);
                      handleFieldChange('productCategoriesList', updated);
                      setNewCatName('');
                      showToast(`'${newCat.name}' 카테고리가 추가되었습니다.`);
                    }
                  }}
                  placeholder="추가할 새 카테고리명을 입력하세요 (예: 계절 한정 김치, 선물세트, 반찬류)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-white focus:border-[#872D35]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newCatName.trim()) {
                      alert('카테고리 이름을 입력하세요.');
                      return;
                    }
                    const newCat: ProductCategoryItem = {
                      id: 'cat-' + Date.now(),
                      name: newCatName.trim(),
                      order: editableCats.length + 1,
                      visible: true
                    };
                    const updated = [...editableCats, newCat];
                    setEditableCats(updated);
                    updateProductCategories(updated);
                    handleFieldChange('productCategoriesList', updated);
                    setNewCatName('');
                    showToast(`'${newCat.name}' 카테고리가 추가되었습니다.`);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>새 카테고리 등록</span>
                </button>
              </div>

              {/* Category Items List */}
              <div className="space-y-2.5">
                {editableCats.map((cat, idx) => {
                  const matchCount = state.products.filter(p => (p.categories || [p.category]).includes(cat.name)).length;
                  const isHidden = cat.visible === false;

                  return (
                    <div
                      key={cat.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                        isHidden 
                          ? 'bg-stone-50/70 border-stone-200 opacity-60' 
                          : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center font-mono font-bold text-xs text-stone-600 shrink-0">
                          {idx + 1}
                        </span>

                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => {
                            const updated = [...editableCats];
                            updated[idx].name = e.target.value;
                            setEditableCats(updated);
                            updateProductCategories(updated);
                            handleFieldChange('productCategoriesList', updated);
                          }}
                          className="flex-1 px-3 py-1.5 text-xs font-black border border-stone-300 rounded-lg bg-stone-50/50 focus:bg-white focus:border-[#872D35]"
                        />

                        <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px] font-bold shrink-0">
                          {matchCount}개 제품 연결됨
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...editableCats];
                            updated[idx].visible = !updated[idx].visible;
                            setEditableCats(updated);
                            updateProductCategories(updated);
                            handleFieldChange('productCategoriesList', updated);
                          }}
                          className={`p-1.5 rounded-lg cursor-pointer ${
                            !isHidden ? 'text-emerald-600 hover:bg-emerald-50' : 'text-stone-300 hover:bg-stone-100'
                          }`}
                          title={!isHidden ? '홈페이지 노출 중' : '숨김 상태'}
                        >
                          {!isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => {
                            const updated = [...editableCats];
                            const [moved] = updated.splice(idx, 1);
                            updated.splice(idx - 1, 0, moved);
                            const reordered = updated.map((c, i) => ({ ...c, order: i + 1 }));
                            setEditableCats(reordered);
                            updateProductCategories(reordered);
                            handleFieldChange('productCategoriesList', reordered);
                          }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-20 cursor-pointer text-xs"
                          title="위로 이동"
                        >
                          ▲
                        </button>

                        <button
                          type="button"
                          disabled={idx === editableCats.length - 1}
                          onClick={() => {
                            const updated = [...editableCats];
                            const [moved] = updated.splice(idx, 1);
                            updated.splice(idx + 1, 0, moved);
                            const reordered = updated.map((c, i) => ({ ...c, order: i + 1 }));
                            setEditableCats(reordered);
                            updateProductCategories(reordered);
                            handleFieldChange('productCategoriesList', reordered);
                          }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-20 cursor-pointer text-xs"
                          title="아래로 이동"
                        >
                          ▼
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`'${cat.name}' 카테고리를 정말 삭제하시겠습니까?\n\n※ 안전 보장: 카테고리를 삭제하더라도 해당 카테고리에 속한 모든 제품은 절대 삭제되지 않고 유지됩니다.`)) {
                              const updated = editableCats.filter((_, i) => i !== idx);
                              const reordered = updated.map((c, i) => ({ ...c, order: i + 1 }));
                              setEditableCats(reordered);
                              updateProductCategories(reordered);
                              handleFieldChange('productCategoriesList', reordered);
                              showToast(`'${cat.name}' 카테고리가 삭제되었습니다. (제품은 안전하게 유지됩니다)`);
                            }
                          }}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          title="카테고리 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Safety notice info card */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>데이터 안전 보장:</strong> 카테고리를 삭제하거나 수정하더라도 기존에 등록된 제품의 이름, 상세스펙, 이미지 및 데이터는 100% 안전하게 유지됩니다.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 3: 제조공정 관리
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeMainMenu === 'process' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-[#872D35] uppercase tracking-wider block">PROCESS MANAGEMENT</span>
              <h4 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#872D35]" />
                <span>제조공정 (Manufacturing Process) 페이지 내용 편집</span>
              </h4>
            </div>
            <button
              onClick={handleSaveAllContent}
              className="px-4 py-2 rounded-xl bg-[#872D35] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>저장하기</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                제조공정 메인 제목
              </label>
              <input
                type="text"
                value={contentForm.processTitle || ''}
                onChange={(e) => handleFieldChange('processTitle', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                제조공정 부제목
              </label>
              <input
                type="text"
                value={contentForm.processSubtitle || ''}
                onChange={(e) => handleFieldChange('processSubtitle', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              제조공정 총괄 설명 문구
            </label>
            <textarea
              rows={2}
              value={contentForm.processDescription || ''}
              onChange={(e) => handleFieldChange('processDescription', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              품질관리 및 안심 위생 안내 문구
            </label>
            <input
              type="text"
              value={contentForm.qualityNotice || ''}
              onChange={(e) => handleFieldChange('qualityNotice', e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-medium text-emerald-800"
            />
          </div>

          {/* 4 Steps Management */}
          <div className="pt-4 border-t border-stone-100 space-y-4">
            <h5 className="text-xs font-black text-stone-800">제조 4단계 상세 공정 단계</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(contentForm.processSteps || []).map((step, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#872D35]">STEP 0{step.step}</span>
                    <input
                      type="text"
                      value={step.badge || ''}
                      onChange={(e) => {
                        const updated = [...(contentForm.processSteps || [])];
                        updated[idx].badge = e.target.value;
                        handleFieldChange('processSteps', updated);
                      }}
                      placeholder="배지 (예: 엄선 원물)"
                      className="w-24 px-2 py-0.5 text-[10px] font-bold border border-stone-300 rounded bg-white text-right"
                    />
                  </div>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const updated = [...(contentForm.processSteps || [])];
                      updated[idx].title = e.target.value;
                      handleFieldChange('processSteps', updated);
                    }}
                    className="w-full px-2.5 py-1 text-xs font-bold border border-stone-300 rounded bg-white"
                  />
                  <textarea
                    rows={2}
                    value={step.desc}
                    onChange={(e) => {
                      const updated = [...(contentForm.processSteps || [])];
                      updated[idx].desc = e.target.value;
                      handleFieldChange('processSteps', updated);
                    }}
                    className="w-full px-2.5 py-1 text-xs border border-stone-200 rounded bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={handleSaveAllContent}
              className="px-6 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-bold cursor-pointer"
            >
              제조공정 내용 저장
            </button>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 4: 납품안내 관리
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeMainMenu === 'wholesale' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-[#872D35] uppercase tracking-wider block">WHOLESALE GUIDE</span>
              <h4 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#872D35]" />
                <span>납품안내 (Wholesale Guide) 내용 편집</span>
              </h4>
            </div>
            <button
              onClick={handleSaveAllContent}
              className="px-4 py-2 rounded-xl bg-[#872D35] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>저장하기</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                납품안내 제목
              </label>
              <input
                type="text"
                value={contentForm.wholesaleTitle || ''}
                onChange={(e) => handleFieldChange('wholesaleTitle', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                납품안내 소제목
              </label>
              <input
                type="text"
                value={contentForm.wholesaleSubtitle || ''}
                onChange={(e) => handleFieldChange('wholesaleSubtitle', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                납품 가능 지역
              </label>
              <input
                type="text"
                value={contentForm.deliveryRegions || ''}
                onChange={(e) => handleFieldChange('deliveryRegions', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                납품 방식
              </label>
              <input
                type="text"
                value={contentForm.deliveryMethods || ''}
                onChange={(e) => handleFieldChange('deliveryMethods', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
              />
            </div>
          </div>

          {/* 3 Delivery Steps */}
          <div className="pt-4 border-t border-stone-100 space-y-4">
            <h5 className="text-xs font-black text-stone-800">납품 및 정기 발주 3단계 프로세스</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(contentForm.deliverySteps || []).map((step, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <span className="text-xs font-black text-[#872D35]">STEP 0{step.step}</span>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const updated = [...(contentForm.deliverySteps || [])];
                      updated[idx].title = e.target.value;
                      handleFieldChange('deliverySteps', updated);
                    }}
                    className="w-full px-2.5 py-1 text-xs font-bold border border-stone-300 rounded bg-white"
                  />
                  <textarea
                    rows={3}
                    value={step.desc}
                    onChange={(e) => {
                      const updated = [...(contentForm.deliverySteps || [])];
                      updated[idx].desc = e.target.value;
                      handleFieldChange('deliverySteps', updated);
                    }}
                    className="w-full px-2.5 py-1 text-xs border border-stone-200 rounded bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={handleSaveAllContent}
              className="px-6 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-bold cursor-pointer"
            >
              납품안내 내용 저장
            </button>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 5: 고객센터 관리
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {activeMainMenu === 'cs' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-[10px] font-bold text-[#872D35] uppercase tracking-wider block">CUSTOMER SUPPORT</span>
              <h4 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#872D35]" />
                <span>고객센터 (Customer Center) 페이지 문구 및 운영 정보</span>
              </h4>
            </div>
            <button
              onClick={handleSaveAllContent}
              className="px-4 py-2 rounded-xl bg-[#872D35] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>저장하기</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                고객센터 헤더 타이틀
              </label>
              <input
                type="text"
                value={contentForm.csNoticeTitle || ''}
                onChange={(e) => handleFieldChange('csNoticeTitle', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                고객센터 안내 문구
              </label>
              <input
                type="text"
                value={contentForm.csNoticeDesc || ''}
                onChange={(e) => handleFieldChange('csNoticeDesc', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                대표 상담 전화번호
              </label>
              <input
                type="text"
                value={contentForm.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                팩스 번호
              </label>
              <input
                type="text"
                value={contentForm.fax || ''}
                onChange={(e) => handleFieldChange('fax', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                문의 접수 이메일
              </label>
              <input
                type="text"
                value={contentForm.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                고객센터 운영 시간
              </label>
              <input
                type="text"
                value={contentForm.csHours || ''}
                onChange={(e) => handleFieldChange('csHours', e.target.value)}
                placeholder="예: 평일 09:00 ~ 18:00 (주말/공휴일 휴무)"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                점심 시간 안내
              </label>
              <input
                type="text"
                value={contentForm.lunchHours || '12:00 ~ 13:00'}
                onChange={(e) => handleFieldChange('lunchHours', e.target.value)}
                placeholder="예: 12:00 ~ 13:00"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={handleSaveAllContent}
              className="px-6 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-bold cursor-pointer"
            >
              고객센터 운영정보 저장
            </button>
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          MODAL: 제품 카테고리 관리 (Requirement 5 완벽 구현)
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h4 className="text-base font-black text-stone-900">제품 카테고리 관리</h4>
                <p className="text-[11px] text-stone-500">제품 분류 카테고리를 추가, 이름 변경, 순서 변경 및 노출 설정합니다.</p>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Category */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="새 카테고리명 입력 (예: 계절 한정 김치)"
                className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-stone-50"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newCatName.trim()) {
                    alert('카테고리 이름을 입력하세요.');
                    return;
                  }
                  const newCat: ProductCategoryItem = {
                    id: 'cat-' + Date.now(),
                    name: newCatName.trim(),
                    order: editableCats.length + 1,
                    visible: true
                  };
                  setEditableCats(prev => [...prev, newCat]);
                  setNewCatName('');
                }}
                className="px-4 py-2 rounded-xl bg-stone-800 text-white text-xs font-bold hover:bg-stone-900 cursor-pointer shrink-0"
              >
                추가
              </button>
            </div>

            {/* Categories List */}
            <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar pr-1">
              {editableCats.map((cat, idx) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-stone-200 bg-stone-50/60"
                >
                  <span className="w-6 text-center text-xs font-mono font-bold text-stone-400">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={cat.name}
                    onChange={(e) => {
                      const updated = [...editableCats];
                      updated[idx].name = e.target.value;
                      setEditableCats(updated);
                    }}
                    className="flex-1 px-2.5 py-1 text-xs font-bold border border-stone-300 rounded-lg bg-white"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...editableCats];
                        updated[idx].visible = !updated[idx].visible;
                        setEditableCats(updated);
                      }}
                      className={`p-1 rounded cursor-pointer ${cat.visible !== false ? 'text-emerald-600' : 'text-stone-300'}`}
                      title={cat.visible !== false ? '노출' : '숨김'}
                    >
                      {cat.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        const updated = [...editableCats];
                        const [moved] = updated.splice(idx, 1);
                        updated.splice(idx - 1, 0, moved);
                        setEditableCats(updated.map((c, i) => ({ ...c, order: i + 1 })));
                      }}
                      className="p-1 rounded text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer text-xs"
                      title="위로"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === editableCats.length - 1}
                      onClick={() => {
                        const updated = [...editableCats];
                        const [moved] = updated.splice(idx, 1);
                        updated.splice(idx + 1, 0, moved);
                        setEditableCats(updated.map((c, i) => ({ ...c, order: i + 1 })));
                      }}
                      className="p-1 rounded text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer text-xs"
                      title="아래로"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`'${cat.name}' 카테고리를 삭제하시겠습니까?`)) {
                          setEditableCats(prev => prev.filter((_, i) => i !== idx));
                        }
                      }}
                      className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                      title="삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleSaveCategories}
                className="px-5 py-2 rounded-xl bg-[#872D35] text-white text-xs font-bold hover:bg-[#6D242B] cursor-pointer"
              >
                카테고리 저장
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
