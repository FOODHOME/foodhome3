import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Truck, 
  Leaf, 
  CheckCircle2
} from 'lucide-react';

import { MainSectionConfig } from '../types';

export const StorySection: React.FC<{ config?: MainSectionConfig }> = ({ config }) => {
  const { state } = useApp();
  const { content } = state;
  const cfg = config || state.content.mainSections?.find(s => s.id === 'features');

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-[#872D35]" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-[#872D35]" />;
      case 'Award':
        return <Award className="w-5 h-5 text-[#872D35]" />;
      case 'Truck':
        return <Truck className="w-5 h-5 text-[#872D35]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#872D35]" />;
    }
  };

  return (
    <section id="story-section" className="py-12 bg-white border-b border-[#E8E2DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8E2DC] text-[11px] font-bold text-[#872D35]">
            <span>{cfg?.badge || 'BRAND HERITAGE & PHILOSOPHY'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2A2020] tracking-tight">
            {cfg?.title || content.storyTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            {cfg?.description || cfg?.subtitle || content.storySubtitle}
          </p>
        </div>

        {/* Story Intro Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#FAF8F5] rounded-xl p-6 sm:p-8 border border-[#E8E2DC] mb-10">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#872D35]">
              <Leaf className="w-4 h-4" />
              <span>30년 김치 장인의 고집스러운 전통과 현대 위생과학의 만남</span>
            </div>
            
            <p className="text-stone-800 text-sm sm:text-base leading-relaxed font-normal">
              {content.storyParagraph1}
            </p>
            
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              {content.storyParagraph2}
            </p>

            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#332525]">
                <CheckCircle2 className="w-4 h-4 text-[#872D35] shrink-0" />
                <span>제주 월동무 & 강원 고랭지무 계약재배</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#332525]">
                <CheckCircle2 className="w-4 h-4 text-[#872D35] shrink-0" />
                <span>경북 영양 100% 태양초 고춧가루 사용</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#332525]">
                <CheckCircle2 className="w-4 h-4 text-[#872D35] shrink-0" />
                <span>충남 광천 토굴 숙성 새우젓 비법 블렌딩</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#332525]">
                <CheckCircle2 className="w-4 h-4 text-[#872D35] shrink-0" />
                <span>우리 가족 안심 먹거리 전용 생산라인</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative rounded-xl overflow-hidden aspect-4/3 shadow-sm border border-[#E8E2DC]">
              <img
                src="./images/banner_bossam.jpg"
                alt="푸드홈 김치 숙성 및 제조"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
                <div className="text-white">
                  <span className="text-[10px] font-bold text-amber-300 block">PATENTED TECHNOLOGY</span>
                  <p className="text-sm font-extrabold leading-snug">특허받은 수분제어 절임 공법</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Core Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.coreValues.map((val, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-[#E8E2DC] hover:border-[#872D35] transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#E8E2DC] flex items-center justify-center mb-3">
                {renderIcon(val.icon)}
              </div>
              <h3 className="text-sm font-extrabold text-[#2A2020] mb-1.5">
                {val.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {val.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
