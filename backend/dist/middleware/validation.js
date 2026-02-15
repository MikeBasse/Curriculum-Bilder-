"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const errorHandler_1 = require("./errorHandler");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            const messages = error.errors?.map((e) => e.message).join(', ') || 'Validation failed';
            next(new errorHandler_1.AppError(messages, 400));
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validation.js.map