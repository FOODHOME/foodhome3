import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PostItem } from '../types';
import { 
  FileText, 
  Calendar, 
  Eye, 
  Search, 
  ArrowRight,
  Plus,
  Megaphone
} from 'lucide-react';

export const BlogNoticeSection: React.FC = () => {
  const { 
    state, 
    setSelectedPostForDetail, 
    incrementPostRead,
    setIsAdminOpen,
    setActiveAdminTab 
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['전체', '공지사항', '조리·활용 레시피', 'B2B 납품스토리', '이벤트'];

  const filteredPosts = state.posts.filter(post => {
    const matchesCategory = activeCategory === '전체' || post.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handlePostClick = (post: PostItem) => {
    incrementPostRead(post.id);
    setSelectedPostForDetail(post);
  };

  return (
    <section id="post-section" className="py-12 bg-[#FAF8F5] border-b border-[#E8E2DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-[#872D35]" />
              <span className="text-xs font-bold text-[#872D35] uppercase tracking-wider">
                NEWS & RECIPES
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2A2020] tracking-tight">
              푸드홈 공지사항 & 외식 레시피 가이드
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              위생안전 소식부터 보쌈 매장 사장님들을 위한 조리 꿀팁, 프랜차이즈 납품 소식을 전합니다.
            </p>
          </div>

          {/* Quick Write in Admin */}
          <button
            onClick={() => {
              setActiveAdminTab('notices');
              setIsAdminOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-[#E8E2DC] bg-white text-[#332525] hover:bg-stone-100 transition-colors shadow-2xs self-start md:self-auto cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5 text-[#872D35]" />
            <span>공지사항 관리</span>
          </button>
        </div>

        {/* Category Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#872D35] text-white'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-[#E8E2DC]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="게시글 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E8E2DC] bg-white text-xs text-[#2A2020] placeholder-slate-400 focus:outline-none focus:border-[#872D35]"
            />
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => handlePostClick(post)}
              className="bg-white rounded-xl border border-[#E8E2DC] overflow-hidden hover:border-[#872D35] hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Cover Image if available */}
                {(post.thumbnail || post.imageUrl) && (
                  <div className="aspect-16/9 overflow-hidden bg-stone-100">
                    <img
                      src={post.thumbnail || post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-center gap-2 text-[11px] text-[#872D35] font-bold mb-1.5">
                    <span>{post.category}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400 font-normal">{post.date}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-extrabold text-[#2A2020] group-hover:text-[#872D35] transition-colors line-clamp-1">
                    {post.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed font-normal">
                    {post.content}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-3 pt-2 border-t border-[#F0EBE6] flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-[#872D35] font-semibold group-hover:underline">
                  <span>자세히 보기</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{post.readCount}회</span>
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
