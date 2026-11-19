import { 
  ProductItem, 
  ProductBadgeItem, 
  ProductFeatureCardItem, 
  ProductSpecItem, 
  ProductCtaButtonItem, 
  ProductNoticeBoxItem 
} from '../types';

/**
 * Gets effective badges for a product.
 * If product.badges is defined, uses it (respecting visible !== false).
 * Otherwise, generates fallback badges from product.tag, isPopular, isRecommended.
 */
export const getEffectiveProductBadges = (product: ProductItem): ProductBadgeItem[] => {
  if (product.badges && Array.isArray(product.badges)) {
    return product.badges.filter(b => b.visible !== false);
  }

  // Fallback defaults from legacy fields
  const badges: ProductBadgeItem[] = [];
  if (product.tag) {
    badges.push({
      id: 'badge-tag',
      text: product.tag,
      bg: '#872D35',
      color: '#ffffff',
      icon: 'Tag',
      visible: true
    });
  }
  if (product.isPopular) {
    badges.push({
      id: 'badge-popular',
      text: '인기 납품',
      bg: '#f59e0b',
      color: '#ffffff',
      icon: 'Flame',
      visible: true
    });
  }
  if (product.isRecommended) {
    badges.push({
      id: 'badge-recommended',
      text: '추천 상품',
      bg: '#059669',
      color: '#ffffff',
      icon: 'Award',
      visible: true
    });
  }
  return badges;
};

/**
 * Gets effective feature cards under product representative image.
 * If product.featureCards is defined, uses it.
 * Otherwise, returns 4 standard default feature cards.
 */
export const getEffectiveProductFeatureCards = (product: ProductItem): ProductFeatureCardItem[] => {
  if (product.featureCards && Array.isArray(product.featureCards)) {
    return product.featureCards.filter(c => c.visible !== false);
  }

  return [
    {
      id: 'fcard-1',
      icon: 'Sparkles',
      title: '특허 수분제어',
      desc: '물 생김 제로',
      visible: true
    },
    {
      id: 'fcard-2',
      icon: 'CheckCircle2',
      title: '100% 국산 농산물',
      desc: '산지 계약재배',
      visible: true
    },
    {
      id: 'fcard-3',
      icon: 'ShieldCheck',
      title: '위생 안심 공정',
      desc: 'HACCP 스마트팩토리',
      visible: true
    },
    {
      id: 'fcard-4',
      icon: 'Truck',
      title: '전국 콜드체인',
      desc: '0~5℃ 익일 직배송',
      visible: true
    }
  ];
};

/**
 * Gets effective spec items for product detail table.
 * If product.specItems is defined, uses it.
 * Otherwise, builds defaults from weight, packagingType, storage, shelfLife, ingredients, origin, deliveryInfo.
 */
export const getEffectiveProductSpecItems = (product: ProductItem): ProductSpecItem[] => {
  if (product.specItems && Array.isArray(product.specItems)) {
    return product.specItems.filter(s => s.visible !== false && (s.label || s.value));
  }

  const items: ProductSpecItem[] = [];

  if (product.weight) {
    items.push({
      id: 'spec-weight',
      label: '공급 규격 / 용량',
      value: product.weight,
      visible: true
    });
  }
  items.push({
    id: 'spec-pkg',
    label: '포장 형태',
    value: product.packagingType || '식품 전용 위생 2중 안심실링 진공팩',
    visible: true
  });
  if (product.storage) {
    items.push({
      id: 'spec-storage',
      label: '보관 방법',
      value: product.storage,
      icon: 'Thermometer',
      visible: true
    });
  }
  if (product.shelfLife) {
    items.push({
      id: 'spec-shelflife',
      label: '소비 기한',
      value: product.shelfLife,
      icon: 'Clock',
      visible: true
    });
  }
  if (product.ingredients) {
    items.push({
      id: 'spec-ingredients',
      label: '주요 원재료',
      value: product.ingredients,
      visible: true
    });
  }
  items.push({
    id: 'spec-origin',
    label: '원산지 정보',
    value: product.origin || '무(국내산 100%), 고춧가루(국내산), 천일염(국내산 신안 천일염)',
    visible: true
  });
  items.push({
    id: 'spec-delivery',
    label: '배송 및 공급',
    value: product.deliveryInfo || '주문 확인 후 24시간 이내 당일 생산 / 콜드체인 익일 직배송',
    visible: true
  });

  return items;
};

/**
 * Gets effective CTA action buttons.
 */
export const getEffectiveProductCtaButtons = (product: ProductItem): ProductCtaButtonItem[] => {
  if (product.ctaButtons && Array.isArray(product.ctaButtons)) {
    return product.ctaButtons.filter(b => b.visible !== false);
  }

  return [
    {
      id: 'cta-sample',
      text: '사업자 무료 샘플 신청',
      action: 'sample',
      bg: '#872D35',
      color: '#ffffff',
      icon: 'Sparkles',
      visible: true
    },
    {
      id: 'cta-quote',
      text: '대량 납품 견적서 요청',
      action: 'quote',
      bg: '#2A2020',
      color: '#ffffff',
      icon: 'FileSpreadsheet',
      visible: true
    }
  ];
};

/**
 * Gets effective notice boxes.
 */
export const getEffectiveProductNoticeBoxes = (product: ProductItem): ProductNoticeBoxItem[] => {
  if (product.noticeBoxes && Array.isArray(product.noticeBoxes)) {
    return product.noticeBoxes.filter(n => n.visible !== false);
  }

  return [
    {
      id: 'notice-default',
      text: '사업자등록증 소지 외식업 대표님께는 택배비까지 전액 무료로 샘플을 발송합니다.',
      phone: product.contactPhone || '043-532-8890',
      icon: 'Info',
      bg: '#FEF3C7', // amber-100/50
      color: '#78350F', // amber-900
      visible: true
    }
  ];
};
