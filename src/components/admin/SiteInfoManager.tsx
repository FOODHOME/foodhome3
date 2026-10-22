import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building, Phone, Mail, MapPin, Printer, Clock, FileText, Save } from 'lucide-react';

export const SiteInfoManager: React.FC = () => {
  const { state, updateContent, showToast } = useApp();
  const [form, setForm] = useState({
    companyName: state.content.companyName,
    ceoName: state.content.ceoName,
    businessNumber: state.content.businessNumber,
    mailOrderNumber: state.content.mailOrderNumber,
    factoryAddress: state.content.factoryAddress,
    phone: state.content.phone,
    fax: state.content.fax,
    email: state.content.email,
    csHours: state.content.csHours,
    footerNotice: state.content.footerNotice || '본 사이트의 모든 콘텐츠, 이미지, 제품 디자인은 (주)푸드홈의 자산이며 무단 도용을 금합니다.'
  });

  const handleSave = () => {
    updateContent(form);
    showToast('사이트 기본정보가 성공적으로 저장되었습니다.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#872D35]/10 text-[#872D35]">
              <Building className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-stone-900">사이트 기본정보 관리</h3>
          </div>
          <p className="text-xs text-stone-500">
            상호, 대표자명, 사업자등록번호, 제조 공장 주소, 대표 연락처 및 푸터 법적 표기사항을 수정합니다.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>기본정보 저장</span>
        </button>
      </div>

      {/* Basic Company Info */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <h4 className="text-sm font-black text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <Building className="w-4 h-4 text-[#872D35]" />
          <span>사업자 및 회사 정보</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">회사명 / 상호</label>
            <input
              type="text"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#872D35]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">대표자 성함</label>
            <input
              type="text"
              value={form.ceoName}
              onChange={(e) => setForm({ ...form, ceoName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#872D35]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">사업자등록번호</label>
            <input
              type="text"
              value={form.businessNumber}
              onChange={(e) => setForm({ ...form, businessNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#872D35] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">통신판매업신고번호</label>
            <input
              type="text"
              value={form.mailOrderNumber}
              onChange={(e) => setForm({ ...form, mailOrderNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#872D35]"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">제조공장 및 본사 물류센터 주소</label>
            <input
              type="text"
              value={form.factoryAddress}
              onChange={(e) => setForm({ ...form, factoryAddress: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#872D35]"
            />
          </div>
        </div>
      </div>

      {/* Contact & Hours */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <h4 className="text-sm font-black text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-[#872D35]" />
          <span>연락처 및 고객센터 운영시간</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">대표 전화</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">팩스 번호</label>
            <input
              type="text"
              value={form.fax}
              onChange={(e) => setForm({ ...form, fax: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">대표 이메일</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs font-mono"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold text-stone-700 mb-1">고객센터 운영시간</label>
          <input
            type="text"
            value={form.csHours}
            onChange={(e) => setForm({ ...form, csHours: e.target.value })}
            placeholder="평일 09:00 ~ 18:00 (주말·공휴일 휴무)"
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs"
          />
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold text-stone-700 mb-1">푸터 저작권 및 공지 문구</label>
          <textarea
            rows={2}
            value={form.footerNotice}
            onChange={(e) => setForm({ ...form, footerNotice: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#872D35]"
          />
        </div>
      </div>

    </div>
  );
};
