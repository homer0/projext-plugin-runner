const path = require('path');
const { ProjextRunner } = require('./src/app');

let runner;
try {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  runner = require(path.join(process.cwd(), 'projext.runner.js'));
} catch (e) {
  runner = new ProjextRunner();
}

module.exports = runner;
