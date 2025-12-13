// Response transformer middleware to ensure frontend compatibility
export const responseTransformer = (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (data) {
        const transformed = transformResponse(data);
        return originalJson(transformed);
    };

    next();
};

// Transform MongoDB documents to frontend-friendly format
const transformResponse = (data) => {
    if (!data) return data;

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => transformDocument(item));
    }

    // Handle single objects
    if (typeof data === 'object') {
        // Check if it's a paginated response
        if (data.users || data.swaps || data.posts || data.notifications || data.transactions) {
            const transformed = {};
            Object.keys(data).forEach(key => {
                if (Array.isArray(data[key])) {
                    transformed[key] = data[key].map(item => transformDocument(item));
                } else {
                    transformed[key] = data[key];
                }
            });
            return transformed;
        }

        // Single document
        return transformDocument(data);
    }

    return data;
};

const transformDocument = (doc) => {
    if (!doc || typeof doc !== 'object') return doc;

    const transformed = { ...doc };

    // Transform _id to id
    if (doc._id) {
        transformed.id = doc._id.toString();
        delete transformed._id;
    }

    // Transform ObjectId references
    if (doc.requester && typeof doc.requester === 'object' && doc.requester._id) {
        transformed.requesterId = doc.requester._id.toString();
        transformed.requester = doc.requester;
    } else if (doc.requester) {
        transformed.requesterId = doc.requester.toString();
    }

    if (doc.recipient && typeof doc.recipient === 'object' && doc.recipient._id) {
        transformed.recipientId = doc.recipient._id.toString();
        transformed.recipient = doc.recipient;
    } else if (doc.recipient) {
        transformed.recipientId = doc.recipient.toString();
    }

    if (doc.sender && typeof doc.sender === 'object' && doc.sender._id) {
        transformed.senderId = doc.sender._id.toString();
        transformed.sender = doc.sender;
    } else if (doc.sender) {
        transformed.senderId = doc.sender.toString();
    }

    if (doc.user && typeof doc.user === 'object' && doc.user._id) {
        transformed.userId = doc.user._id.toString();
    } else if (doc.user) {
        transformed.userId = doc.user.toString();
    }

    if (doc.author && typeof doc.author === 'object' && doc.author._id) {
        transformed.authorId = doc.author._id.toString();
    } else if (doc.author) {
        transformed.authorId = doc.author.toString();
    }

    // Transform timestamps
    if (doc.createdAt) {
        transformed.timestamp = doc.createdAt;
    }

    // Transform skillcoins to credits for backward compatibility (optional)
    // Uncomment if you want to support old frontend without changes
    // if (doc.skillcoins !== undefined) {
    //   transformed.credits = doc.skillcoins;
    // }

    // Transform readBy array to isRead boolean for messages
    if (doc.readBy && Array.isArray(doc.readBy)) {
        // Check if current user ID is in readBy array
        // This needs to be enhanced with actual user context
        transformed.isRead = doc.readBy.length > 0;
    }

    return transformed;
};
