import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FaqItem, FaqCategoryItem } from '../../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  HelpCircle, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Sparkles,
  Check, 
  X, 
  Search,
  Settings,
  FolderTree,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export const FaqManager: React.FC = () => {
  const { 
    state, 
    addFaqItem, 
    updateFaqItem, 
    deleteFaqItem, 
    reorderFaqItems, 
    updateFaqCategories, 
    showToast 
  } = useApp();
  
  const faqs = state.content.faqItems || [];

  // Default categories fallback
  const rawCategories: FaqCategoryItem[] = (state.content.faqCategories && state.content.faqCategories.length > 0)
    ? state.content.faqCategories
    : [
        { id: 'cat-sample', name: '샘플신청', order: 1, visible: true },
        { id: 'cat-wholesale', name: '납품·단가', order: 2, visible: true },
        { id: 'cat-storage', name: '보관·유통', order: 3, visible: true },
        { id: 'cat-delivery', name: '배송안내', order: 4, visible: true },
        { id: 'cat-safety', name: '위생·안전', order: 5, visible: true },
        { id: 'cat-etc', name: '기타문의', order: 6, visible: true }
      ];

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Category modal editing state
  const [editableCategories, setEditableCategories] = useState<FaqCategoryItem[]>(rawCategories);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [deletingCatState, setDeletingCatState] = useState<{ cat: FaqCategoryItem; targetCatName: string; count: number } | null>(null);

  // Form state for creating or editing FAQ
  const [faqForm, setFaqForm] = useState<{
    question: string;
    answer: string;
    category: string;
    visible: boolean;
  }>({
    question: '',
    answer: '',
    category: rawCategories[0]?.name || '샘플신청',
    visible: true
  });

  // Sync categories if state changes
  React.useEffect(() => {
    if (state.content.faqCategories && state.content.faqCategories.length > 0) {
      setEditableCategories(state.content.faqCategories);
    }
  }, [state.content.faqCategories]);

  const activeCategories = rawCategories
    .filter(c => c.visible !== false)
    .sort((a, b) => a.order - b.order);

  const handleOpenAdd = () => {
    setEditingFaqId(null);
    setFaqForm({
      question: '',
      answer: '',
      category: activeCategories[0]?.name || '샘플신청',
      visible: true
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (faq: FaqItem) => {
    setEditingFaqId(faq.id);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      visible: faq.visible !== false
    });
    setIsAddModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      showToast('질문과 답변을 모두 입력해 주세요.');
      return;
    }

    if (editingFaqId) {
      updateFaqItem(editingFaqId, {
        question: faqForm.question,
        answer: faqForm.answer,
        category: faqForm.category,
        visible: faqForm.visible
      });
      showToast('FAQ 항목이 수정되었습니다.');
    } else {
      addFaqItem({
        question: faqForm.question,
        answer: faqForm.answer,
        category: faqForm.category,
        visible: faqForm.visible
      });
      showToast('새 FAQ 항목이 추가되었습니다.');
    }
    setIsAddModalOpen(false);
  };

  const handleToggleVisible = (id: string, currentVisible?: boolean) => {
    updateFaqItem(id, { visible: currentVisible === false });
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= faqs.length) return;

    const copy = [...faqs];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    reorderFaqItems(copy);
  };

  const handleDelete = (id: string, question: string) => {
    if (confirm(`'${question}' FAQ를 삭제하시겠습니까?`)) {
      deleteFaqItem(id);
    }
  };

  // --- Category Management Handlers ---
  const handleOpenCategoryModal = () => {
    setEditableCategories([...rawCategories]);
    setNewCategoryName('');
    setDeletingCatState(null);
    setIsCategoryModalOpen(true);
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      alert('카테고리 이름을 입력해 주세요.');
      return;
    }
    if (editableCategories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('이미 존재하는 카테고리 이름입니다.');
      return;
    }

    const newCat: FaqCategoryItem = {
      id: 'cat-' + Date.now(),
      name: trimmed,
      order: editableCategories.length + 1,
      visible: true
    };
    setEditableCategories([...editableCategories, newCat]);
    setNewCategoryName('');
  };

  const handleRenameCategory = (id: string, newName: string) => {
    setEditableCategories(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
  };

  const handleToggleCatVisible = (id: string) => {
    setEditableCategories(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  };

  const handleMoveCatOrder = (idx: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && idx === 0) || (direction === 'down' && idx === editableCategories.length - 1)) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    const copy = [...editableCategories];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    const reordered = copy.map((cat, i) => ({ ...cat, order: i + 1 }));
    setEditableCategories(reordered);
  };

  const handleInitiateDeleteCat = (cat: FaqCategoryItem) => {
    const count = faqs.filter(f => f.category === cat.name).length;
    if (editableCategories.length <= 1) {
      alert('최소 1개 이상의 카테고리가 유지되어야 합니다.');
      return;
    }

    if (count > 0) {
      // Find default reassignment target
      const target = editableCategories.find(c => c.id !== cat.id)?.name || '기타문의';
      setDeletingCatState({ cat, targetCatName: target, count });
    } else {
      if (confirm(`'${cat.name}' 카테고리를 삭제하시겠습니까?`)) {
        setEditableCategories(prev => prev.filter(c => c.id !== cat.id));
      }
    }
  };

  const handleConfirmReassignDelete = () => {
    if (!deletingCatState) return;
    const { cat, targetCatName } = deletingCatState;

    // Update faqs that had this category
    faqs.forEach(f => {
      if (f.category === cat.name) {
        updateFaqItem(f.id, { category: targetCatName });
      }
    });

    setEditableCategories(prev => prev.filter(c => c.id !== cat.id));
    setDeletingCatState(null);
    showToast(`'${cat.name}' 카테고리가 삭제되었으며, 기존 게시글이 '${targetCatName}'(으)로 이동되었습니다.`);
  };

  const handleSaveCategories = () => {
    // Check if any category was renamed and update corresponding faqs
    editableCategories.forEach(cat => {
      const original = rawCategories.find(r => r.id === cat.id);
      if (original && original.name !== cat.name) {
        faqs.forEach(f => {
          if (f.category === original.name) {
            updateFaqItem(f.id, { category: cat.name });
          }
        });
      }
    });

    updateFaqCategories(editableCategories);
    setIsCategoryModalOpen(false);
    showToast('FAQ 카테고리가 홈페이지 및 관리자에 성공적으로 반영되었습니다.');
  };

  // Filter FAQs for display
  const filteredFaqs = faqs.filter(faq => {
    if (categoryFilter !== 'all' && faq.category !== categoryFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q) ||
        faq.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#872D35]/10 text-[#872D35]">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h3 className="text-base font-extrabold text-stone-900">
              자주하는 질문 (FAQ) 관리
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              총 {faqs.length}건
            </span>
          </div>
          <p className="text-xs text-stone-500">
            고객센터 &gt; 자주하는 질문 페이지의 Q&A 항목과 분류 카테고리를 자유롭게 관리합니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Category Management Button */}
          <button
            type="button"
            onClick={handleOpenCategoryModal}
            className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
          >
            <FolderTree className="w-4 h-4 text-[#872D35]" />
            <span>카테고리 관리</span>
          </button>

          {/* Add FAQ Button */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6E1D24] text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>새 FAQ 등록하기</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto no-scrollbar py-0.5">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
              categoryFilter === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            전체 ({faqs.length})
          </button>
          {rawCategories.map(cat => {
            const count = faqs.filter(f => f.category === cat.name).length;
            const isVisible = cat.visible !== false;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  categoryFilter === cat.name
                    ? 'bg-[#872D35] text-white'
                    : isVisible
                    ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    : 'bg-stone-100/60 text-stone-400 line-through'
                }`}
                title={!isVisible ? '홈페이지 숨김 카테고리' : ''}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="질문 또는 답변 검색..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-none focus:border-[#872D35] bg-stone-50"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* FAQ Items List */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs divide-y divide-stone-100 overflow-hidden">
        {filteredFaqs.length === 0 ? (
          <div className="py-16 text-center text-stone-400 space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto text-stone-300" />
            <p className="text-xs font-bold">등록된 자주하는 질문(FAQ)이 없습니다.</p>
            <p className="text-[11px] text-stone-400">우측 상단 '새 FAQ 등록하기' 버튼을 눌러 추가해 보세요.</p>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isVisible = faq.visible !== false;
            return (
              <div 
                key={faq.id} 
                className={`p-4 transition-colors hover:bg-stone-50/70 flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  !isVisible ? 'opacity-60 bg-stone-50/40' : ''
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-bold font-mono">
                      Q.{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#872D35]/10 text-[#872D35] text-[10px] font-bold">
                      {faq.category}
                    </span>
                    {!isVisible && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                        숨김 처리
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 leading-snug">
                    {faq.question}
                  </h4>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {/* Visibility Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisible(faq.id, faq.visible)}
                    title={isVisible ? "홈페이지 표시 중 (클릭 시 숨김)" : "홈페이지 숨김 (클릭 시 표시)"}
                    className={`p-1.5 rounded-lg cursor-pointer ${
                      isVisible 
                        ? 'text-emerald-600 hover:bg-emerald-50' 
                        : 'text-stone-400 hover:bg-stone-100'
                    }`}
                  >
                    {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Reorder Buttons */}
                  <div className="flex items-center">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveOrder(idx, 'up')}
                      className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-20 cursor-pointer"
                      title="위로 이동"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === faqs.length - 1}
                      onClick={() => handleMoveOrder(idx, 'down')}
                      className="p-1 rounded text-stone-400 hover:text-stone-700 disabled:opacity-20 cursor-pointer"
                      title="아래로 이동"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(faq)}
                    className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 cursor-pointer"
                    title="수정"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(faq.id, faq.question)}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                    title="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT FAQ MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="text-base font-bold text-stone-900">
                {editingFaqId ? 'FAQ 항목 수정' : '새 FAQ 등록'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">카테고리 *</label>
                <select
                  value={faqForm.category}
                  onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white"
                >
                  {rawCategories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name} {!cat.visible ? '(숨김 분류)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">질문 (Question) *</label>
                <input
                  type="text"
                  required
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                  placeholder="예: 정기 납품 시 배송 주기는 어떻게 되나요?"
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">답변 (Answer) *</label>
                <textarea
                  required
                  rows={5}
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                  placeholder="상세한 답변 내용을 입력해 주세요..."
                  className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={faqForm.visible}
                    onChange={(e) => setFaqForm({ ...faqForm, visible: e.target.checked })}
                    className="rounded text-[#872D35]"
                  />
                  <span>홈페이지에 바로 노출</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#872D35] text-white font-bold hover:bg-[#6E1D24] cursor-pointer shadow-xs"
                >
                  {editingFaqId ? '수정 완료' : '등록하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY MANAGEMENT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#872D35]/10 text-[#872D35]">
                  <FolderTree className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">FAQ 카테고리 관리</h3>
                  <p className="text-[11px] text-stone-500">FAQ 분류 카테고리를 추가, 이름 변경, 노출 여부 및 순서를 설정합니다.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add New Category */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-xs font-bold text-stone-800 block">새 카테고리 추가</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                  placeholder="예: 배송/운송문의, 원산지안내 등"
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-stone-200 bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 rounded-lg bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>추가</span>
                </button>
              </div>
            </div>

            {/* Reassign Prompt on Category Delete */}
            {deletingCatState && (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>'{deletingCatState.cat.name}' 카테고리에 등록된 {deletingCatState.count}개의 FAQ가 있습니다.</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  삭제 전, 해당 게시글들을 이동할 다른 카테고리를 선택해 주세요.
                </p>
                <div className="flex items-center gap-2">
                  <select
                    value={deletingCatState.targetCatName}
                    onChange={(e) => setDeletingCatState({ ...deletingCatState, targetCatName: e.target.value })}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-amber-300 bg-white font-bold"
                  >
                    {editableCategories
                      .filter(c => c.id !== deletingCatState.cat.id)
                      .map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleConfirmReassignDelete}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                  >
                    이동 및 삭제 확정
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingCatState(null)}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}

            {/* Categories List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-700 block">카테고리 목록 ({editableCategories.length}개)</span>
              
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {editableCategories.map((cat, idx) => {
                  const count = faqs.filter(f => f.category === cat.name).length;

                  return (
                    <div 
                      key={cat.id} 
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                        cat.visible ? 'bg-white border-stone-200' : 'bg-stone-100/60 border-stone-200 text-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="w-5 h-5 rounded bg-stone-100 text-stone-600 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) => handleRenameCategory(cat.id, e.target.value)}
                          className={`flex-1 px-2.5 py-1 rounded-lg border text-xs font-bold ${
                            cat.visible ? 'border-stone-200 bg-stone-50' : 'border-stone-200 bg-stone-100 text-stone-400 line-through'
                          }`}
                        />

                        <span className="text-[11px] text-stone-400 font-medium shrink-0">
                          {count}개 글
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* Visibility Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleCatVisible(cat.id)}
                          title={cat.visible ? "홈페이지 표시 중 (클릭 시 숨김)" : "홈페이지 숨김 (클릭 시 표시)"}
                          className={`p-1.5 rounded-lg cursor-pointer ${
                            cat.visible ? 'text-emerald-600 hover:bg-emerald-50' : 'text-stone-400 hover:bg-stone-200'
                          }`}
                        >
                          {cat.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        {/* Order Buttons */}
                        <div className="flex flex-col">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveCatOrder(idx, 'up')}
                            className="p-0.5 text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === editableCategories.length - 1}
                            onClick={() => handleMoveCatOrder(idx, 'down')}
                            className="p-0.5 text-stone-400 hover:text-stone-800 disabled:opacity-20 cursor-pointer"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Delete Category */}
                        <button
                          type="button"
                          onClick={() => handleInitiateDeleteCat(cat)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer ml-1"
                          title="카테고리 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <span className="text-[11px] text-stone-400">
                ※ '전체'는 모든 게시글을 보여주는 기본 필터로 유지됩니다.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold hover:bg-stone-200 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategories}
                  className="px-5 py-2 rounded-xl bg-[#872D35] hover:bg-[#6D242B] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>카테고리 저장 완료</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
