import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { submitToFormspree } from '../utils/formspree';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Phone, 
  Truck, 
  FileSpreadsheet, 
  ShieldCheck,
  Loader2
} from 'lucide-react';

export const SampleInquirySection: React.FC = () => {
  const { addInquiry, state, showToast } = useApp();
  const cfg = state.content.mainSections?.find(s => s.id === 'inquiry');

  const [formData, setFormData] = useState<{
    companyName: string;
    contactPerson: string;
    phone: string;
    email: string;
    businessType: string;
    requestType: '무료 샘플 요청' | '대량 납품 견적' | 'OEM/PB 제휴 문의';
    monthlyUsage: string;
    region: string;
    message: string;
  }>({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    businessType: '보쌈·족발 전문점',
    requestType: '무료 샘플 요청',
    monthlyUsage: '월 100kg ~ 200kg',
    region: '',
    message: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.phone || !formData.contactPerson) {
      alert('상호명, 담당자 성함, 연락처는 필수 입력 항목입니다.');
      return;
    }

    setIsSubmitting(true);
    const endpoint = state.formspreeEndpoint || 'https://formspree.io/f/xoejykbn';
    
    // 1. Submit to Formspree
    const formspreeResult = await submitToFormspree(endpoint, {
      상호명_매장명: formData.companyName,
      대표자_담당자명: formData.contactPerson,
      연락처: formData.phone,
      이메일: formData.email || '미입력',
      업종형태: formData.businessType,
      신청구분: formData.requestType,
      월사용예상량: formData.monthlyUsage,
      매장지역: formData.region || '미입력',
      요청사항: formData.message || '푸드홈 홈페이지 온라인 양식 접수'
    });

    // 2. Add to local state
    addInquiry({
      companyName: formData.companyName,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      email: formData.email,
      businessType: formData.businessType,
      requestType: formData.requestType,
      monthlyUsage: formData.monthlyUsage,
      region: formData.region,
      message: formData.message
    });

    setIsSubmitting(false);
    setIsSubmitted(true);

    if (formspreeResult.success) {
      showToast('샘플 신청서가 정상 전송되었습니다.');
    } else {
      showToast('접수되었습니다. 담당자가 확인 후 연락드립니다.');
    }
  };

  const handleReset = () => {
    setFormData({
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      businessType: '보쌈·족발 전문점',
      requestType: '무료 샘플 요청',
      monthlyUsage: '월 100kg ~ 200kg',
      region: '',
      message: ''
    });
    setIsSubmitted(false);
  };

  return (
    <section id="inquiry-section" className="py-12 bg-white border-b border-[#E8E2DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Information */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8E2DC] text-[11px] font-bold text-[#872D35]">
              <Sparkles className="w-3.5 h-3.5 text-[#872D35]" />
              <span>{cfg?.badge || 'B2B WHOLESALE & SAMPLE'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2A2020] tracking-tight leading-snug">
              {cfg?.title || (
                <>
                  외식업 사장님을 위한 <br />
                  <span className="text-[#872D35]">무료 샘플 1kg</span> & 맞춤 견적
                </>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              {cfg?.description || '식자재는 맛과 아삭함을 직접 경험해보셔야 결정하실 수 있습니다. 현재 매장을 운영 중이신 사업자 또는 창업 예정자분들께 푸드홈 명품 보쌈무김치 1kg 무료 샘플팩과 규격 단가표를 전액 무료로 배송해 드립니다.'}
            </p>

            {/* Benefits list */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#FAF8F5] border border-[#E8E2DC]">
                <Truck className="w-4 h-4 text-[#872D35] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#2A2020]">냉장 우체국 택배비 100% 무료 지원</h4>
                  <p className="text-[11px] text-slate-500">샘플 제품값은 물론 배송비까지 푸드홈이 전액 부담합니다.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#FAF8F5] border border-[#E8E2DC]">
                <FileSpreadsheet className="w-4 h-4 text-[#872D35] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#2A2020]">식자재 도매 단가표 및 규격서 동봉</h4>
                  <p className="text-[11px] text-slate-500">대량 발주 시 할인율과 프랜차이즈 맞춤 레시피(OEM) 가이드를 제공합니다.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-[#FAF8F5] border border-[#E8E2DC]">
                <ShieldCheck className="w-4 h-4 text-[#872D35] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-[#2A2020]">신청 후 24시간 이내 신선 생산 및 출고</h4>
                  <p className="text-[11px] text-slate-500">갓 담근 신선하고 아삭한 상태로 매장 주방까지 배송됩니다.</p>
                </div>
              </div>
            </div>

            {/* Direct Phone Call Strip */}
            <div className="pt-3 border-t border-[#E8E2DC] flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">빠른 유선 상담 & 급송 요청</span>
                <span className="text-base font-extrabold text-[#2A2020]">{state.content.phone}</span>
              </div>
              <a
                href={`tel:${state.content.phone}`}
                className="px-3.5 py-1.5 rounded-lg bg-[#2A2020] text-white text-xs font-bold hover:bg-[#872D35] transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>바로 통화</span>
              </a>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7">
            <div className="bg-[#FAF8F5] rounded-xl p-6 border border-[#E8E2DC] shadow-2xs">
              
              {isSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#2A2020]">
                    B2B 무료 샘플 및 견적 문의가 성공적으로 접수되었습니다!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    입력해주신 연락처(<strong>{formData.phone}</strong>)로 담당 영양사 및 B2B 영업팀장이 확인 후 샘플 발송 일정과 상세 단가표를 신속히 안내해 드리겠습니다.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={handleReset}
                      className="px-5 py-2 rounded-lg bg-[#872D35] text-white text-xs font-bold hover:bg-[#6D242B] transition-colors cursor-pointer shadow-2xs"
                    >
                      추가 문의 작성하기
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="flex items-center justify-between border-b border-[#E8E2DC] pb-2.5">
                    <h3 className="text-sm font-extrabold text-[#2A2020]">
                      무료 샘플 및 납품 상담 간편 신청
                    </h3>
                    <span className="text-[11px] text-[#872D35] font-semibold">* 필수 항목</span>
                  </div>

                  {/* Form Type Selection */}
                  <div className="grid grid-cols-3 gap-2">
                    {(['무료 샘플 요청', '대량 납품 견적', 'OEM/PB 제휴 문의'] as const).map((type) => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setFormData({ ...formData, requestType: type })}
                        className={`py-2 px-2 text-xs font-bold rounded-lg border transition-all text-center cursor-pointer ${
                          formData.requestType === type
                            ? 'bg-[#872D35] text-white border-[#872D35] shadow-2xs'
                            : 'bg-white text-stone-700 border-[#E8E2DC] hover:bg-stone-50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#332525] mb-1">
                        상호명 / 매장명 <span className="text-[#872D35]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="예: 원조한양보쌈 서초점"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2DC] bg-white focus:outline-none focus:border-[#872D35]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#332525] mb-1">
                        대표자 / 담당자 성함 <span className="text-[#872D35]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="예: 김민수 대표"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2DC] bg-white focus:outline-none focus:border-[#872D35]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#332525] mb-1">
                        연락처 (휴대전화) <span className="text-[#872D35]">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="010-0000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2DC] bg-white focus:outline-none focus:border-[#872D35]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#332525] mb-1">
                        이메일 (견적서 수신)
                      </label>
                      <input
                        type="email"
                        placeholder="foodhome@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2DC] bg-white focus:outline-none focus:border-[#872D35]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#332525] mb-1">
                        업종 형태
                      </label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2DC] bg-white focus:outline-none focus:border-[#872D35]"
                      >
                        <option value="보쌈·족발 전문점">보쌈·족발 전문점</option>
                        <option value="칼국수·순대국 등 한식당">칼국수·순대국 등 한식당</option>
                        <option value="외식 프랜차이즈 본사">외식 프랜차이즈 본사</option>
                        <option value="식자재 유통업체">식자재 유통업체</option>
                        <option value="기타 요식업 매장">기타 요식업 매장</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#332525] mb-1">
                        월 예상 소진량
                      </label>
                      <select
                        value={formData.monthlyUsage}
                        onChange={(e) => setFormData({ ...formData, monthlyUsage: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2DC] bg-white focus:outline-none focus:border-[#872D35]"
                      >
                        <option value="월 100kg 미만">월 100kg 미만</option>
                        <option value="월 100kg ~ 200kg">월 100kg ~ 200kg</option>
                        <option value="월 200kg ~ 500kg">월 200kg ~ 500kg</option>
                        <option value="월 500kg 이상">월 500kg 이상 (특별 단가)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#332525] mb-1">
                      배송받으실 매장 주소 / 상담 요청사항
                    </label>
                    <textarea
                      rows={2}
                      placeholder="샘플을 받아보실 사업장 주소 또는 궁금하신 점을 작성해 주세요."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2DC] bg-white focus:outline-none focus:border-[#872D35] resize-none"
                    />
                  </div>

                  <div className="pt-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-lg text-white font-extrabold text-xs transition-all bg-[#872D35] hover:bg-[#6D242B] flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>접수 처리 중...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>무료 샘플 1kg 신청서 제출하기</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
