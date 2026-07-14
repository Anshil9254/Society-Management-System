const { API } = require('../constants/api.constants');

/**
 * Formats standard pagination metadata for API responses.
 *
 * @param {number} totalItems - Total records in the database matching the query
 * @param {number} page - Current page number
 * @param {number} limit - Records per page
 * @returns {Object} Pagination metadata block
 */
const paginate = (totalItems, page = API.DEFAULT_PAGE, limit = API.DEFAULT_LIMIT) => {
  const currentPage = Math.max(1, parseInt(page, 10));
  const currentLimit = Math.min(API.MAX_LIMIT, Math.max(1, parseInt(limit, 10)));
  const totalPages = Math.ceil(totalItems / currentLimit);

  return {
    totalItems,
    totalPages,
    currentPage,
    limit: currentLimit,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

/**
 * Calculates Prisma query offsets based on page and limit.
 *
 * @param {number} page 
 * @param {number} limit 
 * @returns {Object} { skip, take } for Prisma queries
 */
const getPaginationOptions = (page = API.DEFAULT_PAGE, limit = API.DEFAULT_LIMIT) => {
  const currentPage = Math.max(1, parseInt(page, 10));
  const currentLimit = Math.min(API.MAX_LIMIT, Math.max(1, parseInt(limit, 10)));
  
  return {
    skip: (currentPage - 1) * currentLimit,
    take: currentLimit,
  };
};

module.exports = {
  paginate,
  getPaginationOptions,
};
