const runner = require('../index');
/**
 * This is the method called by projext when loading the plugin and it takes care of calling
 * the instance of the runner and using it to register on projext.
 * @param {Projext} app The projext main container.
 * @ignore
 */
const loadPlugin = (app) => runner.plugin(app);

module.exports = loadPlugin;
