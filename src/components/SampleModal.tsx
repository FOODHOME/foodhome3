import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { submitToFormspree } from '../utils/formspree';
import { 
  X, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Truck,
  Loader2
} from 'lucide-react';

export const SampleModal: React.FC = () => {
  const { isSampleModalOpen, setIsSampleModalOpen, addInquiry, state, showToast } = useApp();

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

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isSampleModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.phone || !formData.contactPerson) {
      alert('상호명, 성함, 연락처를 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);

    const endpoint = state.formspreeEndpoint || 'https://formspree.io/f/xoejykbn';

    const result = await submitToFormspree(endpoint, {
      상호명_매장명: formData.companyName,
      대표자_담당자명: formData.contactPerson,
      연락처: formData.phone,
      이메일: formData.email || '미입력',
      업종형태: formData.businessType,
      신청유형: formData.requestType,
      월예상소진량: formData.monthlyUsage,
      배송희망주소: formData.region || '미입력',
      상세요청사항: formData.message || '요청사항 없음',
      접수경로: '모달 팝업 빠른 샘플 신청',
      접수시각: new Date().toLocaleString('ko-KR'),
      _subject: `[푸드홈 무료샘플] ${formData.companyName} 신청 접수 (${formData.phone})`,
      _replyto: formData.email || undefined
    });

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
    setSubmitted(true);

    if (result.success) {
      showToast('Formspree로 샘플 신청 정보가 안전하게 전달되었습니다.');
    } else {
      showToast('접수 완료 (Formspree: ' + (result.message || '전송 확인 요망') + ')');
    }
  };

  const handleClose = () => {
    setIsSampleModalOpen(false);
    setSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-blue-100 text-blue-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-black text-slate-900">
              사업자 무료 샘플 1kg 신청
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-black text-slate-900">
                샘플 신청이 정상 접수되었습니다!
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                담당자가 배송 정보 확인을 위해 기재해주신 번호({formData.phone})로 빠르게 안내 연락을 드립니다.
              </p>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                닫기
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  전국 외식업 사업자 대상 택배비 전액 무료 지원
                </div>
                <p className="text-blue-800 text-[11px]">
                  푸드홈 시그니처 보쌈무김치 1kg + 최신 B2B 단가표를 함께 발송해 드립니다.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  상호명 / 식당명 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 맛있는보쌈 본점"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#872D35] focus:ring-1 focus:ring-[#872D35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    담당자 성함 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="홍길동 대표"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#872D35] focus:ring-1 focus:ring-[#872D35]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    휴대전화 번호 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="010-0000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#872D35] focus:ring-1 focus:ring-[#872D35]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  배송 희망 주소
                </label>
                <input
                  type="text"
                  placeholder="매장 또는 사업장 주소"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#872D35] focus:ring-1 focus:ring-[#872D35]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  업종 형태
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#872D35] focus:ring-1 focus:ring-[#872D35]"
                >
                  <option value="보쌈·족발 전문점">보쌈·족발 전문점</option>
                  <option value="삼겹살 / 정육식당">삼겹살 / 정육식당</option>
                  <option value="국밥 / 설렁탕 / 백반">국밥 / 설렁탕 / 백반</option>
                  <option value="프랜차이즈 가맹본부">프랜차이즈 가맹본부</option>
                  <option value="창업 준비 중">창업 준비 중</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  남기실 말씀
                </label>
                <textarea
                  rows={2}
                  placeholder="김칫속 샘플 동봉 희망 등 요청사항"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#872D35] focus:ring-1 focus:ring-[#872D35]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl font-bold text-white text-xs sm:text-sm shadow-sm hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: state.theme.primaryColor }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>전송 중...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>무료 샘플 1kg 즉시 신청</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1 text-[11px] text-stone-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Formspree 공식 연동: 접수 데이터가 실시간으로 수집됩니다.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
