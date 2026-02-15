export interface GenerationConfig {
    type: 'lesson' | 'program' | 'assessment';
    title: string;
    subject?: string;
    gradeLevel?: string;
    duration?: string;
    objectives?: string[];
    additionalInstructions?: string;
}
export declare const generateContent: (userId: string, config: GenerationConfig, sourceText: string) => Promise<object>;
export declare const trackUsage: (userId: string, action: string) => Promise<void>;
//# sourceMappingURL=claudeService.d.ts.map