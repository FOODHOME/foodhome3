import React from 'react';
import { useApp } from '../context/AppContext';
import { FoodhomeLogo } from './FoodhomeLogo';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Printer, 
  Settings,
  ExternalLink,
  Sparkles,
  Truck
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { 
    state, 
    setIsAdminOpen, 
    setActivePage 
  } = useApp();
  const { content, social } = state;

  return (
    <footer id="footer-section" className="bg-[#221A1A] text-stone-300 pt-10 pb-8 border-t border-[#3D3131]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Top Grid: Brand & CS & Quick CTAs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-[#3D3131]">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-3">
            <FoodhomeLogo variant="light" height={36} />

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm font-normal">
              {content.tagline}. 대한민국 대표 보쌈무김치, 무김치, 명품 김칫속(보쌈속) 수제 제조 전문 기업 푸드홈입니다.
            </p>

            {/* Quick Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-stone-300">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                우리 가족 안심 먹거리
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/10">
                <Truck className="w-3.5 h-3.5 text-[#B64346]" />
                전국 콜드체인 익일 직배송
              </span>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {social.smartStoreUrl && (
                <a
                  href={social.smartStoreUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 text-xs rounded bg-[#03C75A]/20 text-[#03C75A] hover:bg-[#03C75A]/30 transition-colors font-bold flex items-center gap-1"
                >
                  <span>네이버 스마트스토어</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {social.naverBlogUrl && (
                <a
                  href={social.naverBlogUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 text-xs rounded bg-white/10 text-stone-200 hover:bg-white/20 transition-colors font-medium"
                >
                  네이버 블로그
                </a>
              )}
              {social.kakaoTalkUrl && (
                <a
                  href={social.kakaoTalkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 text-xs rounded bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 transition-colors font-medium"
                >
                  카카오톡 채널
                </a>
              )}
            </div>
          </div>

          {/* Customer Service Center */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[10px] font-bold text-[#B64346] uppercase tracking-wider block">CUSTOMER CENTER</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white tracking-tight">{content.phone}</span>
              <span className="text-xs text-stone-400 font-medium">(주문·납품문의)</span>
            </div>
            
            <div className="text-xs text-stone-400 space-y-1 pt-1 font-normal">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>운영시간: {content.csHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Printer className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>팩스: {content.fax}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                <span>이메일: {content.email}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-2">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">QUICK SERVICE</span>
            
            <div className="space-y-2">
              <button
                onClick={() => {
                  setActivePage('sample-board-write');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>사업자 무료 샘플 1kg 신청</span>
              </button>

              <button
                onClick={() => {
                  setActivePage('quote-board-write');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-bold transition-all cursor-pointer"
              >
                <Truck className="w-3.5 h-3.5 text-[#B64346]" />
                <span>1:1 대량 납품 견적 상담</span>
              </button>

              <button
                onClick={() => setIsAdminOpen(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-stone-700 text-stone-400 hover:text-white hover:border-stone-500 text-xs font-medium transition-all cursor-pointer"
                title="웹사이트 관리자모드"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>웹사이트 관리자모드</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Legal Business Registration Information */}
        <div className="pt-6 text-[11px] text-stone-400 leading-relaxed space-y-1">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><strong>상호</strong>: {content.companyName}</span>
            <span><strong>대표자</strong>: {content.ceoName}</span>
            <span><strong>사업자등록번호</strong>: {content.businessNumber}</span>
            <span><strong>통신판매업신고</strong>: {content.mailOrderNumber}</span>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span><strong>공장 및 연구소</strong>: {content.factoryAddress}</span>
            <span><strong>영업등록</strong>: {content.haccpNumber}</span>
          </div>

          <div className="pt-3 border-t border-[#3D3131] mt-3 flex flex-col sm:flex-row items-center justify-between text-stone-500 gap-2">
            <p>© 2026 {content.companyName} Co., Ltd. All Rights Reserved. 본 사이트의 콘텐츠 및 이미지 무단 전재 및 복제를 금합니다.</p>
            <p className="text-[10px]">Modern Korean Food Brand Website</p>
          </div>
        </div>

      </div>
    </footer>
  );
};
