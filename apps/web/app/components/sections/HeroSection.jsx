import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { CtaLink } from '../ui/CtaLink.jsx';
import { getTranslation } from '../../lib/i18n.js';
import { GlobeBackground } from './GlobeBackground.jsx';
import { ScrollReveal } from '../ui/ScrollReveal.jsx';
import { WeatherHeroEffect } from './WeatherHeroEffect.jsx';
import { WeatherWidget } from './WeatherWidget.jsx';

const DESKTOP_INTRO_VIDEO = '/assets/herobanner-video.mp4';
const MOBILE_INTRO_VIDEO = '/assets/herbannervideomobile.mp4';

export function HeroSection({
  eyebrow,
  heading,
  subheading,
  primaryCta,
  secondaryCta,
  highlights = [],
  locale = 'vi',
}) {
  const [weatherCondition, setWeatherCondition] = useState('cloudy');
  const [introFinished, setIntroFinished] = useState(false);
  const [introExiting, setIntroExiting] = useState(false);
  const videoRef = useRef(null);
  const t = getTranslation(locale);

  const completeIntro = useCallback(() => {
    setIntroExiting(true);
  }, []);

  const skipIntro = useCallback(() => {
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {
        // ignore pause errors
      }
    }
    setIntroExiting(true);
    setIntroFinished(true);
  }, []);

  useEffect(() => {
    if (!introExiting) return undefined;
    const timer = setTimeout(() => {
      setIntroFinished(true);
    }, 450);
    return () => clearTimeout(timer);
  }, [introExiting]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    if (video.ended) {
      completeIntro();
      return undefined;
    }

    const handleEnded = () => completeIntro();
    const handleTimeUpdate = () => {
      if (video.duration > 0 && video.currentTime >= video.duration - 0.1) {
        completeIntro();
      }
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);

    // Fallback timer in case autoplay is blocked or video stalls (5s video + buffer)
    const fallbackTimeout = setTimeout(() => {
      completeIntro();
    }, 5800);

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        completeIntro();
      });
    }

    return () => {
      clearTimeout(fallbackTimeout);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [completeIntro]);

  return (
    <section className="relative isolate pt-24 pb-24 lg:pt-32 lg:pb-32 min-h-[85vh] flex flex-col justify-center bg-transparent overflow-hidden">
      {!introFinished && (
        <div
          className={`
            absolute inset-0 z-20 flex items-center justify-center bg-bg
            transition-opacity duration-500 ease-out
            ${introExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}
          `}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={completeIntro}
            onError={completeIntro}
            className="h-full w-full object-cover"
          >
            <source media="(min-width: 1024px)" src={DESKTOP_INTRO_VIDEO} type="video/mp4" />
            <source src={MOBILE_INTRO_VIDEO} type="video/mp4" />
          </video>

          <button
            type="button"
            onClick={skipIntro}
            className="absolute bottom-5 right-5 z-30 rounded-full border border-border/70 bg-surface/80 px-3.5 py-1.5 text-xs font-semibold text-fg backdrop-blur-md transition-colors hover:bg-surface cursor-pointer"
          >
            {locale === 'en' ? 'Skip intro' : 'Bỏ qua intro'}
          </button>
        </div>
      )}

      <GlobeBackground className="-z-20 inset-0 h-full w-full opacity-70" />
      <WeatherHeroEffect condition={weatherCondition} className="-z-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-15 bg-gradient-to-b from-bg/20 via-transparent to-bg/20"
      />
      <div
        className={`
          max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
          transition-all duration-700 ease-out
          ${introExiting || introFinished ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}
        `}
      >
        <ScrollReveal direction="up" className="max-w-3xl mx-auto text-center space-y-5">
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary-subtle text-primary border border-border-subtle tracking-wide">
                <span>{eyebrow}</span>
              </div>
            )}
            <WeatherWidget
              locale={locale}
              currentCondition={weatherCondition}
              onConditionChange={setWeatherCondition}
            />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-fg tracking-tight leading-[1.15]">
            {heading}
          </h1>

          {subheading && (
            <p className="text-base sm:text-lg text-fg-muted leading-relaxed max-w-2xl mx-auto font-normal">
              {subheading}
            </p>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <CtaLink
              link={primaryCta}
              locale={locale}
              fallbackUrl="/contact"
              size="md"
              variant="primary"
              className="w-full sm:w-auto"
            >
              {primaryCta?.label || t('common.contactUs')}
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </CtaLink>
            <CtaLink
              link={secondaryCta}
              locale={locale}
              fallbackUrl="/services"
              size="md"
              variant="outline"
              className="w-full sm:w-auto"
            />
          </div>

          {/* Value highlights */}
          {highlights.length > 0 && (
            <ul className="pt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-fg-muted">
              {highlights.map((item, idx) => (
                <li key={idx} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
}

