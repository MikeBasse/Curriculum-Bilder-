"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureExportDir = exports.generatePdf = exports.generateDocx = void 0;
const docx_1 = require("docx");
const pdfkit_1 = __importDefault(require("pdfkit"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const formatValue = (value) => {
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
const formatKey = (key) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
};
const generateDocx = async (data) => {
    const children = [
        new docx_1.Paragraph({
            text: data.title,
            heading: docx_1.HeadingLevel.TITLE,
            spacing: { after: 300 },
        }),
        new docx_1.Paragraph({
            text: `Type: ${data.type.charAt(0).toUpperCase() + data.type.slice(1)}`,
            spacing: { after: 200 },
        }),
    ];
    // Add content sections
    for (const [key, value] of Object.entries(data.content)) {
        // Skip null/undefined values
        if (value == null)
            continue;
        // Section heading
        children.push(new docx_1.Paragraph({
            text: formatKey(key),
            heading: docx_1.HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 },
        }));
        // Section content
        const formattedValue = formatValue(value);
        const lines = formattedValue.split('\n');
        for (const line of lines) {
            children.push(new docx_1.Paragraph({
                children: [new docx_1.TextRun({ text: line })],
                spacing: { after: 100 },
            }));
        }
    }
    const doc = new docx_1.Document({
        sections: [
            {
                properties: {},
                children,
            },
        ],
    });
    return docx_1.Packer.toBuffer(doc);
};
exports.generateDocx = generateDocx;
const generatePdf = async (data) => {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 50 });
        const chunks = [];
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
            if (value == null)
                continue;
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
exports.generatePdf = generatePdf;
const ensureExportDir = () => {
    const exportDir = path_1.default.join(__dirname, '../../exports');
    if (!fs_1.default.existsSync(exportDir)) {
        fs_1.default.mkdirSync(exportDir, { recursive: true });
    }
    return exportDir;
};
exports.ensureExportDir = ensureExportDir;
//# sourceMappingURL=exportService.js.map