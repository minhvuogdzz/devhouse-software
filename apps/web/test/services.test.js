import { describe, it, expect } from 'vitest';
import { resolveDefaultServices } from '@devhouse/content';
import { groupServices } from '../app/lib/services.js';

describe('groupServices', () => {
  it('puts each kind of service under its group, in order', () => {
    const { grouped, orphans } = groupServices(resolveDefaultServices('vi'));
    expect(grouped.map(({ group }) => group.name)).toEqual([
      'Thiết kế website',
      'Máy chủ và hạ tầng đám mây',
      'Tên miền và DNS',
      'Bảo mật và hỗ trợ',
    ]);
    expect(grouped.map(({ types }) => types.length)).toEqual([5, 6, 4, 4]);
    expect(grouped[0].types[0].name).toBe('Landing page');
    expect(orphans).toEqual([]);
  });

  it('keeps a kind of service whose group is missing', () => {
    const lonely = { slug: 'x', name: 'X', parent: { slug: 'gone', name: 'Gone' } };
    const group = { slug: 'g', name: 'G', parent: null };
    const { grouped, orphans } = groupServices([group, lonely]);
    expect(grouped).toEqual([{ group, types: [] }]);
    expect(orphans).toEqual([lonely]);
  });
});
