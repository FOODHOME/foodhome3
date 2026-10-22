import React, { useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Sparkles, Eye, Package, ArrowRight } from 'lucide-react';

import { MainSectionConfig } from '../types';

export const ProductSliderSection: React.FC<{ config?: MainSectionConfig }> = ({ config }) => {
  const { 
    state, 
    setSelectedProductForDetail, 
    navigateToProductDetail,
    setActivePage 
  } = useApp();

  const cfg = config || state.content.mainSections?.find(s => s.id === 'productSlider');
  const sliderRef = useRef<HTMLDivElement>(null);
  const products = state.products.filter(p => p.visible !== false);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 340;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="product-slider-section" className="relative py-12 bg-[#FAF8F5] border-b border-[#E8E2DC]">
      <span id="products-section" className="absolute -top-24" />
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header with Left Title and Right Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#872D35]" />
              <span className="text-xs font-bold text-[#872D35] uppercase tracking-wider">
                {cfg?.badge || 'SIGNATURE PRODUCT SLIDER'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2A2020] tracking-tight">
              {cfg?.title || '푸드홈 대표 제품 둘러보기'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {cfg?.description || '30년 전통 비법과 특허 수분제어 공법으로 빚어낸 명품 보쌈무김치 & 비법 김칫속'}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-lg bg-white border border-[#E8E2DC] text-[#332525] hover:bg-[#872D35] hover:text-white hover:border-[#872D35] transition-all flex items-center justify-center shadow-2xs cursor-pointer"
              aria-label="이전 제품 보기"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-lg bg-white border border-[#E8E2DC] text-[#332525] hover:bg-[#872D35] hover:text-white hover:border-[#872D35] transition-all flex items-center justify-center shadow-2xs cursor-pointer"
              aria-label="다음 제품 보기"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={scrollToCatalog}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-[#872D35] bg-white border border-[#872D35]/30 hover:bg-[#872D35] hover:text-white transition-all ml-2"
            >
              <span>전체 목록</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Horizontal Slider Track */}
        <div
          ref={sliderRef}
          className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="shrink-0 w-[280px] sm:w-[310px] bg-white rounded-xl border border-[#E8E2DC] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 snap-start flex flex-col justify-between group"
            >
              {/* Product Image */}
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
                
                {/* Category & Tag Overlay */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#872D35] text-white shadow-2xs">
                    {product.tag || product.category}
                  </span>
                </div>

                {product.isPopular && (
                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-[#332525]/90 text-amber-300 backdrop-blur-xs">
                      인기상품
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                    <span>{product.category}</span>
                    <span>·</span>
                    <span>{product.weight}</span>
                  </div>

                  <h3 
                    onClick={() => navigateToProductDetail(product.id)}
                    className="text-base font-bold text-[#2A2020] group-hover:text-[#872D35] transition-colors line-clamp-1 cursor-pointer"
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed font-normal">
                    {product.subtitle || product.description}
                  </p>
                </div>

                {/* Storage & Shelf life pill */}
                <div className="mt-4 pt-3 border-t border-[#F0EBE6] flex items-center justify-between text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-[#872D35]" />
                    <span>{product.storage}</span>
                  </span>
                  <span className="text-slate-500 font-medium">{product.shelfLife}</span>
                </div>

                {/* Card CTA Actions */}
                <div className="mt-3.5 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigateToProductDetail(product.id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-lg border border-[#E8E2DC] text-[#332525] bg-stone-50 hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>상세보기</span>
                  </button>

                  <button
                    onClick={() => {
                      setActivePage('sample-board-write');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold rounded-lg text-white bg-[#872D35] hover:bg-[#6D242B] transition-colors shadow-2xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>샘플신청</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
