/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductSliderSection } from './components/ProductSliderSection';
import { RealtimeSampleStatusSection } from './components/RealtimeSampleStatusSection';
import { ActionBannersSection } from './components/ActionBannersSection';
import { ProductCategoriesSection } from './components/ProductCategoriesSection';
import { ProductSection } from './components/ProductSection';
import { StorySection } from './components/StorySection';
import { ManufacturingProcess } from './components/ManufacturingProcess';
import { PartnersAndReviews } from './components/PartnersAndReviews';
import { BlogNoticeSection } from './components/BlogNoticeSection';
import { SampleInquirySection } from './components/SampleInquirySection';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PostDetailModal } from './components/PostDetailModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CompanyAboutPage } from './components/CompanyAboutPage';
import { ProductsPage } from './components/ProductsPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { SampleBoardPage } from './components/SampleBoardPage';
import { QuoteBoardPage } from './components/QuoteBoardPage';
import { NoticeBoardPage } from './components/NoticeBoardPage';
import { FaqBoardPage } from './components/FaqBoardPage';
import { Toast } from './components/Toast';
import { Sparkles, ArrowUp } from 'lucide-react';

const MainContent: React.FC = () => {
  const { 
    state, 
    activePage, 
    setActivePage,
    isAdminOpen, 
    setIsAdminOpen, 
    isAdminLoggedIn
  } = useApp();
  const { theme } = state;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Dynamically render main sections based on admin saved order and visibility
  const mainSectionsList = React.useMemo(() => {
    if (state.content.mainSections && state.content.mainSections.length > 0) {
      return [...state.content.mainSections].sort((a, b) => (a.order || 0) - (b.order || 0));
    }
    return [
      { id: 'hero', visible: theme.sectionsVisible?.hero !== false },
      { id: 'productSlider', visible: theme.sectionsVisible?.productSlider !== false },
      { id: 'sampleRealtimeStatus', visible: true },
      { id: 'actionBanners', visible: theme.sectionsVisible?.actionBanners !== false },
      { id: 'productCategories', visible: theme.sectionsVisible?.productCategories !== false },
      { id: 'products', visible: theme.sectionsVisible?.products !== false },
      { id: 'features', visible: theme.sectionsVisible?.features !== false },
      { id: 'process', visible: theme.sectionsVisible?.process !== false },
      { id: 'reviews', visible: theme.sectionsVisible?.reviews !== false },
      { id: 'posts', visible: theme.sectionsVisible?.posts !== false },
      { id: 'inquiry', visible: theme.sectionsVisible?.inquiry !== false }
    ];
  }, [state.content.mainSections, theme.sectionsVisible]);

  const renderSectionById = (id: string) => {
    switch (id) {
      case 'hero':
        return <HeroSection key="hero" />;
      case 'productSlider':
        return <ProductSliderSection key="productSlider" />;
      case 'sampleRealtimeStatus':
        return <RealtimeSampleStatusSection key="sampleRealtimeStatus" />;
      case 'actionBanners':
        return <ActionBannersSection key="actionBanners" />;
      case 'productCategories':
        return <ProductCategoriesSection key="productCategories" />;
      case 'products':
        return <ProductSection key="products" />;
      case 'features':
        return <StorySection key="features" />;
      case 'process':
        return <ManufacturingProcess key="process" />;
      case 'reviews':
        return <PartnersAndReviews key="reviews" />;
      case 'posts':
        return <BlogNoticeSection key="posts" />;
      case 'inquiry':
        return <SampleInquirySection key="inquiry" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#2A2020]">
      {/* Global Header */}
      <Header />

      {/* Main Sections or Dedicated Subpages */}
      <main className="flex-1">
        {activePage === 'about' && <CompanyAboutPage targetTab="intro" />}
        {activePage === 'about-intro' && <CompanyAboutPage targetTab="intro" />}
        {activePage === 'about-system' && <CompanyAboutPage targetTab="system" />}
        {activePage === 'about-permits' && <CompanyAboutPage targetTab="permits" />}
        {activePage === 'about-location' && <CompanyAboutPage targetTab="location" />}
        {activePage === 'products' && <ProductsPage />}
        {(activePage === 'product-detail' || activePage?.startsWith('product:')) && <ProductDetailPage />}
        {activePage === 'sample-board' && <SampleBoardPage initialViewMode="list" />}
        {activePage === 'sample-board-write' && <SampleBoardPage initialViewMode="write" />}
        {activePage === 'quote-board' && <QuoteBoardPage initialViewMode="list" />}
        {activePage === 'quote-board-write' && <QuoteBoardPage initialViewMode="write" />}
        {activePage === 'notice-board' && <NoticeBoardPage />}
        {activePage === 'faq-board' && <FaqBoardPage />}
        {activePage === 'posts' && <BlogNoticeSection />}
        
        {/* Home Page Flow: Dynamic order and visibility configured via Admin MainSectionsManager */}
        {(activePage === 'home' || !activePage) && (
          <>
            {mainSectionsList
              .filter(sec => sec.visible !== false)
              .map(sec => renderSectionById(sec.id))}
          </>
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Modals & Overlays */}
      <ProductDetailModal />
      <PostDetailModal />

      {/* Admin Auth Modal or Dashboard (Accessible ONLY via Footer Button) */}
      {isAdminOpen && (
        isAdminLoggedIn ? (
          <AdminDashboard />
        ) : (
          <AdminLoginModal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
        )
      )}

      <Toast />

      {/* Floating Scroll to Top & Quick Sample CTA (Bottom Right) */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2">
        <button
          onClick={() => {
            setActivePage('sample-board-write');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-xs font-extrabold shadow-xl hover:opacity-95 transition-all hover:scale-105 cursor-pointer"
          style={{ backgroundColor: state.theme.primaryColor || '#872D35' }}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>무료 샘플 1kg 신청</span>
        </button>

        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-white border border-[#E8E2DC] text-[#332525] hover:text-[#872D35] hover:bg-stone-50 flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
          aria-label="맨 위로 가기"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
