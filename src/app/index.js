const Jimple = require('jimple');
const appPackage = require('../../package.json');

const {
  environmentUtils,
  errorHandler,
  appLogger,
  packageInfo,
  pathUtils,
} = require('wootils/node/providers');

const {
  cliWithName,
  cliSHRunCommand,
  cliSHValidateCommand,
} = require('../services/cli');

const {
  runnerFile,
  runner,
  targets,
} = require('../services/runner');

const { projextPlugin } = require('../services/utils');
/**
 * This is the plugin own dependency injection cotainer. Different from most of the other plugins,
 * this one is a little bit more complex as it is prepare to run with and without projext present.
 * @extends {Jimple}
 */
class ProjextRunner extends Jimple {
  /**
   * Registers all the known services and add an error handler.
   * @ignore
   */
  constructor() {
    super();

    this.set('info', () => appPackage);

    this.register(environmentUtils);
    this.register(errorHandler);
    this.register(appLogger);
    this.register(packageInfo);
    this.register(pathUtils);

    this.register(cliWithName(appPackage.cliName));
    this.register(cliSHRunCommand);
    this.register(cliSHValidateCommand);

    this.register(runnerFile);
    this.register(runner);
    this.register(targets);

    this.register(projextPlugin);

    this._addErrorHandler();
  }
  /**
   * This is called when projext is present and tries to load the plugin. It will call the service
   * that handles all interaction with projext and that will take care of registering the necessary
   * events to maintain the runner file updated.
   * @param {Projext} projext The projext main container.
   */
  plugin(projext) {
    this.get('projextPlugin').registerPlugin(projext);
  }
  /**
   * Starts the plugin CLI interface.
   */
  cli() {
    this.get('cli').start([
      this.get('cliSHRunCommand'),
      this.get('cliSHValidateCommand'),
    ]);
  }
  /**
   * Makes the `errorHandler` service listen for any uncaught exceptions the plugin may throw.
   * @ignore
   * @access protected
   */
  _addErrorHandler() {
    this.get('errorHandler').listen();
  }
}

module.exports = { ProjextRunner };
