import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ProductItem, 
  ProductCategoryItem, 
  CompanySubpageItem, 
  HistoryItem, 
  ProcessStepItem, 
  WholesaleStepItem,
  ProductSpecItem,
  ProductBadgeItem,
  ProductFeatureCardItem
} from '../../types';
import { 
  getProductSpecItems, 
  getProductBadges, 
  getProductFeatureCards, 
  getBadgeColorClass, 
  renderBadgeIcon, 
  renderFeatureIcon 
} from '../../utils/productUtils';
import { uploadImageToStorage } from '../../lib/supabase';
import { SectionManager } from './SectionManager';
import { getDefaultPageSections, getDefaultProductSections, resolveAboutSections } from '../../data/defaultPageSections';
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
  CheckCircle2,
  Flame,
  Star,
  Zap,
  Undo2,
  Tag,
  Palette
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
  const [editingSpecId, setEditingSpecId] = useState<string | null>(null);
  const [undoSnapshot, setUndoSnapshot] = useState<{
    productId: string;
    prevProduct: ProductItem;
    label: string;
  } | null>(null);

  // Local form for general site content
  const [contentForm, setContentForm] = useState(state.content);
  const [isUploading, setIsUploading] = useState(false);
  const prevStateContentRef = useRef(state.content);

  // Sync content form when state changes (without clobbering unsaved fields if only pageSections changed)
  useEffect(() => {
    const prev = prevStateContentRef.current;
    if (prev !== state.content) {
      const onlyPageSectionsChanged =
        state.content.pageSections !== prev.pageSections &&
        Object.keys({ ...prev, ...state.content }).every(
          (key) => key === 'pageSections' || (prev as any)[key] === (state.content as any)[key]
        );

      if (onlyPageSectionsChanged) {
        setContentForm(cur => ({ ...cur, pageSections: state.content.pageSections }));
      } else {
        setContentForm(state.content);
      }
      prevStateContentRef.current = state.content;
    }
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
    const { pageSections: _preserveSavedSections, ...restContentForm } = contentForm;
    updateContent(restContentForm);
    if (contentForm.companySubpages) {
      updateCompanySubpages(contentForm.companySubpages);
    }
    showToast('상단 메뉴 콘텐츠 전체가 성공적으로 저장되었습니다.');
  };

  const handleImageUpload = async (
    fieldOrCallback: keyof typeof contentForm | ((url: string) => void),
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputEl = e.target;
    const file = inputEl.files?.[0];
    inputEl.value = '';
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

  // Dynamic Spec Item Handlers (preserving existing fields & values)
  const syncLegacyFieldsFromSpecs = (specs: ProductSpecItem[]): Partial<ProductItem> => {
    const patch: Partial<ProductItem> = {};
    const legacyKeys: Array<keyof ProductItem> = [
      'weight',
      'storage',
      'shelfLife',
      'ingredients',
      'origin',
      'packagingType',
      'minOrder',
      'deliveryInfo'
    ];
    legacyKeys.forEach((k) => {
      const found = specs.find(s => s.key === k);
      if (found) {
        (patch as any)[k] = found.value;
      }
    });
    return patch;
  };

  const handleSpecValueChange = (specId: string, newValue: string) => {
    if (!currentProduct) return;
    const curSpecs = getProductSpecItems(currentProduct);
    const nextSpecs = curSpecs.map(s => s.id === specId ? { ...s, value: newValue } : s);
    const legacyPatch = syncLegacyFieldsFromSpecs(nextSpecs);
    handleUpdateCurrentProduct({ ...legacyPatch, specItems: nextSpecs });
  };

  const handleSpecLabelChange = (specId: string, newLabel: string) => {
    if (!currentProduct) return;
    const curSpecs = getProductSpecItems(currentProduct);
    const nextSpecs = curSpecs.map(s => s.id === specId ? { ...s, label: newLabel } : s);
    handleUpdateCurrentProduct({ specItems: nextSpecs });
  };

  const handleToggleSpecVisible = (specId: string) => {
    if (!currentProduct) return;
    const curSpecs = getProductSpecItems(currentProduct);
    const nextSpecs = curSpecs.map(s => s.id === specId ? { ...s, visible: !s.visible } : s);
    handleUpdateCurrentProduct({ specItems: nextSpecs });
  };

  const handleMoveSpecItem = (idx: number, direction: 'up' | 'down') => {
    if (!currentProduct) return;
    const curSpecs = [...getProductSpecItems(currentProduct)];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= curSpecs.length) return;
    const [moved] = curSpecs.splice(idx, 1);
    curSpecs.splice(targetIdx, 0, moved);
    const reordered = curSpecs.map((s, i) => ({ ...s, order: i + 1 }));
    handleUpdateCurrentProduct({ specItems: reordered });
  };

  const handleDeleteSpecItem = (spec: ProductSpecItem) => {
    if (!currentProduct) return;
    if (!confirm(`'${spec.label || '항목'}'을(를) 정말 삭제하시겠습니까?\n(잠시 숨기려면 눈 모양 아이콘을 사용하세요.)`)) return;
    const prevSnapshot: ProductItem = JSON.parse(JSON.stringify(currentProduct));
    const curSpecs = getProductSpecItems(currentProduct);
    const nextSpecs = curSpecs
      .filter(s => s.id !== spec.id)
      .map((s, i) => ({ ...s, order: i + 1 }));
    handleUpdateCurrentProduct({ specItems: nextSpecs });
    setUndoSnapshot({
      productId: currentProduct.id,
      prevProduct: prevSnapshot,
      label: `스펙 항목 '${spec.label}'`
    });
  };

  const handleAddSpecItem = () => {
    if (!currentProduct) return;
    const curSpecs = getProductSpecItems(currentProduct);
    const newId = 'spec-' + Date.now();
    const newSpec: ProductSpecItem = {
      id: newId,
      key: 'custom',
      label: '새 규격 항목',
      value: '',
      visible: true,
      order: curSpecs.length + 1
    };
    handleUpdateCurrentProduct({ specItems: [...curSpecs, newSpec] });
    setEditingSpecId(newId);
  };

  // Multi-Badge Handlers
  const syncBadgesUpdate = (nextBadges: ProductBadgeItem[]) => {
    if (!currentProduct) return;
    const firstVisible = nextBadges.find(b => b.visible && b.text.trim());
    const popBadge = nextBadges.find(b => b.id === 'badge-popular');
    const recBadge = nextBadges.find(b => b.id === 'badge-recommended');
    handleUpdateCurrentProduct({
      badges: nextBadges,
      tag: firstVisible ? firstVisible.text : '',
      ...(popBadge ? { isPopular: popBadge.visible } : {}),
      ...(recBadge ? { isRecommended: recBadge.visible } : {})
    });
  };

  const handleAddBadge = () => {
    if (!currentProduct) return;
    const cur = getProductBadges(currentProduct);
    const next: ProductBadgeItem[] = [
      ...cur,
      {
        id: 'badge-' + Date.now(),
        text: '새 배지',
        visible: true,
        color: 'burgundy',
        icon: 'sparkles',
        order: cur.length + 1
      }
    ];
    syncBadgesUpdate(next);
  };

  const handleDeleteBadge = (badge: ProductBadgeItem) => {
    if (!currentProduct) return;
    if (!confirm(`'${badge.text || '배지'}' 배지를 삭제하시겠습니까?`)) return;
    const prevSnapshot: ProductItem = JSON.parse(JSON.stringify(currentProduct));
    const cur = getProductBadges(currentProduct);
    const next = cur
      .filter(b => b.id !== badge.id)
      .map((b, i) => ({ ...b, order: i + 1 }));
    syncBadgesUpdate(next);
    setUndoSnapshot({
      productId: currentProduct.id,
      prevProduct: prevSnapshot,
      label: `배지 '${badge.text}'`
    });
  };

  const handleMoveBadge = (idx: number, direction: 'up' | 'down') => {
    if (!currentProduct) return;
    const cur = [...getProductBadges(currentProduct)];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= cur.length) return;
    const [moved] = cur.splice(idx, 1);
    cur.splice(targetIdx, 0, moved);
    syncBadgesUpdate(cur.map((b, i) => ({ ...b, order: i + 1 })));
  };

  // Feature Card Handlers
  const handleAddFeatureCard = () => {
    if (!currentProduct) return;
    const cur = getProductFeatureCards(currentProduct);
    const next: ProductFeatureCardItem[] = [
      ...cur,
      {
        id: 'fc-' + Date.now(),
        title: '새 핵심 특징',
        desc: '특징 설명 입력',
        icon: 'Sparkles',
        visible: true,
        order: cur.length + 1
      }
    ];
    handleUpdateCurrentProduct({ featureCards: next });
  };

  const handleDeleteFeatureCard = (card: ProductFeatureCardItem) => {
    if (!currentProduct) return;
    if (!confirm(`'${card.title || '특징 카드'}' 카드를 삭제하시겠습니까?`)) return;
    const prevSnapshot: ProductItem = JSON.parse(JSON.stringify(currentProduct));
    const cur = getProductFeatureCards(currentProduct);
    const next = cur
      .filter(c => c.id !== card.id)
      .map((c, i) => ({ ...c, order: i + 1 }));
    handleUpdateCurrentProduct({ featureCards: next });
    setUndoSnapshot({
      productId: currentProduct.id,
      prevProduct: prevSnapshot,
      label: `특징 카드 '${card.title}'`
    });
  };

  const handleMoveFeatureCard = (idx: number, direction: 'up' | 'down') => {
    if (!currentProduct) return;
    const cur = [...getProductFeatureCards(currentProduct)];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= cur.length) return;
    const [moved] = cur.splice(idx, 1);
    cur.splice(targetIdx, 0, moved);
    handleUpdateCurrentProduct({ featureCards: cur.map((c, i) => ({ ...c, order: i + 1 })) });
  };

  const handleUndoProductChange = () => {
    if (!undoSnapshot) return;
    updateProduct(undoSnapshot.productId, undoSnapshot.prevProduct);
    showToast(`${undoSnapshot.label} 삭제를 실행 취소하여 복원했습니다.`);
    setUndoSnapshot(null);
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
                          disabled={idx === 0}
                          onClick={() => {
                            const updated = [...(contentForm.systemSteps || [])];
                            const [moved] = updated.splice(idx, 1);
                            updated.splice(idx - 1, 0, moved);
                            handleFieldChange('systemSteps', updated);
                          }}
                          className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer text-xs"
                          title="위로"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === (contentForm.systemSteps || []).length - 1}
                          onClick={() => {
                            const updated = [...(contentForm.systemSteps || [])];
                            const [moved] = updated.splice(idx, 1);
                            updated.splice(idx + 1, 0, moved);
                            handleFieldChange('systemSteps', updated);
                          }}
                          className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer text-xs"
                          title="아래로"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!confirm(`'${step.title}' 단계를 삭제하시겠습니까?`)) return;
                            const updated = (contentForm.systemSteps || []).filter((_, i) => i !== idx);
                            handleFieldChange('systemSteps', updated);
                          }}
                          className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                          title="삭제"
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
                            disabled={idx === 0}
                            onClick={() => {
                              const updated = [...(contentForm.permitsList || [])];
                              const [moved] = updated.splice(idx, 1);
                              updated.splice(idx - 1, 0, moved);
                              handleFieldChange('permitsList', updated);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer text-xs"
                            title="위로"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={idx === (contentForm.permitsList || []).length - 1}
                            onClick={() => {
                              const updated = [...(contentForm.permitsList || [])];
                              const [moved] = updated.splice(idx, 1);
                              updated.splice(idx + 1, 0, moved);
                              handleFieldChange('permitsList', updated);
                            }}
                            className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer text-xs"
                            title="아래로"
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!confirm(`'${cert.title}' 인허가 항목을 삭제하시겠습니까?`)) return;
                              const updated = (contentForm.permitsList || []).filter((_, i) => i !== idx);
                              handleFieldChange('permitsList', updated);
                            }}
                            className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                            title="삭제"
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
                sections={resolveAboutSections(contentForm.pageSections, currentSubpage.id)}
                fallbackSections={getDefaultPageSections(`about-${currentSubpage.id}`, contentForm)}
                onChange={(newSecs) => {
                  setContentForm(prev => ({
                    ...prev,
                    pageSections: {
                      ...(prev.pageSections || {}),
                      [`about-${currentSubpage.id}`]: newSecs,
                      [currentSubpage.id]: newSecs
                    }
                  }));
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
                      <span className="text-[11px] font-black text-[#872D35] uppercase tracking-wider block">
                        {currentProduct.category}
                      </span>
                      <h4 className="text-base font-black text-stone-900">
                        {currentProduct.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMoveProductOrder('up')}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold cursor-pointer"
                      title="노출 순서 위로"
                    >
                      ▲ 위로
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveProductOrder('down')}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-bold cursor-pointer"
                      title="노출 순서 아래로"
                    >
                      ▼ 아래로
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteCurrentProduct}
                      className="p-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 cursor-pointer"
                      title="제품 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Undo Bar when deleting specs / badges / cards */}
                {undoSnapshot && undoSnapshot.productId === currentProduct.id && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-amber-900">
                      {undoSnapshot.label}이(가) 삭제되었습니다. 실수로 삭제한 경우 복구할 수 있습니다.
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleUndoProductChange}
                        className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-black flex items-center gap-1 cursor-pointer"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>실행 취소</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUndoSnapshot(null)}
                        className="p-1 rounded text-amber-700 hover:bg-amber-100 cursor-pointer"
                        title="닫기"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

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

                  {/* 제품 한 줄 소개 문구 (부제목) & ⑬ 제품 배지 / 태그 관리 (모든 배지 개별 편집/추가/삭제/숨김/색상/순서) */}
                  <div className="space-y-3">
                    <div>
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

                    <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-[#872D35]" />
                          <span>⑬ 제품 이미지 배지 / 태그 관리 ({getProductBadges(currentProduct).length}개)</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAddBadge}
                          className="px-2.5 py-1 rounded-lg bg-[#872D35] hover:bg-[#6D242B] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>배지 추가</span>
                        </button>
                      </div>

                      {getProductBadges(currentProduct).length === 0 ? (
                        <p className="text-[11px] text-stone-400 text-center py-2">
                          등록된 배지가 없습니다. 상단 [+ 배지 추가] 버튼으로 새 배지를 추가할 수 있습니다.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {getProductBadges(currentProduct).map((badge, bIdx, arr) => (
                            <div
                              key={badge.id}
                              className={`flex flex-wrap items-center gap-2 p-2 rounded-xl border bg-white ${
                                badge.visible ? 'border-stone-200' : 'border-stone-200 opacity-60 bg-stone-50/70'
                              }`}
                            >
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shrink-0 ${getBadgeColorClass(badge.color)}`}
                              >
                                {renderBadgeIcon(badge.icon, 'w-3 h-3')}
                                <span>{badge.text || '미리보기'}</span>
                              </span>

                              <input
                                type="text"
                                value={badge.text}
                                onChange={(e) => {
                                  const next = arr.map(b => b.id === badge.id ? { ...b, text: e.target.value } : b);
                                  syncBadgesUpdate(next);
                                }}
                                placeholder="배지 문구 입력"
                                className="flex-1 min-w-[110px] px-2.5 py-1 rounded-lg border border-stone-200 text-xs font-bold text-stone-800 bg-white"
                              />

                              <select
                                value={badge.color || 'burgundy'}
                                onChange={(e) => {
                                  const next = arr.map(b => b.id === badge.id ? { ...b, color: e.target.value } : b);
                                  syncBadgesUpdate(next);
                                }}
                                className="px-2 py-1 rounded-lg border border-stone-200 text-[11px] bg-white font-semibold"
                                title="배지 색상"
                              >
                                <option value="burgundy">버건디</option>
                                <option value="amber">앰버(주황)</option>
                                <option value="emerald">에메랄드</option>
                                <option value="blue">블루</option>
                                <option value="purple">퍼플</option>
                                <option value="slate">슬레이트</option>
                                <option value="dark">다크브라운</option>
                              </select>

                              <select
                                value={badge.icon || 'none'}
                                onChange={(e) => {
                                  const next = arr.map(b => b.id === badge.id ? { ...b, icon: e.target.value } : b);
                                  syncBadgesUpdate(next);
                                }}
                                className="px-2 py-1 rounded-lg border border-stone-200 text-[11px] bg-white font-semibold"
                                title="배지 아이콘"
                              >
                                <option value="none">아이콘 없음</option>
                                <option value="flame">불꽃 (인기)</option>
                                <option value="award">어워드 (추천)</option>
                                <option value="sparkles">반짝임</option>
                                <option value="check">체크</option>
                                <option value="shield">방패 (안전)</option>
                                <option value="star">별표</option>
                                <option value="zap">번개</option>
                              </select>

                              <div className="flex items-center gap-0.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = arr.map(b => b.id === badge.id ? { ...b, visible: !b.visible } : b);
                                    syncBadgesUpdate(next);
                                  }}
                                  className={`p-1 rounded cursor-pointer ${badge.visible ? 'text-emerald-600 hover:bg-emerald-50' : 'text-stone-400 hover:bg-stone-100'}`}
                                  title={badge.visible ? '표시 중 (클릭 시 숨김)' : '숨김 상태 (클릭 시 표시)'}
                                >
                                  {badge.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  disabled={bIdx === 0}
                                  onClick={() => handleMoveBadge(bIdx, 'up')}
                                  className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-20 cursor-pointer text-[11px]"
                                  title="앞으로 이동"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={bIdx === arr.length - 1}
                                  onClick={() => handleMoveBadge(bIdx, 'down')}
                                  className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-20 cursor-pointer text-[11px]"
                                  title="뒤로 이동"
                                >
                                  ▼
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBadge(badge)}
                                  className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                  title="배지 삭제"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
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

                  {/* ⑧~⑪ 기존 제품 정보 입력칸 개선 (항목명 수정 · 표시/숨김 · 순서변경 · 삭제 · 항목 추가) */}
                  <div className="pt-3 border-t border-stone-100 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-black text-stone-800 block">
                          ⑧~⑪ 제품 규격 · 보관 · 원재료 및 상세 정보 항목
                        </span>
                        <span className="text-[11px] text-stone-400">
                          항목명 옆 연필(✏️)로 이름 수정, 눈(👁️)으로 숨김 시 입력값은 유지되며 홈페이지에서 해당 줄만 가려집니다.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSpecItem}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-black text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>항목 추가</span>
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {getProductSpecItems(currentProduct).map((spec, sIdx, specArr) => {
                        const isEditingLabel = editingSpecId === spec.id;
                        const isMultiline = spec.key === 'ingredients' || (spec.value && spec.value.includes('\n')) || (spec.value && spec.value.length > 65);

                        return (
                          <div
                            key={spec.id}
                            className={`p-3 rounded-xl border transition-all ${
                              spec.visible
                                ? 'bg-white border-stone-200'
                                : 'bg-stone-50 border-stone-200/80 opacity-65'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              {/* Label or Inline Label Input */}
                              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                {isEditingLabel ? (
                                  <div className="flex items-center gap-1 flex-1 max-w-xs">
                                    <input
                                      type="text"
                                      autoFocus
                                      value={spec.label}
                                      onChange={(e) => handleSpecLabelChange(spec.id, e.target.value)}
                                      onBlur={() => setEditingSpecId(null)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === 'Escape') {
                                          e.preventDefault();
                                          setEditingSpecId(null);
                                        }
                                      }}
                                      placeholder="항목명 입력"
                                      className="flex-1 px-2 py-0.5 text-xs font-bold border border-[#872D35] rounded-md bg-white focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        setEditingSpecId(null);
                                      }}
                                      className="p-1 rounded bg-[#872D35] text-white cursor-pointer"
                                      title="항목명 확정"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <label className="text-xs font-bold text-stone-700 truncate">
                                      {spec.label}
                                    </label>
                                    {!spec.visible && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-600 shrink-0">
                                        숨김됨
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Inline Action Icons: ✏️ 👁️ ▲ ▼ 🗑️ */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setEditingSpecId(isEditingLabel ? null : spec.id)}
                                  className={`p-1 rounded hover:bg-stone-100 cursor-pointer ${
                                    isEditingLabel ? 'text-[#872D35] bg-[#872D35]/10' : 'text-stone-400 hover:text-[#872D35]'
                                  }`}
                                  title="항목명 수정"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSpecVisible(spec.id)}
                                  className={`p-1 rounded cursor-pointer ${
                                    spec.visible
                                      ? 'text-emerald-600 hover:bg-emerald-50'
                                      : 'text-stone-400 hover:bg-stone-200'
                                  }`}
                                  title={spec.visible ? '홈페이지에 표시 중 (클릭 시 숨김)' : '숨김 상태 (클릭 시 다시 표시)'}
                                >
                                  {spec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  disabled={sIdx === 0}
                                  onClick={() => handleMoveSpecItem(sIdx, 'up')}
                                  className="p-1 rounded text-stone-400 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-20 cursor-pointer text-[11px]"
                                  title="위로 이동"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={sIdx === specArr.length - 1}
                                  onClick={() => handleMoveSpecItem(sIdx, 'down')}
                                  className="p-1 rounded text-stone-400 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-20 cursor-pointer text-[11px]"
                                  title="아래로 이동"
                                >
                                  ▼
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSpecItem(spec)}
                                  className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                  title="항목 삭제"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {isMultiline ? (
                              <textarea
                                rows={2}
                                value={spec.value}
                                onChange={(e) => handleSpecValueChange(spec.id, e.target.value)}
                                placeholder={`${spec.label} 내용을 입력하세요`}
                                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-semibold"
                              />
                            ) : (
                              <input
                                type="text"
                                value={spec.value}
                                onChange={(e) => handleSpecValueChange(spec.id, e.target.value)}
                                placeholder={`${spec.label} 내용을 입력하세요`}
                                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white font-semibold"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddSpecItem}
                      className="w-full py-2 rounded-xl border border-dashed border-stone-300 hover:border-[#872D35] text-stone-600 hover:text-[#872D35] bg-stone-50/70 hover:bg-[#872D35]/5 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>항목 추가</span>
                    </button>
                  </div>

                  {/* 제품 대표 이미지 하단 특징 카드 관리 */}
                  <div className="pt-3 border-t border-stone-100 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-black text-stone-800 block">
                          제품 대표 이미지 하단 특징 카드 ({getProductFeatureCards(currentProduct).length}개)
                        </span>
                        <span className="text-[11px] text-stone-400">
                          상세페이지 대표 이미지 아래 표시되는 강점 카드의 아이콘·제목·설명·표시여부·개수를 관리합니다.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddFeatureCard}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-black text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>카드 추가</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {getProductFeatureCards(currentProduct).map((card, cIdx, cardArr) => (
                        <div
                          key={card.id}
                          className={`p-3 rounded-xl border space-y-2 ${
                            card.visible ? 'bg-stone-50/60 border-stone-200' : 'bg-stone-100/70 border-stone-200 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="p-1 rounded-md bg-white border border-stone-200">
                                {renderFeatureIcon(card.icon, 'w-3.5 h-3.5 text-[#872D35]')}
                              </span>
                              <select
                                value={card.icon || 'Sparkles'}
                                onChange={(e) => {
                                  const next = cardArr.map(c => c.id === card.id ? { ...c, icon: e.target.value } : c);
                                  handleUpdateCurrentProduct({ featureCards: next });
                                }}
                                className="px-2 py-1 rounded-lg border border-stone-200 text-[11px] bg-white font-semibold"
                              >
                                <option value="Sparkles">반짝임(특허)</option>
                                <option value="CheckCircle2">체크원(원물)</option>
                                <option value="ShieldCheck">안전방패(위생)</option>
                                <option value="Truck">트럭(배송)</option>
                                <option value="Award">어워드(인증)</option>
                                <option value="Flame">불꽃(인기)</option>
                                <option value="Clock">시계(신선)</option>
                                <option value="Package">박스(포장)</option>
                                <option value="Layers">레이어(구성)</option>
                                <option value="Thermometer">온도계(냉장)</option>
                              </select>
                            </div>

                            <div className="flex items-center gap-0.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  const next = cardArr.map(c => c.id === card.id ? { ...c, visible: !c.visible } : c);
                                  handleUpdateCurrentProduct({ featureCards: next });
                                }}
                                className={`p-1 rounded cursor-pointer ${card.visible ? 'text-emerald-600' : 'text-stone-400'}`}
                                title={card.visible ? '표시 중' : '숨김 상태'}
                              >
                                {card.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                disabled={cIdx === 0}
                                onClick={() => handleMoveFeatureCard(cIdx, 'up')}
                                className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20 cursor-pointer text-[11px]"
                              >
                                ▲
                              </button>
                              <button
                                type="button"
                                disabled={cIdx === cardArr.length - 1}
                                onClick={() => handleMoveFeatureCard(cIdx, 'down')}
                                className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20 cursor-pointer text-[11px]"
                              >
                                ▼
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteFeatureCard(card)}
                                className="p-1 text-stone-400 hover:text-red-600 cursor-pointer"
                                title="카드 삭제"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={card.title}
                              onChange={(e) => {
                                const next = cardArr.map(c => c.id === card.id ? { ...c, title: e.target.value } : c);
                                handleUpdateCurrentProduct({ featureCards: next });
                              }}
                              placeholder="카드 제목"
                              className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs font-bold bg-white"
                            />
                            <input
                              type="text"
                              value={card.desc}
                              onChange={(e) => {
                                const next = cardArr.map(c => c.id === card.id ? { ...c, desc: e.target.value } : c);
                                handleUpdateCurrentProduct({ featureCards: next });
                              }}
                              placeholder="카드 부설명"
                              className="px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ⑫ 납품 관련 안내 & ⑭ 제품 버튼 문구 + 상세 고정 문구 */}
                  <div className="space-y-3 pt-3 border-t border-stone-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                    {/* 도매 박스 & 보조 버튼 & 하단 안내 바 세부 문구 */}
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black text-stone-700">
                          상세페이지 도매단가 박스 · 버튼 · 하단 안내 문구 설정
                        </span>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-stone-600">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentProduct.wholesalePriceBoxVisible !== false}
                              onChange={(e) => handleUpdateCurrentProduct({ wholesalePriceBoxVisible: e.target.checked })}
                              className="rounded text-[#872D35]"
                            />
                            <span>도매박스 표시</span>
                          </label>
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentProduct.detailNoticeVisible !== false}
                              onChange={(e) => handleUpdateCurrentProduct({ detailNoticeVisible: e.target.checked })}
                              className="rounded text-[#872D35]"
                            />
                            <span>하단 안내바 표시</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-1">도매 박스 상단 제목</label>
                          <input
                            type="text"
                            value={currentProduct.bulkPriceTitle ?? '외식업 사업자 전용 도매 납품가'}
                            onChange={(e) => handleUpdateCurrentProduct({ bulkPriceTitle: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-1">도매 박스 우측 배지</label>
                          <input
                            type="text"
                            value={currentProduct.bulkPriceBadge ?? 'B2B 특가 지원'}
                            onChange={(e) => handleUpdateCurrentProduct({ bulkPriceBadge: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-1">도매 단가 강조 문구</label>
                          <input
                            type="text"
                            value={currentProduct.bulkPriceHeading ?? '1:1 맞춤 견적 단가 적용'}
                            onChange={(e) => handleUpdateCurrentProduct({ bulkPriceHeading: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-1">도매 박스 부제</label>
                          <input
                            type="text"
                            value={currentProduct.bulkPriceSubtitle ?? '(월 발주량에 따른 계단식 할인)'}
                            onChange={(e) => handleUpdateCurrentProduct({ bulkPriceSubtitle: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-1">보조 CTA 버튼 문구</label>
                          <input
                            type="text"
                            value={currentProduct.secondaryButtonText ?? '대량 납품 견적서 요청'}
                            onChange={(e) => handleUpdateCurrentProduct({ secondaryButtonText: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-1">하단 무료샘플 안내 문구</label>
                          <input
                            type="text"
                            value={currentProduct.detailNoticeText ?? '사업자등록증 소지 외식업 대표님께는 택배비까지 전액 무료로 샘플을 발송합니다.'}
                            onChange={(e) => handleUpdateCurrentProduct({ detailNoticeText: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-stone-500 mb-1">하단 안내 전화번호</label>
                          <input
                            type="text"
                            value={currentProduct.detailNoticePhone ?? state.content.phone ?? '043-532-8890'}
                            onChange={(e) => handleUpdateCurrentProduct({ detailNoticePhone: e.target.value })}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-stone-200 text-xs bg-white font-mono"
                          />
                        </div>
                      </div>
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
                          {(() => {
                            const visibleBadges = getProductBadges(currentProduct).filter(b => b.visible && b.text?.trim());
                            if (visibleBadges.length === 0) return null;
                            return (
                              <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                                {visibleBadges.map(b => (
                                  <span
                                    key={b.id}
                                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-xs flex items-center gap-1 ${getBadgeColorClass(b.color)}`}
                                  >
                                    {renderBadgeIcon(b.icon, 'w-3 h-3')}
                                    <span>{b.text}</span>
                                  </span>
                                ))}
                              </div>
                            );
                          })()}
                        </div>
                        <div className="p-4 space-y-2">
                          <span className="text-[10px] font-bold text-[#872D35]">{currentProduct.category}</span>
                          <h5 className="text-base font-black text-stone-900 leading-snug">{currentProduct.name}</h5>
                          <p className="text-xs text-stone-500 line-clamp-2">{currentProduct.description}</p>
                          <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                            {(() => {
                              const weightSpec = getProductSpecItems(currentProduct).find(s => s.key === 'weight' && s.visible && s.value?.trim());
                              return <span>{weightSpec ? weightSpec.value : ''}</span>;
                            })()}
                            <span className="font-bold text-[#872D35] truncate max-w-[180px]">{currentProduct.bulkPriceGuide}</span>
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
                            <div className="flex flex-wrap gap-1 mb-1">
                              {getProductBadges(currentProduct)
                                .filter(b => b.visible && b.text?.trim())
                                .map(b => (
                                  <span key={b.id} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getBadgeColorClass(b.color)}`}>
                                    {b.text}
                                  </span>
                                ))}
                            </div>
                            <h4 className="text-sm font-black text-stone-900">{currentProduct.name}</h4>
                            <p className="text-[11px] text-stone-500">{currentProduct.subtitle}</p>
                          </div>
                        </div>
                        <div className="p-2.5 bg-stone-50 rounded-lg text-stone-600">
                          {currentProduct.description}
                        </div>
                        {(() => {
                          const visibleSpecs = getProductSpecItems(currentProduct).filter(s => s.visible && s.value?.trim());
                          if (visibleSpecs.length === 0) return null;
                          return (
                            <div className="border border-stone-200 rounded-lg divide-y divide-stone-100">
                              <div className="grid grid-cols-3 p-2 font-bold bg-stone-50 text-stone-700">
                                <span>규격 항목</span>
                                <span className="col-span-2">상세 내역</span>
                              </div>
                              {visibleSpecs.map((spec) => (
                                <div key={spec.id} className="grid grid-cols-3 p-2">
                                  <span className="font-semibold text-stone-500">{spec.label}</span>
                                  <span className="col-span-2">{spec.value}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
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

              {/* 제품소개 전체 목록 페이지 상단/하단 고정 문구 관리 */}
              <div className="pt-4 border-t border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-black text-stone-800">제품소개 전체 목록 페이지 상단 배너 & 하단 안내 문구</h5>
                    <p className="text-[11px] text-stone-400">제품소개(/products) 페이지의 헤더 및 하단 OEM/PB 상담 배너 문구를 수정합니다.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAllContent}
                    className="px-4 py-2 rounded-xl bg-[#872D35] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>문구 저장</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">상단 배너 영문 배지</label>
                    <input
                      type="text"
                      value={contentForm.productsPageBadge ?? 'FOOD HOME PRODUCTS CATALOG'}
                      onChange={(e) => handleFieldChange('productsPageBadge', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">상단 배너 제목</label>
                    <input
                      type="text"
                      value={contentForm.productsPageTitle ?? 'FOOD HOME 제품소개'}
                      onChange={(e) => handleFieldChange('productsPageTitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">상단 배너 설명 문구</label>
                    <input
                      type="text"
                      value={contentForm.productsPageSubtitle ?? '물 생김 없는 특허 수분제어와 30년 전통 비법 양념의 명품 보쌈김치 라인업'}
                      onChange={(e) => handleFieldChange('productsPageSubtitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">목록 우측 원료 강조 문구</label>
                    <input
                      type="text"
                      value={contentForm.productsPageNotice ?? '100% 국산 농산물 원료 사용'}
                      onChange={(e) => handleFieldChange('productsPageNotice', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">하단 OEM 배너 제목</label>
                    <input
                      type="text"
                      value={contentForm.productsBannerTitle ?? '프랜차이즈 및 대량 납품 맞춤형 OEM/PB 상담'}
                      onChange={(e) => handleFieldChange('productsBannerTitle', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">하단 OEM 배너 설명 & 버튼명</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={contentForm.productsBannerDesc ?? '매장별 맞춤 염도, 단맛 조절, 전용 라벨링 포장 및 전국 직송 물류 견적을 1:1 전담 매니저가 친절하게 상담해 드립니다.'}
                        onChange={(e) => handleFieldChange('productsBannerDesc', e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                      />
                      <input
                        type="text"
                        value={contentForm.productsBannerBtnText ?? '대량 납품 견적서 요청하기'}
                        onChange={(e) => handleFieldChange('productsBannerBtnText', e.target.value)}
                        className="w-40 px-2.5 py-2 rounded-xl border border-stone-200 text-xs font-bold bg-white"
                      />
                    </div>
                  </div>
                </div>
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
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-black text-stone-800">제조 상세 공정 단계 ({(contentForm.processSteps || []).length}단계)</h5>
              <button
                type="button"
                onClick={() => {
                  const cur = contentForm.processSteps || [];
                  const newStep: ProcessStepItem = {
                    step: cur.length + 1,
                    title: '새 제조 공정 단계',
                    desc: '상세 공정 설명을 입력하세요.',
                    imageUrl: './images/facility_cleanroom.jpg',
                    badge: '품질 관리'
                  };
                  handleFieldChange('processSteps', [...cur, newStep]);
                }}
                className="px-3 py-1 rounded-lg bg-stone-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>단계 추가</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(contentForm.processSteps || []).map((step, idx, arr) => (
                <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-[#872D35]">STEP 0{idx + 1}</span>
                    <div className="flex items-center gap-1">
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
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const updated = [...arr];
                          const [moved] = updated.splice(idx, 1);
                          updated.splice(idx - 1, 0, moved);
                          handleFieldChange('processSteps', updated.map((s, i) => ({ ...s, step: i + 1 })));
                        }}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20 cursor-pointer text-[11px]"
                        title="앞으로"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === arr.length - 1}
                        onClick={() => {
                          const updated = [...arr];
                          const [moved] = updated.splice(idx, 1);
                          updated.splice(idx + 1, 0, moved);
                          handleFieldChange('processSteps', updated.map((s, i) => ({ ...s, step: i + 1 })));
                        }}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20 cursor-pointer text-[11px]"
                        title="뒤로"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm(`'${step.title}' 공정 단계를 삭제하시겠습니까?`)) return;
                          const updated = arr.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 }));
                          handleFieldChange('processSteps', updated);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-black text-stone-800">납품 및 정기 발주 프로세스 ({(contentForm.deliverySteps || []).length}단계)</h5>
              <button
                type="button"
                onClick={() => {
                  const cur = contentForm.deliverySteps || [];
                  const newStep: WholesaleStepItem = {
                    step: cur.length + 1,
                    title: '새 납품 안내 단계',
                    desc: '단계 설명을 입력하세요.'
                  };
                  handleFieldChange('deliverySteps', [...cur, newStep]);
                }}
                className="px-3 py-1 rounded-lg bg-stone-800 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>단계 추가</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(contentForm.deliverySteps || []).map((step, idx, arr) => (
                <div key={idx} className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#872D35]">STEP 0{idx + 1}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => {
                          const updated = [...arr];
                          const [moved] = updated.splice(idx, 1);
                          updated.splice(idx - 1, 0, moved);
                          handleFieldChange('deliverySteps', updated.map((s, i) => ({ ...s, step: i + 1 })));
                        }}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20 cursor-pointer text-[11px]"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === arr.length - 1}
                        onClick={() => {
                          const updated = [...arr];
                          const [moved] = updated.splice(idx, 1);
                          updated.splice(idx + 1, 0, moved);
                          handleFieldChange('deliverySteps', updated.map((s, i) => ({ ...s, step: i + 1 })));
                        }}
                        className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20 cursor-pointer text-[11px]"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm(`'${step.title}' 단계를 삭제하시겠습니까?`)) return;
                          const updated = arr.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step: i + 1 }));
                          handleFieldChange('deliverySteps', updated);
                        }}
                        className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
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

          {/* 공지사항 & FAQ 페이지 상단 배너 문구 */}
          <div className="pt-4 border-t border-stone-100 space-y-3">
            <h5 className="text-xs font-black text-stone-800">공지사항 · FAQ 페이지 상단 배너 문구</h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">공지사항 영문 배지</label>
                <input
                  type="text"
                  value={contentForm.noticePageBadge ?? 'FOOD HOME NOTICE & NEWS'}
                  onChange={(e) => handleFieldChange('noticePageBadge', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">공지사항 페이지 제목</label>
                <input
                  type="text"
                  value={contentForm.noticePageTitle ?? '푸드홈 공지사항'}
                  onChange={(e) => handleFieldChange('noticePageTitle', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">공지사항 페이지 설명</label>
                <input
                  type="text"
                  value={contentForm.noticePageSubtitle ?? '푸드홈의 주요 생산 설비 소식, 납품 단가 정책, 물류 일정 및 중요 안내를 전해드립니다.'}
                  onChange={(e) => handleFieldChange('noticePageSubtitle', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">FAQ 영문 배지</label>
                <input
                  type="text"
                  value={contentForm.faqPageBadge ?? 'CUSTOMER SUPPORT FAQ'}
                  onChange={(e) => handleFieldChange('faqPageBadge', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">FAQ 페이지 제목</label>
                <input
                  type="text"
                  value={contentForm.faqPageTitle ?? '자주하는 질문 (FAQ)'}
                  onChange={(e) => handleFieldChange('faqPageTitle', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">FAQ 페이지 설명</label>
                <input
                  type="text"
                  value={contentForm.faqPageSubtitle ?? '외식업 대표님들께서 가장 많이 문의하시는 무료 샘플 신청, 대량 발주, 물류 및 보관에 대한 질문과 답변입니다.'}
                  onChange={(e) => handleFieldChange('faqPageSubtitle', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                />
              </div>
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
