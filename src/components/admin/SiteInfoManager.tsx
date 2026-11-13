import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { uploadImageToStorage } from '../../lib/supabase';
import { Building, Phone, Mail, MapPin, Printer, Clock, FileText, Save, Image as ImageIcon, Upload, RotateCcw } from 'lucide-react';
import { FoodhomeLogo } from '../FoodhomeLogo';

export const SiteInfoManager: React.FC = () => {
  const { state, updateContent, showToast } = useApp();
  const [form, setForm] = useState({
    logoUrl: state.content.logoUrl || '',
    headerLogoWidth: state.content.headerLogoWidth || 160,
    footerLogoWidth: state.content.footerLogoWidth || 140,
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputEl = e.target;
    const file = inputEl.files?.[0];
    inputEl.value = '';
    if (!file) return;

    // Check file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('PNG, JPG, JPEG, WEBP 형식의 이미지를 업로드해 주세요.');
      return;
    }

    const res = await uploadImageToStorage(file, 'logos');
    if (res.url) {
      const dataUrl = res.url;
      setForm(prev => ({ ...prev, logoUrl: dataUrl }));
      updateContent({ logoUrl: dataUrl });
      showToast('로고 이미지가 업로드되어 상단/하단에 즉시 적용되었습니다.');
    } else {
      alert(res.error || '로고 이미지 업로드에 실패했습니다.');
    }
  };

  const handleResetLogo = () => {
    if (confirm('로고를 기존 푸드홈 기본 공식 로고로 복원하시겠습니까?')) {
      setForm(prev => ({
        ...prev,
        logoUrl: '',
        headerLogoWidth: 160,
        footerLogoWidth: 140
      }));
      updateContent({
        logoUrl: '',
        headerLogoWidth: 160,
        footerLogoWidth: 140
      });
      showToast('기본 공식 로고로 복원되었습니다.');
    }
  };

  const handleSave = () => {
    updateContent(form);
    showToast('사이트 기본정보 및 로고 설정이 성공적으로 저장되었습니다.');
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
            <h3 className="text-base font-bold text-stone-900">회사 기본정보 관리</h3>
          </div>
          <p className="text-xs text-stone-500">
            상단/하단 공식 로고, 상호, 대표자명, 사업자등록번호, 제조 공장 주소 및 고객센터 정보를 통합 수정합니다.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>기본정보 및 로고 저장</span>
        </button>
      </div>

      {/* 1. Official Logo Management Section (상단/하단 로고 관리) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-[#872D35]/10 text-[#872D35]">
              <ImageIcon className="w-4 h-4" />
            </span>
            <div>
              <h4 className="text-sm font-black text-stone-900">홈페이지 공식 로고 관리</h4>
              <p className="text-[11px] text-stone-500 mt-0.5">
                로고 이미지를 변경하면 상단 헤더와 하단 푸터에 <strong>동시에 반영</strong>되며, 투명 배경 PNG도 깔끔하게 표시됩니다.
              </p>
            </div>
          </div>

          {form.logoUrl && (
            <button
              type="button"
              onClick={handleResetLogo}
              className="text-xs font-bold text-[#872D35] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>기본 공식 로고로 복원</span>
            </button>
          )}
        </div>

        {/* Live Previews: Header (Light background) & Footer (Dark background) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Header Preview */}
          <div className="p-4 rounded-xl border border-stone-200 bg-white flex flex-col items-center justify-between gap-3 shadow-2xs">
            <div className="w-full flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="text-[11px] font-bold text-stone-700">상단 헤더 로고 미리보기 (밝은 배경)</span>
              <span className="text-[10px] font-mono font-semibold text-[#872D35] bg-[#872D35]/10 px-2 py-0.5 rounded">
                가로 폭: {form.headerLogoWidth}px
              </span>
            </div>
            <div className="w-full py-4 px-2 flex items-center justify-center min-h-[70px] bg-white border border-dashed border-stone-200 rounded-lg overflow-hidden">
              <FoodhomeLogo variant="dark" width={form.headerLogoWidth} />
            </div>
            <p className="text-[10px] text-stone-400 text-center">
              실제 상단 헤더 배경(흰색) 위에 투명하게 올라간 상태입니다.
            </p>
          </div>

          {/* Footer Preview */}
          <div className="p-4 rounded-xl border border-stone-800 bg-[#221A1A] text-stone-200 flex flex-col items-center justify-between gap-3 shadow-2xs">
            <div className="w-full flex items-center justify-between border-b border-stone-800 pb-2">
              <span className="text-[11px] font-bold text-stone-300">하단 푸터 로고 미리보기 (어두운 배경)</span>
              <span className="text-[10px] font-mono font-semibold text-amber-300 bg-white/10 px-2 py-0.5 rounded">
                가로 폭: {form.footerLogoWidth}px
              </span>
            </div>
            <div className="w-full py-4 px-2 flex items-center justify-center min-h-[70px] bg-[#221A1A] border border-dashed border-stone-700 rounded-lg overflow-hidden">
              <FoodhomeLogo variant="light" width={form.footerLogoWidth} />
            </div>
            <p className="text-[10px] text-stone-400 text-center">
              실제 하단 푸터 배경(#221A1A) 위에 투명하게 올라간 상태입니다.
            </p>
          </div>
        </div>

        {/* Upload & Direct URL Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center pt-2">
          <div className="sm:col-span-5">
            <label className="text-xs font-bold text-stone-700 block mb-1">
              로고 이미지 직접 업로드 <span className="text-stone-400 font-normal">(PNG, JPG, WEBP)</span>
            </label>
            <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-[#872D35]/40 hover:border-[#872D35] bg-[#872D35]/5 hover:bg-[#872D35]/10 text-[#872D35] text-xs font-bold cursor-pointer transition-colors shadow-2xs">
              <Upload className="w-4 h-4" />
              <span>내 PC에서 로고 파일 선택</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="sm:col-span-7">
            <label className="text-xs font-bold text-stone-700 block mb-1">
              또는 로고 이미지 URL 직접 입력
            </label>
            <input
              type="text"
              value={form.logoUrl}
              onChange={(e) => {
                const url = e.target.value;
                setForm(prev => ({ ...prev, logoUrl: url }));
                updateContent({ logoUrl: url });
              }}
              placeholder="예: https://... 또는 /assets/logo.png"
              className="w-full px-3 py-2 text-xs rounded-lg border border-stone-200 focus:outline-none focus:border-[#872D35] font-mono"
            />
          </div>
        </div>

        {/* Individual Logo Width Controls */}
        <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
          <h5 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
            <span>상단 / 하단 로고 개별 크기(가로 폭) 조절</span>
            <span className="text-[10px] font-normal text-stone-500">(원본 이미지 비율은 자동으로 유지됩니다)</span>
          </h5>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Header Logo Width Slider & Input */}
            <div className="bg-white p-3 rounded-lg border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">상단 헤더 로고 크기</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={60}
                    max={320}
                    step={5}
                    value={form.headerLogoWidth}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 160;
                      setForm(prev => ({ ...prev, headerLogoWidth: val }));
                      updateContent({ headerLogoWidth: val });
                    }}
                    className="w-16 px-1.5 py-0.5 text-xs text-right font-mono font-bold border border-stone-200 rounded"
                  />
                  <span className="text-xs font-bold text-stone-500">px</span>
                </div>
              </div>
              <input
                type="range"
                min={80}
                max={280}
                step={5}
                value={form.headerLogoWidth}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setForm(prev => ({ ...prev, headerLogoWidth: val }));
                  updateContent({ headerLogoWidth: val });
                }}
                className="w-full accent-[#872D35] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>작게 (80px)</span>
                <span>기본 권장 (160px)</span>
                <span>크게 (280px)</span>
              </div>
            </div>

            {/* Footer Logo Width Slider & Input */}
            <div className="bg-white p-3 rounded-lg border border-stone-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-700">하단 푸터 로고 크기</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={60}
                    max={320}
                    step={5}
                    value={form.footerLogoWidth}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 140;
                      setForm(prev => ({ ...prev, footerLogoWidth: val }));
                      updateContent({ footerLogoWidth: val });
                    }}
                    className="w-16 px-1.5 py-0.5 text-xs text-right font-mono font-bold border border-stone-200 rounded"
                  />
                  <span className="text-xs font-bold text-stone-500">px</span>
                </div>
              </div>
              <input
                type="range"
                min={80}
                max={260}
                step={5}
                value={form.footerLogoWidth}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setForm(prev => ({ ...prev, footerLogoWidth: val }));
                  updateContent({ footerLogoWidth: val });
                }}
                className="w-full accent-[#872D35] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>작게 (80px)</span>
                <span>기본 권장 (140px)</span>
                <span>크게 (260px)</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-stone-500 leading-relaxed bg-amber-50/60 border border-amber-200/80 p-2.5 rounded-lg">
            💡 <strong>투명 배경 PNG 이미지 권장</strong>: 투명 배경(누끼) PNG 파일을 업로드하시면 별도의 흰색 박스나 테두리 없이 상단 흰색 헤더와 하단 어두운 푸터 배경 위에 깨끗하고 자연스럽게 안착됩니다.
          </div>
        </div>
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
