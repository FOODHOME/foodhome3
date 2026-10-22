import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Search, 
  Waves, 
  Sparkles, 
  FlaskConical, 
  ScanLine, 
  Truck,
  CheckCircle2
} from 'lucide-react';

export const ManufacturingProcess: React.FC = () => {
  const { state } = useApp();
  const cfg = state.content.mainSections?.find(s => s.id === 'process');

  const steps = [
    {
      step: '01',
      title: '산지직송 무 엄선 및 검수',
      desc: '제주 월동무 및 강원 고랭지 계약재배 농가에서 입고된 상처 없고 묵직한 최상급 무만 엄격 선별합니다.',
      icon: <Search className="w-4 h-4 text-[#872D35]" />,
      highlight: '원물 당도 및 밀도 전수 검사'
    },
    {
      step: '02',
      title: '3단 마이크로 버블 세척',
      desc: '초음파 마이크로 미세 버블 세척 라인을 통해 흙먼지와 미세 잔류물을 3단계로 완벽하게 위생 세척합니다.',
      icon: <Waves className="w-4 h-4 text-[#872D35]" />,
      highlight: '잔류 농약 ZERO 무결점 세척'
    },
    {
      step: '03',
      title: '특허 수분제어 저온 절임',
      desc: '신안 3년산 천일염으로 이상적인 삼투압 비율을 맞춰 절여, 시간이 지나도 물 생김 없이 끝까지 아삭합니다.',
      icon: <Sparkles className="w-4 h-4 text-[#872D35]" />,
      highlight: '물 생김 방지 특허 공법'
    },
    {
      step: '04',
      title: '30년 비법양념 황금 배합',
      desc: '영양 태양초 고춧가루, 광천 토굴 젓갈, 배·양파 생과일 퓨레를 정량 배합해 매일 아침 신선하게 버무립니다.',
      icon: <FlaskConical className="w-4 h-4 text-[#872D35]" />,
      highlight: '화학 조미료/착색료 무첨가'
    },
    {
      step: '05',
      title: 'X-ray 이물질·금속 검출',
      desc: '포장 직전 3D X-ray 투시 검사기와 초정밀 금속검출기를 통과시켜 1mm 이하의 미세 이물질까지 전수 검사합니다.',
      icon: <ScanLine className="w-4 h-4 text-[#872D35]" />,
      highlight: '엄격한 청결 위생 공정 규격'
    },
    {
      step: '06',
      title: '2중 진공포장 & 콜드체인 출고',
      desc: '특수 질소충전 2중 필름으로 안심 실링 후, 0~5℃ 냉장 차량을 통해 전국 각 매장으로 익일 신선 직배송됩니다.',
      icon: <Truck className="w-4 h-4 text-[#872D35]" />,
      highlight: '전국 익일 냉장 안전 직배송'
    }
  ];

  return (
    <section id="process-section" className="py-12 bg-[#FAF8F5] border-b border-[#E8E2DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2DC] text-[11px] font-bold text-[#872D35]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#872D35]" />
            <span>{cfg?.badge || '청결 안심 위생 스마트 팩토리'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2A2020] tracking-tight">
            {cfg?.title || '한치의 타협도 없는 6단계 안심 위생 제조공정'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-normal">
            {cfg?.description || '우리 가족이 먹는다는 철저한 품질 관리로 480개 외식 파트너 매장의 믿음을 지킵니다.'}
          </p>
        </div>

        {/* 6-Step Compact Process Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {steps.map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-xl p-5 border border-[#E8E2DC] shadow-2xs hover:border-[#872D35] hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E8E2DC] text-[#872D35] flex items-center justify-center font-black text-xs">
                      {item.step}
                    </span>
                    <h3 className="text-sm font-bold text-[#2A2020]">
                      {item.title}
                    </h3>
                  </div>
                  <div className="p-1.5 rounded-md bg-[#FAF8F5]">
                    {item.icon}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#F0EBE6] flex items-center gap-1.5 text-[11px] font-semibold text-[#872D35]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{item.highlight}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Facility Photos Strip */}
        <div id="facility-section" className="bg-white rounded-xl p-5 border border-[#E8E2DC]">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <span className="text-[10px] font-bold text-[#872D35] uppercase tracking-wider block">FACILITY GALLERY</span>
              <h4 className="text-sm font-bold text-[#2A2020]">푸드홈 첨단 위생 가공 설비</h4>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">충북 진천군 푸드홈 제1·2 식품가공공장</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="relative rounded-lg overflow-hidden aspect-4/3 group">
              <img
                src="./images/facility_bubble_wash.jpg"
                alt="3단 버블 세척기"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white">마이크로 버블 세척실</span>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden aspect-4/3 group">
              <img
                src="./images/facility_cleanroom.jpg"
                alt="클린룸 양념 배합"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white">양수 압력 클린룸</span>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden aspect-4/3 group">
              <img
                src="./images/facility_packing.jpg"
                alt="진공 포장 라인"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white">자동 진공 실링 라인</span>
              </div>
            </div>

            <div className="relative rounded-lg overflow-hidden aspect-4/3 group">
              <img
                src="./images/facility_xray.jpg"
                alt="X-ray 금속 검출"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white">3D X-Ray 이물질 검사</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
