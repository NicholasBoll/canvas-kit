const fs = require('fs');
const util = require('util');
const path = require('path');
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const getSpecifications = require('./get-specifications');

getSpecifications().then(async specs => {
  const contents = `module.exports = {specifications: ${JSON.stringify(specs, null, '  ')}};`;

  await mkdir(path.join(__dirname, '../dist/es6/lib'), {recursive: true});
  await writeFile(path.join(__dirname, '../dist/es6/lib/specs.js'), contents);
});
