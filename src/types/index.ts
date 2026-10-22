export interface BannerSlide {
  id: string;
  tagline: string;
  title: string;
  subtitle: string;
  description: string;
  subDescription?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  primaryButtonText: string;
  primaryButtonLink?: string;
  primaryButtonAction: 'products' | 'inquiry' | 'sample' | 'quote' | 'page' | 'url';
  secondaryButtonText: string;
  secondaryButtonLink?: string;
  secondaryButtonAction: 'products' | 'inquiry' | 'sample' | 'quote' | 'page' | 'url';
  order?: number;
  isActive?: boolean;
}

export interface FacilityMediaItem {
  id: string;
  title: string;
  desc: string;
  imageUrl: string;
  videoUrl?: string;
  category: '클린룸' | '세척라인' | '품질검사' | '포장·물류';
}

export interface FaqCategoryItem {
  id: string;
  name: string;
  order: number;
  visible: boolean;
}

export interface ProductCategoryItem {
  id: string;
  name: string;
  englishName?: string;
  description?: string;
  imageUrl?: string;
  features?: string[];
  order: number;
  visible: boolean;
}

export type SectionType = 
  | 'heading'        // 1. 제목
  | 'text'           // 2. 일반 텍스트
  | 'image'          // 3. 이미지
  | 'image_text'     // 4. 이미지 + 텍스트
  | 'multi_image'    // 5. 여러 개의 이미지
  | 'info_list'      // 6. 정보 목록
  | 'feature_cards'  // 7. 특징 소개 카드
  | 'button_cta'     // 8. 버튼 / 안내 배너
  | 'divider'        // 9. 구분선
  | 'signature'      // 10. 대표이사 서명 / 직책 / 이름
  | 'spacer';        // 11. 여백

export interface CustomSectionItem {
  id: string;
  type: SectionType;
  title?: string;
  subtitle?: string;
  badge?: string;
  content?: string;
  imageUrl?: string;
  images?: string[];
  imagePosition?: 'left' | 'right' | 'top';
  imageSize?: 'small' | 'medium' | 'large' | 'full';
  authorRole?: string;
  authorName?: string;
  signatureImageUrl?: string;
  spacerHeight?: number | string;
  layout?: '1-col' | '2-col' | '3-col' | '4-col';
  infoItems?: { label: string; value: string }[];
  cardItems?: { title: string; desc: string; icon?: string; badge?: string; imageUrl?: string }[];
  buttonText?: string;
  buttonLink?: string;
  buttonAction?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  secondaryButtonAction?: string;
  visible: boolean;
  order: number;
}

export interface CompanySubpageItem {
  id: 'intro' | 'history' | 'system' | 'permits' | 'location' | string;
  menuLabel: string;
  badgeTitle?: string;
  title: string;
  subtitle?: string;
  description?: string;
  visible: boolean;
  order: number;
}

export interface MainSectionConfig {
  id: string;
  name: string;
  badge?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  visible: boolean;
  order: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: '샘플신청' | '납품·단가' | '보관·유통' | '배송안내' | string;
  visible?: boolean;
  order?: number;
}

export interface NavSubmenuItem {
  id: string;
  label: string;
  actionType: 'page' | 'section' | 'scroll' | 'board' | 'quote' | 'sample' | 'external' | 'url' | 'wholesale';
  target: string;
  subTarget?: string;
}

export interface NavMenuItem {
  id: string;
  name: string;
  link?: string;
  actionType?: 'page' | 'section' | 'scroll' | 'board' | 'quote' | 'sample' | 'external' | 'url' | 'wholesale';
  target?: string;
  subTarget?: string;
  visible: boolean;
  submenus: NavSubmenuItem[];
}

export interface HistoryItem {
  year: string;
  title: string;
  desc: string;
}

export interface ProcessStepItem {
  step: number;
  title: string;
  desc: string;
  imageUrl: string;
  badge?: string;
}

export interface WholesaleStepItem {
  step: number;
  title: string;
  desc: string;
}

export interface SiteContent {
  brandName: string;
  brandSubName: string;
  tagline: string;
  logoUrl?: string;
  
  // Navigation Menus (GNB)
  navMenus: NavMenuItem[];
  
  // Hero Banner Slider
  banners: BannerSlide[];

  // Legacy single hero fields kept for backwards-compatibility
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImageUrl: string;
  heroBadges: string[];
  stats: {
    label: string;
    value: string;
    unit: string;
    sublabel: string;
  }[];
  
  // Company & Contact
  companyName: string;
  ceoName: string;
  businessNumber: string;
  mailOrderNumber: string;
  haccpNumber: string;
  factoryAddress: string;
  hqAddress: string;
  phone: string;
  fax: string;
  email: string;
  csHours: string;
  lunchHours: string;
  footerNotice?: string;

  // Story & Brand Info
  storyTitle: string;
  storySubtitle: string;
  storyParagraph1: string;
  storyParagraph2: string;
  coreValues: {
    title: string;
    desc: string;
    icon: string;
  }[];

  // Facility & FAQ
  facilityItems: FacilityMediaItem[];
  faqItems: FaqItem[];

  // 1. Company About Page Content (4 Detailed Subpages)
  aboutBannerImage?: string;
  aboutTitle?: string;
  aboutDescription?: string;
  ceoGreeting?: string;
  ceoImageUrl?: string;
  ceoSubtitle?: string;
  ceoTitle?: string;
  ceoHighlight?: string;
  ceoRole?: string;
  ceoSignatureImage?: string;
  historyItems?: HistoryItem[];

  // Subpage 2: Production & System
  systemTitle?: string;
  systemDescription?: string;
  systemFacilityImage?: string;
  systemLogisticsImage?: string;
  systemSteps?: { step: string; title: string; desc: string; img: string }[];

  // Subpage 3: Permits & Legal
  permitsTitle?: string;
  permitsDescription?: string;
  permitsList?: { title: string; issuer: string; number: string; desc: string; status: string }[];

  // Subpage 4: Location & Map
  locationTitle?: string;
  locationDescription?: string;
  locationGuide?: string;
  locationMapEmbed?: string;
  transitInfo?: string;
  parkingInfo?: string;

  // 2. Manufacturing Process Page Content
  processTitle?: string;
  processSubtitle?: string;
  processDescription?: string;
  processSteps?: ProcessStepItem[];
  qualityNotice?: string;

  // 3. Wholesale Guide Page Content
  wholesaleTitle?: string;
  wholesaleSubtitle?: string;
  wholesaleDescription?: string;
  deliveryRegions?: string;
  deliveryMethods?: string;
  deliverySteps?: WholesaleStepItem[];
  wholesaleImages?: string[];
  wholesaleFaqs?: { question: string; answer: string }[];

  // 4. Customer Service Content
  csNoticeTitle?: string;
  csNoticeDesc?: string;
  sampleGuideText?: string;
  quoteGuideText?: string;

  // 5. Dynamic Categories & Subpages
  faqCategories?: FaqCategoryItem[];
  productCategoriesList?: ProductCategoryItem[];
  companySubpages?: CompanySubpageItem[];
  mainSections?: MainSectionConfig[];
  pageSections?: Record<string, CustomSectionItem[]>;
}

export interface ThemeSettings {
  primaryColor: string; // #872D35 Deep Burgundy
  accentColor: string;  // #B64346 Sub Red
  darkBrown: string;    // #332525 Dark Brown
  creamWhite: string;   // #FAF8F5 Cream White
  warmGrey: string;     // #EEEAE6 Warm Grey
  fontFamily: 'pretendard' | 'noto-sans' | 'myeongjo';
  cardRadius: 'rounded-none' | 'rounded-lg' | 'rounded-xl' | 'rounded-2xl';
  sectionsVisible: {
    hero: boolean;
    stats: boolean;
    productSlider: boolean;
    sampleRealtimeStatus?: boolean;
    actionBanners: boolean;
    productCategories: boolean;
    features: boolean;
    products: boolean;
    process: boolean;
    b2bHighlights: boolean;
    reviews: boolean;
    faq: boolean;
    posts: boolean;
    inquiry: boolean;
  };
}

export interface ProductItem {
  id: string;
  name: string;
  subtitle: string;
  category: '보쌈무김치' | '김칫속/양념' | '업소용 대용량' | '소포장/밀키트' | string;
  tag: string;
  weight: string;
  storage: string;
  shelfLife: string;
  ingredients: string;
  description: string;
  imageUrl: string;
  detailImageUrl?: string;
  detailImages?: string[];
  origin?: string;
  packagingType?: string;
  minOrder?: string;
  deliveryInfo?: string;
  isPopular?: boolean;
  isRecommended?: boolean;
  order?: number;
  visible?: boolean;
  features?: string[];
  specs?: string;
  bulkPriceGuide: string;
  contactPhone?: string;
  buttonText?: string;
  buttonAction?: string;
  categories?: string[];
  customSections?: CustomSectionItem[];
}

export interface PostItem {
  id: string;
  title: string;
  category: '공지사항' | '조리·활용 레시피' | 'B2B 납품스토리' | '이벤트' | string;
  author: string;
  date: string;
  content: string;
  readCount: number;
  thumbnail: string;
  imageUrl?: string;
  tags: string[];
  isPinned?: boolean;
}

export interface ReviewItem {
  id: string;
  clientName: string;
  businessType: string;
  rating: number;
  comment: string;
  date: string;
  location: string;
  verifiedPartner: boolean;
  storeName?: string;
  ownerName?: string;
}

export interface B2BInquiry {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  businessType: string;
  requestType: '무료 샘플 요청' | '대량 납품 견적' | 'OEM/PB 제휴 문의';
  monthlyUsage: string;
  region: string;
  message: string;
  status: '접수대기' | '접수완료' | '답변완료' | '배송준비' | '배송완료' | '샘플발송완료' | '상담완료' | '보류' | '접수' | '완료' | string;
  createdAt: string;
  adminMemo?: string;

  // Sample Board specific fields
  postNumber?: number;
  title?: string;
  writer?: string;
  storeName?: string;
  address?: string;
  selectedProducts?: string[];
  password?: string;
  isSecret?: boolean;
  readCount?: number;
  adminReply?: {
    content: string;
    repliedAt: string;
    author: string;
  };
}

// 1:1 대량 납품 견적 상담 Inquiry interface
export interface QuoteInquiry {
  id: string;
  postNumber: number;
  title: string;
  companyName: string; // 업체명 / 상호명 (필수)
  contactPerson: string; // 담당자 성함 (필수)
  phone: string; // 연락처 (필수)
  email?: string; // 이메일
  region?: string; // 납품 희망 지역
  businessType?: string; // 업종 형태
  interestedProducts: string[]; // 관심 제품
  monthlyVolume?: string; // 예상 월 납품 수량
  deliverySchedule?: string; // 희망 납품 일정
  message: string; // 상담 내용
  attachments?: { name: string; url?: string; size?: string }[];
  passwordHash?: string; // 게시글 비밀번호 (SHA-256 해시)
  rawPasswordHint?: string; // For mock verification fallback
  isSecret: boolean;
  status: '접수완료' | '상담중' | '견적완료' | string;
  readCount: number;
  createdAt: string;
  adminReply?: {
    content: string;
    repliedAt: string;
    author: string;
  };
  adminMemo?: string;
}

// Form builder field & config definitions
export interface FormFieldItem {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'tel' | 'email' | 'textarea' | 'checkbox' | 'select' | 'password';
  required: boolean;
  order: number;
  enabled: boolean;
  placeholder?: string;
  options?: string[];
}

export interface FormConfig {
  sampleFormFields: FormFieldItem[];
  sampleProductOptions: string[];
  sampleStatuses: string[];
  samplePrivacyText: string;
  quoteFormFields: FormFieldItem[];
  quoteProductOptions: string[];
  quoteStatuses: string[];
  quotePrivacyText: string;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  canonicalUrl: string;
}

export interface SocialSettings {
  instagramUrl: string;
  youtubeUrl: string;
  naverBlogUrl: string;
  kakaoTalkUrl: string;
  smartStoreUrl: string;
  coupangUrl: string;
}

export interface AppState {
  content: SiteContent;
  theme: ThemeSettings;
  products: ProductItem[];
  posts: PostItem[];
  reviews: ReviewItem[];
  inquiries: B2BInquiry[];
  quotes: QuoteInquiry[];
  formConfig: FormConfig;
  seo: SeoSettings;
  social: SocialSettings;
  formspreeEndpoint: string;
}
