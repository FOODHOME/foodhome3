import React from 'react';
import { CustomSectionItem } from '../types';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Truck, 
  Award, 
  Building2, 
  MapPin, 
  Package, 
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';

const ICON_MAP: Record<string, any> = {
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Truck,
  Award,
  Building2,
  MapPin,
  Package,
  Info
};

interface DynamicSectionRendererProps {
  sections: CustomSectionItem[];
  fallbackSections?: CustomSectionItem[];
}

export const DynamicSectionRenderer: React.FC<DynamicSectionRendererProps> = ({ 
  sections,
  fallbackSections 
}) => {
  const { setActivePage, setIsSampleModalOpen, setIsWholesaleModalOpen } = useApp();

  const activeSections = React.useMemo(() => {
    const list = (sections && sections.length > 0) ? sections : (fallbackSections || []);
    return [...list]
      .filter(s => s.visible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [sections, fallbackSections]);

  const handleAction = (action?: string, link?: string) => {
    if (!action && !link) return;
    if (action === 'sample') {
      setActivePage('sample-board-write');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'quote') {
      setActivePage('quote-board-write');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'products') {
      setActivePage('products');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (action === 'url' || (link && link.startsWith('http'))) {
      if (link) window.open(link, '_blank');
    } else if (link) {
      setActivePage(link);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getButtonStyling = (text?: string, link?: string, isSecondary = false) => {
    const lowerText = (text || '').toLowerCase();
    const lowerLink = (link || '').toLowerCase();

    const isNaver = lowerText.includes('네이버') || lowerLink.includes('naver.com');
    const isKakao = lowerText.includes('카카오') || lowerLink.includes('kakao.com');

    if (isNaver) {
      return {
        className: "px-5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all hover:brightness-95",
        style: { backgroundColor: '#03C75A', color: '#FFFFFF' }
      };
    }
    if (isKakao) {
      return {
        className: "px-5 py-2.5 rounded-xl text-stone-900 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-all hover:brightness-95",
        style: { backgroundColor: '#FEE500', color: '#000000' }
      };
    }

    if (isSecondary) {
      return {
        className: "px-5 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-bold cursor-pointer transition-colors",
        style: {}
      };
    }

    return {
      className: "px-5 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors",
      style: {}
    };
  };

  if (!activeSections || activeSections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-12">
      {activeSections.map((sec) => {
        switch (sec.type) {
          // 1. Heading Section
          case 'heading':
            return (
              <div key={sec.id} className="text-center max-w-3xl mx-auto py-4">
                {sec.badge && (
                  <span className="inline-block px-3 py-1 rounded-full bg-[#872D35]/10 text-[#872D35] text-xs font-black uppercase tracking-wider mb-2">
                    {sec.badge}
                  </span>
                )}
                {sec.title && (
                  <h2 className="text-2xl sm:text-3xl font-black text-stone-900 leading-snug whitespace-pre-line">
                    {sec.title}
                  </h2>
                )}
                {sec.subtitle && (
                  <p className="mt-2 text-sm text-stone-600 font-medium">
                    {sec.subtitle}
                  </p>
                )}
              </div>
            );

          // 2. Plain Text Section
          case 'text':
            return (
              <div key={sec.id} className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-4">
                {sec.title && (
                  <h3 className="text-xl font-black text-stone-900">
                    {sec.title}
                  </h3>
                )}
                <div className="text-stone-700 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-2">
                  {sec.content}
                </div>
              </div>
            );

          // 3. Single Image Section
          case 'image': {
            let sizeClass = 'w-full';
            if (sec.imageSize === 'small') sizeClass = 'max-w-md mx-auto';
            else if (sec.imageSize === 'medium') sizeClass = 'max-w-2xl mx-auto';
            else if (sec.imageSize === 'large') sizeClass = 'max-w-4xl mx-auto';

            return (
              <div key={sec.id} className={`${sizeClass} rounded-3xl overflow-hidden border border-stone-200 shadow-sm bg-white`}>
                {sec.imageUrl && (
                  <img src={sec.imageUrl} alt={sec.title || ''} className="w-full h-auto object-cover max-h-[580px]" />
                )}
                {(sec.title || sec.content) && (
                  <div className="p-4 sm:p-5 bg-white border-t border-stone-100 text-center">
                    {sec.title && <h4 className="font-bold text-stone-900 text-sm sm:text-base">{sec.title}</h4>}
                    {sec.content && <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed whitespace-pre-line">{sec.content}</p>}
                  </div>
                )}
              </div>
            );
          }

          // 4. Image + Text Section (with Left, Right, or Top layout)
          case 'image_text': {
            const isRight = sec.imagePosition === 'right';
            const isTop = sec.imagePosition === 'top';

            const primaryBtn = getButtonStyling(sec.buttonText, sec.buttonLink, false);
            const secondaryBtn = getButtonStyling(sec.secondaryButtonText, sec.secondaryButtonLink, true);

            if (isTop) {
              return (
                <div key={sec.id} className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm">
                  {sec.imageUrl && (
                    <div className="h-72 sm:h-96 w-full overflow-hidden bg-stone-100">
                      <img src={sec.imageUrl} alt={sec.title || ''} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 sm:p-10 space-y-4">
                    {sec.badge && (
                      <span className="inline-block px-3 py-1 rounded bg-[#872D35]/10 text-[#872D35] text-xs font-bold">
                        {sec.badge}
                      </span>
                    )}
                    {sec.title && (
                      <h3 className="text-2xl font-black text-stone-900 whitespace-pre-line">
                        {sec.title}
                      </h3>
                    )}
                    {sec.content && (
                      <div className="text-stone-600 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-3">
                        {sec.content}
                      </div>
                    )}
                    {(sec.buttonText || sec.secondaryButtonText) && (
                      <div className="flex flex-wrap gap-3 pt-3">
                        {sec.buttonText && (
                          <button
                            onClick={() => handleAction(sec.buttonAction, sec.buttonLink)}
                            className={primaryBtn.className}
                            style={primaryBtn.style}
                          >
                            <span>{sec.buttonText}</span>
                            {!primaryBtn.style.backgroundColor ? (
                              <ArrowRight className="w-3.5 h-3.5" />
                            ) : (
                              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                            )}
                          </button>
                        )}
                        {sec.secondaryButtonText && (
                          <button
                            onClick={() => handleAction(sec.secondaryButtonAction, sec.secondaryButtonLink)}
                            className={secondaryBtn.className}
                            style={secondaryBtn.style}
                          >
                            <span>{sec.secondaryButtonText}</span>
                            {secondaryBtn.style.backgroundColor && (
                              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <div key={sec.id} className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Image Column */}
                  <div className={`lg:col-span-5 ${isRight ? 'lg:order-2' : 'lg:order-1'}`}>
                    {sec.imageUrl ? (
                      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-stone-200 bg-stone-100">
                        <img
                          src={sec.imageUrl}
                          alt={sec.title || ''}
                          className="w-full h-80 object-cover"
                        />
                        {sec.subtitle && (
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                            <p className="text-xs font-bold text-amber-300">{sec.subtitle}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-80 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 text-xs font-medium">
                        등록된 이미지가 없습니다
                      </div>
                    )}
                  </div>

                  {/* Text Column */}
                  <div className={`lg:col-span-7 space-y-4 ${isRight ? 'lg:order-1' : 'lg:order-2'}`}>
                    {sec.badge && (
                      <div className="inline-block px-3 py-1 rounded bg-[#872D35]/10 text-[#872D35] text-xs font-bold">
                        {sec.badge}
                      </div>
                    )}
                    {sec.title && (
                      <h3 className="text-2xl sm:text-3xl font-black text-stone-900 leading-snug whitespace-pre-line">
                        {sec.title}
                      </h3>
                    )}
                    {sec.content && (
                      <div className="space-y-3 text-stone-600 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                        {sec.content}
                      </div>
                    )}
                    {(sec.buttonText || sec.secondaryButtonText) && (
                      <div className="flex flex-wrap gap-3 pt-3">
                        {sec.buttonText && (
                          <button
                            onClick={() => handleAction(sec.buttonAction, sec.buttonLink)}
                            className={primaryBtn.className}
                            style={primaryBtn.style}
                          >
                            <span>{sec.buttonText}</span>
                            {!primaryBtn.style.backgroundColor ? (
                              <ArrowRight className="w-3.5 h-3.5" />
                            ) : (
                              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                            )}
                          </button>
                        )}
                        {sec.secondaryButtonText && (
                          <button
                            onClick={() => handleAction(sec.secondaryButtonAction, sec.secondaryButtonLink)}
                            className={secondaryBtn.className}
                            style={secondaryBtn.style}
                          >
                            <span>{sec.secondaryButtonText}</span>
                            {secondaryBtn.style.backgroundColor && (
                              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // 5. Multiple Images (Gallery)
          case 'multi_image':
            return (
              <div key={sec.id} className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6">
                {(sec.title || sec.subtitle) && (
                  <div>
                    {sec.badge && (
                      <span className="text-xs font-bold text-[#872D35] uppercase tracking-wider">{sec.badge}</span>
                    )}
                    {sec.title && <h3 className="text-2xl font-black text-stone-900 mt-1">{sec.title}</h3>}
                    {sec.subtitle && <p className="text-xs sm:text-sm text-stone-600 mt-1">{sec.subtitle}</p>}
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(sec.images || []).map((img, iIdx) => (
                    <div key={iIdx} className="rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 aspect-4/3">
                      <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            );

          // 6. Info List (Key-Value specification table, e.g. Corporate Profile or Product Specs)
          case 'info_list':
            return (
              <div key={sec.id} className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6">
                {(sec.title || sec.subtitle) && (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-4">
                    <div>
                      {sec.badge && (
                        <span className="text-xs font-bold text-[#872D35] uppercase tracking-wider block mb-1">{sec.badge}</span>
                      )}
                      <h3 className="text-xl font-black text-stone-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#872D35]" />
                        <span>{sec.title || '정보 안내'}</span>
                      </h3>
                      {sec.subtitle && <p className="text-xs text-stone-500 mt-1">{sec.subtitle}</p>}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  {(sec.infoItems || []).map((item, idx) => (
                    <div key={idx} className="flex border-b border-stone-100 pb-3">
                      <span className="w-32 font-bold text-stone-500 shrink-0">{item.label}</span>
                      <span className="font-semibold text-stone-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );

          // 7. Feature Cards Grid (4 Core Values, 6 Steps, etc.)
          case 'feature_cards': {
            const layout = sec.layout || '4-col';
            let colClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
            if (layout === '2-col') colClass = 'grid-cols-1 md:grid-cols-2';
            if (layout === '3-col') colClass = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

            return (
              <div key={sec.id} className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-8">
                {(sec.title || sec.subtitle) && (
                  <div>
                    {sec.badge && (
                      <span className="text-xs font-bold text-[#872D35] uppercase tracking-wider">{sec.badge}</span>
                    )}
                    {sec.title && <h3 className="text-2xl font-black text-stone-900 mt-1">{sec.title}</h3>}
                    {sec.subtitle && <p className="text-xs sm:text-sm text-stone-600 mt-1">{sec.subtitle}</p>}
                  </div>
                )}

                <div className={`grid ${colClass} gap-5`}>
                  {(sec.cardItems || []).map((card, cIdx) => {
                    const IconComponent = card.icon && ICON_MAP[card.icon] ? ICON_MAP[card.icon] : CheckCircle2;
                    return (
                      <div
                        key={cIdx}
                        className="bg-stone-50/70 p-5 sm:p-6 rounded-2xl border border-stone-200 hover:border-[#872D35]/40 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          {card.imageUrl && (
                            <div className="h-36 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-2xl">
                              <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-[#872D35]/10 text-[#872D35] flex items-center justify-center">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            {card.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                {card.badge}
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-stone-900 text-base mb-1.5">{card.title}</h4>
                          <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">{card.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }

          // 8. Button & CTA Banner
          case 'button_cta': {
            const ctaPrimary = getButtonStyling(sec.buttonText, sec.buttonLink, false);
            const ctaSecondary = getButtonStyling(sec.secondaryButtonText, sec.secondaryButtonLink, true);

            return (
              <div key={sec.id} className="p-6 sm:p-10 rounded-3xl bg-[#FAF8F5] border border-stone-200 text-center space-y-4">
                {sec.badge && (
                  <span className="inline-block px-3 py-1 rounded-full bg-[#872D35]/10 text-[#872D35] text-xs font-bold">
                    {sec.badge}
                  </span>
                )}
                {sec.title && (
                  <h4 className="font-black text-xl sm:text-2xl text-stone-900 whitespace-pre-line">
                    {sec.title}
                  </h4>
                )}
                {sec.content && (
                  <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mx-auto leading-relaxed whitespace-pre-line">
                    {sec.content}
                  </p>
                )}
                {(sec.buttonText || sec.secondaryButtonText) && (
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {sec.buttonText && (
                      <button
                        onClick={() => handleAction(sec.buttonAction, sec.buttonLink)}
                        className={ctaPrimary.className}
                        style={ctaPrimary.style}
                      >
                        <span>{sec.buttonText}</span>
                        {ctaPrimary.style.backgroundColor && (
                          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                        )}
                      </button>
                    )}
                    {sec.secondaryButtonText && (
                      <button
                        onClick={() => handleAction(sec.secondaryButtonAction, sec.secondaryButtonLink)}
                        className={ctaSecondary.className}
                        style={ctaSecondary.style}
                      >
                        <span>{sec.secondaryButtonText}</span>
                        {ctaSecondary.style.backgroundColor && (
                          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          }

          // 9. Divider
          case 'divider':
            return <div key={sec.id} className="border-t border-stone-200 my-8" />;

          // 10. CEO Signature / Representative Author
          case 'signature':
            return (
              <div key={sec.id} className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6">
                <div className="space-y-1 text-left w-full sm:w-auto">
                  {sec.title && (
                    <h4 className="text-base sm:text-lg font-black text-stone-900">{sec.title}</h4>
                  )}
                  {sec.content && (
                    <p className="text-stone-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                      {sec.content}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-stone-500">
                      {sec.authorRole || '주식회사 푸드홈 대표이사'}
                    </p>
                    <p className="text-lg sm:text-xl font-black text-stone-900 tracking-wider mt-0.5">
                      {sec.authorName || '김 진 성'}
                    </p>
                  </div>
                  {sec.signatureImageUrl ? (
                    <img
                      src={sec.signatureImageUrl}
                      alt="대표이사 서명"
                      className="h-12 w-auto max-w-[120px] object-contain opacity-90"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-[#872D35]/5 border border-[#872D35]/20 flex flex-col items-center justify-center text-center p-1">
                      <span className="text-[10px] font-bold text-[#872D35]">대표이사</span>
                      <span className="text-xs font-black text-[#872D35] tracking-widest">(인)</span>
                    </div>
                  )}
                </div>
              </div>
            );

          // 11. Spacer (Configurable spacing)
          case 'spacer': {
            const heightVal = typeof sec.spacerHeight === 'number' 
              ? `${sec.spacerHeight}px` 
              : (sec.spacerHeight || '24px');
            return <div key={sec.id} style={{ height: heightVal }} aria-hidden="true" />;
          }

          default:
            return null;
        }
      })}
    </div>
  );
};
