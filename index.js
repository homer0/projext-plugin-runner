const path = require('path');
const { WoopackRunner } = require('./src/app');

let runner;
try {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  runner = require(path.join(process.cwd(), 'woopack.runner.js'));
} catch (e) {
  runner = new WoopackRunner();
}

module.exports = runner;
