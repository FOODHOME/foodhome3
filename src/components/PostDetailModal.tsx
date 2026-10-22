import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Calendar, 
  User, 
  Eye, 
  Tag, 
  Share2, 
  ChevronLeft
} from 'lucide-react';

export const PostDetailModal: React.FC = () => {
  const { 
    selectedPostForDetail, 
    setSelectedPostForDetail, 
    showToast 
  } = useApp();

  if (!selectedPostForDetail) return null;

  const post = selectedPostForDetail;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('게시글 링크가 클립보드에 복사되었습니다.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#E8E2DC] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-[#E8E2DC] flex items-center justify-between">
          <button
            onClick={() => setSelectedPostForDetail(null)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#872D35] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>목록으로 돌아가기</span>
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#872D35] hover:bg-stone-50 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
              title="링크 복사"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">공유</span>
            </button>
            <button
              onClick={() => setSelectedPostForDetail(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Post Header */}
          <div className="space-y-3 pb-6 border-b border-[#E8E2DC]">
            <span className="inline-block text-xs font-bold px-2.5 py-1 rounded bg-[#872D35] text-white">
              {post.category}
            </span>
            
            <h2 className="text-xl sm:text-2xl font-black text-[#2A2020] leading-snug">
              {post.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{post.author}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{post.date}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>조회수 {post.readCount}회</span>
              </span>
            </div>
          </div>

          {/* Featured Image */}
          {(post.thumbnail || post.imageUrl) && (
            <div className="rounded-xl overflow-hidden aspect-16/9 bg-stone-100 border border-[#E8E2DC]">
              <img 
                src={post.thumbnail || post.imageUrl} 
                alt={post.title}
                className="w-full h-full object-cover" 
              />
            </div>
          )}

          {/* Article Content */}
          <div className="text-sm sm:text-base text-stone-800 leading-relaxed space-y-4 whitespace-pre-line font-normal">
            {post.content}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-6 border-t border-[#E8E2DC] flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-[#872D35]" />
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-md bg-[#FAF8F5] text-stone-700 border border-[#E8E2DC]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#FAF8F5] border-t border-[#E8E2DC] px-6 py-4 flex items-center justify-end">
          <button
            onClick={() => setSelectedPostForDetail(null)}
            className="px-5 py-2 rounded-lg bg-[#2A2020] hover:bg-[#872D35] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
