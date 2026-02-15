export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}
export declare const hashPassword: (password: string) => Promise<string>;
export declare const verifyPassword: (password: string, hash: string) => Promise<boolean>;
export declare const generateTokens: (userId: string) => TokenPair;
export declare const verifyRefreshToken: (token: string) => {
    userId: string;
};
export declare const registerUser: (email: string, password: string, name: string, school?: string) => Promise<{
    user: {
        id: string;
        email: string;
        name: string;
        school: string | null;
        subscriptionTier: string;
        createdAt: Date;
    };
    tokens: TokenPair;
}>;
export declare const loginUser: (email: string, password: string) => Promise<{
    user: {
        id: string;
        email: string;
        name: string;
        school: string | null;
        subscriptionTier: string;
        createdAt: Date;
    };
    tokens: TokenPair;
}>;
export declare const refreshTokens: (refreshToken: string) => Promise<TokenPair>;
export declare const logoutUser: (userId: string) => Promise<void>;
//# sourceMappingURL=authService.d.ts.map