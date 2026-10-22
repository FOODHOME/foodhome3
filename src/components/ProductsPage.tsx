import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductItem } from '../types';
import { 
  Package, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  SlidersHorizontal,
  Layers,
  Flame,
  Award
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { state, navigateToProductDetail, setActivePage, setIsWholesaleModalOpen } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = React.useMemo(() => {
    if (state.content.productCategoriesList && state.content.productCategoriesList.length > 0) {
      const activeCats = state.content.productCategoriesList
        .filter(c => c.visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(c => c.name);
      return ['전체', ...activeCats.filter(name => name !== '전체')];
    }
    return [
      '전체',
      '보쌈무김치',
      '비빔김치소스',
      '업소용 대용량(10kg)',
      '소포장 & 밀키트'
    ];
  }, [state.content.productCategoriesList]);

  const filteredProducts = state.products.filter(product => {
    if (product.visible === false) return false;

    const matchesCategory = 
      selectedCategory === '전체' ||
      product.category === selectedCategory ||
      (product.categories && product.categories.includes(selectedCategory)) ||
      (selectedCategory.includes('보쌈무') && product.category.includes('보쌈무')) ||
      (selectedCategory.includes('비빔') && (product.category.includes('김칫속') || product.name.includes('김칫속') || product.category.includes('양념'))) ||
      (selectedCategory.includes('10kg') && (product.weight?.includes('10kg') || product.name?.includes('대용량') || product.category.includes('대용량'))) ||
      (selectedCategory.includes('소포장') && (product.weight?.includes('500g') || product.name?.includes('소포장') || product.category.includes('소포장') || product.category.includes('밀키트')));

    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.ingredients.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-50 text-[#2A2020] animate-in fade-in duration-200">
      {/* Top Banner */}
      <section className="relative h-[260px] sm:h-[320px] flex items-center justify-center overflow-hidden bg-slate-900">
        <img
          src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1920&q=80"
          alt="푸드홈 제품 전경"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1616] via-[#2A2020]/80 to-transparent" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#872D35]/80 text-white text-xs font-bold mb-3 backdrop-blur-xs border border-white/20">
            <Package className="w-3.5 h-3.5 text-amber-300" />
            <span>FOOD HOME PRODUCTS CATALOG</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            FOOD HOME 제품소개
          </h1>
          <p className="mt-3 text-sm sm:text-lg text-stone-200 font-medium max-w-2xl mx-auto drop-shadow-sm">
            물 생김 없는 특허 수분제어와 30년 전통 비법 양념의 명품 보쌈김치 라인업
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        
        {/* Category Filters & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-stone-200 shadow-2xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#872D35] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제품명, 원재료 검색..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-none focus:border-[#872D35] bg-stone-50"
            />
          </div>
        </div>

        {/* Product Count Indicator */}
        <div className="flex items-center justify-between mb-6 px-1">
          <p className="text-xs sm:text-sm text-stone-500 font-medium">
            총 <span className="font-extrabold text-stone-900">{filteredProducts.length}</span>개의 제품이 준비되어 있습니다.
          </p>
          <span className="text-xs text-stone-400 font-bold">100% 국산 농산물 원료 사용</span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => navigateToProductDetail(product.id)}
              className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
            >
              {/* Product Image */}
              <div 
                className="relative h-60 overflow-hidden bg-stone-100 cursor-pointer" 
                onClick={() => navigateToProductDetail(product.id)}
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-full bg-[#872D35] text-white text-[11px] font-black shadow-xs">
                    {product.tag}
                  </span>
                  {product.isPopular && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold flex items-center gap-0.5 shadow-xs">
                      <Flame className="w-3 h-3" /> 인기
                    </span>
                  )}
                  {product.isRecommended && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center gap-0.5 shadow-xs">
                      <Award className="w-3 h-3" /> 추천
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold">
                  {product.weight}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-extrabold text-[#872D35] uppercase tracking-wider block mb-1">
                    {product.category}
                  </span>
                  <h3 
                    onClick={() => navigateToProductDetail(product.id)}
                    className="font-black text-lg sm:text-xl text-stone-900 group-hover:text-[#872D35] transition-colors cursor-pointer leading-snug mb-1"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-stone-500 mb-4 line-clamp-1">{product.subtitle}</p>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
                    {product.description}
                  </p>

                  {/* Quick Specs Pill */}
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-1.5 text-xs text-stone-600 mb-4">
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-semibold">보관방법:</span>
                      <span className="font-bold text-stone-800">{product.storage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-semibold">소비기한:</span>
                      <span className="font-bold text-stone-800">{product.shelfLife}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-semibold">납품단가:</span>
                      <span className="font-bold text-[#872D35]">{product.bulkPriceGuide}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
                  <button
                    onClick={() => navigateToProductDetail(product.id)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-300 hover:border-[#872D35] text-stone-700 hover:text-[#872D35] hover:bg-stone-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    상세페이지 보기 →
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePage('sample-board-write');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#9E2A2B] text-white text-xs font-extrabold shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>샘플 신청</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wholesale Guide Banner */}
        <div className="mt-16 bg-[#2A2020] rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-extrabold text-[#E8B4B8] tracking-widest uppercase">B2B PARTNERSHIP</span>
            <h3 className="text-2xl sm:text-3xl font-black">
              프랜차이즈 및 대량 납품 맞춤형 OEM/PB 상담
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              매장별 맞춤 염도, 단맛 조절, 전용 라벨링 포장 및 전국 직송 물류 견적을 1:1 전담 매니저가 친절하게 상담해 드립니다.
            </p>
          </div>
          <button
            onClick={() => setIsWholesaleModalOpen(true)}
            className="shrink-0 px-8 py-4 rounded-2xl bg-[#872D35] hover:bg-[#9E2A2B] text-white font-black text-sm shadow-xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
          >
            <span>대량 납품 견적서 요청하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
