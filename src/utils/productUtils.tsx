import React from 'react';
import { ProductItem, ProductSpecItem, ProductBadgeItem, ProductFeatureCardItem } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Truck, 
  Award, 
  Flame, 
  Clock, 
  Package, 
  Check, 
  Layers, 
  Thermometer,
  Shield,
  Star,
  Zap,
  Info
} from 'lucide-react';

/**
 * Get product specification items with 100% backward compatibility.
 * If product.specItems is defined as an array (even if empty after user deleted all), returns it.
 * Otherwise, generates the default spec list from existing product properties.
 */
export const getProductSpecItems = (product: ProductItem): ProductSpecItem[] => {
  if (Array.isArray(product.specItems)) {
    return [...product.specItems].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  // Synthesize default spec rows from legacy product properties
  const defaultItems: ProductSpecItem[] = [
    {
      id: 'spec-weight',
      key: 'weight',
      label: '공급 규격 / 용량',
      value: product.weight ?? '5kg / 10kg 박스 단위',
      visible: true,
      order: 1
    },
    {
      id: 'spec-storage',
      key: 'storage',
      label: '보관 방법',
      value: product.storage ?? '냉장보관 (0~5℃)',
      visible: true,
      order: 2
    },
    {
      id: 'spec-shelfLife',
      key: 'shelfLife',
      label: '소비기한 / 유통기한',
      value: product.shelfLife ?? '제조일로부터 30일',
      visible: true,
      order: 3
    },
    {
      id: 'spec-ingredients',
      key: 'ingredients',
      label: '주요 원재료 및 함량',
      value: product.ingredients ?? '',
      visible: true,
      order: 4
    },
    {
      id: 'spec-origin',
      key: 'origin',
      label: '원산지 정보',
      value: product.origin ?? '무(국내산 100%), 고춧가루(국내산), 천일염(국내산 신안 천일염)',
      visible: true,
      order: 5
    },
    {
      id: 'spec-packaging',
      key: 'packagingType',
      label: '포장 형태',
      value: product.packagingType ?? '식품 전용 위생 2중 안심실링 진공팩',
      visible: true,
      order: 6
    },
    {
      id: 'spec-minOrder',
      key: 'minOrder',
      label: '최소 발주 단위',
      value: product.minOrder ?? '',
      visible: true,
      order: 7
    },
    {
      id: 'spec-delivery',
      key: 'deliveryInfo',
      label: '배송 조건',
      value: product.deliveryInfo ?? '주문 확인 후 24시간 이내 당일 생산 / 콜드체인 익일 직배송',
      visible: true,
      order: 8
    }
  ];

  return defaultItems;
};

/**
 * Find a specific visible spec row by key (returns null if hidden or deleted or empty)
 */
export const getVisibleSpecByKey = (product: ProductItem, key: string): ProductSpecItem | null => {
  const specs = getProductSpecItems(product);
  const found = specs.find(s => s.key === key);
  if (!found) return null;
  if (!found.visible || !found.value?.trim()) return null;
  return found;
};

/**
 * Get product badges with 100% backward compatibility.
 * If product.badges is defined as an array (even if empty), returns it.
 * Otherwise, generates from product.tag, product.isPopular, product.isRecommended.
 */
export const getProductBadges = (product: ProductItem): ProductBadgeItem[] => {
  if (Array.isArray(product.badges)) {
    return [...product.badges].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  const defaultBadges: ProductBadgeItem[] = [];

  // Main Tag Badge
  defaultBadges.push({
    id: 'badge-tag',
    text: product.tag || 'BEST B2B 1위',
    visible: Boolean(product.tag !== ''),
    color: 'burgundy',
    icon: 'none',
    order: 1
  });

  // Popular Badge
  defaultBadges.push({
    id: 'badge-popular',
    text: '인기 납품',
    visible: product.isPopular === true,
    color: 'amber',
    icon: 'flame',
    order: 2
  });

  // Recommended Badge
  defaultBadges.push({
    id: 'badge-recommended',
    text: '추천 상품',
    visible: product.isRecommended === true,
    color: 'emerald',
    icon: 'award',
    order: 3
  });

  return defaultBadges;
};

/**
 * Get product feature cards with 100% backward compatibility.
 * If product.featureCards is defined as an array (even if empty), returns it.
 * Otherwise, returns the default 4 cards.
 */
export const getProductFeatureCards = (product: ProductItem): ProductFeatureCardItem[] => {
  if (Array.isArray(product.featureCards)) {
    return [...product.featureCards].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  return [
    {
      id: 'fc-1',
      title: '특허 수분제어',
      desc: '물 생김 제로',
      icon: 'Sparkles',
      visible: true,
      order: 1
    },
    {
      id: 'fc-2',
      title: '100% 국산 농산물',
      desc: '산지 계약재배',
      icon: 'CheckCircle2',
      visible: true,
      order: 2
    },
    {
      id: 'fc-3',
      title: '위생 안심 공정',
      desc: 'HACCP 스마트팩토리',
      icon: 'ShieldCheck',
      visible: true,
      order: 3
    },
    {
      id: 'fc-4',
      title: '전국 콜드체인',
      desc: '0~5℃ 익일 직배송',
      icon: 'Truck',
      visible: true,
      order: 4
    }
  ];
};

/**
 * Style mapping for badge colors
 */
export const getBadgeColorClass = (color?: string): string => {
  switch (color) {
    case 'amber':
      return 'bg-amber-500 text-white';
    case 'emerald':
      return 'bg-emerald-600 text-white';
    case 'blue':
      return 'bg-blue-600 text-white';
    case 'purple':
      return 'bg-purple-600 text-white';
    case 'slate':
      return 'bg-slate-800 text-white';
    case 'dark':
      return 'bg-[#332525] text-amber-300';
    case 'burgundy':
    default:
      return 'bg-[#872D35] text-white';
  }
};

/**
 * Icon renderer for badges
 */
export const renderBadgeIcon = (icon?: string, className = 'w-3.5 h-3.5') => {
  switch (icon) {
    case 'flame':
      return <Flame className={className} />;
    case 'award':
      return <Award className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'check':
      return <Check className={className} />;
    case 'shield':
      return <ShieldCheck className={className} />;
    case 'star':
      return <Star className={className} />;
    case 'zap':
      return <Zap className={className} />;
    default:
      return null;
  }
};

/**
 * Icon renderer for feature cards
 */
export const renderFeatureIcon = (icon?: string, className = 'w-4 h-4 text-[#872D35]') => {
  switch (icon) {
    case 'CheckCircle2':
      return <CheckCircle2 className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Truck':
      return <Truck className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Clock':
      return <Clock className={className} />;
    case 'Package':
      return <Package className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Thermometer':
      return <Thermometer className={className} />;
    case 'Sparkles':
    default:
      return <Sparkles className={className} />;
  }
};
