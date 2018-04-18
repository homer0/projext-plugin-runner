const { provider } = require('jimple');
/**
 * This service handles all interaction between the plugin and projext. It takes care of validating
 * if projext is installed, registering the necessary events and generating the build commands for
 * when the plugin is used on a development environment.
 */
class ProjextPlugin {
  /**
   * Class constructor.
   * @param {Object}     info       The plugin's `package.json`. The service uses it to get the
   *                                name and send it on the build commands as the `--plugin` flag.
   * @param {RunnerFile} runnerFile To be able to update the runner file when a target is built.
   */
  constructor(info, runnerFile) {
    /**
     * The name of the plugin as it's defined on the `package.json`. It's used on the generated
     * build command(s) as the `--plugin` option. The flag is verified by the plugin in order to
     * building dependencies (other targets) when a target is running on a development
     * environment.
     * @type {string}
     */
    this.pluginName = info.name;
    /**
     * A local reference for the `runnerFile` service.
     * @type {RunnerFile}
     */
    this.runnerFile = runnerFile;
    /**
     * The name of the option flag the service will add on the build commands.
     * @type {string}
     */
    this._pluginFlagName = 'plugin';
    /**
     * Whether or not projext is installed on the current environment.
     * @type {boolean}
     * @ignore
     * @access protected
     */
    this._installed = this._detectInstallation();
    /**
     * When running along side projext, when the plugin gets registered, this property will hold a
     * reference to the projext instance.
     * @type {?Projext}
     * @ignore
     * @access protected
     */
    this._instance = null;
  }
  /**
   * Check whether projext is installed or not.
   * @return {boolean}
   */
  isInstalled() {
    return this._installed;
  }
  /**
   * Register all the necessary events for the plugin to work:
   * - Update the target information on the runner file when the target build command is generated.
   * - Add the runner file to the list of files projext copies.
   * - Update the runner file version when the revision file is created.
   *
   * @param {Projext} instance The projext instance that is registering the plugin.
   */
  registerPlugin(instance) {
    this._setInstance(instance);
    const events = this.get('events');
    events.once('build-target-commands-list', (commands, target, type, run, unknownOptions) => (
      this._updateBuildCommands(commands, target, { type, run }, unknownOptions)
    ));

    events.once('project-files-to-copy', (list) => this._updateCopyList(list));
    events.once('revision-file-created', (version) => this._updateFileVersion(version));
  }
  /**
   * Get a service from projext.
   * @param {string} service The service name.
   * @return {*}
   * @throws {Error} If the plugin hasn't been registered.
   */
  get(service) {
    if (!this._instance) {
      throw new Error('You can\'t access projext services if the plugin is not installed');
    }

    return this._instance.get(service);
  }
  /**
   * Generate a projext build command for one or more targets.
   * @param {string|Array} target                    A target name or a list of them.
   * @param {Object}       [args={}]                 A dictionary of arguments and their values to
   *                                                 send on the command. If this dictionary
   *                                                 contains a `target` key, it will be ignored
   *                                                 and removed, since it's the one used to send
   *                                                 the target name this method uses as parameter.
   * @param {string}       [environmentVariables=''] Environment variables to prefix the command
   *                                                 with. For example: `NODE_ENV=production`.
   * @return {Array} No matter if you used a single (`string`) target or a list (`Array`), it will
   *                 always return a list (`Array`) of commands.
   */
  getBuildCommandForTarget(target, args = {}, environmentVariables = '') {
    const list = Array.isArray(target) ? target : [target];
    const newArgs = Object.assign({}, args);
    delete newArgs.target;
    const result = list
    .map((name) => this.getBuildCommand(Object.assign(
      { target: name },
      newArgs
    ), environmentVariables));

    return result;
  }
  /**
   * Generate a projext build command. If not overwritten by the `args` parameter, this method
   * sends an empty `target` and a `plugin` argument with the value of the `pluginName` property.
   * @param {Object} args                      A dictionary of arguments and their values to send
   *                                           on the command.
   * @param {string} [environmentVariables=''] Environment variables to prefix the command with.
   *                                           For example: `NODE_ENV=production`
   * @return {string}
   * @throws {Error} If projext is not installed and/or it couldn't access is instance.
   */
  getBuildCommand(args, environmentVariables = '') {
    this._loadInstalledInstanceIfNeeded();
    if (!this.isInstalled() || !this._instance) {
      throw new Error('You can\'t generate a build command if projext is not installed');
    }

    const env = environmentVariables ? `${environmentVariables} ` : '';
    /**
     * We need to access the main `cli` service in order to get the program name, since we are
     * accessing the build command without the CLI being triggered, so the command is not
     * registered on the program.
     */
    const program = this.get('cli').name;
    const command = this.get('cliBuildCommand').generate(Object.assign(
      {
        target: '',
        [this._pluginFlagName]: this.pluginName,
      },
      args
    )).trim();

    return `${env}${program} ${command}`;
  }
  /**
   * Set the projext instance.
   * @param {Projext} instance The projext instance accessed either from registering the plugin or
   *                           by requiring the module directly.
   */
  _setInstance(instance) {
    this._instance = instance;
  }
  /**
   * Get an instance of projext by requiring the module.
   * @return {?Projext} If something is wrong with the module or projext is not installed, it will
   *                    return `null`.
   */
  _getInstalledInstance() {
    let instance;
    try {
      // eslint-disable-next-line global-require
      instance = require('projext/index');
    } catch (ignore) {
      instance = null;
    }

    return instance;
  }
  /**
   * If projext is installed but the plugin wasn't registerd (probably because the plugin was
   * executed from its own CLI), this method will try to set the instance by requiring the module.
   */
  _loadInstalledInstanceIfNeeded() {
    if (this.isInstalled() && !this._instance) {
      this._setInstance(this._getInstalledInstance());
    }
  }
  /**
   * Detect whether or not projext is installed on the current environment.
   * @return {boolean}
   */
  _detectInstallation() {
    let installed = true;
    try {
      // eslint-disable-next-line global-require
      require('projext');
    } catch (ignore) {
      installed = false;
    }

    return installed;
  }
  /**
   * This method gets called when projext is creating the build commands for a target. It takes
   * care of updating the runner file with the target information and, if the target needs other
   * targes to be built first in order to run, injecting the commands for building those targets.
   * @param {Array}         commands       The list of commands projext uses to build and run the
   *                                       target.
   * @param {ProjextTarget} target         The target information.
   * @param {Object}        options        A dictionary with the options the original command
   *                                       received.
   * @param {string}        options.type   The required build type: `development` or `production`.
   * @param {Object}        unknownOptions Like `options`, this is also a dictionary of options
   *                                       the original command received, the difference is that
   *                                       these ones are unknown by the command, as they were
   *                                       probably injected by an event. In this case, the
   *                                       method checks if the plugin option the
   *                                       `getBuildCommand` method adds is present in order to
   *                                       determine whether it should add the build commands for
   *                                       the dependencies or not.
   * @return {Array} The updated list of commands.
   */
  _updateBuildCommands(commands, target, options, unknownOptions) {
    // Get the distribution directory path.
    const distPath = this.get('projectConfiguration').getConfig().paths.build;
    // Get the project version.
    const version = this.get('buildVersion').getVersion();
    // Save the target information on the runner file and get it once it's parsed.
    const targetInfo = this.runnerFile.update(target, version, distPath);
    // Define the list of commands that are going to be returned.
    let updatedCommands;
    /**
     * If the build command was ran from the plugin, the target type is `node` (a browser target
     * wouldn't return anything from `runnerFile.update`) and it needs other targets to be built
     * before running...
     */
    if (
      unknownOptions[this._pluginFlagName] === this.pluginName &&
      options.type === 'production' &&
      targetInfo &&
      targetInfo.options.build
    ) {
      // Get the commands for the other targets.
      const newCommands = this.getBuildCommandForTarget(targetInfo.options.build, Object.assign(
        {},
        options,
        unknownOptions
      ));
      // Push them first on the list of commands projext will run.
      updatedCommands = [
        ...newCommands,
        ...commands,
      ];
    } else {
      // ...otherwise, keep the list as it was received.
      updatedCommands = commands;
    }

    // Return the list of commands for projext to run.
    return updatedCommands;
  }
  /**
   * This method gets called when projext is copying the project files to the distribution
   * directory. It just adds the runner file to the list and returns it.
   * @param {Array} list The list of files projext is going to copy.
   * @return {Array} An updated list of files, with the runner file on it.
   */
  _updateCopyList(list) {
    return [
      ...list,
      this.runnerFile.getFilename(),
    ];
  }
  /**
   * This method gets called when projext is generating a revision file and it takes care of
   * updating the runner file with the generated version.
   * @param {string} version The new version for the revision file.
   */
  _updateFileVersion(version) {
    this.runnerFile.updateVersion(version);
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `ProjextPlugin` as the `projextPlugin` service.
 * @example
 * // Register it on the container
 * container.register(projextPlugin);
 * // Getting access to the service instance
 * const projextPlugin = container.get('projextPlugin');
 * @type {Provider}
 */
const projextPlugin = provider((app) => {
  app.set('projextPlugin', () => new ProjextPlugin(
    app.get('info'),
    app.get('runnerFile')
  ));
});

module.exports = {
  ProjextPlugin,
  projextPlugin,
};
