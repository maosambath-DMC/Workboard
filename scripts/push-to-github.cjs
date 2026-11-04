const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');

async function push(token) {
  const dir = path.resolve(__dirname, '..');
  console.log('Pushing main branch to https://github.com/maosambath-DMC/Workboard.git ...');

  const pushResult = await git.push({
    fs,
    http,
    dir,
    remote: 'origin',
    ref: 'main',
    onAuth: () => ({
      username: token,
      password: ''
    })
  });

  console.log('Push result:', pushResult);
}

const token = process.argv[2];
if (!token) {
  console.error('Usage: node scripts/push-to-github.cjs <GITHUB_TOKEN>');
  process.exit(1);
}

push(token).catch(err => {
  console.error('Push failed:', err.message);
  process.exit(1);
});
