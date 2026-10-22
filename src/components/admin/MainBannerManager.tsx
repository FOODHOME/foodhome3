import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BannerSlide } from '../../types';
import { uploadImageToStorage } from '../../lib/supabase';
import { 
  Plus, 
  Trash2, 
  Save, 
  Image as ImageIcon, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Sparkles,
  Upload,
  Loader2
} from 'lucide-react';

export const MainBannerManager: React.FC = () => {
  const { state, updateBanners, showToast } = useApp();
  const [banners, setBanners] = useState<BannerSlide[]>(() => {
    return state.content.banners && state.content.banners.length > 0
      ? state.content.banners
      : [
          {
            id: 'banner-1',
            tagline: 'SINCE 1996 · 30년 전통 비법',
            title: '보쌈의 맛을 완성하는 특별한 김치',
            subtitle: '푸드홈 보쌈무김치',
            description: '정성스럽게 만든 맛, 변함없는 품질.',
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
          }
        ];
  });

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFieldChange = (index: number, field: keyof BannerSlide, value: any) => {
    setBanners(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  const handleAddBanner = () => {
    const newSlide: BannerSlide = {
      id: `banner-${Date.now()}`,
      tagline: 'FOODHOME NEW BANNER',
      title: '새로운 메인 배너 슬라이드',
      subtitle: '명품 프리미엄 푸드홈 김치',
      description: '설명 문구를 입력해 주세요. 관리자 페이지에서 자유롭게 수정하실 수 있습니다.',
      subDescription: '신선 콜드체인 직배송',
      imageUrl: './images/banner_bossam.jpg',
      mobileImageUrl: './images/banner_bossam.jpg',
      primaryButtonText: '자세히 보기',
      primaryButtonLink: 'products',
      primaryButtonAction: 'products',
      secondaryButtonText: '무료 샘플 신청',
      secondaryButtonLink: 'sample-board',
      secondaryButtonAction: 'sample',
      order: banners.length + 1,
      isActive: true
    };
    setBanners([...banners, newSlide]);
    setActiveBannerIndex(banners.length);
    showToast('새 배너가 추가되었습니다.');
  };

  const handleDeleteBanner = (index: number) => {
    if (banners.length <= 1) {
      alert('최소 1개 이상의 배너가 유지되어야 합니다.');
      return;
    }
    if (confirm('이 배너를 삭제하시겠습니까?')) {
      const updated = banners.filter((_, i) => i !== index);
      setBanners(updated);
      setActiveBannerIndex(Math.max(0, index - 1));
      showToast('배너가 삭제되었습니다.');
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === banners.length - 1)) {
      return;
    }
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...banners];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    setBanners(reordered);
    setActiveBannerIndex(targetIdx);
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>, isMobile = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const res = await uploadImageToStorage(file, 'banners');
    setIsUploading(false);

    if (res.url) {
      if (isMobile) {
        handleFieldChange(index, 'mobileImageUrl', res.url);
      } else {
        handleFieldChange(index, 'imageUrl', res.url);
      }
      showToast('이미지가 성공적으로 업로드되었습니다.');
    } else {
      alert(res.error || '이미지 업로드에 실패했습니다.');
    }
  };

  const handleSaveAll = () => {
    updateBanners(banners);
  };

  const currentBanner = banners[activeBannerIndex] || banners[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#872D35]/10 text-[#872D35]">
              <ImageIcon className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-stone-900">홈페이지 메인 배너 슬라이더 관리</h3>
          </div>
          <p className="text-xs text-stone-500">
            메인 페이지 최상단 와이드 롤링 배너의 문구, 배경 이미지, 연결 링크, 순서를 직접 관리합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddBanner}
            className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>새 배너 추가</span>
          </button>

          <button
            onClick={handleSaveAll}
            className="px-5 py-2 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>배너 변경사항 저장</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Banner Slides List & Ordering */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-stone-500 block uppercase">
            배너 목록 ({banners.length})
          </span>

          <div className="space-y-2">
            {banners.map((b, idx) => (
              <div
                key={b.id || idx}
                onClick={() => setActiveBannerIndex(idx)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  activeBannerIndex === idx
                    ? 'border-[#872D35] bg-[#872D35]/5 shadow-2xs'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    <img 
                      src={b.imageUrl} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as any).src = './images/banner_bossam.jpg';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-stone-400">0{idx + 1}</span>
                      <span className="text-xs font-bold text-stone-800 truncate block">
                        {b.title || '제목 없음'}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 truncate block">
                      {b.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                    title="위로 이동"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === banners.length - 1}
                    className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-30 cursor-pointer"
                    title="아래로 이동"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleFieldChange(idx, 'isActive', !b.isActive)}
                    className={`p-1 rounded ${b.isActive ? 'text-emerald-600' : 'text-stone-300'}`}
                    title={b.isActive ? '노출 중' : '숨김'}
                  >
                    {b.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(idx)}
                    className="p-1 text-stone-400 hover:text-red-600 cursor-pointer"
                    title="배너 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddBanner}
            className="w-full py-2.5 rounded-xl border border-dashed border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>새 슬라이드 추가</span>
          </button>
        </div>

        {/* Right: Selected Banner Detail Form */}
        {currentBanner && (
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                  SLIDE 0{activeBannerIndex + 1}
                </span>
                <h4 className="text-sm font-extrabold text-stone-900">
                  배너 상세 속성 편집
                </h4>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-700">
                <input
                  type="checkbox"
                  checked={currentBanner.isActive !== false}
                  onChange={(e) => handleFieldChange(activeBannerIndex, 'isActive', e.target.checked)}
                  className="rounded text-[#872D35] focus:ring-[#872D35]"
                />
                <span>홈페이지에 노출</span>
              </label>
            </div>

            {/* Images: Desktop & Mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  배너 배경 이미지 (PC용)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentBanner.imageUrl}
                    onChange={(e) => handleFieldChange(activeBannerIndex, 'imageUrl', e.target.value)}
                    placeholder="./images/banner_bossam.jpg 또는 이미지 URL"
                    className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#872D35] font-mono"
                  />
                  <label className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>업로드</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(activeBannerIndex, e, false)}
                    />
                  </label>
                </div>
                <div className="h-28 rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                  <img
                    src={currentBanner.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = './images/banner_bossam.jpg';
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  모바일 배경 이미지 (선택 사항)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentBanner.mobileImageUrl || ''}
                    onChange={(e) => handleFieldChange(activeBannerIndex, 'mobileImageUrl', e.target.value)}
                    placeholder="미입력 시 PC 이미지와 동일하게 적용"
                    className="flex-1 px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#872D35] font-mono"
                  />
                  <label className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>업로드</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(activeBannerIndex, e, true)}
                    />
                  </label>
                </div>
                <div className="h-28 rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                  <img
                    src={currentBanner.mobileImageUrl || currentBanner.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src = './images/banner_bossam.jpg';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Texts */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  배너 상단 작은 문구 (태그라인/뱃지)
                </label>
                <input
                  type="text"
                  value={currentBanner.tagline}
                  onChange={(e) => handleFieldChange(activeBannerIndex, 'tagline', e.target.value)}
                  placeholder="예: SINCE 1996 · 30년 전통 비법"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#872D35]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    배너 상단 메인 타이틀
                  </label>
                  <input
                    type="text"
                    value={currentBanner.title}
                    onChange={(e) => handleFieldChange(activeBannerIndex, 'title', e.target.value)}
                    placeholder="예: 보쌈의 맛을 완성하는 특별한 김치"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#872D35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    배너 서브타이틀 (큰 글씨)
                  </label>
                  <input
                    type="text"
                    value={currentBanner.subtitle}
                    onChange={(e) => handleFieldChange(activeBannerIndex, 'subtitle', e.target.value)}
                    placeholder="예: 푸드홈 명품 보쌈무김치"
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#872D35]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  배너 본문 설명 문구
                </label>
                <textarea
                  rows={2}
                  value={currentBanner.description}
                  onChange={(e) => handleFieldChange(activeBannerIndex, 'description', e.target.value)}
                  placeholder="배너 상세 설명 문구를 입력하세요."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#872D35]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  배너 하단 안내 문구 (신뢰 포인트 / 배송 안내)
                </label>
                <input
                  type="text"
                  value={currentBanner.subDescription || ''}
                  onChange={(e) => handleFieldChange(activeBannerIndex, 'subDescription', e.target.value)}
                  placeholder="예: 우리 가족이 먹는 안심 위생시설 제조 · 전국 당일 냉장 직배송"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#872D35]"
                />
              </div>
            </div>

            {/* Buttons Setup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-800 block">
                  1번 메인 버튼 (강조색)
                </span>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">버튼 문구</label>
                  <input
                    type="text"
                    value={currentBanner.primaryButtonText}
                    onChange={(e) => handleFieldChange(activeBannerIndex, 'primaryButtonText', e.target.value)}
                    placeholder="예: 제품 자세히 보기"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">연결 페이지/동작</label>
                  <select
                    value={currentBanner.primaryButtonAction || 'products'}
                    onChange={(e) => {
                      handleFieldChange(activeBannerIndex, 'primaryButtonAction', e.target.value);
                      handleFieldChange(activeBannerIndex, 'primaryButtonLink', e.target.value);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-white"
                  >
                    <option value="products">제품소개 (products)</option>
                    <option value="sample">사업자 무료 샘플 신청 게시판 (sample-board)</option>
                    <option value="quote">1:1 대량 납품 견적 상담 게시판 (quote-board)</option>
                    <option value="about">회사소개 (about)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-800 block">
                  2번 보조 버튼 (투명 글래스)
                </span>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">버튼 문구</label>
                  <input
                    type="text"
                    value={currentBanner.secondaryButtonText || ''}
                    onChange={(e) => handleFieldChange(activeBannerIndex, 'secondaryButtonText', e.target.value)}
                    placeholder="예: 1:1 대량 납품 견적 상담"
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">연결 페이지/동작</label>
                  <select
                    value={currentBanner.secondaryButtonAction || 'quote'}
                    onChange={(e) => {
                      handleFieldChange(activeBannerIndex, 'secondaryButtonAction', e.target.value);
                      handleFieldChange(activeBannerIndex, 'secondaryButtonLink', e.target.value);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-200 text-xs bg-white"
                  >
                    <option value="quote">1:1 대량 납품 견적 상담 게시판 (quote-board)</option>
                    <option value="sample">사업자 무료 샘플 신청 게시판 (sample-board)</option>
                    <option value="products">제품소개 (products)</option>
                    <option value="about">회사소개 (about)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end">
              <button
                onClick={handleSaveAll}
                className="px-6 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>수정사항 홈페이지에 반영하기</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
