import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductItem } from '../types';
import { DynamicSectionRenderer } from './DynamicSectionRenderer';
import { getDefaultProductSections } from '../data/defaultPageSections';
import { 
  Package, 
  Sparkles, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowLeft, 
  FileSpreadsheet, 
  Clock, 
  Thermometer, 
  Store, 
  Share2, 
  Check, 
  Flame, 
  Award,
  Phone,
  ChevronRight,
  Info,
  Layers
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { 
    state, 
    selectedProductId, 
    navigateToProductDetail, 
    setActivePage, 
    setIsSampleModalOpen, 
    setIsWholesaleModalOpen,
    showToast 
  } = useApp();

  const product = state.products.find(p => p.id === selectedProductId) || state.products[0];

  // Gallery image selector
  const allImages = React.useMemo(() => {
    if (!product) return [];
    const imgs = [product.imageUrl];
    if (product.detailImageUrl && !imgs.includes(product.detailImageUrl)) {
      imgs.push(product.detailImageUrl);
    }
    if (product.detailImages && product.detailImages.length > 0) {
      product.detailImages.forEach(img => {
        if (img && !imgs.includes(img)) imgs.push(img);
      });
    }
    return imgs;
  }, [product]);

  const [activeImage, setActiveImage] = useState<string>(product?.imageUrl || '');

  useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product?.id]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-stone-50">
        <Package className="w-16 h-16 text-stone-300 mb-4 animate-bounce" />
        <h2 className="text-xl font-black text-stone-800">제품을 찾을 수 없습니다.</h2>
        <p className="text-xs text-stone-500 mt-1 mb-6">등록된 제품이 없거나 삭제되었을 수 있습니다.</p>
        <button
          onClick={() => setActivePage('products')}
          className="px-5 py-2.5 rounded-xl bg-[#872D35] text-white text-xs font-bold hover:bg-[#6D242B] transition-colors cursor-pointer"
        >
          전체 제품 목록으로 돌아가기
        </button>
      </div>
    );
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('제품 상세페이지 링크가 클립보드에 복사되었습니다.');
    }
  };

  const handleRequestSample = () => {
    setActivePage('sample-board-write');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestQuote = () => {
    setActivePage('quote-board-write');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Other products for quick navigation (same category first)
  const otherProducts = state.products.filter(p => p.id !== product.id && p.visible !== false);

  return (
    <div className="min-h-screen bg-stone-50 text-[#2A2020] animate-in fade-in duration-200 pb-20">
      
      {/* 1. Header Banner & Breadcrumb */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-stone-500">
            <button
              onClick={() => setActivePage('home')}
              className="hover:text-stone-900 transition-colors cursor-pointer"
            >
              홈
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <button
              onClick={() => setActivePage('products')}
              className="hover:text-stone-900 transition-colors cursor-pointer font-semibold"
            >
              제품소개
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="px-2 py-0.5 rounded bg-stone-100 font-bold text-stone-700">
              {product.category}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-extrabold text-[#872D35] truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </nav>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="이 제품 링크 복사"
            >
              <Share2 className="w-3.5 h-3.5 text-stone-500" />
              <span>공유하기</span>
            </button>
            <button
              onClick={() => setActivePage('products')}
              className="px-3.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-stone-600" />
              <span>전체 목록</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Product Showcase Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left: Product Images Gallery */}
            <div className="lg:col-span-6 space-y-4">
              
              {/* Main Image Frame */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-xs group">
                <img
                  src={activeImage || product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#872D35] text-white text-xs font-black shadow-md">
                    {product.tag || 'B2B 대표'}
                  </span>
                  {product.isPopular && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-black flex items-center gap-1 shadow-md">
                      <Flame className="w-3.5 h-3.5" /> 인기 납품
                    </span>
                  )}
                  {product.isRecommended && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-black flex items-center gap-1 shadow-md">
                      <Award className="w-3.5 h-3.5" /> 추천 상품
                    </span>
                  )}
                </div>

                {/* Weight Chip */}
                <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-xs text-white text-xs font-extrabold tracking-wide shadow-md">
                  규격: {product.weight}
                </div>
              </div>

              {/* Thumbnail Gallery (if multiple images exist) */}
              {allImages.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                        activeImage === img
                          ? 'border-[#872D35] ring-2 ring-[#872D35]/30'
                          : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* 4 Feature Badges Under Image */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2DC] text-center">
                  <Sparkles className="w-4 h-4 text-[#872D35] mx-auto mb-1" />
                  <span className="text-[11px] font-black text-stone-800 block">특허 수분제어</span>
                  <span className="text-[10px] text-stone-500">물 생김 제로</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2DC] text-center">
                  <CheckCircle2 className="w-4 h-4 text-[#872D35] mx-auto mb-1" />
                  <span className="text-[11px] font-black text-stone-800 block">100% 국산 농산물</span>
                  <span className="text-[10px] text-stone-500">산지 계약재배</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2DC] text-center">
                  <ShieldCheck className="w-4 h-4 text-[#872D35] mx-auto mb-1" />
                  <span className="text-[11px] font-black text-stone-800 block">위생 안심 공정</span>
                  <span className="text-[10px] text-stone-500">HACCP 스마트팩토리</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2DC] text-center">
                  <Truck className="w-4 h-4 text-[#872D35] mx-auto mb-1" />
                  <span className="text-[11px] font-black text-stone-800 block">전국 콜드체인</span>
                  <span className="text-[10px] text-stone-500">0~5℃ 익일 직배송</span>
                </div>
              </div>

            </div>

            {/* Right: Product Specifications & B2B Inquiry Actions */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              
              <div>
                {/* Category & Code */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-black text-[#872D35] uppercase tracking-wider bg-[#872D35]/10 px-2.5 py-1 rounded-md">
                    {product.category}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-stone-400">
                    ITEM CODE: {product.id.toUpperCase()}
                  </span>
                </div>

                {/* Product Name */}
                <h1 className="text-2xl sm:text-3xl font-black text-stone-900 leading-tight">
                  {product.name}
                </h1>

                {/* Subtitle / Catchphrase */}
                <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1.5 pb-4 border-b border-stone-100">
                  {product.subtitle || '30년 전통 비법과 특허 수분제어 공법으로 빚어낸 명품 보쌈김치'}
                </p>

                {/* B2B Wholesale Price Box */}
                <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#FAF8F5] to-stone-100 border border-[#E8E2DC] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#872D35] flex items-center gap-1.5">
                      <Store className="w-4 h-4" />
                      <span>외식업 사업자 전용 도매 납품가</span>
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-[#872D35] text-white font-black">
                      B2B 특가 지원
                    </span>
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-black text-stone-900">
                      1:1 맞춤 견적 단가 적용
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      (월 발주량에 따른 계단식 할인)
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed font-medium pt-1">
                    {product.bulkPriceGuide || '외식업 대표님 및 프랜차이즈 본사 고객님께는 매장 규모 및 월간 소진량에 맞춘 최저 도매 단가를 산정하여 드립니다.'}
                  </p>
                </div>

                {/* Specs List Table */}
                <div className="mt-5 space-y-2.5 text-xs text-stone-700 border-t border-stone-100 pt-4">
                  <div className="flex items-start py-1 border-b border-stone-100">
                    <span className="w-28 font-bold text-stone-500 shrink-0">공급 규격 / 용량</span>
                    <span className="font-extrabold text-stone-900">{product.weight}</span>
                  </div>

                  <div className="flex items-start py-1 border-b border-stone-100">
                    <span className="w-28 font-bold text-stone-500 shrink-0">포장 형태</span>
                    <span className="font-semibold text-stone-800">
                      {product.packagingType || '식품 전용 위생 2중 안심실링 진공팩'}
                    </span>
                  </div>

                  <div className="flex items-start py-1 border-b border-stone-100">
                    <span className="w-28 font-bold text-stone-500 shrink-0">보관 방법</span>
                    <span className="font-semibold text-stone-800 flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-[#872D35]" />
                      <span>{product.storage}</span>
                    </span>
                  </div>

                  <div className="flex items-start py-1 border-b border-stone-100">
                    <span className="w-28 font-bold text-stone-500 shrink-0">소비 기한</span>
                    <span className="font-semibold text-stone-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-500" />
                      <span>{product.shelfLife}</span>
                    </span>
                  </div>

                  <div className="flex items-start py-1 border-b border-stone-100">
                    <span className="w-28 font-bold text-stone-500 shrink-0">주요 원재료</span>
                    <span className="text-stone-700 leading-relaxed">{product.ingredients}</span>
                  </div>

                  <div className="flex items-start py-1 border-b border-stone-100">
                    <span className="w-28 font-bold text-stone-500 shrink-0">원산지 정보</span>
                    <span className="font-semibold text-stone-800">
                      {product.origin || '무(국내산 100%), 고춧가루(국내산), 천일염(국내산 신안 천일염)'}
                    </span>
                  </div>

                  <div className="flex items-start py-1">
                    <span className="w-28 font-bold text-stone-500 shrink-0">배송 및 공급</span>
                    <span className="font-semibold text-stone-800">
                      {product.deliveryInfo || '주문 확인 후 24시간 이내 당일 생산 / 콜드체인 익일 직배송'}
                    </span>
                  </div>
                </div>
              </div>

              {/* B2B Call-To-Action Action Buttons */}
              <div className="space-y-2.5 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Primary CTA: Free Sample 1kg */}
                  <button
                    onClick={handleRequestSample}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>사업자 1kg 무료 샘플 신청</span>
                  </button>

                  {/* Secondary CTA: Wholesale Quote Consultation */}
                  <button
                    onClick={handleRequestQuote}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#2A2020] hover:bg-black text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>대량 납품 견적서 요청</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>사업자등록증 소지 외식업 대표님께는 택배비까지 전액 무료로 샘플을 발송합니다.</span>
                  </div>
                  <a
                    href="tel:043-532-8890"
                    className="font-bold text-[#872D35] flex items-center gap-1 shrink-0 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>043-532-8890</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Modular Content Sections (Universal Dynamic Blocks) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <DynamicSectionRenderer 
          sections={product.customSections || []} 
          fallbackSections={getDefaultProductSections(product)} 
        />
      </div>


      {/* 4. Other Products Quick Selection Carousel */}
      {otherProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-black text-stone-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-[#872D35]" />
              <span>함께 살펴보면 좋은 푸드홈 대표 제품</span>
            </h3>
            <button
              onClick={() => setActivePage('products')}
              className="text-xs font-bold text-[#872D35] hover:underline"
            >
              전체 보기 →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherProducts.slice(0, 4).map((p) => (
              <div
                key={p.id}
                onClick={() => navigateToProductDetail(p.id)}
                className="bg-white rounded-2xl p-4 border border-stone-200 hover:border-[#872D35] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-stone-100 mb-3">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#872D35] text-white text-[10px] font-black">
                      {p.category}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-stone-900 group-hover:text-[#872D35] transition-colors line-clamp-1">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{p.subtitle}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-stone-400 font-bold">{p.weight}</span>
                  <span className="font-bold text-[#872D35] flex items-center gap-0.5">
                    상세보기 ›
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
