let level = 0;

const noop = () => {}

global.before = global.beforeEach = global.after = global.afterEach = global.context = noop

global.describe = global.context = (description, fn) => {

  level++;
  console.log(format(description, level));
  fn();
  level--;
}

global.it = (description) => {
  level++;
  console.log(format(description, level));
  level--;
}

function format(str, level) {
  return `${' '.repeat((level - 1) * 2)} * ${str}`
}

const test = require('../cypress/integration/Button.spec')
