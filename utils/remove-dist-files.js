const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const packages = fs.readdirSync('modules');

packages.forEach(package => {
  console.log(`Processing ${package}`);

  (['react', 'css', '']).forEach(type => {
    if (fs.existsSync(path.resolve('modules', package, type, 'dist'))) {
      rimraf.sync(path.resolve('modules', package, type, 'dist'));
    }

    if (fs.existsSync(path.resolve('modules', package, type, '.build-info'))) {
      rimraf.sync(path.resolve('modules', package, type, '.build-info'));
    }
  })
});
