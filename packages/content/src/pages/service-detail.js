import { makeDisplay } from '@devhouse/shared';
import { defineSection, field } from '../define.js';

/**
 * Settings shared by every service page: the headings of its parts and how each list is shown.
 * The content of one service (its text, points and steps) is edited under Services.
 */
export const serviceTypes = defineSection({
  key: 'types',
  label: 'Các dạng dịch vụ trong nhóm',
  fields: {
    heading: field.text({ max: 120 }),
    display: field.display(),
  },
  defaults: {
    heading: { vi: 'Các dạng dịch vụ trong nhóm này', en: 'Services in this group' },
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 3 } }),
  },
});

export const serviceFeatures = defineSection({
  key: 'features',
  label: 'Điểm nổi bật / Bao gồm',
  fields: {
    heading: field.text({ max: 120 }),
    display: field.display(),
  },
  defaults: {
    heading: { vi: 'Bao gồm', en: 'What is included' },
    display: makeDisplay({ layout: 'grid', columns: { mobile: 1, tablet: 2, desktop: 2 } }),
  },
});

export const serviceProcess = defineSection({
  key: 'process',
  label: 'Cách chúng tôi triển khai',
  fields: {
    heading: field.text({ max: 120 }),
    subheading: field.textarea({ max: 300 }),
    display: field.display(),
  },
  defaults: {
    heading: { vi: 'Cách chúng tôi triển khai', en: 'How we set it up' },
    subheading: {
      vi: 'Các bước thực hiện, từ lúc bắt đầu đến khi bàn giao.',
      en: 'The steps we follow, from the start to the handover.',
    },
    display: makeDisplay({ layout: 'list', columns: { mobile: 1, tablet: 1, desktop: 1 } }),
  },
});

export const serviceDetailPage = {
  key: 'service-detail',
  title: { vi: 'Trang chi tiết dịch vụ', en: 'Service page' },
  sections: [serviceTypes, serviceFeatures, serviceProcess],
  seo: {
    title: { vi: 'Dịch vụ — Dev House Software', en: 'Services — Dev House Software' },
    description: { vi: '', en: '' },
  },
};
