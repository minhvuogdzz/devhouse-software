import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import {
  Search,
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
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { apiClient } from '../../lib/api-client.js';
import { DhAiIcon } from '../ui/DhAiIcon.jsx';
import { startVoiceRecognition, speakText, stopSpeaking } from '../../lib/voice.js';

export function SearchModal({ isOpen, onClose, locale = 'vi' }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('standard'); // 'standard' | 'ai'
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [aiResponse, setAiResponse] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const recognitionRef = useRef(null);

  const isEn = locale === 'en';

  // Suggested quick prompts for DH AI
  const suggestedPrompts = isEn
    ? [
        'Advise on complete website package for businesses',
        'What is Devhouse’s 6-step delivery process?',
        'Cloud hosting, domain and security pricing',
        'What solutions and templates does Devhouse provide?',
      ]
    : [
        'Tư vấn gói website trọn gói cho doanh nghiệp',
        'Quy trình làm việc 6 bước của Devhouse',
        'Báo giá máy chủ đám mây, tên miền và bảo mật',
        'Devhouse có những mẫu website và giải pháp nào?',
      ];

  // Focus input when opened, clean up voice when closed
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setResults([]);
      setAiResponse(null);
      setHasSearched(false);
      setVoiceError('');
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      stopSpeaking();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      stopSpeaking();
    };
  }, []);

  // Handle ESC key and outside click anywhere outside the search box
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = e => {
      if (containerRef.current && containerRef.current.contains(e.target)) {
        return;
      }
      if (e.target.closest && e.target.closest('[data-search-trigger]')) {
        return;
      }
      onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
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
          `/search?q=${encodeURIComponent(trimmed)}&locale=${locale}&limit=16`,
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

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
    }
    stopSpeaking();
    setIsSpeaking(false);

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

  // Toggle Voice Input (Speech-to-Text)
  const toggleVoiceInput = () => {
    setVoiceError('');
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }

    stopSpeaking();
    setIsSpeaking(false);
    const baseText = query.trim();

    recognitionRef.current = startVoiceRecognition({
      locale,
      onStart: () => setIsListening(true),
      onResult: (transcript, isFinal) => {
        const nextVal = baseText ? `${baseText} ${transcript}` : transcript;
        setQuery(nextVal);
        if (isFinal && mode === 'ai' && nextVal.trim()) {
          handleAiSearch(nextVal.trim());
        }
      },
      onEnd: () => {
        setIsListening(false);
        recognitionRef.current = null;
      },
      onError: errCode => {
        setIsListening(false);
        recognitionRef.current = null;
        if (errCode === 'unsupported') {
          setVoiceError(
            isEn
              ? 'Browser does not support voice input.'
              : 'Trình duyệt không hỗ trợ nhập giọng nói.',
          );
        } else if (errCode === 'not-allowed') {
          setVoiceError(
            isEn
              ? 'Please allow microphone access.'
              : 'Vui lòng cấp quyền Micro cho trình duyệt.',
          );
        }
      },
    });
  };

  // Toggle Voice Output (Text-to-Speech) for DH AI Answer
  const toggleSpeakAiAnswer = text => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    speakText({
      text,
      locale,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
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
    <>
      {/* Dropdown panel flowing down right below search button — no backdrop blur on header */}
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={isEn ? 'Search website' : 'Tìm kiếm trên website'}
        className={`fixed sm:absolute z-50 top-[76px] sm:top-full left-3 right-3 sm:left-auto sm:right-0 sm:mt-2.5 transition-all duration-300 ease-out ${
          mode === 'ai' ? 'sm:w-[620px] md:w-[680px]' : 'sm:w-[540px] md:w-[580px]'
        } max-w-[calc(100vw-1.5rem)]`}
      >
        {/* Border Box with rotating sRGB perimeter line strictly clipped to border in DH AI mode */}
        <div
          className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
            mode === 'ai' ? 'p-[2px]' : 'border border-border bg-surface'
          }`}
        >
          {/* THE ROTATING sRGB BORDER: Spin strictly inside the 2px perimeter, zero leakage outside */}
          {mode === 'ai' && (
            <div
              className="absolute -top-[150%] -left-[150%] w-[400%] h-[400%] pointer-events-none"
              style={{
                background:
                  'conic-gradient(from 0deg, #4285F4 0deg, #9B51E0 72deg, #EA4335 144deg, #FBBC05 216deg, #34A853 288deg, #4285F4 360deg)',
                animation: 'aiSpin 4s linear infinite',
              }}
            />
          )}

          {/* INNER CONTENT CONTAINER: 100% stationary, upright, never rotating! */}
          <div className="relative z-10 w-full bg-surface rounded-[14px] flex flex-col max-h-[78vh] sm:max-h-[72vh] overflow-hidden">
            {/* Header: Mode Switcher */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border-subtle bg-surface-raised/40">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMode('standard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    mode === 'standard'
                      ? 'bg-primary text-primary-fg shadow-2xs'
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                    mode === 'ai'
                      ? 'bg-primary/10 text-primary border border-primary/30 shadow-2xs font-bold'
                      : 'text-fg-muted hover:text-fg hover:bg-surface-2'
                  }`}
                >
                  <DhAiIcon size="sm" />
                  <span className="tracking-wide">DH AI Search</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block text-[11px] text-fg-subtle">
                  {isEn ? 'Esc to close' : 'Esc đóng'}
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer"
                  aria-label={isEn ? 'Close' : 'Đóng'}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Input Bar */}
            <div className="flex items-center px-3.5 py-3 border-b border-border gap-2 bg-surface">
              <div className="shrink-0 flex items-center justify-center">
                {mode === 'ai' ? (
                  <DhAiIcon size="md" />
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
                  isListening
                    ? isEn
                      ? 'Listening... speak now'
                      : 'Đang lắng nghe giọng nói của bạn...'
                    : mode === 'ai'
                      ? isEn
                        ? 'Ask DH AI about services, delivery process, pricing...'
                        : 'Hỏi DH AI về dịch vụ, báo giá, quy trình làm việc...'
                      : isEn
                        ? 'Search services, projects, pricing, templates...'
                        : 'Tìm kiếm dịch vụ, dự án, bảng giá, mẫu website...'
                }
                className="w-full bg-transparent text-fg placeholder:text-fg-subtle text-base sm:text-sm focus:outline-none"
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

              {/* Voice Input (Microphone) Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={isLoading}
                className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 ${
                  isListening
                    ? 'bg-danger text-on-scrim animate-pulse shadow-xs'
                    : 'text-fg-muted hover:text-primary hover:bg-surface-2 border border-border-subtle'
                }`}
                title={
                  isListening
                    ? isEn
                      ? 'Stop voice input'
                      : 'Dừng thu âm'
                    : isEn
                      ? 'Voice search'
                      : 'Tìm kiếm bằng giọng nói'
                }
                aria-label={isEn ? 'Voice search' : 'Tìm kiếm bằng giọng nói'}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>

              {mode === 'standard' && (
                <button
                  type="button"
                  onClick={() => {
                    setMode('ai');
                    if (query.trim()) {
                      handleAiSearch();
                    }
                  }}
                  className="shrink-0 px-2.5 py-1 rounded-lg border border-border hover:border-primary/40 bg-surface-raised hover:bg-surface-2 text-fg transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold shadow-2xs group"
                  title={isEn ? 'Switch to DH AI Search' : 'Tìm kiếm bằng DH AI'}
                >
                  <DhAiIcon size="sm" />
                  <span className="text-fg font-medium group-hover:text-primary transition-colors">
                    DH AI
                  </span>
                </button>
              )}

              {mode === 'ai' ? (
                <button
                  type="button"
                  onClick={() => handleAiSearch()}
                  disabled={isLoading || !query.trim()}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-primary text-primary-fg hover:bg-primary-hover font-semibold text-xs transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-xs"
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

            {voiceError && (
              <div className="px-3.5 py-1.5 bg-danger/10 border-b border-danger/20 text-[11px] text-danger font-medium">
                {voiceError}
              </div>
            )}

            {/* Content / Interaction Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* ----------------- DH AI MODE ----------------- */}
              {mode === 'ai' && (
                <div className="space-y-4">
                  {/* AI Status Badge */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                      <DhAiIcon size="sm" />
                      <span className="text-xs font-bold text-fg">
                        {isEn ? 'DH AI Assistant' : 'Trợ lý Trí tuệ Nhân tạo DH AI'}
                      </span>
                    </div>
                    <span className="text-[11px] text-fg-subtle">
                      {isEn ? 'Devhouse Knowledge Base' : 'Tri thức Devhouse'}
                    </span>
                  </div>

                  {/* Empty state & Quick Suggestion Chips */}
                  {!aiResponse && !isLoading && (
                    <div className="py-2 space-y-3">
                      <p className="text-xs font-medium text-fg-muted uppercase tracking-wider">
                        {isEn ? 'Popular inquiries:' : 'Câu hỏi gợi ý:'}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {suggestedPrompts.map((prompt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAiSearch(prompt)}
                            className="p-2.5 text-left rounded-xl border border-border bg-surface-raised hover:bg-surface-2 hover:border-primary/50 text-xs text-fg font-medium transition-all cursor-pointer group flex items-start justify-between gap-2 shadow-2xs"
                          >
                            <span>{prompt}</span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-fg-subtle group-hover:text-primary shrink-0 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Loading State with animated aura indicator */}
                  {isLoading && (
                    <div className="p-5 rounded-2xl border border-border bg-surface-raised/50 space-y-3">
                      <div className="flex items-center gap-3">
                        <DhAiIcon size="md" />
                        <p className="text-xs font-semibold text-fg">
                          {isEn
                            ? 'DH AI is analyzing your inquiry and synthesizing knowledge...'
                            : 'DH AI đang phân tích yêu cầu và tổng hợp dữ liệu từ Devhouse...'}
                        </p>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="h-2.5 rounded-full bg-fg/10 w-full animate-pulse" />
                        <div className="h-2.5 rounded-full bg-fg/10 w-4/5 animate-pulse" />
                        <div className="h-2.5 rounded-full bg-fg/10 w-3/5 animate-pulse" />
                      </div>
                    </div>
                  )}

                  {/* AI Response Display */}
                  {aiResponse && !isLoading && (
                    <div className="space-y-4">
                      {/* Answer Box */}
                      <div className="p-4 rounded-xl border border-border bg-surface-raised space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border-subtle">
                          <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                            <DhAiIcon size="sm" />
                            <span>{isEn ? 'DH AI Answer' : 'Câu trả lời từ DH AI'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSpeakAiAnswer(aiResponse.answer)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                              isSpeaking
                                ? 'bg-primary/15 text-primary border border-primary/30'
                                : 'bg-surface border border-border-subtle text-fg-muted hover:text-primary hover:border-primary/40'
                            }`}
                            title={
                              isSpeaking
                                ? isEn
                                  ? 'Stop reading'
                                  : 'Dừng đọc'
                                : isEn
                                  ? 'Read aloud'
                                  : 'Đọc câu trả lời'
                            }
                          >
                            {isSpeaking ? (
                              <>
                                <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                                <span>{isEn ? 'Stop' : 'Dừng đọc'}</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>{isEn ? 'Listen' : 'Nghe phản hồi'}</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Formatted Answer Rendering with rich structured layout */}
                        <DhAiMessageRenderer content={aiResponse.answer} />
                      </div>

                      {/* Related Website Cards / Deep Links */}
                      {aiResponse.relatedResults && aiResponse.relatedResults.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-semibold text-fg-muted uppercase tracking-wider flex items-center gap-1.5">
                            <Compass className="w-3.5 h-3.5 text-primary" />
                            <span>
                              {isEn
                                ? 'Related resources on website:'
                                : 'Tài nguyên liên quan trên website:'}
                            </span>
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {aiResponse.relatedResults.slice(0, 4).map(item => (
                              <div
                                key={item.id}
                                onClick={() => handleNavigate(item.url)}
                                className="p-2.5 rounded-xl border border-border bg-surface hover:bg-surface-2 hover:border-primary/40 transition-all cursor-pointer group flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1.5 mb-1">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                                      {getTypeIcon(item.type)}
                                      <span>{item.typeLabel}</span>
                                    </span>
                                    {item.badge && (
                                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-sunken text-fg-muted border border-border-subtle">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-xs font-semibold text-fg group-hover:text-primary transition-colors line-clamp-1">
                                    {item.title}
                                  </h4>
                                  {item.description && (
                                    <p className="text-[11px] text-fg-muted mt-0.5 line-clamp-2">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                                <div className="mt-2 pt-1.5 border-t border-border-subtle flex items-center justify-between text-[11px] text-primary font-medium">
                                  <span>{isEn ? 'View' : 'Xem chi tiết'}</span>
                                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Follow-up Prompt */}
                      <div className="pt-1 flex items-center justify-between text-xs text-fg-muted">
                        <span>{isEn ? 'Ask more?' : 'Cần hỏi thêm?'}</span>
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
                <div className="space-y-3">
                  {/* Results list */}
                  {results.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between pb-1 text-xs text-fg-muted font-medium">
                        <span>
                          {isEn
                            ? `Found ${totalResults} results`
                            : `Tìm thấy ${totalResults} kết quả`}
                        </span>
                        <span>{isEn ? 'Click to open' : 'Bấm để mở'}</span>
                      </div>

                      <div className="divide-y divide-border-subtle">
                        {results.map(item => (
                          <div
                            key={item.id}
                            onClick={() => handleNavigate(item.url)}
                            className="py-2.5 px-2.5 -mx-1.5 rounded-xl hover:bg-surface-2 transition-colors cursor-pointer group flex items-start justify-between gap-2.5"
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className="p-2 rounded-lg bg-surface-raised border border-border-subtle text-primary shrink-0 mt-0.5">
                                {getTypeIcon(item.type)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                    {item.typeLabel}
                                  </span>
                                  {item.badge && (
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-sunken text-fg-muted border border-border">
                                      {item.badge}
                                    </span>
                                  )}
                                </div>
                                <h3 className="text-xs sm:text-sm font-semibold text-fg group-hover:text-primary transition-colors truncate mt-0.5">
                                  {item.title}
                                </h3>
                                {item.description && (
                                  <p className="text-xs text-fg-muted line-clamp-2 mt-0.5">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <ArrowRight className="w-4 h-4 text-fg-subtle group-hover:text-primary group-hover:translate-x-1 shrink-0 mt-1.5 transition-all" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state when searching and no results */}
                  {hasSearched && !isLoading && results.length === 0 && (
                    <div className="py-8 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-surface-raised border border-border flex items-center justify-center mx-auto text-fg-muted">
                        <Search className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-fg">
                          {isEn ? 'No results found' : 'Không tìm thấy kết quả phù hợp'}
                        </p>
                        <p className="text-xs text-fg-muted mt-0.5 max-w-sm mx-auto">
                          {isEn
                            ? 'Try different keywords or switch to DH AI for smart guidance.'
                            : 'Thử từ khóa khác hoặc bấm chuyển sang DH AI để được hỗ trợ thông minh.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setMode('ai');
                          handleAiSearch();
                        }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-primary text-primary-fg font-semibold text-xs shadow-2xs hover:bg-primary-hover transition-colors cursor-pointer"
                      >
                        <DhAiIcon size="sm" />
                        <span>{isEn ? 'Ask DH AI about this' : 'Hỏi trợ lý DH AI ngay'}</span>
                      </button>
                    </div>
                  )}

                  {/* Initial state before searching */}
                  {!hasSearched && !query && (
                    <div className="py-6 text-center space-y-2.5">
                      <p className="text-xs text-fg-muted">
                        {isEn
                          ? 'Type to search services, projects, templates, and packages.'
                          : 'Nhập từ khóa để quét toàn bộ dịch vụ, dự án, mẫu website và bảng giá.'}
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
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

            {/* Footer */}
            <div className="px-3.5 py-2 border-t border-border bg-surface-raised/40 flex items-center justify-between text-[11px] text-fg-subtle">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-fg">Devhouse</span>
                <span>•</span>
                <span>
                  {mode === 'ai'
                    ? 'DH AI Assistant'
                    : isEn
                      ? 'Universal Search'
                      : 'Tìm kiếm toàn trang'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline">Esc đóng • ↵ mở</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Dedicated, beautiful structured renderer for DH AI responses.
 * Renders structured headings, step-by-step numbers, bullet lists,
 * and bold text with zero raw asterisks or smushed content.
 */
function DhAiMessageRenderer({ content }) {
  if (!content) return null;

  // Pre-process and normalize text
  const normalized = content
    .replace(/\*{3,}/g, '**')
    .replace(/:\*\*\s*\*\s*\*\*/g, ': **')
    .replace(/(\s+)(\d+\.\s+\*\*)/g, '\n\n$2')
    .replace(/(\s+)\*\s+\*\*/g, '\n- **')
    .replace(/\*\s*\*\s*\*\*/g, '\n- **')
    .replace(/(^|\n)\*\*(\d+\.\s+[^*]+?)\*\*\s*/g, '\n\n### $2\n\n')
    .replace(/(^|\n)\*\*(Thông tin liên hệ|Contact Information|Lưu ý|Cam kết[^*]*?)\*\*\s*/gi, '\n\n### $2\n\n');

  // Split into paragraphs / blocks
  const blocks = normalized
    .split(/\n\s*\n/)
    .map(b => b.trim())
    .filter(Boolean);

  return (
    <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-fg">
      {blocks.map((block, bIdx) => {
        // Heading / Section Header
        if (block.startsWith('### ') || block.startsWith('## ') || block.startsWith('# ')) {
          const title = block.replace(/^#{1,4}\s*/, '').replace(/^\*\*|\*\*$/g, '');
          return (
            <div
              key={bIdx}
              className="flex items-center gap-2 pt-2 pb-1 border-b border-border-subtle/80 text-primary font-bold text-xs sm:text-sm tracking-tight"
            >
              <span className="w-1.5 h-3.5 rounded-full bg-primary shrink-0" />
              <span>{title}</span>
            </div>
          );
        }

        // List block (lines starting with - or * or numbers)
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        const isBulletList = lines.every(l => /^[-*•]\s+/.test(l));
        const isNumberedList = lines.every(l => /^\d+\.\s+/.test(l));

        if (isBulletList) {
          return (
            <ul key={bIdx} className="space-y-1.5 pl-1">
              {lines.map((line, lIdx) => (
                <li key={lIdx} className="flex items-start gap-2 text-xs sm:text-sm">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5 opacity-80" />
                  <span className="flex-1 leading-relaxed">
                    {renderFormattedInline(line.replace(/^[-*•]\s+/, ''))}
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        if (isNumberedList) {
          return (
            <div key={bIdx} className="space-y-2 pl-0.5">
              {lines.map((line, lIdx) => {
                const match = line.match(/^(\d+)\.\s+(.*)$/);
                const stepNum = match ? match[1] : lIdx + 1;
                const stepText = match ? match[2] : line;
                return (
                  <div
                    key={lIdx}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-raised/70 border border-border-subtle/80 text-xs sm:text-sm"
                  >
                    <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px] mt-0.5 border border-primary/20">
                      {stepNum}
                    </span>
                    <span className="flex-1 leading-relaxed text-fg">
                      {renderFormattedInline(stepText)}
                    </span>
                  </div>
                );
              })}
            </div>
          );
        }

        // Mixed block (intro line + bullets or steps)
        if (lines.length > 1 && lines.some(l => /^[-*•]\s+/.test(l) || /^\d+\.\s+/.test(l))) {
          return (
            <div key={bIdx} className="space-y-1.5">
              {lines.map((line, lIdx) => {
                if (/^[-*•]\s+/.test(line)) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2 pl-1 text-xs sm:text-sm">
                      <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5 opacity-80" />
                      <span className="flex-1 leading-relaxed">
                        {renderFormattedInline(line.replace(/^[-*•]\s+/, ''))}
                      </span>
                    </div>
                  );
                }
                if (/^\d+\.\s+/.test(line)) {
                  const match = line.match(/^(\d+)\.\s+(.*)$/);
                  const stepNum = match ? match[1] : lIdx + 1;
                  const stepText = match ? match[2] : line;
                  return (
                    <div
                      key={lIdx}
                      className="flex items-start gap-2.5 p-2 rounded-xl bg-surface-raised/70 border border-border-subtle/80 text-xs sm:text-sm my-1"
                    >
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-[11px] mt-0.5 border border-primary/20">
                        {stepNum}
                      </span>
                      <span className="flex-1 leading-relaxed text-fg">
                        {renderFormattedInline(stepText)}
                      </span>
                    </div>
                  );
                }
                return (
                  <p key={lIdx} className="text-xs sm:text-sm leading-relaxed text-fg">
                    {renderFormattedInline(line)}
                  </p>
                );
              })}
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={bIdx} className="text-xs sm:text-sm leading-relaxed text-fg">
            {renderFormattedInline(block)}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Safely parses inline markdown without raw asterisks
 */
function renderFormattedInline(str) {
  if (!str) return null;
  // Clean raw asterisks like *** or lone *
  const cleaned = str
    .replace(/\*{3,}/g, '**')
    .replace(/^\s*\*\s+/, '')
    .replace(/\s+\*\s*$/, '');

  const segments = cleaned.split(/(\*\*.*?\*\*)/g);
  return segments.map((seg, idx) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      const boldText = seg.slice(2, -2).trim();
      if (!boldText) return null;
      return (
        <strong key={idx} className="font-semibold text-fg">
          {boldText}
        </strong>
      );
    }
    // Clean any stray single * inside segment
    return seg.replace(/(^|\s)\*(\s|$)/g, '$1•$2');
  });
}

