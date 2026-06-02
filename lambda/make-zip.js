const fs = require('fs');
const path = require('path');

// Create a simple zip manually using Node
const archiver = require('archiver').default || require('archiver');

const output = fs.createWriteStream('form-critic-lambda.zip');
const archive = archiver('zip', { zlib: { level: 9 } });

const create_archive = archiver('zip', { zlib: { level: 9 } });

create_archive.on('error', err => {
  console.error('Error creating archive:', err);
  process.exit(1);
});

output.on('close', () => {
  console.log('Zip file created:', archive.pointer(), 'bytes');
});

archive.pipe(output);
archive.file('dist/index.js', { name: 'index.js' });
archive.directory('node_modules/', 'node_modules');
archive.finalize();
