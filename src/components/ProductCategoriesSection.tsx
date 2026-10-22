import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const ProductCategoriesSection: React.FC = () => {
  const { state } = useApp();
  const cfg = state.content.mainSections?.find(s => s.id === 'productCategories');

  const categories = [
    {
      id: 'cat-1',
      number: '01',
      name: '명품 보쌈무김치',
      englishName: 'BOSSAM RADISH KIMCHI',
      description: '물 생김 없이 끝까지 아삭하고 꼬들한 특허 절임 공법의 푸드홈 대표 시그니처',
      imageUrl: './images/prod_bossam_mu.jpg',
      categoryKey: '보쌈무김치',
      features: ['특허 수분제어 공법', '100% 국내산 제철무', '안심 위생시설 제조']
    },
    {
      id: 'cat-2',
      number: '02',
      name: '비법 보쌈김칫속',
      englishName: 'ARTISAN KIMCHI PASTE',
      description: '국내산 배·양파 생과일의 천연 단맛과 광천 토굴 젓갈의 깊은 감칠맛을 품은 속양념',
      imageUrl: './images/prod_kimchi_sok.jpg',
      categoryKey: '김칫속/양념',
      features: ['생과일 천연 단맛', '광천 토굴 새우젓', '수육·생굴 최상의 궁합']
    },
    {
      id: 'cat-3',
      number: '03',
      name: '업소용 대용량 (10kg)',
      englishName: 'B2B BULK PACKAGE',
      description: '전국 480개 외식 가맹점 공급용 경제형 규격. 특수 진공 실링으로 신선도 완벽 유지',
      imageUrl: './images/prod_bulk_10kg.jpg',
      categoryKey: '업소용 대용량',
      features: ['10kg 진공 안심포장', '정기 직배송 단가 혜택', '프랜차이즈 맞춤 납품']
    },
    {
      id: 'cat-4',
      number: '04',
      name: '소포장 & 밀키트 (500g)',
      englishName: 'POUCH & MEAL KIT',
      description: '배달전문점, 밀키트 세트용 위생 실링팩. 재포장 없는 간편한 서빙 및 가정용 소포장',
      imageUrl: './images/prod_pouch_500g.jpg',
      categoryKey: '소포장/밀키트',
      features: ['500g 신선 위생 파우치', '소형 매장 적합', '네이버 스마트스토어 판매']
    }
  ];

  const handleCategoryClick = (categoryKey: string) => {
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      // Dispatch custom event to switch active category tab in ProductSection
      window.dispatchEvent(new CustomEvent('selectProductCategory', { detail: categoryKey }));
    }
  };

  return (
    <section className="py-12 bg-white border-b border-[#E8E2DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8E2DC] text-[11px] font-bold text-[#872D35] mb-2.5">
            <span>{cfg?.badge || 'FOOD CATEGORIES'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2A2020] tracking-tight">
            {cfg?.title || '전문 외식업소를 위한 4대 제품 라인업'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            {cfg?.description || '업종과 주방 운영 형태에 맞춰 최적화된 패키지와 레시피를 제안합니다.'}
          </p>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.categoryKey)}
              className="bg-[#FAF8F5] rounded-xl border border-[#E8E2DC] overflow-hidden flex flex-col justify-between hover:border-[#872D35] hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div>
                {/* Image with subtle hover zoom */}
                <div className="relative aspect-16/11 overflow-hidden bg-stone-100">
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Category Number Badge */}
                  <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-[#2A2020]/80 text-white backdrop-blur-xs flex items-center justify-center font-black text-xs">
                    {cat.number}
                  </div>

                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 text-[#332525] group-hover:bg-[#872D35] group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <span className="text-[10px] font-bold text-[#872D35] tracking-widest uppercase block mb-1">
                    {cat.englishName}
                  </span>
                  
                  <h3 className="text-base font-extrabold text-[#2A2020] group-hover:text-[#872D35] transition-colors">
                    {cat.name}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-normal">
                    {cat.description}
                  </p>

                  {/* Highlights checklist */}
                  <div className="mt-3 pt-3 border-t border-[#E8E2DC]/70 space-y-1">
                    {cat.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-[#4A3B32]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#872D35] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="px-4 pb-4 pt-1">
                <span className="text-xs font-bold text-[#872D35] group-hover:underline flex items-center gap-1">
                  <span>제품 보기</span>
                  <span>→</span>
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
