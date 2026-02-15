export interface ExportContent {
    title: string;
    type: string;
    content: Record<string, any>;
}
export declare const generateDocx: (data: ExportContent) => Promise<Buffer>;
export declare const generatePdf: (data: ExportContent) => Promise<Buffer>;
export declare const ensureExportDir: () => string;
//# sourceMappingURL=exportService.d.ts.map