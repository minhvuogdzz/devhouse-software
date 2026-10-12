import React from 'react';
import { useLoaderData, Link } from 'react-router';
import { defaultCatalog, localize, resolveDefaultServices } from '@devhouse/content';
import { loadPage, loadList, isShown } from '../lib/page-data.js';
import { generateSeoMeta } from '../lib/seo.js';
import { getTranslation } from '../lib/i18n.js';
import { localePrefix, withLocale } from '../lib/navigation.js';
import { Button } from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Collection } from '../components/ui/Collection.jsx';
import { SectionHeading } from '../components/ui/SectionHeading.jsx';
import { HeroSection } from '../components/sections/HeroSection.jsx';
import { ValueGrid } from '../components/sections/ValueGrid.jsx';
import { ServiceCard } from '../components/sections/ServiceCard.jsx';
import { ProductShowcase } from '../components/sections/ProductShowcase.jsx';
import { PackageCard } from '../components/sections/PackageCard.jsx';
import { ProcessSection } from '../components/sections/ProcessSection.jsx';
import { CtaSection } from '../components/sections/CtaSection.jsx';
import { iconFor } from '../lib/icons.js';
import { ArrowRight, Cpu, ExternalLink, Clock, Calendar, User } from 'lucide-react';

async function loadHomeServices(locale) {
  const fallback = resolveDefaultServices(locale).filter(service => !service.parent);
  const featured = await loadList(
    `/services?limit=8&parent=none&featured=true&locale=${locale}`,
    [],
  );
  if (featured.length > 0) return featured;
  return loadList(`/services?limit=8&parent=none&locale=${locale}`, fallback);
}

async function loadHomeProducts(locale) {
  const featured = await loadList(`/products?limit=10&featured=true&locale=${locale}`, []);
  if (featured.length > 0) return featured;
  return loadList(`/products?limit=10&locale=${locale}`, []);
}

async function loadHomeProjects(locale) {
  const featured = await loadList(`/projects?limit=10&featured=true&locale=${locale}`, []);
  const list =
    featured.length > 0 ? featured : await loadList(`/projects?limit=10&locale=${locale}`, []);
  return list.map(project => ({ ...project, name: project.title || project.name }));
}

async function loadHomeSolutions(locale) {
  const fallback = defaultCatalog.solutions
    ? defaultCatalog.solutions.map(item => localize(item, locale))
    : [];
  const featured = await loadList(`/solutions?limit=6&featured=true&locale=${locale}`, []);
  if (featured.length > 0) return featured;
  return loadList(`/solutions?limit=6&locale=${locale}`, fallback);
}

async function loadHomeTechnologies(locale) {
  const fallback = defaultCatalog.technologies
    ? defaultCatalog.technologies.map(item => localize(item, locale))
    : [];
  const featured = await loadList(`/technologies?limit=8&featured=true&locale=${locale}`, []);
  if (featured.length > 0) return featured;
  return loadList(`/technologies?limit=8&locale=${locale}`, fallback);
}

async function loadHomePosts(locale) {
  const featured = await loadList(`/blog/posts?limit=6&featured=true&locale=${locale}`, []);
  if (featured.length > 0) return featured;
  return loadList(`/blog/posts?limit=6&locale=${locale}`, []);
}

export async function loader({ request }) {
  const page = await loadPage('home', request);
  const { locale } = page;

  // Code defaults are used only when the API cannot be reached.
  const [services, products, projects, packages, solutions, technologies, posts] =
    await Promise.all([
      loadHomeServices(locale),
      loadHomeProducts(locale),
      loadHomeProjects(locale),
      loadList(
        `/packages?limit=6&locale=${locale}`,
        defaultCatalog.packages.map(item => localize(item, locale)),
      ),
      loadHomeSolutions(locale),
      loadHomeTechnologies(locale),
      loadHomePosts(locale),
    ]);

  return {
    ...page,
    services,
    products,
    projects,
    packages,
    solutions,
    technologies,
    posts,
  };
}

export function meta({ data }) {
  const origin = data?.url ? new URL(data.url).origin : 'https://devhouse.vn';
  const logoUrl = `${origin}/brand/devhouse-logo.png?v=20261011`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Devhouse Software',
    alternateName: 'Devhouse',
    url: origin,
    logo: {
      '@type': 'ImageObject',
      url: logoUrl,
      contentUrl: logoUrl,
      width: 512,
      height: 512,
    },
    image: logoUrl,
  };
  return generateSeoMeta({
    title: data?.seo?.title || 'Devhouse Software',
    description: data?.seo?.description || '',
    url: data?.url,
    locale: data?.locale,
    jsonLd,
  });
}

function SeeAll({ to, children }) {
  return (
    <Button to={to} variant="outline" size="sm" className="shrink-0">
      {children}
      <ArrowRight className="w-4 h-4 ml-2" aria-hidden="true" />
    </Button>
  );
}

export default function HomePage() {
  const {
    sections,
    services,
    products,
    projects = [],
    packages,
    solutions = [],
    technologies = [],
    posts = [],
    locale,
  } = useLoaderData();
  const t = getTranslation(locale);
  const prefix = localePrefix(locale);
  const {
    hero,
    values,
    servicesIntro,
    productsIntro,
    projectsIntro,
    audiences,
    packagesIntro,
    solutionsIntro,
    technologiesIntro,
    process,
    aboutIntro,
    blogIntro,
    careersIntro,
    customPathsIntro,
    cta,
  } = sections;

  const formatDate = isoString => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div>
      {isShown(hero) && (
        <HeroSection
          eyebrow={hero.eyebrow}
          heading={hero.heading}
          subheading={hero.subheading}
          primaryCta={hero.primaryCta}
          secondaryCta={hero.secondaryCta}
          highlights={hero.highlights}
          locale={locale}
        />
      )}

      {isShown(values) && values.items?.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              heading={values.heading}
              subheading={values.subheading}
              align="center"
            />
            <ValueGrid items={values.items} display={values.display} label={values.heading} />
          </div>
        </section>
      )}

      {isShown(servicesIntro) && services.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('header.nav.services')}
              heading={servicesIntro.heading}
              subheading={servicesIntro.subheading}
              action={<SeeAll to={`${prefix}/services`}>{t('common.exploreServices')}</SeeAll>}
            />
            <Collection
              items={services}
              display={servicesIntro.display}
              label={servicesIntro.heading}
              seeAllHref={`${prefix}/services`}
              getKey={service => service._id || service.slug}
              renderItem={(service, _index, { layout }) => (
                <ServiceCard service={service} prefix={prefix} t={t} layout={layout} />
              )}
            />
          </div>
        </section>
      )}

      {isShown(productsIntro) && products.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('header.nav.products')}
              heading={productsIntro.heading}
              subheading={productsIntro.subheading}
              action={<SeeAll to={`${prefix}/products`}>{t('common.exploreProducts')}</SeeAll>}
            />
            <ProductShowcase
              products={products}
              locale={locale}
              prefix={prefix}
              t={t}
              display={productsIntro.display}
              seeAllHref={`${prefix}/products`}
            />
          </div>
        </section>
      )}

      {isShown(projectsIntro) && projects.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('header.nav.projects')}
              heading={projectsIntro.heading}
              subheading={projectsIntro.subheading}
              action={<SeeAll to={`${prefix}/projects`}>{t('common.exploreProjects')}</SeeAll>}
            />
            <ProductShowcase
              products={projects}
              locale={locale}
              prefix={prefix}
              t={t}
              display={projectsIntro.display}
              textKey="projects"
              detailPath={project => `${prefix}/projects/${project.slug}`}
              detailLabel={t('projects.viewProject')}
              seeAllHref={`${prefix}/projects`}
            />
          </div>
        </section>
      )}

      {isShown(audiences) && audiences.items?.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              heading={audiences.heading}
              subheading={audiences.subheading}
              align="center"
            />
            <ValueGrid
              items={audiences.items}
              display={audiences.display}
              label={audiences.heading}
            />
          </div>
        </section>
      )}

      {isShown(packagesIntro) && packages.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('header.nav.packages')}
              heading={packagesIntro.heading}
              subheading={packagesIntro.subheading}
              action={<SeeAll to={`${prefix}/packages`}>{t('common.explorePackages')}</SeeAll>}
            />
            <div className="pt-3">
              <Collection
                items={packages}
                display={packagesIntro.display}
                label={packagesIntro.heading}
                seeAllHref={`${prefix}/packages`}
                gap="lg"
                getKey={pack => pack._id || pack.slug}
                renderItem={pack => (
                  <PackageCard pack={pack} locale={locale} prefix={prefix} t={t} />
                )}
              />
            </div>
          </div>
        </section>
      )}

      {isShown(solutionsIntro) && solutions.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('header.nav.solutions')}
              heading={solutionsIntro.heading}
              subheading={solutionsIntro.subheading}
              action={<SeeAll to={`${prefix}/solutions`}>{t('common.exploreSolutions')}</SeeAll>}
            />
            <Collection
              items={solutions}
              display={solutionsIntro.display}
              label={solutionsIntro.heading}
              seeAllHref={`${prefix}/solutions`}
              getKey={sol => sol._id || sol.slug}
              renderItem={sol => (
                <Card className="p-6 flex h-full flex-col justify-between">
                  <div className="space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold font-display text-fg mb-2">
                        {sol.name || sol.title}
                      </h3>
                      <p className="text-sm text-fg-muted leading-relaxed">
                        {sol.shortDescription || sol.summary || sol.description}
                      </p>
                    </div>
                  </div>
                  <div className="pt-5 mt-5 border-t border-border-subtle">
                    <Link
                      to={`${prefix}/solutions/${sol.slug}`}
                      className="inline-flex items-center text-sm font-semibold text-accent hover:opacity-80 gap-1.5"
                    >
                      {t('common.viewDetails')}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </Card>
              )}
            />
          </div>
        </section>
      )}

      {isShown(technologiesIntro) && technologies.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('header.nav.technologies')}
              heading={technologiesIntro.heading}
              subheading={technologiesIntro.subheading}
              action={
                <SeeAll to={`${prefix}/technologies`}>{t('common.exploreTechnologies')}</SeeAll>
              }
            />
            <Collection
              items={technologies}
              display={technologiesIntro.display}
              label={technologiesIntro.heading}
              seeAllHref={`${prefix}/technologies`}
              getKey={tech => tech._id || tech.slug}
              renderItem={tech => (
                <Card className="flex h-full flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-primary-subtle text-primary flex items-center justify-center">
                        <Cpu className="w-5 h-5" />
                      </div>
                      {tech.websiteUrl && (
                        <a
                          href={tech.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-fg-subtle hover:text-primary transition-colors p-1"
                          aria-label={`Official documentation for ${tech.name}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <h3 className="text-lg font-bold font-display text-fg">{tech.name}</h3>
                    <p className="text-sm text-fg-muted leading-relaxed">{tech.description}</p>
                  </div>
                </Card>
              )}
            />
          </div>
        </section>
      )}

      {isShown(process) && (
        <ProcessSection
          heading={process.heading}
          subheading={process.subheading}
          steps={process.steps}
          display={process.display}
        />
      )}

      {isShown(aboutIntro) && aboutIntro.items?.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('header.nav.about')}
              heading={aboutIntro.heading}
              subheading={aboutIntro.subheading}
              action={<SeeAll to={`${prefix}/about`}>{t('common.exploreAbout')}</SeeAll>}
            />
            <ValueGrid
              items={aboutIntro.items}
              display={aboutIntro.display}
              label={aboutIntro.heading}
            />
          </div>
        </section>
      )}

      {isShown(blogIntro) && posts.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('header.nav.blog')}
              heading={blogIntro.heading}
              subheading={blogIntro.subheading}
              action={<SeeAll to={`${prefix}/blog`}>{t('common.exploreBlog')}</SeeAll>}
            />
            <Collection
              items={posts}
              display={blogIntro.display}
              label={blogIntro.heading}
              seeAllHref={`${prefix}/blog`}
              gap="lg"
              getKey={post => post._id || post.slug}
              renderItem={post => (
                <Card className="flex h-full flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs text-fg-subtle">
                      <div className="flex flex-wrap gap-1">
                        {post.tags?.slice(0, 2).map((tg, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tg.name}
                          </Badge>
                        ))}
                      </div>
                      {post.readingTimeMinutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {post.readingTimeMinutes} {t('common.readTime')}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold font-display text-fg leading-snug">
                      <Link
                        to={`${prefix}/blog/${post.slug}`}
                        className="hover:text-primary transition-colors line-clamp-2"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-fg-muted leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                  <div className="pt-5 mt-4 border-t border-border-subtle flex items-center justify-between text-xs text-fg-muted">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary-subtle text-primary flex items-center justify-center">
                        <User className="w-3 h-3" />
                      </div>
                      <span>{post.author?.name || 'Devhouse'}</span>
                    </div>
                    {post.publishedAt && (
                      <span className="flex items-center gap-1 text-fg-subtle">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.publishedAt)}
                      </span>
                    )}
                  </div>
                </Card>
              )}
            />
          </div>
        </section>
      )}

      {isShown(careersIntro) && careersIntro.items?.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t('header.nav.careers')}
              heading={careersIntro.heading}
              subheading={careersIntro.subheading}
              action={<SeeAll to={`${prefix}/careers`}>{t('common.exploreCareers')}</SeeAll>}
            />
            <ValueGrid
              items={careersIntro.items}
              display={careersIntro.display}
              label={careersIntro.heading}
            />
          </div>
        </section>
      )}

      {isShown(customPathsIntro) && customPathsIntro.items?.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading
              heading={customPathsIntro.heading}
              subheading={customPathsIntro.subheading}
            />
            <Collection
              items={customPathsIntro.items}
              display={customPathsIntro.display}
              label={customPathsIntro.heading}
              getKey={(item, idx) => `${item.path || 'path'}-${idx}`}
              renderItem={item => {
                const Icon = iconFor(item.icon);
                const to = withLocale(item.path || '/', locale);
                return (
                  <Card className="p-6 flex h-full flex-col justify-between">
                    <div className="space-y-3">
                      {Icon && (
                        <div className="w-10 h-10 rounded-xl bg-primary-subtle text-primary flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                      )}
                      <h3 className="text-lg font-bold font-display text-fg">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-fg-muted leading-relaxed">{item.description}</p>
                      )}
                    </div>
                    {item.path && (
                      <div className="pt-5 mt-5 border-t border-border-subtle">
                        <Link
                          to={to}
                          className="inline-flex items-center text-sm font-semibold text-primary hover:opacity-80 gap-1.5"
                        >
                          {t('common.viewDetails')}
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </Card>
                );
              }}
            />
          </div>
        </section>
      )}

      {isShown(cta) && (
        <CtaSection
          heading={cta.heading}
          subheading={cta.subheading}
          primaryCta={cta.primaryCta}
          secondaryCta={cta.secondaryCta}
          locale={locale}
        />
      )}
    </div>
  );
}

