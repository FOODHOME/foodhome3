import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PostItem } from '../../types';
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Edit3, 
  Pin, 
  Calendar, 
  Eye, 
  Search, 
  X, 
  Upload, 
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

export const NoticeManager: React.FC = () => {
  const { state, addPost, updatePost, deletePost, setSelectedPostForDetail, showToast } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  const [form, setForm] = useState<{
    title: string;
    author: string;
    content: string;
    thumbnail: string;
    tags: string;
    isPinned: boolean;
  }>({
    title: '',
    author: '푸드홈 운영팀',
    content: '',
    thumbnail: './images/banner_bossam.jpg',
    tags: '공지사항, 푸드홈',
    isPinned: false
  });

  const noticePosts = state.posts.filter(p => p.category === '공지사항');

  const filteredNotices = noticePosts.filter(p => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
  });

  const handleOpenAdd = () => {
    setEditingPostId(null);
    setForm({
      title: '',
      author: '푸드홈 운영팀',
      content: '',
      thumbnail: './images/banner_bossam.jpg',
      tags: '공지사항, 푸드홈',
      isPinned: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (post: PostItem) => {
    setEditingPostId(post.id);
    setForm({
      title: post.title,
      author: post.author || '푸드홈 운영팀',
      content: post.content,
      thumbnail: post.thumbnail || './images/banner_bossam.jpg',
      tags: (post.tags || []).join(', '),
      isPinned: !!post.isPinned
    });
    setIsModalOpen(true);
  };

  const handleTogglePin = (post: PostItem) => {
    updatePost(post.id, { isPinned: !post.isPinned });
    showToast(post.isPinned ? '상단 고정이 해제되었습니다.' : '중요 공지로 상단 고정되었습니다.');
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`'${title}' 공지사항을 삭제하시겠습니까?`)) {
      deletePost(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      showToast('제목과 본문을 입력해 주세요.');
      return;
    }

    const tagArray = form.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingPostId) {
      updatePost(editingPostId, {
        title: form.title,
        author: form.author,
        content: form.content,
        thumbnail: form.thumbnail,
        tags: tagArray,
        isPinned: form.isPinned
      });
      showToast('공지사항이 수정되었습니다.');
    } else {
      addPost({
        title: form.title,
        category: '공지사항',
        author: form.author,
        content: form.content,
        thumbnail: form.thumbnail,
        tags: tagArray,
        isPinned: form.isPinned
      });
      showToast('새 공지사항이 등록되었습니다.');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-[#872D35]/10 text-[#872D35]">
              <Megaphone className="w-5 h-5" />
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              공지사항 관리
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              총 {noticePosts.length}건
            </span>
          </div>
          <p className="text-xs text-slate-500">
            고객센터 &gt; 공지사항 게시판에 노출되는 공지를 등록, 수정, 삭제하고 중요 공지를 상단에 고정합니다.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#872D35] hover:bg-[#6E1D24] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>새 공지사항 작성</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="공지사항 제목 또는 본문 검색..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#872D35]"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Notices List */}
      <div className="space-y-3">
        {filteredNotices.length > 0 ? (
          filteredNotices.map((post) => (
            <div
              key={post.id}
              className={`bg-white rounded-xl border p-5 shadow-2xs transition-all space-y-3 ${
                post.isPinned ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {post.isPinned ? (
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-[#872D35] text-white flex items-center gap-1 shadow-2xs">
                        <Pin className="w-2.5 h-2.5" />
                        <span>중요 공지 고정됨</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        일반 공지
                      </span>
                    )}
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {post.date}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-slate-400" />
                      조회 {post.readCount}회
                    </span>
                    <span className="text-xs text-slate-500">
                      작성자: {post.author}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {post.content}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => handleTogglePin(post)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                      post.isPinned
                        ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={post.isPinned ? '상단 고정 해제' : '상단 중요 공지로 고정'}
                  >
                    <Pin className="w-3 h-3" />
                    <span>{post.isPinned ? '고정해제' : '상단고정'}</span>
                  </button>

                  <button
                    onClick={() => setSelectedPostForDetail(post)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="미리보기"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleOpenEdit(post)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="공지 수정"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(post.id, post.title)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="공지 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        )) : (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold">등록된 공지사항이 없습니다.</p>
            <button
              onClick={handleOpenAdd}
              className="text-xs font-bold text-[#872D35] underline cursor-pointer"
            >
              새 공지사항 작성하기
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Notice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div 
            className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#2A2020] text-white px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-300" />
                <span>{editingPostId ? '공지사항 수정' : '새 공지사항 작성'}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  공지사항 제목 *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="예: [공지] 푸드홈 제2공장 클린룸 확장 준공 안내"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#872D35]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    작성자 부서 / 명칭
                  </label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    태그 (쉼표로 구분)
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="공지, 위생, 일정"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  썸네일 / 첨부 이미지 URL
                </label>
                <input
                  type="text"
                  value={form.thumbnail}
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                  placeholder="./images/banner_bossam.jpg 또는 https://..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  공지사항 본문 내용 *
                </label>
                <textarea
                  required
                  rows={8}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="공지사항 상세 내용을 입력해 주세요..."
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-[#872D35] leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <input
                  type="checkbox"
                  id="pinNotice"
                  checked={form.isPinned}
                  onChange={(e) => setForm({ ...form, isPinned: e.target.checked })}
                  className="rounded text-[#872D35] w-4 h-4"
                />
                <label htmlFor="pinNotice" className="text-xs font-bold text-amber-900 cursor-pointer">
                  중요 공지로 지정 (목록 최상단에 고정 표시)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[#872D35] hover:bg-[#6E1D24] text-white cursor-pointer shadow-sm"
                >
                  {editingPostId ? '공지 수정 완료' : '공지 게시하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
