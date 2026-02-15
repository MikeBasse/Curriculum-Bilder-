export declare const JWT_EXPIRES_IN = "15m";
export declare const REFRESH_TOKEN_EXPIRES_IN = "7d";
export declare const BCRYPT_ROUNDS = 12;
export declare const ALLOWED_FILE_TYPES: string[];
export declare const MAX_FILE_SIZE: number;
export declare const GENERATION_TYPES: readonly ["lesson", "program", "assessment"];
export declare const SUBSCRIPTION_TIERS: {
    readonly free: {
        readonly generationsPerMonth: 5;
        readonly maxDocuments: 10;
        readonly maxProjects: 3;
    };
    readonly basic: {
        readonly generationsPerMonth: 50;
        readonly maxDocuments: 100;
        readonly maxProjects: 20;
    };
    readonly premium: {
        readonly generationsPerMonth: -1;
        readonly maxDocuments: -1;
        readonly maxProjects: -1;
    };
};
//# sourceMappingURL=constants.d.ts.map