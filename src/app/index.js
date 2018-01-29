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

const { asPlugin } = require('../services/utils');
/**
 * This is the plugin own dependency injection cotainer. Different from most of the other plugins,
 * this one is a little bit more complex as it is prepare to run with and without Woopack present.
 * @extends {Jimple}
 */
class WoopackRunner extends Jimple {
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

    this.register(asPlugin);

    this._addErrorHandler();
  }
  /**
   * This is called when Woopack is present and tries to load the plugin. It will add events
   * listeners so every time Woopack builds a target or creates a revision file, the runner file
   * will be updated. It also adds a listener for when Woopack copies the projects files so it
   * will include the runner file.
   * @param {Woopack} woopack The Woopack main container.
   */
  plugin(woopack) {
    // Get the events service.
    const events = woopack.get('events');
    // Adds the listener for when targets are built.
    events.once('build-target-commands-list', (commands, target) => {
      // Get the distribution directory path.
      const distPath = woopack.get('projectConfiguration').getConfig().paths.build;
      // Get the project version.
      const version = woopack.get('buildVersion').getVersion();

      // Update the runner file.
      this.get('runnerFile').update(target, version, distPath);
      /**
       * Return the received commands. This is an reducer event, but there is no need for any
       * update.
       */
      return commands;
    });
    // Adds the listener that includes the runner file on the list of files Woopack copies.
    events.once('project-files-to-copy', (list) => [
      ...list,
      this.get('runnerFile').getFilename(),
    ]);
    /**
     * Adds the listner that updates the version on the runner file when the revision file
     * is created
     */
    events.once('revision-file-created', (version) => {
      this.get('runnerFile').updateVersion(version);
    });
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

module.exports = { WoopackRunner };
