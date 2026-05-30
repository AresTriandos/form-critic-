const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Use system tar if available, otherwise try other methods
try {
  execSync('tar --version', { stdio: 'ignore' });
  console.log('Creating zip with tar...');
  execSync('cd /data/.openclaw/workspace/form-critic-app/lambda && tar -czf form-critic-lambda.zip dist/index.js node_modules/', { stdio: 'inherit' });
  console.log('Created form-critic-lambda.zip');
} catch (e) {
  console.error('tar not available, trying another method...');
  process.exit(1);
}
