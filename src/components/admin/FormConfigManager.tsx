import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FormConfig, FormFieldItem } from '../../types';
import { 
  Sliders, 
  Plus, 
  Trash2, 
  Save, 
  Check, 
  Edit3,
  X,
  ShieldCheck, 
  FileText, 
  Layers, 
  AlertCircle,
  Loader2
} from 'lucide-react';

export const FormConfigManager: React.FC = () => {
  const {
    state,
    updateFormConfig,
    publishPublicContentsToSupabase,
    isSupabaseAdminAuthed,
    supabaseConfig,
    isPublishingToSupabase,
    showToast
  } = useApp();
  const [activeTab, setActiveTab] = useState<'sample' | 'quote'>('sample');

  const [formConfig, setFormConfig] = useState<FormConfig>(() => {
    return state.formConfig || {
      sampleFormFields: [
        { id: 'f-s-1', name: 'title', label: '신청 제목', type: 'text', required: true, order: 1, enabled: true },
        { id: 'f-s-2', name: 'storeName', label: '상호명 (사업체명)', type: 'text', required: true, order: 2, enabled: true },
        { id: 'f-s-3', name: 'contactPerson', label: '담당자 / 대표자 성함', type: 'text', required: true, order: 3, enabled: true },
        { id: 'f-s-4', name: 'phone', label: '휴대전화 연락처', type: 'tel', required: true, order: 4, enabled: true },
        { id: 'f-s-5', name: 'address', label: '샘플 수령 주소', type: 'text', required: true, order: 5, enabled: true },
        { id: 'f-s-6', name: 'password', label: '게시글 열람 비밀번호', type: 'password', required: true, order: 6, enabled: true }
      ],
      sampleProductOptions: [
        '명품 보쌈무김치 (대표 인기품목)',
        '비법 보쌈김칫속(보쌈속)',
        '업소용 특제 굴보쌈 양념',
        '특허 수분제어 맞춤 절임무'
      ],
      sampleStatuses: ['접수대기', '접수완료', '답변완료', '배송준비', '배송완료'],
      samplePrivacyText: '개인정보보호법에 의거하여 무료 샘플 발송 및 B2B 상담 목적으로만 성함, 연락처, 주소를 수집하며, 발송 완료 3개월 후 안전하게 파기됩니다.',
      quoteFormFields: [
        { id: 'f-q-1', name: 'title', label: '상담 제목', type: 'text', required: true, order: 1, enabled: true },
        { id: 'f-q-2', name: 'companyName', label: '업체명 / 상호명', type: 'text', required: true, order: 2, enabled: true },
        { id: 'f-q-3', name: 'contactPerson', label: '담당자 성함', type: 'text', required: true, order: 3, enabled: true },
        { id: 'f-q-4', name: 'phone', label: '연락처', type: 'tel', required: true, order: 4, enabled: true },
        { id: 'f-q-5', name: 'password', label: '게시글 열람 비밀번호', type: 'password', required: true, order: 5, enabled: true }
      ],
      quoteProductOptions: [
        '명품 보쌈무김치 (업소용 10kg)',
        '비법 보쌈김칫속 (업소용 10kg)',
        '수제 절임무 벌크 (20kg)',
        '프랜차이즈 맞춤 OEM/PB 전용 레시피'
      ],
      quoteStatuses: ['접수완료', '상담중', '견적완료'],
      quotePrivacyText: '대량 납품 견적 산출 및 유선 안내를 위해 입력하신 정보를 수집 및 처리하며 관련 법령에 따라 철저히 비공개 보호됩니다.'
    };
  });

  useEffect(() => {
    if (state.formConfig) {
      setFormConfig(state.formConfig);
    }
  }, [state.formConfig]);

  const [newProductInput, setNewProductInput] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const handleToggleRequired = (isSample: boolean, id: string) => {
    if (isSample) {
      setFormConfig(prev => ({
        ...prev,
        sampleFormFields: prev.sampleFormFields.map(f => f.id === id ? { ...f, required: !f.required } : f)
      }));
    } else {
      setFormConfig(prev => ({
        ...prev,
        quoteFormFields: prev.quoteFormFields.map(f => f.id === id ? { ...f, required: !f.required } : f)
      }));
    }
  };

  const handleToggleEnabled = (isSample: boolean, id: string) => {
    if (isSample) {
      setFormConfig(prev => ({
        ...prev,
        sampleFormFields: prev.sampleFormFields.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f)
      }));
    } else {
      setFormConfig(prev => ({
        ...prev,
        quoteFormFields: prev.quoteFormFields.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f)
      }));
    }
  };

  const handleAddProductOption = (isSample: boolean) => {
    const trimmed = newProductInput.trim();
    if (!trimmed) return;
    const nextConfig: FormConfig = isSample
      ? { ...formConfig, sampleProductOptions: [...formConfig.sampleProductOptions, trimmed] }
      : { ...formConfig, quoteProductOptions: [...formConfig.quoteProductOptions, trimmed] };
    setFormConfig(nextConfig);
    updateFormConfig(nextConfig);
    setNewProductInput('');
    showToast('제품 선택 항목이 추가되어 즉시 반영되었습니다.');
  };

  const handleStartEditOption = (idx: number, value: string) => {
    setEditingIdx(idx);
    setEditingValue(value);
  };

  const handleSaveEditOption = (isSample: boolean, idx: number) => {
    const trimmed = editingValue.trim();
    if (!trimmed) {
      showToast('제품 항목 이름을 입력해 주세요.');
      return;
    }
    const nextConfig: FormConfig = isSample
      ? {
          ...formConfig,
          sampleProductOptions: formConfig.sampleProductOptions.map((item, i) => (i === idx ? trimmed : item))
        }
      : {
          ...formConfig,
          quoteProductOptions: formConfig.quoteProductOptions.map((item, i) => (i === idx ? trimmed : item))
        };
    setFormConfig(nextConfig);
    updateFormConfig(nextConfig);
    setEditingIdx(null);
    setEditingValue('');
    showToast('제품 선택 항목 이름이 수정되었습니다.');
  };

  const handleDeleteProductOption = (isSample: boolean, index: number) => {
    const nextConfig: FormConfig = isSample
      ? { ...formConfig, sampleProductOptions: formConfig.sampleProductOptions.filter((_, i) => i !== index) }
      : { ...formConfig, quoteProductOptions: formConfig.quoteProductOptions.filter((_, i) => i !== index) };
    setFormConfig(nextConfig);
    updateFormConfig(nextConfig);
    if (editingIdx === index) {
      setEditingIdx(null);
      setEditingValue('');
    }
    showToast('선택 항목이 삭제되었습니다.');
  };

  const handleSaveAll = async () => {
    updateFormConfig(formConfig);
    if (isSupabaseAdminAuthed && supabaseConfig.url && supabaseConfig.anonKey) {
      await publishPublicContentsToSupabase({ formConfig });
    } else {
      showToast('신청서 양식 설정이 저장되었습니다.');
    }
  };

  const isSample = activeTab === 'sample';
  const currentFields = isSample ? formConfig.sampleFormFields : formConfig.quoteFormFields;
  const currentProductOptions = isSample ? formConfig.sampleProductOptions : formConfig.quoteProductOptions;
  const currentStatuses = isSample ? formConfig.sampleStatuses : formConfig.quoteStatuses;
  const currentPrivacy = isSample ? formConfig.samplePrivacyText : formConfig.quotePrivacyText;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#872D35]/10 text-[#872D35]">
              <Sliders className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-stone-900">신청서 양식 관리 (Form Builder)</h3>
          </div>
          <p className="text-xs text-stone-500">
            무료 샘플 신청서와 대량 납품 견적 상담서의 입력 항목, 필수 여부, 제품 선택 리스트, 개인정보 동의 문구를 설정합니다.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isPublishingToSupabase}
          className="px-6 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          {isPublishingToSupabase ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSupabaseAdminAuthed ? '양식 설정 저장 & DB 게시' : '양식 설정 저장'}</span>
        </button>
      </div>

      {!isSupabaseAdminAuthed && supabaseConfig.url && supabaseConfig.anonKey && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            다른 브라우저(방문자 화면)에도 변경된 제품 선택 항목을 즉시 반영하려면, Supabase 이메일 관리자 로그인 상태에서 저장하거나 상단의 <strong>[Supabase 게시]</strong> 버튼을 눌러주세요.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => {
            setActiveTab('sample');
            setEditingIdx(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sample'
              ? 'bg-[#872D35] text-white shadow-2xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          사업자 무료 샘플 신청서 양식
        </button>
        <button
          onClick={() => {
            setActiveTab('quote');
            setEditingIdx(null);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'quote'
              ? 'bg-[#872D35] text-white shadow-2xs'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          1:1 대량 납품 견적 상담서 양식
        </button>
      </div>

      {/* Form Fields Settings */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <h4 className="text-sm font-black text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#872D35]" />
          <span>입력 필드 항목 및 필수 여부 설정</span>
        </h4>

        <div className="divide-y divide-stone-100">
          {currentFields.map((field) => (
            <div key={field.id} className="py-3 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-stone-800">{field.label}</span>
                <span className="text-stone-400 font-mono ml-2">({field.name})</span>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={() => handleToggleRequired(isSample, field.id)}
                    className="rounded text-[#872D35] focus:ring-[#872D35]"
                  />
                  <span className="text-stone-600">필수 입력</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.enabled}
                    onChange={() => handleToggleEnabled(isSample, field.id)}
                    className="rounded text-[#872D35] focus:ring-[#872D35]"
                  />
                  <span className="text-stone-600">양식 노출</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Choices Manager */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <h4 className="text-sm font-black text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#872D35]" />
          <span>신청서 내 선택 가능한 제품 항목 관리</span>
        </h4>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="새 제품 선택 항목 이름 입력 (예: 맛보기 김칫속 500g)"
            value={newProductInput}
            onChange={(e) => setNewProductInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#872D35]"
          />
          <button
            onClick={() => handleAddProductOption(isSample)}
            className="px-4 py-2 rounded-xl bg-stone-800 text-white text-xs font-bold hover:bg-stone-900 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>항목 추가</span>
          </button>
        </div>

        <div className="space-y-2">
          {currentProductOptions.map((opt, idx) => (
            <div key={idx} className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-2 text-xs">
              {editingIdx === idx ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveEditOption(isSample, idx);
                      }
                    }}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#872D35] bg-white text-xs font-bold focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveEditOption(isSample, idx)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#872D35] text-white font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>확인</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingIdx(null);
                      setEditingValue('');
                    }}
                    className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-bold text-stone-800">{opt}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEditOption(idx, opt)}
                      className="text-stone-400 hover:text-blue-600 p-1 cursor-pointer"
                      title="항목 이름 수정"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProductOption(isSample, idx)}
                      className="text-stone-400 hover:text-red-600 p-1 cursor-pointer"
                      title="항목 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Agreement Text */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <h4 className="text-sm font-black text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#872D35]" />
          <span>개인정보 수집 및 이용 동의 문구 수정</span>
        </h4>

        <textarea
          rows={3}
          value={currentPrivacy}
          onChange={(e) => {
            const val = e.target.value;
            if (isSample) {
              setFormConfig(prev => ({ ...prev, samplePrivacyText: val }));
            } else {
              setFormConfig(prev => ({ ...prev, quotePrivacyText: val }));
            }
          }}
          className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#872D35]"
        />
      </div>

    </div>
  );
};
