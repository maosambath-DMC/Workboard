const fs = require('fs');
const path = require('path');
const git = require('isomorphic-git');

async function main() {
  const dir = path.resolve(__dirname, '..');
  
  // 1. Init if needed
  const gitDir = path.join(dir, '.git');
  if (!fs.existsSync(gitDir)) {
    console.log('Initializing git repository...');
    await git.init({ fs, dir });
  } else {
    console.log('Git repository already initialized.');
  }

  // 2. Set remote origin
  const remotes = await git.listRemotes({ fs, dir });
  const hasOrigin = remotes.some(r => r.remote === 'origin');
  if (!hasOrigin) {
    await git.addRemote({
      fs,
      dir,
      remote: 'origin',
      url: 'https://github.com/maosambath-DMC/Workboard.git'
    });
    console.log('Added remote origin: https://github.com/maosambath-DMC/Workboard.git');
  }

  // 3. Scan files to ensure no risky files (node_modules, dist, .env) are staged
  const filesToStage = [
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'vite.config.ts',
    'index.html',
    '.oxlintrc.json',
    '.gitignore',
    'README.md',
    'firebase.json',
    '.firebaserc'
  ];

  function collectFiles(subDir) {
    const fullPath = path.join(dir, subDir);
    if (!fs.existsSync(fullPath)) return;
    const entries = fs.readdirSync(fullPath, { withFileTypes: true });
    for (const entry of entries) {
      const rel = path.join(subDir, entry.name);
      if (entry.isDirectory()) {
        collectFiles(rel);
      } else {
        filesToStage.push(rel);
      }
    }
  }

  collectFiles('public');
  collectFiles('src');

  console.log(`Audited ${filesToStage.length} files to commit.`);
  
  // Verify safety
  const forbidden = filesToStage.filter(f => 
    f.includes('node_modules') || 
    f.includes('dist') || 
    f.includes('.env') || 
    f.includes('.DS_Store')
  );
  if (forbidden.length > 0) {
    console.error('BLOCKED: Forbidden files detected:', forbidden);
    process.exit(1);
  }

  // 4. Stage files
  for (const file of filesToStage) {
    await git.add({ fs, dir, filepath: file });
  }
  console.log('All project files staged successfully.');

  // 5. Commit
  const sha = await git.commit({
    fs,
    dir,
    message: 'V1 class prototype',
    author: {
      name: 'Mao Sambath',
      email: 'maosambath@users.noreply.github.com'
    }
  });

  console.log('Committed successfully with SHA:', sha);
}

main().catch(err => {
  console.error('Error running git ops:', err);
  process.exit(1);
});
