export const parseListQuery = (query = {}, options = {}) => {
  const {
    allowedSortFields = ['createdAt', 'updatedAt', 'order', 'title', 'name'],
    defaultSort = 'createdAt',
    defaultLimit = 10,
    maxLimit = 100,
    searchFields = [],
  } = options;

  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const requestedLimit = parseInt(query.limit, 10) || defaultLimit;
  const limit = Math.min(Math.max(1, requestedLimit), maxLimit);
  const skip = (page - 1) * limit;

  // Sorting
  const sortField = allowedSortFields.includes(query.sort) ? query.sort : defaultSort;
  // Manual ordering and names read best ascending; dates and counters newest or highest first.
  const naturallyAscending = ['order', 'name', 'title'].includes(sortField);
  const sortDirection =
    query.order === 'asc' ? 1 : query.order === 'desc' ? -1 : naturallyAscending ? 1 : -1;
  // _id is a stable tiebreaker so pages never repeat or skip items.
  const sort = { [sortField]: sortDirection, _id: 1 };

  // Free-text search term (callers turn it into an escaped, anchored-free regex)
  const search =
    typeof query.search === 'string' && query.search.trim()
      ? query.search.trim().slice(0, 100)
      : '';

  const filter = {};

  // Status filtering
  if (query.status) {
    filter.status = query.status;
  }

  // Locale filtering (ensures document is complete in requested locale)
  if (query.locale) {
    filter.locales = query.locale;
  }

  // Search filtering
  if (query.search && typeof query.search === 'string' && query.search.trim()) {
    const term = query.search.trim();
    if (searchFields.length > 0) {
      filter.$or = searchFields.map(field => ({
        [field]: { $regex: term, $options: 'i' },
      }));
    }
  }

  return {
    filter,
    search,
    sort,
    skip,
    limit,
    page,
  };
};
