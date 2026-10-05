import { makeDisplay } from '@devhouse/shared';
import { defineSection, field } from '../define.js';

/**
 * Settings shared by every project page: how its lists are shown.
 * The content of one project is edited under Projects.
 */
export const projectResults = defineSection({
  key: 'results',
  label: 'Kết quả đạt được',
  fields: { display: field.display() },
  defaults: {
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 3 } }),
  },
});

export const projectFeatures = defineSection({
  key: 'features',
  label: 'Tính năng chính',
  fields: { display: field.display() },
  defaults: {
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 2 } }),
  },
});

export const projectDetailPage = {
  key: 'project-detail',
  title: { vi: 'Trang chi tiết dự án', en: 'Project page' },
  sections: [projectResults, projectFeatures],
  seo: {
    title: { vi: 'Dự án — Dev House Software', en: 'Projects — Dev House Software' },
    description: { vi: '', en: '' },
  },
};
