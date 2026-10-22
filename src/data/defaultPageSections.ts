import { CustomSectionItem, SiteContent, ProductItem } from '../types';

export const getDefaultPageSections = (pageId: string, content: Partial<SiteContent>): CustomSectionItem[] => {
  switch (pageId) {
    case 'about-intro':
    case 'intro':
      return [
        {
          id: 'sec-intro-text-1',
          type: 'text',
          title: content.ceoTitle || '안녕하세요!\n푸드홈 홈페이지를 찾아주셔서 진심으로 감사드립니다.',
          content: content.ceoGreeting || '푸드홈은 지난 30년간 전국 480여 개 외식 프랜차이즈 및 유명 보쌈·족발 맛집의 든든한 식자재 파트너로 성장해 왔습니다.\n\n외식업 대표님들의 가장 큰 고충인 ‘시간 경과에 따른 물 생김’과 ‘계절별 무의 편차’를 해결하기 위해, 푸드홈은 독자적인 특허 수분제어 절임 공법을 개발하여 언제나 꼬들꼬들하고 청량한 김치를 균일하게 공급하고 있습니다.',
          visible: true,
          order: 1
        },
        {
          id: 'sec-intro-image',
          type: 'image',
          title: '충북 진천 스마트 가공 센터 & 위생 자동화 생산 라인',
          imageUrl: content.ceoImageUrl || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
          imageSize: 'full',
          visible: true,
          order: 2
        },
        {
          id: 'sec-intro-text-2',
          type: 'text',
          content: '원가와 타협하지 않는 100% 국산 농산물 계약재배와 청결한 위생 관리로, 대표님의 매장이 손님들에게 언제나 찬사를 받을 수 있도록 최고의 파트너가 되겠습니다.\n\n우리 가족이 먹는다는 정직한 신념과 엄격한 품질 원칙을 가슴에 새기며, 고객 여러분의 신뢰에 보답하는 으뜸 식품기업으로 지속 발전할 것을 약속드립니다.\n\n감사합니다.',
          visible: true,
          order: 3
        },
        {
          id: 'sec-intro-signature',
          type: 'signature',
          authorRole: '주식회사 푸드홈 대표이사',
          authorName: content.ceoName || '김진성',
          signatureImageUrl: content.ceoSignatureImage || '',
          visible: true,
          order: 4
        },
        // [보존 데이터] 기존 CEO 소개 카드 (필요시 관리자에서 복구 가능)
        {
          id: 'sec-intro-ceo',
          type: 'image_text',
          title: content.ceoTitle || '우리 가족이 먹는다는 마음으로,\n끝까지 아삭하고 정직한 맛을 지켜갑니다.',
          subtitle: content.ceoSubtitle || 'SINCE 1996 · 30년의 고집',
          badge: 'CEO 인사말',
          content: content.ceoGreeting || '안녕하십니까, 주식회사 푸드홈 대표이사 김진성입니다.\n\n푸드홈은 지난 30년간 전국 480여 개 외식 프랜차이즈 및 유명 보쌈·족발 맛집의 든든한 식자재 파트너로 성장해 왔습니다.\n\n외식업 대표님들의 가장 큰 고충인 ‘시간 경과에 따른 물 생김’과 ‘계절별 무의 편차’를 해결하기 위해, 푸드홈은 독자적인 특허 수분제어 절임 공법을 개발하여 언제나 꼬들꼬들하고 청량한 김치를 균일하게 공급하고 있습니다.\n\n원가와 타협하지 않는 100% 국산 농산물 계약재배와 청결한 위생 관리로, 대표님의 매장이 손님들에게 언제나 찬사를 받을 수 있도록 최고의 파트너가 되겠습니다.',
          imageUrl: content.ceoImageUrl || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
          imagePosition: 'left',
          visible: false,
          order: 5
        },
        // [보존 데이터] 기존 기업 개요 정보표
        {
          id: 'sec-intro-corporate',
          type: 'info_list',
          title: '기업 개요',
          badge: 'CORPORATE OVERVIEW',
          infoItems: [
            { label: '회사명', value: content.companyName || '주식회사 푸드홈 (FOODHOME Co., Ltd.)' },
            { label: '대표이사', value: content.ceoName || '김진성' },
            { label: '설립연도', value: '1996년 4월 (업력 30년)' },
            { label: '사업자등록번호', value: content.businessNumber || '312-81-94821' },
            { label: '통신판매업신고', value: content.mailOrderNumber || '제 2023-충북진천-0145호' },
            { label: '영업등록번호', value: content.haccpNumber || '식품제조가공업 영업등록 제 2021-04-9218호' },
            { label: '본사 및 공장', value: content.factoryAddress || '충청북도 진천군 덕산읍 신척산단로 128' },
            { label: '주요 생산 품목', value: '명품 보쌈무김치 (업소용 5kg/10kg), 비법 보쌈김칫속, 굴보쌈 양념' }
          ],
          visible: false,
          order: 6
        },
        // [보존 데이터] 기존 4대 안심 경영 원칙 카드
        {
          id: 'sec-intro-values',
          type: 'feature_cards',
          title: '푸드홈 4대 안심 경영 원칙',
          subtitle: '원가와 타협하지 않는 정직한 원재료와 철저한 위생 관리',
          badge: 'CORE VALUES',
          layout: '4-col',
          cardItems: [
            {
              title: '100% 국산 농산물',
              desc: '강원도 고랭지무, 제주 월동무, 영양 태양초 고춧가루, 신안 천일염 계약재배',
              icon: 'ShieldCheck'
            },
            {
              title: '특허 수분제어 공법',
              desc: '시간이 지나도 물이 흥건해지지 않고 아삭하고 꼬들꼬들한 특유의 식감 장시간 유지',
              icon: 'Sparkles'
            },
            {
              title: '스마트 청결 라인',
              desc: '3단 버블 세척, 에어샤워, 금속 검출기 등 위생적이고 엄격한 품질 관리 공정',
              icon: 'CheckCircle2'
            },
            {
              title: '전국 냉장 직배송',
              desc: '당일 생산 당일 출고, 전국 외식 매장 주방까지 익일 오전 신선 콜드체인 공급',
              icon: 'Truck'
            }
          ],
          visible: false,
          order: 7
        },
        // [보존 데이터] 기존 하단 홍보 섹션
        {
          id: 'sec-intro-cta',
          type: 'button_cta',
          title: '직접 맛을 보시고 결정하세요. 1kg 무료 샘플팩 신청 접수 중',
          content: '사업자등록증을 보유하신 모든 외식업 대표님께 푸드홈 시그니처 보쌈무김치를 무료로 발송해 드립니다.',
          buttonText: '무료 샘플 신청글 쓰기',
          buttonAction: 'sample',
          secondaryButtonText: '전체 제품 라인업 보기',
          secondaryButtonAction: 'products',
          visible: false,
          order: 8
        }
      ];

    case 'about-system':
    case 'system':
      return [
        {
          id: 'sec-system-steps',
          type: 'feature_cards',
          title: content.systemTitle || '스마트 자동화 생산 공정 프로세스',
          subtitle: content.systemDescription || '산지 직송부터 매장 주방 도착까지, 푸드홈만의 6단계 안심 품질 관리 시스템을 운영합니다.',
          badge: 'PRODUCTION SYSTEM',
          layout: '3-col',
          cardItems: (content.systemSteps && content.systemSteps.length > 0)
            ? content.systemSteps.map(s => ({
                title: `${s.step} ${s.title}`,
                desc: s.desc,
                imageUrl: s.img,
                icon: 'CheckCircle2'
              }))
            : [
                {
                  title: 'STEP 01 계약재배 원료 입고',
                  desc: '강원도 평창 고랭지무 및 제주 청정 월동무 산지 당일 최상급 선별 입고',
                  imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80',
                  icon: 'Truck'
                },
                {
                  title: 'STEP 02 3단 마이크로 버블 세척',
                  desc: '초음파 미세 기포로 잔류 이물질과 미세 흙을 3단계에 걸쳐 정밀 세척',
                  imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
                  icon: 'Sparkles'
                },
                {
                  title: 'STEP 03 특허 수분제어 절임',
                  desc: '신안 천일염의 정확한 삼투압과 푸드홈 특허 공법으로 꼬들함 유지',
                  imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
                  icon: 'ShieldCheck'
                },
                {
                  title: 'STEP 04 황금 배합비 버무림',
                  desc: '30년 전통 엿기름과 청결 태양초 고춧가루로 저온 숙성 비법 양념',
                  imageUrl: 'https://images.unsplash.com/photo-1583032015879-67990c74900a?auto=format&fit=crop&w=600&q=80',
                  icon: 'Award'
                },
                {
                  title: 'STEP 05 금속검출기 & 정밀 검수',
                  desc: '포장 직전 고감도 금속 검출기와 중량 체크기 전수 통과',
                  imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80',
                  icon: 'CheckCircle2'
                },
                {
                  title: 'STEP 06 냉장 콜드체인 직배송',
                  desc: '0~5℃ 정온 유지 전용 특장차량으로 익일 오전 매장 주방까지 도착',
                  imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
                  icon: 'Truck'
                }
              ],
          visible: true,
          order: 1
        },
        {
          id: 'sec-system-cta',
          type: 'button_cta',
          title: '전국 480개 외식 매장 매일 아침 직배송 네트워크',
          content: '생산 즉시 충북 진천 물류허브에서 출발하여 전국 주요 광역 거점을 통해 익일 오전까지 냉장 신선 상태를 그대로 유지하며 배송됩니다.',
          buttonText: '무료 샘플 1kg 받아보기',
          buttonAction: 'sample',
          secondaryButtonText: '대량 납품 상담 문의',
          secondaryButtonAction: 'quote',
          visible: true,
          order: 2
        }
      ];

    case 'about-permits':
    case 'permits':
      return [
        {
          id: 'sec-permits-cards',
          type: 'feature_cards',
          title: content.permitsTitle || '공식 영업등록 및 품질 안전 인허가',
          subtitle: content.permitsDescription || '식품위생법 및 관련 법령에 따른 엄격한 정식 인허가를 필하여 안심하고 납품받으실 수 있습니다.',
          badge: 'LEGAL & CERTIFICATIONS',
          layout: '3-col',
          cardItems: (content.permitsList && content.permitsList.length > 0)
            ? content.permitsList.map(p => ({
                title: p.title,
                badge: p.status || p.number,
                desc: `${p.issuer} · ${p.desc}`,
                icon: 'ShieldCheck'
              }))
            : [
                {
                  title: '식품제조가공업 영업등록',
                  badge: '제 2021-04-9218호',
                  desc: '충청북도 진천군청 · 식품위생법 제37조에 따른 정식 식품가공 시설 인가',
                  icon: 'ShieldCheck'
                },
                {
                  title: '정식 법인 사업자등록',
                  badge: '312-81-94821',
                  desc: '국세청 동청주세무서 · 김치 및 절임식품 제조 정식 법인 인가',
                  icon: 'CheckCircle2'
                },
                {
                  title: '통신판매업 신고증',
                  badge: '제 2023-충북진천-0145호',
                  desc: '진천군청 · 전자상거래 소비자보호 법률에 따른 통신판매 정식 신고',
                  icon: 'CheckCircle2'
                },
                {
                  title: '자가품질위탁시험 성적서',
                  badge: '전항목 적합 판정',
                  desc: '공인 시험검사기관 · 대장균군, 타르색소, 보존료 일체 불검출',
                  icon: 'Award'
                },
                {
                  title: '생산물 배상책임보험 (PL)',
                  badge: '보상한도 1억원 가입',
                  desc: '현대해상화재보험 · 납품 식품 사고 발생 시 전액 배상 보장',
                  icon: 'ShieldCheck'
                },
                {
                  title: '원산지 증명 및 계약재배 협약서',
                  badge: '100% 국산 농산물',
                  desc: '농협 및 산지 영농조합 · 잔류농약 불검출 및 계약재배 입증',
                  icon: 'Sparkles'
                }
              ],
          visible: true,
          order: 1
        }
      ];

    case 'about-location':
    case 'location':
      return [
        {
          id: 'sec-location-main',
          type: 'image_text',
          title: content.locationTitle || '충북 진천 식품가공센터 및 본사 오시는 길',
          subtitle: content.locationDescription || '푸드홈의 전 제품이 청결한 안심 위생 라인에서 제조·출하되는 중심 거점입니다.',
          badge: 'MANUFACTURING & HEADQUARTERS',
          content: `공장 주소: ${content.factoryAddress || '충청북도 진천군 덕산읍 신척산단로 128'}\n대표전화: ${content.phone || '043-535-1905'}\n고객센터 운영: ${content.csHours || '평일 09:00~18:00 (주말/공휴일 휴무)'}\n\n교통 안내: 중부고속도로 진천IC에서 10분 거리 (신척일반산업단지 내)\n주차 안내: 공장 부지 내 대형 화물차량 및 방문객 전용 주차 공간 완비`,
          imageUrl: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80',
          imagePosition: 'right',
          buttonText: '네이버 지도에서 보기',
          buttonLink: `https://map.naver.com/v5/search/${encodeURIComponent(content.factoryAddress || '충청북도 진천군 덕산읍 신척산단로 128')}`,
          buttonAction: 'url',
          secondaryButtonText: '카카오맵에서 보기',
          secondaryButtonLink: `https://map.kakao.com/link/search/${encodeURIComponent(content.factoryAddress || '충청북도 진천군 덕산읍 신척산단로 128')}`,
          secondaryButtonAction: 'url',
          visible: true,
          order: 1
        },
        {
          id: 'sec-location-cta',
          type: 'button_cta',
          title: '식자재 납품 현장 방문 및 미팅 예약',
          content: '대형 프랜차이즈 본사 및 물류 총괄 관계자분의 시설 실사 및 샘플 테스팅 미팅을 언제나 환영합니다.',
          buttonText: '1:1 대량 납품 견적 문의하기',
          buttonAction: 'quote',
          secondaryButtonText: '사업자 무료 샘플 1kg 신청',
          secondaryButtonAction: 'sample',
          visible: true,
          order: 2
        }
      ];

    default:
      return [];
  }
};

export const getDefaultProductSections = (product: ProductItem): CustomSectionItem[] => {
  return [
    {
      id: `psec-${product.id}-story`,
      type: 'feature_cards',
      title: '푸드홈만의 3대 명품 비법 기술',
      subtitle: `${product.name}의 독보적인 아삭함과 깊은 감칠맛을 만드는 비결`,
      badge: 'ARTISAN PROCESS',
      layout: '3-col',
      cardItems: [
        {
          title: '특허 수분제어 절임 공법',
          desc: '시간이 지나도 물이 생겨 흥건해지지 않고, 첫 입부터 마지막 입까지 꼬들꼬들 아삭한 저작감을 유지합니다.',
          icon: 'Sparkles',
          badge: '특허 보유'
        },
        {
          title: '100% 국산 엄선 농산물',
          desc: '강원도 평창 고랭지무와 제주 월동무, 영양 태양초 고춧가루, 신안 3년 묵은 천일염만을 엄격히 계약 재배합니다.',
          icon: 'ShieldCheck',
          badge: '원산지 100%'
        },
        {
          title: '0~5℃ 전국 냉장 콜드체인',
          desc: '당일 새벽 주문 즉시 버무려 당일 오후 출고, 익일 오전 전국 외식 매장 주방까지 가장 신선한 상태로 직배송합니다.',
          icon: 'Truck',
          badge: '익일 직송'
        }
      ],
      visible: true,
      order: 1
    },
    {
      id: `psec-${product.id}-specs`,
      type: 'info_list',
      title: '식품위생법에 의한 한글 표시사항 규격표',
      badge: 'OFFICIAL SPECIFICATIONS',
      infoItems: [
        { label: '제품명', value: product.name },
        { label: '식품의 유형', value: '김치류 (절임식품 / 살균제품 아님)' },
        { label: '포장 중량 / 규격', value: product.weight || '5kg / 10kg 박스 단위' },
        { label: '포장 형태', value: product.packagingType || '2중 안심 진공 실링백 + 전용 보냉 박스' },
        { label: '보관 방법', value: product.storage || '냉장보관 (0~5℃ 권장)' },
        { label: '소비기한', value: product.shelfLife || '제조일로부터 30일' },
        { label: '원재료 및 함량', value: product.ingredients || '절임무(국내산), 고춧가루(국내산), 마늘, 생강, 멸치액젓' },
        { label: '원산지', value: product.origin || '100% 대한민국 국산 농산물' },
        { label: '제조원 및 판매원', value: '주식회사 푸드홈 / 충북 진천군 덕산읍 신척산단로 128' },
        { label: '최소 발주 단위', value: product.minOrder || '1박스 단위' },
        { label: '배송 조건', value: product.deliveryInfo || '전국 우체국 / 전용 냉장 화물 익일 특송' }
      ],
      visible: true,
      order: 2
    },
    {
      id: `psec-${product.id}-b2b`,
      type: 'feature_cards',
      title: '외식업 파트너 B2B 정기 납품 4단계',
      subtitle: '복잡한 유통 마진 없이 공장 직발송으로 원가 절감과 균일한 품질을 약속합니다.',
      badge: 'B2B WHOLESALE PROCESS',
      layout: '4-col',
      cardItems: [
        {
          title: 'STEP 1. 무료 샘플 신청',
          desc: '1kg 정품 맛보기 샘플을 무료로 받아 매장 요리와 궁합을 테스트합니다.',
          icon: 'Sparkles',
          badge: '100% 무료'
        },
        {
          title: 'STEP 2. 맞춤 단가 협의',
          desc: '월 예상 소진량 및 주간 배송 주기에 따라 최적의 도매 단가를 산정합니다.',
          icon: 'CheckCircle2',
          badge: '1:1 전담'
        },
        {
          title: 'STEP 3. 정기 발주 계약',
          desc: '브랜드 전용 포장(PB) 또는 규격 벌크백을 선택하여 정기 공급 계약을 체결합니다.',
          icon: 'Award',
          badge: '맞춤 OEM'
        },
        {
          title: 'STEP 4. 당일제조 직배송',
          desc: '매일 아침 갓 담근 신선한 김치를 전담 콜드체인으로 전국 매장에 직배송합니다.',
          icon: 'Truck',
          badge: '신선 보장'
        }
      ],
      visible: true,
      order: 3
    },
    {
      id: `psec-${product.id}-cta`,
      type: 'button_cta',
      title: `${product.name}을(를) 매장에서 먼저 무료로 시식해 보세요`,
      content: '사업자등록증을 보유하신 외식업 대표님께 1kg 본품 샘플팩을 전액 무료(배송비 푸드홈 부담)로 발송해 드립니다.',
      buttonText: '무료 샘플 1kg 신청하기',
      buttonAction: 'sample',
      secondaryButtonText: '1:1 대량 납품 견적 상담',
      secondaryButtonAction: 'quote',
      visible: true,
      order: 4
    }
  ];
};
