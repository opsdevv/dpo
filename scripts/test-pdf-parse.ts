import { PDFParse } from 'pdf-parse';

async function test() {
  console.log('Testing PDFParse class...');
  try {
    const parser = new PDFParse({ data: Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (Test) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF') });
    console.log('Parser created');
    const data = await parser.getText();
    console.log('Text extracted:', data.text);
    await parser.destroy();
    console.log('Parser destroyed');
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
