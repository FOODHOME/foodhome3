import { AppState } from '../types';

export const initialData: AppState = {
  content: {
    brandName: '푸드홈',
    brandSubName: 'FOODHOME',
    tagline: '30년 전통 비법양념과 특허 수분제어로 빚어낸 명품 보쌈무김치',
    logoUrl: '', // Default SVG logo will be displayed, or custom logo uploaded by user
    
    // Navigation Menus (GNB) - Editable in Admin Dashboard
    navMenus: [
      {
        id: 'about',
        name: '회사소개',
        visible: true,
        actionType: 'page',
        target: 'about',
        submenus: [
          { id: 'sub-about-1', label: '회사소개 & CEO 인사말', actionType: 'page', target: 'about-intro' },
          { id: 'sub-about-2', label: '생산 & 물류시스템', actionType: 'page', target: 'about-system' },
          { id: 'sub-about-3', label: '인허가사항', actionType: 'page', target: 'about-permits' },
          { id: 'sub-about-4', label: '오시는 길', actionType: 'page', target: 'about-location' }
        ]
      },
      {
        id: 'products',
        name: '제품소개',
        visible: true,
        actionType: 'page',
        target: 'products',
        submenus: [
          { id: 'sub-prod-1', label: '명품 보쌈무김치', actionType: 'page', target: 'product-detail', subTarget: 'prod-1' },
          { id: 'sub-prod-2', label: '비법 보쌈김칫속', actionType: 'page', target: 'product-detail', subTarget: 'prod-2' },
          { id: 'sub-prod-3', label: '업소용 대용량 (10kg)', actionType: 'page', target: 'product-detail', subTarget: 'prod-4' },
          { id: 'sub-prod-4', label: '소포장 & 밀키트 (500g)', actionType: 'page', target: 'product-detail', subTarget: 'prod-5' }
        ]
      },
      {
        id: 'sample-board',
        name: '샘플신청',
        visible: true,
        actionType: 'page',
        target: 'sample-board',
        submenus: [
          { id: 'sub-sample-1', label: '샘플신청 게시판', actionType: 'page', target: 'sample-board' },
          { id: 'sub-sample-2', label: '신청글 작성하기', actionType: 'page', target: 'sample-board-write' },
          { id: 'sub-sample-3', label: '샘플 발송 현황 조회', actionType: 'page', target: 'sample-board' }
        ]
      },
      {
        id: 'wholesale',
        name: '납품안내',
        visible: true,
        actionType: 'page',
        target: 'wholesale-guide',
        submenus: [
          { id: 'sub-who-1', label: '1:1 대량 납품 견적 상담', actionType: 'page', target: 'quote-board' },
          { id: 'sub-who-2', label: '프랜차이즈 맞춤 OEM/PB', actionType: 'page', target: 'quote-board-write' },
          { id: 'sub-who-3', label: '사업자 1kg 무료 샘플팩', actionType: 'page', target: 'sample-board-write' }
        ]
      },
      {
        id: 'cs',
        name: '고객센터',
        visible: true,
        actionType: 'scroll',
        target: 'footer-section',
        submenus: [
          { id: 'sub-cs-1', label: '공지사항', actionType: 'board', target: 'notice-board' },
          { id: 'sub-cs-2', label: '자주하는 질문 (FAQ)', actionType: 'board', target: 'faq-board' },
          { id: 'sub-cs-3', label: '1:1 대량 납품 견적 상담', actionType: 'quote', target: 'quote-board' },
          { id: 'sub-cs-4', label: '사업자 무료 샘플 신청', actionType: 'sample', target: 'sample-board' },
          { id: 'sub-cs-5', label: '고객센터 유선 전화안내', actionType: 'scroll', target: 'footer-section' }
        ]
      }
    ],

    // Multi-Slide Hero Banners
    banners: [
      {
        id: 'banner-1',
        tagline: 'SINCE 1996 · 30년 전통 비법',
        title: '보쌈의 맛을 완성하는 특별한 김치',
        subtitle: '푸드홈 보쌈무김치',
        description: '정성스럽게 만든 맛, 변함없는 품질. 물 생김 없이 끝까지 아삭한 특허 수분제어 절임 공법으로 전국 480여 개 외식 매장에 매일 아침 공급합니다.',
        subDescription: '우리 가족이 먹는 안심 위생시설 제조 · 전국 당일 냉장 직배송',
        imageUrl: './images/banner_bossam.jpg',
        mobileImageUrl: './images/banner_bossam.jpg',
        primaryButtonText: '제품 자세히 보기',
        primaryButtonLink: 'products',
        primaryButtonAction: 'products',
        secondaryButtonText: '무료 샘플 1kg 신청',
        secondaryButtonLink: 'sample-board',
        secondaryButtonAction: 'sample',
        order: 1,
        isActive: true
      },
      {
        id: 'banner-2',
        tagline: 'CHEF\'S SIGNATURE RECIPE',
        title: '굴보쌈과 수육의 풍미를 높이는',
        subtitle: '감칠맛 비법 김칫속(보쌈속)',
        description: '국내산 배와 양파를 갈아 넣은 천연 단맛과 광천 토굴 젓갈의 깊은 감칠맛. 주방의 수고를 덜어주는 명품 속양념.',
        subDescription: '100% 국내산 엄선 농산물 계약재배 · 프랜차이즈 맞춤 납품',
        imageUrl: './images/banner_kimchi_paste.jpg',
        mobileImageUrl: './images/banner_kimchi_paste.jpg',
        primaryButtonText: '김칫속 라인업 보기',
        primaryButtonLink: 'products',
        primaryButtonAction: 'products',
        secondaryButtonText: '1:1 대량 납품 견적 상담',
        secondaryButtonLink: 'quote-board',
        secondaryButtonAction: 'quote',
        order: 2,
        isActive: true
      },
      {
        id: 'banner-3',
        tagline: 'B2B WHOLESALE & SUPPLY',
        title: '전국 480개 외식 파트너의 선택',
        subtitle: '프랜차이즈 맞춤 납품 & 식자재 공급',
        description: '물류 편차 없는 균일한 품질, 철저한 안심 위생 관리. 사업자 고객님께 1kg 무료 샘플팩을 전액 무료로 배송해 드립니다.',
        subDescription: '식자재 원가 절감 솔루션 · 가맹점 만족도 98.8%',
        imageUrl: './images/banner_b2b.jpg',
        mobileImageUrl: './images/banner_b2b.jpg',
        primaryButtonText: '무료 샘플 신청하기',
        primaryButtonLink: 'sample-board',
        primaryButtonAction: 'sample',
        secondaryButtonText: '대량 납품 견적 상담',
        secondaryButtonLink: 'quote-board',
        secondaryButtonAction: 'quote',
        order: 3,
        isActive: true
      }
    ],

    // Legacy single hero fields kept for backwards-compatibility
    heroTitle: '보쌈의 맛을 완성하는 특별한 김치',
    heroHighlight: '푸드홈 명품 보쌈무김치',
    heroSubtitle: 'FOODHOME KOREAN TRADITIONAL RADISH KIMCHI',
    heroDescription: '정성스럽게 만든 맛, 변함없는 품질. 우리 가족이 먹을 수 있는 안전한 푸드를 제공하는 푸드홈 입니다.',
    heroImageUrl: './images/banner_bossam.jpg',
    heroBadges: [
      '우리 가족이 먹는 안심 위생시설 제조',
      '100% 국내산 엄선 농산물 계약재배',
      '특허받은 꼬들꼬들 수분제어 절임공법',
      '전국 콜드체인 익일 직배송 시스템'
    ],
    stats: [
      { label: '전국 가맹·식당 납품처', value: '480', unit: '개소+', sublabel: '프랜차이즈 및 맛집' },
      { label: '일일 김치 생산량', value: '4.2', unit: '톤', sublabel: '스마트 청결 자동화 라인' },
      { label: '사업자 재발주율', value: '98.8', unit: '%', sublabel: '맛과 품질의 신뢰' },
      { label: '업계 업력 및 노하우', value: '30', unit: '년', sublabel: '전통 비법 전수' }
    ],

    // Company & Contact Details
    companyName: '주식회사 푸드홈 (FOODHOME Co., Ltd.)',
    ceoName: '김진성',
    businessNumber: '312-81-94821',
    mailOrderNumber: '제 2023-충북진천-0145호',
    haccpNumber: '식품제조가공업 영업등록 제 2021-04-9218호',
    factoryAddress: '충청북도 진천군 덕산읍 신척산단로 128 푸드홈 식품가공 제1·2공장',
    hqAddress: '서울특별시 송파구 백제고분로 38길 19 푸드홈 B2B 사업본부',
    phone: '1588-7241',
    fax: '043-535-7242',
    email: 'contact@foodhome.co.kr',
    csHours: '평일 08:30 ~ 17:30 (토/일/공휴일 휴무)',
    lunchHours: '점심시간 12:00 ~ 13:00',

    // Story
    storyTitle: '원칙과 타협하지 않는 30년, 김치 한 줄기에 담은 정성',
    storySubtitle: '왜 전국 1등 족발·보쌈 전문점들은 푸드홈을 선택할까요?',
    storyParagraph1: '보쌈과 족발의 맛을 결정하는 것은 고기뿐만이 아닙니다. 첫 입을 장식하고 기름진 풍미를 깔끔하게 잡아주는 보쌈무김치와 깊은 감칠맛의 김칫속이야말로 손님이 다시 찾게 만드는 진짜 비결입니다.',
    storyParagraph2: '푸드홈은 계절마다 최적의 산지(제주 월동무, 강원 고랭지무)를 엄선하고, 전통 엿기름과 청결 태양초로 숙성한 황금 양념을 매일 새벽 직접 버무려 갓 담근 듯 신선한 상태로 공급합니다.',
    coreValues: [
      {
        title: '특허받은 수분 제어 공법',
        desc: '시간이 지나도 물이 흥건해지지 않고 꼬들꼬들하고 아삭한 특유의 보쌈무 식감을 장시간 완벽히 유지합니다.',
        icon: 'Sparkles'
      },
      {
        title: '100% 우리 농산물 계약재배',
        desc: '강원 고랭지 및 제주 청정 월동무, 충남 영양 고춧가루, 전남 신안 천일염 등 엄격한 국산 식재료만을 고집합니다.',
        icon: 'ShieldCheck'
      },
      {
        title: '철저한 안심 클린 위생 생산',
        desc: '에어샤워, 자외선 살균, 3단 버블 세척, 금속 이물 검출기 통과 등 우리 가족을 위한 위생 안전 시스템을 완비했습니다.',
        icon: 'Award'
      },
      {
        title: '전국 냉장 콜드체인 직배송',
        desc: '생산 즉시 전용 저온 냉장차량을 통해 주문 다음 날 매장 주방까지 가장 신선하게 도착합니다.',
        icon: 'Truck'
      }
    ],

    // Facility Media Items
    facilityItems: [
      {
        id: 'fac-1',
        title: '스마트 첨단 클린룸 가공실',
        desc: '공기 중 미세먼지와 바이러스를 차단하는 헤파필터 양압 공조 시스템 및 에어샤워 라인',
        imageUrl: './images/facility_cleanroom.jpg',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vegetables-being-washed-in-a-sink-42939-large.mp4',
        category: '클린룸'
      },
      {
        id: 'fac-2',
        title: '3단 마이크로 버블 세척 라인',
        desc: '초음파 버블 수류로 절임 전 원물 무 표면의 잔류 이물질을 3단계 완벽 세척',
        imageUrl: './images/facility_bubble_wash.jpg',
        category: '세척라인'
      },
      {
        id: 'fac-3',
        title: '3D X-ray & 초정밀 금속검출기',
        desc: '포장 직전 미세 금속 이물질 및 비금속 이물까지 전수 스캔 통과',
        imageUrl: './images/facility_xray.jpg',
        category: '품질검사'
      },
      {
        id: 'fac-4',
        title: '2중 안심 진공포장 & 콜드체인 출하장',
        desc: '특수 질소충전 2중 필름 실링 및 0~5℃ 저온 냉장차량 직배송 출고장',
        imageUrl: './images/facility_packing.jpg',
        category: '포장·물류'
      }
    ],

    // FAQ Items
    faqItems: [
      {
        id: 'faq-1',
        question: '무료 샘플 1kg 신청 자격과 배송비는 어떻게 되나요?',
        answer: '현재 족발, 보쌈, 삼겹살, 순대국밥 등 일반음식점을 운영 중이시거나 신규 창업을 준비 중인 사업자분이라면 누구나 신청 가능합니다. 제품값은 물론 우체국 냉장 택배비까지 푸드홈이 100% 전액 지원해 드립니다.',
        category: '샘플신청'
      },
      {
        id: 'faq-2',
        question: '정기 납품 시 최소 발주 단위와 배송 주기는 어떻게 되나요?',
        answer: '최소 발주 단위는 5kg 또는 10kg 박스 단위이며, 수도권 및 전국 매장으로 주 2~6회 원하시는 주기별 맞춤 직배송이 가능합니다. 매월 300kg 이상 소진하시는 대형 매장 및 프랜차이즈의 경우 특별 계약 단가가 적용됩니다.',
        category: '납품·단가'
      },
      {
        id: 'faq-3',
        question: '푸드홈 보쌈무김치는 왜 시간이 지나도 물이 흥건해지지 않나요?',
        answer: '푸드홈 고유의 \'특허 수분제어 절임공법\'을 적용하여 무 속 수분을 이상적인 삼투압 비율로 조절하였기 때문입니다. 보쌈 고기 접시 위에 올려두어도 고기가 젖지 않고 첫 입부터 마지막 입까지 꼬들꼬들 아삭한 식감이 유지됩니다.',
        category: '보관·유통'
      },
      {
        id: 'faq-4',
        question: '프랜차이즈 브랜드 전용 레시피(OEM) 개발도 가능한가요?',
        answer: '네, 가능합니다. 브랜드의 콘셉트에 따라 매운맛 강도, 단맛 배합, 규격 포장지 전용 로고 인쇄(PB 라벨링) 등 맞춤형 생산을 진행해 드립니다. 현재 전국 70여 개 이상 가맹 브랜드에 맞춤형 김치를 공급하고 있습니다.',
        category: '납품·단가'
      }
    ],

    // 1. Company About Page Content (4 Detailed Subpages)
    aboutBannerImage: './images/banner_bossam.jpg',
    aboutTitle: '안전하고 정직한 먹거리, 푸드홈 이야기',
    aboutDescription: '우리 가족이 안심하고 먹을 수 있는 프리미엄 보쌈무김치와 비법 김칫속을 정직한 원재료로 빚어냅니다.',
    ceoGreeting: '안녕하십니까, 주식회사 푸드홈 대표이사 김진성입니다.\n\n푸드홈은 지난 30년간 전국 480여 개 외식 프랜차이즈 및 유명 보쌈·족발 맛집의 든든한 식자재 파트너로 성장해 왔습니다.\n\n외식업 대표님들의 가장 큰 고충인 ‘시간 경과에 따른 물 생김’과 ‘계절별 무의 편차’를 해결하기 위해, 푸드홈은 독자적인 특허 수분제어 절임 공법을 개발하여 언제나 꼬들꼬들하고 청량한 김치를 균일하게 공급하고 있습니다.\n\n원가와 타협하지 않는 100% 국산 농산물 계약재배와 청결한 위생 관리로, 대표님의 매장이 손님들에게 언제나 찬사를 받을 수 있도록 최고의 파트너가 되겠습니다.',
    ceoImageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
    ceoSubtitle: 'SINCE 1996 · 30년의 고집',
    ceoTitle: '우리 가족이 먹는다는 마음으로, 끝까지 아삭하고 정직한 맛을 지켜갑니다.',
    ceoHighlight: '안전하고 정직한 김치만 만듭니다',
    ceoRole: '대표이사',
    ceoSignatureImage: '',
    historyItems: [
      { year: '1996', title: '푸드홈 식품연구소 설립', desc: '전통 비법 김치 양념 및 절임 공법 연구 개시' },
      { year: '2010', title: '특허 수분제어 삼투압 절임공법 등록', desc: '물이 생기지 않는 꼬들꼬들 보쌈무김치 기술 특허 취득' },
      { year: '2018', title: '충북 진천 스마트 클린 제조센터 준공', desc: '일일 4.2톤 규모의 안심 위생 자동화 생산 라인 가동' },
      { year: '2023', title: '전국 480개 외식 파트너사 돌파', desc: '콜드체인 전국 익일 직배송 물류망 확장' }
    ],

    // Subpage 2: Production & Logistics
    systemTitle: '스마트 자동화 생산 공정 프로세스',
    systemDescription: '산지 직송부터 매장 주방 도착까지, 푸드홈만의 6단계 안심 품질 관리 시스템을 운영합니다.',
    systemFacilityImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    systemLogisticsImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    systemSteps: [
      {
        step: 'STEP 01',
        title: '계약재배 산지 원료 입고',
        desc: '강원도 평창 고랭지무(여름) 및 제주 서귀포 청정 월동무(겨울) 산지에서 당일 수확된 최상급 원무만을 선별 입고합니다.',
        img: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=600&q=80'
      },
      {
        step: 'STEP 02',
        title: '3단 마이크로 버블 세척',
        desc: '고압 미세 기포 발생 장치를 통해 잔류 농약과 흙, 미세 이물질을 3단계에 걸쳐 완벽하게 세척 정단합니다.',
        img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
      },
      {
        step: 'STEP 03',
        title: '특허 수분제어 절임 공정',
        desc: '신안 천일염의 정확한 염도 비율과 푸드홈 특허 공법을 적용하여, 시간이 흘러도 물러짐 없는 꼬들꼬들함을 완성합니다.',
        img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
      },
      {
        step: 'STEP 04',
        title: '황금 배합비 비법 버무림',
        desc: '30년 전통 엿기름과 청결 태양초 고춧가루로 저온 숙성된 특제 양념을 매일 새벽 황금 비율로 균일하게 버무립니다.',
        img: 'https://images.unsplash.com/photo-1583032015879-67990c74900a?auto=format&fit=crop&w=600&q=80'
      },
      {
        step: 'STEP 05',
        title: '금속검출기 & 정밀 검수',
        desc: '포장 직전 고감도 금속 검출기와 중량 체크기를 전량 통과시켜 단 0.1%의 규격 미달 및 이물 유입도 철저히 차단합니다.',
        img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80'
      },
      {
        step: 'STEP 06',
        title: '냉장 콜드체인 익일 직배송',
        desc: '0~5℃ 정온 유지 전용 특장차량으로 발송되어 주문 다음 날 전국 매장 주방까지 가장 신선한 상태로 직배송됩니다.',
        img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
      }
    ],

    // Subpage 3: Permits & Certifications
    permitsTitle: '공식 영업등록 및 품질 안전 인허가',
    permitsDescription: '식품위생법 및 관련 법령에 따른 엄격한 정식 인허가를 필하여 안심하고 납품받으실 수 있습니다.',
    permitsList: [
      {
        title: '식품제조가공업 영업등록',
        issuer: '충청북도 진천군청',
        number: '제 2021-04-9218호',
        desc: '식품위생법 제37조에 따른 정식 식품가공 및 반찬류 제조 시설 적합 인가',
        status: '정상 등록 유지'
      },
      {
        title: '사업자등록증',
        issuer: '국세청 (동청주세무서)',
        number: '312-81-94821',
        desc: '주식회사 푸드홈 정식 법인 사업자등록 (업태: 제조업 / 종목: 김치 및 절임식품)',
        status: '법인 정식 인가'
      },
      {
        title: '통신판매업 신고증',
        issuer: '진천군 일자리경제과',
        number: '제 2023-충북진천-0145호',
        desc: '전자상거래 등에서의 소비자보호에 관한 법률에 따른 통신판매 정식 신고',
        status: '정식 신고 완료'
      },
      {
        title: '자가품질위탁시험 성적서',
        issuer: '공인 식품위생검사기관',
        number: '정기 분기별 시험 전항목 적합',
        desc: '대장균군, 타르색소, 납, 카드뮴, 보존료 일체 불검출 규격 적합 판정',
        status: '적합 판정'
      },
      {
        title: '생산물 배상책임보험 (PL보험)',
        issuer: '현대해상화재보험',
        number: '보상한도 1억원 가입',
        desc: '푸드홈에서 생산·공급한 식품으로 인한 사고 발생 시 전액 배상 보장',
        status: '가입 유지 중'
      },
      {
        title: '원산지 증명 및 계약재배 협약서',
        issuer: '농협 및 산지 영농조합',
        number: '강원도 평창 / 제주 서귀포',
        desc: '100% 국산 농산물 원료 수급 증명 및 잔류농약 불검출 검사 확인서',
        status: '계약 체결 완료'
      }
    ],

    // Subpage 4: Location & Facilities
    locationTitle: '오시는 길 & 제조 가공 센터',
    locationDescription: '충북 진천 식품제조가공 공장 및 물류센터 안내입니다.',
    locationGuide: '충청북도 진천군 덕산읍 신척산단로 128 (신척산업단지 내 푸드홈 식품가공센터)',
    locationMapEmbed: '',
    transitInfo: '중부고속도로 진천IC에서 차량 10분, 신척일반산업단지 메인 진입로',
    parkingInfo: '방문객 전용 무료 주차장 완비 (대형 화물트럭 및 냉장 탑차 동시 주차 가능)',

    // 2. Manufacturing Process Page Content
    processTitle: '푸드홈만의 4단계 안심 제조공정',
    processSubtitle: '철저한 위생 관리와 특허 기술로 완성되는 프리미엄 품질',
    processDescription: '엄선된 100% 국내산 무 선별부터 초음파 세척, 특허 수분제어 절임, 2중 진공 포장까지 타협 없는 원칙을 지킵니다.',
    processSteps: [
      { step: 1, title: '산지직송 100% 국내산 무 선별', desc: '계약재배된 단단하고 수분감 풍부한 최고급 무만을 엄선 선별합니다.', imageUrl: './images/process_step1.jpg', badge: '엄선 원물' },
      { step: 2, title: '초음파 버블 3단계 무잔류 세척', desc: '표면의 미세 이물질과 잔류 농약을 초음파 미세기포로 완벽 세척합니다.', imageUrl: './images/process_step2.jpg', badge: '청결 세척' },
      { step: 3, title: '특허 수분제어 저온 삼투압 절임', desc: '푸드홈만의 특허 공법으로 무 속 과잉 수분을 제어해 끝까지 아삭합니다.', imageUrl: './images/process_step3.jpg', badge: '특허 공법' },
      { step: 4, title: '황금비율 양념 버무림 & 진공포장', desc: '광천 토굴액젓과 태양초 고춧가루로 버무려 저온 콜드체인 출하합니다.', imageUrl: './images/process_step4.jpg', badge: '안심 출하' }
    ],
    qualityNotice: '전 생산 라인 금속검출기 전수 검사 통과 및 0~5℃ 콜드체인 직배송',

    // 3. Wholesale Guide Page Content
    wholesaleTitle: '외식업 대량 납품 & 프랜차이즈 맞춤 공급',
    wholesaleSubtitle: '안정적인 품질과 원가 경쟁력, 푸드홈과 함께하세요',
    wholesaleDescription: '단일 매장부터 100개 이상 대형 프랜차이즈까지, 주방의 인건비를 절감하고 균일한 맛을 보장합니다.',
    deliveryRegions: '수도권 및 전국 전 지역 (제주 및 도서산간 별도 문의)',
    deliveryMethods: '전국 냉장 콜드체인 익일 직배송 / 물류센터 정기 입고',
    deliverySteps: [
      { step: 1, title: '샘플 신청 & 품질 검증', desc: '사업자 무료 1kg 샘플팩을 먼저 받아보시고 품질을 확인하세요.' },
      { step: 2, title: '1:1 견적 상담 & 맞춤 단가 협의', desc: '예상 월 소진량에 따른 최적의 납품 단가를 제안해 드립니다.' },
      { step: 3, title: '발주 주기 확정 & 정기 직배송', desc: '원하시는 요일과 주기에 맞추어 매장 냉장고까지 신선하게 공급됩니다.' }
    ],
    wholesaleImages: ['./images/banner_b2b.jpg', './images/banner_bossam.jpg'],

    // 4. Customer Service Content
    csNoticeTitle: '푸드홈 B2B 파트너 고객센터',
    csNoticeDesc: '주문, 배송, 대량 견적 및 OEM 상담은 푸드홈 전담팀이 빠르고 친절하게 안내해 드립니다.',
    sampleGuideText: '외식업 사업자등록증이 있으신 대표님께 1kg 무료 샘플팩(배송비 전액 지원)을 보내드립니다.',
    quoteGuideText: '월 100kg 이상 정기 납품 및 프랜차이즈 PB/OEM 전용 단가 상담을 지원합니다.',

    // 5. FAQ Dynamic Categories
    faqCategories: [
      { id: 'cat-sample', name: '샘플신청', order: 1, visible: true },
      { id: 'cat-wholesale', name: '납품·단가', order: 2, visible: true },
      { id: 'cat-storage', name: '보관·유통', order: 3, visible: true },
      { id: 'cat-delivery', name: '배송안내', order: 4, visible: true },
      { id: 'cat-safety', name: '위생·안전', order: 5, visible: true },
      { id: 'cat-etc', name: '기타문의', order: 6, visible: true }
    ],

    // 6. Product Dynamic Categories
    productCategoriesList: [
      {
        id: 'cat-bossam',
        name: '보쌈무김치',
        englishName: 'BOSSAM RADISH KIMCHI',
        description: '물 생김 없이 끝까지 아삭하고 꼬들한 특허 절임 공법의 푸드홈 대표 시그니처',
        imageUrl: './images/prod_bossam_mu.jpg',
        features: ['특허 수분제어 공법', '100% 국내산 제철무', '안심 위생시설 제조'],
        order: 1,
        visible: true
      },
      {
        id: 'cat-seasoning',
        name: '김칫속/양념',
        englishName: 'ARTISAN KIMCHI PASTE',
        description: '국내산 배·양파 생과일의 천연 단맛과 광천 토굴 젓갈의 깊은 감칠맛을 품은 속양념',
        imageUrl: './images/prod_kimchi_sok.jpg',
        features: ['생과일 천연 단맛', '광천 토굴 새우젓', '수육·생굴 최상의 궁합'],
        order: 2,
        visible: true
      },
      {
        id: 'cat-bulk',
        name: '업소용 대용량',
        englishName: 'B2B BULK PACKAGE',
        description: '전국 480개 외식 가맹점 공급용 경제형 규격. 특수 진공 실링으로 신선도 완벽 유지',
        imageUrl: './images/prod_bulk_10kg.jpg',
        features: ['10kg 진공 안심포장', '정기 직배송 단가 혜택', '프랜차이즈 맞춤 납품'],
        order: 3,
        visible: true
      },
      {
        id: 'cat-pouch',
        name: '소포장/밀키트',
        englishName: 'POUCH & MEAL KIT',
        description: '배달전문점, 밀키트 세트용 위생 실링팩. 재포장 없는 간편한 서빙 및 가정용 소포장',
        imageUrl: './images/prod_pouch_500g.jpg',
        features: ['500g 신선 위생 파우치', '소형 매장 적합', '네이버 스마트스토어 판매'],
        order: 4,
        visible: true
      }
    ],

    // 7. Company About Subpages Configuration
    companySubpages: [
      {
        id: 'intro',
        menuLabel: 'CEO 인사말',
        badgeTitle: 'CEO 인사말',
        title: '우리 가족이 먹는다는 마음으로,\n끝까지 아삭하고 정직한 맛을 지켜갑니다.',
        subtitle: 'SINCE 1996 · 30년의 고집',
        description: '원가와 타협하지 않는 100% 국산 농산물과 특허 수분제어 공법으로 최고의 파트너가 되겠습니다.',
        visible: true,
        order: 1
      },
      {
        id: 'history',
        menuLabel: '회사 연혁',
        badgeTitle: 'HISTORY',
        title: '30년 전통 푸드홈의 발자취',
        subtitle: 'TRADITION & INNOVATION',
        description: '1996년 설립 이래 대한민국 대표 김치 전문 제조업체로 성장해 온 역사입니다.',
        visible: true,
        order: 2
      },
      {
        id: 'system',
        menuLabel: '생산 & 물류시스템',
        badgeTitle: 'PRODUCTION SYSTEM',
        title: '스마트 자동화 생산 공정 프로세스',
        subtitle: 'CLEAN AUTOMATION',
        description: '산지 직송부터 매장 주방 도착까지, 푸드홈만의 6단계 안심 품질 관리 시스템을 운영합니다.',
        visible: true,
        order: 3
      },
      {
        id: 'permits',
        menuLabel: '인허가사항',
        badgeTitle: 'LEGAL & CERTIFICATIONS',
        title: '공식 영업등록 및 품질 안전 인허가',
        subtitle: 'SAFETY & TRUST',
        description: '식품위생법 및 관련 법령에 따른 엄격한 정식 인허가를 필하여 안심하고 납품받으실 수 있습니다.',
        visible: true,
        order: 4
      },
      {
        id: 'location',
        menuLabel: '오시는 길',
        badgeTitle: 'LOCATION',
        title: '오시는 길 & 제조 가공 센터',
        subtitle: 'HEADQUARTERS & FACTORY',
        description: '충청북도 진천군 덕산읍 신척산단로 128 (신척산업단지 내 푸드홈 식품가공센터)',
        visible: true,
        order: 5
      }
    ],

    // 8. Main Page Sections Configuration
    mainSections: [
      {
        id: 'hero',
        name: '메인 상단 슬라이드 배너',
        badge: 'HERO BANNER',
        title: '메인 비주얼 배너',
        description: '메인 화면 최상단 롤링 배너 슬라이더',
        visible: true,
        order: 1
      },
      {
        id: 'productSlider',
        name: '대표 제품 슬라이더',
        badge: 'SIGNATURE PRODUCT SLIDER',
        title: '푸드홈 대표 제품 둘러보기',
        description: '30년 전통 비법과 특허 수분제어 공법으로 빚어낸 명품 보쌈무김치 & 비법 김칫속',
        visible: true,
        order: 2
      },
      {
        id: 'sampleRealtimeStatus',
        name: '실시간 샘플 접수 현황 바',
        badge: 'REALTIME STATUS',
        title: '전국 외식업소 실시간 무료 샘플 접수 현황',
        description: '매일 아침 갓 담근 신선한 김치만을 보내드립니다',
        visible: true,
        order: 3
      },
      {
        id: 'actionBanners',
        name: 'B2B 퀵 서비스 액션 배너',
        badge: 'B2B QUICK ACTIONS',
        title: '외식업 대표님을 위한 푸드홈 전용 지원 서비스',
        description: '안심 샘플 신청부터 대량 정기 납품까지 원스톱으로 지원합니다',
        visible: true,
        order: 4
      },
      {
        id: 'productCategories',
        name: '제품 카테고리 안내',
        badge: 'FOOD CATEGORIES',
        title: '전문 외식업소를 위한 4대 제품 라인업',
        description: '업종과 주방 운영 형태에 맞춰 최적화된 패키지와 레시피를 제안합니다.',
        visible: true,
        order: 5
      },
      {
        id: 'products',
        name: '대표 제품 카탈로그 목록',
        badge: 'PRODUCT CATALOG',
        title: '푸드홈 전체 제품 카탈로그',
        description: '원재료 타협 없이 100% 국산 농산물로 정직하게 제조합니다.',
        visible: true,
        order: 6
      },
      {
        id: 'features',
        name: '30년 전통 비법 & 브랜드 스토리',
        badge: 'BRAND HERITAGE & PHILOSOPHY',
        title: '30년 전통 비법과 타협 없는 원칙',
        description: '시간이 흘러도 물 생김 없는 특허 수분제어 절임 공법',
        visible: true,
        order: 7
      },
      {
        id: 'process',
        name: '안심 위생 제조 공정',
        badge: 'CLEAN AUTOMATION PROCESS',
        title: '엄격한 기준의 스마트 클린 제조 시스템',
        description: '산지 계약재배 입고부터 에어샤워, 금속검출기 통과까지 철저하게 관리합니다.',
        visible: true,
        order: 8
      },
      {
        id: 'reviews',
        name: '외식업 파트너 후기 & 신뢰 지표',
        badge: 'PARTNER STORIES',
        title: '전국 480여 개 외식 파트너의 생생한 찬사',
        description: '고기 맛을 살려주는 보쌈무김치와 김칫속으로 매장 객단가가 상승했습니다.',
        visible: true,
        order: 9
      },
      {
        id: 'inquiry',
        name: '하단 1kg 무료 샘플 간편 신청',
        badge: 'FREE 1KG SAMPLE',
        title: '직접 맛을 보시고 결정하세요. 1kg 무료 샘플팩 신청 접수 중',
        description: '사업자등록증을 보유하신 모든 외식업 대표님께 푸드홈 시그니처 보쌈무김치를 무료로 발송해 드립니다.',
        buttonText: '무료 샘플 1kg 신청하기',
        buttonLink: 'sample-board-write',
        visible: true,
        order: 10
      }
    ]
  },
  theme: {
    primaryColor: '#872D35', // Main Deep Burgundy
    accentColor: '#B64346',  // Sub Red
    darkBrown: '#332525',    // Dark Brown
    creamWhite: '#FAF8F5',   // Cream White
    warmGrey: '#EEEAE6',     // Warm Grey
    fontFamily: 'pretendard',
    cardRadius: 'rounded-xl',
    sectionsVisible: {
      hero: true,
      stats: false, // Hidden on main page to keep vertical height compact
      productSlider: true,
      actionBanners: true,
      productCategories: false, // Streamlined main landing page as requested
      features: false,          // Streamlined main landing page as requested
      products: false,          // Streamlined main landing page as requested
      process: false,           // Streamlined main landing page as requested
      b2bHighlights: false,     // Streamlined main landing page as requested
      reviews: false,           // Streamlined main landing page as requested
      faq: false,               // Streamlined main landing page as requested
      posts: false,             // Streamlined main landing page as requested
      inquiry: false            // Streamlined main landing page as requested
    }
  },
  products: [
    {
      id: 'prod-1',
      name: '아삭달콤 명품 보쌈무김치 (업소용)',
      subtitle: '전국 족발·보쌈 프랜차이즈 납품 1위 시그니처 상품',
      category: '보쌈무김치',
      tag: 'BEST B2B 1위',
      weight: '5kg / 10kg 박스 단위',
      storage: '냉장보관 (0~5℃)',
      shelfLife: '제조일로부터 30일 (권장 최적소비 15일 이내)',
      ingredients: '국내산 절임무 75%, 고춧가루(국내산), 마늘(국내산), 멸치액젓, 물엿, 사과·배 퓨레, 생강, 천일염',
      description: '제철 제주 월동무를 푸드홈 고유의 수분 제어 공법으로 절여 시간이 흘러도 물러짐 없이 끝까지 아삭하고 꼬들합니다. 감칠맛 도는 은은한 단맛과 깔끔한 매콤함으로 기름진 수육, 족발과 최상의 조화를 이룹니다.',
      imageUrl: './images/prod_bossam_mu.jpg',
      isPopular: true,
      isRecommended: true,
      bulkPriceGuide: '대량 주문 시 납품 단가 협의 (사업자 회원 전용가 적용)'
    },
    {
      id: 'prod-2',
      name: '감칠맛 폭발 수제 보쌈김칫속 (보쌈속양념)',
      subtitle: '굴보쌈, 생선회, 수육을 업그레이드하는 비법 속양념',
      category: '김칫속/양념',
      tag: '셰프 추천',
      weight: '3kg / 5kg / 10kg 전용팩',
      storage: '냉장보관 (0~5℃)',
      shelfLife: '제조일로부터 45일',
      ingredients: '국내산 배, 양파, 영양 고춧가루, 광천 토굴 멸치새우젓, 다진마늘, 매실발효액, 찹쌀풀, 볶음참깨',
      description: '신선한 굴보쌈이나 수육 접시 위에 얹어 나가는 바로 그 감칠맛 풍부한 명품 김칫속입니다. 사과·배 생과일을 갈아 넣어 인위적이지 않은 천연 단맛과 30년 비법 육수의 깊고 진한 풍미를 선사합니다.',
      imageUrl: './images/prod_kimchi_sok.jpg',
      isPopular: true,
      isRecommended: false,
      bulkPriceGuide: '10kg 이상 정기 배송 시 추가 12% 단가 할인 제공'
    },
    {
      id: 'prod-3',
      name: '정갈한 남도식 꼬들 무말랭이 무김치',
      subtitle: '전통 엿기름과 청결 태양초로 버무린 씹는 맛의 정수',
      category: '보쌈무김치',
      tag: '전통 명품',
      weight: '3kg / 5kg 용기형',
      storage: '냉장보관 (0~5℃)',
      shelfLife: '제조일로부터 60일',
      ingredients: '건조무(국내산) 68%, 태양초 고춧가루, 멸치육젓, 조청, 생강농축액, 대파, 볶은 통깨',
      description: '햇볕에 바싹 말린 깨끗한 국산 무를 정성껏 불려 잡내를 제거하고, 깊은 감칠맛의 남도식 양념장에 치대어 꼬들꼬들한 저작감을 극대화했습니다. 백반, 설렁탕, 칼국수집 찬으로도 인기 만점입니다.',
      imageUrl: './images/prod_mumalaengi.jpg',
      isPopular: false,
      isRecommended: true,
      bulkPriceGuide: '프랜차이즈 전용 규격 포장 및 라벨링 OEM 가능'
    },
    {
      id: 'prod-4',
      name: '프랜차이즈 전용 대용량 맞춤형 보쌈무 10kg',
      subtitle: '월 500kg 이상 소진 대형 매장 및 물류센터 전용',
      category: '업소용 대용량',
      tag: '대형 매장 전용',
      weight: '10kg 진공 벌크백 (2중 안심실링)',
      storage: '냉장보관 (0~5℃)',
      shelfLife: '제조일로부터 25일',
      ingredients: '국내산 절임무 76%, 고춧가루, 액젓혼합, 양파, 마늘, 사과엑기스',
      description: '회전율이 빠른 대형 족발보쌈 전문점과 프랜차이즈 물류센터를 위한 경제형 대용량 패키지입니다. 특수 질소 충전 진공 포장으로 운송 중 팽창 및 가스 발생을 최소화하여 완벽한 품질을 유지합니다.',
      imageUrl: './images/prod_bulk_10kg.jpg',
      isPopular: true,
      isRecommended: true,
      bulkPriceGuide: '월 정기 납품 계약 시 파격 물류비 무료 지원'
    },
    {
      id: 'prod-5',
      name: '신선 소포장 보쌈무김치 500g / 1kg 파우치',
      subtitle: '배달 전문점 1인 세트 및 밀키트 번들 납품 최적화',
      category: '소포장/밀키트',
      tag: '배달/소량 포장',
      weight: '500g / 1kg 스탠드 파우치',
      storage: '냉장보관 (0~5℃)',
      shelfLife: '제조일로부터 30일',
      ingredients: '국내산 무, 고춧가루, 사과, 마늘, 생강, 정제염, 액젓',
      description: '배달 전문 매장에서 소분할 필요 없이 바로 손님에게 전달할 수 있는 위생적인 소포장 형태입니다. 배달 리뷰 평점을 올려주는 깔끔한 포장과 일정한 맛을 보장합니다.',
      imageUrl: './images/prod_pouch_500g.jpg',
      isPopular: false,
      isRecommended: false,
      bulkPriceGuide: '1박스(20팩) 단위 주문 가능'
    },
    {
      id: 'prod-6',
      name: '칼칼하고 시원한 알타리 총각무김치 (업소용)',
      subtitle: '국밥집, 족발집, 수육집 인기 사이드 찬',
      category: '보쌈무김치',
      tag: '계절 별미',
      weight: '5kg / 10kg',
      storage: '냉장보관 (0~5℃)',
      shelfLife: '제조일로부터 45일',
      ingredients: '알타리무(국내산), 멸치젓, 다시마육수, 찹쌀풀, 고춧가루',
      description: '단단하고 알싸한 토종 알타리무를 멸치다시마 비법 육수에 절여 시원하고 개운한 뒷맛이 일품입니다. 기름기 많은 고기 요리와 곁들이기에 최적화된 계절 별미 김치입니다.',
      imageUrl: './images/prod_altari.jpg',
      isPopular: false,
      isRecommended: false,
      bulkPriceGuide: '식자재 유통 도매상 특별 공급가 별도 문의'
    }
  ],
  posts: [
    {
      id: 'post-1',
      title: '[공지] 푸드홈 제2공장 클린룸 확장 준공 및 위생 관리 점검 완료',
      category: '공지사항',
      author: '품질관리팀',
      date: '2026-03-12',
      content: '늘 푸드홈을 믿고 찾아주시는 전국 외식업 대표님들께 감사드립니다. 충북 진천 본사에 제2공장 첨단 자동화 클린룸 증축이 완료되었습니다. 최신 에어샤워 시스템, 3단계 마이크로 버블 세척 라인, 3D 광학 X-ray 이물질 선별기를 도입하여 하루 최대 10톤 규모의 안전하고 위생적인 보쌈무김치를 중단 없이 생산·공급할 수 있는 역량을 확보하였습니다.',
      readCount: 1420,
      thumbnail: './images/facility_cleanroom.jpg',
      tags: ['품질경영', '제2공장', '위생관리', '안전제조'],
      isPinned: true
    },
    {
      id: 'post-2',
      title: '[레시피] 보쌈 전문점 사장님이 극찬한 잡내 없는 삼겹 수육 삶기와 보쌈무 세팅 비법',
      category: '조리·활용 레시피',
      author: '메뉴개발팀',
      date: '2026-02-28',
      content: '수육을 삶을 때 된장과 통후추, 대파 뿌리와 월계수 잎 외에도 사과 반쪽과 소주 반 컵을 넣어주면 고기 속 기름기가 깔끔하게 정돈됩니다. 삶은 직후 찬 얼음물에 3초간 담갔다 썰어내면 겉은 쫄깃하고 속은 부드럽습니다. 접시 중앙에 푸드홈 보쌈무김치를 풍성하게 담고 참깨와 송송 썬 쪽파를 올려 완성해보세요.',
      readCount: 3840,
      thumbnail: './images/banner_bossam.jpg',
      tags: ['보쌈삶는법', '수육황금레시피', '식당노하우', '매출증대'],
      isPinned: true
    },
    {
      id: 'post-3',
      title: '[B2B스토리] 전국 75개 가맹 족발 프랜차이즈 \'한양왕족발\' 푸드홈 단독 공급 체결',
      category: 'B2B 납품스토리',
      author: '영업기획본부',
      date: '2026-02-14',
      content: '가맹점별로 김치 맛 편차가 심해 고민이 깊으셨던 한양왕족발 본사와 3개월간의 블라인드 테스트 및 샘플 검증을 거쳐 전 가맹점 단독 공급 협약을 체결했습니다. 주방 인건비 절감과 균일한 품질 유지로 점주 만족도 97%를 달성한 공급 혁신 사례를 소개합니다.',
      readCount: 2150,
      thumbnail: './images/banner_b2b.jpg',
      tags: ['프랜차이즈', 'B2B공급', '한양왕족발', '인건비절감'],
      isPinned: false
    },
    {
      id: 'post-4',
      title: '[안내] 신규 외식업 사장님을 위한 2026 \'보쌈무김치 1kg 무료 샘플팩\' 지원 정책',
      category: '이벤트',
      author: '고객지원센터',
      date: '2026-01-20',
      content: '맛을 보지 않고는 식자재를 바꿀 수 없다는 사장님들의 마음을 깊이 이해합니다. 현재 족발, 보쌈, 삼겹살, 순대국밥 전문점을 운영 중이시거나 창업을 준비 중인 사업자분들께 푸드홈 시그니처 보쌈무김치 1kg 무료 샘플을 택배비까지 전액 지원하여 보내드립니다.',
      readCount: 5690,
      thumbnail: './images/prod_bossam_mu.jpg',
      tags: ['무료샘플', '사업자전용', '체험이벤트'],
      isPinned: true
    }
  ],
  reviews: [
    {
      id: 'rev-1',
      clientName: '도담보쌈 본점',
      businessType: '보쌈·족발 전문점 (서울 마포)',
      rating: 5,
      comment: '직접 김치를 담글 때는 주방 이모님 컨디션 따라 맛이 달라져서 스트레스가 이만저만이 아니었습니다. 푸드홈으로 바꾼 지 1년 반 되었는데, 손님들이 무김치 리필을 3번씩 하십니다. 물도 안 생기고 아삭함이 대박입니다.',
      date: '2026-03-08',
      location: '서울 마포구',
      verifiedPartner: true
    },
    {
      id: 'rev-2',
      clientName: '황금족발보쌈 가맹본부',
      businessType: '전국 42개 가맹 프랜차이즈',
      rating: 5,
      comment: '전국 가맹점에 매일 아침 차질 없이 콜드체인으로 배송되는 물류 안정성이 최고입니다. 특히 여름철 장마철에도 무 품질이 흔들리지 않고 균일해서 본사 품질관리가 한결 수월해졌습니다.',
      date: '2026-02-22',
      location: '경기 성남시',
      verifiedPartner: true
    },
    {
      id: 'rev-3',
      clientName: '제주흑돈정육식당',
      businessType: '돼지고기 전문 구이점 (부산 해운대)',
      rating: 5,
      comment: '오겹살과 목살 구이에 곁들임 찬으로 푸드홈 보쌈무김치와 김칫속을 함께 내는데, 고기 맛을 확 살려줘서 객단가가 올랐습니다. 단가도 합리적이라 식자재 원가 절감에 큰 도움이 됩니다.',
      date: '2026-02-05',
      location: '부산 해운대구',
      verifiedPartner: true
    },
    {
      id: 'rev-4',
      clientName: '인생수육국밥',
      businessType: '국밥·수육 체인점 (대전 유성)',
      rating: 5,
      comment: '샘플 신청해서 먹어보고 다음 날 바로 100kg 정기 발주 넣었습니다. 텁텁하지 않고 끝맛이 청량하게 똑 떨어지는 단맛이라 수육과 천생연분입니다.',
      date: '2026-01-18',
      location: '대전 유성구',
      verifiedPartner: true
    }
  ],
  inquiries: [
    {
      id: 'inq-106',
      postNumber: 46,
      title: '서울 강남 보쌈전문점 무료샘플 신청합니다.',
      companyName: '압구정 대박보쌈',
      storeName: '압구정 대박보쌈 신사점',
      contactPerson: '박현우 대표',
      writer: '박*우',
      phone: '010-3819-4821',
      email: 'hwpark@daebakbossam.com',
      businessType: '일반음식점 (보쌈·족발)',
      requestType: '무료 샘플 요청',
      monthlyUsage: '월 250kg 내외',
      region: '서울 강남구 신사동',
      address: '서울특별시 강남구 신사동 512-4번지 1층',
      selectedProducts: ['명품 보쌈무김치 1kg', '비법 보쌈김칫속 1kg'],
      message: '기존 거래처 무김치가 물이 많이 생겨서 교체를 검토하고 있습니다. 꼬들꼬들한 보쌈무김치 샘플 받아보고 싶습니다.',
      status: '배송완료',
      password: '1234',
      isSecret: true,
      readCount: 14,
      createdAt: '2026-03-24',
      adminReply: {
        author: '푸드홈 배송관리팀',
        repliedAt: '2026-03-25',
        content: '안녕하세요 대표님! 푸드홈입니다. 요청해주신 보쌈무김치 및 김칫속 1kg 샘플팩이 3월 24일 우체국 냉장택배(송장번호: 6891-2309-1123)로 정상 출고되었습니다. 시식 후 궁금하신 사항은 고객센터(1588-7241)로 편하게 문의 부탁드립니다. 번창을 기원합니다!'
      },
      adminMemo: '우체국 냉장택배 발송 완료 (송장: 6891-2309-1123). 초도 발주 문의 예정'
    },
    {
      id: 'inq-105',
      postNumber: 45,
      title: '경기 일산 족발 체인점 샘플 요청드립니다',
      companyName: '장충당 일산본점',
      storeName: '장충당 일산본점',
      contactPerson: '김성민 점장',
      writer: '김*민',
      phone: '010-4492-1204',
      email: 'smkim@jangchung.co.kr',
      businessType: '프랜차이즈 가맹점',
      requestType: '무료 샘플 요청',
      monthlyUsage: '월 400kg 예상',
      region: '경기 고양시 일산동구',
      address: '경기도 고양시 일산동구 정발산로 43-1',
      selectedProducts: ['명품 보쌈무김치 1kg'],
      message: '일일 족발 80족 삶는 매장입니다. 단가표와 제품 시험성적서 함께 부탁드립니다.',
      status: '배송준비',
      password: '1234',
      isSecret: true,
      readCount: 8,
      createdAt: '2026-03-23',
      adminReply: {
        author: '푸드홈 물류팀',
        repliedAt: '2026-03-23',
        content: '신청 감사합니다. 사업자등록증 확인 완료되어 금일 생산된 신선한 보쌈무김치 1kg 샘플팩이 금일 발송 준비 중입니다. 내일 오전 도착 예정입니다.'
      },
      adminMemo: '단가표 동봉 발송'
    },
    {
      id: 'inq-104',
      postNumber: 44,
      title: '인천 부평 보쌈 배달전문점 무료 샘플 신청의 건',
      companyName: '육도보쌈 부평점',
      storeName: '육도보쌈 부평점',
      contactPerson: '이정호',
      writer: '이*호',
      phone: '010-9182-3847',
      email: 'jhlee@gmail.com',
      businessType: '배달전문점',
      requestType: '무료 샘플 요청',
      monthlyUsage: '월 150kg',
      region: '인천 부평구',
      address: '인천광역시 부평구 시장로 29 2층',
      selectedProducts: ['명품 보쌈무김치 1kg', '비법 보쌈김칫속 1kg'],
      message: '배달 포장 시 시간이 지나도 식감이 유지되는지 테스트해보고 싶습니다.',
      status: '답변완료',
      password: '1234',
      isSecret: true,
      readCount: 6,
      createdAt: '2026-03-22',
      adminReply: {
        author: '푸드홈 상담팀',
        repliedAt: '2026-03-22',
        content: '접수 확인되었습니다. 배달 용기에서도 최대 12시간 이상 물 생김 없이 아삭함이 유지되는 특허 수분제어 공법 제품입니다. 주소지로 무료 발송 접수되었습니다.'
      },
      adminMemo: '배달 전문점 맞춤 소포장 안내 필요'
    },
    {
      id: 'inq-103',
      postNumber: 43,
      title: '충남 천안 정육식당 샘플 및 단가 문의합니다',
      companyName: '수복식당 & 정육마을',
      storeName: '수복식당',
      contactPerson: '최민기 사장',
      writer: '최*기',
      phone: '010-5231-1876',
      email: 'subok2024@naver.com',
      businessType: '정육식당',
      requestType: '무료 샘플 요청',
      monthlyUsage: '월 100kg 내외',
      region: '충남 천안시 서북구',
      address: '충청남도 천안시 서북구 불당동 78-2',
      selectedProducts: ['비법 보쌈김칫속 1kg'],
      message: '김칫속 양념과 보쌈무김치 함께 테스트해보고 싶습니다. 식자재 단가표도 동봉 부탁드립니다.',
      status: '답변완료',
      password: '1234',
      isSecret: true,
      readCount: 11,
      createdAt: '2026-03-20',
      adminReply: {
        author: '푸드홈 운영팀',
        repliedAt: '2026-03-21',
        content: '안녕하세요 사장님, 유선 안내드렸으며 샘플팩과 함께 업소용 10kg/벌크 단가표 동봉하여 발송 완료하였습니다.'
      },
      adminMemo: '초도 발주 20kg 계약 확정'
    },
    {
      id: 'inq-102',
      postNumber: 42,
      title: '부산 해운대 신규 오픈 예정 보쌈집 샘플 요청',
      companyName: '부산해운대보쌈',
      storeName: '해운대보쌈(오픈준비중)',
      contactPerson: '강태석',
      writer: '강*석',
      phone: '010-6712-4419',
      email: 'tskang@daum.net',
      businessType: '신규 오픈 매장',
      requestType: '무료 샘플 요청',
      monthlyUsage: '월 300kg 예상',
      region: '부산 해운대구',
      address: '부산광역시 해운대구 우동 1435',
      selectedProducts: ['명품 보쌈무김치 1kg', '비법 보쌈김칫속 1kg'],
      message: '4월 중순 오픈 준비 중인 매장입니다. 맛있는 김치 찾다가 추천받아서 신청합니다.',
      status: '접수완료',
      password: '1234',
      isSecret: true,
      readCount: 3,
      createdAt: '2026-03-19',
      adminMemo: '신규 매장 컨설팅 자료 제공 검토'
    }
  ],
  quotes: [
    {
      id: 'quote-201',
      postNumber: 15,
      title: '수도권 직영 5개점 프랜차이즈 보쌈무김치 정기 납품 견적 문의',
      companyName: '주식회사 정가네보쌈',
      contactPerson: '정민호 본부장',
      phone: '010-8291-3829',
      email: 'minho.jung@jeonggane.co.kr',
      region: '서울/경기 전역',
      businessType: '프랜차이즈 본사',
      interestedProducts: ['명품 보쌈무김치 (업소용 10kg)', '비법 보쌈김칫속 (업소용 10kg)'],
      monthlyVolume: '월 1.5톤 내외',
      deliverySchedule: '2026년 4월 초도 공급 희망',
      message: '현재 5개 직영점 운영 중이며 하반기 가맹 사업 준비 중입니다. 주 3회 물류센터 입고 단가 및 냉장 배송 조건 견적 요청드립니다.',
      attachments: [{ name: '정가네보쌈_사업자등록증.pdf', size: '1.2MB' }],
      passwordHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', // 1234
      rawPasswordHint: '1234',
      isSecret: true,
      status: '상담중',
      readCount: 18,
      createdAt: '2026-03-24',
      adminReply: {
        author: '푸드홈 B2B 영업본부',
        repliedAt: '2026-03-24',
        content: '정민호 본부장님 안녕하세요, 푸드홈 B2B 납품팀입니다. 남겨주신 물량(월 1.5톤) 기준 프랜차이즈 우대 단가표와 물류 계약서를 유선 상담 후 메일로 발송해 드렸습니다.'
      },
      adminMemo: '샘플 10kg 발송 및 3월 28일 본사 미팅 예정'
    },
    {
      id: 'quote-202',
      postNumber: 14,
      title: '대전 유성구 대형 국밥·수육 전문점 김칫속 OEM 문의',
      companyName: '유성 한우수육국밥',
      contactPerson: '이영숙 대표',
      phone: '010-3948-2819',
      email: 'yslee@naver.com',
      region: '대전 유성구',
      businessType: '일반음식점 (보쌈·족발)',
      interestedProducts: ['비법 보쌈김칫속 (업소용 10kg)'],
      monthlyVolume: '월 500kg',
      deliverySchedule: '즉시 납품 희망',
      message: '수육에 곁들일 겉절이용 비법 양념속을 매장에서 직접 담그기 어려워 외주 납품받고자 합니다. 맵기 조절 가능 여부와 단가 상담 원합니다.',
      attachments: [],
      passwordHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', // 1234
      rawPasswordHint: '1234',
      isSecret: true,
      status: '견적완료',
      readCount: 12,
      createdAt: '2026-03-22',
      adminReply: {
        author: '푸드홈 B2B 영업본부',
        repliedAt: '2026-03-23',
        content: '이영숙 대표님, 푸드홈의 표준 김칫속과 함께 수육용 맞춤 샘플팩 2종을 발송해 드렸습니다. 매장 방문 상담 일정도 확정되었습니다.'
      },
      adminMemo: '월 500kg 계약 완료, 매주 화/금 정기 배송'
    },
    {
      id: 'quote-203',
      postNumber: 13,
      title: '대구 동구 고깃집 신규 오픈 보쌈무김치 대량 견적 요청',
      companyName: '동구 솥뚜껑삼겹살',
      contactPerson: '박찬우',
      phone: '010-7712-9901',
      email: 'cw.park@gmail.com',
      region: '대구 동구',
      businessType: '고깃집 (삼겹살·갈비)',
      interestedProducts: ['명품 보쌈무김치 (업소용 10kg)'],
      monthlyVolume: '월 200kg 예상',
      deliverySchedule: '4월 15일 오픈',
      message: '신규 오픈하는 삼겹살 전문점입니다. 밑반찬으로 푸드홈 보쌈무김치를 사용하고 싶어 최소 발주량과 공급 단가 문의드립니다.',
      attachments: [],
      passwordHash: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', // 1234
      rawPasswordHint: '1234',
      isSecret: true,
      status: '접수완료',
      readCount: 7,
      createdAt: '2026-03-21'
    }
  ],
  formConfig: {
    sampleFormFields: [
      { id: 'f-s-1', name: 'title', label: '신청 제목', type: 'text', required: true, order: 1, enabled: true, placeholder: '예: [서울 강남] 보쌈 전문점 1kg 무료 샘플 신청합니다' },
      { id: 'f-s-2', name: 'storeName', label: '상호명 (사업체명)', type: 'text', required: true, order: 2, enabled: true, placeholder: '운영 중이신 매장 상호명 입력' },
      { id: 'f-s-3', name: 'contactPerson', label: '담당자 / 대표자 성함', type: 'text', required: true, order: 3, enabled: true, placeholder: '성함 입력' },
      { id: 'f-s-4', name: 'phone', label: '휴대전화 연락처', type: 'tel', required: true, order: 4, enabled: true, placeholder: '010-0000-0000 (배송 안내용)' },
      { id: 'f-s-5', name: 'address', label: '샘플 수령 주소', type: 'text', required: true, order: 5, enabled: true, placeholder: '도로명 주소 및 상세주소 정확히 입력' },
      { id: 'f-s-6', name: 'selectedProducts', label: '신청 희망 샘플 품목', type: 'checkbox', required: true, order: 6, enabled: true },
      { id: 'f-s-7', name: 'message', label: '요청 사항 및 매장 소개', type: 'textarea', required: false, order: 7, enabled: true, placeholder: '현재 운영 형태, 예상 소진량 등을 적어주시면 맞춤 상담에 도움됩니다.' },
      { id: 'f-s-8', name: 'password', label: '게시글 열람 비밀번호 (4자리 이상)', type: 'password', required: true, order: 8, enabled: true, placeholder: '비공개 글 열람용 비밀번호' }
    ],
    sampleProductOptions: [
      '명품 보쌈무김치 1kg (대표 인기품목)',
      '비법 보쌈김칫속(보쌈속) 1kg',
      '업소용 특제 굴보쌈 양념 500g',
      '특허 수분제어 맞춤 절임무 1kg'
    ],
    sampleStatuses: ['접수대기', '접수완료', '답변완료', '배송준비', '배송완료', '상담완료'],
    samplePrivacyText: '개인정보보호법에 의거하여 무료 샘플 발송 및 B2B 상담 목적으로만 성함, 연락처, 주소를 수집하며, 발송 완료 3개월 후 안전하게 파기됩니다.',
    quoteFormFields: [
      { id: 'f-q-1', name: 'title', label: '상담 제목', type: 'text', required: true, order: 1, enabled: true, placeholder: '예: [경기 안양] 3개 매장 보쌈무김치 정기 납품 단가 견적 요청' },
      { id: 'f-q-2', name: 'companyName', label: '업체명 / 상호명', type: 'text', required: true, order: 2, enabled: true, placeholder: '사업자등록 상호명 또는 매장명' },
      { id: 'f-q-3', name: 'contactPerson', label: '담당자 성함', type: 'text', required: true, order: 3, enabled: true, placeholder: '담당자명 및 직책' },
      { id: 'f-q-4', name: 'phone', label: '연락처', type: 'tel', required: true, order: 4, enabled: true, placeholder: '010-0000-0000' },
      { id: 'f-q-5', name: 'email', label: '이메일 주소', type: 'email', required: false, order: 5, enabled: true, placeholder: '견적서 수신용 이메일' },
      { id: 'f-q-6', name: 'region', label: '납품 희망 지역', type: 'text', required: false, order: 6, enabled: true, placeholder: '예: 서울 전역, 경기 일산, 전국 등' },
      { id: 'f-q-7', name: 'businessType', label: '업종 형태', type: 'select', required: false, order: 7, enabled: true, options: ['일반음식점 (보쌈·족발)', '고깃집 (삼겹살·갈비)', '국밥·해장국 전문점', '프랜차이즈 본사/직영', '단체급식·케이터링', '식자재 유통업체', '기타'] },
      { id: 'f-q-8', name: 'interestedProducts', label: '관심 제품', type: 'checkbox', required: true, order: 8, enabled: true },
      { id: 'f-q-9', name: 'monthlyVolume', label: '예상 월 납품 수량', type: 'text', required: false, order: 9, enabled: true, placeholder: '예: 월 100kg, 월 500kg, 1톤 이상 등' },
      { id: 'f-q-10', name: 'deliverySchedule', label: '희망 납품 일정', type: 'text', required: false, order: 10, enabled: true, placeholder: '예: 2026년 4월 초, 즉시 납품 등' },
      { id: 'f-q-11', name: 'message', label: '상담 내용', type: 'textarea', required: false, order: 11, enabled: true, placeholder: '필요하신 공급 규격, 맵기 강도, 특별 요청사항을 적어주세요.' },
      { id: 'f-q-12', name: 'password', label: '게시글 비밀번호 (4자리 이상)', type: 'password', required: true, order: 12, enabled: true, placeholder: '견적 및 답변 열람용 비밀번호' }
    ],
    quoteProductOptions: [
      '명품 보쌈무김치 (업소용 10kg)',
      '비법 보쌈김칫속 (업소용 10kg)',
      '수제 절임무 벌크 (20kg)',
      '프랜차이즈 맞춤 OEM/PB 전용 레시피'
    ],
    quoteStatuses: ['접수완료', '상담중', '견적완료'],
    quotePrivacyText: '대량 납품 견적 산출 및 유선 안내를 위해 입력하신 정보를 수집 및 처리하며 관련 법령에 따라 철저히 비공개 보호됩니다.'
  },
  seo: {
    metaTitle: '푸드홈(FOODHOME) - 대한민국 1등 보쌈무김치·김칫속 전문 제조업체',
    metaDescription: '30년 전통 비법양념과 특허 수분제어로 빚어낸 명품 보쌈무김치, 굴보쌈 김칫속 전문 제조 푸드홈. 전국 480여 개 프랜차이즈 및 맛집 납품. 무료 샘플 신청 지원.',
    keywords: '푸드홈, FOODHOME, 보쌈무김치, 무김치, 김칫속, 보쌈김치, 족발무김치, 업소용김치, 외식업식자재, 보쌈식자재납품, 안심김치',
    ogTitle: '푸드홈(FOODHOME) - 대한민국 1등 보쌈무김치·김칫속 전문 제조업체',
    ogDescription: '물 생김 없이 끝까지 아삭한 특허 수분제어 보쌈무김치. 전국 외식업 대표님을 위한 무료 1kg 샘플팩 신청 접수 중.',
    ogImageUrl: './images/banner_bossam.jpg',
    canonicalUrl: 'https://foodhome.co.kr'
  },
  social: {
    instagramUrl: 'https://instagram.com/foodhome_official',
    youtubeUrl: 'https://youtube.com/@foodhome_kr',
    naverBlogUrl: 'https://blog.naver.com/foodhome_kimchi',
    kakaoTalkUrl: 'https://pf.kakao.com/_foodhome',
    smartStoreUrl: 'https://smartstore.naver.com/foodhome/products/4266908131',
    coupangUrl: 'https://coupang.com'
  },
  formspreeEndpoint: 'https://formspree.io/f/xoejykbn'
};
