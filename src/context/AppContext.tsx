import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  updatePasswordInRecovery
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
  
  // Posts
  addPost: (post: Omit<PostItem, 'id' | 'readCount' | 'date'>) => void;
  updatePost: (id: string, post: Partial<PostItem>) => void;
  deletePost: (id: string) => void;
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
  publishPublicContentsToSupabase: () => Promise<{ success: boolean; updatedAt?: string; error?: string }>;
  pullPublicContentsFromSupabase: () => Promise<{ success: boolean; error?: string }>;
  handleAdminLogin: (credentials: { email?: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  handleAdminLogout: () => Promise<void>;
  supabaseConfig: { url: string; anonKey: string };
  updateSupabaseConfig: (cfg: { url: string; anonKey: string }) => void;

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
  }) => Promise<{ success: boolean; id?: string }>;
  updateSamplePostReply: (id: string, reply: string, status?: B2BInquiry['status']) => void;
  verifyPostPassword: (postId: string, passwordInput: string) => boolean;

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
  }) => Promise<{ success: boolean; id?: string }>;
  updateQuoteStatus: (id: string, status: string, adminMemo?: string) => void;
  updateQuoteReply: (id: string, reply: string, status?: string) => void;
  deleteQuoteInquiry: (id: string) => void;
  verifyQuotePassword: (quoteId: string, passwordInput: string) => Promise<boolean>;

  // Main Banner & Form Config
  updateBanners: (banners: BannerSlide[]) => void;
  updateFormConfig: (config: Partial<FormConfig>) => void;
}

const STORAGE_KEY = 'foodhome_app_data_v4';

function normalizeStateWithDefaults(
  baseState: AppState,
  parsed: Partial<AppState> | Partial<PublicSitePayload>,
  preservePrivate?: { inquiries: B2BInquiry[]; quotes: QuoteInquiry[] }
): AppState {
  const parsedAsApp = parsed as Partial<AppState>;
  return {
    ...baseState,
    ...parsed,
    content: {
      ...baseState.content,
      ...(parsed.content || {}),
      navMenus:
        Array.isArray(parsed.content?.navMenus) && parsed.content.navMenus.length > 0
          ? parsed.content.navMenus
          : baseState.content.navMenus,
      banners:
        Array.isArray(parsed.content?.banners) && parsed.content.banners.length > 0
          ? parsed.content.banners
          : baseState.content.banners,
      facilityItems:
        Array.isArray(parsed.content?.facilityItems) && parsed.content.facilityItems.length > 0
          ? parsed.content.facilityItems
          : baseState.content.facilityItems,
      faqItems: Array.isArray(parsed.content?.faqItems)
        ? parsed.content.faqItems
        : baseState.content.faqItems,
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
      mainSections:
        Array.isArray(parsed.content?.mainSections) && parsed.content.mainSections.length > 0
          ? parsed.content.mainSections.map((sec: any) =>
              sec.id === 'reviews' && sec.title === '전국 480여 개 외식 파트너의 생생한 찬사'
                ? { ...sec, title: '전국 프랜차이즈 및 외식업체 대표님들의 후기' }
                : sec
            )
          : baseState.content.mainSections,
      pageSections: (() => {
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
      })()
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
    products:
      Array.isArray(parsed.products) && parsed.products.length > 0
        ? parsed.products
        : baseState.products,
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
    formConfig: parsed.formConfig
      ? { ...baseState.formConfig, ...parsed.formConfig }
      : baseState.formConfig,
    seo: { ...baseState.seo, ...(parsed.seo || {}) },
    social: { ...baseState.social, ...(parsed.social || {}) },
    formspreeEndpoint:
      parsed.formspreeEndpoint || baseState.formspreeEndpoint || 'https://formspree.io/f/xoejykbn'
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') {
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
  const [supabaseAdminEmail, setSupabaseAdminEmail] = useState<string | null>(null);
  const [isSyncingFromSupabase, setIsSyncingFromSupabase] = useState(false);
  const [isPublishingToSupabase, setIsPublishingToSupabase] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  const [lastSupabasePublishAt, setLastSupabasePublishAt] = useState<string | null>(null);
  const [lastSupabaseSyncError, setLastSupabaseSyncError] = useState<string | null>(null);
  const [remoteSiteContentsInfo, setRemoteSiteContentsInfo] = useState<{ exists: boolean; updatedAt: string | null } | null>(null);

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

  // Sync Supabase Auth session & fetch public site_contents on mount / config change
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
        // Never overwrite or clear localStorage when DB fails or is unconfigured
        return;
      }

      setLastSupabaseSyncError(null);
      setRemoteSiteContentsInfo({ exists: res.exists, updatedAt: res.updatedAt });
      if (res.updatedAt) {
        setLastSupabasePublishAt(prev => prev || res.updatedAt);
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
          setIsSupabaseAdminAuthed(ok);
          setSupabaseAdminEmail(ok ? (user.email || null) : null);
        }
      });
      subscription = data.subscription;
    }

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, [supabaseConfig.url, supabaseConfig.anonKey]);

  // Sync to localStorage (never delete/reset existing data on failure; alert user clearly if quota exceeded)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    } catch (e: any) {
      console.error('Failed to save to localStorage:', e);
      const isQuota =
        e?.name === 'QuotaExceededError' ||
        e?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        e?.code === 22;
      const errMsg = isQuota
        ? '저장 공간(약 5MB)을 초과하여 마지막 변경사항이 브라우저에 저장되지 않았습니다. 이미지 크기를 줄이거나 불필요한 대용량 이미지를 정리해 주세요.'
        : '브라우저 저장 중 오류가 발생하여 마지막 변경사항이 저장되지 않았습니다.';
      setToastMessage(errMsg);
      if (typeof window !== 'undefined') {
        window.alert(errMsg);
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

  const addPost = (post: Omit<PostItem, 'id' | 'readCount' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newPost: PostItem = {
      ...post,
      id: 'post-' + Date.now(),
      date: today,
      readCount: 1
    };
    setState(prev => ({
      ...prev,
      posts: [newPost, ...prev.posts]
    }));
    setHasUnpublishedChanges(true);
    showToast(`새로운 게시글 "${newPost.title}"이 등록되었습니다.`);
  };

  const updatePost = (id: string, postFields: Partial<PostItem>) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(p => (p.id === id ? { ...p, ...postFields } : p))
    }));
    setHasUnpublishedChanges(true);
    showToast('게시글이 수정되었습니다.');
  };

  const deletePost = (id: string) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.filter(p => p.id !== id)
    }));
    setHasUnpublishedChanges(true);
    showToast('게시글이 삭제되었습니다.');
  };

  const incrementPostRead = (id: string) => {
    setState(prev => ({
      ...prev,
      posts: prev.posts.map(p => (p.id === id ? { ...p, readCount: p.readCount + 1 } : p))
    }));
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
    const newInquiry: B2BInquiry = {
      ...inquiryData,
      id: 'inq-' + Date.now(),
      createdAt: formattedDate,
      status: '접수대기'
    };
    setState(prev => ({
      ...prev,
      inquiries: [newInquiry, ...prev.inquiries]
    }));
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
    showToast('문의 처리 상태가 갱신되었습니다.');
  };

  const deleteInquiry = (id: string) => {
    setState(prev => ({
      ...prev,
      inquiries: prev.inquiries.filter(inq => inq.id !== id)
    }));
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
    saveSupabaseConfig(cfg);
    setSupabaseConfig(cfg);
    showToast('Supabase 연결 설정이 저장되었습니다.');
  };

  const publishPublicContentsToSupabase = async (): Promise<{ success: boolean; updatedAt?: string; error?: string }> => {
    setIsPublishingToSupabase(true);
    const res = await publishPublicSiteContents(state);
    setIsPublishingToSupabase(false);

    if (res.success) {
      setHasUnpublishedChanges(false);
      const publishedAt = res.updatedAt || new Date().toISOString();
      setLastSupabasePublishAt(publishedAt);
      setLastSupabaseSyncError(null);
      setRemoteSiteContentsInfo({ exists: true, updatedAt: publishedAt });
      showToast('홈페이지 공개 콘텐츠가 Supabase DB에 성공적으로 게시되었습니다.');
    } else {
      setLastSupabaseSyncError(res.error || 'Supabase 게시 실패');
      showToast(res.error || 'Supabase 게시에 실패했습니다.');
    }

    return res;
  };

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
      const msg = 'Supabase site_contents에 아직 게시된 공개 콘텐츠가 없습니다.';
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
          setIsAdminLoggedIn(true);
          setIsSupabaseAdminAuthed(true);
          setSupabaseAdminEmail(data.user.email || inputId);
          try {
            sessionStorage.setItem('foodhome_admin_session', 'true');
          } catch {}
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
  }): Promise<{ success: boolean; id?: string }> => {
    const newId = `inq-${Date.now()}`;
    const nextPostNumber = (state.inquiries.reduce((max, cur) => Math.max(max, cur.postNumber || 0), 0) || 46) + 1;
    
    // Mask author name (e.g. 홍길동 -> 홍*동, 이진 -> 이*)
    const name = post.contactPerson.trim();
    const maskedAuthor = name.length > 2
      ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1]
      : name.length === 2
      ? name[0] + '*'
      : name;

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

    // 1. Update local state
    setState(prev => ({
      ...prev,
      inquiries: [newInquiry, ...prev.inquiries]
    }));

    // 2. If Supabase is connected, persist to form_submissions
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('form_submissions').insert([
          {
            form_slug: 'sample-request',
            title: post.title,
            author_name: post.contactPerson,
            store_name: post.storeName,
            phone: post.phone,
            address: post.address,
            selected_items: post.selectedProducts,
            password_hash: post.password,
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

    showToast('샘플 신청글이 성공적으로 등록되었습니다.');
    return { success: true, id: newId };
  };

  const updateSamplePostReply = (id: string, reply: string, status?: B2BInquiry['status']) => {
    setState(prev => ({
      ...prev,
      inquiries: prev.inquiries.map(inq => {
        if (inq.id === id) {
          return {
            ...inq,
            status: status || '답변완료',
            adminReply: {
              content: reply,
              repliedAt: new Date().toISOString().slice(0, 10),
              author: '푸드홈 관리자'
            }
          };
        }
        return inq;
      })
    }));
    showToast('답변이 등록되었습니다.');
  };

  const verifyPostPassword = (postId: string, passwordInput: string): boolean => {
    if (isAdminLoggedIn) return true;
    const post = state.inquiries.find(i => i.id === postId);
    if (!post) return false;
    if (!post.password) return true; // If no password was set, allow viewing
    return post.password.trim() === passwordInput.trim();
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
  }): Promise<{ success: boolean; id?: string }> => {
    const newId = `quote-${Date.now()}`;
    const nextPostNumber = (state.quotes && state.quotes.length > 0)
      ? Math.max(...state.quotes.map(q => q.postNumber || 0)) + 1
      : 1;

    const passwordHash = await hashPassword(quote.password);

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

    // If Supabase is connected, attempt sync to database
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.from('quote_inquiries').insert([
          {
            title: quote.title,
            company_name: quote.companyName,
            contact_person: quote.contactPerson,
            phone: quote.phone,
            email: quote.email,
            region: quote.region,
            business_type: quote.businessType,
            interested_products: quote.interestedProducts,
            monthly_volume: quote.monthlyVolume,
            delivery_schedule: quote.deliverySchedule,
            message: quote.message,
            attachments: quote.attachments || [],
            password_hash: passwordHash,
            status: '접수완료',
            is_secret: true
          }
        ]);
      } catch (err) {
        console.warn('Supabase quote submission background sync:', err);
      }
    }

    showToast('대량 납품 견적 상담이 성공적으로 접수되었습니다.');
    return { success: true, id: newId };
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
    showToast(`견적 상담 상태가 '${status}'(으)로 변경되었습니다.`);
  };

  const updateQuoteReply = (id: string, reply: string, status?: string) => {
    setState(prev => ({
      ...prev,
      quotes: (prev.quotes || []).map(q => {
        if (q.id === id) {
          return {
            ...q,
            status: status || q.status || '상담중',
            adminReply: {
              content: reply,
              repliedAt: new Date().toISOString().slice(0, 10),
              author: '푸드홈 관리자'
            }
          };
        }
        return q;
      })
    }));
    showToast('관리자 답변이 등록되었습니다.');
  };

  const deleteQuoteInquiry = (id: string) => {
    setState(prev => ({
      ...prev,
      quotes: (prev.quotes || []).filter(q => q.id !== id)
    }));
    showToast('견적 상담글이 삭제되었습니다.');
  };

  const verifyQuotePassword = async (quoteId: string, passwordInput: string): Promise<boolean> => {
    if (isAdminLoggedIn) return true;
    const target = (state.quotes || []).find(q => q.id === quoteId);
    if (!target) return false;
    return verifyQuotePasswordWithHash(passwordInput, target.passwordHash, target.rawPasswordHint);
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
        handleAdminLogin,
        handleAdminLogout,
        supabaseConfig,
        updateSupabaseConfig,
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
        addQuoteInquiry,
        updateQuoteStatus,
        updateQuoteReply,
        deleteQuoteInquiry,
        verifyQuotePassword,
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
