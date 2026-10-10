import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useRouteLoaderData } from 'react-router';
import {
  X,
  Send,
  RotateCcw,
  ChevronRight,
  Bot,
  User,
  MessageSquare,
  Loader2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Logo } from '../ui/Logo.jsx';
import { SocialIcon } from '../ui/SocialIcons.jsx';
import { getLocaleFromUrl } from '../../lib/i18n.js';
import {
  startVoiceRecognition,
  speakText,
  stopSpeaking,
} from '../../lib/voice.js';

const DEFAULT_FLOATING_CONTACTS = [
  { type: 'zalo', label: 'Zalo tư vấn', value: 'https://zalo.me/0869528304', enabled: true },
  { type: 'phone', label: 'Hotline 0869 528 304', value: '0869528304', enabled: true },
  { type: 'messenger', label: 'Messenger', value: 'https://m.me/devhousesoftware', enabled: true },
];

/**
 * Renders formatted AI text without dangerouslySetInnerHTML
 */
function ChatMessageContent({ content }) {
  if (!content) return null;
  const lines = content.split('\n');

  const elements = [];
  let currentList = [];
  let listType = null; // 'ul' | 'ol'

  const flushList = () => {
    if (currentList.length > 0) {
      if (listType === 'ol') {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-1.5 space-y-1 pl-4 list-decimal text-sm sm:text-xs">
            {currentList.map((item, i) => (
              <li key={i}>{formatInline(item)}</li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-1.5 space-y-1 pl-4 list-disc text-sm sm:text-xs">
            {currentList.map((item, i) => (
              <li key={i}>{formatInline(item)}</li>
            ))}
          </ul>
        );
      }
      currentList = [];
      listType = null;
    }
  };

  const formatInline = text => {
    const parts = text.split(/(\*\*[^*]+?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-fg">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }

    // Heading
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={`h-${index}`} className="font-semibold text-sm sm:text-xs text-primary mt-2 mb-0.5">
          {formatInline(trimmed.replace(/^###\s+/, ''))}
        </h4>
      );
      return;
    }

    // Bullet list
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      currentList.push(trimmed.replace(/^[-*]\s+/, ''));
      return;
    }

    // Numbered list
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      currentList.push(numMatch[2]);
      return;
    }

    flushList();
    elements.push(
      <p key={`p-${index}`} className="my-0.5 text-sm sm:text-xs leading-relaxed">
        {formatInline(trimmed)}
      </p>
    );
  });

  flushList();
  return <div className="space-y-0.5 text-fg">{elements}</div>;
}

export function FloatingContactDock() {
  const location = useLocation();
  const locale = getLocaleFromUrl(location.pathname);
  const isEn = locale === 'en';
  const site = useRouteLoaderData('root');
  const settings = site?.settings || {};

  // Scroll detection for Footer
  const [isAtFooter, setIsAtFooter] = useState(false);

  // Chat popout state: strictly click-based, no hover auto-open, no delay on close
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState(null);
  const [voiceError, setVoiceError] = useState('');

  const messagesEndRef = useRef(null);
  const chatDrawerRef = useRef(null);
  const triggerButtonRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initial greeting
  const initialGreeting = isEn
    ? 'Hello! I am DH AI, the virtual consultant at Devhouse Software. How may I assist you with website development, hosting, or our process today?'
    : 'Dạ em chào anh/chị ạ! Em là DH AI — Chuyên viên tư vấn ảo của Devhouse Software. Em có thể hỗ trợ thông tin gì về bảng giá thiết kế website, máy chủ hay quy trình phần mềm hôm nay ạ?';

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: initialGreeting,
    },
  ]);

  // Suggested quick prompts
  const quickPrompts = isEn
    ? [
        'Web design packages & pricing',
        '6-step working process',
        'Cloud hosting & security',
        'Direct consultation hotline',
      ]
    : [
        'Bảng giá thiết kế website',
        'Quy trình làm việc 6 bước',
        'Máy chủ đám mây & bảo mật',
        'Hotline tư vấn trực tiếp',
      ];

  // Resolve floating contacts from settings
  const rawContacts = Array.isArray(settings.floatingContacts) && settings.floatingContacts.length > 0
    ? settings.floatingContacts
    : DEFAULT_FLOATING_CONTACTS;

  const floatingContacts = rawContacts
    .filter(c => c && c.enabled !== false && (c.value || c.url))
    .slice(0, 3);

  // Detect footer visibility on scroll
  useEffect(() => {
    const checkFooter = () => {
      const footer = document.getElementById('site-footer');
      if (!footer) return;
      const rect = footer.getBoundingClientRect();
      const atFooter = rect.top <= window.innerHeight - 80;
      setIsAtFooter(atFooter);
    };

    window.addEventListener('scroll', checkFooter, { passive: true });
    checkFooter();
    return () => window.removeEventListener('scroll', checkFooter);
  }, []);

  // Lock background page scroll on mobile when chat is open & stop voice on close
  useEffect(() => {
    if (!isChatOpen) {
      recognitionRef.current?.stop();
      setIsListening(false);
      stopSpeaking();
      setSpeakingMsgIdx(null);
      return;
    }
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isChatOpen]);

  // Click outside to close instantly on desktop with zero delay
  useEffect(() => {
    const handleDocumentClick = e => {
      if (
        isChatOpen &&
        chatDrawerRef.current &&
        !chatDrawerRef.current.contains(e.target) &&
        triggerButtonRef.current &&
        !triggerButtonRef.current.contains(e.target)
      ) {
        setIsChatOpen(false);
      }
    };

    const handleKeyDown = e => {
      if (e.key === 'Escape' && isChatOpen) {
        setIsChatOpen(false);
      }
    };

    if (isChatOpen) {
      document.addEventListener('mousedown', handleDocumentClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isChatOpen]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  const toggleChat = () => {
    setIsChatOpen(prev => !prev);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const handleSendMessage = async textToSend => {
    const query = (textToSend !== undefined ? textToSend : inputMessage).trim();
    if (!query || isLoading) return;

    recognitionRef.current?.stop();
    setIsListening(false);

    const userMsg = { role: 'user', text: query };
    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/v1/search/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: updatedHistory.slice(-8),
          locale,
        }),
      });

      const resData = await response.json();
      const answer = resData?.data?.answer || resData?.answer || (
        isEn
          ? 'Thank you for reaching out! Please contact hotline 0869 528 304 for dedicated advice.'
          : 'Dạ cảm ơn anh/chị! Anh/chị có thể gọi hotline 0869 528 304 để được tư vấn viên hỗ trợ chi tiết ngay ạ.'
      );

      setMessages(prev => [...prev, { role: 'assistant', text: answer }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: isEn
            ? 'I am currently synchronizing. Please call our hotline 0869 528 304 for instant assistance!'
            : 'Dạ em xin lỗi, hệ thống của em đang cập nhật. Anh/chị vui lòng gọi hotline 0869 528 304 để được hỗ trợ tức thì nhé ạ!',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVoiceInput = () => {
    setVoiceError('');
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    stopSpeaking();
    setSpeakingMsgIdx(null);

    const controller = startVoiceRecognition({
      locale,
      onResult: ({ transcript }) => {
        setInputMessage(transcript);
      },
      onEnd: (finalTranscript, hasFinal) => {
        setIsListening(false);
        if (hasFinal && finalTranscript && finalTranscript.trim().length > 1) {
          handleSendMessage(finalTranscript.trim());
        }
      },
      onError: errCode => {
        setIsListening(false);
        if (errCode === 'not-supported') {
          setVoiceError(
            isEn
              ? 'Voice input is not supported on this browser.'
              : 'Trình duyệt này chưa hỗ trợ nhận diện giọng nói.',
          );
        } else if (errCode === 'not-allowed') {
          setVoiceError(
            isEn
              ? 'Please allow microphone access to use voice chat.'
              : 'Vui lòng cấp quyền Micro để trò chuyện bằng giọng nói.',
          );
        }
      },
    });

    if (controller) {
      recognitionRef.current = controller;
      setIsListening(true);
    }
  };

  const handleToggleSpeakMessage = (idx, text) => {
    if (speakingMsgIdx === idx) {
      stopSpeaking();
      setSpeakingMsgIdx(null);
      return;
    }

    speakText({
      text,
      locale,
      onStart: () => setSpeakingMsgIdx(idx),
      onEnd: () => setSpeakingMsgIdx(null),
      onError: () => setSpeakingMsgIdx(null),
    });
  };

  const handleResetChat = () => {
    stopSpeaking();
    setSpeakingMsgIdx(null);
    setMessages([{ role: 'assistant', text: initialGreeting }]);
  };

  const getContactHref = contact => {
    const val = contact.value || contact.url || '';
    if (contact.type === 'phone') {
      const cleanPhone = val.replace(/[^+\d]/g, '');
      return `tel:${cleanPhone}`;
    }
    if (contact.type === 'email') {
      return `mailto:${val}`;
    }
    return val;
  };

  return (
    <div
      className={`fixed right-4 sm:right-6 bottom-4 sm:bottom-6 ${
        isChatOpen ? 'z-[70]' : 'z-40'
      } flex flex-col items-end pointer-events-none`}
      aria-label="Floating Contact & AI Chatbot"
    >
      {/* Mobile Backdrop: tap outside the chat box anywhere to close */}
      {isChatOpen && (
        <div
          onClick={closeChat}
          aria-hidden="true"
          className="fixed inset-0 z-[70] bg-scrim/50 backdrop-blur-[2px] pointer-events-auto sm:hidden animate-in fade-in duration-200"
        />
      )}

      <div className="flex flex-col items-end gap-3 transition-all duration-500 ease-in-out">
        {/* ========================================================= */}
        {/* 1. CHATBOT FLOATING ICON + RESPONSIVE CHAT DRAWER         */}
        {/* ========================================================= */}
        <div className="relative pointer-events-auto">
          {/* Chat drawer: padded floating modal on mobile (above header), sleek side popout on desktop */}
          {isChatOpen && (
            <div
              ref={chatDrawerRef}
              className="fixed inset-x-3.5 top-4 bottom-4 z-[80] max-h-[calc(100dvh-2rem)] rounded-2xl border border-border bg-surface text-fg shadow-2xl flex flex-col overflow-hidden pointer-events-auto sm:absolute sm:inset-auto sm:right-full sm:bottom-0 sm:mr-3 sm:w-[370px] sm:max-w-[370px] sm:h-[500px] sm:max-h-[calc(100vh-6rem)] sm:z-50 transition-all duration-200 ease-out sm:origin-bottom-right animate-in fade-in zoom-in-95"
              role="dialog"
              aria-modal="true"
              aria-label="DH AI Chat"
            >
              {/* Header */}
              <div className="px-4 py-3 sm:px-3.5 sm:py-2.5 border-b border-border bg-surface-raised flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-2">
                  {/* Devhouse AI Mini Avatar */}
                  <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-primary via-accent to-primary">
                    <div className="w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-surface flex items-center justify-center overflow-hidden">
                      <Logo variant="mark" className="w-5.5 h-5.5 sm:w-5 sm:h-5 object-contain" alt="DH AI" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full bg-success border-2 border-surface" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-xs font-bold text-fg flex items-center gap-1.5 leading-none">
                      DH AI Assistant
                      <span className="text-[10px] sm:text-[9px] px-1.5 py-0.5 sm:py-0.2 rounded-full bg-primary/10 text-primary font-medium">
                        Online
                      </span>
                    </h3>
                    <p className="text-xs sm:text-[10.5px] text-fg-muted mt-1 sm:mt-0.5 leading-none">
                      {isEn ? 'Consultant • Devhouse Software' : 'Tư vấn viên ảo Devhouse'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-1">
                  <button
                    type="button"
                    onClick={handleResetChat}
                    title={isEn ? 'Reset chat' : 'Làm mới cuộc trò chuyện'}
                    aria-label={isEn ? 'Reset chat' : 'Làm mới cuộc trò chuyện'}
                    className="p-2 sm:p-1.5 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={closeChat}
                    title={isEn ? 'Close' : 'Đóng khung chat'}
                    aria-label={isEn ? 'Close' : 'Đóng khung chat'}
                    className="px-2.5 py-1.5 sm:p-1.5 rounded-lg bg-surface-2 sm:bg-transparent border border-border sm:border-transparent text-fg sm:text-fg-muted hover:text-danger hover:bg-danger-surface hover:border-danger/30 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  >
                    <span className="sm:hidden">{isEn ? 'Close' : 'Đóng'}</span>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-3.5 space-y-3.5 sm:space-y-3 overscroll-contain">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                      </div>
                    )}
                    <div className="max-w-[85%] flex flex-col items-start gap-1">
                      <div
                        className={`rounded-2xl px-3.5 py-2.5 sm:px-3 sm:py-2 shadow-2xs ${
                          msg.role === 'user'
                            ? 'bg-primary text-on-scrim rounded-br-xs'
                            : 'bg-surface-raised border border-border text-fg rounded-bl-xs'
                        }`}
                      >
                        {msg.role === 'user' ? (
                          <p className="text-sm sm:text-xs leading-relaxed text-on-scrim">{msg.text}</p>
                        ) : (
                          <ChatMessageContent content={msg.text} />
                        )}
                      </div>

                      {/* Voice Read Aloud (TTS) button for Assistant responses */}
                      {msg.role === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => handleToggleSpeakMessage(i, msg.text)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium transition-colors cursor-pointer ${
                            speakingMsgIdx === i
                              ? 'bg-primary/15 text-primary border border-primary/30'
                              : 'text-fg-subtle hover:text-primary hover:bg-surface-2'
                          }`}
                          title={
                            speakingMsgIdx === i
                              ? isEn
                                ? 'Stop reading'
                                : 'Dừng đọc'
                              : isEn
                                ? 'Listen to response'
                                : 'Nghe phản hồi'
                          }
                        >
                          {speakingMsgIdx === i ? (
                            <>
                              <VolumeX className="w-3 h-3 animate-pulse" />
                              <span>{isEn ? 'Stop' : 'Dừng đọc'}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3" />
                              <span>{isEn ? 'Listen' : 'Nghe'}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-primary text-on-scrim flex items-center justify-center shrink-0 mt-0.5 text-xs">
                        <User className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                    </div>
                    <div className="rounded-2xl rounded-bl-xs bg-surface-raised border border-border px-3.5 py-2.5 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              {messages.length <= 2 && (
                <div className="px-4 py-2.5 sm:px-3 sm:py-2 border-t border-border/60 bg-surface-raised/50 shrink-0">
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-fg-subtle mb-1.5">
                    {isEn ? 'Suggested questions' : 'Gợi ý câu hỏi nhanh'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="text-xs sm:text-[11px] px-2.5 py-1 sm:px-2 sm:py-0.8 rounded-full border border-border bg-surface hover:bg-surface-2 hover:border-primary/40 text-fg-muted hover:text-primary transition-all text-left flex items-center gap-1 cursor-pointer"
                      >
                        <span>{prompt}</span>
                        <ChevronRight className="w-3 h-3 sm:w-2.5 sm:h-2.5 text-fg-subtle" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice status / error notice */}
              {(isListening || voiceError) && (
                <div
                  className={`px-3.5 py-1.5 text-xs flex items-center justify-between border-t border-border-subtle ${
                    isListening ? 'bg-primary/10 text-primary font-medium' : 'bg-danger-surface text-danger'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {isListening && <span className="w-2 h-2 rounded-full bg-danger animate-ping" />}
                    {isListening
                      ? isEn
                        ? 'Listening... Speak now'
                        : 'Đang nghe anh/chị nói...'
                      : voiceError}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isListening) {
                        recognitionRef.current?.stop();
                        setIsListening(false);
                      }
                      setVoiceError('');
                    }}
                    className="text-[11px] underline cursor-pointer"
                  >
                    {isEn ? 'Dismiss' : 'Đóng'}
                  </button>
                </div>
              )}

              {/* Input Area — 16px (text-base) on mobile prevents browser auto-zoom on focus */}
              <div className="p-3 sm:p-2.5 border-t border-border bg-surface shrink-0">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-1.5 sm:gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    placeholder={
                      isListening
                        ? isEn
                          ? 'Listening to your voice...'
                          : 'Đang nghe giọng nói...'
                        : isEn
                          ? 'Ask DH AI anything...'
                          : 'Hỏi em bất kỳ điều gì về Devhouse...'
                    }
                    className="flex-1 min-w-0 h-10 sm:h-9 px-3.5 text-base sm:text-xs rounded-xl border border-border bg-surface-raised text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-1.5 focus:ring-primary focus:border-primary transition-colors"
                  />

                  {/* Voice Microphone Button */}
                  <button
                    type="button"
                    onClick={handleToggleVoiceInput}
                    className={`w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer ${
                      isListening
                        ? 'bg-danger text-on-scrim shadow-md animate-pulse'
                        : 'bg-surface-raised text-fg-muted hover:text-primary hover:border-primary/40 border border-border'
                    }`}
                    title={
                      isListening
                        ? isEn
                          ? 'Stop voice input'
                          : 'Dừng thu âm'
                        : isEn
                          ? 'Voice chat'
                          : 'Nhập bằng giọng nói'
                    }
                    aria-label={isEn ? 'Voice input' : 'Nhập bằng giọng nói'}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className={`w-10 h-10 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${
                      inputMessage.trim() && !isLoading
                        ? 'bg-primary text-on-scrim hover:bg-primary-hover shadow-md shadow-primary/25 active:scale-95 cursor-pointer'
                        : 'bg-primary/15 text-primary/70 border border-primary/25 cursor-not-allowed'
                    }`}
                    title={isEn ? 'Send' : 'Gửi'}
                    aria-label={isEn ? 'Send' : 'Gửi'}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 -translate-y-[0.5px] translate-x-[0.5px]" />
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Chatbot Action Trigger Button */}
          {/* Custom Devhouse Icon wearing a chat balloon hat on roof */}
          <button
            ref={triggerButtonRef}
            onClick={toggleChat}
            aria-label="Open DH AI Chatbot"
            title={isEn ? 'Chat with DH AI' : 'Trò chuyện cùng DH AI'}
            className={`group relative flex items-center justify-center w-11 h-11 rounded-full bg-surface border border-border shadow-md hover:shadow-lg transition-all duration-300 hover:scale-108 active:scale-95 cursor-pointer text-fg ${
              isChatOpen ? 'max-sm:hidden' : ''
            }`}
          >
            {/* Subtle sRGB pulsing border aura */}
            <span
              className="absolute -inset-0.5 rounded-full opacity-70 group-hover:opacity-100 transition-opacity blur-[1px] animate-pulse pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, oklch(52% 0.22 258), oklch(62% 0.16 215), oklch(56% 0.17 145), oklch(68% 0.17 75))',
              }}
            />

            {/* Inner Content */}
            <span className="relative w-full h-full rounded-full bg-surface flex flex-col items-center justify-center overflow-visible">
              {/* Cute chat bubble hat perched on the roof */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none transition-transform duration-300 group-hover:-translate-y-0.5">
                <div className="relative px-1 py-0.2 rounded-full bg-gradient-to-r from-primary to-accent text-primary-fg shadow-xs flex items-center gap-0.5 border border-surface">
                  <MessageSquare className="w-2 h-2 fill-current" />
                  <span className="text-[6.5px] font-black tracking-tighter leading-none">AI</span>
                  {/* Tail pointing down into the house roof */}
                  <div className="absolute -bottom-0.8 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[2px] border-x-transparent border-t-[2.5px] border-t-primary" />
                </div>
              </div>

              {/* Devhouse Brand Mark */}
              <div className="w-5.5 h-5.5 flex items-center justify-center mt-1">
                <Logo variant="mark" className="w-5 h-5 object-contain" alt="Devhouse" />
              </div>
            </span>

            {/* Online green indicator badge */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-surface shadow-xs" />

            {/* Hover Tooltip (ONLY visible on hover, when popout is closed) */}
            {!isChatOpen && (
              <span className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-surface border border-border text-fg text-xs font-medium shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
                {isEn ? 'Chat with DH AI' : 'Trò chuyện cùng DH AI'}
              </span>
            )}
          </button>
        </div>

        {/* ========================================================= */}
        {/* 2. 3 FLOATING SOCIAL ICONS (Retracts downwards on Footer)   */}
        {/* ========================================================= */}
        <div
          className={`flex flex-col items-end gap-2.5 transition-all duration-500 ease-in-out ${
            isChatOpen ? 'max-sm:hidden ' : ''
          }${
            isAtFooter
              ? 'opacity-0 translate-y-10 max-h-0 pointer-events-none overflow-hidden scale-90 mb-0'
              : 'opacity-100 translate-y-0 max-h-60 pointer-events-auto scale-100'
          }`}
        >
          {floatingContacts.map((contact, index) => {
            const href = getContactHref(contact);
            const isExternal = !href.startsWith('tel:') && !href.startsWith('mailto:');

            return (
              <a
                key={index}
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                aria-label={contact.label || contact.type}
                className="group relative flex items-center justify-center w-11 h-11 rounded-full bg-surface border border-border shadow-md hover:shadow-lg text-fg-muted hover:text-primary transition-all duration-200 hover:scale-108 active:scale-95 hover:border-primary/50"
              >
                <SocialIcon
                  platform={contact.type}
                  className="w-5 h-5 transition-transform group-hover:scale-110"
                />

                {/* Floating Tooltip to the left on hover */}
                <span className="absolute right-full mr-3 px-2.5 py-1 rounded-lg bg-surface border border-border text-fg text-xs font-medium shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
                  {contact.label || contact.type}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FloatingContactDock;
