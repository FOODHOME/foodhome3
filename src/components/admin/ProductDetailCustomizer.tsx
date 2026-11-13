import React, { useState } from 'react';
import { 
  ProductItem, 
  ProductBadgeItem, 
  ProductFeatureCardItem, 
  ProductCtaButtonItem, 
  ProductNoticeBoxItem 
} from '../../types';
import { 
  getEffectiveProductBadges, 
  getEffectiveProductFeatureCards, 
  getEffectiveProductCtaButtons, 
  getEffectiveProductNoticeBoxes 
} from '../../utils/productDetailDefaults';
import { 
  Tag, 
  Sparkles, 
  MousePointerClick, 
  Info, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Flame, 
  Award, 
  Star, 
  Check, 
  ShieldCheck, 
  Truck, 
  Package, 
  Clock, 
  Thermometer, 
  FileSpreadsheet, 
  Phone, 
  ExternalLink 
} from 'lucide-react';

interface ProductDetailCustomizerProps {
  product: ProductItem;
  onChange: (updates: Partial<ProductItem>) => void;
}

export const ProductDetailCustomizer: React.FC<ProductDetailCustomizerProps> = ({
  product,
  onChange
}) => {
  // Collapsible section toggles
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    badges: true,
    featureCards: true,
    ctaButtons: true,
    noticeBoxes: true
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // 1. Current list resolution (from product or defaults)
  const currentBadges = product.badges ?? getEffectiveProductBadges(product);
  const currentFeatureCards = product.featureCards ?? getEffectiveProductFeatureCards(product);
  const currentCtaButtons = product.ctaButtons ?? getEffectiveProductCtaButtons(product);
  const currentNoticeBoxes = product.noticeBoxes ?? getEffectiveProductNoticeBoxes(product);

  // -------------------------------------------------------------
  // 1. Badges Handlers
  // -------------------------------------------------------------
  const handleAddBadge = () => {
    const newBadge: ProductBadgeItem = {
      id: 'badge-' + Date.now(),
      text: '새 배지',
      bg: '#872D35',
      color: '#ffffff',
      icon: 'Tag',
      visible: true
    };
    onChange({ badges: [...currentBadges, newBadge] });
  };

  const handleUpdateBadge = (id: string, updates: Partial<ProductBadgeItem>) => {
    const next = currentBadges.map(b => b.id === id ? { ...b, ...updates } : b);
    onChange({ badges: next });
  };

  const handleDeleteBadge = (id: string) => {
    onChange({ badges: currentBadges.filter(b => b.id !== id) });
  };

  const handleDuplicateBadge = (badge: ProductBadgeItem) => {
    const copy: ProductBadgeItem = {
      ...badge,
      id: 'badge-' + Date.now(),
      text: `${badge.text} (복사본)`
    };
    onChange({ badges: [...currentBadges, copy] });
  };

  const handleMoveBadge = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentBadges.length) return;
    const list = [...currentBadges];
    const [item] = list.splice(index, 1);
    list.splice(targetIdx, 0, item);
    onChange({ badges: list });
  };

  // -------------------------------------------------------------
  // 2. Feature Cards Handlers
  // -------------------------------------------------------------
  const handleAddFeatureCard = () => {
    const newCard: ProductFeatureCardItem = {
      id: 'fcard-' + Date.now(),
      icon: 'Sparkles',
      title: '새 특징 제목',
      desc: '특징 요약 문구',
      visible: true
    };
    onChange({ featureCards: [...currentFeatureCards, newCard] });
  };

  const handleUpdateFeatureCard = (id: string, updates: Partial<ProductFeatureCardItem>) => {
    const next = currentFeatureCards.map(c => c.id === id ? { ...c, ...updates } : c);
    onChange({ featureCards: next });
  };

  const handleDeleteFeatureCard = (id: string) => {
    onChange({ featureCards: currentFeatureCards.filter(c => c.id !== id) });
  };

  const handleDuplicateFeatureCard = (card: ProductFeatureCardItem) => {
    const copy: ProductFeatureCardItem = {
      ...card,
      id: 'fcard-' + Date.now(),
      title: `${card.title} (복사본)`
    };
    onChange({ featureCards: [...currentFeatureCards, copy] });
  };

  const handleMoveFeatureCard = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentFeatureCards.length) return;
    const list = [...currentFeatureCards];
    const [item] = list.splice(index, 1);
    list.splice(targetIdx, 0, item);
    onChange({ featureCards: list });
  };

  // -------------------------------------------------------------
  // 3. CTA Buttons Handlers
  // -------------------------------------------------------------
  const handleAddCtaButton = () => {
    const newBtn: ProductCtaButtonItem = {
      id: 'cta-' + Date.now(),
      text: '새 신청 버튼',
      action: 'sample',
      bg: '#872D35',
      color: '#ffffff',
      icon: 'Sparkles',
      visible: true
    };
    onChange({ ctaButtons: [...currentCtaButtons, newBtn] });
  };

  const handleUpdateCtaButton = (id: string, updates: Partial<ProductCtaButtonItem>) => {
    const next = currentCtaButtons.map(b => b.id === id ? { ...b, ...updates } : b);
    onChange({ ctaButtons: next });
  };

  const handleDeleteCtaButton = (id: string) => {
    onChange({ ctaButtons: currentCtaButtons.filter(b => b.id !== id) });
  };

  const handleDuplicateCtaButton = (btn: ProductCtaButtonItem) => {
    const copy: ProductCtaButtonItem = {
      ...btn,
      id: 'cta-' + Date.now(),
      text: `${btn.text} (복사본)`
    };
    onChange({ ctaButtons: [...currentCtaButtons, copy] });
  };

  const handleMoveCtaButton = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= currentCtaButtons.length) return;
    const list = [...currentCtaButtons];
    const [item] = list.splice(index, 1);
    list.splice(targetIdx, 0, item);
    onChange({ ctaButtons: list });
  };

  // -------------------------------------------------------------
  // 5. Notice Boxes Handlers
  // -------------------------------------------------------------
  const handleAddNoticeBox = () => {
    const newNotice: ProductNoticeBoxItem = {
      id: 'notice-' + Date.now(),
      text: '새 안내 문구를 입력하세요.',
      phone: '043-532-8890',
      icon: 'Info',
      bg: '#FEF3C7',
      color: '#78350F',
      visible: true
    };
    onChange({ noticeBoxes: [...currentNoticeBoxes, newNotice] });
  };

  const handleUpdateNoticeBox = (id: string, updates: Partial<ProductNoticeBoxItem>) => {
    const next = currentNoticeBoxes.map(n => n.id === id ? { ...n, ...updates } : n);
    onChange({ noticeBoxes: next });
  };

  const handleDeleteNoticeBox = (id: string) => {
    onChange({ noticeBoxes: currentNoticeBoxes.filter(n => n.id !== id) });
  };

  const handleDuplicateNoticeBox = (notice: ProductNoticeBoxItem) => {
    const copy: ProductNoticeBoxItem = {
      ...notice,
      id: 'notice-' + Date.now(),
      text: `${notice.text} (복사본)`
    };
    onChange({ noticeBoxes: [...currentNoticeBoxes, copy] });
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
        <h4 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#872D35]" />
          <span>제품 상세페이지 항목 자유 설정 (배지, 특징 카드, 상세정보표, 버튼, 안내문구)</span>
        </h4>
        <p className="text-[11px] text-stone-500 mt-0.5">
          현재 선택된 제품(<strong>{product.name}</strong>)의 고정 항목을 삭제하거나 새로 추가·수정할 수 있으며, 다른 제품에는 전혀 영향을 주지 않습니다.
        </p>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 1: 제품 이미지 위 배지 관리
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('badges')}
          className="w-full px-4 py-3 bg-stone-50 hover:bg-stone-100/70 flex items-center justify-between transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#872D35]" />
            <span className="text-xs font-black text-stone-900">1. 대표 이미지 위 배지 관리</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#872D35]/10 text-[#872D35] font-bold">
              {currentBadges.filter(b => b.visible !== false).length}개 활성
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-stone-400">클릭하여 접기/펼치기</span>
            {openSections.badges ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </div>
        </button>

        {openSections.badges && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span>이미지 좌측 상단에 겹쳐 표시되는 플로팅 배지입니다. 모두 삭제하거나 숨기면 배지 영역이 사라집니다.</span>
              <button
                type="button"
                onClick={handleAddBadge}
                className="px-3 py-1.5 rounded-lg bg-[#872D35] text-white text-xs font-bold hover:bg-[#6D242B] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ 배지 추가</span>
              </button>
            </div>

            {currentBadges.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                등록된 배지가 없습니다. [+ 배지 추가] 버튼을 눌러 새 배지를 등록해 보세요.
              </div>
            ) : (
              <div className="space-y-2">
                {currentBadges.map((badge, idx) => (
                  <div 
                    key={badge.id}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      badge.visible !== false ? 'bg-white border-stone-200' : 'bg-stone-50/80 border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Order controls */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveBadge(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
                          title="위로 이동"
                        >
                          <ChevronUp className="w-3 h-3 text-stone-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveBadge(idx, 'down')}
                          disabled={idx === currentBadges.length - 1}
                          className="p-1 rounded hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
                          title="아래로 이동"
                        >
                          <ChevronDown className="w-3 h-3 text-stone-600" />
                        </button>
                      </div>

                      {/* Badge Text Input */}
                      <div className="flex-1 min-w-[120px]">
                        <input
                          type="text"
                          value={badge.text}
                          onChange={(e) => handleUpdateBadge(badge.id, { text: e.target.value })}
                          placeholder="배지 문구 입력"
                          className="w-full px-2.5 py-1.5 text-xs font-bold border border-stone-300 rounded-lg focus:border-[#872D35] focus:outline-none"
                        />
                      </div>

                      {/* Icon Selector */}
                      <select
                        value={badge.icon || 'None'}
                        onChange={(e) => handleUpdateBadge(badge.id, { icon: e.target.value })}
                        className="text-xs px-2 py-1.5 border border-stone-300 rounded-lg bg-white shrink-0"
                      >
                        <option value="None">아이콘 없음</option>
                        <option value="Flame">🔥 인기/불꽃</option>
                        <option value="Award">🏆 추천/어워드</option>
                        <option value="Sparkles">✨ 스파클</option>
                        <option value="Star">⭐ 별표</option>
                        <option value="Check">✓ 체크</option>
                        <option value="Tag">🏷️ 태그</option>
                        <option value="Truck">🚚 트럭/배송</option>
                      </select>

                      {/* Background Color Picker */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="text-[10px] text-stone-500 font-bold">배경</label>
                        <input
                          type="color"
                          value={badge.bg || '#872D35'}
                          onChange={(e) => handleUpdateBadge(badge.id, { bg: e.target.value })}
                          className="w-7 h-7 rounded border border-stone-200 cursor-pointer p-0.5 bg-white"
                          title="배경색"
                        />
                      </div>

                      {/* Text Color Picker */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="text-[10px] text-stone-500 font-bold">글자</label>
                        <input
                          type="color"
                          value={badge.color || '#ffffff'}
                          onChange={(e) => handleUpdateBadge(badge.id, { color: e.target.value })}
                          className="w-7 h-7 rounded border border-stone-200 cursor-pointer p-0.5 bg-white"
                          title="글자색"
                        />
                      </div>

                      {/* Live Badge Preview */}
                      <div className="shrink-0 pl-1">
                        <span 
                          className="px-2.5 py-1 rounded-full text-[11px] font-black shadow-xs flex items-center gap-1"
                          style={{ backgroundColor: badge.bg || '#872D35', color: badge.color || '#ffffff' }}
                        >
                          {badge.icon === 'Flame' && <Flame className="w-3 h-3" />}
                          {badge.icon === 'Award' && <Award className="w-3 h-3" />}
                          {badge.icon === 'Sparkles' && <Sparkles className="w-3 h-3" />}
                          {badge.icon === 'Star' && <Star className="w-3 h-3" />}
                          {badge.icon === 'Check' && <Check className="w-3 h-3" />}
                          {badge.icon === 'Tag' && <Tag className="w-3 h-3" />}
                          {badge.icon === 'Truck' && <Truck className="w-3 h-3" />}
                          <span>{badge.text || '미리보기'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Action buttons: Visibility, Duplicate, Delete */}
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateBadge(badge.id, { visible: badge.visible === false ? true : false })}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                          badge.visible !== false 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200'
                        }`}
                        title={badge.visible !== false ? '클릭 시 숨김' : '클릭 시 표시'}
                      >
                        {badge.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{badge.visible !== false ? '표시' : '숨김'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateBadge(badge)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="배지 복제"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteBadge(badge.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 2: 제품 대표 이미지 아래 특징 카드 관리
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('featureCards')}
          className="w-full px-4 py-3 bg-stone-50 hover:bg-stone-100/70 flex items-center justify-between transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#872D35]" />
            <span className="text-xs font-black text-stone-900">2. 제품 특징 카드 관리 (대표 이미지 하단)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#872D35]/10 text-[#872D35] font-bold">
              {currentFeatureCards.filter(c => c.visible !== false).length}개 활성
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-stone-400">클릭하여 접기/펼치기</span>
            {openSections.featureCards ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </div>
        </button>

        {openSections.featureCards && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span>대표 이미지 하단에 1~4열로 자동 정렬되는 핵심 장점 카드입니다. 등록된 개수에 맞춰 자동 반응형 그리드로 배치됩니다.</span>
              <button
                type="button"
                onClick={handleAddFeatureCard}
                className="px-3 py-1.5 rounded-lg bg-[#872D35] text-white text-xs font-bold hover:bg-[#6D242B] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ 특징 카드 추가</span>
              </button>
            </div>

            {currentFeatureCards.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                등록된 특징 카드가 없습니다. [+ 특징 카드 추가] 버튼을 눌러 등록하세요.
              </div>
            ) : (
              <div className="space-y-2">
                {currentFeatureCards.map((card, idx) => (
                  <div 
                    key={card.id}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      card.visible !== false ? 'bg-white border-stone-200' : 'bg-stone-50/80 border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Order controls */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveFeatureCard(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
                          title="위로 이동"
                        >
                          <ChevronUp className="w-3 h-3 text-stone-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveFeatureCard(idx, 'down')}
                          disabled={idx === currentFeatureCards.length - 1}
                          className="p-1 rounded hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
                          title="아래로 이동"
                        >
                          <ChevronDown className="w-3 h-3 text-stone-600" />
                        </button>
                      </div>

                      {/* Icon Selector */}
                      <select
                        value={card.icon || 'Sparkles'}
                        onChange={(e) => handleUpdateFeatureCard(card.id, { icon: e.target.value })}
                        className="text-xs px-2 py-1.5 border border-stone-300 rounded-lg bg-white shrink-0"
                      >
                        <option value="Sparkles">✨ 특허/스파클</option>
                        <option value="CheckCircle2">✓ 안심/체크</option>
                        <option value="ShieldCheck">🛡️ 위생/보증</option>
                        <option value="Truck">🚚 직배송/콜드체인</option>
                        <option value="Award">🏆 명품/어워드</option>
                        <option value="Package">📦 위생실링/포장</option>
                        <option value="Clock">⏱️ 당일생산/신선</option>
                        <option value="Flame">🔥 비법양념/화력</option>
                        <option value="Star">⭐ 만족도/별점</option>
                      </select>

                      {/* Title Input */}
                      <div className="w-36 shrink-0">
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => handleUpdateFeatureCard(card.id, { title: e.target.value })}
                          placeholder="특징 제목"
                          className="w-full px-2.5 py-1.5 text-xs font-black border border-stone-300 rounded-lg focus:border-[#872D35] focus:outline-none"
                        />
                      </div>

                      {/* Desc Input */}
                      <div className="flex-1 min-w-[140px]">
                        <input
                          type="text"
                          value={card.desc}
                          onChange={(e) => handleUpdateFeatureCard(card.id, { desc: e.target.value })}
                          placeholder="설명 문구 (예: 물 생김 제로)"
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg focus:border-[#872D35] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateFeatureCard(card.id, { visible: card.visible === false ? true : false })}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                          card.visible !== false 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200'
                        }`}
                        title={card.visible !== false ? '클릭 시 숨김' : '클릭 시 표시'}
                      >
                        {card.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{card.visible !== false ? '표시' : '숨김'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateFeatureCard(card)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="특징 카드 복제"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteFeatureCard(card.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="특징 카드 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 3: 제품 하단 버튼 관리
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('ctaButtons')}
          className="w-full px-4 py-3 bg-stone-50 hover:bg-stone-100/70 flex items-center justify-between transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-[#872D35]" />
            <span className="text-xs font-black text-stone-900">3. 제품 하단 CTA 버튼 관리 (샘플/견적신청 등)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#872D35]/10 text-[#872D35] font-bold">
              {currentCtaButtons.filter(b => b.visible !== false).length}개 활성
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-stone-400">클릭하여 접기/펼치기</span>
            {openSections.ctaButtons ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </div>
        </button>

        {openSections.ctaButtons && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span>상세페이지 가격표 하단에 배치되는 전환 액션 버튼입니다. 버튼 문구, 링크 동작, 배경색 및 아이콘을 자유롭게 수정합니다.</span>
              <button
                type="button"
                onClick={handleAddCtaButton}
                className="px-3 py-1.5 rounded-lg bg-[#872D35] text-white text-xs font-bold hover:bg-[#6D242B] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ 버튼 추가</span>
              </button>
            </div>

            {currentCtaButtons.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                등록된 버튼이 없습니다. [+ 버튼 추가]를 눌러 등록하세요.
              </div>
            ) : (
              <div className="space-y-2">
                {currentCtaButtons.map((btn, idx) => (
                  <div 
                    key={btn.id}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      btn.visible !== false ? 'bg-white border-stone-200' : 'bg-stone-50/80 border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Order controls */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveCtaButton(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
                          title="위로 이동"
                        >
                          <ChevronUp className="w-3 h-3 text-stone-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveCtaButton(idx, 'down')}
                          disabled={idx === currentCtaButtons.length - 1}
                          className="p-1 rounded hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
                          title="아래로 이동"
                        >
                          <ChevronDown className="w-3 h-3 text-stone-600" />
                        </button>
                      </div>

                      {/* Button Text Input */}
                      <div className="w-44 shrink-0">
                        <input
                          type="text"
                          value={btn.text}
                          onChange={(e) => handleUpdateCtaButton(btn.id, { text: e.target.value })}
                          placeholder="버튼 문구"
                          className="w-full px-2.5 py-1.5 text-xs font-black border border-stone-300 rounded-lg focus:border-[#872D35] focus:outline-none"
                        />
                      </div>

                      {/* Action Type */}
                      <select
                        value={btn.action || 'sample'}
                        onChange={(e) => handleUpdateCtaButton(btn.id, { action: e.target.value })}
                        className="text-xs px-2 py-1.5 border border-stone-300 rounded-lg bg-white shrink-0 font-bold"
                      >
                        <option value="sample">무료 샘플 신청 페이지 이동</option>
                        <option value="quote">대량 납품 견적서 요청 페이지</option>
                        <option value="phone">전화 걸기 (tel:)</option>
                        <option value="url">외부 웹사이트/페이지 링크 이동</option>
                      </select>

                      {/* Action Link (if url or phone) */}
                      {(btn.action === 'url' || btn.action === 'phone') && (
                        <div className="flex-1 min-w-[120px]">
                          <input
                            type="text"
                            value={btn.link || ''}
                            onChange={(e) => handleUpdateCtaButton(btn.id, { link: e.target.value })}
                            placeholder={btn.action === 'phone' ? '043-532-8890' : 'https://... 또는 페이지ID'}
                            className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg font-mono focus:border-[#872D35] focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Icon Selector */}
                      <select
                        value={btn.icon || 'Sparkles'}
                        onChange={(e) => handleUpdateCtaButton(btn.id, { icon: e.target.value })}
                        className="text-xs px-2 py-1.5 border border-stone-300 rounded-lg bg-white shrink-0"
                      >
                        <option value="Sparkles">✨ 스파클/샘플</option>
                        <option value="FileSpreadsheet">📋 견적서/스프레드시트</option>
                        <option value="Phone">📞 전화기</option>
                        <option value="ExternalLink">🔗 외부링크</option>
                        <option value="Package">📦 패키지</option>
                      </select>

                      {/* Background Color Picker */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="text-[10px] text-stone-500 font-bold">배경</label>
                        <input
                          type="color"
                          value={btn.bg || '#872D35'}
                          onChange={(e) => handleUpdateCtaButton(btn.id, { bg: e.target.value })}
                          className="w-7 h-7 rounded border border-stone-200 cursor-pointer p-0.5 bg-white"
                          title="버튼 배경색"
                        />
                      </div>

                      {/* Text Color Picker */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="text-[10px] text-stone-500 font-bold">글자</label>
                        <input
                          type="color"
                          value={btn.color || '#ffffff'}
                          onChange={(e) => handleUpdateCtaButton(btn.id, { color: e.target.value })}
                          className="w-7 h-7 rounded border border-stone-200 cursor-pointer p-0.5 bg-white"
                          title="버튼 글자색"
                        />
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center border-t sm:border-t-0 pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleUpdateCtaButton(btn.id, { visible: btn.visible === false ? true : false })}
                        className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                          btn.visible !== false 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200'
                        }`}
                        title={btn.visible !== false ? '클릭 시 숨김' : '클릭 시 표시'}
                      >
                        {btn.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span className="text-[10px]">{btn.visible !== false ? '표시' : '숨김'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateCtaButton(btn)}
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                        title="버튼 복제"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCtaButton(btn.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="버튼 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SECTION 4: 제품 하단 안내 문구 박스 관리
         ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="border border-stone-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('noticeBoxes')}
          className="w-full px-4 py-3 bg-stone-50 hover:bg-stone-100/70 flex items-center justify-between transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#872D35]" />
            <span className="text-xs font-black text-stone-900">4. 제품 하단 안내 문구 박스 관리 (사업자 무료 안내 및 유선번호)</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#872D35]/10 text-[#872D35] font-bold">
              {currentNoticeBoxes.filter(n => n.visible !== false).length}개 활성
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-stone-400">클릭하여 접기/펼치기</span>
            {openSections.noticeBoxes ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
          </div>
        </button>

        {openSections.noticeBoxes && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span>버튼 바로 아래에 노출되는 강조 안내 박스입니다. 안내 문구, 유선 전화번호, 배경색을 자유롭게 수정하거나 숨길 수 있습니다.</span>
              <button
                type="button"
                onClick={handleAddNoticeBox}
                className="px-3 py-1.5 rounded-lg bg-[#872D35] text-white text-xs font-bold hover:bg-[#6D242B] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ 안내 문구 추가</span>
              </button>
            </div>

            {currentNoticeBoxes.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                등록된 안내 문구 박스가 없습니다. [+ 안내 문구 추가]를 눌러 등록하세요.
              </div>
            ) : (
              <div className="space-y-2">
                {currentNoticeBoxes.map((notice) => (
                  <div 
                    key={notice.id}
                    className={`p-3 rounded-xl border flex flex-col gap-3 transition-all ${
                      notice.visible !== false ? 'bg-white border-stone-200' : 'bg-stone-50/80 border-stone-200 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      {/* Notice Text Input */}
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-[10px] font-bold text-stone-500 mb-1">안내 문구 내용</label>
                        <input
                          type="text"
                          value={notice.text}
                          onChange={(e) => handleUpdateNoticeBox(notice.id, { text: e.target.value })}
                          placeholder="안내 문구 입력"
                          className="w-full px-2.5 py-1.5 text-xs font-medium border border-stone-300 rounded-lg focus:border-[#872D35] focus:outline-none"
                        />
                      </div>

                      {/* Phone Input */}
                      <div className="w-36 shrink-0">
                        <label className="block text-[10px] font-bold text-stone-500 mb-1">연락처 전화번호</label>
                        <input
                          type="text"
                          value={notice.phone || ''}
                          onChange={(e) => handleUpdateNoticeBox(notice.id, { phone: e.target.value })}
                          placeholder="예: 043-532-8890"
                          className="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-stone-300 rounded-lg focus:border-[#872D35] focus:outline-none"
                        />
                      </div>

                      {/* Icon */}
                      <div className="shrink-0">
                        <label className="block text-[10px] font-bold text-stone-500 mb-1">아이콘</label>
                        <select
                          value={notice.icon || 'Info'}
                          onChange={(e) => handleUpdateNoticeBox(notice.id, { icon: e.target.value })}
                          className="text-xs px-2 py-1.5 border border-stone-300 rounded-lg bg-white"
                        >
                          <option value="Info">ℹ️ 안내(Info)</option>
                          <option value="Sparkles">✨ 스파클(무료)</option>
                          <option value="ShieldCheck">🛡️ 안심보장</option>
                        </select>
                      </div>

                      {/* Color controls */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pt-4 sm:pt-0">
                        <div className="flex items-center gap-1">
                          <label className="text-[10px] text-stone-500 font-bold">배경</label>
                          <input
                            type="color"
                            value={notice.bg || '#FEF3C7'}
                            onChange={(e) => handleUpdateNoticeBox(notice.id, { bg: e.target.value })}
                            className="w-7 h-7 rounded border border-stone-200 cursor-pointer p-0.5 bg-white"
                            title="배경색"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <label className="text-[10px] text-stone-500 font-bold">글자</label>
                          <input
                            type="color"
                            value={notice.color || '#78350F'}
                            onChange={(e) => handleUpdateNoticeBox(notice.id, { color: e.target.value })}
                            className="w-7 h-7 rounded border border-stone-200 cursor-pointer p-0.5 bg-white"
                            title="글자색"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between border-t border-stone-100 pt-2">
                      {/* Live preview */}
                      <div 
                        className="px-3 py-1.5 rounded-lg border text-[11px] flex items-center gap-2 flex-1 max-w-md truncate"
                        style={{ backgroundColor: notice.bg || '#FEF3C7', color: notice.color || '#78350F', borderColor: '#FCD34D' }}
                      >
                        <span>{notice.text || '미리보기'}</span>
                        {notice.phone && <span className="font-bold underline ml-auto shrink-0">{notice.phone}</span>}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleUpdateNoticeBox(notice.id, { visible: notice.visible === false ? true : false })}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                            notice.visible !== false 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-stone-200'
                          }`}
                          title={notice.visible !== false ? '클릭 시 숨김' : '클릭 시 표시'}
                        >
                          {notice.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span className="text-[10px]">{notice.visible !== false ? '표시' : '숨김'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateNoticeBox(notice)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                          title="안내 박스 복제"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteNoticeBox(notice.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="안내 박스 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
