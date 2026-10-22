import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Save, 
  Sparkles, 
  Plus, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Star,
  Package,
  Layers,
  MessageSquare,
  FileText
} from 'lucide-react';

interface SectionContentModalProps {
  sectionKey: string;
  sectionLabel: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SectionContentModal: React.FC<SectionContentModalProps> = ({
  sectionKey,
  sectionLabel,
  isOpen,
  onClose
}) => {
  const { state, updateContent, showToast } = useApp();
  const { content } = state;

  const [formContent, setFormContent] = useState(content);

  // Sync with state.content on open
  React.useEffect(() => {
    if (isOpen) {
      setFormContent(state.content);
    }
  }, [isOpen, state.content]);

  if (!isOpen) return null;

  const handleFieldChange = (field: string, value: any) => {
    setFormContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    updateContent(formContent);
    showToast(`'${sectionLabel}' 섹션의 콘텐츠가 저장되었습니다.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#2A2020] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[#872D35] text-white">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-base">
                {sectionLabel} - 섹션 콘텐츠 수정
              </h3>
              <p className="text-xs text-stone-300">
                수정 후 저장 시 홈페이지의 해당 섹션에 즉시 반영됩니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* 1. 핵심 실적 통계 */}
          {sectionKey === 'stats' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <h4 className="text-xs font-black text-stone-800 mb-2">핵심 통계 지표 카드</h4>
                <p className="text-xs text-stone-500 mb-4">
                  홈페이지에 표시되는 대표 실적 수치를 입력해 주세요.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">외식 파트너 매장 수</label>
                    <input
                      type="text"
                      defaultValue="480+"
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white font-bold"
                      placeholder="예: 480+"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">업력 (연도)</label>
                    <input
                      type="text"
                      defaultValue="30년"
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white font-bold"
                      placeholder="예: 30년 전통"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">일일 생산량</label>
                    <input
                      type="text"
                      defaultValue="4.2톤"
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white font-bold"
                      placeholder="예: 4.2톤"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">재발주 만족도</label>
                    <input
                      type="text"
                      defaultValue="98.7%"
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white font-bold"
                      placeholder="예: 98.7%"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. 브랜드 스토리 & 가치 */}
          {sectionKey === 'features' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">섹션 메인 제목</label>
                  <input
                    type="text"
                    value={formContent.storyTitle || ''}
                    onChange={(e) => handleFieldChange('storyTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-bold"
                    placeholder="예: 보쌈의 맛을 결정하는 마지막 1%, 푸드홈이 만듭니다"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">섹션 부제목 / 설명</label>
                  <input
                    type="text"
                    value={formContent.storySubtitle || ''}
                    onChange={(e) => handleFieldChange('storySubtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs"
                    placeholder="부제목 문구"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">스토리 단락 1</label>
                    <textarea
                      rows={3}
                      value={formContent.storyParagraph1 || ''}
                      onChange={(e) => handleFieldChange('storyParagraph1', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">스토리 단락 2</label>
                    <textarea
                      rows={3}
                      value={formContent.storyParagraph2 || ''}
                      onChange={(e) => handleFieldChange('storyParagraph2', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Core Values List */}
              <div className="pt-2">
                <span className="block text-xs font-black text-stone-800 mb-2">
                  핵심 가치 카드 목록 ({(formContent.coreValues || []).length}개)
                </span>
                <div className="space-y-2">
                  {(formContent.coreValues || []).map((cv, idx) => (
                    <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#872D35] text-white text-[10px] font-bold">
                          가치 0{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={cv.title}
                          onChange={(e) => {
                            const updated = [...(formContent.coreValues || [])];
                            updated[idx].title = e.target.value;
                            handleFieldChange('coreValues', updated);
                          }}
                          className="px-2.5 py-1 text-xs font-bold border border-stone-300 rounded-lg bg-white flex-1"
                        />
                      </div>
                      <input
                        type="text"
                        value={cv.desc}
                        onChange={(e) => {
                          const updated = [...(formContent.coreValues || [])];
                          updated[idx].desc = e.target.value;
                          handleFieldChange('coreValues', updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. 제품 라인업 */}
          {sectionKey === 'products' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <h4 className="text-xs font-black text-stone-800 mb-1">메인 제품 라인업 안내</h4>
                <p className="text-xs text-stone-600 mb-3">
                  제품 데이터는 좌측 사이드바의 <strong>[제품 관리]</strong> 메뉴에서 등록·수정·삭제할 수 있으며, 
                  여기서는 메인 섹션 제목과 설명을 설정합니다.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">섹션 제목</label>
                    <input
                      type="text"
                      defaultValue="푸드홈 대표 제품 둘러보기"
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">섹션 안내 설명</label>
                    <input
                      type="text"
                      defaultValue="외식 매장의 품격을 높이는 30년 전통의 시그니처 김치와 특제 양념 라인업"
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. 청결 안심 6단계 공정 */}
          {sectionKey === 'process' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">공정 섹션 제목</label>
                    <input
                      type="text"
                      value={formContent.processTitle || ''}
                      onChange={(e) => handleFieldChange('processTitle', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-bold"
                      placeholder="예: 푸드홈만의 4단계 안심 제조공정"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">공정 섹션 부제목</label>
                    <input
                      type="text"
                      value={formContent.processSubtitle || ''}
                      onChange={(e) => handleFieldChange('processSubtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs"
                      placeholder="예: 철저한 위생 관리와 특허 기술"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">공정 설명 문구</label>
                  <textarea
                    rows={2}
                    value={formContent.processDescription || ''}
                    onChange={(e) => handleFieldChange('processDescription', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Process Steps */}
              <div className="pt-2 space-y-2">
                <span className="block text-xs font-black text-stone-800">
                  단계별 공정 ({(formContent.processSteps || []).length}개)
                </span>
                {(formContent.processSteps || []).map((ps, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#872D35] text-white text-[10px] font-bold">
                        STEP 0{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={ps.title}
                        onChange={(e) => {
                          const updated = [...(formContent.processSteps || [])];
                          updated[idx].title = e.target.value;
                          handleFieldChange('processSteps', updated);
                        }}
                        className="px-2.5 py-1 text-xs font-bold border border-stone-300 rounded-lg bg-white flex-1"
                      />
                    </div>
                    <input
                      type="text"
                      value={ps.desc}
                      onChange={(e) => {
                        const updated = [...(formContent.processSteps || [])];
                        updated[idx].desc = e.target.value;
                        handleFieldChange('processSteps', updated);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-200 rounded-lg bg-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. 고객사 추천평 */}
          {sectionKey === 'reviews' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <h4 className="text-xs font-black text-stone-800 mb-1">고객사 추천평 관리</h4>
                <p className="text-xs text-stone-600 mb-4">
                  전국 외식업 점주님들의 생생한 후기와 평점을 관리합니다.
                </p>

                <div className="space-y-3">
                  {(state.reviews || []).slice(0, 5).map((rev, idx) => (
                    <div key={rev.id || idx} className="p-3 bg-white rounded-lg border border-stone-200 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                        <span>{rev.clientName} ({rev.businessType})</span>
                        <div className="flex items-center text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span className="text-[11px] font-bold ml-1">{rev.rating}점</span>
                        </div>
                      </div>
                      <p className="text-xs text-stone-600">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 6. 소식 & 레시피 */}
          {sectionKey === 'posts' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-black text-stone-800">메인 소식 & 레시피 섹션 설정</h4>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">섹션 메인 제목</label>
                  <input
                    type="text"
                    defaultValue="푸드홈 소식 & 보쌈김치 활용 꿀팁 레시피"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">설명 문구</label>
                  <input
                    type="text"
                    defaultValue="외식 매장 운영에 실질적인 도움이 되는 조리 팁과 공지사항을 확인하세요."
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 7. B2B 견적 폼 */}
          {sectionKey === 'inquiry' && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-black text-stone-800">B2B 견적 신청 안내 문구</h4>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">안내 제목</label>
                  <input
                    type="text"
                    value={formContent.csNoticeTitle || '푸드홈 B2B 파트너 고객센터'}
                    onChange={(e) => handleFieldChange('csNoticeTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">견적 안내 문구</label>
                  <textarea
                    rows={2}
                    value={formContent.quoteGuideText || '월 100kg 이상 정기 납품 및 프랜차이즈 PB/OEM 전용 단가 상담을 지원합니다.'}
                    onChange={(e) => handleFieldChange('quoteGuideText', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">무료 샘플 안내 문구</label>
                  <textarea
                    rows={2}
                    value={formContent.sampleGuideText || '외식업 사업자등록증이 있으신 대표님께 1kg 무료 샘플팩(배송비 전액 지원)을 보내드립니다.'}
                    onChange={(e) => handleFieldChange('sampleGuideText', e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 px-6 py-3.5 border-t border-stone-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-500">
            * 변경된 내용은 저장 즉시 메인 홈페이지에 반영됩니다.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-bold rounded-xl cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>저장 및 즉시 반영</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
