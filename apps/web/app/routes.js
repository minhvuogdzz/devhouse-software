import { index, route, layout } from '@react-router/dev/routes';

export default [
  // Primary layout containing Header, Outlet, Footer
  layout('components/layout/SiteLayout.jsx', { id: 'site-layout' }, [
    // Vietnamese (unprefixed)
    index('routes/home.jsx', { id: 'vi-home' }),
    route('about', 'routes/about.jsx', { id: 'vi-about' }),
    route('services', 'routes/services.jsx', { id: 'vi-services' }),
    route('services/:slug', 'routes/service-detail.jsx', { id: 'vi-service-detail' }),
    route('solutions', 'routes/solutions.jsx', { id: 'vi-solutions' }),
    route('solutions/:slug', 'routes/solution-detail.jsx', { id: 'vi-solution-detail' }),
    route('projects', 'routes/projects.jsx', { id: 'vi-projects' }),
    route('projects/:slug', 'routes/project-detail.jsx', { id: 'vi-project-detail' }),
    route('technologies', 'routes/technologies.jsx', { id: 'vi-technologies' }),
    route('blog', 'routes/blog.jsx', { id: 'vi-blog' }),
    route('blog/category/:slug', 'routes/blog.jsx', { id: 'vi-blog-category' }),
    route('blog/tag/:slug', 'routes/blog.jsx', { id: 'vi-blog-tag' }),
    route('blog/:slug', 'routes/blog-post.jsx', { id: 'vi-blog-post' }),
    route('careers', 'routes/careers.jsx', { id: 'vi-careers' }),
    route('contact', 'routes/contact.jsx', { id: 'vi-contact' }),
    route('privacy', 'routes/privacy.jsx', { id: 'vi-privacy' }),
    route('terms', 'routes/terms.jsx', { id: 'vi-terms' }),
    route('404', 'routes/not-found.jsx', { id: 'vi-404' }),

    // English (/en prefix)
    route('en', 'routes/en.jsx', { id: 'en-layout' }, [
      index('routes/home.jsx', { id: 'en-home' }),
      route('about', 'routes/about.jsx', { id: 'en-about' }),
      route('services', 'routes/services.jsx', { id: 'en-services' }),
      route('services/:slug', 'routes/service-detail.jsx', { id: 'en-service-detail' }),
      route('solutions', 'routes/solutions.jsx', { id: 'en-solutions' }),
      route('solutions/:slug', 'routes/solution-detail.jsx', { id: 'en-solution-detail' }),
      route('projects', 'routes/projects.jsx', { id: 'en-projects' }),
      route('projects/:slug', 'routes/project-detail.jsx', { id: 'en-project-detail' }),
      route('technologies', 'routes/technologies.jsx', { id: 'en-technologies' }),
      route('blog', 'routes/blog.jsx', { id: 'en-blog' }),
      route('blog/category/:slug', 'routes/blog.jsx', { id: 'en-blog-category' }),
      route('blog/tag/:slug', 'routes/blog.jsx', { id: 'en-blog-tag' }),
      route('blog/:slug', 'routes/blog-post.jsx', { id: 'en-blog-post' }),
      route('careers', 'routes/careers.jsx', { id: 'en-careers' }),
      route('contact', 'routes/contact.jsx', { id: 'en-contact' }),
      route('privacy', 'routes/privacy.jsx', { id: 'en-privacy' }),
      route('terms', 'routes/terms.jsx', { id: 'en-terms' }),
      route('404', 'routes/not-found.jsx', { id: 'en-404' }),
      route('*', 'routes/catch-all.jsx', { id: 'en-catch-all' }),
    ]),

    route('*', 'routes/catch-all.jsx', { id: 'vi-catch-all' }),
  ]),

  // Standalone Resource Routes
  route('sitemap.xml', 'routes/sitemap.jsx', { id: 'res-sitemap' }),
  route('robots.txt', 'routes/robots.jsx', { id: 'res-robots' }),
  route('healthz', 'routes/healthz.jsx', { id: 'res-healthz' }),
];
