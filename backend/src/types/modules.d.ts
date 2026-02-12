declare module 'pdf-parse' {
  interface PDFInfo {
    PDFFormatVersion: string;
    IsAcroFormPresent: boolean;
    IsXFAPresent: boolean;
    Title: string;
    Author: string;
    Subject: string;
    Creator: string;
    Producer: string;
    CreationDate: string;
    ModDate: string;
  }

  interface PDFMetadata {
    _metadata: any;
  }

  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: PDFMetadata;
    text: string;
    version: string;
  }

  interface PDFOptions {
    max?: number;
    version?: string;
  }

  function pdfParse(dataBuffer: Buffer, options?: PDFOptions): Promise<PDFData>;
  export = pdfParse;
}

declare module 'pdfkit' {
  import { Writable } from 'stream';

  class PDFDocument extends Writable {
    constructor(options?: PDFDocument.PDFDocumentOptions);

    addPage(options?: PDFDocument.PDFDocumentOptions): this;
    fontSize(size: number): this;
    font(font: string): this;
    text(text: string, options?: PDFDocument.TextOptions): this;
    text(text: string, x?: number, y?: number, options?: PDFDocument.TextOptions): this;
    moveDown(lines?: number): this;
    end(): void;

    on(event: 'data', callback: (chunk: Buffer) => void): this;
    on(event: 'end', callback: () => void): this;
    on(event: 'error', callback: (error: Error) => void): this;
  }

  namespace PDFDocument {
    interface PDFDocumentOptions {
      margin?: number;
      margins?: {
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
      };
      size?: string | [number, number];
      layout?: 'portrait' | 'landscape';
    }

    interface TextOptions {
      align?: 'left' | 'center' | 'right' | 'justify';
      width?: number;
      height?: number;
      lineBreak?: boolean;
      continued?: boolean;
      indent?: number;
    }
  }

  export = PDFDocument;
}
