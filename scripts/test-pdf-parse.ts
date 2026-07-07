import pdfParse from 'pdf-parse';

async function test() {
  console.log('Testing pdf-parse...');
  try {
    const data = await pdfParse(Buffer.from(''));
    console.log('Success:', data.text);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
