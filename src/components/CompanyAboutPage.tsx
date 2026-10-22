import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Building2, 
  Award, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  ExternalLink,
  Clock,
  ArrowRight
} from 'lucide-react';
import { DynamicSectionRenderer } from './DynamicSectionRenderer';
import { getDefaultPageSections } from '../data/defaultPageSections';

interface CompanyAboutPageProps {
  targetTab?: 'intro' | 'system' | 'permits' | 'location';
}

export const CompanyAboutPage: React.FC<CompanyAboutPageProps> = ({ targetTab }) => {
  const { state, companyAboutTab, setCompanyAboutTab, setActivePage } = useApp();
  const { content } = state;

  const currentTab = targetTab || companyAboutTab || 'intro';

  const subpages = content.companySubpages || [];
  const getSubpage = (id: string) => subpages.find(s => s.id === id);

  const introSub = getSubpage('intro');
  const systemSub = getSubpage('system');
  const permitsSub = getSubpage('permits');
  const locationSub = getSubpage('location');

  const subpageMeta: Record<string, { bannerTitle: string; bannerDesc: string; breadcrumb: string }> = {
    intro: {
      bannerTitle: introSub?.title || '회사소개 & CEO 인사말',
      bannerDesc: introSub?.description || content.aboutDescription || '우리 가족이 먹을 수 있는 안전한 푸드를 제공하는 푸드홈 입니다.',
      breadcrumb: introSub?.menuLabel || 'CEO 인사말'
    },
    system: {
      bannerTitle: systemSub?.title || content.systemTitle || '생산 & 물류시스템',
      bannerDesc: systemSub?.description || content.systemDescription || '원료 입고부터 3단 마이크로 버블세척, 특허 절임, 0~5℃ 콜드체인 직배송까지',
      breadcrumb: systemSub?.menuLabel || '생산 & 물류시스템'
    },
    permits: {
      bannerTitle: permitsSub?.title || content.permitsTitle || '인허가사항 & 품질인증',
      bannerDesc: permitsSub?.description || content.permitsDescription || '식품제조가공업 영업등록 및 공인 안전 위생 시험성적서 적합 인증',
      breadcrumb: permitsSub?.menuLabel || '인허가사항'
    },
    location: {
      bannerTitle: locationSub?.title || '오시는 길 (본사 / 제조공장)',
      bannerDesc: locationSub?.description || `${content.factoryAddress || '충청북도 진천군 덕산읍 산수로 482'} 푸드홈 스마트팩토리`,
      breadcrumb: locationSub?.menuLabel || '오시는 길'
    }
  };

  const currentMeta = subpageMeta[currentTab] || subpageMeta.intro;

  const tabs = [
    { id: 'intro', label: introSub?.menuLabel || '회사소개 & CEO 인사말', icon: Building2, visible: introSub?.visible !== false },
    { id: 'system', label: systemSub?.menuLabel || '생산 & 물류시스템', icon: Truck, visible: systemSub?.visible !== false },
    { id: 'permits', label: permitsSub?.menuLabel || '인허가사항', icon: Award, visible: permitsSub?.visible !== false },
    { id: 'location', label: locationSub?.menuLabel || '오시는 길', icon: MapPin, visible: locationSub?.visible !== false },
  ].filter(t => t.visible);

  const handleTabClick = (tabId: string) => {
    setCompanyAboutTab(tabId);
    setActivePage('about-' + tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('주소가 클립보드에 복사되었습니다: ' + text);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-[#2A2020] animate-in fade-in duration-200">
      {/* Top Hero Banner with Glass Architecture Background (Image 6 style) */}
      <section className="relative h-[260px] sm:h-[320px] flex items-center justify-center overflow-hidden bg-slate-900">
        <img
          src={content.aboutBannerImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80"}
          alt="푸드홈 본사 전경"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1616] via-[#2A2020]/75 to-transparent" />

        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#872D35]/80 text-white text-xs font-bold mb-3 backdrop-blur-xs border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>FOOD HOME CORPORATE · {currentMeta.breadcrumb.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
            {currentMeta.bannerTitle}
          </h1>
          <p className="mt-3 text-xs sm:text-base text-stone-200 font-medium max-w-2xl mx-auto drop-shadow-sm">
            {currentMeta.bannerDesc}
          </p>
        </div>
      </section>

      {/* Breadcrumb & Navigation Sub-Tabs Bar */}
      <div className="sticky top-[78px] z-30 bg-white border-b border-stone-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                    isActive
                      ? 'border-[#872D35] text-[#872D35] bg-stone-50/70'
                      : 'border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#872D35]' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-stone-400">
            <span 
              onClick={() => setActivePage('home')}
              className="hover:text-stone-700 cursor-pointer"
            >
              홈
            </span>
            <span>›</span>
            <span 
              onClick={() => setActivePage('about-intro')}
              className="hover:text-stone-700 cursor-pointer"
            >
              회사소개
            </span>
            <span>›</span>
            <span className="font-bold text-[#872D35]">{currentMeta.breadcrumb}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* TAB 1: 회사소개 & CEO 인사말 */}
        {currentTab === 'intro' && (
          <DynamicSectionRenderer
            sections={content.pageSections?.['about-intro'] || content.pageSections?.['intro'] || []}
            fallbackSections={getDefaultPageSections('about-intro', content)}
          />
        )}

        {/* TAB 2: 생산 & 물류시스템 */}
        {currentTab === 'system' && (
          <DynamicSectionRenderer
            sections={content.pageSections?.['about-system'] || content.pageSections?.['system'] || []}
            fallbackSections={getDefaultPageSections('about-system', content)}
          />
        )}

        {/* TAB 3: 인허가사항 */}
        {currentTab === 'permits' && (
          <DynamicSectionRenderer
            sections={content.pageSections?.['about-permits'] || content.pageSections?.['permits'] || []}
            fallbackSections={getDefaultPageSections('about-permits', content)}
          />
        )}

        {/* TAB 4: 오시는 길 */}
        {currentTab === 'location' && (
          <DynamicSectionRenderer
            sections={content.pageSections?.['about-location'] || content.pageSections?.['location'] || []}
            fallbackSections={getDefaultPageSections('about-location', content)}
          />
        )}

      </div>
    </div>
  );
};
