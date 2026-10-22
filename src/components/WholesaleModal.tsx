import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { submitToFormspree } from '../utils/formspree';
import { 
  X, 
  Truck, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  PhoneCall, 
  Loader2,
  Building2
} from 'lucide-react';

export const WholesaleModal: React.FC = () => {
  const { isWholesaleModalOpen, setIsWholesaleModalOpen, addInquiry, state, showToast } = useApp();

  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    businessType: '보쌈·족발 전문점',
    monthlyUsage: '월 200kg ~ 300kg',
    productInterest: '보쌈무김치 & 김칫속 전 라인업',
    region: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isWholesaleModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.phone || !formData.contactPerson) {
      alert('상호명, 성함, 연락처를 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    const endpoint = state.formspreeEndpoint || 'https://formspree.io/f/xoejykbn';

    const result = await submitToFormspree(endpoint, {
      구분: 'B2B 대량 납품 및 프랜차이즈 견적 문의',
      상호명_매장명: formData.companyName,
      대표자_담당자명: formData.contactPerson,
      연락처: formData.phone,
      이메일: formData.email || '미입력',
      업종형태: formData.businessType,
      월소진예상량: formData.monthlyUsage,
      관심품목: formData.productInterest,
      매장지역: formData.region || '미입력',
      상담요청사항: formData.message || '대량 납품 단가 및 직배송 주기 상담 요청'
    });

    addInquiry({
      companyName: formData.companyName,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      email: formData.email,
      businessType: formData.businessType,
      requestType: '대량 납품 견적',
      monthlyUsage: formData.monthlyUsage,
      region: formData.region,
      message: `[대량납품문의] 관심품목: ${formData.productInterest} / ${formData.message}`
    });

    setIsSubmitting(false);
    setSubmitted(true);

    if (result.success) {
      showToast('대량 납품 상담 신청이 정상 접수되었습니다.');
    } else {
      showToast('접수되었습니다. (네트워크 연결 후 담당자가 확인합니다)');
    }
  };

  const handleClose = () => {
    setIsWholesaleModalOpen(false);
    setSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#E8E2DC] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Deep Charcoal / Burgundy theme */}
        <div className="bg-[#332525] text-white p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-[#B64346]" />
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              B2B WHOLESALE & SUPPLY
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            외식업소 & 프랜차이즈 납품 견적 문의
          </h2>

          <p className="text-xs text-stone-300 mt-1">
            월 사용량 및 매장 상황에 최적화된 도매 납품 단가와 배송 스케줄을 안내해 드립니다.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-[#2A2020]">
              납품 상담 신청이 접수되었습니다
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              접수해주신 매장 정보(<strong>{formData.companyName}</strong>)를 검토한 후, 
              푸드홈 B2B 전담 영업팀에서 빠른 시간 내에 유선으로 연락드리겠습니다.
            </p>
            <div className="pt-2">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-lg bg-[#872D35] text-white text-xs font-bold hover:bg-[#6D242B] transition-colors cursor-pointer shadow-xs"
              >
                확인
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#332525] mb-1">
                  상호명 (매장명) <span className="text-[#872D35]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 원조한양보쌈 진천점"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2DC] focus:outline-none focus:border-[#872D35] focus:ring-1 focus:ring-[#872D35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#332525] mb-1">
                  대표자 / 담당자 성함 <span className="text-[#872D35]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 홍길동 대표"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2DC] focus:outline-none focus:border-[#872D35] focus:ring-1 focus:ring-[#872D35]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2DC] focus:outline-none focus:border-[#872D35] focus:ring-1 focus:ring-[#872D35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#332525] mb-1">
                  이메일 (견적서 수신용)
                </label>
                <input
                  type="email"
                  placeholder="foodhome@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2DC] focus:outline-none focus:border-[#872D35] focus:ring-1 focus:ring-[#872D35]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#332525] mb-1">
                  업종 형태
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2DC] focus:outline-none focus:border-[#872D35] bg-white"
                >
                  <option value="보쌈·족발 전문점">보쌈·족발 전문점</option>
                  <option value="칼국수·순대국 등 한식당">칼국수·순대국 등 한식당</option>
                  <option value="외식 프랜차이즈 본사">외식 프랜차이즈 본사</option>
                  <option value="식자재 유통 및 도매상">식자재 유통 및 도매상</option>
                  <option value="급식 / 뷔페 / 케이터링">급식 / 뷔페 / 케이터링</option>
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
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2DC] focus:outline-none focus:border-[#872D35] bg-white"
                >
                  <option value="월 100kg 미만">월 100kg 미만</option>
                  <option value="월 100kg ~ 200kg">월 100kg ~ 200kg</option>
                  <option value="월 200kg ~ 500kg">월 200kg ~ 500kg</option>
                  <option value="월 500kg ~ 1톤">월 500kg ~ 1톤 (특별 할인가)</option>
                  <option value="월 1톤 이상 (프랜차이즈)">월 1톤 이상 (프랜차이즈 본사)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#332525] mb-1">
                매장 지역 (시/군/구)
              </label>
              <input
                type="text"
                placeholder="예: 서울 강남구 / 경기 수원시 팔달구"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2DC] focus:outline-none focus:border-[#872D35]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#332525] mb-1">
                상담 및 문의 상세
              </label>
              <textarea
                rows={2}
                placeholder="희망 배송 주기, 선호 매운맛 단계, 규격 포장 등 문의하실 내용을 자유롭게 적어주세요."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E8E2DC] focus:outline-none focus:border-[#872D35] resize-none"
              />
            </div>

            <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E2DC] flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-semibold text-[#332525]">
                <ShieldCheck className="w-4 h-4 text-[#872D35]" />
                전국 익일 직배송 & 철저한 신선 콜드체인 보장
              </span>
              <span className="text-[11px] text-[#872D35] font-bold">전담 매니저 배정</span>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl text-white font-extrabold text-sm transition-all bg-[#872D35] hover:bg-[#6D242B] flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>접수 처리 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>납품 견적 상담 신청하기</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
