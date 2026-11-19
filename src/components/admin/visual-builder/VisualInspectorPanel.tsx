import React, { useState } from 'react';
import { 
  ProductItem, 
  CustomSectionItem, 
  ProductFeatureCard, 
  SiteContent 
} from '../../../types';
import { SelectedElement } from './types';
import { uploadImageToStorage } from '../../../lib/supabase';
import { useApp } from '../../../context/AppContext';
import { 
  X, 
  Sparkles, 
  Trash2, 
  Plus, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  Upload, 
  Image as ImageIcon, 
  Check, 
  Sliders, 
  Eye, 
  EyeOff, 
  Palette, 
  Type, 
  CreditCard, 
  Package, 
  Building2, 
  Award, 
  Flame, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Thermometer, 
  Store, 
  Phone, 
  Info, 
  Layers, 
  Star,
  ExternalLink,
  PenTool
} from 'lucide-react';

interface VisualInspectorPanelProps {
  selectedElement: SelectedElement | null;
  onClearSelection: () => void;
  product?: ProductItem;
  onUpdateProduct?: (productId: string, updates: Partial<ProductItem>) => void;
  section?: CustomSectionItem;
  onUpdateSection?: (sectionId: string, updates: Partial<CustomSectionItem>) => void;
  content: SiteContent;
  onUpdateContent: (updates: Partial<SiteContent>) => void;
}

const AVAILABLE_ICONS: Array<{ id: string; label: string; icon: any }> = [
  { id: 'Sparkles', label: '특허 / 반짝임', icon: Sparkles },
  { id: 'CheckCircle2', label: '체크 / 국산', icon: CheckCircle2 },
  { id: 'ShieldCheck', label: 'HACCP / 안심', icon: ShieldCheck },
  { id: 'Truck', label: '콜드체인 / 배송', icon: Truck },
  { id: 'Award', label: '수상 / 품질', icon: Award },
  { id: 'Flame', label: '인기 / 직화', icon: Flame },
  { id: 'Clock', label: '당일 / 시간', icon: Clock },
  { id: 'Thermometer', label: '신선 온도', icon: Thermometer },
  { id: 'Package', label: '포장 / 벌크', icon: Package },
  { id: 'Store', label: '매장 / 납품', icon: Store },
  { id: 'Phone', label: '전담 상담', icon: Phone },
  { id: 'Star', label: '별점 / 만족', icon: Star },
  { id: 'Layers', label: '공정 / 층', icon: Layers },
  { id: 'Building2', label: '공장 / 설비', icon: Building2 }
];

export const VisualInspectorPanel: React.FC<VisualInspectorPanelProps> = ({
  selectedElement,
  onClearSelection,
  product,
  onUpdateProduct,
  section,
  onUpdateSection,
  content,
  onUpdateContent
}) => {
  const { showToast } = useApp();
  const [isUploading, setIsUploading] = useState(false);

  // Helper for uploading image file (Supabase Storage first, optimized fallback on error)
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const folder = product ? 'products' : 'sections';
      const res = await uploadImageToStorage(file, folder);
      if (res?.url) {
        onSuccess(res.url);
        if (res.warning) {
          showToast(res.warning);
        }
      } else if (res?.error) {
        showToast(res.error);
      }
    } catch {
      showToast('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // If nothing is selected, show friendly guide
  if (!selectedElement || selectedElement.type === 'none') {
    return (
      <div className="w-80 bg-white border-l border-stone-200 flex flex-col h-full shrink-0 p-5 overflow-y-auto">
        <div className="text-center py-12 px-2">
          <div className="w-14 h-14 rounded-2xl bg-[#872D35]/10 text-[#872D35] flex items-center justify-center mx-auto mb-4">
            <Sliders className="w-7 h-7" />
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-stone-900 mb-2">
            요소 상세 설정 (인스펙터)
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed mb-6">
            가운데 화면에서 수정하고 싶은 <strong>제품명, 이미지, 특징 카드, 텍스트, 버튼, 또는 섹션</strong>을 마우스로 직접 클릭해 보세요.
          </p>

          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-left space-y-2 text-xs text-stone-600">
            <div className="font-bold text-stone-800 text-[11px] mb-1">💡 빠른 팁:</div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#872D35]" />
              <span>화면 위로 마우스를 올리면 테두리가 표시됩니다.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#872D35]" />
              <span>클릭하면 해당 항목의 설정창이 바로 열립니다.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#872D35]" />
              <span>섹션 위의 [수정/복제/숨김/삭제] 버튼을 활용하세요.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-84 bg-white border-l border-stone-200 flex flex-col h-full shrink-0 overflow-hidden shadow-lg animate-in slide-in-from-right duration-200">
      
      {/* Inspector Header */}
      <div className="p-4 bg-[#2A2020] text-white flex items-center justify-between shrink-0 border-b border-[#3D2E2E]">
        <div className="flex items-center gap-2 truncate">
          <span className="p-1 rounded bg-[#872D35] text-white">
            <Sliders className="w-3.5 h-3.5" />
          </span>
          <div className="truncate">
            <h4 className="font-extrabold text-xs truncate">
              {selectedElement.title}
            </h4>
            <span className="text-[10px] text-stone-400 block font-mono">
              TYPE: {selectedElement.type}
            </span>
          </div>
        </div>

        <button
          onClick={onClearSelection}
          className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          title="선택 해제"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Inspector Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-stone-700">

        {/* 1. PRODUCT FEATURE CARDS INSPECTOR */}
        {selectedElement.type === 'product_feature_cards' && product && onUpdateProduct && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <h5 className="font-extrabold text-xs text-stone-900">제품 특징 카드 관리</h5>
                <p className="text-[11px] text-stone-500">
                  대표 이미지 하단 4개(또는 N개) 특징 카드
                </p>
              </div>
              <button
                onClick={() => {
                  const currentCards: ProductFeatureCard[] = product.featureCards || [
                    { id: 'pfc-1', icon: 'Sparkles', title: '특허 수분제어', desc: '물 생김 제로', visible: true },
                    { id: 'pfc-2', icon: 'CheckCircle2', title: '100% 국산 농산물', desc: '산지 계약재배', visible: true },
                    { id: 'pfc-3', icon: 'ShieldCheck', title: '위생 안심 공정', desc: 'HACCP 스마트팩토리', visible: true },
                    { id: 'pfc-4', icon: 'Truck', title: '전국 콜드체인', desc: '0~5℃ 익일 직배송', visible: true },
                  ];
                  const newCard: ProductFeatureCard = {
                    id: `pfc-${Date.now()}`,
                    icon: 'Sparkles',
                    title: '새로운 특징',
                    desc: '상세 설명을 입력하세요',
                    visible: true
                  };
                  onUpdateProduct(product.id, {
                    featureCards: [...currentCards, newCard]
                  });
                }}
                className="px-2.5 py-1 rounded-lg bg-[#872D35] text-white font-bold text-[11px] flex items-center gap-1 hover:bg-[#6D242B] transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>카드 추가</span>
              </button>
            </div>

            {/* Cards List */}
            {(() => {
              const cards: ProductFeatureCard[] = product.featureCards || [
                { id: 'pfc-1', icon: 'Sparkles', title: '특허 수분제어', desc: '물 생김 제로', visible: true },
                { id: 'pfc-2', icon: 'CheckCircle2', title: '100% 국산 농산물', desc: '산지 계약재배', visible: true },
                { id: 'pfc-3', icon: 'ShieldCheck', title: '위생 안심 공정', desc: 'HACCP 스마트팩토리', visible: true },
                { id: 'pfc-4', icon: 'Truck', title: '전국 콜드체인', desc: '0~5℃ 익일 직배송', visible: true },
              ];

              const updateCard = (index: number, updates: Partial<ProductFeatureCard>) => {
                const next = [...cards];
                next[index] = { ...next[index], ...updates };
                onUpdateProduct(product.id, { featureCards: next });
              };

              const deleteCard = (index: number) => {
                if (confirm('이 특징 카드를 삭제하시겠습니까?')) {
                  const next = cards.filter((_, i) => i !== index);
                  onUpdateProduct(product.id, { featureCards: next });
                }
              };

              const duplicateCard = (index: number) => {
                const copyCard = { ...cards[index], id: `pfc-${Date.now()}` };
                const next = [...cards];
                next.splice(index + 1, 0, copyCard);
                onUpdateProduct(product.id, { featureCards: next });
              };

              const moveCard = (index: number, dir: 'up' | 'down') => {
                if ((dir === 'up' && index === 0) || (dir === 'down' && index === cards.length - 1)) return;
                const target = dir === 'up' ? index - 1 : index + 1;
                const next = [...cards];
                const [moved] = next.splice(index, 1);
                next.splice(target, 0, moved);
                onUpdateProduct(product.id, { featureCards: next });
              };

              return (
                <div className="space-y-3">
                  {cards.map((card, idx) => (
                    <div 
                      key={card.id || idx}
                      className={`p-3 rounded-xl border transition-all ${
                        card.visible === false ? 'opacity-60 bg-stone-100 border-stone-300' : 'bg-stone-50 border-stone-200'
                      }`}
                    >
                      {/* Card Top Actions */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-extrabold text-[11px] text-stone-800">
                          카드 #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveCard(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-stone-200 text-stone-500 disabled:opacity-30 cursor-pointer"
                            title="위로 이동"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveCard(idx, 'down')}
                            disabled={idx === cards.length - 1}
                            className="p-1 rounded hover:bg-stone-200 text-stone-500 disabled:opacity-30 cursor-pointer"
                            title="아래로 이동"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => updateCard(idx, { visible: card.visible === false ? true : false })}
                            className="p-1 rounded hover:bg-stone-200 text-stone-500 cursor-pointer"
                            title={card.visible === false ? '표시하기' : '숨김'}
                          >
                            {card.visible === false ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => duplicateCard(idx)}
                            className="p-1 rounded hover:bg-stone-200 text-stone-500 cursor-pointer"
                            title="복제"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteCard(idx)}
                            className="p-1 rounded hover:bg-red-50 text-red-500 cursor-pointer"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Desc */}
                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">카드 제목</label>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => updateCard(idx, { title: e.target.value })}
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-stone-200 bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block mb-0.5">카드 부제목/설명</label>
                          <input
                            type="text"
                            value={card.desc}
                            onChange={(e) => updateCard(idx, { desc: e.target.value })}
                            className="w-full px-2.5 py-1 text-xs rounded-lg border border-stone-200 bg-white"
                          />
                        </div>

                        {/* Icon Selection */}
                        <div>
                          <label className="text-[10px] font-bold text-stone-500 block mb-1">아이콘 선택</label>
                          <select
                            value={card.icon || 'Sparkles'}
                            onChange={(e) => updateCard(idx, { icon: e.target.value })}
                            className="w-full px-2 py-1 text-xs rounded-lg border border-stone-200 bg-white"
                          >
                            {AVAILABLE_ICONS.map((ico) => (
                              <option key={ico.id} value={ico.id}>
                                {ico.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* 2. PRODUCT INFO (TITLE / SUBTITLE / CATEGORY) */}
        {(selectedElement.type === 'product_info' || selectedElement.type === 'product_badges') && product && onUpdateProduct && (
          <div className="space-y-4">
            <h5 className="font-extrabold text-xs text-stone-900 pb-2 border-b border-stone-200">
              제품 기본 정보 및 배지 설정
            </h5>

            <div>
              <label className="font-bold text-[11px] text-stone-600 block mb-1">제품명</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => onUpdateProduct(product.id, { name: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white font-bold focus:border-[#872D35]"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-600 block mb-1">서브 타이틀 / 한 줄 설명</label>
              <input
                type="text"
                value={product.subtitle || ''}
                onChange={(e) => onUpdateProduct(product.id, { subtitle: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-600 block mb-1">카테고리</label>
              <input
                type="text"
                value={product.category}
                onChange={(e) => onUpdateProduct(product.id, { category: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-600 block mb-1">대표 배지 태그 (예: BEST B2B 1위)</label>
              <input
                type="text"
                value={product.tag || ''}
                onChange={(e) => onUpdateProduct(product.id, { tag: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!product.isPopular}
                  onChange={(e) => onUpdateProduct(product.id, { isPopular: e.target.checked })}
                  className="rounded text-[#872D35]"
                />
                <span className="font-bold text-stone-700 text-xs">🔥 인기 납품</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-stone-50 border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!product.isRecommended}
                  onChange={(e) => onUpdateProduct(product.id, { isRecommended: e.target.checked })}
                  className="rounded text-[#872D35]"
                />
                <span className="font-bold text-stone-700 text-xs">🎖️ 추천 상품</span>
              </label>
            </div>
          </div>
        )}

        {/* 3. PRODUCT IMAGE INSPECTOR */}
        {selectedElement.type === 'product_image' && product && onUpdateProduct && (
          <div className="space-y-4">
            <h5 className="font-extrabold text-xs text-stone-900 pb-2 border-b border-stone-200">
              제품 대표 이미지 수정
            </h5>

            {/* Current Image Preview */}
            <div className="aspect-4/3 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 relative group">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono">
                현재 이미지
              </span>
            </div>

            {/* File Upload from PC */}
            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1.5">
                내 컴퓨터에서 이미지 업로드
              </label>
              <label className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#872D35] bg-[#872D35]/5 hover:bg-[#872D35]/10 text-[#872D35] font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>{isUploading ? '업로드 중...' : '이미지 파일 선택 (PNG/JPG)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, (url) => {
                    onUpdateProduct(product.id, { imageUrl: url });
                  })}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image URL Direct Input */}
            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">
                이미지 웹 URL 직접 입력
              </label>
              <input
                type="text"
                value={product.imageUrl}
                onChange={(e) => onUpdateProduct(product.id, { imageUrl: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white font-mono"
                placeholder="https://..."
              />
            </div>

            {/* Weight Tag */}
            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">
                이미지 위 표시 규격
              </label>
              <input
                type="text"
                value={product.weight}
                onChange={(e) => onUpdateProduct(product.id, { weight: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                placeholder="5kg / 10kg 박스 단위"
              />
            </div>
          </div>
        )}

        {/* 4. PRODUCT SPECS INSPECTOR */}
        {selectedElement.type === 'product_specs' && product && onUpdateProduct && (
          <div className="space-y-4">
            <h5 className="font-extrabold text-xs text-stone-900 pb-2 border-b border-stone-200">
              제품 납품 스펙 및 안내 문구
            </h5>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">공급 규격 (Weight)</label>
              <input
                type="text"
                value={product.weight}
                onChange={(e) => onUpdateProduct(product.id, { weight: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">보관 방법 (Storage)</label>
              <input
                type="text"
                value={product.storage}
                onChange={(e) => onUpdateProduct(product.id, { storage: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">소비기한 (Shelf Life)</label>
              <input
                type="text"
                value={product.shelfLife}
                onChange={(e) => onUpdateProduct(product.id, { shelfLife: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">주요 원재료 및 함량</label>
              <textarea
                rows={2}
                value={product.ingredients}
                onChange={(e) => onUpdateProduct(product.id, { ingredients: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">원산지 정보 (Origin)</label>
              <input
                type="text"
                value={product.origin || '국내산 (충북 진천 / 전남 고흥 등 계약재배)'}
                onChange={(e) => onUpdateProduct(product.id, { origin: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">대량 견적 단가 안내 문구</label>
              <input
                type="text"
                value={product.bulkPriceGuide}
                onChange={(e) => onUpdateProduct(product.id, { bulkPriceGuide: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
              />
            </div>
          </div>
        )}

        {/* 5. CUSTOM SECTION INSPECTOR */}
        {selectedElement.type === 'custom_section' && section && onUpdateSection && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <h5 className="font-extrabold text-xs text-stone-900">
                  섹션 블록 설정
                </h5>
                <span className="text-[10px] text-stone-500 font-mono">
                  BLOCK: {section.type}
                </span>
              </div>
              <button
                onClick={() => onUpdateSection(section.id, { visible: section.visible === false ? true : false })}
                className="p-1 rounded-lg text-stone-500 hover:bg-stone-100 flex items-center gap-1 cursor-pointer"
              >
                {section.visible === false ? <EyeOff className="w-3.5 h-3.5 text-amber-600" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
                <span className="text-[10px] font-bold">{section.visible === false ? '숨김 상태' : '표시 중'}</span>
              </button>
            </div>

            {/* Badge & Title */}
            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">배지 라벨 (선택)</label>
              <input
                type="text"
                value={section.badge || ''}
                onChange={(e) => onUpdateSection(section.id, { badge: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                placeholder="예: FOODHOME HIGHLIGHT"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">섹션 대제목</label>
              <textarea
                rows={2}
                value={section.title || ''}
                onChange={(e) => onUpdateSection(section.id, { title: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">섹션 부제목 / 설명</label>
              <textarea
                rows={3}
                value={section.subtitle || section.content || ''}
                onChange={(e) => onUpdateSection(section.id, { subtitle: e.target.value, content: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
              />
            </div>

            {/* If section uses image */}
            {(section.type === 'image' || section.type === 'image_text' || section.type === 'text_image' || section.imageUrl) && (
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="font-bold text-[11px] text-stone-700 block">섹션 이미지</label>
                {section.imageUrl && (
                  <div className="h-28 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                    <img src={section.imageUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="w-full py-2 px-3 rounded-xl border border-dashed border-[#872D35] bg-[#872D35]/5 hover:bg-[#872D35]/10 text-[#872D35] font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>새 이미지 업로드</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, (url) => onUpdateSection(section.id, { imageUrl: url }))}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* If section has button */}
            {(section.buttonText || section.type === 'button_cta' || section.type === 'image_text') && (
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <label className="font-bold text-[11px] text-stone-700 block">버튼 설정</label>
                <div>
                  <span className="text-[10px] text-stone-500 block mb-0.5">버튼 문구</span>
                  <input
                    type="text"
                    value={section.buttonText || ''}
                    onChange={(e) => onUpdateSection(section.id, { buttonText: e.target.value })}
                    className="w-full px-2.5 py-1 text-xs rounded-lg border border-stone-200 bg-white"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 6. CEO GREETING / COMPANY INTRO INSPECTOR */}
        {selectedElement.type === 'ceo_greeting' && (
          <div className="space-y-4">
            <h5 className="font-extrabold text-xs text-stone-900 pb-2 border-b border-stone-200">
              CEO 인사말 및 대표자 정보
            </h5>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">인사말 제목</label>
              <input
                type="text"
                value={content.ceoTitle || '맛의 기준을 세우고, 상생의 가치를 더합니다'}
                onChange={(e) => onUpdateContent({ ceoTitle: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">강조 문구 (하이라이트)</label>
              <input
                type="text"
                value={content.ceoHighlight || '“외식업 대표님의 성공이 곧 푸드홈의 내일입니다.”'}
                onChange={(e) => onUpdateContent({ ceoHighlight: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white text-[#872D35] font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">인사말 본문 내용</label>
              <textarea
                rows={5}
                value={content.ceoGreeting || ''}
                onChange={(e) => onUpdateContent({ ceoGreeting: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[11px] text-stone-700 block mb-1">대표자 성명</label>
                <input
                  type="text"
                  value={content.ceoName || '강호성'}
                  onChange={(e) => onUpdateContent({ ceoName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                />
              </div>
              <div>
                <label className="font-bold text-[11px] text-stone-700 block mb-1">직책</label>
                <input
                  type="text"
                  value={content.ceoRole || '주식회사 푸드홈 대표이사'}
                  onChange={(e) => onUpdateContent({ ceoRole: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
                />
              </div>
            </div>

            {/* CEO Photo */}
            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">대표자 사진</label>
              {content.ceoImageUrl && (
                <div className="w-20 h-24 rounded-lg overflow-hidden border border-stone-200 mb-2">
                  <img src={content.ceoImageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="w-full py-2 px-3 rounded-xl border border-dashed border-[#872D35] bg-[#872D35]/5 text-[#872D35] font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs">
                <Upload className="w-3.5 h-3.5" />
                <span>사진 업로드</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, (url) => onUpdateContent({ ceoImageUrl: url }))}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* 7. HEADER & FOOTER SETTINGS */}
        {selectedElement.type === 'header_footer' && (
          <div className="space-y-4">
            <h5 className="font-extrabold text-xs text-stone-900 pb-2 border-b border-stone-200">
              상단 헤더 & 하단 푸터 설정
            </h5>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">
                상단 헤더 로고 가로 크기: <strong>{content.headerLogoWidth || 160}px</strong>
              </label>
              <input
                type="range"
                min="100"
                max="260"
                step="5"
                value={content.headerLogoWidth || 160}
                onChange={(e) => onUpdateContent({ headerLogoWidth: Number(e.target.value) })}
                className="w-full accent-[#872D35]"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">
                하단 푸터 로고 가로 크기: <strong>{content.footerLogoWidth || 140}px</strong>
              </label>
              <input
                type="range"
                min="90"
                max="220"
                step="5"
                value={content.footerLogoWidth || 140}
                onChange={(e) => onUpdateContent({ footerLogoWidth: Number(e.target.value) })}
                className="w-full accent-[#872D35]"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">대표 전화번호</label>
              <input
                type="text"
                value={content.phone || ''}
                onChange={(e) => onUpdateContent({ phone: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">고객센터 운영시간</label>
              <input
                type="text"
                value={content.csHours || ''}
                onChange={(e) => onUpdateContent({ csHours: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-[11px] text-stone-700 block mb-1">가공공장 주소</label>
              <input
                type="text"
                value={content.factoryAddress || ''}
                onChange={(e) => onUpdateContent({ factoryAddress: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-white"
              />
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
