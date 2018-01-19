const runner = require('../index');
/**
 * This is the method called by Woopack when loading the plugin and it takes care of calling
 * the instance of the runner and using it to register on Woopack.
 * @param {Woopack} app The Woopack main container.
 * @ignore
 */
const loadPlugin = (app) => runner.plugin(app);

module.exports = loadPlugin;
