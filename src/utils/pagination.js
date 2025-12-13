// Advanced pagination utility with cursor-based and offset-based support
export class PaginationHelper {
    constructor(model, query = {}, options = {}) {
        this.model = model;
        this.query = query;
        this.options = {
            page: parseInt(options.page) || 1,
            limit: parseInt(options.limit) || 20,
            sort: options.sort || { createdAt: -1 },
            populate: options.populate || null,
            select: options.select || null,
            maxLimit: 100 // Prevent abuse
        };

        // Enforce max limit
        if (this.options.limit > this.options.maxLimit) {
            this.options.limit = this.options.maxLimit;
        }
    }

    async paginate() {
        try {
            const { page, limit, sort, populate, select } = this.options;
            const skip = (page - 1) * limit;

            // Build query
            let queryBuilder = this.model.find(this.query);

            if (select) {
                queryBuilder = queryBuilder.select(select);
            }

            if (populate) {
                if (Array.isArray(populate)) {
                    populate.forEach(pop => {
                        queryBuilder = queryBuilder.populate(pop);
                    });
                } else {
                    queryBuilder = queryBuilder.populate(populate);
                }
            }

            // Execute query with pagination
            const [data, total] = await Promise.all([
                queryBuilder
                    .sort(sort)
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                this.model.countDocuments(this.query)
            ]);

            const totalPages = Math.ceil(total / limit);
            const hasNextPage = page < totalPages;
            const hasPrevPage = page > 1;

            return {
                data,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? page + 1 : null,
                    prevPage: hasPrevPage ? page - 1 : null
                }
            };
        } catch (error) {
            throw new Error(`Pagination error: ${error.message}`);
        }
    }

    // Cursor-based pagination (better for large datasets)
    async cursorPaginate(cursorField = '_id', cursorValue = null) {
        try {
            const { limit, sort, populate, select } = this.options;

            // Add cursor to query if provided
            const query = { ...this.query };
            if (cursorValue) {
                query[cursorField] = { $lt: cursorValue }; // Assuming descending order
            }

            // Build query
            let queryBuilder = this.model.find(query);

            if (select) {
                queryBuilder = queryBuilder.select(select);
            }

            if (populate) {
                if (Array.isArray(populate)) {
                    populate.forEach(pop => {
                        queryBuilder = queryBuilder.populate(pop);
                    });
                } else {
                    queryBuilder = queryBuilder.populate(populate);
                }
            }

            // Fetch one extra to determine if there's a next page
            const data = await queryBuilder
                .sort(sort)
                .limit(limit + 1)
                .lean();

            const hasNextPage = data.length > limit;
            const results = hasNextPage ? data.slice(0, limit) : data;
            const nextCursor = results.length > 0 ? results[results.length - 1][cursorField] : null;

            return {
                data: results,
                pagination: {
                    limit,
                    hasNextPage,
                    nextCursor: hasNextPage ? nextCursor : null
                }
            };
        } catch (error) {
            throw new Error(`Cursor pagination error: ${error.message}`);
        }
    }
}

// Helper function for query building with filters
export const buildFilterQuery = (filters = {}) => {
    const query = {};

    // Date range filtering
    if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) {
            query.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
            query.createdAt.$lte = new Date(filters.dateTo);
        }
    }

    // Status filtering
    if (filters.status) {
        query.status = Array.isArray(filters.status)
            ? { $in: filters.status }
            : filters.status;
    }

    // Text search
    if (filters.search) {
        query.$text = { $search: filters.search };
    }

    // Numeric range filtering
    if (filters.minValue !== undefined || filters.maxValue !== undefined) {
        const field = filters.field || 'value';
        query[field] = {};
        if (filters.minValue !== undefined) {
            query[field].$gte = parseFloat(filters.minValue);
        }
        if (filters.maxValue !== undefined) {
            query[field].$lte = parseFloat(filters.maxValue);
        }
    }

    // Boolean filtering
    if (filters.isActive !== undefined) {
        query.isActive = filters.isActive === 'true' || filters.isActive === true;
    }

    // Array contains filtering
    if (filters.tags && Array.isArray(filters.tags)) {
        query.tags = { $in: filters.tags };
    }

    // Custom filters
    if (filters.custom) {
        Object.assign(query, filters.custom);
    }

    return query;
};

// Sort builder
export const buildSortQuery = (sortBy, sortOrder = 'desc') => {
    if (!sortBy) return { createdAt: -1 };

    const sortFields = Array.isArray(sortBy) ? sortBy : [sortBy];
    const sort = {};

    sortFields.forEach(field => {
        sort[field] = sortOrder === 'asc' ? 1 : -1;
    });

    return sort;
};

// Middleware to parse pagination params from query
export const parsePaginationParams = (req, res, next) => {
    req.pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        sort: buildSortQuery(req.query.sortBy, req.query.sortOrder),
        populate: req.query.populate ? req.query.populate.split(',') : null,
        select: req.query.select ? req.query.select.split(',').join(' ') : null
    };

    req.filters = buildFilterQuery(req.query.filter || req.query);

    next();
};
