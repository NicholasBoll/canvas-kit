const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const glob = require('glob');

glob('**/*.snapshot.ts', (err, paths) => {
  paths.forEach(fs.unlinkSync);
})
