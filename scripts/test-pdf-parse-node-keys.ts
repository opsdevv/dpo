async function test() {
  const mod = await import('pdf-parse/node');
  console.log('Keys of pdf-parse/node:', Object.keys(mod));
  if (mod.default) {
    console.log('Keys of default:', Object.keys(mod.default));
  }
}
test();
