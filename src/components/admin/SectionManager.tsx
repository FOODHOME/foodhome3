import React, { useState } from 'react';
import { CustomSectionItem, SectionType } from '../../types';
import { uploadImageToStorage } from '../../lib/supabase';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown, 
  Upload, 
  X, 
  Check, 
  Layers, 
  Image as ImageIcon, 
  Type, 
  AlignLeft, 
  CreditCard, 
  ListOrdered, 
  MousePointerClick, 
  Minus, 
  Sparkles,
  ArrowRight,
  RotateCcw,
  PenTool,
  MoveVertical
} from 'lucide-react';

interface SectionManagerProps {
  title: string;
  subtitle?: string;
  sections: CustomSectionItem[];
  fallbackSections?: CustomSectionItem[];
  onChange: (updatedSections: CustomSectionItem[]) => void;
  onSave?: () => void;
}

const SECTION_TYPE_LABELS: Record<SectionType, { label: string; desc: string; icon: any }> = {
  heading: { label: '제목 블록', desc: '대제목 및 소제목 헤더', icon: Type },
  text: { label: '텍스트 설명 블록', desc: '장문 설명 및 텍스트 안내', icon: AlignLeft },
  image: { label: '단일 이미지 블록', desc: '와이드 단독 이미지 (크기 조절)', icon: ImageIcon },
  image_text: { label: '이미지 + 텍스트 블록', desc: '이미지와 텍스트 병렬 배치 (좌/우/상단)', icon: Layers },
  signature: { label: '대표이사 서명 / 직책', desc: '직책, 성함 및 서명 이미지', icon: PenTool },
  spacer: { label: '여백 조정 블록', desc: '섹션 간 세로 간격 여백', icon: MoveVertical },
  multi_image: { label: '다중 이미지 갤러리', desc: '2~4장 이미지 그리드', icon: ImageIcon },
  info_list: { label: '제품 정보표 (스펙)', desc: '항목/내용 규격 테이블', icon: ListOrdered },
  feature_cards: { label: '특징 카드 그리드', desc: '핵심 차별화 포인트 카드', icon: CreditCard },
  button_cta: { label: '신청 및 문의 버튼 (CTA)', desc: '샘플 신청/견적 문의 강조 배너', icon: MousePointerClick },
  divider: { label: '구분선 블록', desc: '섹션 간 시각적 구분선', icon: Minus }
};

export const SectionManager: React.FC<SectionManagerProps> = ({
  title,
  subtitle,
  sections,
  fallbackSections = [],
  onChange,
  onSave
}) => {
  // Current active sections: if empty, display fallback sections as editable template
  const currentSections = sections && sections.length > 0 ? sections : fallbackSections;

  const [editingSection, setEditingSection] = useState<CustomSectionItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Helper for reordering
  const handleMove = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === currentSections.length - 1)) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const copy = [...currentSections];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    const reordered = copy.map((sec, i) => ({ ...sec, order: i + 1 }));
    onChange(reordered);
  };

  // Helper for toggling visibility
  const handleToggleVisible = (index: number) => {
    const copy = [...currentSections];
    copy[index] = { ...copy[index], visible: copy[index].visible === false ? true : false };
    onChange(copy);
  };

  // Helper for deleting section
  const handleDelete = (index: number) => {
    if (confirm('이 섹션 블록을 삭제하시겠습니까?')) {
      const copy = currentSections.filter((_, i) => i !== index);
      const reordered = copy.map((sec, i) => ({ ...sec, order: i + 1 }));
      onChange(reordered);
    }
  };

  // Open modal for new section
  const handleOpenAddModal = () => {
    const newSec: CustomSectionItem = {
      id: 'sec-' + Date.now(),
      type: 'image_text',
      title: '새로운 섹션 제목',
      subtitle: '섹션 소제목 설명 문구',
      badge: 'NEW',
      content: '이곳에 상세 설명 문구를 입력하세요.',
      imagePosition: 'right',
      visible: true,
      order: currentSections.length + 1
    };
    setEditingSection(newSec);
    setIsModalOpen(true);
  };

  // Open modal for editing existing section
  const handleOpenEditModal = (sec: CustomSectionItem) => {
    setEditingSection(JSON.parse(JSON.stringify(sec)));
    setIsModalOpen(true);
  };

  // Save section from modal
  const handleSaveModal = () => {
    if (!editingSection) return;
    const exists = currentSections.some(s => s.id === editingSection.id);
    let updated: CustomSectionItem[];
    if (exists) {
      updated = currentSections.map(s => s.id === editingSection.id ? editingSection : s);
    } else {
      updated = [...currentSections, editingSection];
    }
    const reordered = updated.map((s, i) => ({ ...s, order: i + 1 }));
    onChange(reordered);
    setIsModalOpen(false);
    setEditingSection(null);
  };

  // Reset to default template
  const handleResetToDefault = () => {
    if (confirm('모든 커스텀 섹션을 초기 추천 템플릿으로 되돌리시겠습니까?')) {
      onChange(fallbackSections);
    }
  };

  // Image upload handler
  const handleUploadImage = async (field: 'imageUrl' | 'bgImage' | 'signatureImageUrl' | { type: 'multi'; index: number }, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingSection) return;
    setIsUploading(true);
    const res = await uploadImageToStorage(file, 'sections');
    setIsUploading(false);

    if (res.url) {
      if (typeof field === 'string') {
        setEditingSection({ ...editingSection, [field]: res.url });
      } else if (field.type === 'multi') {
        const curImages = [...(editingSection.images || [])];
        curImages[field.index] = res.url;
        setEditingSection({ ...editingSection, images: curImages });
      }
    } else {
      alert(res.error || '이미지 업로드에 실패했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-stone-50 border border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#872D35]" />
            <h4 className="text-xs sm:text-sm font-black text-stone-900">{title}</h4>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#872D35]/10 text-[#872D35]">
              {currentSections.length}개 블록
            </span>
          </div>
          {subtitle && <p className="text-[11px] text-stone-500 mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {fallbackSections.length > 0 && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="기본 추천 블록으로 복원"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>기본 복원</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-3.5 py-1.5 rounded-lg bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 섹션 블록 추가</span>
          </button>
        </div>
      </div>

      {/* Sections List */}
      <div className="space-y-2">
        {currentSections.map((sec, idx) => {
          const typeMeta = SECTION_TYPE_LABELS[sec.type] || SECTION_TYPE_LABELS.text;
          const TypeIcon = typeMeta.icon;
          const isHidden = sec.visible === false;

          return (
            <div
              key={sec.id || idx}
              className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                isHidden 
                  ? 'bg-stone-50/70 border-stone-200 opacity-60' 
                  : 'bg-white border-stone-200 hover:border-stone-300 shadow-2xs'
              }`}
            >
              {/* Order & Type badge */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center font-mono font-bold text-xs text-stone-600 shrink-0">
                  {idx + 1}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="p-1 rounded bg-[#872D35]/10 text-[#872D35]">
                    <TypeIcon className="w-4 h-4" />
                  </span>
                  <span className="text-[11px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                    {typeMeta.label}
                  </span>
                </div>

                {/* Title & Preview */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {sec.badge && (
                      <span className="text-[10px] font-black text-[#872D35] bg-[#872D35]/5 px-1.5 py-0.2 rounded border border-[#872D35]/15">
                        {sec.badge}
                      </span>
                    )}
                    <span className="text-xs font-black text-stone-900 truncate">
                      {sec.title || (sec.type === 'divider' ? '— 구분선 —' : '제목 없음')}
                    </span>
                    {sec.imagePosition && (
                      <span className="text-[10px] text-stone-400 font-mono">
                        ({sec.imagePosition === 'left' ? '이미지 좌측' : sec.imagePosition === 'right' ? '이미지 우측' : '이미지 상단'})
                      </span>
                    )}
                  </div>
                  {sec.content && (
                    <p className="text-[11px] text-stone-500 truncate mt-0.5 max-w-lg">
                      {sec.content}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleVisible(idx)}
                  className={`p-1.5 rounded-lg cursor-pointer ${
                    !isHidden ? 'text-emerald-600 hover:bg-emerald-50' : 'text-stone-400 hover:bg-stone-100'
                  }`}
                  title={!isHidden ? '표시 중' : '숨김 상태'}
                >
                  {!isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, 'up')}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
                  title="위로 이동"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  disabled={idx === currentSections.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 disabled:opacity-20 cursor-pointer"
                  title="아래로 이동"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditModal(sec)}
                  className="p-1.5 rounded-lg text-[#872D35] hover:bg-[#872D35]/10 cursor-pointer"
                  title="내용 수정"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  title="블록 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Edit / Add Section Block */}
      {isModalOpen && editingSection && (
        <div className="fixed inset-0 z-70 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#872D35]/10 text-[#872D35]">
                  <Layers className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="text-base font-black text-stone-900">
                    콘텐츠 섹션 블록 편집
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    유형을 선택하고 제목, 본문, 이미지 및 배치 방식을 설정하세요.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              
              {/* 1. Section Type Selector */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  섹션 블록 유형 선택
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(Object.keys(SECTION_TYPE_LABELS) as SectionType[]).map((typeKey) => {
                    const meta = SECTION_TYPE_LABELS[typeKey];
                    const Icon = meta.icon;
                    const isSelected = editingSection.type === typeKey;

                    return (
                      <button
                        key={typeKey}
                        type="button"
                        onClick={() => setEditingSection({ ...editingSection, type: typeKey })}
                        className={`p-2.5 rounded-xl border text-left flex items-start gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#872D35] bg-[#872D35]/5 ring-1 ring-[#872D35]'
                            : 'border-stone-200 bg-white hover:bg-stone-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${isSelected ? 'text-[#872D35]' : 'text-stone-500'}`} />
                        <div className="min-w-0">
                          <span className={`text-xs block font-bold truncate ${isSelected ? 'text-[#872D35]' : 'text-stone-800'}`}>
                            {meta.label}
                          </span>
                          <span className="text-[10px] text-stone-400 block truncate">
                            {meta.desc}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Common: Title, Subtitle, Badge */}
              {editingSection.type !== 'divider' && editingSection.type !== 'spacer' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        섹션 메인 제목 {editingSection.type !== 'signature' && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        value={editingSection.title || ''}
                        onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                        placeholder={editingSection.type === 'signature' ? "예: 서명 안내 문구 (선택)" : "예: 30년 전통 푸드홈만의 압도적인 차별화 포인트"}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white focus:border-[#872D35]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        상단 배지 태그
                      </label>
                      <input
                        type="text"
                        value={editingSection.badge || ''}
                        onChange={(e) => setEditingSection({ ...editingSection, badge: e.target.value })}
                        placeholder="예: CHEF'S CRAFT"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white text-[#872D35] font-bold"
                      />
                    </div>
                  </div>

                  {editingSection.type !== 'signature' && (
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        소제목 / 설명 요약
                      </label>
                      <input
                        type="text"
                        value={editingSection.subtitle || ''}
                        onChange={(e) => setEditingSection({ ...editingSection, subtitle: e.target.value })}
                        placeholder="예: 원가와 타협하지 않는 100% 국산 농산물과 특허 수분제어 절임 공법"
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white"
                      />
                    </div>
                  )}
                </>
              )}

              {/* 3. Image Alignment Toggle for image_text */}
              {editingSection.type === 'image_text' && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <label className="block text-xs font-bold text-stone-700">
                    이미지 배치 위치 설정
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'left', label: '좌측 이미지 / 우측 텍스트' },
                      { id: 'right', label: '우측 이미지 / 좌측 텍스트' },
                      { id: 'top', label: '상단 와이드 이미지 / 하단 텍스트' },
                    ].map(pos => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() => setEditingSection({ ...editingSection, imagePosition: pos.id as any })}
                        className={`py-2 px-2.5 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                          editingSection.imagePosition === pos.id || (!editingSection.imagePosition && pos.id === 'right')
                            ? 'border-[#872D35] bg-[#872D35] text-white shadow-2xs'
                            : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3-2. Image Size Selector for image */}
              {editingSection.type === 'image' && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <label className="block text-xs font-bold text-stone-700">
                    이미지 표시 크기 (가로 폭 조절)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'full', label: '전체 폭 (100%)' },
                      { id: 'large', label: '대형 (4XL)' },
                      { id: 'medium', label: '중형 (2XL)' },
                      { id: 'small', label: '소형 (MD)' },
                    ].map(sz => (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => setEditingSection({ ...editingSection, imageSize: sz.id as any })}
                        className={`py-1.5 px-2 rounded-lg border text-xs font-bold text-center transition-all cursor-pointer ${
                          (editingSection.imageSize || 'full') === sz.id
                            ? 'border-[#872D35] bg-[#872D35] text-white shadow-2xs'
                            : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Single Image URL + Upload */}
              {(editingSection.type === 'image' || editingSection.type === 'image_text') && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    이미지 URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingSection.imageUrl || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-mono"
                    />
                    <label className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? '업로드 중...' : '이미지 업로드'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={(e) => handleUploadImage('imageUrl', e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {editingSection.imageUrl && (
                    <div className="mt-2 w-32 h-20 rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
                      <img src={editingSection.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              {/* 4-2. Signature Block Controls */}
              {editingSection.type === 'signature' && (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-[#872D35]" />
                    <span className="text-xs font-bold text-stone-900">대표이사 직책 및 성명/서명 설정</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        직책 / 소속 문구
                      </label>
                      <input
                        type="text"
                        value={editingSection.authorRole || ''}
                        onChange={(e) => setEditingSection({ ...editingSection, authorRole: e.target.value })}
                        placeholder="예: 주식회사 푸드홈 대표이사"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        대표자 성명
                      </label>
                      <input
                        type="text"
                        value={editingSection.authorName || ''}
                        onChange={(e) => setEditingSection({ ...editingSection, authorName: e.target.value })}
                        placeholder="예: 김진성"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-bold text-[#872D35]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      서명 또는 직인 이미지 URL (투명 배경 권장, 비워둘 시 기본 직인 표시)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingSection.signatureImageUrl || ''}
                        onChange={(e) => setEditingSection({ ...editingSection, signatureImageUrl: e.target.value })}
                        placeholder="https://... 또는 우측 서명 업로드 버튼"
                        className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-mono"
                      />
                      <label className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? '업로드 중...' : '서명 업로드'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploading}
                          onChange={(e) => handleUploadImage('signatureImageUrl', e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {editingSection.signatureImageUrl && (
                      <div className="mt-2 w-32 h-14 rounded-lg overflow-hidden border border-stone-200 bg-white p-1 flex items-center justify-center">
                        <img src={editingSection.signatureImageUrl} alt="" className="h-full w-auto object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 4-3. Spacer Block Controls */}
              {editingSection.type === 'spacer' && (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center gap-2">
                    <MoveVertical className="w-4 h-4 text-[#872D35]" />
                    <span className="text-xs font-bold text-stone-900">상하 여백 크기 설정</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {[16, 24, 32, 48, 64, 80, 100].map(h => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setEditingSection({ ...editingSection, spacerHeight: h })}
                        className={`py-1.5 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          Number(editingSection.spacerHeight || 24) === h
                            ? 'border-[#872D35] bg-[#872D35] text-white shadow-2xs'
                            : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {h}px
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Main Content Textarea */}
              {(editingSection.type === 'text' || editingSection.type === 'image_text' || editingSection.type === 'button_cta' || editingSection.type === 'signature') && (
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {editingSection.type === 'signature' ? '서명 위/옆 안내 맺음말 문구 (선택)' : '본문 상세 내용 문구'}
                  </label>
                  <textarea
                    rows={4}
                    value={editingSection.content || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                    placeholder="문단을 나누려면 줄바꿈을 입력하세요."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white leading-relaxed"
                  />
                </div>
              )}

              {/* 6. Multi-Image Gallery */}
              {editingSection.type === 'multi_image' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700">갤러리 이미지 목록</label>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = editingSection.images || [];
                        setEditingSection({ ...editingSection, images: [...cur, ''] });
                      }}
                      className="text-xs font-bold text-[#872D35] hover:underline"
                    >
                      + 이미지 추가
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(editingSection.images || []).map((imgUrl, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={imgUrl}
                          onChange={(e) => {
                            const cur = [...(editingSection.images || [])];
                            cur[i] = e.target.value;
                            setEditingSection({ ...editingSection, images: cur });
                          }}
                          placeholder={`이미지 #${i + 1} URL`}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-mono bg-white"
                        />
                        <label className="px-2.5 py-1.5 rounded-lg bg-stone-800 text-white text-xs font-bold cursor-pointer shrink-0">
                          <span>업로드</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUploadImage({ type: 'multi', index: i }, e)}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const cur = (editingSection.images || []).filter((_, idx) => idx !== i);
                            setEditingSection({ ...editingSection, images: cur });
                          }}
                          className="p-1.5 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Info List Table Editor */}
              {editingSection.type === 'info_list' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700">정보표 항목 (스펙 규격표)</label>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = editingSection.infoItems || [];
                        setEditingSection({ 
                          ...editingSection, 
                          infoItems: [...cur, { label: '새 항목명', value: '상세 내용' }] 
                        });
                      }}
                      className="text-xs font-bold text-[#872D35] hover:underline"
                    >
                      + 항목 추가
                    </button>
                  </div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(editingSection.infoItems || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200">
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => {
                            const cur = [...(editingSection.infoItems || [])];
                            cur[i].label = e.target.value;
                            setEditingSection({ ...editingSection, infoItems: cur });
                          }}
                          placeholder="항목명 (예: 보관방법)"
                          className="w-32 px-2.5 py-1 text-xs font-bold border border-stone-300 rounded bg-white"
                        />
                        <input
                          type="text"
                          value={item.value}
                          onChange={(e) => {
                            const cur = [...(editingSection.infoItems || [])];
                            cur[i].value = e.target.value;
                            setEditingSection({ ...editingSection, infoItems: cur });
                          }}
                          placeholder="상세 내용 (예: 0~5℃ 냉장보관)"
                          className="flex-1 px-2.5 py-1 text-xs border border-stone-300 rounded bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const cur = (editingSection.infoItems || []).filter((_, idx) => idx !== i);
                            setEditingSection({ ...editingSection, infoItems: cur });
                          }}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. Feature Cards Editor */}
              {editingSection.type === 'feature_cards' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700">특징 카드 목록</label>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = editingSection.cardItems || [];
                        setEditingSection({ 
                          ...editingSection, 
                          cardItems: [...cur, { title: '새 특징 제목', desc: '특징에 대한 세부 설명을 입력하세요.', icon: 'CheckCircle2' }] 
                        });
                      }}
                      className="text-xs font-bold text-[#872D35] hover:underline"
                    >
                      + 카드 추가
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {(editingSection.cardItems || []).map((card, i) => (
                      <div key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => {
                              const cur = [...(editingSection.cardItems || [])];
                              cur[i].title = e.target.value;
                              setEditingSection({ ...editingSection, cardItems: cur });
                            }}
                            placeholder="카드 제목"
                            className="flex-1 px-2.5 py-1 text-xs font-bold border border-stone-300 rounded bg-white"
                          />
                          <input
                            type="text"
                            value={card.badge || ''}
                            onChange={(e) => {
                              const cur = [...(editingSection.cardItems || [])];
                              cur[i].badge = e.target.value;
                              setEditingSection({ ...editingSection, cardItems: cur });
                            }}
                            placeholder="배지 (예: 특허보유)"
                            className="w-28 px-2 py-1 text-[11px] font-bold border border-stone-300 rounded bg-white text-[#872D35]"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const cur = (editingSection.cardItems || []).filter((_, idx) => idx !== i);
                              setEditingSection({ ...editingSection, cardItems: cur });
                            }}
                            className="p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={card.desc}
                          onChange={(e) => {
                            const cur = [...(editingSection.cardItems || [])];
                            cur[i].desc = e.target.value;
                            setEditingSection({ ...editingSection, cardItems: cur });
                          }}
                          placeholder="카드 본문 설명 문구"
                          className="w-full px-2.5 py-1 text-xs border border-stone-200 rounded bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 9. Button CTA Editor */}
              {editingSection.type === 'button_cta' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">기본 버튼 문구</label>
                    <input
                      type="text"
                      value={editingSection.buttonText || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, buttonText: e.target.value })}
                      placeholder="예: 무료 샘플 1kg 신청하기"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold bg-white text-[#872D35]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">기본 버튼 이동 액션</label>
                    <select
                      value={editingSection.buttonAction || 'sample'}
                      onChange={(e) => setEditingSection({ ...editingSection, buttonAction: e.target.value as any })}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold bg-white"
                    >
                      <option value="sample">사업자 무료샘플 신청 페이지</option>
                      <option value="quote">대량납품 견적문의 페이지</option>
                      <option value="products">전체 제품 소개 페이지</option>
                      <option value="url">외부 웹사이트 링크 이동</option>
                    </select>
                  </div>
                  {editingSection.buttonAction === 'url' && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1">이동할 웹사이트 링크 (URL)</label>
                      <input
                        type="text"
                        value={editingSection.buttonLink || ''}
                        onChange={(e) => setEditingSection({ ...editingSection, buttonLink: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-mono bg-white"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">보조 버튼 문구 (선택)</label>
                    <input
                      type="text"
                      value={editingSection.secondaryButtonText || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, secondaryButtonText: e.target.value })}
                      placeholder="예: 1:1 대량 납품 견적 상담"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">보조 버튼 이동 액션</label>
                    <select
                      value={editingSection.secondaryButtonAction || 'quote'}
                      onChange={(e) => setEditingSection({ ...editingSection, secondaryButtonAction: e.target.value as any })}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold bg-white"
                    >
                      <option value="quote">대량납품 견적문의 페이지</option>
                      <option value="sample">사업자 무료샘플 신청 페이지</option>
                      <option value="products">전체 제품 소개 페이지</option>
                      <option value="url">외부 웹사이트 링크 이동</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Visible Checkbox */}
              <div className="pt-2 border-t border-stone-200">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSection.visible !== false}
                    onChange={(e) => setEditingSection({ ...editingSection, visible: e.target.checked })}
                    className="rounded text-[#872D35]"
                  />
                  <span>홈페이지에 이 섹션 블록 노출</span>
                </label>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-black shadow-sm cursor-pointer"
              >
                블록 저장
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
