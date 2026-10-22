import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ProductItem } from '../types';
import { 
  Sparkles, 
  Eye, 
  Check, 
  Package, 
  Thermometer, 
  Star,
  Settings,
  ExternalLink,
  Truck
} from 'lucide-react';

export const ProductSection: React.FC = () => {
  const { 
    state, 
    setSelectedProductForDetail, 
    navigateToProductDetail,
    setActivePage,
    setIsWholesaleModalOpen,
    setIsAdminOpen,
    setActiveAdminTab
  } = useApp();
  
  const [activeCategory, setActiveCategory] = useState<string>('전체보기');

  // Listen for category selection events from the 4-column categories section
  useEffect(() => {
    const handleCategorySelect = (e: any) => {
      if (e.detail) {
        setActiveCategory(e.detail);
      }
    };
    window.addEventListener('selectProductCategory', handleCategorySelect);
    return () => window.removeEventListener('selectProductCategory', handleCategorySelect);
  }, []);

  const categories = ['전체보기', '보쌈무김치', '김칫속/양념', '업소용 대용량', '소포장/밀키트'];

  const filteredProducts = activeCategory === '전체보기'
    ? state.products
    : state.products.filter(p => p.category === activeCategory);

  const smartStoreUrl = state.social.smartStoreUrl || 'https://smartstore.naver.com/foodhome/products/4266908131';
  const cfg = state.content.mainSections?.find(s => s.id === 'products');

  return (
    <section id="products-section" className="py-12 bg-white border-b border-[#E8E2DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#872D35]" />
              <span className="text-xs font-bold text-[#872D35] uppercase tracking-wider">
                {cfg?.badge || 'PRODUCT CATALOG'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2A2020] tracking-tight">
              {cfg?.title || '외식업소 맞춤형 명품 보쌈김치 & 비법 김칫속'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl font-normal">
              {cfg?.description || '물 생김 없이 끝까지 아삭한 보쌈무김치부터 굴보쌈·수육의 풍미를 극대화하는 감칠맛 비법 김칫속까지, 전국 480개 매장의 맛을 책임집니다.'}
            </p>
          </div>

          {/* Quick Admin Shortcut & Wholesale button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsWholesaleModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-[#FAF8F5] border border-[#E8E2DC] text-[#332525] hover:bg-[#872D35] hover:text-white hover:border-[#872D35] transition-all cursor-pointer shadow-2xs"
            >
              <Truck className="w-3.5 h-3.5 text-[#872D35]" />
              <span>대량납품 상담</span>
            </button>

            <button
              onClick={() => {
                setActiveAdminTab('all_content');
                setIsAdminOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-[#E8E2DC] bg-stone-50 text-slate-600 hover:bg-stone-100 transition-colors shadow-2xs cursor-pointer"
              title="관리자: 제품 편집 및 신규 등록"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>관리</span>
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#872D35] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-stone-700 hover:bg-stone-200 border border-[#E8E2DC]'
              }`}
            >
              {cat}
              {cat === '전체보기' && ` (${state.products.length})`}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className="bg-white rounded-xl border border-[#E8E2DC] overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
            >
              <div>
                {/* Image & Badges */}
                <div 
                  className="relative aspect-4/3 overflow-hidden bg-stone-100 cursor-pointer"
                  onClick={() => navigateToProductDetail(product.id)}
                >
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Category Tag */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#872D35] text-white shadow-2xs">
                      {product.tag || product.category}
                    </span>
                  </div>

                  {product.isPopular && (
                    <div className="absolute top-2.5 right-2.5">
                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-[#332525]/90 text-amber-300 backdrop-blur-xs">
                        추천
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                    <span>{product.category}</span>
                    <span>{product.weight}</span>
                  </div>

                  <h3 
                    onClick={() => setSelectedProductForDetail(product)}
                    className="text-base font-bold text-[#2A2020] group-hover:text-[#872D35] transition-colors cursor-pointer line-clamp-1"
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                    {product.subtitle}
                  </p>

                  {/* Specs Quick Summary */}
                  <div className="pt-2 text-[11px] text-slate-500 space-y-1 border-t border-[#F0EBE6]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">보관방법:</span>
                      <span className="font-medium text-slate-700">{product.storage}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">소비기한:</span>
                      <span className="font-medium text-slate-700">{product.shelfLife}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#F0EBE6]">
                  <button
                    onClick={() => navigateToProductDetail(product.id)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-[#E8E2DC] text-xs font-bold text-[#332525] bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>상세정보</span>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage('sample-board-write');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold text-white bg-[#872D35] hover:bg-[#6D242B] transition-colors shadow-2xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>샘플신청</span>
                  </button>
                </div>

                {/* Bulk Price Notice */}
                <div className="mt-2.5 text-center">
                  <span className="text-[10px] text-slate-500">
                    사업자 전용 단가 협의 가능 · 무료 샘플 1kg 지원
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom B2B Callout Strip */}
        <div className="mt-10 rounded-xl p-5 bg-[#FAF8F5] border border-[#E8E2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#2A2020] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#872D35]" />
              외식 프랜차이즈 전용 규격 포장 및 전용 레시피(OEM) 개발
            </h4>
            <p className="text-xs text-slate-600">
              브랜드만의 특별한 매운맛 강도, 규격 포장지 인쇄(PB), 정기 콜드체인 직배송까지 한 번에 상담받으세요.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsWholesaleModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              B2B 맞춤 견적 문의
            </button>
            <a
              href={smartStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-lg border border-[#E8E2DC] bg-white text-slate-700 hover:text-[#872D35] text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <span>스마트스토어</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
