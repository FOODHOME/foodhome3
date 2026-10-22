import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play, 
  Sparkles, 
  ArrowRight, 
  Package, 
  FileSpreadsheet,
  ShieldCheck,
  Truck
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { 
    state, 
    setIsSampleModalOpen, 
    setIsWholesaleModalOpen,
    setActivePage 
  } = useApp();

  const banners = state.content.banners && state.content.banners.length > 0 
    ? state.content.banners 
    : [
        {
          id: 'banner-1',
          tagline: 'SINCE 1996 · 30년 전통 비법',
          title: '보쌈의 맛을 완성하는 특별한 김치',
          subtitle: '푸드홈 보쌈무김치',
          description: '정성스럽게 만든 맛, 변함없는 품질. 물 생김 없이 끝까지 아삭한 특허 수분제어 절임 공법으로 전국 480여 개 외식 매장에 매일 아침 공급합니다.',
          imageUrl: './images/banner_bossam.jpg',
          primaryButtonText: '제품 자세히 보기',
          primaryButtonAction: 'products' as const,
          secondaryButtonText: '납품 문의하기',
          secondaryButtonAction: 'inquiry' as const
        }
      ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto slide effect
  useEffect(() => {
    if (!isPlaying || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPlaying, banners.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleButtonClick = (action: string) => {
    if (action === 'products') {
      setActivePage('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'sample') {
      setActivePage('sample-board-write');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'quote' || action === 'inquiry' || action === 'wholesale') {
      setActivePage('quote-board-write');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActivePage('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const current = banners[currentIndex] || banners[0];

  return (
    <section className="relative w-full bg-[#1A1212] overflow-hidden select-none">
      {/* Panoramic Banner Container (PC Height ~500px, Mobile ~400px) */}
      <div className="relative w-full h-[430px] sm:h-[480px] lg:h-[520px]">
        
        {/* Background Image with Smooth Crossfade */}
        {banners.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            <picture>
              {slide.mobileImageUrl && (
                <source media="(max-width: 640px)" srcSet={slide.mobileImageUrl} />
              )}
              <img
                src={slide.imageUrl}
                alt={slide.title}
                className="w-full h-full object-cover object-center transform scale-100 animate-in fade-in zoom-in-105 duration-1000"
              />
            </picture>
            {/* Natural Dark Vignette & Gradient for Sharp Text Contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          </div>
        ))}

        {/* Text & Action Layer */}
        <div className="relative z-20 max-w-7xl mx-auto h-full px-5 sm:px-8 flex flex-col justify-center">
          <div className="max-w-2xl space-y-4">
            
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[#E8B4B8] text-xs font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#B64346] animate-pulse" />
              <span>{current.tagline}</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1">
              <p className="text-lg sm:text-2xl font-bold text-[#FAF8F5] tracking-tight">
                {current.title}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                {current.subtitle}
              </h1>
            </div>

            {/* Clean Description */}
            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal max-w-xl">
              {current.description}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleButtonClick(current.primaryButtonAction || 'products')}
                className="px-6 py-3.5 rounded-xl font-bold text-white text-xs sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                style={{ backgroundColor: state.theme.primaryColor || '#872D35' }}
              >
                <span>{current.primaryButtonText || '제품 자세히 보기'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleButtonClick(current.secondaryButtonAction || 'quote')}
                className="px-5 py-3.5 rounded-xl font-bold text-[#FAF8F5] bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#E8B4B8]" />
                <span>{current.secondaryButtonText || '1:1 대량 납품 견적 상담'}</span>
              </button>
            </div>

            {/* SubDescription / Trust Mini Proof */}
            <div className="pt-2 flex items-center gap-3 text-[11px] text-slate-300 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {current.subDescription || '우리 가족 안심 위생시설 제조'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#B64346]" />
                전국 480+ 매장 당일 냉장 직배송
              </span>
            </div>

          </div>
        </div>

        {/* Carousel Controls (Bottom Right / Left) */}
        {banners.length > 1 && (
          <div className="absolute bottom-6 right-5 sm:right-8 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            {/* Prev Button */}
            <button
              onClick={handlePrev}
              className="p-1 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="이전 배너"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Counter / Dots */}
            <span className="text-[11px] font-bold text-white tracking-widest px-1">
              0{currentIndex + 1} / 0{banners.length}
            </span>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="p-1 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
              aria-label="다음 배너"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer ml-0.5 border-l border-white/20 pl-1.5"
              aria-label={isPlaying ? '자동 넘김 일시정지' : '자동 넘김 재생'}
              title={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
