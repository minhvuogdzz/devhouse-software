import React, { useState } from 'react';
import { Link, useLoaderData } from 'react-router';
import { apiClient } from '../lib/api-client.js';
import { generateSeoMeta } from '../lib/seo.js';
import { getLocaleFromUrl, getTranslation } from '../lib/i18n.js';
import { localePrefix } from '../lib/navigation.js';
import { resizedImage } from '../lib/images.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Stars } from '../components/ui/Stars.jsx';
import { DemoModal } from '../components/sections/DemoModal.jsx';
import { RichTextRenderer } from '../components/rich-text/RichTextRenderer.jsx';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, Play, ShieldCheck } from 'lucide-react';

export async function loader({ params, request }) {
  const locale = getLocaleFromUrl(request.url);
  try {
    const res = await apiClient(`/projects/${params.slug}?locale=${locale}`);
    return { project: res.data, url: request.url, locale };
  } catch (error) {
    // A missing project is a real 404. There is no made-up stand-in project.
    if (error.status === 404) throw new Response('Project Not Found', { status: 404 });
    throw new Response('Service unavailable', { status: 503 });
  }
}

export function meta({ data }) {
  if (!data?.project) return [{ title: 'Dev House Software' }];
  const { project } = data;
  const title = project.seo?.title || `${project.title} — Dev House Software`;
  const description = project.seo?.description || project.shortDescription || '';

  return generateSeoMeta({
    title,
    description,
    url: data.url,
    locale: data.locale,
    type: 'article',
  });
}

export default function ProjectDetailPage() {
  const { project, locale } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = localePrefix(locale);
  const [demoOpen, setDemoOpen] = useState(false);

  const isConfidential = project.client?.isConfidential;
  const clientName = project.client?.name;
  const pictures = (project.thumbnails || []).filter(image => image?.url);
  const interest = encodeURIComponent(project.title);
  const views = new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'vi-VN').format(
    project.views || 0,
  );

  return (
    <div className="py-12 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <div className="space-y-6">
          <Link
            to={`${prefix}/projects`}
            className="inline-flex items-center text-sm font-semibold text-fg-muted hover:text-fg gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            {t('common.exploreProjects')}
          </Link>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              {project.segment?.name && <Badge variant="default">{project.segment.name}</Badge>}
              {project.category?.name && <Badge variant="outline">{project.category.name}</Badge>}
              {isConfidential && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-fg-subtle" aria-hidden="true" />
                  <span>{t('common.confidentialClient')}</span>
                </Badge>
              )}
              {!isConfidential && clientName && <Badge variant="secondary">{clientName}</Badge>}
              {project.client?.industry && (
                <Badge variant="outline">{project.client.industry}</Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-fg tracking-tight">
              {project.title}
            </h1>

            {project.shortDescription && (
              <p className="text-lg text-fg-muted leading-relaxed">{project.shortDescription}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-fg-muted">
              {project.rating > 0 && (
                <Stars
                  value={project.rating}
                  emptyClass="text-border"
                  label={t('products.ratingValue').replace(
                    '{value}',
                    Number(project.rating).toFixed(1),
                  )}
                />
              )}
              {project.views > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-4 h-4" aria-hidden="true" />
                  {views} {t('products.views')}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              {project.demoUrl && (
                <Button type="button" size="lg" onClick={() => setDemoOpen(true)}>
                  <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                  {t('products.viewDemo')}
                </Button>
              )}
              <Button to={`${prefix}/contact?interest=${interest}`} size="lg" variant="outline">
                {t('projects.askAbout')}
              </Button>
            </div>
          </div>
        </div>

        {pictures.length > 0 && (
          <ul
            aria-label={t('projects.pictures')}
            className="grid grid-cols-3 gap-2 sm:gap-3 max-w-2xl"
          >
            {pictures.map((image, index) => (
              <li key={image.url}>
                <img
                  src={resizedImage(image.url, 640)}
                  alt={image.alt || (index === 0 ? project.title : '')}
                  width={image.width || 640}
                  height={image.height || 960}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="aspect-[4/6] w-full rounded-md border border-border object-cover"
                />
              </li>
            ))}
          </ul>
        )}

        {project.results?.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold font-display text-fg">{t('projects.results')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.results.map((result, i) => (
                <Card
                  key={i}
                  hover={false}
                  className="space-y-2 border-primary/20 bg-primary-subtle/30"
                >
                  <div className="text-3xl lg:text-4xl font-extrabold font-display text-primary">
                    {result.value}
                  </div>
                  <div className="text-sm font-semibold text-fg">{result.label}</div>
                  {result.description && (
                    <div className="text-xs text-fg-muted">{result.description}</div>
                  )}
                </Card>
              ))}
            </div>
          </section>
        )}

        {(project.challenge || project.solution) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {project.challenge && (
              <Card hover={false} className="space-y-4">
                <h2 className="text-xl font-bold font-display text-fg flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning" aria-hidden="true" />
                  {t('projects.challenge')}
                </h2>
                <div className="text-fg-muted leading-relaxed">
                  <RichTextRenderer content={project.challenge} />
                </div>
              </Card>
            )}
            {project.solution && (
              <Card hover={false} className="space-y-4">
                <h2 className="text-xl font-bold font-display text-fg flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success" aria-hidden="true" />
                  {t('projects.solution')}
                </h2>
                <div className="text-fg-muted leading-relaxed">
                  <RichTextRenderer content={project.solution} />
                </div>
              </Card>
            )}
          </div>
        )}

        {project.description && (
          <section className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-2xl font-bold font-display text-fg">{t('projects.overview')}</h2>
            <div className="text-fg-muted leading-relaxed">
              <RichTextRenderer content={project.description} />
            </div>
          </section>
        )}

        {project.features?.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold font-display text-fg">{t('projects.features')}</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.features.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border bg-surface"
                >
                  <CheckCircle2
                    className="w-5 h-5 text-primary shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-fg">{feature.title}</h3>
                    {feature.description && (
                      <p className="text-xs text-fg-muted leading-relaxed">{feature.description}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {(project.services?.length > 0 || project.technologies?.length > 0) && (
          <section className="space-y-6 pt-6 border-t border-border">
            {project.services?.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold font-display text-fg">{t('projects.services')}</h2>
                <div className="flex flex-wrap gap-2">
                  {project.services.map(service => (
                    <Link
                      key={service._id || service.slug}
                      to={`${prefix}/services/${service.slug}`}
                      className="rounded-full border border-border px-3 py-1 text-sm text-fg-muted hover:border-primary/50 hover:text-fg"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {project.technologies?.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-bold font-display text-fg">
                  {t('projects.technologies')}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map(tech => (
                    <Badge
                      key={tech._id || tech.slug || tech.name}
                      variant="outline"
                      className="text-sm px-3 py-1"
                    >
                      {typeof tech === 'object' ? tech.name : tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <section className="rounded-2xl bg-surface-raised border border-border p-8 sm:p-12 text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-fg">
            {t('projects.ctaTitle')}
          </h2>
          <p className="max-w-2xl mx-auto text-fg-muted text-sm sm:text-base leading-relaxed">
            {t('projects.ctaText')}
          </p>
          <div className="flex justify-center">
            <Button to={`${prefix}/contact?interest=${interest}`} variant="primary" size="lg">
              {t('projects.askAbout')}
              <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button>
          </div>
        </section>
      </div>

      {demoOpen && (
        <DemoModal
          product={{ name: project.title, category: project.category, demoUrl: project.demoUrl }}
          t={t}
          contactHref={`${prefix}/contact?interest=${interest}`}
          onClose={() => setDemoOpen(false)}
        />
      )}
    </div>
  );
}
