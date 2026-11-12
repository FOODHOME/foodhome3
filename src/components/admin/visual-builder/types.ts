import { ProductItem, CustomSectionItem, MainSectionConfig, ProductFeatureCard } from '../../../types';

export type DeviceMode = 'pc' | 'tablet' | 'mobile';

export type EditableTargetType = 
  | 'none'
  | 'product_feature_cards'
  | 'product_info'
  | 'product_image'
  | 'product_specs'
  | 'product_badges'
  | 'custom_section'
  | 'main_section'
  | 'ceo_greeting'
  | 'about_system'
  | 'about_permits'
  | 'about_location'
  | 'header_footer'
  | 'banner_slide';

export interface SelectedElement {
  type: EditableTargetType;
  pageId: string;
  targetId: string; // section id, product id, etc.
  subId?: string;   // specific card index or item id
  title: string;
  data?: any;
}

export interface SectionTemplate {
  type: string;
  label: string;
  desc: string;
  icon: string;
  category: '기본' | '이미지·미디어' | '소개·카드' | '신청·문의' | '기타';
  createDefault: (id: string, order: number) => CustomSectionItem;
}
