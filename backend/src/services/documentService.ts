import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

export const extractTextFromPdf = async (filePath: string): Promise<string> => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    return '';
  }
};

export const extractTextFromFile = async (
  filePath: string,
  fileType: string
): Promise<string> => {
  if (fileType === 'application/pdf') {
    return extractTextFromPdf(filePath);
  }

  if (fileType === 'text/plain') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  // For DOCX and other files, return empty for now
  // Could add docx parsing later
  return '';
};

export const deleteFile = (filePath: string): void => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('File deletion error:', error);
  }
};

export const ensureUploadDir = (): string => {
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};
