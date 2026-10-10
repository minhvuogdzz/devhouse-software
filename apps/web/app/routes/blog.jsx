import React from 'react';
import { generateSeoMeta } from '../lib/seo.js';
import { useLoaderData, Link } from 'react-router';
import { apiClient } from '../lib/api-client.js';
import { loadPage, isShown } from '../lib/page-data.js';
import { Collection } from '../components/ui/Collection.jsx';
import { getTranslation } from '../lib/i18n.js';
import { Card } from '../components/ui/Card.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Clock, Calendar, User } from 'lucide-react';

export async function loader({ request, params }) {
  const url = new URL(request.url);
  const locale = url.pathname.startsWith('/en') ? 'en' : 'vi';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const search = url.searchParams.get('search') || '';

  const isCategory = url.pathname.includes('/category/');
  const isTag = url.pathname.includes('/tag/');
  const filterSlug = params.slug || null;

  let query = `locale=${locale}&page=${page}&limit=9`;
  if (search) query += `&search=${encodeURIComponent(search)}`;
  if (isCategory && filterSlug) query += `&category=${encodeURIComponent(filterSlug)}`;
  if (isTag && filterSlug) query += `&tag=${encodeURIComponent(filterSlug)}`;

  let postsData = { data: [], pagination: { total: 0, totalPages: 1, page: 1 } };
  let tags = [];

  try {
    const res = await apiClient(`/blog/posts?${query}`);
    postsData = {
      data: res.data || [],
      pagination: res.pagination || { total: 0, totalPages: 1, page: 1 },
    };
  } catch {
    // No made-up posts: when the API cannot be reached the list is simply empty
    postsData = { data: [], pagination: { total: 0, totalPages: 1, page: 1 } };
  }

  try {
    const tagRes = await apiClient(`/blog/tags?locale=${locale}`);
    tags = tagRes.data || [];
  } catch {
    tags = [];
  }

  const pageContent = await loadPage('blog-index', request);

  return {
    sections: pageContent.sections,
    seo: pageContent.seo,
    posts: postsData.data,
    pagination: postsData.pagination,
    tags,
    url: request.url,
    locale,
    currentFilter: {
      type: isCategory ? 'category' : isTag ? 'tag' : 'all',
      slug: filterSlug,
    },
  };
}

export function meta({ data }) {
  return generateSeoMeta({
    title: data?.seo?.title || 'Devhouse Software',
    description: data?.seo?.description || '',
    url: data?.url,
    locale: data?.locale,
  });
}

export default function BlogPage() {
  const { sections, posts, pagination, tags, locale, currentFilter } = useLoaderData();
  const { hero, list } = sections;
  const t = getTranslation(locale);
  const prefix = locale === 'en' ? '/en' : '';

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
    <div className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {isShown(hero) && (
          <div className="max-w-3xl space-y-4">
            <Badge variant="default">{hero.eyebrow || t('header.nav.blog')}</Badge>
            <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-fg tracking-tight">
              {hero.heading}
            </h1>
            {hero.subheading && (
              <p className="text-lg text-fg-muted leading-relaxed">{hero.subheading}</p>
            )}
          </div>
        )}

        {/* Filters / Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-2 pb-6">
          <Link
            to={`${prefix}/blog`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              currentFilter.type === 'all'
                ? 'bg-primary text-primary-fg'
                : 'bg-surface-raised text-fg-muted hover:text-fg border border-border'
            }`}
          >
            {t('common.all')}
          </Link>
          {tags.map(tag => {
            const tagSlug =
              typeof tag.slug === 'object'
                ? tag.slug[locale] || tag.slug.en || tag.slug.vi
                : tag.slug;
            const isActive = currentFilter.type === 'tag' && currentFilter.slug === tagSlug;
            return (
              <Link
                key={tag._id || tagSlug}
                to={`${prefix}/blog/tag/${tagSlug}`}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-fg'
                    : 'bg-surface-raised text-fg-muted hover:text-fg border border-border'
                }`}
              >
                {tag.name}
              </Link>
            );
          })}
        </div>

        {/* Posts: shown as the admin chose (grid, list or slide) */}
        {posts.length > 0 ? (
          <Collection
            items={posts}
            display={list?.display}
            label={t('header.nav.blog')}
            gap="lg"
            getKey={post => post._id || post.slug}
            renderItem={post => (
              <Card className="flex h-full flex-col justify-between">
                <div className="space-y-4">
                  {/* Tags & Reading Time */}
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

                  {/* Title */}
                  <h2 className="text-xl font-bold font-display text-fg leading-snug">
                    <Link
                      to={`${prefix}/blog/${post.slug}`}
                      className="hover:text-primary transition-colors line-clamp-2"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-sm text-fg-muted leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-6 mt-4 border-t border-border-subtle flex items-center justify-between text-xs text-fg-muted">
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
        ) : (
          <div className="text-center py-16 text-fg-muted border border-dashed border-border rounded-xl">
            <p>{t('common.noResults')}</p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-8">
            {pagination.hasPrev && (
              <Button
                as={Link}
                to={`${prefix}/blog?page=${pagination.page - 1}`}
                variant="outline"
                size="sm"
              >
                {t('common.prev')}
              </Button>
            )}
            <span className="text-sm text-fg-muted">
              {t('common.page')} {pagination.page} {t('common.of')} {pagination.totalPages}
            </span>
            {pagination.hasNext && (
              <Button
                as={Link}
                to={`${prefix}/blog?page=${pagination.page + 1}`}
                variant="outline"
                size="sm"
              >
                {t('common.next')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
