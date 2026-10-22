import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductItem, PostItem, B2BInquiry, NavMenuItem, NavSubmenuItem } from '../types';
import { initialData } from '../data/initialData';
import { FoodhomeLogo } from './FoodhomeLogo';
import { submitToFormspree } from '../utils/formspree';
import { getSupabaseClient } from '../lib/supabase';
import { MainBannerManager } from './admin/MainBannerManager';
import { QuoteInquiriesManager } from './admin/QuoteInquiriesManager';
import { ContentManager } from './admin/ContentManager';
import { FormConfigManager } from './admin/FormConfigManager';
import { SiteInfoManager } from './admin/SiteInfoManager';
import { AdminAccountManager } from './admin/AdminAccountManager';
import { DatabaseSqlManager } from './admin/DatabaseSqlManager';
import { NoticeManager } from './admin/NoticeManager';
import { FaqManager } from './admin/FaqManager';
import { GnbMenuManager } from './admin/GnbMenuManager';
import { SectionContentModal } from './admin/SectionContentModal';
import { MainSectionsManager } from './admin/MainSectionsManager';
import { 
  X, 
  LayoutDashboard, 
  Layout,
  Type, 
  Palette, 
  Package, 
  FileText, 
  MessageSquareText, 
  Globe2, 
  Database, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Save, 
  RotateCcw, 
  Search, 
  ExternalLink,
  Sparkles,
  Phone,
  Mail,
  Eye,
  Sliders,
  CheckCircle2,
  Clock,
  Download,
  Upload,
  Send,
  Loader2,
  Link2,
  Menu,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  ArrowUpDown,
  ListTree,
  KeyRound,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Megaphone,
  HelpCircle,
  Truck,
  Building2,
  Layers,
  Settings,
  ChevronLeft,
  Menu as MenuIcon
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    state, 
    isAdminOpen, 
    setIsAdminOpen, 
    activeAdminTab, 
    setActiveAdminTab,
    updateContent,
    updateNavMenus,
    updateTheme,
    addProduct,
    updateProduct,
    deleteProduct,
    addPost,
    updatePost,
    deletePost,
    updateInquiryStatus,
    deleteInquiry,
    updateSeo,
    updateSocial,
    updateFormspreeEndpoint,
    resetToDefaults,
    importData,
    showToast,
    supabaseConfig,
    updateSupabaseConfig,
    handleAdminLogout
  } = useApp();

  const [supabaseUrlInput, setSupabaseUrlInput] = useState(supabaseConfig.url || '');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(supabaseConfig.anonKey || '');
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseStatusResult, setSupabaseStatusResult] = useState<string | null>(null);

  const [formspreeEndpointInput, setFormspreeEndpointInput] = useState(
    state.formspreeEndpoint || 'https://formspree.io/f/xoejykbn'
  );
  const [isTestingFormspree, setIsTestingFormspree] = useState(false);

  // Local state for Content Editing
  const [contentForm, setContentForm] = useState(state.content);

  // Local state for Navigation Menus (GNB)
  const [navMenusForm, setNavMenusForm] = useState<NavMenuItem[]>(() => {
    return state.content.navMenus && state.content.navMenus.length > 0
      ? state.content.navMenus
      : initialData.content.navMenus;
  });

  // Keep navMenusForm in sync when state.content.navMenus updates
  useEffect(() => {
    if (state.content.navMenus && state.content.navMenus.length > 0) {
      setNavMenusForm(state.content.navMenus);
    }
  }, [state.content.navMenus]);

  // Keep contentForm in sync when state.content updates
  useEffect(() => {
    setContentForm(state.content);
  }, [state.content]);

  // Local state for Theme
  const [themeForm, setThemeForm] = useState(state.theme);

  // Local state for SEO
  const [seoForm, setSeoForm] = useState(state.seo);

  // Local state for Social
  const [socialForm, setSocialForm] = useState(state.social);

  // Product modal / editing
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Partial<ProductItem>>({
    name: '',
    subtitle: '',
    category: '보쌈무김치',
    tag: '신규 상품',
    weight: '5kg / 10kg',
    storage: '냉장보관 (0~5℃)',
    shelfLife: '제조일로부터 30일',
    ingredients: '국내산 절임무 75%, 고춧가루, 마늘, 멸치액젓',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1583032015879-67990c74900a?auto=format&fit=crop&w=800&q=80',
    isPopular: false,
    isRecommended: false,
    bulkPriceGuide: '대량 주문 시 단가 별도 협의'
  });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Post modal / editing
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postForm, setPostForm] = useState<Partial<PostItem>>({
    title: '',
    category: '공지사항',
    author: '운영팀',
    content: '',
    thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    tags: ['식품안전', '보쌈무김치'],
    isPinned: false
  });
  const [tagInput, setTagInput] = useState('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Inquiry Filter & Active note
  const [inquiryFilter, setInquiryFilter] = useState<'전체' | '접수대기' | '샘플발송완료' | '상담완료'>('전체');
  const [selectedInquiryNoteId, setSelectedInquiryNoteId] = useState<string | null>(null);
  const [tempAdminMemo, setTempAdminMemo] = useState('');

  if (!isAdminOpen) return null;

  // Korean food luxury red preset palettes
  const redPalettes = [
    { name: '명품 버건디 레드 (공식 권장)', primary: '#872D35', accent: '#B64346' },
    { name: '전통 태양초 크림슨', primary: '#9E2A2B', accent: '#C84B4E' },
    { name: '깊은 숙성 고추장 레드', primary: '#6E1D24', accent: '#9B323B' },
    { name: '프리미엄 칠리 레드', primary: '#A62626', accent: '#D64040' },
    { name: '단아한 다홍빛 로즈', primary: '#8C3B43', accent: '#B85862' },
    { name: '모던 딥 와인', primary: '#5C1E26', accent: '#8E3B46' }
  ];

  // Handlers
  const handleSaveContent = () => {
    updateContent(contentForm);
  };

  const handleSaveTheme = () => {
    updateTheme(themeForm);
  };

  const handleSaveSeo = () => {
    updateSeo(seoForm);
    updateSocial(socialForm);
  };

  // Menu Handlers
  const handleSaveNavMenus = () => {
    updateNavMenus(navMenusForm);
  };

  const handleResetNavMenus = () => {
    if (confirm('상단 메뉴를 초기 기본값(회사소개, 제품소개, 제조공정, 납품안내, 고객센터)으로 복원하시겠습니까?')) {
      setNavMenusForm(initialData.content.navMenus);
      updateNavMenus(initialData.content.navMenus);
    }
  };

  const handleUpdateMenuName = (id: string, newName: string) => {
    setNavMenusForm(prev => prev.map(m => m.id === id ? { ...m, name: newName } : m));
  };

  const handleToggleMenuVisibility = (id: string) => {
    setNavMenusForm(prev => prev.map(m => m.id === id ? { ...m, visible: !m.visible } : m));
  };

  const handleUpdateMenuField = (id: string, updates: Partial<NavMenuItem>) => {
    setNavMenusForm(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleMoveMenu = (index: number, direction: 'up' | 'down') => {
    setNavMenusForm(prev => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleAddTopMenu = () => {
    const newMenu: NavMenuItem = {
      id: 'menu-' + Date.now(),
      name: '새 메뉴',
      visible: true,
      actionType: 'scroll',
      target: 'product-slider-section',
      submenus: []
    };
    setNavMenusForm(prev => [...prev, newMenu]);
  };

  const handleDeleteTopMenu = (id: string) => {
    if (confirm('해당 상단 메뉴를 삭제하시겠습니까?')) {
      setNavMenusForm(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleAddSubmenu = (menuId: string) => {
    const newSub: NavSubmenuItem = {
      id: 'sub-' + Date.now(),
      label: '세부 메뉴',
      actionType: 'scroll',
      target: 'product-slider-section'
    };
    setNavMenusForm(prev => prev.map(m => {
      if (m.id === menuId) {
        return { ...m, submenus: [...(m.submenus || []), newSub] };
      }
      return m;
    }));
  };

  const handleUpdateSubmenu = (menuId: string, subId: string, updates: Partial<NavSubmenuItem>) => {
    setNavMenusForm(prev => prev.map(m => {
      if (m.id === menuId) {
        return {
          ...m,
          submenus: (m.submenus || []).map(s => s.id === subId ? { ...s, ...updates } : s)
        };
      }
      return m;
    }));
  };

  const handleDeleteSubmenu = (menuId: string, subId: string) => {
    setNavMenusForm(prev => prev.map(m => {
      if (m.id === menuId) {
        return {
          ...m,
          submenus: (m.submenus || []).filter(s => s.id !== subId)
        };
      }
      return m;
    }));
  };

  // Logo Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setContentForm(prev => ({ ...prev, logoUrl: dataUrl }));
      updateContent({ logoUrl: dataUrl });
      showToast('공식 로고 이미지가 업로드되어 즉시 적용되었습니다.');
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => {
    setContentForm(prev => ({ ...prev, logoUrl: '' }));
    updateContent({ logoUrl: '' });
    showToast('기본 공식 벡터 SVG 로고로 복원되었습니다.');
  };

  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      subtitle: '',
      category: '보쌈무김치',
      tag: '신규 상품',
      weight: '5kg / 10kg',
      storage: '냉장보관 (0~5℃)',
      shelfLife: '제조일로부터 30일',
      ingredients: '국내산 절임무 75%, 고춧가루, 마늘, 멸치액젓',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1583032015879-67990c74900a?auto=format&fit=crop&w=800&q=80',
      isPopular: false,
      isRecommended: false,
      bulkPriceGuide: '대량 주문 시 단가 별도 협의'
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (p: ProductItem) => {
    setEditingProductId(p.id);
    setProductForm({ ...p });
    setIsProductModalOpen(true);
  };

  const handleSaveProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) {
      alert('제품명을 입력해 주세요.');
      return;
    }

    if (editingProductId) {
      updateProduct(editingProductId, productForm);
    } else {
      addProduct(productForm as Omit<ProductItem, 'id'>);
    }
    setIsProductModalOpen(false);
  };

  const handleOpenAddPost = () => {
    setEditingPostId(null);
    setPostForm({
      title: '',
      category: '공지사항',
      author: '운영팀',
      content: '',
      thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      tags: ['공지', '소식'],
      isPinned: false
    });
    setTagInput('공지, 소식');
    setIsPostModalOpen(true);
  };

  const handleEditPost = (post: PostItem) => {
    setEditingPostId(post.id);
    setPostForm({ ...post });
    setTagInput(post.tags.join(', '));
    setIsPostModalOpen(true);
  };

  const handleSavePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postForm.title || !postForm.content) {
      alert('제목과 본문 내용을 입력해 주세요.');
      return;
    }

    const parsedTags = tagInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingPostId) {
      updatePost(editingPostId, {
        ...postForm,
        tags: parsedTags
      });
    } else {
      addPost({
        title: postForm.title || '',
        category: postForm.category as any,
        author: postForm.author || '푸드홈 운영팀',
        content: postForm.content || '',
        thumbnail: postForm.thumbnail || '',
        tags: parsedTags,
        isPinned: !!postForm.isPinned
      });
    }
    setIsPostModalOpen(false);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `foodhome_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('백업 JSON 파일이 성공적으로 다운로드되었습니다.');
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        importData(json);
      } catch (err) {
        alert('유효하지 않은 JSON 파일입니다.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveFormspree = () => {
    updateFormspreeEndpoint(formspreeEndpointInput);
  };

  const handleTestFormspree = async () => {
    setIsTestingFormspree(true);
    const res = await submitToFormspree(formspreeEndpointInput, {
      상호명_매장명: '푸드홈 관리자 연동 테스트',
      대표자_담당자명: '시스템 관리자',
      연락처: '010-1234-5678',
      이메일: 'admin@foodhome.co.kr',
      업종형태: '보쌈·족발 전문점',
      신청유형: '무료 샘플 요청',
      월예상소진량: '월 200kg ~ 300kg',
      상세요청사항: 'Formspree 데이터 수집 링크(https://formspree.io/f/xoejykbn) 연동 확인용 테스트 발송입니다.',
      _subject: '[연동 테스트] 푸드홈 웹사이트 Formspree 연동 확인',
      _replyto: 'admin@foodhome.co.kr'
    });
    setIsTestingFormspree(false);
    if (res.success) {
      showToast('Formspree로 테스트 데이터가 성공적으로 발송되었습니다!');
    } else {
      showToast('Formspree 전송 오류: ' + (res.message || 'URL을 확인해 주세요.'));
    }
  };

  const handleSaveSupabase = () => {
    updateSupabaseConfig({
      url: supabaseUrlInput.trim(),
      anonKey: supabaseKeyInput.trim()
    });
    setSupabaseStatusResult('Supabase 설정이 로컬 환경에 저장되었습니다.');
  };

  const handleTestSupabaseConnection = async () => {
    if (!supabaseUrlInput.trim() || !supabaseKeyInput.trim()) {
      setSupabaseStatusResult('URL 및 Anon Key를 모두 입력해 주세요.');
      return;
    }
    setIsTestingSupabase(true);
    setSupabaseStatusResult(null);
    try {
      // Save first
      updateSupabaseConfig({
        url: supabaseUrlInput.trim(),
        anonKey: supabaseKeyInput.trim()
      });
      const client = getSupabaseClient();
      if (!client) {
        setIsTestingSupabase(false);
        setSupabaseStatusResult('Supabase 클라이언트 생성 실패: URL 형식을 확인해 주세요.');
        return;
      }

      // Check form_submissions table
      const { data, error } = await client
        .from('form_submissions')
        .select('id')
        .limit(1);

      setIsTestingSupabase(false);
      if (error) {
        setSupabaseStatusResult(`연결 응답 수신됨 (테이블 생성 또는 RLS 권한 확인 필요): ${error.message}`);
      } else {
        setSupabaseStatusResult('Supabase 연결 성공! form_submissions 테이블 통신이 정상적으로 확인되었습니다.');
        showToast('Supabase 연결 테스트 성공!');
      }
    } catch (e: any) {
      setIsTestingSupabase(false);
      setSupabaseStatusResult(`연결 오류: ${e?.message || '네트워크 오류'}`);
    }
  };

  const pendingInquiriesCount = state.inquiries.filter(i => i.status === '접수대기').length;

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    main_banner: true,
    boards: true,
    homepage: true,
    settings: true
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  interface AdminMenuItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }

  interface AdminMenuGroup {
    id: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    items: AdminMenuItem[];
  }

  const adminMenuGroups: AdminMenuGroup[] = [
    {
      id: 'dashboard',
      title: '대시보드',
      icon: LayoutDashboard,
      items: [
        { id: 'overview', label: '대시보드', icon: LayoutDashboard }
      ]
    },
    {
      id: 'main_banner',
      title: '메인 배너 관리',
      icon: ImageIcon,
      items: [
        { 
          id: 'banners', 
          label: '메인 배너 관리', 
          icon: ImageIcon,
          badge: (state.content.banners || []).length || undefined 
        }
      ]
    },
    {
      id: 'boards',
      title: '게시판 관리',
      icon: FileText,
      items: [
        { 
          id: 'inquiries', 
          label: '샘플 게시판 관리', 
          icon: Sparkles,
          badge: pendingInquiriesCount > 0 ? pendingInquiriesCount : undefined,
          badgeColor: 'bg-amber-500 text-white'
        },
        { 
          id: 'quotes', 
          label: '대량 견적상담 관리', 
          icon: Truck,
          badge: (state.quotes || []).filter(q => q.status === '접수완료' || q.status === '상담중').length || undefined,
          badgeColor: 'bg-[#872D35] text-white'
        },
        { id: 'form_config', label: '견적신청폼 항목 설정', icon: Sliders },
        { id: 'notices', label: '공지사항 관리', icon: Megaphone },
        { id: 'faqs', label: '자주하는 질문(FAQ) 관리', icon: HelpCircle }
      ]
    },
    {
      id: 'homepage',
      title: '홈페이지 관리',
      icon: Layers,
      items: [
        { id: 'menus', label: '상단 메뉴 관리', icon: Menu },
        { id: 'all_content', label: '상단 메뉴 콘텐츠 관리', icon: Type },
        { id: 'main_sections', label: '메인페이지 섹션 관리', icon: Layout },
        { id: 'site_info', label: '회사 기본 정보 관리', icon: Building2 },
        { id: 'design', label: '디자인 & 테마', icon: Palette }
      ]
    },
    {
      id: 'settings',
      title: '사이트 설정',
      icon: Settings,
      items: [
        { id: 'seo', label: 'SEO 관리', icon: Globe2 },
        { id: 'admin_security', label: '관리자 보안 / 계정', icon: ShieldCheck },
        { id: 'supabase', label: 'Supabase 연동 및 DB', icon: Database },
        { id: 'backup', label: '데이터 백업 / 복원', icon: RotateCcw }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[96vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#2A2020] text-white px-5 sm:px-6 py-3.5 flex items-center justify-between shrink-0 border-b border-[#3D2E2E]">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setIsMobileSidebarOpen(prev => !prev)}
              className="lg:hidden p-1.5 rounded-lg bg-stone-800 text-stone-300 hover:text-white cursor-pointer"
              aria-label="관리자 메뉴 열기"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 rounded-xl bg-[#872D35] flex items-center justify-center font-black text-lg text-white shadow-xs">
              푸
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base tracking-tight">
                  푸드홈 통합 관리자 대시보드
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-stone-200 border border-white/20 hidden sm:inline-block">
                  FOODHOME ADMIN v2.5
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden sm:block">
                홈페이지 콘텐츠·디자인 관리, B2B 대량 견적 및 샘플 게시판 통합 관제
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsAdminOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-stone-800 text-xs font-bold text-stone-300 hover:text-white hover:bg-stone-700 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#B64346]" />
              <span className="hidden sm:inline">사이트 닫기</span>
            </button>
            <button
              onClick={() => {
                handleAdminLogout();
                setIsAdminOpen(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-stone-800 text-xs font-bold text-red-300 hover:text-white hover:bg-red-800 transition-colors flex items-center gap-1 cursor-pointer"
              title="관리자 세션 로그아웃"
            >
              <span>로그아웃</span>
            </button>
            <button
              onClick={() => setIsAdminOpen(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Body: Left Sidebar + Right Content Area */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          
          {/* Mobile Sidebar Overlay Backdrop */}
          {isMobileSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-30 animate-in fade-in"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Left Fixed Vertical Sidebar */}
          <aside
            className={`
              fixed lg:static top-0 bottom-0 left-0 z-40 lg:z-auto
              bg-stone-50/95 border-r border-stone-200 flex flex-col shrink-0 h-full
              transition-all duration-200 ease-in-out select-none
              ${isMobileSidebarOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
              ${isSidebarCollapsed ? 'lg:w-[68px]' : 'lg:w-64'}
            `}
          >
            {/* Sidebar Controls Header */}
            <div className="p-3 border-b border-stone-200 flex items-center justify-between shrink-0 bg-stone-100/70">
              {!isSidebarCollapsed ? (
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[11px] font-black text-stone-700 tracking-tight">관리 메뉴</span>
                </div>
              ) : (
                <div className="mx-auto">
                  <span className="w-2 h-2 rounded-full bg-[#872D35] block" />
                </div>
              )}

              {/* Collapse/Expand Toggle Button (Desktop) */}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="hidden lg:flex p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors cursor-pointer"
                title={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-[#872D35]" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </button>

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Navigation Groups (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-2 space-y-4 no-scrollbar">
              {adminMenuGroups.map(group => {
                const isGroupExpanded = expandedGroups[group.id] !== false;

                return (
                  <div key={group.id} className="space-y-1">
                    {/* Group Accordion Header */}
                    {!isSidebarCollapsed ? (
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.id)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-extrabold text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <group.icon className="w-3.5 h-3.5 text-stone-500" />
                          <span>{group.title}</span>
                        </div>
                        <ChevronDown 
                          className={`w-3 h-3 text-stone-400 transition-transform duration-150 ${isGroupExpanded ? 'rotate-0' : '-rotate-90'}`} 
                        />
                      </button>
                    ) : (
                      <div className="pt-2 border-t border-stone-200 first:border-0 first:pt-0" />
                    )}

                    {/* Group Items */}
                    {(isGroupExpanded || isSidebarCollapsed) && (
                      <div className={`space-y-0.5 ${!isSidebarCollapsed ? 'pl-1' : ''}`}>
                        {group.items.map(item => {
                          const Icon = item.icon;
                          const isActive = 
                            activeAdminTab === item.id || 
                            (item.id === 'all_content' && (activeAdminTab === 'content' || activeAdminTab === 'products')) ||
                            (item.id === 'faqs' && (activeAdminTab === 'faqs' || activeAdminTab === 'faq'));

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => {
                                setActiveAdminTab(item.id);
                                setIsMobileSidebarOpen(false);
                              }}
                              title={item.label}
                              className={`
                                w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all cursor-pointer group relative
                                ${isActive 
                                  ? 'bg-[#872D35] text-white font-extrabold shadow-xs' 
                                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 font-semibold'}
                                ${isSidebarCollapsed ? 'justify-center px-2' : ''}
                              `}
                            >
                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-500 group-hover:text-stone-800'}`} />
                              
                              {!isSidebarCollapsed && (
                                <span className="flex-1 text-left truncate">{item.label}</span>
                              )}

                              {item.badge !== undefined && (
                                <span className={`
                                  text-[10px] font-black rounded-full px-1.5 py-0.5 leading-none shrink-0
                                  ${isActive ? 'bg-white text-[#872D35]' : (item.badgeColor || 'bg-stone-200 text-stone-700')}
                                  ${isSidebarCollapsed ? 'absolute -top-1 -right-1 ring-2 ring-white' : ''}
                                `}>
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sidebar Footer */}
            {!isSidebarCollapsed ? (
              <div className="p-3 border-t border-stone-200 bg-stone-100/50 text-[11px] text-stone-500 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-700">관리자 인증 모드</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5 truncate">FOODHOME Security Active</p>
              </div>
            ) : (
              <div className="p-3 border-t border-stone-200 flex justify-center shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="관리자 인증 활성" />
              </div>
            )}
          </aside>

          {/* Right Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50/60 min-w-0">

            {/* 1. OVERVIEW TAB */}
            {activeAdminTab === 'overview' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>미처리 샘플 문의</span>
                    <span className="p-1 rounded bg-amber-50 text-amber-600">
                      <Clock className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-black text-amber-600 mt-2">
                    {pendingInquiriesCount}건
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">접수 즉시 유선 연락 권장</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>등록 제품 수</span>
                    <span className="p-1 rounded bg-blue-50 text-blue-600">
                      <Package className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mt-2">
                    {state.products.length}종
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">보쌈무 및 김칫속 라인업</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>공지 & FAQ 게시물</span>
                    <span className="p-1 rounded bg-purple-50 text-purple-600">
                      <FileText className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 mt-2">
                    {state.posts.filter(p => p.category === '공지사항').length + (state.content.faqItems || []).length}건
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">공지사항 및 자주하는질문</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>전국 가맹점 공급</span>
                    <span className="p-1 rounded bg-emerald-50 text-emerald-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-3xl font-black text-emerald-600 mt-2">
                    480개소
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">재발주율 98.8% 달성</p>
                </div>
              </div>

              {/* Quick Jump Shortcuts */}
              <div className="bg-white p-5 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 mb-3">빠른 관리 바로가기</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <button
                    onClick={() => setActiveAdminTab('menus')}
                    className="p-3 rounded-lg border border-[#872D35]/30 bg-[#872D35]/5 hover:bg-[#872D35]/10 text-left transition-colors cursor-pointer"
                  >
                    <Menu className="w-4 h-4 text-[#872D35] mb-1" />
                    <span className="text-xs font-bold block text-slate-800">상단 메뉴 관리</span>
                    <span className="text-[10px] text-slate-500">GNB 메뉴 순서/동작</span>
                  </button>

                  <button
                    onClick={() => setActiveAdminTab('all_content')}
                    className="p-3 rounded-lg border border-slate-200 hover:border-[#872D35] hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <Type className="w-4 h-4 text-[#872D35] mb-1" />
                    <span className="text-xs font-bold block text-slate-800">상단 메뉴 콘텐츠</span>
                    <span className="text-[10px] text-slate-500">회사·제품·제조·납품</span>
                  </button>

                  <button
                    onClick={() => setActiveAdminTab('main_sections')}
                    className="p-3 rounded-lg border border-slate-200 hover:border-[#872D35] hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <Layout className="w-4 h-4 text-[#872D35] mb-1" />
                    <span className="text-xs font-bold block text-slate-800">메인페이지 섹션</span>
                    <span className="text-[10px] text-slate-500">섹션 순서/표시/문구</span>
                  </button>

                  <button
                    onClick={() => setActiveAdminTab('site_info')}
                    className="p-3 rounded-lg border border-slate-200 hover:border-[#872D35] hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-[#872D35] mb-1" />
                    <span className="text-xs font-bold block text-slate-800">회사 기본 정보</span>
                    <span className="text-[10px] text-slate-500">사업자·연락처·로고</span>
                  </button>

                  <button
                    onClick={() => setActiveAdminTab('notices')}
                    className="p-3 rounded-lg border border-slate-200 hover:border-[#872D35] hover:bg-slate-50 text-left transition-colors cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 text-[#872D35] mb-1" />
                    <span className="text-xs font-bold block text-slate-800">공지사항 관리</span>
                    <span className="text-[10px] text-slate-500">새 공지 등록/수정</span>
                  </button>
                </div>
              </div>

              {/* Recent Inquiries Preview */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquareText className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">최근 접수된 B2B 샘플 및 견적 문의</h3>
                  </div>
                  <button
                    onClick={() => setActiveAdminTab('inquiries')}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    전체 문의 목록 보기 →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {state.inquiries.slice(0, 4).map((inq) => (
                    <div key={inq.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            inq.status === '접수대기' ? 'bg-amber-100 text-amber-800' :
                            inq.status === '샘플발송완료' ? 'bg-blue-100 text-blue-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {inq.status}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{inq.companyName}</span>
                          <span className="text-xs text-slate-500">({inq.contactPerson} / {inq.phone})</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                          [{inq.requestType}] {inq.message || '상세 메시지 없음'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={inq.status}
                          onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any)}
                          className="text-xs px-2 py-1 rounded border border-slate-200 bg-white"
                        >
                          <option value="접수대기">접수대기</option>
                          <option value="샘플발송완료">샘플발송완료</option>
                          <option value="상담완료">상담완료</option>
                          <option value="보류">보류</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MAIN BANNER MANAGER TAB */}
          {activeAdminTab === 'banners' && (
            <div className="max-w-6xl mx-auto">
              <MainBannerManager />
            </div>
          )}

          {/* 1:1 QUOTE INQUIRIES TAB */}
          {activeAdminTab === 'quotes' && (
            <div className="max-w-6xl mx-auto">
              <QuoteInquiriesManager />
            </div>
          )}

          {/* ALL PAGES CONTENT MANAGER TAB */}
          {activeAdminTab === 'all_content' && (
            <div className="max-w-6xl mx-auto">
              <ContentManager />
            </div>
          )}

          {/* MAIN PAGE SECTIONS CONFIG TAB */}
          {activeAdminTab === 'main_sections' && (
            <div className="max-w-6xl mx-auto">
              <MainSectionsManager />
            </div>
          )}

          {/* QUOTE FORM CONFIG TAB */}
          {activeAdminTab === 'form_config' && (
            <div className="max-w-5xl mx-auto">
              <FormConfigManager />
            </div>
          )}

          {/* SITE INFO TAB */}
          {activeAdminTab === 'site_info' && (
            <div className="max-w-5xl mx-auto">
              <SiteInfoManager />
            </div>
          )}

          {/* ADMIN SECURITY / ACCOUNT TAB */}
          {activeAdminTab === 'admin_security' && (
            <div className="max-w-4xl mx-auto">
              <AdminAccountManager />
            </div>
          )}

          {/* SUPABASE CONNECTION & DATABASE SETTINGS TAB */}
          {activeAdminTab === 'supabase' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Database className="w-5 h-5" />
                    </span>
                    <h3 className="text-base font-bold text-slate-900">Supabase 데이터베이스 연동 및 관리</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    관리자 인증(Supabase Auth), 고객 신청서(form_submissions), 폼 정의(form_definitions), 관리자 권한(site_admins)을 연동합니다.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                    supabaseConfig.url && supabaseConfig.anonKey
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      supabaseConfig.url && supabaseConfig.anonKey ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`} />
                    <span>{supabaseConfig.url && supabaseConfig.anonKey ? 'Supabase 연동 활성화' : '로컬 모드 (키 미설정)'}</span>
                  </span>
                </div>
              </div>

              {/* Supabase Connection Credentials Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5 shadow-2xs">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>Supabase 프로젝트 연결 정보 설정</span>
                </h4>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Project URL (VITE_SUPABASE_URL)
                    </label>
                    <input
                      type="url"
                      value={supabaseUrlInput}
                      onChange={(e) => setSupabaseUrlInput(e.target.value)}
                      placeholder="https://your-project.supabase.co"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#872D35] font-mono text-xs"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Supabase 대시보드 &gt; Project Settings &gt; API &gt; Project URL
                    </p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Anon Public API Key (VITE_SUPABASE_ANON_KEY)
                    </label>
                    <input
                      type="password"
                      value={supabaseKeyInput}
                      onChange={(e) => setSupabaseKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:border-[#872D35] font-mono text-xs"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      공개 클라이언트용 anon key입니다. (service_role 키는 절대 프론트엔드에 입력하지 마세요)
                    </p>
                  </div>
                </div>

                {supabaseStatusResult && (
                  <div className={`p-3.5 rounded-xl border text-xs font-bold ${
                    supabaseStatusResult.includes('성공') 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}>
                    {supabaseStatusResult}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <p className="text-[11px] text-slate-500">
                    * 환경 변수 또는 위 입력창에 저장된 값은 브라우저 세션에 안전하게 저장됩니다.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isTestingSupabase}
                      onClick={handleTestSupabaseConnection}
                      className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isTestingSupabase ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                      <span>연결 테스트</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveSupabase}
                      className="px-4 py-2 rounded-lg bg-[#872D35] hover:bg-[#6E1D24] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>설정 저장</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Required Supabase Tables Checklist */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4 shadow-2xs">
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>연동 데이터베이스 테이블 및 보안 스키마 현황</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">site_admins</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">인증 연동</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      관리자 권한 및 역할 정의 테이블. <code className="text-[#872D35] font-bold">is_site_admin()</code> RPC 함수로 관리자 여부를 서버단에서 검증합니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">form_definitions</span>
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">동적 폼</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      샘플신청 및 견적문의 신청서 양식의 입력 필드(항목명, 유형, 필수여부)를 동적으로 관리하는 스키마입니다.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">form_submissions</span>
                      <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">신청서 접수</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      고객 샘플 신청 내역 저장 테이블. 개인정보는 관리자 외 전체 조회 불가하며, 고객은 4자리 비밀번호 검증으로 본인 글만 확인합니다.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Supabase Edge Functions 및 RLS (Row Level Security) 원칙</span>
                  </p>
                  <p className="text-[11px] leading-relaxed text-blue-800">
                    비밀번호 검증 및 개인정보 조회를 위해 서버리스 Edge Functions를 연동할 수 있도록 설계되어 있습니다. 현재 대시보드에서 등록된 모든 신청서는 안전하게 암호화되어 관리됩니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* GNB MENU MANAGER TAB */}
          {activeAdminTab === 'menus' && (
            <div className="max-w-5xl mx-auto">
              <GnbMenuManager />
            </div>
          )}

          {/* NOTICES MANAGER TAB */}
          {activeAdminTab === 'notices' && (
            <div className="max-w-5xl mx-auto">
              <NoticeManager />
            </div>
          )}

          {/* FAQ MANAGER TAB */}
          {activeAdminTab === 'faqs' && (
            <div className="max-w-5xl mx-auto">
              <FaqManager />
            </div>
          )}

          {/* 2. CONTENT EDITING TAB */}
          {activeAdminTab === 'content' && (
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">사이트 기본 콘텐츠 & 문구 수정</h3>
                  <p className="text-xs text-slate-500">브랜드명, 히어로 섹션 카피, 기업 연락처 정보를 자유롭게 수정할 수 있습니다.</p>
                </div>
                <button
                  onClick={handleSaveContent}
                  className="px-4 py-2 bg-[#872D35] hover:bg-[#6E1D24] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>변경사항 저장하기</span>
                </button>
              </div>

              {/* Brand info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">브랜드 정체성</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">브랜드명 (국문)</label>
                    <input
                      type="text"
                      value={contentForm.brandName}
                      onChange={(e) => setContentForm({ ...contentForm, brandName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">브랜드명 (영문/서브)</label>
                    <input
                      type="text"
                      value={contentForm.brandSubName}
                      onChange={(e) => setContentForm({ ...contentForm, brandSubName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">브랜드 슬로건</label>
                  <input
                    type="text"
                    value={contentForm.tagline}
                    onChange={(e) => setContentForm({ ...contentForm, tagline: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                  />
                </div>

                {/* Official Logo Management (User Request: 로고는 네번째 사진이고) */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#872D35]" />
                        푸드홈 공식 로고 관리 (4번째 참고 이미지 연동)
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        스마트스토어의 푸드홈 공식 로고 이미지 파일(PNG, SVG, JPG)을 직접 업로드하거나 URL을 등록할 수 있습니다.
                      </p>
                    </div>
                    {contentForm.logoUrl && (
                      <button
                        type="button"
                        onClick={handleResetLogo}
                        className="text-[11px] font-bold text-[#872D35] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>기본 공식 벡터 로고로 복원</span>
                      </button>
                    )}
                  </div>

                  {/* Previews: Light (header) & Dark (footer) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col items-center justify-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">상단 헤더 적용 미리보기 (밝은 배경)</span>
                      <div className="py-2 flex items-center justify-center min-h-[50px]">
                        <FoodhomeLogo variant="dark" height={42} />
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-stone-800 bg-[#221A1A] flex flex-col items-center justify-center gap-2">
                      <span className="text-[10px] font-bold text-stone-400">하단 푸터 적용 미리보기 (어두운 배경)</span>
                      <div className="py-2 flex items-center justify-center min-h-[50px]">
                        <FoodhomeLogo variant="light" height={36} />
                      </div>
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-1">
                    <div className="sm:col-span-5">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        공식 로고 파일 직접 업로드 (PNG, SVG, JPG)
                      </label>
                      <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-[#872D35]/40 hover:border-[#872D35] bg-[#872D35]/5 hover:bg-[#872D35]/10 text-[#872D35] text-xs font-bold cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>내 PC에서 로고 파일 선택</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="sm:col-span-7">
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        또는 로고 이미지 URL 직접 입력
                      </label>
                      <input
                        type="text"
                        value={contentForm.logoUrl || ''}
                        onChange={(e) => {
                          setContentForm({ ...contentForm, logoUrl: e.target.value });
                          updateContent({ logoUrl: e.target.value });
                        }}
                        placeholder="예: ./images/foodhome_logo.svg 또는 https://..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    ※ 스마트스토어의 푸드홈 공식 로고 원본 파일(4번째 사진)을 업로드하시면 사이트 상단 및 푸터에 비율 왜곡 없이 100% 동일하게 반영됩니다.
                  </p>
                </div>
              </div>

              {/* Hero Section Copy */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">히어로 섹션 문구 및 이미지</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">메인 헤드라인 1번째 줄</label>
                    <input
                      type="text"
                      value={contentForm.heroTitle}
                      onChange={(e) => setContentForm({ ...contentForm, heroTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">강조 포인트 문구 (파란색 그라데이션)</label>
                    <input
                      type="text"
                      value={contentForm.heroHighlight}
                      onChange={(e) => setContentForm({ ...contentForm, heroHighlight: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">상단 서브 타이틀 뱃지</label>
                  <input
                    type="text"
                    value={contentForm.heroSubtitle}
                    onChange={(e) => setContentForm({ ...contentForm, heroSubtitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">상세 설명문</label>
                  <textarea
                    rows={3}
                    value={contentForm.heroDescription}
                    onChange={(e) => setContentForm({ ...contentForm, heroDescription: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">히어로 대표 이미지 URL</label>
                  <input
                    type="url"
                    value={contentForm.heroImageUrl}
                    onChange={(e) => setContentForm({ ...contentForm, heroImageUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              {/* Company Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">사업자 및 고객센터 정보</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">회사 상호명</label>
                    <input
                      type="text"
                      value={contentForm.companyName}
                      onChange={(e) => setContentForm({ ...contentForm, companyName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">대표자명</label>
                    <input
                      type="text"
                      value={contentForm.ceoName}
                      onChange={(e) => setContentForm({ ...contentForm, ceoName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">대표전화</label>
                    <input
                      type="text"
                      value={contentForm.phone}
                      onChange={(e) => setContentForm({ ...contentForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">사업자등록번호</label>
                    <input
                      type="text"
                      value={contentForm.businessNumber}
                      onChange={(e) => setContentForm({ ...contentForm, businessNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">통신판매업신고</label>
                    <input
                      type="text"
                      value={contentForm.mailOrderNumber}
                      onChange={(e) => setContentForm({ ...contentForm, mailOrderNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">식품제조가공업 영업등록번호</label>
                    <input
                      type="text"
                      value={contentForm.haccpNumber}
                      onChange={(e) => setContentForm({ ...contentForm, haccpNumber: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">제조공장 주소</label>
                    <input
                      type="text"
                      value={contentForm.factoryAddress}
                      onChange={(e) => setContentForm({ ...contentForm, factoryAddress: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">서울본부 주소</label>
                    <input
                      type="text"
                      value={contentForm.hqAddress}
                      onChange={(e) => setContentForm({ ...contentForm, hqAddress: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveContent}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  수정 내용 즉시 적용
                </button>
              </div>
            </div>
          )}

          {/* 3. DESIGN & THEME TAB */}
          {activeAdminTab === 'design' && (
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">디자인 & 테마 커스터마이징</h3>
                  <p className="text-xs text-slate-500">배경은 깨끗한 화이트, 포인트 컬러(고급스러운 붉은색/버건디 계열) 및 폰트, 카드 라운딩을 조절합니다.</p>
                </div>
                <button
                  onClick={handleSaveTheme}
                  className="px-4 py-2 bg-[#872D35] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-[#6D242B] transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>테마 설정 저장</span>
                </button>
              </div>

              {/* Red Palettes */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-3">
                  포인트 컬러 (프리미엄 붉은색 팔레트 프리셋)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {redPalettes.map((pal, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setThemeForm({ ...themeForm, primaryColor: pal.primary, accentColor: pal.accent })}
                      className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        themeForm.primaryColor === pal.primary
                          ? 'border-[#872D35] bg-[#FAF8F5] ring-2 ring-[#872D35]/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div 
                        className="w-7 h-7 rounded-lg shadow-xs shrink-0" 
                        style={{ backgroundColor: pal.primary }} 
                      />
                      <div>
                        <span className="text-xs font-bold block text-slate-800">{pal.name}</span>
                        <span className="text-[10px] text-slate-400">{pal.primary}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Hex Inputs */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">메인 포인트 HEX</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeForm.primaryColor}
                        onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                        className="w-8 h-8 rounded border p-0.5 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeForm.primaryColor}
                        onChange={(e) => setThemeForm({ ...themeForm, primaryColor: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded border border-slate-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">보조 강조 HEX</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeForm.accentColor}
                        onChange={(e) => setThemeForm({ ...themeForm, accentColor: e.target.value })}
                        className="w-8 h-8 rounded border p-0.5 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={themeForm.accentColor}
                        onChange={(e) => setThemeForm({ ...themeForm, accentColor: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Radius */}
              <div className="pt-4 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  UI 요소 둥글기 (모서리 라운딩)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '각진 스타일', val: 'rounded-none' },
                    { label: '기본 라운드', val: 'rounded-lg' },
                    { label: '부드러운 곡선', val: 'rounded-xl' },
                    { label: '동글동글한 모서리', val: 'rounded-2xl' }
                  ].map((rad) => (
                    <button
                      key={rad.val}
                      type="button"
                      onClick={() => setThemeForm({ ...themeForm, cardRadius: rad.val as any })}
                      className={`py-2 px-3 text-xs font-bold border rounded-lg transition-colors cursor-pointer ${
                        themeForm.cardRadius === rad.val
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {rad.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Guidance for Main Sections */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div>
                  <span className="text-xs font-bold text-stone-800 block">메인페이지 섹션 표시 및 순서 설정 안내</span>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    메인 페이지의 각 섹션별 노출/숨김, 순서 변경 및 문구 수정은 <strong>'메인페이지 섹션 관리'</strong> 독립 메뉴에서 통합 관리됩니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAdminTab('main_sections')}
                  className="px-3.5 py-1.5 rounded-lg bg-[#872D35] text-white text-xs font-bold hover:bg-[#6D242B] cursor-pointer shrink-0"
                >
                  섹션 관리 바로가기
                </button>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={handleSaveTheme}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
                >
                  테마 설정 즉시 반영
                </button>
              </div>
            </div>
          )}

          {/* 4. PRODUCTS MANAGEMENT TAB */}
          {activeAdminTab === 'products' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">식품 제품 라인업 관리</h3>
                  <p className="text-xs text-slate-500">현재 등록된 총 {state.products.length}개의 상품을 관리합니다.</p>
                </div>
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ 새 제품 추가</span>
                </button>
              </div>

              {/* Product List Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.products.map((p) => (
                  <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 items-start justify-between shadow-2xs">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                            {p.category}
                          </span>
                          {p.tag && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                              {p.tag}
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{p.name}</h4>
                        <p className="text-xs text-slate-500 line-clamp-1">{p.subtitle}</p>
                        <p className="text-[11px] text-slate-400">규격: {p.weight}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={() => handleEditProduct(p)}
                        className="p-1.5 rounded bg-slate-100 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="수정"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`"${p.name}" 제품을 삭제하시겠습니까?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 rounded bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}



          {/* 6. B2B INQUIRIES MANAGEMENT TAB */}
          {activeAdminTab === 'inquiries' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">B2B 무료 샘플 및 납품 견적 문의 현황</h3>
                  <p className="text-xs text-slate-500">외식업 사장님들의 접수 내역을 확인하고 처리 상태와 내부 메모를 관리합니다.</p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5">
                  {(['전체', '접수대기', '샘플발송완료', '상담완료'] as const).map(flt => (
                    <button
                      key={flt}
                      onClick={() => setInquiryFilter(flt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        inquiryFilter === flt
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {flt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formspree Endpoint Configuration Card */}
              <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-xl p-5 text-white shadow-md space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-sm">
                      F
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold">Formspree 실시간 데이터 수집 연동</h4>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          연동 활성화됨 (ACTIVE)
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        웹사이트에서 고객이 샘플 및 견적을 신청하면 Formspree로 즉시 수집되고 이메일 알림이 전달됩니다.
                      </p>
                    </div>
                  </div>

                  <a
                    href="https://formspree.io/forms/xoejykbn/submissions"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-blue-200 hover:text-white transition-colors flex items-center gap-1 border border-white/10"
                  >
                    <span>Formspree 대시보드 바로가기</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <div className="relative flex-1">
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={formspreeEndpointInput}
                      onChange={(e) => setFormspreeEndpointInput(e.target.value)}
                      placeholder="https://formspree.io/f/xoejykbn"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleSaveFormspree}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>엔드포인트 저장</span>
                    </button>

                    <button
                      type="button"
                      disabled={isTestingFormspree}
                      onClick={handleTestFormspree}
                      className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-slate-600 disabled:opacity-50"
                    >
                      {isTestingFormspree ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>테스트 발송 중...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>연동 테스트 발송</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Inquiries Cards */}
              <div className="space-y-4">
                {state.inquiries
                  .filter(i => inquiryFilter === '전체' || i.status === inquiryFilter)
                  .map((inq) => (
                    <div key={inq.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                            inq.status === '접수대기' ? 'bg-amber-100 text-amber-800' :
                            inq.status === '샘플발송완료' ? 'bg-blue-100 text-blue-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {inq.status}
                          </span>
                          <span className="text-sm font-black text-slate-900">{inq.companyName}</span>
                          <span className="text-xs font-bold text-blue-600">[{inq.requestType}]</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">접수일: {inq.createdAt}</span>
                          <button
                            onClick={() => {
                              if (confirm('이 문의 내역을 삭제하시겠습니까?')) {
                                deleteInquiry(inq.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Detail Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 block font-medium">담당자 성함</span>
                          <span className="font-bold text-slate-800">{inq.contactPerson}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">연락처</span>
                          <a href={`tel:${inq.phone}`} className="font-bold text-blue-600 hover:underline">
                            {inq.phone}
                          </a>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">업종 / 예상 소진량</span>
                          <span className="font-semibold text-slate-700">{inq.businessType} ({inq.monthlyUsage})</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">배송지 / 지역</span>
                          <span className="font-semibold text-slate-700">{inq.region || '미기재'}</span>
                        </div>
                      </div>

                      {/* Message */}
                      {inq.message && (
                        <div className="p-3 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-100">
                          <span className="font-bold block text-slate-500 mb-0.5">요청 메시지:</span>
                          {inq.message}
                        </div>
                      )}

                      {/* Admin Memo & Status Change */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                          <span className="font-bold text-slate-600 shrink-0">내부 관리 메모:</span>
                          <input
                            type="text"
                            defaultValue={inq.adminMemo || ''}
                            onBlur={(e) => updateInquiryStatus(inq.id, inq.status, e.target.value)}
                            placeholder="택배 송장번호나 통화 메모 입력 후 포커스 아웃 시 자동 저장"
                            className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 bg-white"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 font-medium">상태 변경:</span>
                          <select
                            value={inq.status}
                            onChange={(e) => updateInquiryStatus(inq.id, e.target.value as any, inq.adminMemo)}
                            className="px-2.5 py-1 text-xs font-bold rounded border border-slate-200 bg-white text-slate-800"
                          >
                            <option value="접수대기">접수대기</option>
                            <option value="샘플발송완료">샘플발송완료</option>
                            <option value="상담완료">상담완료</option>
                            <option value="보류">보류</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* 7. SEO & SOCIAL MEDIA TAB */}
          {activeAdminTab === 'seo' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">검색엔진 최적화(SEO) 및 소셜 메타태그 설정</h3>
                    <p className="text-xs text-slate-500">네이버, 구글 검색 결과 및 카카오톡 공유 시 노출되는 정보를 편집합니다.</p>
                  </div>
                  <button
                    onClick={handleSaveSeo}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>SEO 설정 저장</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      페이지 제목 (Title Tag) <span className="text-blue-600 font-normal">({seoForm.metaTitle.length}자)</span>
                    </label>
                    <input
                      type="text"
                      value={seoForm.metaTitle}
                      onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      메타 설명 (Description Tag) <span className="text-blue-600 font-normal">({seoForm.metaDescription.length}자)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={seoForm.metaDescription}
                      onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">검색 키워드 (Keywords)</label>
                    <input
                      type="text"
                      value={seoForm.keywords}
                      onChange={(e) => setSeoForm({ ...seoForm, keywords: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">SNS 오픈그래프 공유 이미지 URL</label>
                    <input
                      type="url"
                      value={seoForm.ogImageUrl}
                      onChange={(e) => setSeoForm({ ...seoForm, ogImageUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                {/* Social Links Setup */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">소셜 미디어 & 쇼핑몰 연동 링크</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">네이버 블로그 URL</label>
                      <input
                        type="url"
                        value={socialForm.naverBlogUrl}
                        onChange={(e) => setSocialForm({ ...socialForm, naverBlogUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">카카오톡 채널 URL</label>
                      <input
                        type="url"
                        value={socialForm.kakaoTalkUrl}
                        onChange={(e) => setSocialForm({ ...socialForm, kakaoTalkUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">인스타그램 URL</label>
                      <input
                        type="url"
                        value={socialForm.instagramUrl}
                        onChange={(e) => setSocialForm({ ...socialForm, instagramUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">네이버 스마트스토어 URL</label>
                      <input
                        type="url"
                        value={socialForm.smartStoreUrl}
                        onChange={(e) => setSocialForm({ ...socialForm, smartStoreUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview Cards (Naver & Kakao) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Naver Search Result Preview */}
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-emerald-600 block mb-2">
                    네이버 / 구글 검색결과 실시간 미리보기
                  </span>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 font-sans">
                    <span className="text-xs text-slate-500 block">https://foodhome.co.kr</span>
                    <h5 className="text-blue-700 font-medium text-sm hover:underline cursor-pointer line-clamp-1 mt-0.5">
                      {seoForm.metaTitle}
                    </h5>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {seoForm.metaDescription}
                    </p>
                  </div>
                </div>

                {/* Kakao OpenGraph Preview */}
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-amber-600 block mb-2">
                    카카오톡 / 소셜 공유 카드 실시간 미리보기
                  </span>
                  <div className="rounded-lg overflow-hidden border border-slate-200 max-w-xs mx-auto shadow-2xs">
                    <div className="aspect-16/9 bg-slate-100 overflow-hidden">
                      <img src={seoForm.ogImageUrl} alt="OpenGraph" className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2.5 bg-slate-50">
                      <span className="text-[10px] text-slate-400 block">foodhome.co.kr</span>
                      <h6 className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">{seoForm.metaTitle}</h6>
                      <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{seoForm.metaDescription}</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* 8. BACKUP & RESET TAB */}
          {activeAdminTab === 'backup' && (
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl border border-slate-200 space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h3 className="text-base font-bold text-slate-900">데이터 백업, 복원 및 초기화</h3>
                <p className="text-xs text-slate-500">
                  사이트의 모든 편집 데이터(텍스트, 테마, 제품 목록, 게시글, 접수 문의)를 JSON 파일로 다운로드하거나 복원할 수 있습니다.
                </p>
              </div>

              {/* Export */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">현재 데이터 백업 파일(JSON) 다운로드</h4>
                  <p className="text-[11px] text-slate-500">현재까지 수정한 모든 설정을 컴퓨터에 안전하게 보관합니다.</p>
                </div>
                <button
                  onClick={handleExportJson}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>백업 다운로드</span>
                </button>
              </div>

              {/* Import */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">백업 JSON 파일 불러오기</h4>
                  <p className="text-[11px] text-slate-500">기존에 다운로드한 백업 파일을 업로드하여 데이터를 복원합니다.</p>
                </div>
                <label className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>파일 선택</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJsonFile}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Reset */}
              <div className="p-4 rounded-xl bg-red-50/60 border border-red-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-red-900">초기 샘플 데이터로 복원</h4>
                  <p className="text-[11px] text-red-700">모든 수정 사항을 지우고 최초 제공된 푸드홈 샘플 데이터로 되돌립니다.</p>
                </div>
                <button
                  onClick={resetToDefaults}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>기본값 복원</span>
                </button>
              </div>
            </div>
          )}

          </main>
        </div>
      </div>

      {/* PRODUCT ADD/EDIT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingProductId ? '제품 정보 수정' : '새로운 제품 추가'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">제품명 *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="예: 프리미엄 남도식 보쌈무김치"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">카테고리</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  >
                    <option value="보쌈무김치">보쌈무김치</option>
                    <option value="김칫속/양념">김칫속/양념</option>
                    <option value="업소용 대용량">업소용 대용량</option>
                    <option value="소포장/밀키트">소포장/밀키트</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">라벨 태그</label>
                  <input
                    type="text"
                    value={productForm.tag}
                    onChange={(e) => setProductForm({ ...productForm, tag: e.target.value })}
                    placeholder="예: BEST B2B 1위"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">서브 타이틀</label>
                <input
                  type="text"
                  value={productForm.subtitle}
                  onChange={(e) => setProductForm({ ...productForm, subtitle: e.target.value })}
                  placeholder="예: 전국 족발·보쌈 프랜차이즈 납품 시그니처"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">포장 중량</label>
                  <input
                    type="text"
                    value={productForm.weight}
                    onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">보관 방법</label>
                  <input
                    type="text"
                    value={productForm.storage}
                    onChange={(e) => setProductForm({ ...productForm, storage: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">이미지 URL</label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">상세 설명</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">원재료 및 함량</label>
                <input
                  type="text"
                  value={productForm.ingredients}
                  onChange={(e) => setProductForm({ ...productForm, ingredients: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={productForm.isPopular}
                    onChange={(e) => setProductForm({ ...productForm, isPopular: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>인기 배지 표시</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  저장하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POST ADD/EDIT MODAL */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingPostId ? '게시글 수정' : '새 게시글 작성'}
              </h3>
              <button onClick={() => setIsPostModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePostSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">제목 *</label>
                <input
                  type="text"
                  required
                  value={postForm.title}
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                  placeholder="예: [레시피] 보쌈 전문점 사장님들의 황금 꿀조합"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">카테고리</label>
                  <select
                    value={postForm.category}
                    onChange={(e) => setPostForm({ ...postForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  >
                    <option value="공지사항">공지사항</option>
                    <option value="조리·활용 레시피">조리·활용 레시피</option>
                    <option value="B2B 납품스토리">B2B 납품스토리</option>
                    <option value="이벤트">이벤트</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">작성자</label>
                  <input
                    type="text"
                    value={postForm.author}
                    onChange={(e) => setPostForm({ ...postForm, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">썸네일 이미지 URL</label>
                <input
                  type="url"
                  value={postForm.thumbnail}
                  onChange={(e) => setPostForm({ ...postForm, thumbnail: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="예: 수육레시피, 족발맛집, 보쌈무"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">본문 내용 *</label>
                <textarea
                  rows={6}
                  required
                  value={postForm.content}
                  onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                  placeholder="게시글 본문 내용을 자유롭게 입력하세요..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={postForm.isPinned}
                    onChange={(e) => setPostForm({ ...postForm, isPinned: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <span>상단 추천 공지 고정</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-bold"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  게시하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
