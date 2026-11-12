import React, { useState } from 'react';
import { ProductItem } from '../../../types';
import { 
  Home, 
  Building2, 
  Package, 
  MessageSquare, 
  FileText, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Search, 
  Layout, 
  Settings, 
  Eye, 
  Plus,
  Sparkles,
  Award,
  Flame,
  Truck,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
  Folder
} from 'lucide-react';

interface VisualPageTreeProps {
  activePage: string;
  onSelectPage: (page: string, productId?: string) => void;
  selectedProductId: string;
  products: ProductItem[];
  mainSections: Array<{ id: string; name: string; visible: boolean; order: number }>;
  onSelectTarget?: (type: string, id: string, title: string) => void;
}

export const VisualPageTree: React.FC<VisualPageTreeProps> = ({
  activePage,
  onSelectPage,
  selectedProductId,
  products,
  mainSections,
  onSelectTarget
}) => {
  const [productSearch, setProductSearch] = useState('');
  const [isHomeOpen, setIsHomeOpen] = useState(true);
  const [isAboutOpen, setIsAboutOpen] = useState(true);
  const [isProductsOpen, setIsProductsOpen] = useState(true);
  const [isBoardsOpen, setIsBoardsOpen] = useState(false);
  const [isHeaderFooterOpen, setIsHeaderFooterOpen] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const isCurrentProductPage = activePage === 'product-detail' || activePage.startsWith('product:');

  return (
    <div className="w-72 bg-[#FAF8F5] border-r border-stone-200 flex flex-col h-full shrink-0 select-none">
      
      {/* Top Header of Tree */}
      <div className="p-3.5 border-b border-stone-200 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#872D35]" />
            <span className="font-extrabold text-xs text-stone-800">페이지 & 섹션 탐색</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            총 {products.length + 8}개 화면
          </span>
        </div>
        <p className="text-[11px] text-stone-500 leading-tight">
          편집할 페이지나 개별 제품을 클릭하면 가운데 화면에 실시간으로 표시됩니다.
        </p>
      </div>

      {/* Scrollable Tree List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">

        {/* 1. 메인 홈페이지 */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
          <button
            onClick={() => {
              onSelectPage('home');
              setIsHomeOpen(prev => !prev);
            }}
            className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
              activePage === 'home' ? 'bg-[#872D35]/10 text-[#872D35] font-black' : 'text-stone-800 hover:bg-stone-50 font-bold'
            }`}
          >
            <div className="flex items-center gap-2 text-xs truncate">
              <Home className="w-4 h-4 text-[#872D35] shrink-0" />
              <span>메인페이지 (홈)</span>
            </div>
            {isHomeOpen ? <ChevronDown className="w-3.5 h-3.5 text-stone-400" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          {isHomeOpen && (
            <div className="px-2 pb-2 pt-1 border-t border-stone-100 space-y-0.5 bg-stone-50/50">
              {mainSections.map((sec, idx) => (
                <button
                  key={sec.id}
                  onClick={() => {
                    onSelectPage('home');
                    if (onSelectTarget) {
                      onSelectTarget('main_section', sec.id, sec.name);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] flex items-center justify-between hover:bg-white text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-mono text-[10px] text-stone-400 font-bold w-4">
                      {idx + 1}
                    </span>
                    <span className="truncate">{sec.name}</span>
                  </div>
                  {sec.visible === false && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-stone-200 text-stone-500">
                      숨김
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. 회사소개 서브페이지 */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
          <button
            onClick={() => {
              onSelectPage('about');
              setIsAboutOpen(prev => !prev);
            }}
            className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
              activePage.startsWith('about') ? 'bg-[#872D35]/10 text-[#872D35] font-black' : 'text-stone-800 hover:bg-stone-50 font-bold'
            }`}
          >
            <div className="flex items-center gap-2 text-xs truncate">
              <Building2 className="w-4 h-4 text-[#872D35] shrink-0" />
              <span>회사소개 (4개 서브페이지)</span>
            </div>
            {isAboutOpen ? <ChevronDown className="w-3.5 h-3.5 text-stone-400" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          {isAboutOpen && (
            <div className="px-2 pb-2 pt-1 border-t border-stone-100 space-y-0.5 bg-stone-50/50">
              <button
                onClick={() => onSelectPage('about-intro')}
                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                  activePage === 'about-intro' || activePage === 'about' ? 'bg-[#872D35] text-white font-bold' : 'hover:bg-white text-stone-600'
                }`}
              >
                <span>인사말 & 비전 (CEO 인사말)</span>
                <span className="text-[10px] opacity-70">편집</span>
              </button>
              <button
                onClick={() => onSelectPage('about-system')}
                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                  activePage === 'about-system' ? 'bg-[#872D35] text-white font-bold' : 'hover:bg-white text-stone-600'
                }`}
              >
                <span>제조 가공 센터 & 시스템</span>
                <span className="text-[10px] opacity-70">편집</span>
              </button>
              <button
                onClick={() => onSelectPage('about-permits')}
                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                  activePage === 'about-permits' ? 'bg-[#872D35] text-white font-bold' : 'hover:bg-white text-stone-600'
                }`}
              >
                <span>식품안전 인증서 & 인허가</span>
                <span className="text-[10px] opacity-70">편집</span>
              </button>
              <button
                onClick={() => onSelectPage('about-location')}
                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                  activePage === 'about-location' ? 'bg-[#872D35] text-white font-bold' : 'hover:bg-white text-stone-600'
                }`}
              >
                <span>오시는 길 & 가공센터</span>
                <span className="text-[10px] opacity-70">편집</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. 제품소개 & 개별 제품 상세페이지 */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
          <button
            onClick={() => setIsProductsOpen(prev => !prev)}
            className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
              activePage === 'products' || isCurrentProductPage ? 'bg-[#872D35]/10 text-[#872D35] font-black' : 'text-stone-800 hover:bg-stone-50 font-bold'
            }`}
          >
            <div className="flex items-center gap-2 text-xs truncate">
              <Package className="w-4 h-4 text-[#872D35] shrink-0" />
              <span>제품소개 & 개별 상세페이지</span>
            </div>
            {isProductsOpen ? <ChevronDown className="w-3.5 h-3.5 text-stone-400" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          {isProductsOpen && (
            <div className="px-2 pb-2 pt-1 border-t border-stone-100 space-y-1 bg-stone-50/50">
              
              {/* Entire Catalog Page Link */}
              <button
                onClick={() => onSelectPage('products')}
                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                  activePage === 'products' ? 'bg-[#872D35] text-white font-bold' : 'hover:bg-white text-stone-700 font-semibold'
                }`}
              >
                <span>전체 제품 목록 화면 (카탈로그)</span>
                <span className="text-[10px] opacity-80">목록</span>
              </button>

              {/* Product Search Box */}
              <div className="relative my-1">
                <input
                  type="text"
                  placeholder="제품 검색 (예: 막국수소스, 보쌈무)..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1 text-[11px] rounded-lg border border-stone-200 bg-white focus:outline-hidden focus:border-[#872D35]"
                />
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2 top-2" />
              </div>

              {/* Individual Products List */}
              <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
                {filteredProducts.map((p) => {
                  const isSelected = isCurrentProductPage && selectedProductId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectPage('product-detail', p.id)}
                      className={`w-full px-2 py-1.5 rounded-lg text-left text-[11px] flex items-center justify-between gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#872D35] text-white font-black shadow-xs'
                          : 'hover:bg-white text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <img 
                          src={p.imageUrl} 
                          alt="" 
                          className="w-5 h-5 rounded object-cover shrink-0 border border-stone-200/50" 
                        />
                        <span className="truncate">{p.name}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded shrink-0 font-bold ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {p.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 4. 고객센터 및 게시판 */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
          <button
            onClick={() => setIsBoardsOpen(prev => !prev)}
            className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
              activePage.includes('board') ? 'bg-[#872D35]/10 text-[#872D35] font-black' : 'text-stone-800 hover:bg-stone-50 font-bold'
            }`}
          >
            <div className="flex items-center gap-2 text-xs truncate">
              <MessageSquare className="w-4 h-4 text-[#872D35] shrink-0" />
              <span>고객센터 & 게시판</span>
            </div>
            {isBoardsOpen ? <ChevronDown className="w-3.5 h-3.5 text-stone-400" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          {isBoardsOpen && (
            <div className="px-2 pb-2 pt-1 border-t border-stone-100 space-y-0.5 bg-stone-50/50">
              <button
                onClick={() => onSelectPage('sample-board')}
                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                  activePage === 'sample-board' ? 'bg-[#872D35] text-white font-bold' : 'hover:bg-white text-stone-600'
                }`}
              >
                <span>무료 샘플 신청 게시판</span>
                <span className="text-[10px] opacity-70">화면</span>
              </button>
              <button
                onClick={() => onSelectPage('quote-board')}
                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                  activePage === 'quote-board' ? 'bg-[#872D35] text-white font-bold' : 'hover:bg-white text-stone-600'
                }`}
              >
                <span>1:1 대량 납품 견적 문의</span>
                <span className="text-[10px] opacity-70">화면</span>
              </button>
              <button
                onClick={() => onSelectPage('notice-board')}
                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                  activePage === 'notice-board' ? 'bg-[#872D35] text-white font-bold' : 'hover:bg-white text-stone-600'
                }`}
              >
                <span>공지사항 (News & Notice)</span>
                <span className="text-[10px] opacity-70">화면</span>
              </button>
              <button
                onClick={() => onSelectPage('faq-board')}
                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                  activePage === 'faq-board' ? 'bg-[#872D35] text-white font-bold' : 'hover:bg-white text-stone-600'
                }`}
              >
                <span>자주 묻는 질문 (FAQ)</span>
                <span className="text-[10px] opacity-70">화면</span>
              </button>
            </div>
          )}
        </div>

        {/* 5. 공통 헤더 & 푸터 */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
          <button
            onClick={() => {
              setIsHeaderFooterOpen(prev => !prev);
              if (onSelectTarget) {
                onSelectTarget('header_footer', 'global-header-footer', '헤더 & 푸터 설정');
              }
            }}
            className="w-full px-3 py-2.5 flex items-center justify-between text-left text-stone-800 hover:bg-stone-50 font-bold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-xs truncate">
              <Settings className="w-4 h-4 text-[#872D35] shrink-0" />
              <span>상단 헤더 & 하단 푸터</span>
            </div>
            {isHeaderFooterOpen ? <ChevronDown className="w-3.5 h-3.5 text-stone-400" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
          </button>

          {isHeaderFooterOpen && (
            <div className="px-2 pb-2 pt-1 border-t border-stone-100 space-y-0.5 bg-stone-50/50">
              <button
                onClick={() => {
                  if (onSelectTarget) {
                    onSelectTarget('header_footer', 'header-logo', '상단 헤더 로고 및 크기');
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] hover:bg-white text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              >
                로고 이미지 및 가로 너비 설정
              </button>
              <button
                onClick={() => {
                  if (onSelectTarget) {
                    onSelectTarget('header_footer', 'footer-info', '하단 푸터 회사 정보');
                  }
                }}
                className="w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] hover:bg-white text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
              >
                푸터 연락처 / 사업자정보 / CS시간
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Tree Bottom Hint */}
      <div className="p-3 border-t border-stone-200 bg-white text-[11px] text-stone-500 flex items-center justify-between">
        <span>선택된 페이지: <strong className="text-[#872D35]">{activePage}</strong></span>
      </div>

    </div>
  );
};
