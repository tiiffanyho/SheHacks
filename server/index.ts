import express, { Request, Response } from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import path from 'path';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.static('dist'));
app.use(express.json());

interface ProcessedReceipt {
  merchant: string;
  date: string;
  items: Array<{ name: string; price: number }>;
  total: number;
}

// Mock receipt parsing - enhance with better OCR in production
async function parseReceiptText(text: string): Promise<ProcessedReceipt> {
  const lines = text.split('\n').filter(l => l.trim());
  const total = parseFloat(lines[lines.length - 1]?.match(/[\d.]+/)?.[0] || '0');
  
  return {
    merchant: lines[0] || 'Unknown Store',
    date: new Date().toISOString().split('T')[0],
    items: lines.slice(1, -1).map(line => ({
      name: line.replace(/[\d.$]/g, '').trim() || 'Item',
      price: parseFloat(line.match(/[\d.]+/)?.[0] || '0')
    })),
    total
  };
}

app.post('/api/receipts/process', upload.single('receipt'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Process image with OCR
    const { data: { text } } = await Tesseract.recognize(req.file.buffer, 'eng');
    const receiptData = await parseReceiptText(text);

    res.json(receiptData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process receipt' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
