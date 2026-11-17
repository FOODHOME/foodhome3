import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Star, 
  Quote, 
  BadgeCheck 
} from 'lucide-react';

import { MainSectionConfig } from '../types';

export const PartnersAndReviews: React.FC<{ config?: MainSectionConfig }> = ({ config }) => {
  const { state } = useApp();
  const cfg = config || state.content.mainSections?.find(s => s.id === 'reviews');
  const resolvedTitle =
    cfg?.title && cfg.title !== '전국 480여 개 외식 파트너의 생생한 찬사'
      ? cfg.title
      : '전국 프랜차이즈 및 외식업체 대표님들의 후기';

  return (
    <section id="review-section" className="py-12 bg-white border-b border-[#E8E2DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8E2DC] text-[11px] font-bold text-[#872D35]">
            <span>{cfg?.badge || 'PARTNER TESTIMONIALS'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2A2020] tracking-tight">
            {resolvedTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            {cfg?.description || '손님들의 재방문을 부르고 주방 인건비와 음식물 손실을 획기적으로 줄인 실제 사장님들의 솔직한 평가입니다.'}
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#FAF8F5] p-5 rounded-xl border border-[#E8E2DC] flex flex-col justify-between hover:border-[#872D35] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">{rev.date}</span>
                </div>

                <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-normal mb-3">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#E8E2DC] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-[#2A2020] mr-2">{rev.clientName || rev.storeName}</span>
                  <span className="text-slate-500 text-[11px]">{rev.businessType || rev.ownerName}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#872D35] font-semibold">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>{rev.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
