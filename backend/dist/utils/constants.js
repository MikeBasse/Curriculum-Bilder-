"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBSCRIPTION_TIERS = exports.GENERATION_TYPES = exports.MAX_FILE_SIZE = exports.ALLOWED_FILE_TYPES = exports.BCRYPT_ROUNDS = exports.REFRESH_TOKEN_EXPIRES_IN = exports.JWT_EXPIRES_IN = void 0;
exports.JWT_EXPIRES_IN = '15m';
exports.REFRESH_TOKEN_EXPIRES_IN = '7d';
exports.BCRYPT_ROUNDS = 12;
exports.ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
];
exports.MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
exports.GENERATION_TYPES = ['lesson', 'program', 'assessment'];
exports.SUBSCRIPTION_TIERS = {
    free: {
        generationsPerMonth: 5,
        maxDocuments: 10,
        maxProjects: 3,
    },
    basic: {
        generationsPerMonth: 50,
        maxDocuments: 100,
        maxProjects: 20,
    },
    premium: {
        generationsPerMonth: -1, // unlimited
        maxDocuments: -1,
        maxProjects: -1,
    },
};
//# sourceMappingURL=constants.js.map