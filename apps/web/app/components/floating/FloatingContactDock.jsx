import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useRouteLoaderData } from 'react-router';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ChevronRight,
  Bot,
  User,
} from 'lucide-react';
import { SocialIcon } from '../ui/SocialIcons.jsx';
import { getLocaleFromUrl } from '../../lib/i18n.js';

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
          <ol key={`ol-${elements.length}`} className="my-2 space-y-1 pl-4 list-decimal text-xs">
            {currentList.map((item, i) => (
              <li key={i}>{formatInline(item)}</li>
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-2 space-y-1 pl-4 list-disc text-xs">
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
    // Splits **bold** text safely
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
        <h4 key={`h-${index}`} className="font-semibold text-xs text-primary mt-2.5 mb-1">
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
      <p key={`p-${index}`} className="my-1 text-xs leading-relaxed">
        {formatInline(trimmed)}
      </p>
    );
  });

  flushList();
  return <div className="space-y-1 text-fg">{elements}</div>;
}

export function FloatingContactDock() {
  const location = useLocation();
  const locale = getLocaleFromUrl(location.pathname);
  const isEn = locale === 'en';
  const site = useRouteLoaderData('root');
  const settings = site?.settings || {};

  // Scroll detection to detect Footer
  const [isAtFooter, setIsAtFooter] = useState(false);

  // Chat popout state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Initial greeting
  const initialGreeting = isEn
    ? 'Hello! I am DH AI, the virtual consultant at Dev House Software. How may I assist you with website development, hosting, or our process today?'
    : 'Dạ em chào anh/chị ạ! Em là DH AI — Chuyên viên tư vấn ảo của Dev House Software. Em có thể hỗ trợ thông tin gì về bảng giá thiết kế website, máy chủ hay quy trình phần mềm hôm nay ạ?';

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
      // When footer starts coming into the lower part of viewport
      const atFooter = rect.top <= window.innerHeight - 80;
      setIsAtFooter(atFooter);
    };

    window.addEventListener('scroll', checkFooter, { passive: true });
    checkFooter();
    return () => window.removeEventListener('scroll', checkFooter);
  }, []);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (isChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatOpen]);

  // Handle hover interactions
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsChatOpen(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return; // Stay open if user pinned by clicking
    hoverTimeoutRef.current = setTimeout(() => {
      setIsChatOpen(false);
    }, 400);
  };

  const togglePin = () => {
    if (!isChatOpen) {
      setIsChatOpen(true);
      setIsPinned(true);
    } else {
      setIsPinned(prev => !prev);
    }
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setIsPinned(false);
  };

  const handleSendMessage = async textToSend => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

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

  const handleResetChat = () => {
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
      className="fixed right-4 sm:right-6 bottom-4 sm:bottom-6 z-40 flex flex-col items-end pointer-events-none"
      aria-label="Floating Contact & AI Chatbot"
    >
      {/* Container holding Chatbot Button (Top) + 3 Social Buttons (Bottom) */}
      <div className="flex flex-col items-end gap-3 transition-all duration-500 ease-in-out">
        {/* ========================================================= */}
        {/* 1. CHATBOT FLOATING ICON + POPOUT CHAT DRAWER             */}
        {/* ========================================================= */}
        <div
          className="relative pointer-events-auto"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Chat popout box to the left */}
          {isChatOpen && (
            <div
              className={`absolute right-full bottom-0 mr-3 w-[calc(100vw-2.5rem)] sm:w-96 max-w-[24rem] h-[32rem] max-h-[calc(100vh-6rem)] rounded-2xl border border-border/80 bg-surface text-fg shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right z-50 animate-in fade-in zoom-in-95`}
              role="dialog"
              aria-modal="true"
              aria-label="DH AI Chat"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-border bg-surface-raised flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  {/* Avatar with subtle sRGB border */}
                  <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-primary via-accent to-primary">
                    <div className="w-8 h-8 rounded-full bg-surface flex items-center justify-center text-primary">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-surface" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-fg flex items-center gap-1.5">
                      DH AI Assistant
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary/10 text-primary font-medium">
                        Online
                      </span>
                    </h3>
                    <p className="text-[11px] text-fg-muted">
                      {isEn ? 'Consultant • Dev House Software' : 'Chuyên viên tư vấn ảo Dev House'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleResetChat}
                    title={isEn ? 'Reset chat' : 'Làm mới cuộc trò chuyện'}
                    className="p-1.5 rounded-lg text-fg-muted hover:text-fg hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={closeChat}
                    title={isEn ? 'Close' : 'Đóng'}
                    className="p-1.5 rounded-lg text-fg-muted hover:text-danger hover:bg-danger-surface transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 overscroll-contain">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-fg rounded-br-xs'
                          : 'bg-surface-raised border border-border text-fg rounded-bl-xs'
                      }`}
                    >
                      <ChatMessageContent content={msg.text} />
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-fg flex items-center justify-center shrink-0 mt-0.5 text-xs">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="rounded-2xl rounded-bl-xs bg-surface-raised border border-border px-4 py-3 flex items-center gap-1.5 shadow-2xs">
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
                <div className="px-3 py-2 border-t border-border/60 bg-surface-raised/50 shrink-0">
                  <p className="text-[10px] uppercase font-semibold tracking-wider text-fg-subtle mb-1.5">
                    {isEn ? 'Suggested questions' : 'Gợi ý câu hỏi nhanh'}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-surface hover:bg-surface-2 hover:border-primary/40 text-fg-muted hover:text-primary transition-all text-left flex items-center gap-1 cursor-pointer"
                      >
                        <span>{prompt}</span>
                        <ChevronRight className="w-2.5 h-2.5 text-fg-subtle" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 border-t border-border bg-surface shrink-0">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    placeholder={
                      isEn
                        ? 'Ask DH AI anything about Dev House...'
                        : 'Hỏi em bất kỳ điều gì về Dev House...'
                    }
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-border bg-surface-raised text-fg placeholder:text-fg-subtle focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-2 rounded-xl bg-primary text-primary-fg hover:bg-primary-hover disabled:opacity-40 disabled:hover:bg-primary transition-colors cursor-pointer shrink-0 shadow-2xs"
                    title={isEn ? 'Send' : 'Gửi'}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Chatbot Action Trigger Button */}
          <button
            onClick={togglePin}
            aria-label="Open DH AI Chatbot"
            title={isEn ? 'Chat with DH AI' : 'Trò chuyện với DH AI'}
            className="group relative flex items-center justify-center w-13 h-13 rounded-full bg-surface border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer text-fg"
          >
            {/* Subtle sRGB pulsing border aura */}
            <span
              className="absolute -inset-0.5 rounded-full opacity-70 group-hover:opacity-100 transition-opacity blur-[1px] animate-pulse pointer-events-none"
              style={{
                background:
                  'linear-gradient(135deg, oklch(52% 0.22 258), oklch(62% 0.16 215), oklch(56% 0.17 145), oklch(68% 0.17 75))',
              }}
            />

            <span className="relative w-full h-full rounded-full bg-surface flex items-center justify-center text-primary overflow-hidden">
              <Sparkles className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" />
            </span>

            {/* Online green indicator badge */}
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-success border-2 border-surface shadow-xs" />

            {/* Hover Tooltip (visible when popout is closed) */}
            {!isChatOpen && (
              <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-surface border border-border text-fg text-xs font-semibold shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden sm:block">
                DH AI Chatbot
              </span>
            )}
          </button>
        </div>

        {/* ========================================================= */}
        {/* 2. 3 FLOATING SOCIAL ICONS (Retracts downwards on Footer)   */}
        {/* ========================================================= */}
        <div
          className={`flex flex-col items-end gap-2.5 transition-all duration-500 ease-in-out ${
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

                {/* Floating Tooltip to the left */}
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
