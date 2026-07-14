const { API } = require('../constants/api.constants');

/**
 * Formats standard pagination metadata for API responses.
 *
 * @param {number} totalItems - Total records in the database matching the query
 * @param {number} page - Current page number
 * @param {number} limit - Records per page
 * @returns {Object} Pagination metadata block
 */
const paginate = (data, totalItems, page = API.DEFAULT_PAGE, limit = API.DEFAULT_LIMIT) => {
  const currentPage = Math.max(1, parseInt(page, 10));
  const currentLimit = Math.min(API.MAX_LIMIT, Math.max(1, parseInt(limit, 10)));
  const totalPages = Math.ceil(totalItems / currentLimit);

  return {
    data,
    pagination: {
      totalItems,
      totalPages,
      currentPage,
      limit: currentLimit,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    }
  };
};

module.exports = paginate;
