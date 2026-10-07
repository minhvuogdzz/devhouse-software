import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
  Sparkles,
  X,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  FileText,
  Boxes,
  Briefcase,
  Layers,
  Code2,
  HelpCircle,
  Compass,
  Send,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client.js';

export function SearchModal({ isOpen, onClose, locale = 'vi' }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('standard'); // 'standard' | 'ai'
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [aiResponse, setAiResponse] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const inputRef = useRef(null);
  const modalRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const isEn = locale === 'en';

  // Suggested quick prompts for DH AI
  const suggestedPrompts = isEn
    ? [
        'Advise on complete website package for businesses',
        'What is Dev House’s 6-step delivery process?',
        'Cloud hosting, domain and security pricing',
        'What solutions and templates does Dev House provide?',
      ]
    : [
        'Tư vấn gói website trọn gói cho doanh nghiệp',
        'Quy trình làm việc 6 bước của Dev House',
        'Báo giá máy chủ đám mây, tên miền và bảo mật',
        'Dev House có những mẫu website và giải pháp nào?',
      ];

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
      setResults([]);
      setAiResponse(null);
      setHasSearched(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = e => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced Standard Search
  useEffect(() => {
    if (mode !== 'standard') return;

    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setTotalResults(0);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await apiClient(
          `/search?q=${encodeURIComponent(trimmed)}&locale=${locale}&limit=20`,
        );
        const data = res?.data || res;
        setResults(data?.items || []);
        setTotalResults(data?.total || 0);
      } catch (err) {
        console.error('Universal search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(debounceTimerRef.current);
  }, [query, mode, locale]);

  // Trigger DH AI Search
  const handleAiSearch = async searchPrompt => {
    const promptToSend = (searchPrompt || query).trim();
    if (!promptToSend) return;

    if (searchPrompt) {
      setQuery(searchPrompt);
    }

    setMode('ai');
    setIsLoading(true);
    setHasSearched(true);
    setAiResponse(null);

    try {
      const res = await apiClient('/search/ai', {
        method: 'POST',
        body: JSON.stringify({
          q: promptToSend,
          locale,
        }),
      });
      const data = res?.data || res;
      setAiResponse(data);
    } catch (err) {
      console.error('DH AI search error:', err);
      setAiResponse({
        answer: isEn
          ? 'An error occurred while contacting DH AI. Please try again or explore our website directly.'
          : 'Đã có lỗi xảy ra khi kết nối với DH AI. Vui lòng thử lại hoặc khám phá trực tiếp trên trang web.',
        relatedResults: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDownInput = e => {
    if (e.key === 'Enter') {
      if (mode === 'ai') {
        handleAiSearch();
      } else if (results.length > 0) {
        handleNavigate(results[0].url);
      }
    }
  };

  const handleNavigate = url => {
    onClose();
    navigate(url);
  };

  const getTypeIcon = type => {
    switch (type) {
      case 'service':
        return <Briefcase className="w-4 h-4 text-primary" />;
      case 'package':
        return <Boxes className="w-4 h-4 text-success" />;
      case 'product':
        return <Layers className="w-4 h-4 text-accent" />;
      case 'project':
        return <Compass className="w-4 h-4 text-primary" />;
      case 'solution':
        return <FileText className="w-4 h-4 text-warning" />;
      case 'technology':
        return <Code2 className="w-4 h-4 text-primary" />;
      case 'blog':
        return <FileText className="w-4 h-4 text-danger" />;
      default:
        return <HelpCircle className="w-4 h-4 text-fg-muted" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEn ? 'Search website' : 'Tìm kiếm trên website'}
      className="fixed inset-0 z-[100] flex items-start justify-center p-3 sm:p-4 md:p-6 sm:pt-16 md:pt-20 bg-scrim/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Outer container with smooth width expansion in AI mode */}
      <div
        ref={modalRef}
        className={`w-full relative transition-all duration-300 ease-out my-auto sm:my-0 ${
          mode === 'ai' ? 'max-w-3xl' : 'max-w-2xl'
        }`}
      >
        {/* Spectacular Rotating sRGB Rainbow Aura (Google-style spectrum) in DH AI mode */}
        {mode === 'ai' && (
          <>
            {/* Soft breathing blurred glow in background */}
            <div
              className="absolute -inset-1.5 rounded-[26px] opacity-70 blur-xl -z-10 pointer-events-none"
              style={{
                background:
                  'conic-gradient(from 0deg, #4285F4 0deg, #9B51E0 70deg, #EA4335 140deg, #FBBC05 210deg, #34A853 280deg, #4285F4 360deg)',
                animation: 'aiSpin 6s linear infinite',
              }}
            />
          </>
        )}

        {/* Modal Card Border Box */}
        <div
          className={`relative rounded-2xl overflow-hidden transition-all duration-300 shadow-2xl ${
            mode === 'ai' ? 'p-[2px]' : 'border border-border'
          }`}
          style={
            mode === 'ai'
              ? {
                  background:
                    'conic-gradient(from 0deg, #4285F4 0deg, #9B51E0 70deg, #EA4335 140deg, #FBBC05 210deg, #34A853 280deg, #4285F4 360deg)',
                  animation: 'aiSpin 6s linear infinite',
                }
              : {}
          }
        >
          {/* Inner Content Surface */}
          <div className="bg-surface rounded-[14px] flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden">
            {/* Header / Mode Selector Tabs */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border-subtle bg-surface-raised/40">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMode('standard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    mode === 'standard'
                      ? 'bg-primary text-primary-fg shadow-xs'
                      : 'text-fg-muted hover:text-fg hover:bg-surface-2'
                  }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Universal Search' : 'Tìm kiếm nhanh'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('ai');
                    if (query.trim() && !aiResponse) {
                      handleAiSearch();
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 relative overflow-hidden ${
                    mode === 'ai'
                      ? 'bg-primary text-primary-fg shadow-xs font-bold'
                      : 'text-fg-muted hover:text-fg hover:bg-surface-2'
                  }`}
                >
                  <Sparkles
                    className={`w-3.5 h-3.5 ${mode === 'ai' ? 'animate-pulse text-warning' : 'text-primary'}`}
                  />
                  <span className="tracking-wide">DH AI</span>
                  {mode === 'ai' && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-primary-fg/20 text-primary-fg uppercase font-bold tracking-wider">
                      AI
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[11px] text-fg-subtle">
                  {isEn ? 'Esc to close' : 'Esc để đóng'}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer"
                  aria-label={isEn ? 'Close' : 'Đóng'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-border gap-3 bg-surface">
              <div className="shrink-0 flex items-center justify-center">
                {mode === 'ai' ? (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary text-primary-fg shadow-xs">
                    <Sparkles className="w-4 h-4 animate-spin [animation-duration:8s]" />
                  </div>
                ) : (
                  <Search className="w-5 h-5 text-fg-subtle" />
                )}
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDownInput}
                placeholder={
                  mode === 'ai'
                    ? isEn
                      ? 'Ask DH AI about services, solutions, delivery process, pricing...'
                      : 'Hỏi DH AI về dịch vụ, báo giá, quy trình làm việc, tư vấn phần mềm...'
                    : isEn
                      ? 'Search services, projects, pricing packages, articles...'
                      : 'Tìm kiếm dịch vụ, dự án, bảng giá, mẫu website, bài viết...'
                }
                className="w-full bg-transparent text-fg placeholder:text-fg-subtle text-sm sm:text-base focus:outline-none"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-md text-fg-subtle hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {mode === 'ai' ? (
                <button
                  type="button"
                  onClick={() => handleAiSearch()}
                  disabled={isLoading || !query.trim()}
                  className="shrink-0 px-3.5 py-1.5 rounded-xl bg-primary text-primary-fg hover:bg-primary-hover font-semibold text-xs transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-xs"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>{isEn ? 'Ask' : 'Hỏi AI'}</span>
                      <Send className="w-3 h-3" />
                    </>
                  )}
                </button>
              ) : (
                isLoading && <Loader2 className="w-4 h-4 text-fg-subtle animate-spin" />
              )}
            </div>

            {/* Results / Interaction Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* ----------------- DH AI MODE ----------------- */}
              {mode === 'ai' && (
                <div className="space-y-5">
                  {/* AI Greeting & Status */}
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-success animate-ping" />
                      <span className="text-xs font-bold text-fg">
                        {isEn ? 'DH AI Assistant' : 'Trợ lý Trí tuệ Nhân tạo DH AI'}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        Dev House
                      </span>
                    </div>
                    <span className="text-[11px] text-fg-subtle">
                      {isEn
                        ? 'Powered by Dev House Knowledge Base'
                        : 'Dữ liệu chuẩn xác từ Dev House'}
                    </span>
                  </div>

                  {/* Empty state & Quick Suggestion Chips */}
                  {!aiResponse && !isLoading && (
                    <div className="py-4 space-y-4">
                      <p className="text-xs font-medium text-fg-muted uppercase tracking-wider">
                        {isEn ? 'Recommended inquiries:' : 'Câu hỏi gợi ý cho bạn:'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {suggestedPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAiSearch(prompt)}
                            className="p-3 text-left rounded-xl border border-border bg-surface-raised hover:bg-surface-2 hover:border-primary/50 text-xs text-fg font-medium transition-all cursor-pointer group flex items-start justify-between gap-2 shadow-2xs"
                          >
                            <span>{prompt}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-fg-subtle group-hover:text-primary shrink-0 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Loading State with animated spectral aura indicator */}
                  {isLoading && (
                    <div className="p-6 rounded-2xl border border-border bg-surface-raised/50 space-y-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-primary-fg"
                          style={{
                            background:
                              'conic-gradient(from 0deg, #4285F4, #9B51E0, #EA4335, #FBBC05, #34A853, #4285F4)',
                            animation: 'aiSpin 3s linear infinite',
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-xs font-semibold text-fg">
                          {isEn
                            ? 'DH AI is analyzing your inquiry and synthesizing knowledge...'
                            : 'DH AI đang phân tích yêu cầu và tổng hợp dữ liệu từ Dev House...'}
                        </p>
                      </div>

                      <div className="space-y-2.5 pt-1">
                        <div className="h-3 rounded-full bg-fg/10 w-full animate-pulse" />
                        <div className="h-3 rounded-full bg-fg/10 w-4/5 animate-pulse" />
                        <div className="h-3 rounded-full bg-fg/10 w-3/5 animate-pulse" />
                      </div>
                    </div>
                  )}

                  {/* AI Response Display */}
                  {aiResponse && !isLoading && (
                    <div className="space-y-5 animate-in fade-in duration-300">
                      {/* Answer Box */}
                      <div className="p-4 sm:p-5 rounded-2xl border border-border bg-surface-raised space-y-4 shadow-sm">
                        <div className="flex items-center gap-2 text-primary font-semibold text-xs pb-2 border-b border-border-subtle">
                          <Sparkles className="w-4 h-4" />
                          <span>{isEn ? 'DH AI Answer' : 'Câu trả lời từ DH AI'}</span>
                        </div>

                        {/* Markdown / Plain Text Answer Rendering */}
                        <div className="text-sm leading-relaxed text-fg space-y-3 prose prose-sm max-w-none">
                          {aiResponse.answer.split('\n\n').map((paragraph, pIdx) => {
                            if (paragraph.startsWith('### ')) {
                              return (
                                <h4 key={pIdx} className="font-bold text-base text-fg mt-3 mb-1">
                                  {paragraph.replace('### ', '')}
                                </h4>
                              );
                            }
                            if (paragraph.startsWith('## ')) {
                              return (
                                <h3 key={pIdx} className="font-bold text-lg text-fg mt-3 mb-1">
                                  {paragraph.replace('## ', '')}
                                </h3>
                              );
                            }
                            if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
                              const lines = paragraph.split('\n');
                              return (
                                <ul
                                  key={pIdx}
                                  className="space-y-1.5 pl-4 list-disc text-xs sm:text-sm text-fg"
                                >
                                  {lines.map((line, lIdx) => (
                                    <li
                                      key={lIdx}
                                      dangerouslySetInnerHTML={{
                                        __html: renderInlineFormatting(
                                          line.replace(/^[-*]\s*/, ''),
                                        ),
                                      }}
                                    />
                                  ))}
                                </ul>
                              );
                            }
                            return (
                              <p
                                key={pIdx}
                                className="text-xs sm:text-sm text-fg"
                                dangerouslySetInnerHTML={{
                                  __html: renderInlineFormatting(paragraph),
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Related Website Cards / Deep Links */}
                      {aiResponse.relatedResults && aiResponse.relatedResults.length > 0 && (
                        <div className="space-y-2.5">
                          <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-primary" />
                            <span>
                              {isEn
                                ? 'Related website resources:'
                                : 'Tài nguyên & Liên kết liên quan trên website:'}
                            </span>
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {aiResponse.relatedResults.slice(0, 4).map(item => (
                              <div
                                key={item.id}
                                onClick={() => handleNavigate(item.url)}
                                className="p-3 rounded-xl border border-border bg-surface hover:bg-surface-2 hover:border-primary/40 transition-all cursor-pointer group flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                                      {getTypeIcon(item.type)}
                                      <span>{item.typeLabel}</span>
                                    </span>
                                    {item.badge && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-sunken text-fg-muted border border-border-subtle">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-xs sm:text-sm font-semibold text-fg group-hover:text-primary transition-colors line-clamp-1">
                                    {item.title}
                                  </h4>
                                  {item.description && (
                                    <p className="text-[11px] text-fg-muted mt-0.5 line-clamp-2">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <div className="mt-2 pt-2 border-t border-border-subtle flex items-center justify-between text-[11px] text-primary font-medium">
                                  <span>{isEn ? 'View details' : 'Xem chi tiết'}</span>
                                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Follow-up Question Prompts */}
                      <div className="pt-2 flex items-center justify-between text-xs text-fg-muted">
                        <span>
                          {isEn ? 'Want to explore more?' : 'Bạn cần tư vấn thêm điều gì?'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setQuery('');
                            inputRef.current?.focus();
                          }}
                          className="text-primary hover:underline font-semibold cursor-pointer"
                        >
                          {isEn ? 'Ask another question' : 'Đặt câu hỏi mới'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ----------------- STANDARD MODE ----------------- */}
              {mode === 'standard' && (
                <div className="space-y-4">
                  {/* Results list */}
                  {results.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-1 text-xs text-fg-muted font-medium">
                        <span>
                          {isEn
                            ? `Found ${totalResults} results`
                            : `Tìm thấy ${totalResults} kết quả`}
                        </span>
                        <span>{isEn ? 'Click or Enter to view' : 'Bấm vào để xem chi tiết'}</span>
                      </div>

                      <div className="divide-y divide-border-subtle">
                        {results.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleNavigate(item.url)}
                            className="py-3 px-3 -mx-2 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer group flex items-start justify-between gap-3"
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="p-2 rounded-lg bg-surface-raised border border-border-subtle text-primary shrink-0 mt-0.5">
                                {getTypeIcon(item.type)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                                    {item.typeLabel}
                                  </span>
                                  {item.badge && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-sunken text-fg-muted border border-border">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-sm font-semibold text-fg group-hover:text-primary transition-colors truncate mt-0.5">
                                  {item.title}
                                </h3>
                                {item.description && (
                                  <p className="text-xs text-fg-muted line-clamp-2 mt-0.5">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <ArrowRight className="w-4 h-4 text-fg-subtle group-hover:text-primary group-hover:translate-x-1 shrink-0 mt-2 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state when searching and no results */}
                  {hasSearched && !isLoading && results.length === 0 && (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-surface-raised border border-border flex items-center justify-center mx-auto text-fg-muted">
                        <Search className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-fg">
                          {isEn ? 'No results found' : 'Không tìm thấy kết quả phù hợp'}
                        </p>
                        <p className="text-xs text-fg-muted mt-1 max-w-sm mx-auto">
                          {isEn
                            ? 'Try searching with different keywords, or switch to DH AI for smart guidance.'
                            : 'Thử tìm kiếm với từ khóa khác, hoặc chuyển sang trợ lý DH AI để được hỗ trợ thông minh.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setMode('ai');
                          handleAiSearch();
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-fg font-semibold text-xs shadow-xs hover:bg-primary-hover transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-warning" />
                        <span>{isEn ? 'Ask DH AI about this' : 'Hỏi trợ lý DH AI ngay'}</span>
                      </button>
                    </div>
                  )}

                  {/* Initial state before searching */}
                  {!hasSearched && !query && (
                    <div className="py-8 text-center space-y-3">
                      <p className="text-xs text-fg-muted">
                        {isEn
                          ? 'Start typing to search across all services, packages, templates, and insights.'
                          : 'Nhập từ khóa để quét toàn bộ dịch vụ, gói cước, dự án, bài viết trên Dev House.'}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                        {[
                          'Website',
                          isEn ? 'Hosting' : 'Máy chủ',
                          isEn ? 'Packages' : 'Bảng giá',
                          isEn ? 'Process' : 'Quy trình',
                          isEn ? 'Security' : 'Bảo mật',
                        ].map(keyword => (
                          <button
                            key={keyword}
                            type="button"
                            onClick={() => setQuery(keyword)}
                            className="px-2.5 py-1 rounded-lg border border-border bg-surface-raised hover:bg-surface-2 text-xs text-fg font-medium transition-colors cursor-pointer"
                          >
                            {keyword}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Bar */}
            <div className="px-4 py-2.5 border-t border-border bg-surface-raised/40 flex items-center justify-between text-[11px] text-fg-subtle">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-fg">Dev House Software</span>
                <span>•</span>
                <span>
                  {mode === 'ai'
                    ? 'DH AI Assistant'
                    : isEn
                      ? 'Universal Website Search'
                      : 'Tìm kiếm toàn trang'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-sans text-[10px]">
                    Esc
                  </kbd>
                  <span>{isEn ? 'to exit' : 'đóng'}</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border font-sans text-[10px]">
                    ↵
                  </kbd>
                  <span>{mode === 'ai' ? (isEn ? 'to ask' : 'gửi') : isEn ? 'to open' : 'mở'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Style for Keyframe Animation */}
      <style>{`
        @keyframes aiSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/**
 * Basic markdown bold/link inline formatter
 */
function renderInlineFormatting(str) {
  if (!str) return '';
  return str.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>');
}
