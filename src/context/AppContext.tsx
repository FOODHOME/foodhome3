import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  AppState, 
  SiteContent, 
  ThemeSettings, 
  ProductItem, 
  PostItem, 
  ReviewItem, 
  B2BInquiry, 
  QuoteInquiry,
  BannerSlide,
  FormConfig,
  SeoSettings, 
  SocialSettings,
  FacilityMediaItem,
  NavMenuItem,
  FaqItem,
  FaqCategoryItem,
  ProductCategoryItem,
  CompanySubpageItem,
  MainSectionConfig,
  CustomSectionItem
} from '../types';
import { initialData } from '../data/initialData';
import { getDefaultPageSections } from '../data/defaultPageSections';
import { 
  getSupabaseClient, 
  getSavedSupabaseConfig, 
  loadPublicRuntimeSupabaseConfig,
  saveSupabaseConfig, 
  isSiteAdmin,
  hashPassword,
  verifyQuotePasswordWithHash,
  fetchPublicSiteContents,
  publishPublicSiteContents,
  PublicSitePayload,
  SupabaseConfig,
  RecoveryFailureReason,
  OtpRecoveryErrorType,
  isAuthCallbackHash,
  inspectAuthCallbackUrl,
  consumeLegacyAuthUrlNotice,
  sendPasswordResetOtpEmail,
  verifyPasswordRecoveryOtp,
  isManualOtpRecoveryActive,
  isPasswordRecoveryPending,
  setPasswordRecoveryPending,
  getSavedRecoveryEmail,
  clearAuthUrlParams,
  updatePasswordInRecovery,
  fetchBoardPosts,
  createBoardPostInDb,
  updateBoardPostInDb,
  deleteBoardPostInDb,
  incrementBoardPostReadInDb,
  migrateLocalPostsToBoardTable,
  fetchPrivateInquiriesForBoard,
  submitPrivateInquiryToBoard,
  unlockPrivateInquiryFromBoard,
  updatePrivateInquiryByAuthorInBoard,
  deletePrivateInquiryByAuthorInBoard,
  adminUpdatePrivateInquiryInBoard,
  adminDeletePrivateInquiryInBoard,
  migrateLocalInquiriesAndQuotesToBoard,
  getLocalStorageUsageStats,
  migrateDataUrlsInStateToStorage,
  LocalStorageUsageStats
} from '../lib/supabase';

interface AppContextType {
  state: AppState;
  updateContent: (newContent: Partial<SiteContent>) => void;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
  updateNavMenus: (menus: NavMenuItem[]) => void;
  updateNavMenuItem: (id: string, updates: Partial<NavMenuItem>) => void;
  
  // Products
  addProduct: (product: Omit<ProductItem, 'id'>) => void;
  updateProduct: (id: string, product: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
  
  // Posts (Notice / Recipe / Story / Community)
  addPost: (
    post: Omit<PostItem, 'id' | 'readCount' | 'date'>,
    visitorPassword?: string
  ) => Promise<{ success: boolean; id?: string; syncedToDb?: boolean; error?: string }>;
  updatePost: (
    id: string,
    post: Partial<PostItem>,
    visitorPassword?: string
  ) => Promise<{ success: boolean; error?: string }>;
  deletePost: (id: string, visitorPassword?: string) => Promise<{ success: boolean; error?: string }>;
  incrementPostRead: (id: string) => void;

  // Reviews
  addReview: (review: Omit<ReviewItem, 'id'>) => void;
  updateReview: (id: string, updates: Partial<ReviewItem>) => void;
  deleteReview: (id: string) => void;
  reorderReviews: (reviews: ReviewItem[]) => void;

  // FAQ Items & Categories
  addFaqItem: (item: Omit<FaqItem, 'id'>) => void;
  updateFaqItem: (id: string, updates: Partial<FaqItem>) => void;
  deleteFaqItem: (id: string) => void;
  reorderFaqItems: (items: FaqItem[]) => void;
  updateFaqCategories: (categories: FaqCategoryItem[]) => void;

  // Categories & Subpages
  updateProductCategories: (categories: ProductCategoryItem[]) => void;
  updateCompanySubpages: (subpages: CompanySubpageItem[]) => void;
  updateMainSections: (sections: MainSectionConfig[]) => void;
  updatePageSections: (pageId: string, sections: CustomSectionItem[]) => void;
  reorderProducts: (products: ProductItem[]) => void;

  // Inquiries
  addInquiry: (inquiry: Omit<B2BInquiry, 'id' | 'createdAt' | 'status'>) => void;
  updateInquiryStatus: (id: string, status: B2BInquiry['status'], adminMemo?: string) => void;
  deleteInquiry: (id: string) => void;

  // SEO & Social
  updateSeo: (newSeo: Partial<SeoSettings>) => void;
  updateSocial: (newSocial: Partial<SocialSettings>) => void;
  updateFormspreeEndpoint: (endpoint: string) => void;

  // Reset & Import
  resetToDefaults: () => void;
  importData: (imported: AppState) => boolean;

  // UI State & Subpages
  activePage: string;
  setActivePage: (page: string) => void;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  navigateToProductDetail: (productId: string) => void;
  companyAboutTab: string;
  setCompanyAboutTab: (tab: string) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;
  isSampleModalOpen: boolean;
  setIsSampleModalOpen: (open: boolean) => void;
  isWholesaleModalOpen: boolean;
  setIsWholesaleModalOpen: (open: boolean) => void;
  selectedProductForDetail: ProductItem | null;
  setSelectedProductForDetail: (product: ProductItem | null) => void;
  selectedPostForDetail: PostItem | null;
  setSelectedPostForDetail: (post: PostItem | null) => void;
  selectedFacilityMedia: FacilityMediaItem | null;
  setSelectedFacilityMedia: (item: FacilityMediaItem | null) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Supabase & Admin Authentication
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (logged: boolean) => void;
  isSupabaseAdminAuthed: boolean;
  supabaseAdminEmail: string | null;
  isSyncingFromSupabase: boolean;
  isPublishingToSupabase: boolean;
  hasUnpublishedChanges: boolean;
  setHasUnpublishedChanges: (dirty: boolean) => void;
  lastSupabasePublishAt: string | null;
  lastSupabaseSyncError: string | null;
  remoteSiteContentsInfo: { exists: boolean; updatedAt: string | null } | null;
  publishPublicContentsToSupabase: (overridePartial?: Partial<AppState>) => Promise<{ success: boolean; updatedAt?: string; error?: string }>;
  pullPublicContentsFromSupabase: () => Promise<{ success: boolean; error?: string }>;
  syncPublicConfigForVisitor: () => Promise<void>;
  handleAdminLogin: (credentials: { email?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  handleAdminLogout: () => Promise<void>;
  supabaseConfig: { url: string; anonKey: string };
  updateSupabaseConfig: (cfg: { url: string; anonKey: string }) => void;

  // Remote Boards Sync & Storage Diagnostics
  isBoardSyncing: boolean;
  boardSyncInfo: {
    postsTableMissing: boolean;
    privateTableMissing: boolean;
    syncedFromSupabase: boolean;
    lastSyncedAt: string | null;
    error: string | null;
  };
  localStorageStats: LocalStorageUsageStats;
  localStorageQuotaError: string | null;
  refreshBoardsFromSupabase: (forceAdmin?: boolean) => Promise<void>;
  migrateLocalBoardsToSupabase: () => Promise<{
    success: boolean;
    postsCount: number;
    inquiriesCount: number;
    error?: string;
  }>;
  migrateEmbeddedImagesToStorage: () => Promise<{
    success: boolean;
    migratedCount: number;
    failedCount: number;
    error?: string;
  }>;

  // Password Recovery Flow (Supabase Auth Email OTP verifyOtp)
  isPasswordRecoveryMode: boolean;
  isCheckingRecoverySession: boolean;
  hasValidRecoverySession: boolean;
  passwordRecoveryEmail: string | null;
  passwordRecoveryError: string | null;
  passwordRecoveryFailureReason: RecoveryFailureReason | null;
  passwordResetSuccessNotice: string | null;
  legacyAuthLinkNotice: string | null;
  clearPasswordResetSuccessNotice: () => void;
  clearLegacyAuthLinkNotice: () => void;
  requestPasswordResetOtp: (email: string) => Promise<{
    success: boolean;
    cooldownSeconds?: number;
    recoverEndpoint?: string;
    errorType?: OtpRecoveryErrorType;
    error?: string;
  }>;
  verifyPasswordResetOtp: (email: string, token: string) => Promise<{
    success: boolean;
    email?: string;
    errorType?: OtpRecoveryErrorType;
    error?: string;
  }>;
  submitPasswordRecoveryUpdate: (newPassword: string) => Promise<{
    success: boolean;
    errorType?: OtpRecoveryErrorType;
    error?: string;
  }>;
  finishPasswordRecoveryToLogin: () => void;
  cancelPasswordRecovery: () => Promise<void>;
  
  // Sample Board Post Helpers
  addSamplePost: (post: {
    title: string;
    companyName: string;
    storeName: string;
    contactPerson: string;
    phone: string;
    address: string;
    selectedProducts: string[];
    message: string;
    password: string;
  }) => Promise<{ success: boolean; id?: string; syncedToDb?: boolean; error?: string }>;
  updateSamplePostReply: (id: string, reply: string, status?: B2BInquiry['status']) => void;
  verifyPostPassword: (postId: string, passwordInput: string) => boolean;
  unlockSamplePost: (postId: string, passwordInput: string) => Promise<{
    verified: boolean;
    post?: B2BInquiry;
    passwordHash?: string;
    error?: string;
  }>;
  updateSamplePostByVisitor: (
    id: string,
    passwordHash: string,
    title: string,
    message: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteSamplePostByVisitor: (
    id: string,
    passwordHash: string
  ) => Promise<{ success: boolean; error?: string }>;

  // 1:1 Quote Inquiries Helpers
  addQuoteInquiry: (quote: {
    title: string;
    companyName: string;
    contactPerson: string;
    phone: string;
    email?: string;
    region?: string;
    businessType?: string;
    interestedProducts: string[];
    monthlyVolume?: string;
    deliverySchedule?: string;
    message: string;
    attachments?: { name: string; url?: string; size?: string }[];
    password: string;
  }) => Promise<{ success: boolean; id?: string; syncedToDb?: boolean; error?: string }>;
  updateQuoteStatus: (id: string, status: string, adminMemo?: string) => void;
  updateQuoteReply: (id: string, reply: string, status?: string) => void;
  deleteQuoteInquiry: (id: string) => void;
  verifyQuotePassword: (quoteId: string, passwordInput: string) => Promise<boolean>;
  unlockQuotePost: (quoteId: string, passwordInput: string) => Promise<{
    verified: boolean;
    quote?: QuoteInquiry;
    passwordHash?: string;
    error?: string;
  }>;
  updateQuoteByVisitor: (
    id: string,
    passwordHash: string,
    title: string,
    message: string
  ) => Promise<{ success: boolean; error?: string }>;
  deleteQuoteByVisitor: (
    id: string,
    passwordHash: string
  ) => Promise<{ success: boolean; error?: string }>;

  // Main Banner & Form Config
  updateBanners: (banners: BannerSlide[]) => void;
  updateFormConfig: (config: Partial<FormConfig>) => void;
}

const STORAGE_KEY = 'foodhome_app_data_v4';
const SYNCED_BOARD_IDS_KEY = 'foodhome_synced_board_ids_v1';

interface SyncedBoardIds {
  posts: string[];
  inquiries: string[];
  quotes: string[];
}

function loadSyncedBoardIds(): SyncedBoardIds {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(SYNCED_BOARD_IDS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          posts: Array.isArray(parsed?.posts) ? parsed.posts : [],
          inquiries: Array.isArray(parsed?.inquiries) ? parsed.inquiries : [],
          quotes: Array.isArray(parsed?.quotes) ? parsed.quotes : []
        };
      }
    }
  } catch {}
  return { posts: [], inquiries: [], quotes: [] };
}

function saveSyncedBoardIds(ids: SyncedBoardIds): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(SYNCED_BOARD_IDS_KEY, JSON.stringify(ids));
    }
  } catch {}
}

function maskKoreanName(nameInput: string): string {
  const name = (nameInput || '').trim();
  if (!name) return '고객';
  if (name.length > 2) return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
  if (name.length === 2) return `${name[0]}*`;
  return name;
}

export function stripSample1kgFromText(text?: string): string {
  if (!text || typeof text !== 'string') return text || '';
  return text
    .replace(/사업자\s*무료\s*샘플\s*1kg/gi, (m) => m.replace(/\s*1kg/gi, ''))
    .replace(/사업자\s*1kg\s*(무료\s*샘플(?:팩)?)/gi, '사업자 $1')
    .replace(/사업자\s*무료\s*1kg\s*(샘플(?:팩)?)/gi, '사업자 무료 $1')
    .replace(/(무료\s*샘플(?:팩)?)\s*1kg/gi, '$1')
    .replace(/1kg\s*(무료\s*샘플(?:팩)?|무료\s*테스팅팩|정품\s*맛보기\s*샘플|본품\s*샘플팩)/gi, '$1')
    .replace(/무료\s*1kg\s*(샘플(?:팩)?)/gi, '무료 $1')
    .replace(/FREE\s+1KG\s+SAMPLE/gi, 'FREE SAMPLE')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
}

function normalizeStateWithDefaults(
  baseState: AppState,
  parsed: Partial<AppState> | Partial<PublicSitePayload>,
  preservePrivate?: { inquiries: B2BInquiry[]; quotes: QuoteInquiry[] }
): AppState {
  const parsedAsApp = parsed as Partial<AppState>;
  const parsedContent = parsed.content;
  const rawContent = {
    ...baseState.content,
    ...(parsedContent || {})
  };
  const parsedNavMenus = parsedContent?.navMenus;
  const cleanedNavMenus = (
    Array.isArray(parsedNavMenus) && parsedNavMenus.length > 0
      ? parsedNavMenus
      : baseState.content.navMenus
  ).map((menu: any) => ({
    ...menu,
    name: stripSample1kgFromText(menu.name),
    submenus: Array.isArray(menu.submenus)
      ? menu.submenus.map((sub: any) => ({
          ...sub,
          label: stripSample1kgFromText(sub.label)
        }))
      : menu.submenus
  }));

  const parsedBanners = parsedContent?.banners;
  const cleanedBanners = (
    Array.isArray(parsedBanners) && parsedBanners.length > 0
      ? parsedBanners
      : baseState.content.banners
  ).map((b: any) => ({
    ...b,
    title: stripSample1kgFromText(b.title),
    subtitle: stripSample1kgFromText(b.subtitle),
    description: stripSample1kgFromText(b.description),
    primaryButtonText: stripSample1kgFromText(b.primaryButtonText),
    secondaryButtonText: stripSample1kgFromText(b.secondaryButtonText)
  }));

  const parsedMainSections = parsedContent?.mainSections;
  const cleanedMainSections = (
    Array.isArray(parsedMainSections) && parsedMainSections.length > 0
      ? parsedMainSections.map((sec: any) =>
          sec.id === 'reviews' && sec.title === '전국 480여 개 외식 파트너의 생생한 찬사'
            ? { ...sec, title: '전국 프랜차이즈 및 외식업체 대표님들의 후기' }
            : sec
        )
      : (baseState.content.mainSections || [])
  ).map((sec: any) => ({
    ...sec,
    name: stripSample1kgFromText(sec.name),
    badge: stripSample1kgFromText(sec.badge),
    title: stripSample1kgFromText(sec.title),
    description: stripSample1kgFromText(sec.description),
    buttonText: stripSample1kgFromText(sec.buttonText)
  }));

  const resolvedPageSections = (() => {
    const savedSections = parsed.content?.pageSections;
    if (!savedSections) return baseState.content.pageSections;
    const introList = savedSections['about-intro'] || savedSections['intro'];
    if (Array.isArray(introList) && introList.length > 0) {
      const hasModernIntro = introList.some(
        (s: any) =>
          s.id === 'sec-intro-text-1' ||
          s.id === 'sec-intro-image' ||
          s.id === 'sec-intro-signature' ||
          s.type === 'signature'
      );
      const isLegacyUntouchedIntro =
        !hasModernIntro &&
        introList.some((s: any) => s.id === 'sec-intro-ceo' && s.visible !== false);
      if (isLegacyUntouchedIntro) {
        const defs = getDefaultPageSections('about-intro', parsed.content || {});
        const merged = [
          ...defs.slice(0, 4),
          ...introList.map((s: any) => {
            if (['sec-intro-corporate', 'sec-intro-values', 'sec-intro-cta', 'sec-intro-ceo'].includes(s.id)) {
              return { ...s, visible: false };
            }
            return s;
          })
        ];
        return {
          ...savedSections,
          'about-intro': merged
        };
      }
    }
    return savedSections;
  })();

  const cleanedPageSections = resolvedPageSections
    ? Object.fromEntries(
        Object.entries(resolvedPageSections).map(([key, list]) => [
          key,
          Array.isArray(list)
            ? list.map((sec: any) => ({
                ...sec,
                title: stripSample1kgFromText(sec.title),
                subtitle: stripSample1kgFromText(sec.subtitle),
                content: stripSample1kgFromText(sec.content),
                buttonText: stripSample1kgFromText(sec.buttonText),
                secondaryButtonText: stripSample1kgFromText(sec.secondaryButtonText),
                cardItems: Array.isArray(sec.cardItems)
                  ? sec.cardItems.map((c: any) => ({
                      ...c,
                      title: stripSample1kgFromText(c.title),
                      desc: stripSample1kgFromText(c.desc)
                    }))
                  : sec.cardItems
              }))
            : list
        ])
      )
    : resolvedPageSections;

  const cleanedProducts = (
    Array.isArray(parsed.products) && parsed.products.length > 0
      ? parsed.products
      : baseState.products
  ).map((p: any) => ({
    ...p,
    buttonText: p.buttonText ? stripSample1kgFromText(p.buttonText) : p.buttonText,
    ctaButtons: Array.isArray(p.ctaButtons)
      ? p.ctaButtons.map((btn: any) => ({
          ...btn,
          text: stripSample1kgFromText(btn.text)
        }))
      : p.ctaButtons
  }));

  const resolvedFormConfig = parsed.formConfig
    ? { ...baseState.formConfig, ...parsed.formConfig }
    : baseState.formConfig;

  const cleanedFormConfig = {
    ...resolvedFormConfig,
    sampleFormFields: Array.isArray(resolvedFormConfig.sampleFormFields)
      ? resolvedFormConfig.sampleFormFields.map((f: any) => ({
          ...f,
          placeholder: f.placeholder ? stripSample1kgFromText(f.placeholder) : f.placeholder
        }))
      : resolvedFormConfig.sampleFormFields
  };

  return {
    ...baseState,
    ...parsed,
    content: {
      ...rawContent,
      floatingSampleText: stripSample1kgFromText(rawContent.floatingSampleText),
      footerQuickSampleText: stripSample1kgFromText(rawContent.footerQuickSampleText),
      sampleGuideText: stripSample1kgFromText(rawContent.sampleGuideText),
      deliverySteps: Array.isArray(rawContent.deliverySteps)
        ? rawContent.deliverySteps.map((step: any) => ({
            ...step,
            title: stripSample1kgFromText(step.title),
            desc: stripSample1kgFromText(step.desc)
          }))
        : rawContent.deliverySteps,
      navMenus: cleanedNavMenus,
      banners: cleanedBanners,
      facilityItems:
        Array.isArray(parsed.content?.facilityItems) && parsed.content.facilityItems.length > 0
          ? parsed.content.facilityItems
          : baseState.content.facilityItems,
      faqItems: (Array.isArray(parsed.content?.faqItems)
        ? parsed.content.faqItems
        : baseState.content.faqItems
      ).map((faq: any) => ({
        ...faq,
        question: stripSample1kgFromText(faq.question),
        answer: stripSample1kgFromText(faq.answer)
      })),
      faqCategories:
        Array.isArray(parsed.content?.faqCategories) && parsed.content.faqCategories.length > 0
          ? parsed.content.faqCategories
          : baseState.content.faqCategories,
      productCategoriesList:
        Array.isArray(parsed.content?.productCategoriesList) &&
        parsed.content.productCategoriesList.length > 0
          ? parsed.content.productCategoriesList
          : baseState.content.productCategoriesList,
      companySubpages:
        Array.isArray(parsed.content?.companySubpages) && parsed.content.companySubpages.length > 0
          ? parsed.content.companySubpages
          : baseState.content.companySubpages,
      mainSections: cleanedMainSections,
      pageSections: cleanedPageSections
    },
    theme: {
      ...baseState.theme,
      ...(parsed.theme || {}),
      primaryColor:
        parsed.theme?.primaryColor === '#1e40af' || !parsed.theme?.primaryColor
          ? baseState.theme.primaryColor
          : parsed.theme.primaryColor,
      accentColor:
        parsed.theme?.accentColor === '#2563eb' || !parsed.theme?.accentColor
          ? baseState.theme.accentColor
          : parsed.theme.accentColor,
      sectionsVisible: {
        ...baseState.theme.sectionsVisible,
        ...((parsed.theme && parsed.theme.sectionsVisible) || {})
      }
    },
    products: cleanedProducts,
    posts: Array.isArray(parsed.posts) ? parsed.posts : baseState.posts,
    reviews: Array.isArray(parsed.reviews) ? parsed.reviews : baseState.reviews,
    inquiries: preservePrivate
      ? preservePrivate.inquiries
      : Array.isArray(parsedAsApp.inquiries)
      ? parsedAsApp.inquiries
      : baseState.inquiries,
    quotes: preservePrivate
      ? preservePrivate.quotes
      : Array.isArray(parsedAsApp.quotes)
      ? parsedAsApp.quotes
      : baseState.quotes,
    formConfig: cleanedFormConfig,
    seo: {
      ...baseState.seo,
      ...(parsed.seo || {}),
      metaDescription: stripSample1kgFromText((parsed.seo || baseState.seo).metaDescription),
      ogDescription: stripSample1kgFromText((parsed.seo || baseState.seo).ogDescription)
    },
    social: { ...baseState.social, ...(parsed.social || {}) },
    formspreeEndpoint:
      parsed.formspreeEndpoint || baseState.formspreeEndpoint || 'https://formspree.io/f/xoejykbn'
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const hadSavedLocalStorageRef = useRef<boolean>(false);
  const [state, setState] = useState<AppState>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
            hadSavedLocalStorageRef.current = true;
            return normalizeStateWithDefaults(initialData, parsed);
          }
        }
      }
    } catch (e) {
      console.warn('LocalStorage initialization fallback to initialData:', e);
    }
    return initialData;
  });

  const [activePage, setActivePage] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        if (inspectAuthCallbackUrl().hasAuthParams) return 'home';
        if (window.location.hash) {
          const hash = window.location.hash.replace('#', '');
          if (isAuthCallbackHash(hash)) return 'home';
          if (hash.startsWith('product/')) return 'product-detail';
          if (hash) return hash;
        }
      }
    } catch {}
    return 'home';
  });

  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    try {
      if (typeof window !== 'undefined') {
        if (window.location.hash.startsWith('#product/')) {
          return window.location.hash.replace('#product/', '');
        }
        const saved = sessionStorage.getItem('foodhome_selected_product_id');
        if (saved) return saved;
      }
    } catch {}
    return 'prod-1';
  });

  const navigateToProductDetail = (productId: string) => {
    setSelectedProductId(productId);
    setActivePage('product-detail');
    try {
      sessionStorage.setItem('foodhome_selected_product_id', productId);
      if (typeof window !== 'undefined') {
        window.location.hash = `product/${productId}`;
      }
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSetActivePage = (page: string) => {
    if (page.startsWith('product:')) {
      const pId = page.replace('product:', '');
      navigateToProductDetail(pId);
      return;
    }
    setActivePage(page);
    try {
      if (typeof window !== 'undefined') {
        if (page === 'product-detail') {
          window.location.hash = `product/${selectedProductId}`;
        } else if (page === 'home') {
          window.location.hash = '';
        } else {
          window.location.hash = page;
        }
      }
    } catch {}
  };

  // Sync hashchange to activePage and selectedProductId
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (isAuthCallbackHash(hash) || inspectAuthCallbackUrl().hasAuthParams) {
        return;
      }
      if (!hash || hash === 'home') {
        setActivePage('home');
      } else if (hash.startsWith('product/')) {
        const pId = hash.replace('product/', '');
        setSelectedProductId(pId);
        setActivePage('product-detail');
      } else {
        setActivePage(hash);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  const [companyAboutTab, setCompanyAboutTab] = useState<string>('intro');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const isAdminOpenRef = useRef(isAdminOpen);
  useEffect(() => {
    isAdminOpenRef.current = isAdminOpen;
  }, [isAdminOpen]);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return sessionStorage.getItem('foodhome_admin_session') === 'true';
    } catch {
      return false;
    }
  });
  const isAdminLoggedInRef = useRef(isAdminLoggedIn);
  useEffect(() => {
    isAdminLoggedInRef.current = isAdminLoggedIn;
  }, [isAdminLoggedIn]);

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => getSavedSupabaseConfig());
  const [isSupabaseAdminAuthed, setIsSupabaseAdminAuthed] = useState(false);
  const isSupabaseAdminAuthedRef = useRef(isSupabaseAdminAuthed);
  useEffect(() => {
    isSupabaseAdminAuthedRef.current = isSupabaseAdminAuthed;
  }, [isSupabaseAdminAuthed]);
  const [supabaseAdminEmail, setSupabaseAdminEmail] = useState<string | null>(null);
  const [isSyncingFromSupabase, setIsSyncingFromSupabase] = useState(false);
  const [isPublishingToSupabase, setIsPublishingToSupabase] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [lastSupabasePublishAt, setLastSupabasePublishAt] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('foodhome_last_supabase_publish_at');
      }
    } catch {}
    return null;
  });
  const [lastSupabaseSyncError, setLastSupabaseSyncError] = useState<string | null>(null);
  const [remoteSiteContentsInfo, setRemoteSiteContentsInfo] = useState<{ exists: boolean; updatedAt: string | null } | null>(null);

  const [isBoardSyncing, setIsBoardSyncing] = useState(false);
  const [boardSyncInfo, setBoardSyncInfo] = useState<{
    postsTableMissing: boolean;
    privateTableMissing: boolean;
    syncedFromSupabase: boolean;
    lastSyncedAt: string | null;
    error: string | null;
  }>({
    postsTableMissing: false,
    privateTableMissing: false,
    syncedFromSupabase: false,
    lastSyncedAt: null,
    error: null
  });
  const [localStorageQuotaError, setLocalStorageQuotaError] = useState<string | null>(null);
  const localStorageStats = useMemo(() => getLocalStorageUsageStats(state), [state]);

  const [isPasswordRecoveryMode, setIsPasswordRecoveryMode] = useState<boolean>(() => isPasswordRecoveryPending());
  const [isCheckingRecoverySession, setIsCheckingRecoverySession] = useState<boolean>(() => isPasswordRecoveryPending());
  const [hasValidRecoverySession, setHasValidRecoverySession] = useState<boolean>(false);
  const [passwordRecoveryEmail, setPasswordRecoveryEmail] = useState<string | null>(() => getSavedRecoveryEmail());
  const [passwordRecoveryFailureReason, setPasswordRecoveryFailureReason] = useState<RecoveryFailureReason | null>(null);
  const [passwordRecoveryError, setPasswordRecoveryError] = useState<string | null>(null);
  const [passwordResetSuccessNotice, setPasswordResetSuccessNotice] = useState<string | null>(null);
  const [legacyAuthLinkNotice, setLegacyAuthLinkNotice] = useState<string | null>(null);
  const isPasswordRecoveryModeRef = useRef(isPasswordRecoveryMode);
  useEffect(() => {
    isPasswordRecoveryModeRef.current = isPasswordRecoveryMode;
  }, [isPasswordRecoveryMode]);

  const [activeAdminTab, setActiveAdminTab] = useState('overview');
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isWholesaleModalOpen, setIsWholesaleModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<ProductItem | null>(null);
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<PostItem | null>(null);
  const [selectedFacilityMedia, setSelectedFacilityMedia] = useState<FacilityMediaItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshBoardsFromSupabase = useCallback(async (forceAdmin?: boolean) => {
    const cfg = getSavedSupabaseConfig();
    if (!cfg.url || !cfg.anonKey) return;

    setIsBoardSyncing(true);
    const adminMode = typeof forceAdmin === 'boolean' ? forceAdmin : isSupabaseAdminAuthedRef.current;

    const [postsRes, privateRes] = await Promise.all([
      fetchBoardPosts(adminMode),
      fetchPrivateInquiriesForBoard(adminMode)
    ]);

    setIsBoardSyncing(false);

    const prevSynced = loadSyncedBoardIds();
    const nextSynced: SyncedBoardIds = { ...prevSynced };
    const syncErrors: string[] = [];

    if (!postsRes.ok && postsRes.error) {
      syncErrors.push(postsRes.error);
    }
    if (!privateRes.ok && privateRes.error) {
      syncErrors.push(privateRes.error);
    }

    setBoardSyncInfo({
      postsTableMissing: Boolean(postsRes.tableMissing),
      privateTableMissing: Boolean(privateRes.tableMissing),
      syncedFromSupabase: postsRes.ok || privateRes.ok,
      lastSyncedAt: new Date().toISOString(),
      error: syncErrors.length > 0 ? syncErrors[0] : null
    });

    if (!postsRes.ok && !privateRes.ok) return;

    setState(prev => {
      let nextPosts = prev.posts;
      let nextInquiries = prev.inquiries;
      let nextQuotes = prev.quotes;

      if (postsRes.ok) {
        const remotePosts = postsRes.posts;
        if (remotePosts.length > 0 || prevSynced.posts.length > 0) {
          const remoteIds = new Set(remotePosts.map(p => p.id));
          const syncedSet = new Set(prevSynced.posts);
          const unsyncedLocal = hadSavedLocalStorageRef.current
            ? prev.posts.filter(p => !remoteIds.has(p.id) && !syncedSet.has(p.id))
            : [];
          nextPosts = [...remotePosts, ...unsyncedLocal];
          nextSynced.posts = remotePosts.map(p => p.id);
        }
      }

      if (privateRes.ok) {
        const remoteInq = privateRes.inquiries;
        if (remoteInq.length > 0 || prevSynced.inquiries.length > 0) {
          const prevInqMap = new Map(prev.inquiries.map(i => [i.id, i]));
          const remoteIds = new Set(remoteInq.map(i => i.id));
          const syncedSet = new Set(prevSynced.inquiries);

          const mergedRemoteInq = remoteInq.map(r => {
            const local = prevInqMap.get(r.id);
            if (!local) return r;
            if (adminMode) return { ...local, ...r };
            // For public visitor summaries, preserve any locally created or unlocked PII details
            return {
              ...r,
              companyName: local.phone ? local.companyName : r.companyName,
              storeName: local.phone ? local.storeName : r.storeName,
              contactPerson: local.phone ? local.contactPerson : r.contactPerson,
              phone: local.phone || r.phone,
              email: local.email || r.email,
              address: local.address || r.address,
              region: local.region || r.region,
              selectedProducts:
                local.selectedProducts && local.selectedProducts.length > 0
                  ? local.selectedProducts
                  : r.selectedProducts,
              message: local.message || r.message,
              password: local.password,
              adminReply: r.adminReply
                ? local.adminReply?.content
                  ? local.adminReply
                  : r.adminReply
                : undefined
            };
          });

          const unsyncedLocal = hadSavedLocalStorageRef.current
            ? prev.inquiries.filter(i => !remoteIds.has(i.id) && !syncedSet.has(i.id))
            : [];
          nextInquiries = [...mergedRemoteInq, ...unsyncedLocal];
          nextSynced.inquiries = remoteInq.map(i => i.id);
        }

        const remoteQuotes = privateRes.quotes;
        if (remoteQuotes.length > 0 || prevSynced.quotes.length > 0) {
          const prevQuoteMap = new Map((prev.quotes || []).map(q => [q.id, q]));
          const remoteIds = new Set(remoteQuotes.map(q => q.id));
          const syncedSet = new Set(prevSynced.quotes);

          const mergedRemoteQuotes = remoteQuotes.map(r => {
            const local = prevQuoteMap.get(r.id);
            if (!local) return r;
            if (adminMode) return { ...local, ...r };
            return {
              ...r,
              companyName: local.phone ? local.companyName : r.companyName,
              contactPerson: local.phone ? local.contactPerson : r.contactPerson,
              phone: local.phone || r.phone,
              email: local.email || r.email,
              region: local.region || r.region,
              businessType: local.businessType || r.businessType,
              interestedProducts:
                local.interestedProducts && local.interestedProducts.length > 0
                  ? local.interestedProducts
                  : r.interestedProducts,
              monthlyVolume: local.monthlyVolume || r.monthlyVolume,
              deliverySchedule: local.deliverySchedule || r.deliverySchedule,
              message: local.message || r.message,
              attachments:
                local.attachments && local.attachments.length > 0 ? local.attachments : r.attachments,
              passwordHash: local.passwordHash || r.passwordHash,
              rawPasswordHint: local.rawPasswordHint,
              adminReply: r.adminReply
                ? local.adminReply?.content
                  ? local.adminReply
                  : r.adminReply
                : undefined
            };
          });

          const unsyncedLocal = hadSavedLocalStorageRef.current
            ? (prev.quotes || []).filter(q => !remoteIds.has(q.id) && !syncedSet.has(q.id))
            : [];
          nextQuotes = [...mergedRemoteQuotes, ...unsyncedLocal];
          nextSynced.quotes = remoteQuotes.map(q => q.id);
        }
      }

      saveSyncedBoardIds(nextSynced);
      if (
        nextPosts === prev.posts &&
        nextInquiries === prev.inquiries &&
        nextQuotes === prev.quotes
      ) {
        return prev;
      }
      return {
        ...prev,
        posts: nextPosts,
        inquiries: nextInquiries,
        quotes: nextQuotes
      };
    });
  }, []);

  // Sync Supabase Auth session & fetch public site_contents + remote boards on mount / config change
  useEffect(() => {
    let cancelled = false;
    const legacyNotice = consumeLegacyAuthUrlNotice();
    if (legacyNotice.detected && legacyNotice.message) {
      setLegacyAuthLinkNotice(legacyNotice.message);
      setIsAdminOpen(true);
    }

    const pendingOnMount = isPasswordRecoveryPending();
    if (pendingOnMount) {
      setIsCheckingRecoverySession(true);
    } else {
      setIsCheckingRecoverySession(false);
    }

    const client = getSupabaseClient();
    let subscription: { unsubscribe: () => void } | null = null;

    const initSupabaseSync = async () => {
      // 0. If user refreshed during an already-verified OTP recovery session, verify live session
      let recoveryConfirmedThisRun = false;
      if (pendingOnMount) {
        if (!client) {
          setHasValidRecoverySession(false);
          setPasswordRecoveryPending(false);
          setIsPasswordRecoveryMode(false);
          setPasswordRecoveryFailureReason('supabase_not_configured');
          setPasswordRecoveryError(
            '현재 브라우저에 Supabase 연결 설정(URL / Anon Key)이 없어 인증 세션을 확인할 수 없습니다.'
          );
          setIsCheckingRecoverySession(false);
        } else {
          try {
            const { data: recSessionData, error: recSessionErr } = await client.auth.getSession();
            if (cancelled) return;
            const recUser = recSessionData?.session?.user;
            if (recSessionErr || !recUser) {
              setHasValidRecoverySession(false);
              setPasswordRecoveryPending(false);
              setIsPasswordRecoveryMode(false);
              setIsCheckingRecoverySession(false);
            } else {
              recoveryConfirmedThisRun = true;
              setHasValidRecoverySession(true);
              setPasswordRecoveryEmail(recUser.email || getSavedRecoveryEmail());
              setPasswordRecoveryFailureReason(null);
              setPasswordRecoveryError(null);
              setIsPasswordRecoveryMode(true);
              isPasswordRecoveryModeRef.current = true;
              setIsCheckingRecoverySession(false);
            }
          } catch {
            if (!cancelled) {
              setHasValidRecoverySession(false);
              setPasswordRecoveryPending(false);
              setIsPasswordRecoveryMode(false);
              setIsCheckingRecoverySession(false);
            }
          }
        }
      }

      if (!client) {
        const runtimeCfg = await loadPublicRuntimeSupabaseConfig();
        if (cancelled) return;
        if (
          runtimeCfg &&
          runtimeCfg.url &&
          runtimeCfg.anonKey &&
          (runtimeCfg.url !== supabaseConfig.url || runtimeCfg.anonKey !== supabaseConfig.anonKey)
        ) {
          setSupabaseConfig(runtimeCfg);
          return;
        }
        setIsSupabaseAdminAuthed(false);
        setSupabaseAdminEmail(null);
        setRemoteSiteContentsInfo(null);
        return;
      }

      // 1. Check active Supabase Auth session & site_admins status (skip auto admin login while in recovery)
      let sessionAdminOk = false;
      try {
        const { data: sessionData } = await client.auth.getSession();
        const authUser = sessionData?.session?.user;
        const recoveryActive =
          recoveryConfirmedThisRun || isPasswordRecoveryPending() || isPasswordRecoveryModeRef.current;

        if (authUser) {
          if (recoveryActive) {
            if (!cancelled && isPasswordRecoveryPending()) {
              setHasValidRecoverySession(true);
              setPasswordRecoveryEmail(authUser.email || getSavedRecoveryEmail());
            }
          } else {
            sessionAdminOk = await isSiteAdmin(authUser.id);
            if (!cancelled) {
              isSupabaseAdminAuthedRef.current = sessionAdminOk;
              setIsSupabaseAdminAuthed(sessionAdminOk);
              setSupabaseAdminEmail(sessionAdminOk ? (authUser.email || null) : null);
              if (sessionAdminOk) {
                isAdminLoggedInRef.current = true;
                setIsAdminLoggedIn(true);
                try {
                  sessionStorage.setItem('foodhome_admin_session', 'true');
                } catch {}
              }
            }
          }
        } else if (!cancelled) {
          isSupabaseAdminAuthedRef.current = false;
          setIsSupabaseAdminAuthed(false);
          setSupabaseAdminEmail(null);
        }
      } catch (err) {
        console.warn('Supabase session check notice:', err);
      }

      // 2. Fetch public site_contents ('main_contents')
      if (!cancelled) {
        setIsSyncingFromSupabase(true);
      }
      const res = await fetchPublicSiteContents();
      if (cancelled) return;
      setIsSyncingFromSupabase(false);

      if (!res.ok) {
        setLastSupabaseSyncError(res.error || null);
      } else {
        setLastSupabaseSyncError(null);
        setRemoteSiteContentsInfo({ exists: res.exists, updatedAt: res.updatedAt });
        if (res.updatedAt) {
          setLastSupabasePublishAt(res.updatedAt);
        }

        // 3. Apply remote public payload ONLY for regular visitors (never overwrite active admin edits!)
        const adminActive =
          isAdminLoggedInRef.current ||
          sessionAdminOk ||
          (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('foodhome_admin_session') === 'true');

        if (!adminActive && res.exists && res.payload) {
          setState(prev =>
            normalizeStateWithDefaults(prev, res.payload!, {
              inquiries: prev.inquiries,
              quotes: prev.quotes
            })
          );
        }
      }

      // 4. Synchronize remote boards (board_posts & board_private_inquiries) for all visitors & admins
      if (!cancelled) {
        await refreshBoardsFromSupabase(sessionAdminOk);
      }
    };

    initSupabaseSync();

    if (client) {
      const { data } = client.auth.onAuthStateChange(async (event, session) => {
        if (cancelled) return;

        // Avoid duplicate recovery handling when AdminLoginModal is driving manual verifyOtp()
        if (event === 'PASSWORD_RECOVERY') {
          if (isManualOtpRecoveryActive() || isAdminOpenRef.current) {
            return;
          }
          if (session?.user) {
            const recEmail = session.user.email || getSavedRecoveryEmail();
            setPasswordRecoveryPending(true, recEmail);
            setPasswordRecoveryEmail(recEmail);
            setPasswordRecoveryFailureReason(null);
            setPasswordRecoveryError(null);
            setHasValidRecoverySession(true);
            setIsCheckingRecoverySession(false);
            setIsPasswordRecoveryMode(true);
            isPasswordRecoveryModeRef.current = true;
          }
          return;
        }

        const user = session?.user;
        if (!user) {
          isSupabaseAdminAuthedRef.current = false;
          setIsSupabaseAdminAuthed(false);
          setSupabaseAdminEmail(null);
          return;
        }

        if (isPasswordRecoveryPending() || isPasswordRecoveryModeRef.current || isManualOtpRecoveryActive()) {
          setPasswordRecoveryEmail(user.email || getSavedRecoveryEmail());
          return;
        }

        const ok = await isSiteAdmin(user.id);
        if (!cancelled) {
          isSupabaseAdminAuthedRef.current = ok;
          setIsSupabaseAdminAuthed(ok);
          setSupabaseAdminEmail(ok ? (user.email || null) : null);
          if (ok) {
            refreshBoardsFromSupabase(true);
          }
        }
      });
      subscription = data.subscription;
    }

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [supabaseConfig.url, supabaseConfig.anonKey, refreshBoardsFromSupabase]);

  // Sync to localStorage (never clear/reset existing data on failure; warn cleanly if quota exceeded)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setLocalStorageQuotaError(null);
      }
    } catch (e: any) {
      console.error('Failed to save to localStorage:', e);
      const isQuota =
        e?.name === 'QuotaExceededError' ||
        e?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        e?.code === 22;
      const errMsg = isQuota
        ? '브라우저 저장 공간(약 5MB)을 초과했습니다. 관리자 > Supabase 연동 및 DB에서 내장 이미지를 Storage로 분리하면 즉시 해결됩니다.'
        : '브라우저 저장 중 오류가 발생하여 마지막 변경사항이 저장되지 않았습니다.';
      setLocalStorageQuotaError(errMsg);
      setToastMessage(errMsg);

      // Safe fallback: if quota exceeded, preserve all content/products/posts & unsynced items by trimming synced cache only
      if (isQuota && typeof window !== 'undefined' && window.localStorage) {
        try {
          const synced = loadSyncedBoardIds();
          const syncedInqSet = new Set(synced.inquiries);
          const syncedQuoteSet = new Set(synced.quotes);
          const slimState: AppState = {
            ...state,
            inquiries: [
              ...state.inquiries.filter(i => !syncedInqSet.has(i.id)),
              ...state.inquiries.filter(i => syncedInqSet.has(i.id)).slice(0, 20)
            ],
            quotes: [
              ...(state.quotes || []).filter(q => !syncedQuoteSet.has(q.id)),
              ...(state.quotes || []).filter(q => syncedQuoteSet.has(q.id)).slice(0, 20)
            ]
          };
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slimState));
        } catch {
          // Keep existing localStorage untouched
        }
      }
    }
  }, [state]);

  // Sync document title and meta from state.seo
  useEffect(() => {
    if (state.seo.metaTitle) {
      document.title = state.seo.metaTitle;
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && state.seo.metaDescription) {
      metaDesc.setAttribute('content', state.seo.metaDescription);
    }
  }, [state.seo]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  const updateContent = (newContent: Partial<SiteContent>) => {
    setState(prev => {
      const mergedContent: SiteContent = { ...prev.content, ...newContent };
      const hasCeoUpdate =
        newContent.ceoName !== undefined ||
        newContent.ceoRole !== undefined ||
        newContent.ceoTitle !== undefined ||
        newContent.ceoGreeting !== undefined ||
        newContent.ceoImageUrl !== undefined ||
        newContent.ceoSignatureImage !== undefined ||
        newContent.ceoSubtitle !== undefined;

      if (hasCeoUpdate && prev.content.pageSections && !newContent.pageSections) {
        const nextPageSections = { ...prev.content.pageSections };
        ['about-intro', 'intro'].forEach((key) => {
          const list = nextPageSections[key];
          if (Array.isArray(list)) {
            nextPageSections[key] = list.map((sec) => {
              if (sec.id === 'sec-intro-text-1') {
                return {
                  ...sec,
                  ...(newContent.ceoTitle !== undefined ? { title: newContent.ceoTitle } : {}),
                  ...(newContent.ceoGreeting !== undefined ? { content: newContent.ceoGreeting } : {}),
                };
              }
              if (sec.id === 'sec-intro-image' && newContent.ceoImageUrl !== undefined) {
                return { ...sec, imageUrl: newContent.ceoImageUrl };
              }
              if (sec.id === 'sec-intro-signature') {
                return {
                  ...sec,
                  ...(newContent.ceoRole !== undefined ? { authorRole: newContent.ceoRole } : {}),
                  ...(newContent.ceoName !== undefined ? { authorName: newContent.ceoName } : {}),
                  ...(newContent.ceoSignatureImage !== undefined ? { signatureImageUrl: newContent.ceoSignatureImage } : {}),
                };
              }
              if (sec.id === 'sec-intro-ceo') {
                return {
                  ...sec,
                  ...(newContent.ceoTitle !== undefined ? { title: newContent.ceoTitle } : {}),
                  ...(newContent.ceoSubtitle !== undefined ? { subtitle: newContent.ceoSubtitle } : {}),
                  ...(newContent.ceoGreeting !== undefined ? { content: newContent.ceoGreeting } : {}),
                  ...(newContent.ceoImageUrl !== undefined ? { imageUrl: newContent.ceoImageUrl } : {}),
                };
              }
              return sec;
            });
          }
        });
        mergedContent.pageSections = nextPageSections;
      }

      const hasSystemUpdate =
        newContent.systemSteps !== undefined ||
        newContent.systemTitle !== undefined ||
        newContent.systemDescription !== undefined;

      if (hasSystemUpdate && (mergedContent.pageSections || prev.content.pageSections) && !newContent.pageSections) {
        const basePageSections = mergedContent.pageSections || prev.content.pageSections || {};
        const nextPageSections = { ...basePageSections };
        ['about-system', 'system'].forEach((key) => {
          const list = nextPageSections[key];
          if (Array.isArray(list)) {
            nextPageSections[key] = list.map((sec) => {
              if (sec.id === 'sec-system-steps') {
                return {
                  ...sec,
                  ...(newContent.systemTitle !== undefined ? { title: newContent.systemTitle } : {}),
                  ...(newContent.systemDescription !== undefined ? { subtitle: newContent.systemDescription } : {}),
                  ...(Array.isArray(newContent.systemSteps) && newContent.systemSteps.length > 0
                    ? {
                        cardItems: newContent.systemSteps.map((s) => ({
                          title: `${s.step} ${s.title}`,
                          desc: s.desc,
                          imageUrl: s.img,
                          icon: 'CheckCircle2'
                        }))
                      }
                    : {})
                };
              }
              return sec;
            });
          }
        });
        mergedContent.pageSections = nextPageSections;
      }

      const hasPermitsUpdate =
        newContent.permitsList !== undefined ||
        newContent.permitsTitle !== undefined ||
        newContent.permitsDescription !== undefined;

      if (hasPermitsUpdate && (mergedContent.pageSections || prev.content.pageSections) && !newContent.pageSections) {
        const basePageSections = mergedContent.pageSections || prev.content.pageSections || {};
        const nextPageSections = { ...basePageSections };
        ['about-permits', 'permits'].forEach((key) => {
          const list = nextPageSections[key];
          if (Array.isArray(list)) {
            nextPageSections[key] = list.map((sec) => {
              if (sec.id === 'sec-permits-cards') {
                return {
                  ...sec,
                  ...(newContent.permitsTitle !== undefined ? { title: newContent.permitsTitle } : {}),
                  ...(newContent.permitsDescription !== undefined ? { subtitle: newContent.permitsDescription } : {}),
                  ...(Array.isArray(newContent.permitsList) && newContent.permitsList.length > 0
                    ? {
                        cardItems: newContent.permitsList.map((p) => ({
                          title: p.title,
                          badge: p.status || p.number,
                          desc: `${p.issuer} · ${p.desc}`,
                          icon: 'ShieldCheck'
                        }))
                      }
                    : {})
                };
              }
              return sec;
            });
          }
        });
        mergedContent.pageSections = nextPageSections;
      }

      return {
        ...prev,
        content: mergedContent
      };
    });
    setHasUnpublishedChanges(true);
    showToast('사이트 콘텐츠가 성공적으로 저장되었습니다.');
  };

  const updateNavMenus = (menus: NavMenuItem[]) => {
    setState(prev => ({
      ...prev,
      content: { ...prev.content, navMenus: menus }
    }));
    setHasUnpublishedChanges(true);
    showToast('상단 메뉴(GNB) 설정이 성공적으로 저장되었습니다.');
  };

  const updateNavMenuItem = (id: string, updates: Partial<NavMenuItem>) => {
    setState(prev => ({
      ...prev,
      content: {
        ...prev.content,
        navMenus: (prev.content.navMenus || []).map(m => m.id === id ? { ...m, ...updates } : m)
      }
    }));
    setHasUnpublishedChanges(true);
    showToast('메뉴 항목이 업데이트되었습니다.');
  };

  const updateTheme = (newTheme: Partial<ThemeSettings>) => {
    setState(prev => ({
      ...prev,
      theme: { ...prev.theme, ...newTheme }
    }));
    setHasUnpublishedChanges(true);
    showToast('디자인 & 테마 설정이 반영되었습니다.');
  };

  const addProduct = (product: Omit<ProductItem, 'id'>) => {
    const newProd: ProductItem = {
      ...product,
      id: 'prod-' + Date.now()
    };
    setState(prev => ({
      ...prev,
      products: [newProd, ...prev.products]
    }));
    setHasUnpublishedChanges(true);
    showToast(`신규 제품 "${newProd.name}" 등록이 완료되었습니다.`);
  };

  const updateProduct = (id: string, updatedFields: Partial<ProductItem>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => (p.id === id ? { ...p, ...updatedFields } : p))
    }));
    setHasUnpublishedChanges(true);
    showToast('제품 정보가 수정되었습니다.');
  };

  const deleteProduct = (id: string) => {
    setState(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
    setHasUnpublishedChanges(true);
    showToast('제품이 삭제되었습니다.');
  };

  const addPost = async (
    post: Omit<PostItem, 'id' | 'readCount' | 'date'>,
    visitorPassword?: string
  ): Promise<{ success: boolean; id?: string; syncedToDb?: boolean; error?: string }> => {
    const today = new Date().toISOString().split('T')[0];
    const newId = `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newPost: PostItem = {
      ...post,
      id: newId,
      date: today,
      readCount: 1
    };

    setState(prev => ({
      ...prev,
      posts: [newPost, ...prev.posts]
    }));
    setHasUnpublishedChanges(true);

    const cfg = getSavedSupabaseConfig();
    if (cfg.url && cfg.anonKey) {
      const dbRes = await createBoardPostInDb(newPost, visitorPassword);
      if (dbRes.success) {
        const synced = loadSyncedBoardIds();
        if (!synced.posts.includes(newId)) {
          synced.posts = [newId, ...synced.posts];
          saveSyncedBoardIds(synced);
        }
        showToast(`새 게시글 "${newPost.title}"이 등록되어 DB에 즉시 저장되었습니다.`);
        return { success: true, id: newId, syncedToDb: true };
      }
      showToast(`게시글이 등록되었습니다. (DB 동기화 안내: ${dbRes.error || '테이블 미설정'})`);
      return { success: true, id: newId, syncedToDb: false, error: dbRes.error };
    }

    showToast(`새로운 게시글 "${newPost.title}"이 등록되었습니다.`);
    return { success: true, id: newId, syncedToDb: false };
  };

  const updatePost = async (
    id: string,
    postFields: Partial<PostItem>,
    visitorPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cfg = getSavedSupabaseConfig();
    if (cfg.url && cfg.anonKey && (visitorPassword || isSupabaseAdminAuthedRef.current)) {
      const dbRes = await updateBoardPostInDb(id, postFields, visitorPassword);
      if (!dbRes.success) {
        showToast(dbRes.error || '게시글 수정 권한이 없거나 DB 저장에 실패했습니다.');
        return { success: false, error: dbRes.error };
      }
    }

    setState(prev => ({
      ...prev,
      posts: prev.posts.map(p => (p.id === id ? { ...p, ...postFields } : p))
    }));
    setHasUnpublishedChanges(true);
    showToast('게시글이 수정되었습니다.');
    return { success: true };
  };

  const deletePost = async (
    id: string,
    visitorPassword?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cfg = getSavedSupabaseConfig();
    if (cfg.url && cfg.anonKey && (visitorPassword || isSupabaseAdminAuthedRef.current)) {
      const dbRes = await deleteBoardPostInDb(id, visitorPassword);
      if (!dbRes.success) {
        showToast(dbRes.error || '게시글 삭제 권한이 없거나 DB 삭제에 실패했습니다.');
        return { success: false, error: dbRes.error };
      }
    }

    setState(prev => ({
      ...prev,
      posts: prev.posts.filter(p => p.id !== id)
    }));
    const synced = loadSyncedBoardIds();
    synced.posts = synced.posts.filter(pid => pid !== id);
    saveSyncedBoardIds(synced);
    setHasUnpublishedChanges(true);
    showToast('게시글이 삭제되었습니다.');
    return { success: true };
  };

  const incrementPostRead = (id: string) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(p => (p.id === id ? { ...p, readCount: p.readCount + 1 } : p))
    }));
    incrementBoardPostReadInDb(id);
  };

  const addReview = (review: Omit<ReviewItem, 'id'>) => {
    const newRev: ReviewItem = {
      ...review,
      id: 'rev-' + Date.now()
    };
    setState(prev => ({
      ...prev,
      reviews: [newRev, ...(prev.reviews || [])]
    }));
    setHasUnpublishedChanges(true);
    showToast('새 파트너 후기가 등록되었습니다.');
  };

  const updateReview = (id: string, updates: Partial<ReviewItem>) => {
    setState(prev => ({
      ...prev,
      reviews: (prev.reviews || []).map(r => (r.id === id ? { ...r, ...updates } : r))
    }));
    setHasUnpublishedChanges(true);
    showToast('후기 내용이 수정되었습니다.');
  };

  const deleteReview = (id: string) => {
    setState(prev => ({
      ...prev,
      reviews: (prev.reviews || []).filter(r => r.id !== id)
    }));
    setHasUnpublishedChanges(true);
    showToast('후기가 삭제되었습니다.');
  };

  const reorderReviews = (reviews: ReviewItem[]) => {
    setState(prev => ({
      ...prev,
      reviews
    }));
    setHasUnpublishedChanges(true);
    showToast('후기 표시 순서가 변경되었습니다.');
  };

  const addFaqItem = (item: Omit<FaqItem, 'id'>) => {
    const newFaq: FaqItem = {
      ...item,
      id: 'faq-' + Date.now(),
      visible: item.visible !== undefined ? item.visible : true,
      order: (state.content.faqItems || []).length + 1
    };
    setState(prev => ({
      ...prev,
      content: {
        ...prev.content,
        faqItems: [...(prev.content.faqItems || []), newFaq]
      }
    }));
    setHasUnpublishedChanges(true);
    showToast('새 자주하는 질문(FAQ)이 등록되었습니다.');
  };

  const updateFaqItem = (id: string, updates: Partial<FaqItem>) => {
    setState(prev => ({
      ...prev,
      content: {
        ...prev.content,
        faqItems: (prev.content.faqItems || []).map(f => f.id === id ? { ...f, ...updates } : f)
      }
    }));
    setHasUnpublishedChanges(true);
    showToast('FAQ 항목이 수정되었습니다.');
  };

  const deleteFaqItem = (id: string) => {
    setState(prev => ({
      ...prev,
      content: {
        ...prev.content,
        faqItems: (prev.content.faqItems || []).filter(f => f.id !== id)
      }
    }));
    setHasUnpublishedChanges(true);
    showToast('FAQ 항목이 삭제되었습니다.');
  };

  const reorderFaqItems = (items: FaqItem[]) => {
    setState(prev => ({
      ...prev,
      content: {
        ...prev.content,
        faqItems: items
      }
    }));
    setHasUnpublishedChanges(true);
  };

  const updateFaqCategories = (categories: FaqCategoryItem[]) => {
    setState(prev => ({
      ...prev,
      content: {
        ...prev.content,
        faqCategories: categories
      }
    }));
    setHasUnpublishedChanges(true);
    showToast('FAQ 카테고리가 성공적으로 저장되었습니다.');
  };

  const updateProductCategories = (categories: ProductCategoryItem[]) => {
    setState(prev => ({
      ...prev,
      content: {
        ...prev.content,
        productCategoriesList: categories
      }
    }));
    setHasUnpublishedChanges(true);
    showToast('제품 카테고리가 성공적으로 저장되었습니다.');
  };

  const updateCompanySubpages = (subpages: CompanySubpageItem[]) => {
    setState(prev => ({
      ...prev,
      content: {
        ...prev.content,
        companySubpages: subpages
      }
    }));
    setHasUnpublishedChanges(true);
    showToast('회사소개 하위 메뉴 설정이 저장되었습니다.');
  };

  const updateMainSections = (sections: MainSectionConfig[]) => {
    setState(prev => {
      const updatedVisible: Record<string, boolean> = { ...prev.theme.sectionsVisible };
      sections.forEach(sec => {
        updatedVisible[sec.id] = sec.visible;
      });
      return {
        ...prev,
        content: {
          ...prev.content,
          mainSections: sections
        },
        theme: {
          ...prev.theme,
          sectionsVisible: updatedVisible as any
        }
      };
    });
    setHasUnpublishedChanges(true);
    showToast('메인페이지 섹션 설정이 성공적으로 저장되었습니다.');
  };

  const updatePageSections = (pageId: string, sections: CustomSectionItem[]) => {
    setState(prev => {
      const nextSectionsMap: Record<string, CustomSectionItem[]> = {
        ...(prev.content.pageSections || {}),
        [pageId]: sections
      };
      // Keep 'about-<subId>' and '<subId>' in sync so admin editor and live page never diverge
      if (pageId.startsWith('about-')) {
        const plainId = pageId.slice('about-'.length);
        if (plainId) nextSectionsMap[plainId] = sections;
      } else if (['intro', 'system', 'permits', 'location', 'history'].includes(pageId)) {
        nextSectionsMap[`about-${pageId}`] = sections;
      }
      return {
        ...prev,
        content: {
          ...prev.content,
          pageSections: nextSectionsMap
        }
      };
    });
    setHasUnpublishedChanges(true);
    showToast('페이지 섹션 구성 및 내용이 성공적으로 저장되었습니다.');
  };

  const reorderProducts = (products: ProductItem[]) => {
    setState(prev => ({
      ...prev,
      products
    }));
    setHasUnpublishedChanges(true);
    showToast('제품 순서가 변경되었습니다.');
  };

  const addInquiry = (inquiryData: Omit<B2BInquiry, 'id' | 'createdAt' | 'status'>) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newId = `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const nextPostNumber =
      (state.inquiries.reduce((max, cur) => Math.max(max, cur.postNumber || 0), 0) || 46) + 1;

    const newInquiry: B2BInquiry = {
      ...inquiryData,
      id: newId,
      postNumber: inquiryData.postNumber || nextPostNumber,
      writer: inquiryData.writer || maskKoreanName(inquiryData.contactPerson),
      isSecret: inquiryData.isSecret ?? true,
      readCount: inquiryData.readCount || 1,
      createdAt: formattedDate,
      status: '접수대기'
    };
    setState(prev => ({
      ...prev,
      inquiries: [newInquiry, ...prev.inquiries]
    }));

    const cfg = getSavedSupabaseConfig();
    if (cfg.url && cfg.anonKey) {
      submitPrivateInquiryToBoard({
        id: newId,
        inquiryType: 'sample',
        postNumber: newInquiry.postNumber || nextPostNumber,
        title:
          inquiryData.title ||
          `[${inquiryData.companyName}] ${inquiryData.requestType || '무료 샘플 요청'}`,
        companyName: inquiryData.companyName,
        storeName: inquiryData.storeName || inquiryData.companyName,
        contactPerson: inquiryData.contactPerson,
        writerMasked: maskKoreanName(inquiryData.contactPerson),
        phone: inquiryData.phone,
        email: inquiryData.email,
        region: inquiryData.region,
        address: inquiryData.address,
        businessType: inquiryData.businessType,
        requestType: inquiryData.requestType || '무료 샘플 요청',
        monthlyUsage: inquiryData.monthlyUsage,
        selectedProducts: inquiryData.selectedProducts || [],
        message: inquiryData.message,
        password: inquiryData.password || inquiryData.phone || '0000'
      }).then(res => {
        if (res.success) {
          const synced = loadSyncedBoardIds();
          if (!synced.inquiries.includes(newId)) {
            synced.inquiries = [newId, ...synced.inquiries];
            saveSyncedBoardIds(synced);
          }
        }
      });
    }

    showToast('B2B 문의가 정상 접수되었습니다! 담당자가 빠르게 연락드립니다.');
  };

  const updateInquiryStatus = (id: string, status: B2BInquiry['status'], adminMemo?: string) => {
    setState(prev => ({
      ...prev,
      inquiries: prev.inquiries.map(inq => {
        if (inq.id === id) {
          return {
            ...inq,
            status,
            adminMemo: adminMemo !== undefined ? adminMemo : inq.adminMemo
          };
        }
        return inq;
      })
    }));

    if (isSupabaseAdminAuthedRef.current) {
      adminUpdatePrivateInquiryInBoard(id, { status, adminMemo }).then(res => {
        if (!res.success && res.error) {
          showToast(`DB 상태 동기화 실패: ${res.error}`);
        }
      });
    }
    showToast('문의 처리 상태가 갱신되었습니다.');
  };

  const deleteInquiry = (id: string) => {
    setState(prev => ({
      ...prev,
      inquiries: prev.inquiries.filter(inq => inq.id !== id)
    }));
    const synced = loadSyncedBoardIds();
    synced.inquiries = synced.inquiries.filter(iid => iid !== id);
    saveSyncedBoardIds(synced);

    if (isSupabaseAdminAuthedRef.current) {
      adminDeletePrivateInquiryInBoard(id).then(res => {
        if (!res.success && res.error) {
          showToast(`DB 삭제 동기화 실패: ${res.error}`);
        }
      });
    }
    showToast('문의 내역이 삭제되었습니다.');
  };

  const updateSeo = (newSeo: Partial<SeoSettings>) => {
    setState(prev => ({
      ...prev,
      seo: { ...prev.seo, ...newSeo }
    }));
    setHasUnpublishedChanges(true);
    showToast('SEO 및 소셜 메타태그 정보가 저장되었습니다.');
  };

  const updateSocial = (newSocial: Partial<SocialSettings>) => {
    setState(prev => ({
      ...prev,
      social: { ...prev.social, ...newSocial }
    }));
    setHasUnpublishedChanges(true);
    showToast('소셜 미디어 링크 정보가 업데이트되었습니다.');
  };

  const updateFormspreeEndpoint = (endpoint: string) => {
    setState(prev => ({
      ...prev,
      formspreeEndpoint: endpoint
    }));
    setHasUnpublishedChanges(true);
    showToast('Formspree 데이터 수집 엔드포인트가 저장되었습니다.');
  };

  const resetToDefaults = () => {
    if (window.confirm('모든 데이터를 최초 기본값(초기 샘플 데이터)으로 복원하시겠습니까? 수정한 내역이 초기화됩니다.')) {
      setState(initialData);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        //
      }
      setHasUnpublishedChanges(true);
      showToast('초기 기본 데이터로 복원되었습니다.');
    }
  };

  const importData = (imported: AppState): boolean => {
    try {
      if (imported && imported.content && imported.products && imported.posts) {
        setState(normalizeStateWithDefaults(initialData, imported));
        setHasUnpublishedChanges(true);
        showToast('데이터 백업 파일이 성공적으로 불러와졌습니다.');
        return true;
      }
    } catch {
      //
    }
    alert('올바른 백업 JSON 형식이 아닙니다.');
    return false;
  };

  const updateSupabaseConfig = (cfg: SupabaseConfig) => {
    try {
      saveSupabaseConfig(cfg);
      setSupabaseConfig({ url: cfg.url.trim().replace(/\/+$/, ''), anonKey: cfg.anonKey.trim() });
      showToast('Supabase 연결 설정이 저장되었습니다.');
    } catch (e: any) {
      showToast(e?.message || 'Supabase 설정 저장에 실패했습니다.');
    }
  };

  const publishPublicContentsToSupabase = async (
    overridePartial?: Partial<AppState>
  ): Promise<{ success: boolean; updatedAt?: string; error?: string }> => {
    setIsPublishingToSupabase(true);

    // Base publication on localStorage('foodhome_app_data_v4') when available, falling back to current state
    let sourceState: AppState = state;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedRaw = window.localStorage.getItem(STORAGE_KEY);
        if (savedRaw) {
          const parsed = JSON.parse(savedRaw);
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            sourceState = normalizeStateWithDefaults(state, parsed, {
              inquiries: state.inquiries,
              quotes: state.quotes
            });
          }
        }
      }
    } catch (e) {
      console.warn('Reading foodhome_app_data_v4 for publish fell back to in-memory state:', e);
    }

    if (overridePartial && typeof overridePartial === 'object') {
      sourceState = normalizeStateWithDefaults(sourceState, overridePartial, {
        inquiries: sourceState.inquiries,
        quotes: sourceState.quotes
      });
    }

    const res = await publishPublicSiteContents(sourceState);
    setIsPublishingToSupabase(false);

    if (res.success) {
      setHasUnpublishedChanges(false);
      const publishedAt = res.updatedAt || new Date().toISOString();
      setLastSupabasePublishAt(publishedAt);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('foodhome_last_supabase_publish_at', publishedAt);
        }
      } catch {}
      setLastSupabaseSyncError(null);
      setRemoteSiteContentsInfo({ exists: true, updatedAt: publishedAt });
      showToast('홈페이지 공개 콘텐츠가 Supabase DB에 성공적으로 게시되었습니다.');
    } else {
      setLastSupabaseSyncError(res.error || 'Supabase 게시 실패');
      showToast(res.error || 'Supabase 게시에 실패했습니다.');
    }

    return res;
  };

  const syncPublicConfigForVisitor = useCallback(async () => {
    const adminActive =
      isAdminLoggedInRef.current ||
      isSupabaseAdminAuthedRef.current ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('foodhome_admin_session') === 'true');
    if (adminActive) return;

    const cfg = getSavedSupabaseConfig();
    if (!cfg.url || !cfg.anonKey) return;

    const res = await fetchPublicSiteContents();
    if (res.ok && res.exists && res.payload) {
      setState(prev =>
        normalizeStateWithDefaults(prev, res.payload!, {
          inquiries: prev.inquiries,
          quotes: prev.quotes
        })
      );
    }
  }, []);

  const pullPublicContentsFromSupabase = async (): Promise<{ success: boolean; error?: string }> => {
    setIsSyncingFromSupabase(true);
    const res = await fetchPublicSiteContents();
    setIsSyncingFromSupabase(false);

    if (!res.ok) {
      const msg = res.error || 'Supabase 조회에 실패했습니다.';
      setLastSupabaseSyncError(msg);
      showToast(msg);
      return { success: false, error: msg };
    }

    setRemoteSiteContentsInfo({ exists: res.exists, updatedAt: res.updatedAt });
    setLastSupabaseSyncError(null);

    if (!res.exists || !res.payload) {
      const msg = 'Supabase site_contents에 아직 게시된 공개 콘텐츠가 없습니다. 기존 로컬 데이터는 그대로 유지됩니다.';
      showToast(msg);
      return { success: false, error: msg };
    }

    setState(prev =>
      normalizeStateWithDefaults(prev, res.payload!, {
        inquiries: prev.inquiries,
        quotes: prev.quotes
      })
    );
    setHasUnpublishedChanges(false);
    if (res.updatedAt) {
      setLastSupabasePublishAt(res.updatedAt);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('foodhome_last_supabase_publish_at', res.updatedAt);
        }
      } catch {}
    }
    showToast('Supabase에서 최신 홈페이지 공개 콘텐츠를 불러왔습니다.');
    return { success: true };
  };

  const handleAdminLogin = async (credentials: { email?: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    const client = getSupabaseClient();
    const inputId = (credentials.email || '').trim();
    const inputPw = (credentials.password || '').trim();

    // 1. If Supabase is configured and an email address is provided, attempt Supabase Auth
    if (client && inputId.includes('@')) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: inputId,
          password: inputPw
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const isAdmin = await isSiteAdmin(data.user.id);
          if (!isAdmin) {
            await client.auth.signOut();
            setIsSupabaseAdminAuthed(false);
            setSupabaseAdminEmail(null);
            return { success: false, error: '해당 계정은 관리자(site_admins) 권한이 승인되지 않았습니다.' };
          }
          isAdminLoggedInRef.current = true;
          isSupabaseAdminAuthedRef.current = true;
          setIsAdminLoggedIn(true);
          setIsSupabaseAdminAuthed(true);
          setSupabaseAdminEmail(data.user.email || inputId);
          try {
            sessionStorage.setItem('foodhome_admin_session', 'true');
          } catch {}
          refreshBoardsFromSupabase(true);
          showToast('Supabase 관리자 인증이 완료되었습니다.');
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err?.message || '인증 오류가 발생했습니다.' };
      }
    }

    // 2. Local fallback login: ID foodh1905 or custom master password (preserved 100%)
    const validIds = ['foodh1905', 'admin@foodhome.co.kr', 'admin'];
    let customPw: string | null = null;
    try {
      customPw = sessionStorage.getItem('foodhome_admin_custom_pw');
    } catch {}
    const validPasswords = ['foodhome2025!', '1905', 'admin1234!', ...(customPw ? [customPw] : [])];

    if (
      (validIds.includes(inputId) || !inputId) &&
      (validPasswords.includes(inputPw) || inputPw === 'foodhome2025!' || inputPw === '1905')
    ) {
      isAdminLoggedInRef.current = true;
      setIsAdminLoggedIn(true);
      try {
        sessionStorage.setItem('foodhome_admin_session', 'true');
      } catch {
        //
      }
      showToast('푸드홈 관리자 모드로 로그인되었습니다.');
      return { success: true };
    }

    return { success: false, error: '아이디(ID) 또는 비밀번호가 올바르지 않습니다.' };
  };

  const handleAdminLogout = async () => {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch {
        //
      }
    }
    isAdminLoggedInRef.current = false;
    setIsAdminLoggedIn(false);
    setIsSupabaseAdminAuthed(false);
    setSupabaseAdminEmail(null);
    try {
      sessionStorage.removeItem('foodhome_admin_session');
    } catch {
      //
    }
    showToast('관리자 모드에서 로그아웃되었습니다.');
  };

  const clearPasswordResetSuccessNotice = () => {
    setPasswordResetSuccessNotice(null);
  };

  const clearLegacyAuthLinkNotice = () => {
    setLegacyAuthLinkNotice(null);
  };

  const requestPasswordResetOtp = async (email: string) => {
    return sendPasswordResetOtpEmail(email);
  };

  const verifyPasswordResetOtp = async (email: string, token: string) => {
    const res = await verifyPasswordRecoveryOtp(email, token);
    if (res.success) {
      setHasValidRecoverySession(true);
      setPasswordRecoveryEmail(res.email || email.trim());
      setPasswordRecoveryFailureReason(null);
      setPasswordRecoveryError(null);
    } else {
      setHasValidRecoverySession(false);
    }
    return res;
  };

  const submitPasswordRecoveryUpdate = async (newPassword: string) => {
    if (!hasValidRecoverySession) {
      return {
        success: false,
        errorType: 'session_creation_failed' as OtpRecoveryErrorType,
        error: '유효한 비밀번호 재설정 인증 세션이 확인되지 않았습니다. 이메일 인증번호 확인부터 다시 진행해 주세요.'
      };
    }

    const res = await updatePasswordInRecovery(newPassword);
    if (!res.success) {
      if (res.errorType === 'session_creation_failed') {
        setHasValidRecoverySession(false);
        setPasswordRecoveryPending(false);
        setPasswordRecoveryFailureReason('session_creation_failed');
        setPasswordRecoveryError(res.error || null);
      }
      return res;
    }

    // Clear recovery flags & temporary recovery session so admin signs in cleanly with the new password
    setPasswordRecoveryPending(false);
    clearAuthUrlParams();
    setHasValidRecoverySession(false);
    setPasswordRecoveryFailureReason(null);
    setPasswordRecoveryError(null);
    setLegacyAuthLinkNotice(null);

    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch {
        //
      }
    }

    isAdminLoggedInRef.current = false;
    setIsAdminLoggedIn(false);
    setIsSupabaseAdminAuthed(false);
    setSupabaseAdminEmail(null);
    try {
      sessionStorage.removeItem('foodhome_admin_session');
    } catch {}

    setPasswordResetSuccessNotice('비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해 주세요.');
    showToast('비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해 주세요.');
    return { success: true };
  };

  const finishPasswordRecoveryToLogin = () => {
    setPasswordRecoveryPending(false);
    clearAuthUrlParams();
    isPasswordRecoveryModeRef.current = false;
    setIsPasswordRecoveryMode(false);
    setHasValidRecoverySession(false);
    setIsCheckingRecoverySession(false);
    setPasswordRecoveryFailureReason(null);
    setPasswordRecoveryError(null);
    setIsAdminOpen(true);
  };

  const cancelPasswordRecovery = async () => {
    const hadRecoveryPending = isPasswordRecoveryPending() || hasValidRecoverySession;
    setPasswordRecoveryPending(false);
    clearAuthUrlParams();

    // Only sign out if a temporary OTP recovery session was active and no normal admin session is open
    if (hadRecoveryPending && !isAdminLoggedInRef.current) {
      const client = getSupabaseClient();
      if (client) {
        try {
          await client.auth.signOut();
        } catch {}
      }
      setIsSupabaseAdminAuthed(false);
      setSupabaseAdminEmail(null);
    }

    isPasswordRecoveryModeRef.current = false;
    setIsPasswordRecoveryMode(false);
    setHasValidRecoverySession(false);
    setIsCheckingRecoverySession(false);
    setPasswordRecoveryFailureReason(null);
    setPasswordRecoveryError(null);
    setLegacyAuthLinkNotice(null);
  };

  const addSamplePost = async (post: {
    title: string;
    companyName: string;
    storeName: string;
    contactPerson: string;
    phone: string;
    address: string;
    selectedProducts: string[];
    message: string;
    password: string;
  }): Promise<{ success: boolean; id?: string; syncedToDb?: boolean; error?: string }> => {
    const newId = `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const nextPostNumber =
      (state.inquiries.reduce((max, cur) => Math.max(max, cur.postNumber || 0), 0) || 46) + 1;
    const maskedAuthor = maskKoreanName(post.contactPerson);

    const newInquiry: B2BInquiry = {
      id: newId,
      postNumber: nextPostNumber,
      title: post.title,
      companyName: post.companyName || post.storeName,
      storeName: post.storeName,
      contactPerson: post.contactPerson,
      writer: maskedAuthor,
      phone: post.phone,
      email: '',
      businessType: '외식업체',
      requestType: '무료 샘플 요청',
      monthlyUsage: '미정',
      region: post.address.slice(0, 10),
      address: post.address,
      selectedProducts: post.selectedProducts,
      message: post.message,
      status: '접수완료',
      password: post.password,
      isSecret: true,
      readCount: 1,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    // 1. Update local state immediately
    setState(prev => ({
      ...prev,
      inquiries: [newInquiry, ...prev.inquiries]
    }));

    // 2. Persist to dedicated Supabase `board_private_inquiries` + hashed legacy fallback
    let syncedToDb = false;
    let dbError: string | undefined;
    const cfg = getSavedSupabaseConfig();
    if (cfg.url && cfg.anonKey) {
      const boardRes = await submitPrivateInquiryToBoard({
        id: newId,
        inquiryType: 'sample',
        postNumber: nextPostNumber,
        title: post.title,
        companyName: post.companyName || post.storeName,
        storeName: post.storeName,
        contactPerson: post.contactPerson,
        writerMasked: maskedAuthor,
        phone: post.phone,
        region: post.address.slice(0, 10),
        address: post.address,
        businessType: '외식업체',
        requestType: '무료 샘플 요청',
        monthlyUsage: '미정',
        selectedProducts: post.selectedProducts,
        message: post.message,
        password: post.password
      });
      syncedToDb = boardRes.success;
      dbError = boardRes.error;

      if (boardRes.success) {
        const synced = loadSyncedBoardIds();
        if (!synced.inquiries.includes(newId)) {
          synced.inquiries = [newId, ...synced.inquiries];
          saveSyncedBoardIds(synced);
        }
      }

      // Preserve legacy form_submissions logging WITHOUT plaintext password
      const client = getSupabaseClient();
      if (client) {
        try {
          const hashedPw = await hashPassword(post.password.trim());
          await client.from('form_submissions').insert([
            {
              form_slug: 'sample-request',
              title: post.title,
              author_name: post.contactPerson,
              store_name: post.storeName,
              phone: post.phone,
              address: post.address,
              selected_items: post.selectedProducts,
              password_hash: hashedPw,
              status: '접수완료',
              payload: {
                message: post.message,
                postNumber: nextPostNumber
              }
            }
          ]);
        } catch (e) {
          console.warn('Supabase submission background sync error:', e);
        }
      }
    }

    showToast(
      syncedToDb
        ? '샘플 신청글이 등록되어 모든 기기에 실시간 저장되었습니다.'
        : '샘플 신청글이 성공적으로 등록되었습니다.'
    );
    return { success: true, id: newId, syncedToDb, error: dbError };
  };

  const updateSamplePostReply = (id: string, reply: string, status?: B2BInquiry['status']) => {
    const replyPayload = {
      content: reply,
      repliedAt: new Date().toISOString().slice(0, 10),
      author: '푸드홈 관리자'
    };
    const nextStatus = status || '답변완료';

    setState(prev => ({
      ...prev,
      inquiries: prev.inquiries.map(inq => {
        if (inq.id === id) {
          return {
            ...inq,
            status: nextStatus,
            adminReply: replyPayload
          };
        }
        return inq;
      })
    }));

    if (isSupabaseAdminAuthedRef.current) {
      adminUpdatePrivateInquiryInBoard(id, {
        status: nextStatus,
        adminReply: replyPayload
      }).then(res => {
        if (!res.success && res.error) {
          showToast(`DB 답변 저장 실패: ${res.error}`);
        }
      });
    }
    showToast('답변이 등록되었습니다.');
  };

  const verifyPostPassword = (postId: string, passwordInput: string): boolean => {
    if (isAdminLoggedIn) return true;
    const post = state.inquiries.find(i => i.id === postId);
    if (!post) return false;
    if (!post.password) return true;
    return post.password.trim() === passwordInput.trim();
  };

  const unlockSamplePost = async (
    postId: string,
    passwordInput: string
  ): Promise<{ verified: boolean; post?: B2BInquiry; passwordHash?: string; error?: string }> => {
    const target = state.inquiries.find(i => i.id === postId);
    if (isAdminLoggedIn) {
      return target ? { verified: true, post: target } : { verified: false, error: '게시글을 찾을 수 없습니다.' };
    }

    const trimmed = (passwordInput || '').trim();
    if (!trimmed) {
      return { verified: false, error: '비밀번호를 입력해 주세요.' };
    }

    const cfg = getSavedSupabaseConfig();
    if (cfg.url && cfg.anonKey) {
      const remoteRes = await unlockPrivateInquiryFromBoard(postId, trimmed);
      if (remoteRes.ok && remoteRes.sampleItem) {
        setState(prev => ({
          ...prev,
          inquiries: prev.inquiries.map(i => (i.id === postId ? { ...i, ...remoteRes.sampleItem! } : i))
        }));
        return {
          verified: true,
          post: remoteRes.sampleItem,
          passwordHash: remoteRes.passwordHash
        };
      }

      // Fallback for unsynced local-only items still having plain post.password
      if (target?.password && target.password.trim() === trimmed) {
        const pwHash = await hashPassword(trimmed);
        return { verified: true, post: target, passwordHash: pwHash };
      }

      return {
        verified: false,
        error: remoteRes.error || '비밀번호가 일치하지 않습니다. 다시 확인해 주세요.'
      };
    }

    if (!target) return { verified: false, error: '게시글을 찾을 수 없습니다.' };
    if (!target.password || target.password.trim() === trimmed) {
      const pwHash = await hashPassword(trimmed);
      return { verified: true, post: target, passwordHash: pwHash };
    }
    return { verified: false, error: '비밀번호가 일치하지 않습니다. 다시 확인해 주세요.' };
  };

  const updateSamplePostByVisitor = async (
    id: string,
    passwordHash: string,
    title: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cfg = getSavedSupabaseConfig();
    const synced = loadSyncedBoardIds();
    if (cfg.url && cfg.anonKey && synced.inquiries.includes(id)) {
      const res = await updatePrivateInquiryByAuthorInBoard(id, passwordHash, title, message);
      if (!res.success) {
        return { success: false, error: res.error || '수정에 실패했습니다.' };
      }
    }

    setState(prev => ({
      ...prev,
      inquiries: prev.inquiries.map(inq => (inq.id === id ? { ...inq, title, message } : inq))
    }));
    showToast('신청글 내용이 수정되었습니다.');
    return { success: true };
  };

  const deleteSamplePostByVisitor = async (
    id: string,
    passwordHash: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cfg = getSavedSupabaseConfig();
    const synced = loadSyncedBoardIds();
    if (cfg.url && cfg.anonKey && synced.inquiries.includes(id)) {
      const res = await deletePrivateInquiryByAuthorInBoard(id, passwordHash);
      if (!res.success) {
        return { success: false, error: res.error || '삭제에 실패했습니다.' };
      }
      synced.inquiries = synced.inquiries.filter(iid => iid !== id);
      saveSyncedBoardIds(synced);
    }

    setState(prev => ({
      ...prev,
      inquiries: prev.inquiries.filter(inq => inq.id !== id)
    }));
    showToast('신청글이 삭제되었습니다.');
    return { success: true };
  };

  // Main Banners Manager
  const updateBanners = (banners: BannerSlide[]) => {
    setState(prev => ({
      ...prev,
      content: {
        ...prev.content,
        banners
      }
    }));
    setHasUnpublishedChanges(true);
    showToast('메인 배너가 성공적으로 수정되었습니다.');
  };

  // Form Config Manager
  const updateFormConfig = (newConfig: Partial<FormConfig>) => {
    setState(prev => ({
      ...prev,
      formConfig: {
        ...prev.formConfig,
        ...newConfig
      }
    }));
    setHasUnpublishedChanges(true);
    showToast('신청서 양식 설정이 저장되었습니다.');
  };

  // 1:1 Quote Inquiries Handlers
  const addQuoteInquiry = async (quote: {
    title: string;
    companyName: string;
    contactPerson: string;
    phone: string;
    email?: string;
    region?: string;
    businessType?: string;
    interestedProducts: string[];
    monthlyVolume?: string;
    deliverySchedule?: string;
    message: string;
    attachments?: { name: string; url?: string; size?: string }[];
    password: string;
  }): Promise<{ success: boolean; id?: string; syncedToDb?: boolean; error?: string }> => {
    const newId = `quote-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const nextPostNumber =
      state.quotes && state.quotes.length > 0
        ? Math.max(...state.quotes.map(q => q.postNumber || 0)) + 1
        : 1;

    const passwordHash = await hashPassword(quote.password.trim());

    const newQuote: QuoteInquiry = {
      id: newId,
      postNumber: nextPostNumber,
      title: quote.title,
      companyName: quote.companyName,
      contactPerson: quote.contactPerson,
      phone: quote.phone,
      email: quote.email,
      region: quote.region,
      businessType: quote.businessType,
      interestedProducts: quote.interestedProducts,
      monthlyVolume: quote.monthlyVolume,
      deliverySchedule: quote.deliverySchedule,
      message: quote.message,
      attachments: quote.attachments || [],
      passwordHash,
      rawPasswordHint: quote.password,
      isSecret: true,
      status: '접수완료',
      readCount: 1,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    setState(prev => ({
      ...prev,
      quotes: [newQuote, ...(prev.quotes || [])]
    }));

    let syncedToDb = false;
    let dbError: string | undefined;
    const cfg = getSavedSupabaseConfig();
    if (cfg.url && cfg.anonKey) {
      const boardRes = await submitPrivateInquiryToBoard({
        id: newId,
        inquiryType: 'quote',
        postNumber: nextPostNumber,
        title: quote.title,
        companyName: quote.companyName,
        storeName: quote.companyName,
        contactPerson: quote.contactPerson,
        writerMasked: maskKoreanName(quote.contactPerson),
        phone: quote.phone,
        email: quote.email,
        region: quote.region,
        businessType: quote.businessType,
        requestType: '대량 납품 견적',
        monthlyUsage: quote.monthlyVolume,
        deliverySchedule: quote.deliverySchedule,
        selectedProducts: quote.interestedProducts,
        attachments: quote.attachments || [],
        message: quote.message,
        password: quote.password
      });
      syncedToDb = boardRes.success;
      dbError = boardRes.error;
      if (boardRes.success) {
        const synced = loadSyncedBoardIds();
        if (!synced.quotes.includes(newId)) {
          synced.quotes = [newId, ...synced.quotes];
          saveSyncedBoardIds(synced);
        }
      }
    }

    showToast(
      syncedToDb
        ? '대량 납품 견적 상담이 등록되어 DB에 안전하게 저장되었습니다.'
        : '대량 납품 견적 상담이 성공적으로 접수되었습니다.'
    );
    return { success: true, id: newId, syncedToDb, error: dbError };
  };

  const updateQuoteStatus = (id: string, status: string, adminMemo?: string) => {
    setState(prev => ({
      ...prev,
      quotes: (prev.quotes || []).map(q => {
        if (q.id === id) {
          return {
            ...q,
            status,
            ...(adminMemo !== undefined ? { adminMemo } : {})
          };
        }
        return q;
      })
    }));
    if (isSupabaseAdminAuthedRef.current) {
      adminUpdatePrivateInquiryInBoard(id, { status, adminMemo }).then(res => {
        if (!res.success && res.error) {
          showToast(`DB 견적 상태 저장 실패: ${res.error}`);
        }
      });
    }
    showToast(`견적 상담 상태가 '${status}'(으)로 변경되었습니다.`);
  };

  const updateQuoteReply = (id: string, reply: string, status?: string) => {
    const existing = (state.quotes || []).find(q => q.id === id);
    const nextStatus = status || existing?.status || '상담중';
    const replyPayload = {
      content: reply,
      repliedAt: new Date().toISOString().slice(0, 10),
      author: '푸드홈 관리자'
    };

    setState(prev => ({
      ...prev,
      quotes: (prev.quotes || []).map(q => {
        if (q.id === id) {
          return {
            ...q,
            status: nextStatus,
            adminReply: replyPayload
          };
        }
        return q;
      })
    }));
    if (isSupabaseAdminAuthedRef.current) {
      adminUpdatePrivateInquiryInBoard(id, {
        status: nextStatus,
        adminReply: replyPayload
      }).then(res => {
        if (!res.success && res.error) {
          showToast(`DB 견적 답변 저장 실패: ${res.error}`);
        }
      });
    }
    showToast('관리자 답변이 등록되었습니다.');
  };

  const deleteQuoteInquiry = (id: string) => {
    setState(prev => ({
      ...prev,
      quotes: (prev.quotes || []).filter(q => q.id !== id)
    }));
    const synced = loadSyncedBoardIds();
    synced.quotes = synced.quotes.filter(qid => qid !== id);
    saveSyncedBoardIds(synced);

    if (isSupabaseAdminAuthedRef.current) {
      adminDeletePrivateInquiryInBoard(id).then(res => {
        if (!res.success && res.error) {
          showToast(`DB 견적 삭제 실패: ${res.error}`);
        }
      });
    }
    showToast('견적 상담글이 삭제되었습니다.');
  };

  const verifyQuotePassword = async (quoteId: string, passwordInput: string): Promise<boolean> => {
    if (isAdminLoggedIn) return true;
    const target = (state.quotes || []).find(q => q.id === quoteId);
    if (!target) return false;
    return verifyQuotePasswordWithHash(passwordInput, target.passwordHash, target.rawPasswordHint);
  };

  const unlockQuotePost = async (
    quoteId: string,
    passwordInput: string
  ): Promise<{ verified: boolean; quote?: QuoteInquiry; passwordHash?: string; error?: string }> => {
    const target = (state.quotes || []).find(q => q.id === quoteId);
    if (isAdminLoggedIn) {
      return target ? { verified: true, quote: target } : { verified: false, error: '게시글을 찾을 수 없습니다.' };
    }

    const trimmed = (passwordInput || '').trim();
    if (!trimmed) {
      return { verified: false, error: '비밀번호를 입력해 주세요.' };
    }

    const cfg = getSavedSupabaseConfig();
    if (cfg.url && cfg.anonKey) {
      const remoteRes = await unlockPrivateInquiryFromBoard(quoteId, trimmed);
      if (remoteRes.ok && remoteRes.quoteItem) {
        setState(prev => ({
          ...prev,
          quotes: (prev.quotes || []).map(q => (q.id === quoteId ? { ...q, ...remoteRes.quoteItem! } : q))
        }));
        return {
          verified: true,
          quote: remoteRes.quoteItem,
          passwordHash: remoteRes.passwordHash
        };
      }

      if (target) {
        const localOk = await verifyQuotePasswordWithHash(trimmed, target.passwordHash, target.rawPasswordHint);
        if (localOk) {
          const pwHash = target.passwordHash || (await hashPassword(trimmed));
          return { verified: true, quote: target, passwordHash: pwHash };
        }
      }

      return {
        verified: false,
        error: remoteRes.error || '비밀번호가 일치하지 않습니다. 다시 확인해 주세요.'
      };
    }

    if (!target) return { verified: false, error: '게시글을 찾을 수 없습니다.' };
    const localOk = await verifyQuotePasswordWithHash(trimmed, target.passwordHash, target.rawPasswordHint);
    if (!localOk) {
      return { verified: false, error: '비밀번호가 일치하지 않습니다. 다시 확인해 주세요.' };
    }
    const pwHash = target.passwordHash || (await hashPassword(trimmed));
    return { verified: true, quote: target, passwordHash: pwHash };
  };

  const updateQuoteByVisitor = async (
    id: string,
    passwordHash: string,
    title: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cfg = getSavedSupabaseConfig();
    const synced = loadSyncedBoardIds();
    if (cfg.url && cfg.anonKey && synced.quotes.includes(id)) {
      const res = await updatePrivateInquiryByAuthorInBoard(id, passwordHash, title, message);
      if (!res.success) {
        return { success: false, error: res.error || '수정에 실패했습니다.' };
      }
    }

    setState(prev => ({
      ...prev,
      quotes: (prev.quotes || []).map(q => (q.id === id ? { ...q, title, message } : q))
    }));
    showToast('견적 상담글 내용이 수정되었습니다.');
    return { success: true };
  };

  const deleteQuoteByVisitor = async (
    id: string,
    passwordHash: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cfg = getSavedSupabaseConfig();
    const synced = loadSyncedBoardIds();
    if (cfg.url && cfg.anonKey && synced.quotes.includes(id)) {
      const res = await deletePrivateInquiryByAuthorInBoard(id, passwordHash);
      if (!res.success) {
        return { success: false, error: res.error || '삭제에 실패했습니다.' };
      }
      synced.quotes = synced.quotes.filter(qid => qid !== id);
      saveSyncedBoardIds(synced);
    }

    setState(prev => ({
      ...prev,
      quotes: (prev.quotes || []).filter(q => q.id !== id)
    }));
    showToast('견적 상담글이 삭제되었습니다.');
    return { success: true };
  };

  const migrateLocalBoardsToSupabase = async (): Promise<{
    success: boolean;
    postsCount: number;
    inquiriesCount: number;
    error?: string;
  }> => {
    if (!isSupabaseAdminAuthedRef.current) {
      return {
        success: false,
        postsCount: 0,
        inquiriesCount: 0,
        error: 'Supabase 관리자 이메일 계정으로 로그인한 상태에서만 일괄 이전할 수 있습니다.'
      };
    }

    const postsRes = await migrateLocalPostsToBoardTable(state.posts || []);
    if (!postsRes.success) {
      return {
        success: false,
        postsCount: 0,
        inquiriesCount: 0,
        error: postsRes.error
      };
    }

    const privRes = await migrateLocalInquiriesAndQuotesToBoard(state.inquiries || [], state.quotes || []);
    if (!privRes.success) {
      return {
        success: false,
        postsCount: postsRes.count,
        inquiriesCount: 0,
        error: privRes.error
      };
    }

    const prevSynced = loadSyncedBoardIds();
    saveSyncedBoardIds({
      posts: Array.from(new Set([...prevSynced.posts, ...(state.posts || []).map(p => p.id)])),
      inquiries: Array.from(new Set([...prevSynced.inquiries, ...(state.inquiries || []).map(i => i.id)])),
      quotes: Array.from(new Set([...prevSynced.quotes, ...(state.quotes || []).map(q => q.id)]))
    });

    await refreshBoardsFromSupabase(true);
    showToast(`게시글 ${postsRes.count}건 및 샘플·견적 문의 ${privRes.count}건을 Supabase로 이전했습니다.`);
    return {
      success: true,
      postsCount: postsRes.count,
      inquiriesCount: privRes.count
    };
  };

  const migrateEmbeddedImagesToStorage = async (): Promise<{
    success: boolean;
    migratedCount: number;
    failedCount: number;
    error?: string;
  }> => {
    const res = await migrateDataUrlsInStateToStorage(state);
    if (res.migratedCount > 0) {
      setState(res.nextState);
      setHasUnpublishedChanges(true);
      showToast(
        `${res.migratedCount}개의 내장 이미지를 Supabase Storage로 분리했습니다. 이제 Supabase 게시에 반영해 주세요.`
      );
    } else if (res.error) {
      showToast(res.error);
    } else {
      showToast('분리할 대용량 내장 이미지(Base64)가 없습니다.');
    }
    return {
      success: res.success,
      migratedCount: res.migratedCount,
      failedCount: res.failedCount,
      error: res.error
    };
  };

  return (
    <AppContext.Provider
      value={{
        state,
        updateContent,
        updateTheme,
        updateNavMenus,
        updateNavMenuItem,
        addProduct,
        updateProduct,
        deleteProduct,
        addPost,
        updatePost,
        deletePost,
        incrementPostRead,
        addReview,
        updateReview,
        deleteReview,
        reorderReviews,
        addInquiry,
        updateInquiryStatus,
        deleteInquiry,
        updateSeo,
        updateSocial,
        updateFormspreeEndpoint,
        resetToDefaults,
        importData,
        activePage,
        setActivePage: handleSetActivePage,
        selectedProductId,
        setSelectedProductId,
        navigateToProductDetail,
        companyAboutTab,
        setCompanyAboutTab,
        isAdminOpen,
        setIsAdminOpen,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        isSupabaseAdminAuthed,
        supabaseAdminEmail,
        isSyncingFromSupabase,
        isPublishingToSupabase,
        hasUnpublishedChanges,
        setHasUnpublishedChanges,
        lastSupabasePublishAt,
        lastSupabaseSyncError,
        remoteSiteContentsInfo,
        publishPublicContentsToSupabase,
        pullPublicContentsFromSupabase,
        syncPublicConfigForVisitor,
        handleAdminLogin,
        handleAdminLogout,
        supabaseConfig,
        updateSupabaseConfig,
        isBoardSyncing,
        boardSyncInfo,
        localStorageStats,
        localStorageQuotaError,
        refreshBoardsFromSupabase,
        migrateLocalBoardsToSupabase,
        migrateEmbeddedImagesToStorage,
        isPasswordRecoveryMode,
        isCheckingRecoverySession,
        hasValidRecoverySession,
        passwordRecoveryEmail,
        passwordRecoveryError,
        passwordRecoveryFailureReason,
        passwordResetSuccessNotice,
        legacyAuthLinkNotice,
        clearPasswordResetSuccessNotice,
        clearLegacyAuthLinkNotice,
        requestPasswordResetOtp,
        verifyPasswordResetOtp,
        submitPasswordRecoveryUpdate,
        finishPasswordRecoveryToLogin,
        cancelPasswordRecovery,
        addSamplePost,
        updateSamplePostReply,
        verifyPostPassword,
        unlockSamplePost,
        updateSamplePostByVisitor,
        deleteSamplePostByVisitor,
        addQuoteInquiry,
        updateQuoteStatus,
        updateQuoteReply,
        deleteQuoteInquiry,
        verifyQuotePassword,
        unlockQuotePost,
        updateQuoteByVisitor,
        deleteQuoteByVisitor,
        updateBanners,
        updateFormConfig,
        addFaqItem,
        updateFaqItem,
        deleteFaqItem,
        reorderFaqItems,
        updateFaqCategories,
        updateProductCategories,
        updateCompanySubpages,
        updateMainSections,
        updatePageSections,
        reorderProducts,
        activeAdminTab,
        setActiveAdminTab,
        isSampleModalOpen,
        setIsSampleModalOpen,
        isWholesaleModalOpen,
        setIsWholesaleModalOpen,
        selectedProductForDetail,
        setSelectedProductForDetail,
        selectedPostForDetail,
        setSelectedPostForDetail,
        selectedFacilityMedia,
        setSelectedFacilityMedia,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
