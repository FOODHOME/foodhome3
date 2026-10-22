import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  ChevronRight, 
  Clock, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  ArrowRight
} from 'lucide-react';

export const RealtimeSampleStatusSection: React.FC = () => {
  const { state, setActivePage } = useApp();
  const [lastRefreshed, setLastRefreshed] = useState<string>('방금 전');

  // Auto-refresh timer simulation / timestamp update every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLastRefreshed(`${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Get latest 5 sample inquiries
  const recentInquiries = (state.inquiries || []).slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '배송완료':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>배송완료</span>
          </span>
        );
      case '배송준비':
      case '샘플발송완료':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3 h-3 text-blue-600" />
            <span>배송준비</span>
          </span>
        );
      case '답변완료':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
            <CheckCircle2 className="w-3 h-3 text-purple-600" />
            <span>답변완료</span>
          </span>
        );
      case '접수대기':
      case '접수완료':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#872D35]/10 text-[#872D35] border border-[#872D35]/20">
            <Clock className="w-3 h-3 text-[#872D35]" />
            <span>접수완료</span>
          </span>
        );
    }
  };

  /**
   * Generates safe, sanitized titles without exposing any private contact information,
   * personal phone numbers, or private emails to ensure zero privacy leaks on main landing page.
   */
  const getSafeTitle = (inq: any, index: number) => {
    if (inq.title) {
      // Remove phone numbers or email patterns if accidentally present in title
      const sanitized = inq.title
        .replace(/\d{3}[-\s]?\d{3,4}[-\s]?\d{4}/g, '***-****')
        .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '****@****');
      return sanitized;
    }

    const region = inq.region ? inq.region.split(' ').slice(0, 2).join(' ') : '전국 외식업소';
    const store = inq.storeName || inq.companyName ? `${(inq.storeName || inq.companyName).slice(0, 2)}**` : '사업자';
    return `[${region}] ${store} 대표님 무료 샘플 1kg 신청`;
  };

  return (
    <section className="py-12 sm:py-16 bg-[#FAF8F5] border-y border-[#EEEAE6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#872D35]/10 border border-[#872D35]/20 text-[#872D35] text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-[#872D35] animate-ping" />
              <span>LIVE · 실시간 접수</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2A2020] tracking-tight">
              실시간 무료 샘플 신청 현황
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              전국 외식업소 대표님들의 사업자 1kg 무료 샘플팩 신청이 실시간으로 안전하게 접수되고 있습니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400 font-medium hidden sm:inline">
              자동 갱신: <strong className="font-mono text-stone-600">{lastRefreshed}</strong>
            </span>
            <button
              onClick={() => {
                setActivePage('sample-board');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white text-[#872D35] border border-[#872D35]/30 hover:bg-[#872D35] hover:text-white transition-all shadow-2xs hover:shadow-sm cursor-pointer"
            >
              <span>전체 신청 현황 보기</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Board Table / Card List */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#EEEAE6] overflow-hidden">
          
          {/* Table Header (Desktop) */}
          <div className="hidden sm:grid grid-cols-12 bg-stone-50/80 px-6 py-3.5 border-b border-[#EEEAE6] text-xs font-bold text-stone-600 tracking-wider">
            <div className="col-span-1 text-center">번호</div>
            <div className="col-span-2 text-center">접수상황</div>
            <div className="col-span-7">신청 제목 (개인정보 보호 비공개)</div>
            <div className="col-span-2 text-right">작성일</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#F2EFEA]">
            {recentInquiries.map((inq, idx) => {
              const safeTitle = getSafeTitle(inq, idx);
              const postNum = inq.postNumber || (recentInquiries.length - idx);
              return (
                <div
                  key={inq.id || idx}
                  onClick={() => {
                    setActivePage('sample-board');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="px-5 sm:px-6 py-4 flex flex-col sm:grid sm:grid-cols-12 items-start sm:items-center gap-2 sm:gap-0 hover:bg-[#FAF8F5]/80 transition-colors cursor-pointer group"
                >
                  {/* Number */}
                  <div className="sm:col-span-1 font-mono text-xs font-bold text-stone-400 sm:text-center">
                    #{postNum}
                  </div>

                  {/* Status Badge */}
                  <div className="sm:col-span-2 sm:text-center">
                    {getStatusBadge(inq.status)}
                  </div>

                  {/* Title & Secret Lock */}
                  <div className="sm:col-span-7 flex items-center gap-2 pr-2">
                    <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-stone-800 group-hover:text-[#872D35] transition-colors line-clamp-1">
                      {safeTitle}
                    </span>
                    <span className="hidden md:inline-flex text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-500 shrink-0">
                      비밀글
                    </span>
                  </div>

                  {/* Date */}
                  <div className="sm:col-span-2 font-mono text-xs text-stone-400 sm:text-right flex items-center justify-between sm:justify-end w-full sm:w-auto">
                    <span className="sm:hidden text-[11px] text-stone-400">신청일시:</span>
                    <span>{inq.createdAt || '2026.03.22'}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Banner inside the Card */}
          <div className="bg-gradient-to-r from-[#FAF8F5] via-white to-[#FAF8F5] p-5 border-t border-[#EEEAE6] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#872D35]/10 text-[#872D35] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-800">
                  개인정보는 암호화 보호되며 관리자 외에는 열람할 수 없습니다.
                </p>
                <p className="text-[11px] text-stone-500">
                  신청하신 고객님은 설정하신 비밀번호를 통해 작성글의 배송 현황과 관리자 답변을 확인하실 수 있습니다.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setActivePage('sample-board-write');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-5 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold shadow-sm hover:shadow transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>지금 무료 샘플 신청하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
