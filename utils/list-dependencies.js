const fs = require('fs');
const path = require('path');

const packages = fs.readdirSync('modules');

const dependencies = new Map();
const peerDependencies = new Map();
packages.forEach(package => {
  console.log(`Processing ${package}`);

  (['react', 'css', '']).forEach(type => {
    let pkg = {}
    try {
      pkg = require(path.resolve('modules', package, type, 'package.json'));
    } catch (e) {
      // don't care
    }
    if (pkg.dependencies) {
      Object.keys(pkg.dependencies).forEach(d => dependencies.set(d, (dependencies.get(d) || new Set()).add(pkg.dependencies[d])));
    }
    if (pkg.peerDependencies) {
      Object.keys(pkg.peerDependencies).forEach(d => peerDependencies.set(d, (peerDependencies.get(d) || new Set()).add(pkg.peerDependencies[d])));
    }
    console.log(type, pkg.dependencies, pkg.peerDependencies)
  })
});

/**
 *
 * @param {Map} fullMap
 */
function getExternalDependencies(fullMap) {
  const external = new Map();
  const localKeys = Array.from(fullMap.keys()).filter(k => !k.startsWith('@workday'));
  localKeys.forEach(k => { external.set(k, fullMap.get(k))});

  return external;
}
console.log('dependencies', getExternalDependencies(dependencies));
console.log('peerDependencies', getExternalDependencies(peerDependencies));
