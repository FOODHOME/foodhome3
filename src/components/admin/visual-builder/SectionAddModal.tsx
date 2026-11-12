import React, { useState } from 'react';
import { CustomSectionItem } from '../../../types';
import { 
  X, 
  Type, 
  AlignLeft, 
  Image as ImageIcon, 
  Layers, 
  CreditCard, 
  Sparkles, 
  MousePointerClick, 
  Minus, 
  HelpCircle, 
  Video, 
  Package, 
  Send, 
  ListOrdered, 
  PenTool, 
  MoveVertical,
  Plus,
  Check
} from 'lucide-react';

interface SectionAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (newSection: CustomSectionItem) => void;
  currentCount: number;
}

interface SectionOption {
  type: string;
  name: string;
  desc: string;
  icon: any;
  category: '기본' | '이미지·미디어' | '특징·카드' | '신청·문의';
  createDefault: (id: string, order: number) => CustomSectionItem;
}

export const SECTION_OPTIONS: SectionOption[] = [
  // 1. 기본
  {
    type: 'heading',
    name: '1. 대제목 / 헤더',
    desc: '페이지의 핵심 주제와 부제목을 강조하는 헤더 블록',
    icon: Type,
    category: '기본',
    createDefault: (id, order) => ({
      id,
      type: 'heading',
      badge: 'FOODHOME HIGHLIGHT',
      title: '새로운 섹션 대제목을 입력하세요',
      subtitle: '이곳에 상세 부제목과 설명 문구를 작성하실 수 있습니다.',
      visible: true,
      order
    })
  },
  {
    type: 'text',
    name: '2. 일반 텍스트 설명',
    desc: '줄바꿈과 문단으로 구성된 상세 설명 텍스트 블록',
    icon: AlignLeft,
    category: '기본',
    createDefault: (id, order) => ({
      id,
      type: 'text',
      title: '상세 안내 및 설명',
      content: '푸드홈은 최고 품질의 식자재와 차별화된 제조 공정으로 외식업 대표님들의 든든한 사업 파트너가 되어 드립니다.\n이곳에 필요한 상세 안내 문구를 작성해 보세요.',
      visible: true,
      order
    })
  },
  {
    type: 'divider',
    name: '11. 구분선',
    desc: '섹션과 섹션 사이를 깔끔하게 분리하는 시각적 라인',
    icon: Minus,
    category: '기본',
    createDefault: (id, order) => ({
      id,
      type: 'divider',
      visible: true,
      order
    })
  },
  {
    type: 'spacer',
    name: '여백 조정 블록',
    desc: '섹션 간의 상하 간격을 원하는 높이(px)로 여백 조절',
    icon: MoveVertical,
    category: '기본',
    createDefault: (id, order) => ({
      id,
      type: 'spacer',
      spacerHeight: 48,
      visible: true,
      order
    })
  },

  // 2. 이미지·미디어
  {
    type: 'image',
    name: '3. 와이드 단독 이미지',
    desc: '제품 연출컷이나 생산시설을 크게 보여주는 대표 이미지',
    icon: ImageIcon,
    category: '이미지·미디어',
    createDefault: (id, order) => ({
      id,
      type: 'image',
      title: '푸드홈 프리미엄 제조 공정',
      content: '신선한 국산 원재료만을 엄선하여 정성껏 가공합니다.',
      imageUrl: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=1200&q=80',
      imageSize: 'large',
      visible: true,
      order
    })
  },
  {
    type: 'image_text',
    name: '4. 이미지 + 텍스트 (좌우)',
    desc: '좌측 이미지와 우측 텍스트로 균형 있게 설명하는 블록',
    icon: Layers,
    category: '이미지·미디어',
    createDefault: (id, order) => ({
      id,
      type: 'image_text',
      badge: 'CORE PROCESS',
      title: '특허받은 수분제어 기술로\n처음 맛 그대로 유지',
      content: '독자적인 염지 및 절임 수분제어 공법으로 납품 후 냉장 보관 시에도 물 생김 현상이 발생하지 않습니다.',
      imageUrl: 'https://images.unsplash.com/photo-1583032015879-67990c74900a?auto=format&fit=crop&w=800&q=80',
      imagePosition: 'left',
      buttonText: '무료 샘플 신청하기',
      buttonAction: 'sample',
      visible: true,
      order
    })
  },
  {
    type: 'text_image',
    name: '5. 텍스트 + 이미지 (우측배치)',
    desc: '좌측 설명과 우측 이미지 배치로 읽기 쉬운 레이아웃',
    icon: Layers,
    category: '이미지·미디어',
    createDefault: (id, order) => ({
      id,
      type: 'image_text',
      badge: 'CERTIFIED QUALITY',
      title: 'HACCP 스마트 해썹 인증\n철저한 위생 공정',
      content: '에어샤워, 금속검출기, 클린룸 설비를 통해 안전하고 신뢰할 수 있는 식품만을 생산합니다.',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      imagePosition: 'right',
      buttonText: 'HACCP 인증서 확인',
      buttonAction: 'page',
      buttonLink: 'about-permits',
      visible: true,
      order
    })
  },
  {
    type: 'gallery',
    name: '9. 이미지 갤러리 그리드',
    desc: '2~4개의 다중 이미지를 격자로 모아 보여주는 갤러리',
    icon: ImageIcon,
    category: '이미지·미디어',
    createDefault: (id, order) => ({
      id,
      type: 'multi_image',
      badge: 'GALLERY',
      title: '푸드홈 제조 가공 센터 갤러리',
      subtitle: '위생적인 자동화 설비와 신선한 산지 직송 원재료',
      images: [
        'https://images.unsplash.com/photo-1583032015879-67990c74900a?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80'
      ],
      visible: true,
      order
    })
  },
  {
    type: 'video',
    name: '13. 홍보 동영상 블록',
    desc: '유튜브(YouTube) 또는 비메오 동영상을 임베드하여 재생',
    icon: Video,
    category: '이미지·미디어',
    createDefault: (id, order) => ({
      id,
      type: 'video',
      badge: 'VIDEO',
      title: '푸드홈 생산 공정 영상 둘러보기',
      subtitle: '체계적인 자동화 생산 라인과 위생 공정을 영상으로 만나보세요.',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      visible: true,
      order
    })
  },

  // 3. 특징·카드
  {
    type: 'feature_cards',
    name: '6. 특징 카드 그리드 (핵심 강점)',
    desc: '아이콘, 제목, 설명이 포함된 차별화 강점 카드 3~4열',
    icon: CreditCard,
    category: '특징·카드',
    createDefault: (id, order) => ({
      id,
      type: 'feature_cards',
      badge: 'WHY FOODHOME',
      title: '외식업 대표님들이 푸드홈을 선택하는 이유',
      subtitle: '맛의 일관성, 인건비 절감, 믿을 수 있는 품질 보증',
      layout: '4-col',
      cardItems: [
        { title: '원가 절감 35%', desc: '인건비와 조리시간을 획기적으로 줄여 매장 수익성을 개선합니다.', icon: 'Sparkles', badge: '수익 개선' },
        { title: '100% 국산 농산물', desc: '강원도·전남 산지 계약재배를 통해 항상 신선한 원재료를 확보합니다.', icon: 'CheckCircle2', badge: '신선 원료' },
        { title: '물 생김 방지 특허', desc: '특허받은 수분제어 기술로 마지막 한 점까지 아삭한 식감을 유지합니다.', icon: 'ShieldCheck', badge: '특허 기술' },
        { title: '전국 일일 배송', desc: '자체 콜드체인 물류망을 통해 전국 어디든 신선하게 배송합니다.', icon: 'Truck', badge: '익일 배송' }
      ],
      visible: true,
      order
    })
  },
  {
    type: 'icon_cards',
    name: '7. 아이콘 카드 (서비스 특징)',
    desc: '심플한 아이콘과 간결한 텍스트로 구성된 포인트 카드',
    icon: Sparkles,
    category: '특징·카드',
    createDefault: (id, order) => ({
      id,
      type: 'feature_cards',
      badge: 'KEY POINTS',
      title: '푸드홈만의 4대 안심 약속',
      layout: '4-col',
      cardItems: [
        { title: '당일 주문 익일 출고', desc: '오전 주문 건 당일 신선 출고', icon: 'Clock' },
        { title: '콜드체인 냉장 배송', desc: '0~5℃ 신선온도 풀케어', icon: 'Thermometer' },
        { title: '맞춤형 대용량 벌크', desc: '업장 환경에 최적화된 포장', icon: 'Package' },
        { title: '1:1 전담 매니저', desc: '발주 및 납품 전담 관리', icon: 'Phone' }
      ],
      visible: true,
      order
    })
  },
  {
    type: 'info_list',
    name: '16. 정보 목록 / 규격 스펙 표',
    desc: '제품 사양, 원재료 비율, 기업 기본 정보 등을 정리하는 표',
    icon: ListOrdered,
    category: '특징·카드',
    createDefault: (id, order) => ({
      id,
      type: 'info_list',
      badge: 'SPECIFICATIONS',
      title: '제품 규격 및 상세 사양 안내',
      subtitle: '외식업 및 단체급식 납품 기준 상세 스펙표',
      infoItems: [
        { label: '제품명', value: '푸드홈 명품 보쌈무김치' },
        { label: '포장 규격', value: '5kg 박스 / 10kg 벌크' },
        { label: '보관 방법', value: '냉장보관 (0~5℃)' },
        { label: '유통 기한', value: '제조일로부터 30일' },
        { label: '원산지', value: '국내산 (절임무 75%, 고춧가루, 마늘, 젓갈)' },
        { label: '배송 조건', value: '전국 냉장 탑차 직배송 (박스 단위 발송 가능)' }
      ],
      visible: true,
      order
    })
  },
  {
    type: 'signature',
    name: '대표이사 서명 / 직책 블록',
    desc: 'CEO의 다짐과 직책, 성함, 친필 서명 이미지를 배치',
    icon: PenTool,
    category: '특징·카드',
    createDefault: (id, order) => ({
      id,
      type: 'signature',
      title: '신뢰와 정직으로 보답하겠습니다',
      authorRole: '주식회사 푸드홈 대표이사',
      authorName: '강 호 성',
      signatureImageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80',
      visible: true,
      order
    })
  },

  // 4. 신청·문의
  {
    type: 'button_cta',
    name: '8. 신청 및 문의 CTA 버튼',
    desc: '무료 샘플 신청이나 대량 견적 요청을 유도하는 배너',
    icon: MousePointerClick,
    category: '신청·문의',
    createDefault: (id, order) => ({
      id,
      type: 'button_cta',
      badge: 'FREE SAMPLE',
      title: '지금 바로 푸드홈 무료 샘플을 신청해보세요',
      content: '사업자등록증을 보유하신 외식업 대표님께는 택배비까지 전액 무료로 샘플을 보내드립니다.',
      buttonText: '무료 샘플 신청하기 (택배비 무료)',
      buttonAction: 'sample',
      secondaryButtonText: '대량 납품 견적 문의',
      secondaryButtonAction: 'quote',
      visible: true,
      order
    })
  },
  {
    type: 'banner',
    name: '10. 풀와이드 강조 배너',
    desc: '배경 색상과 강조 문구로 시선을 사로잡는 대형 배너',
    icon: Layers,
    category: '신청·문의',
    createDefault: (id, order) => ({
      id,
      type: 'button_cta',
      badge: 'SPECIAL B2B OFFER',
      title: '매달 안정적인 고정 단가로\n수익성을 극대화하세요',
      content: '연간 고정단가 계약 및 전담 매니저 배정으로 식자재 가격 폭등 시에도 안심하고 운영하실 수 있습니다.',
      buttonText: '연간 단가 협약 상담 신청',
      buttonAction: 'quote',
      visible: true,
      order
    })
  },
  {
    type: 'faq',
    name: '12. 자주 묻는 질문 (FAQ)',
    desc: '납품, 결제, 배송 등 자주 묻는 질문과 답변 아코디언',
    icon: HelpCircle,
    category: '신청·문의',
    createDefault: (id, order) => ({
      id,
      type: 'faq',
      badge: 'FAQ',
      title: '자주 묻는 질문',
      subtitle: '궁금하신 점을 빠르게 해결해 드립니다.',
      faqItems: [
        { question: '최소 주문 수량(MOQ)은 얼마인가요?', answer: '기본 1박스(5kg/10kg)부터 택배 출고가 가능하며, 정기 배송 시 단가 우대가 적용됩니다.' },
        { question: '샘플 신청 시 비용이 발생하나요?', answer: '외식업 사업자등록증을 보유하신 대표님께는 제품 및 택배비 전액 무료로 제공됩니다.' },
        { question: '배송은 어떻게 진행되나요?', answer: '전국 콜드체인 물류망을 통해 신선 냉장 상태(0~5℃)로 익일 매장 앞까지 배송됩니다.' }
      ],
      visible: true,
      order
    })
  },
  {
    type: 'product_grid',
    name: '14. 추천 제품 목록 그리드',
    desc: '대표 제품들을 카드 형태로 나열하여 둘러보게 하는 블록',
    icon: Package,
    category: '신청·문의',
    createDefault: (id, order) => ({
      id,
      type: 'heading',
      badge: 'FEATURED PRODUCTS',
      title: '푸드홈 B2B 대표 납품 라인업',
      subtitle: '전국 외식업소에서 검증된 베스트셀러 제품군을 확인하세요.',
      visible: true,
      order
    })
  },
  {
    type: 'inquiry_cta',
    name: '15. 문의 유도 카드 박스',
    desc: '전화 상담 번호와 1:1 상담 접수 바로가기를 함께 제공',
    icon: Send,
    category: '신청·문의',
    createDefault: (id, order) => ({
      id,
      type: 'button_cta',
      badge: 'B2B CONSULTING',
      title: '식자재 맞춤 소싱 및 대량 공급 문의',
      content: '원하시는 배합비, 포장 규격, 월 예상 사용량을 말씀해주시면 가장 합리적인 단가를 제안해 드립니다.',
      buttonText: '1:1 견적 상담 바로가기',
      buttonAction: 'quote',
      secondaryButtonText: '전화 상담 (043-532-8890)',
      secondaryButtonLink: 'tel:043-532-8890',
      visible: true,
      order
    })
  }
];

export const SectionAddModal: React.FC<SectionAddModalProps> = ({
  isOpen,
  onClose,
  onAddSection,
  currentCount
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('전체');

  if (!isOpen) return null;

  const categories = ['전체', '기본', '이미지·미디어', '특징·카드', '신청·문의'];

  const filtered = activeCategory === '전체'
    ? SECTION_OPTIONS
    : SECTION_OPTIONS.filter(o => o.category === activeCategory);

  const handleSelectOption = (opt: SectionOption) => {
    const newId = `sec-${Date.now()}`;
    const newSection = opt.createDefault(newId, currentCount + 1);
    onAddSection(newSection);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200" data-admin-area="true">
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        data-admin-area="true"
      >
        {/* Header */}
        <div className="bg-[#2A2020] text-white px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#3D2E2E]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#872D35] text-white shadow-xs">
              <Plus className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                새로운 콘텐츠 섹션 추가
              </h3>
              <p className="text-xs text-stone-300">
                원하시는 콘텐츠 유형을 선택하시면 현재 페이지의 섹션 목록에 즉시 추가됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 flex items-center gap-2 overflow-x-auto shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeCategory === cat
                  ? 'bg-[#872D35] text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Section Cards Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.type + opt.name}
                onClick={() => handleSelectOption(opt)}
                className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-[#872D35] hover:shadow-md transition-all text-left flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#872D35]/10 text-[#872D35] flex items-center justify-center group-hover:bg-[#872D35] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                      {opt.category}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-stone-900 group-hover:text-[#872D35] transition-colors mb-1">
                    {opt.name}
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {opt.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#872D35]">
                  <span>선택하여 추가</span>
                  <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>총 <strong>{SECTION_OPTIONS.length}개</strong>의 다양한 모듈형 섹션 템플릿 제공</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-700 font-bold transition-colors cursor-pointer"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};
