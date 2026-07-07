async function test() {
  console.log('Testing pdf-parse/node...');
  try {
    const { PDFParse } = await import('pdf-parse/node');
    console.log('PDFParse from node:', typeof PDFParse);
    const parser = new PDFParse({ data: Buffer.from('%PDF-1.4\n1 0 obj\n<< /Title (Test) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF') });
    console.log('Parser created');
    const data = await parser.getText();
    console.log('Success');
  } catch (err) {
    console.error('Error:', err);
  }
}
test();
