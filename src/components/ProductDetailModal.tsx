import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Thermometer, 
  Layers, 
  Phone
} from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { 
    selectedProductForDetail, 
    setSelectedProductForDetail, 
    setActivePage,
    state 
  } = useApp();

  if (!selectedProductForDetail) return null;

  const product = selectedProductForDetail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E8E2DC]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#E8E2DC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#872D35] text-white">
              {product.category}
            </span>
            <span className="text-xs text-slate-500 font-medium">제품 상세 원재료 및 규격 안내</span>
          </div>
          <button
            onClick={() => setSelectedProductForDetail(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Top Hero Media & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            <div className="sm:col-span-5 rounded-xl overflow-hidden aspect-square bg-stone-100 border border-[#E8E2DC]">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="sm:col-span-7 space-y-2">
              <span className="text-xs font-bold text-[#872D35] block">
                {product.tag}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#2A2020] leading-snug">
                {product.name}
              </h3>
              <p className="text-sm font-medium text-slate-600">
                {product.subtitle}
              </p>
              
              <div className="pt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>우리 가족이 먹는 안심 위생시설 제조 / 무방부제·무화학색소</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E8E2DC] text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
            {product.description}
          </div>

          {/* Specifications Table */}
          <div className="border border-[#E8E2DC] rounded-xl overflow-hidden text-xs sm:text-sm">
            <div className="grid grid-cols-3 p-3 bg-[#FAF8F5] border-b border-[#E8E2DC] font-bold text-[#332525]">
              <span>규격 항목</span>
              <span className="col-span-2">상세 내역</span>
            </div>
            <div className="grid grid-cols-3 p-3 border-b border-[#F0EBE6] text-slate-600">
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#872D35]" />
                포장 중량
              </span>
              <span className="col-span-2 font-medium">{product.weight}</span>
            </div>
            <div className="grid grid-cols-3 p-3 border-b border-[#F0EBE6] text-slate-600">
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-[#872D35]" />
                보관 방법
              </span>
              <span className="col-span-2">{product.storage}</span>
            </div>
            <div className="grid grid-cols-3 p-3 border-b border-[#F0EBE6] text-slate-600">
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#872D35]" />
                유통 기한
              </span>
              <span className="col-span-2">{product.shelfLife}</span>
            </div>
            <div className="grid grid-cols-3 p-3 text-slate-600">
              <span className="font-semibold text-slate-800">원재료 및 함량</span>
              <span className="col-span-2 leading-relaxed">{product.ingredients}</span>
            </div>
          </div>

          {/* Bulk Price Guidance */}
          <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2DC] flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#872D35] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#2A2020]">외식업 B2B 사업자 납품 단가 안내</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {product.bulkPriceGuide}. 정기 발주 수량 및 배송 지역에 따라 단가표가 상이하므로 실시간 샘플 신청 또는 유선 상담({state.content.phone})을 통해 최적의 단가를 확인해 보세요.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-[#E8E2DC] p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <a
            href={`tel:${state.content.phone}`}
            className="text-xs font-bold text-[#332525] hover:text-[#872D35] flex items-center gap-1.5"
          >
            <Phone className="w-4 h-4 text-[#872D35]" />
            <span>유선 견적문의: {state.content.phone}</span>
          </a>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedProductForDetail(null)}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              닫기
            </button>
            <button
              onClick={() => {
                setSelectedProductForDetail(null);
                setActivePage('sample-board-write');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2 text-xs font-bold text-white rounded-lg shadow-2xs hover:bg-[#6D242B] transition-colors flex items-center gap-1.5 cursor-pointer bg-[#872D35]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>이 제품 무료 샘플 1kg 신청</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
