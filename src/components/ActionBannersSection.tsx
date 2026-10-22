import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Truck, Store, ArrowRight, ExternalLink, ShieldCheck, PhoneCall } from 'lucide-react';

export const ActionBannersSection: React.FC = () => {
  const { 
    setActivePage,
    state 
  } = useApp();

  const smartStoreUrl = state.social.smartStoreUrl || 'https://smartstore.naver.com/foodhome/products/4266908131';

  return (
    <section id="action-banners-section" className="py-8 bg-white border-b border-[#E8E2DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          
          {/* Banner 1: B2B Sample Request (Deep Burgundy) */}
          <div className="relative rounded-xl p-6 overflow-hidden bg-[#872D35] text-white flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow group">
            {/* Subtle decorative background glow */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none group-hover:scale-125 transition-transform duration-500" />
            
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-white/20 text-white">
                  B2B 사업자 전용
                </span>
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>

              <h3 className="text-lg lg:text-xl font-black tracking-tight leading-snug">
                무료 샘플 1kg 신청
              </h3>
              
              <p className="text-xs text-stone-200 mt-2 leading-relaxed font-normal">
                보쌈·족발 사장님을 위한 1kg 무료 테스팅팩! 택배비 전액 푸드홈 부담으로 매장까지 신선 배송해 드립니다.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between">
              <span className="text-[11px] text-stone-300 font-medium">배송비 0원 · 즉시 발송</span>
              <button
                onClick={() => {
                  setActivePage('sample-board-write');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#872D35] hover:bg-stone-100 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <span>신청하기</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Banner 2: Wholesale & OEM Supply (Dark Charcoal / Brown) */}
          <div className="relative rounded-xl p-6 overflow-hidden bg-[#332525] text-white flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow group">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none group-hover:scale-125 transition-transform duration-500" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-white/15 text-stone-200">
                  대량 납품 & 프랜차이즈
                </span>
                <Truck className="w-5 h-5 text-[#B64346]" />
              </div>

              <h3 className="text-lg lg:text-xl font-black tracking-tight leading-snug">
                B2B 정기 납품 & 맞춤 OEM
              </h3>
              
              <p className="text-xs text-stone-300 mt-2 leading-relaxed font-normal">
                월 300kg~5톤 안정적 정기 공급. 매장별 레시피 맞춤 제작 및 전국 콜드체인 물류망으로 매일 신선하게 공급합니다.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between">
              <span className="text-[11px] text-stone-300 font-medium">전국 직배송 · 맞춤 단가 협의</span>
              <button
                onClick={() => {
                  setActivePage('quote-board-write');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B64346] hover:bg-[#872D35] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <span>1:1 견적 상담</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Banner 3: Naver SmartStore Direct Mall (Warm Ivory / Linen) */}
          <div className="relative rounded-xl p-6 overflow-hidden bg-[#FAF8F5] border border-[#E8E2DC] text-[#2A2020] flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-[#872D35]/10 text-[#872D35]">
                  소량 구매 / 일반 소비자
                </span>
                <Store className="w-5 h-5 text-[#03C75A]" />
              </div>

              <h3 className="text-lg lg:text-xl font-black tracking-tight leading-snug text-[#2A2020]">
                네이버 공식 스마트스토어
              </h3>
              
              <p className="text-xs text-slate-600 mt-2 leading-relaxed font-normal">
                가정용 소포장 및 소규모 업장 테스트 구매! 네이버페이 간편결제와 신선 안심포장으로 평일 당일 출고됩니다.
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E8E2DC] flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium">네이버 공식인증 스토어</span>
              <a
                href={smartStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2A2020] hover:bg-[#872D35] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <span>스토어 방문</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
