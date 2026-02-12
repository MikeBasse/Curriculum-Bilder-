import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface ExportContent {
  title: string;
  type: string;
  content: Record<string, any>;
}

const formatValue = (value: any): string => {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (typeof item === 'object') {
          return Object.entries(item)
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
        }
        return `${index + 1}. ${item}`;
      })
      .join('\n');
  }
  if (typeof value === 'object' && value !== null) {
    return Object.entries(value)
      .map(([k, v]) => `${k}: ${formatValue(v)}`)
      .join('\n');
  }
  return String(value);
};

const formatKey = (key: string): string => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export const generateDocx = async (data: ExportContent): Promise<Buffer> => {
  const children: any[] = [
    new Paragraph({
      text: data.title,
      heading: HeadingLevel.TITLE,
      spacing: { after: 300 },
    }),
    new Paragraph({
      text: `Type: ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}`,
      spacing: { after: 200 },
    }),
  ];

  // Add content sections
  for (const [key, value] of Object.entries(data.content)) {
    // Skip null/undefined values
    if (value == null) continue;

    // Section heading
    children.push(
      new Paragraph({
        text: formatKey(key),
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 150 },
      })
    );

    // Section content
    const formattedValue = formatValue(value);
    const lines = formattedValue.split('\n');

    for (const line of lines) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: line })],
          spacing: { after: 100 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
};

export const generatePdf = async (data: ExportContent): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Title
    doc.fontSize(24).font('Helvetica-Bold').text(data.title, { align: 'center' });
    doc.moveDown();

    // Type
    doc.fontSize(12).font('Helvetica').text(`Type: ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}`);
    doc.moveDown(2);

    // Content sections
    for (const [key, value] of Object.entries(data.content)) {
      if (value == null) continue;

      // Section heading
      doc.fontSize(14).font('Helvetica-Bold').text(formatKey(key));
      doc.moveDown(0.5);

      // Section content
      doc.fontSize(11).font('Helvetica');
      const formattedValue = formatValue(value);
      doc.text(formattedValue);
      doc.moveDown();
    }

    doc.end();
  });
};

export const ensureExportDir = (): string => {
  const exportDir = path.join(__dirname, '../../exports');
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }
  return exportDir;
};
