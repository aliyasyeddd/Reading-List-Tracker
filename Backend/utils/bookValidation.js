const validator = require('validator');

const validateBookData = (req) => {
    const allowedEditedFields = [
        'title', 'author', 'genre', 'coverUrl', 'status', 'rating', 'notes', 'startedAt', 'finishedAt'
    ];

    // Edit book data - ensure every field in the request body is allowed.
    const bodyFields = Object.keys(req.body);
    if (bodyFields.length === 0) {
        throw new Error("Request body must include at least one field to update.");
    }

    const isEditIsAllowed = bodyFields.every((field) => allowedEditedFields.includes(field));
    if (!isEditIsAllowed) {
        throw new Error("Invalid field(s) in request body. Allowed fields are: " + allowedEditedFields.join(", "));
    }

    return isEditIsAllowed;
}

module.exports = {
    validateBookData
};
