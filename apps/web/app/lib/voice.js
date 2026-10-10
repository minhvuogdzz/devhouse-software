/**
 * Browser Web Speech API helpers for Voice Input (Speech-to-Text)
 * and Voice Output (Text-to-Speech) in Vietnamese (vi-VN) and English (en-US).
 */

export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported() {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined';
}

/**
 * Starts a single-utterance voice recognition session.
 * Returns a controller object with `{ stop() }`.
 */
export function startVoiceRecognition({ locale = 'vi', onResult, onEnd, onError }) {
  if (!isSpeechRecognitionSupported()) {
    onError?.('not-supported');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.lang = locale === 'en' ? 'en-US' : 'vi-VN';
  recognition.interimResults = true;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  let latestTranscript = '';
  let hasFinal = false;

  recognition.onresult = event => {
    let interim = '';
    let finalText = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const res = event.results[i];
      if (res.isFinal) {
        finalText += res[0].transcript;
        hasFinal = true;
      } else {
        interim += res[0].transcript;
      }
    }

    latestTranscript = (finalText || interim).trim();
    onResult?.({
      transcript: latestTranscript,
      isFinal: hasFinal,
    });
  };

  recognition.onerror = event => {
    onError?.(event.error || 'unknown');
  };

  recognition.onend = () => {
    onEnd?.(latestTranscript, hasFinal);
  };

  try {
    recognition.start();
  } catch (err) {
    onError?.(err.message || 'start-failed');
    return null;
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // ignore if already stopped
      }
    },
  };
}

/**
 * Strips Markdown symbols so Text-to-Speech reads clean, natural sentences.
 */
export function cleanTextForSpeech(markdown = '') {
  if (!markdown) return '';
  return markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^[-*•]\s+/gm, '')
    .replace(/`/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\n/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Speaks the provided text aloud using browser SpeechSynthesis.
 */
export function speakText({ text, locale = 'vi', onStart, onEnd, onError }) {
  if (!isSpeechSynthesisSupported()) {
    onError?.('not-supported');
    return;
  }

  stopSpeaking();

  const clean = cleanTextForSpeech(text);
  if (!clean) {
    onEnd?.();
    return;
  }

  const utterance = new window.SpeechSynthesisUtterance(clean);
  const langPrefix = locale === 'en' ? 'en' : 'vi';
  utterance.lang = locale === 'en' ? 'en-US' : 'vi-VN';
  utterance.rate = 1.05;

  const voices = window.speechSynthesis.getVoices?.() || [];
  const matchedVoice =
    voices.find(v => v.lang?.toLowerCase().startsWith(langPrefix) && v.localService) ||
    voices.find(v => v.lang?.toLowerCase().startsWith(langPrefix));

  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
