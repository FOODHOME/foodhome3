import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MainSectionConfig } from '../../types';
import { uploadImageToStorage } from '../../lib/supabase';
import { 
  Layout, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown, 
  Edit3, 
  Save, 
  Upload, 
  RotateCcw,
  Sparkles,
  ExternalLink,
  Layers,
  ArrowRight
} from 'lucide-react';

export const MainSectionsManager: React.FC = () => {
  const { state, updateMainSections, setActiveAdminTab, showToast } = useApp();

  const defaultSections: MainSectionConfig[] = [
    { id: 'hero', name: '메인 상단 슬라이드 배너', badge: 'HERO BANNER', title: '메인 비주얼 배너', description: '메인 화면 최상단 롤링 배너 슬라이더', visible: true, order: 1 },
    { id: 'productSlider', name: '대표 제품 슬라이더', badge: 'SIGNATURE PRODUCT SLIDER', title: '푸드홈 대표 제품 둘러보기', description: '30년 전통 비법과 특허 수분제어 공법으로 빚어낸 명품 보쌈무김치 & 비법 김칫속', visible: true, order: 2 },
    { id: 'sampleRealtimeStatus', name: '실시간 샘플 접수 현황 바', badge: 'REALTIME STATUS', title: '전국 외식업소 실시간 무료 샘플 접수 현황', description: '매일 아침 갓 담근 신선한 김치만을 보내드립니다', visible: true, order: 3 },
    { id: 'actionBanners', name: 'B2B 퀵 서비스 액션 배너', badge: 'B2B QUICK ACTIONS', title: '외식업 대표님을 위한 푸드홈 전용 지원 서비스', description: '안심 샘플 신청부터 대량 정기 납품까지 원스톱으로 지원합니다', visible: true, order: 4 },
    { id: 'productCategories', name: '제품 카테고리 안내', badge: 'FOOD CATEGORIES', title: '전문 외식업소를 위한 4대 제품 라인업', description: '업종과 주방 운영 형태에 맞춰 최적화된 패키지와 레시피를 제안합니다.', visible: true, order: 5 },
    { id: 'products', name: '대표 제품 카탈로그 목록', badge: 'PRODUCT CATALOG', title: '푸드홈 전체 제품 카탈로그', description: '원재료 타협 없이 100% 국산 농산물로 정직하게 제조합니다.', visible: true, order: 6 },
    { id: 'features', name: '30년 전통 비법 & 브랜드 스토리', badge: 'BRAND HERITAGE & PHILOSOPHY', title: '30년 전통 비법과 타협 없는 원칙', description: '시간이 흘러도 물 생김 없는 특허 수분제어 절임 공법', visible: true, order: 7 },
    { id: 'process', name: '안심 위생 제조 공정', badge: 'CLEAN AUTOMATION PROCESS', title: '엄격한 기준의 스마트 클린 제조 시스템', description: '산지 계약재배 입고부터 에어샤워, 금속검출기 통과까지 철저하게 관리합니다.', visible: true, order: 8 },
    { id: 'reviews', name: '고객사 추천평 (외식업 파트너 후기)', badge: 'PARTNER REVIEWS', title: '전국 480여 개 외식 파트너의 생생한 찬사', description: '고기 맛을 살려주는 보쌈무김치와 김칫속으로 매장 객단가가 상승했습니다.', visible: true, order: 9 },
    { id: 'posts', name: '공지사항 & 외식 레시피 가이드', badge: 'NEWS & NOTICES', title: '푸드홈 공지사항 & 외식 레시피 가이드', description: '위생안전 소식부터 보쌈 매장 사장님들을 위한 조리 꿀팁, 프랜차이즈 납품 소식을 전합니다.', visible: true, order: 10 },
    { id: 'inquiry', name: '하단 1kg 무료 샘플 간편 신청', badge: 'FREE 1KG SAMPLE', title: '직접 맛을 보시고 결정하세요. 1kg 무료 샘플팩 신청 접수 중', description: '사업자등록증을 보유하신 모든 외식업 대표님께 푸드홈 시그니처 보쌈무김치를 무료로 발송해 드립니다.', buttonText: '무료 샘플 1kg 신청하기', buttonLink: 'sample-board-write', visible: true, order: 11 }
  ];

  const getMergedSections = (): MainSectionConfig[] => {
    if (!state.content.mainSections || state.content.mainSections.length === 0) {
      return defaultSections;
    }
    const existing = [...state.content.mainSections];
    let maxOrder = Math.max(...existing.map(s => s.order || 0), 0);
    defaultSections.forEach(defSec => {
      const found = existing.some(s => s.id === defSec.id);
      if (!found) {
        maxOrder += 1;
        existing.push({ ...defSec, order: maxOrder });
      }
    });
    return existing.sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const [localSections, setLocalSections] = useState<MainSectionConfig[]>(getMergedSections);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Sync with state if changed
  React.useEffect(() => {
    setLocalSections(getMergedSections());
  }, [state.content.mainSections]);

  const handleToggleVisible = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const updated = localSections.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
    setLocalSections(updated);
    updateMainSections(updated);
  };

  const handleMoveOrder = (idx: number, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === localSections.length - 1)) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const copy = [...localSections];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    const reordered = copy.map((sec, i) => ({ ...sec, order: i + 1 }));
    setLocalSections(reordered);
    updateMainSections(reordered);
  };

  const handleFieldChange = (id: string, field: keyof MainSectionConfig, val: any) => {
    setLocalSections(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const handleSaveAll = () => {
    updateMainSections(localSections);
    showToast('메인페이지 섹션 설정이 홈페이지에 성공적으로 저장되었습니다.');
  };

  const handleImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const res = await uploadImageToStorage(file, 'sections');
    setIsUploading(false);

    if (res.url) {
      handleFieldChange(id, 'imageUrl', res.url);
      showToast('섹션 이미지가 업로드되었습니다.');
    } else {
      alert(res.error || '이미지 업로드에 실패했습니다.');
    }
  };

  const activeEditingSection = localSections.find(s => s.id === editingSectionId);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#872D35]/10 text-[#872D35]">
              <Layout className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-stone-900">메인페이지 섹션 관리</h3>
          </div>
          <p className="text-xs text-stone-500">
            홈페이지 첫 화면을 구성하는 각 섹션의 노출 여부, 순서, 제목, 부제목, 설명 문구, 버튼 및 이미지를 직접 수정합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveAll}
            className="px-6 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>섹션 전체 설정 저장</span>
          </button>
        </div>
      </div>

      {/* Grid: Left Section List & Right Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Section List */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <span className="text-xs font-extrabold text-stone-700">섹션 목록 및 순서 ({localSections.length}개)</span>
            <span className="text-[11px] text-stone-400">클릭하여 내용 수정</span>
          </div>

          <div className="space-y-2">
            {localSections.map((sec, idx) => {
              const isSelected = editingSectionId === sec.id;
              const isHero = sec.id === 'hero';

              return (
                <div
                  key={sec.id}
                  onClick={() => setEditingSectionId(sec.id)}
                  className={`
                    p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 text-xs
                    ${isSelected 
                      ? 'border-[#872D35] bg-[#FAF8F5] ring-2 ring-[#872D35]/20 shadow-xs' 
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100/70'}
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-md bg-stone-200 text-stone-700 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold truncate ${sec.visible ? 'text-stone-900' : 'text-stone-400 line-through'}`}>
                          {sec.name}
                        </span>
                        {isHero && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold shrink-0">
                            배너 연동
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 truncate mt-0.5">
                        {sec.title || sec.description || '내용 설정'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Show/Hide Toggle Button */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleVisible(sec.id, e)}
                      title={sec.visible ? "홈페이지에 표시 중 (클릭 시 숨김)" : "홈페이지에서 숨김 (클릭 시 표시)"}
                      className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                        sec.visible 
                          ? 'text-emerald-600 hover:bg-emerald-50' 
                          : 'text-stone-400 hover:bg-stone-200'
                      }`}
                    >
                      {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Reorder Buttons */}
                    <div className="flex flex-col">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={(e) => handleMoveOrder(idx, 'up', e)}
                        className="p-0.5 text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer"
                        title="위로 이동"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === localSections.length - 1}
                        onClick={(e) => handleMoveOrder(idx, 'down', e)}
                        className="p-0.5 text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer"
                        title="아래로 이동"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Section Editor */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
          {activeEditingSection ? (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#872D35] text-white text-[10px] font-mono font-bold">
                      SECTION #{localSections.findIndex(s => s.id === activeEditingSection.id) + 1}
                    </span>
                    <h4 className="text-sm font-black text-stone-900">{activeEditingSection.name}</h4>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">선택된 섹션의 텍스트, 이미지 및 버튼 동작을 편집합니다.</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleVisible(activeEditingSection.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                    activeEditingSection.visible
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-stone-100 text-stone-500 border border-stone-200'
                  }`}
                >
                  {activeEditingSection.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{activeEditingSection.visible ? '홈페이지 노출 중' : '숨김 상태'}</span>
                </button>
              </div>

              {activeEditingSection.id === 'hero' ? (
                <div className="p-5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>메인 상단 비주얼 슬라이드 배너 안내</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    메인 배너의 슬라이드 이미지, 제목, 설명 문구, 버튼 링크는 상단 전용 메뉴인 
                    <strong className="text-[#872D35]"> '메인 배너 관리' </strong>에서 다중 슬라이드로 개별 등록 및 수정하실 수 있습니다.
                  </p>
                  <button
                    onClick={() => setActiveAdminTab('banners')}
                    className="px-4 py-2 rounded-lg bg-[#872D35] hover:bg-[#6D242B] text-white font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <span>메인 배너 관리 바로가기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : null}

              {/* Form Fields */}
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">섹션 관리 이름</label>
                  <input
                    type="text"
                    value={activeEditingSection.name || ''}
                    onChange={(e) => handleFieldChange(activeEditingSection.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">상단 영문/뱃지 문구 (Badge)</label>
                    <input
                      type="text"
                      value={activeEditingSection.badge || ''}
                      onChange={(e) => handleFieldChange(activeEditingSection.id, 'badge', e.target.value)}
                      placeholder="예: SIGNATURE PRODUCT SLIDER"
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">섹션 메인 제목 (Title)</label>
                    <input
                      type="text"
                      value={activeEditingSection.title || ''}
                      onChange={(e) => handleFieldChange(activeEditingSection.id, 'title', e.target.value)}
                      placeholder="예: 푸드홈 대표 제품 둘러보기"
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">섹션 설명 문구 (Description)</label>
                  <textarea
                    rows={3}
                    value={activeEditingSection.description || ''}
                    onChange={(e) => handleFieldChange(activeEditingSection.id, 'description', e.target.value)}
                    placeholder="섹션을 소개하는 설명 문구를 입력하세요..."
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white leading-relaxed"
                  />
                </div>

                {/* Optional Image */}
                <div>
                  <label className="block font-bold text-stone-700 mb-1">섹션 대표 이미지 (선택)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={activeEditingSection.imageUrl || ''}
                      onChange={(e) => handleFieldChange(activeEditingSection.id, 'imageUrl', e.target.value)}
                      placeholder="이미지 URL 또는 파일 업로드"
                      className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-white font-mono text-[11px]"
                    />
                    <label className="px-3 py-2 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>업로드</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(activeEditingSection.id, e)}
                      />
                    </label>
                  </div>
                </div>

                {/* Optional CTA Button */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">버튼 문구 (선택)</label>
                    <input
                      type="text"
                      value={activeEditingSection.buttonText || ''}
                      onChange={(e) => handleFieldChange(activeEditingSection.id, 'buttonText', e.target.value)}
                      placeholder="예: 무료 샘플 1kg 신청하기"
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">버튼 연결 주소/페이지 (선택)</label>
                    <input
                      type="text"
                      value={activeEditingSection.buttonLink || ''}
                      onChange={(e) => handleFieldChange(activeEditingSection.id, 'buttonLink', e.target.value)}
                      placeholder="예: sample-board-write 또는 https://..."
                      className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="px-5 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>이 섹션 변경사항 저장</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-stone-400 space-y-2">
              <Layers className="w-8 h-8 mx-auto text-stone-300" />
              <p className="text-xs font-bold">좌측 목록에서 편집할 섹션을 선택해 주세요.</p>
              <p className="text-[11px] text-stone-400">제목, 부제목, 설명 문구, 버튼 및 이미지를 즉시 수정할 수 있습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
