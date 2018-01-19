const { provider } = require('jimple');
/**
 * This service is the one that knows how to run a target, so it's in charge of generating the
 * shell commands for it.
 */
class Runner {
  /**
   * Class constructor.
   * @param {Boolean}    asPlugin   To check if Woopack is present or not
   * @param {PathUtils}  pathUtils  To create the path for the targets executables.
   * @param {RunnerFile} runnerFile To read the required information to run targets.
   * @param {Targets}    targets    To get the targets information.
   */
  constructor(asPlugin, pathUtils, runnerFile, targets) {
    /**
     * Whether Woopack is present or not.
     * @type {Boolean}
     */
    this.asPlugin = asPlugin;
    /**
     * A local reference for the `pathUtils` service.
     * @type {PathUtils}
     */
    this.pathUtils = pathUtils;
    /**
     * A local reference for the `runnerFile` service.
     * @type {RunnerFile}
     */
    this.runnerFile = runnerFile;
    /**
     * A local reference for the `targets` service.
     * @type {Targets}
     */
    this.targets = targets;
  }
  /**
   * Get the shell execution commands for running a target.
   * @param {String}  targetName         The name of the target to run.
   * @param {Boolean} production         In case Woopack is present, this flag forces the runner
   *                                     to build the target for production and run that build.
   * @param {String}  runAsPluginCommand In case `production` is `true`, the plugin will first run
   *                                     a build command in order to update the runner file with
   *                                     the latest information and then it will run this command,
   *                                     to inform the plugin that the build is ready and that just
   *                                     needs to execute it.
   * @return {String}
   */
  getCommands(targetName, production, runAsPluginCommand) {
    let commands;
    // If Woopack is present...
    if (this.asPlugin) {
      // ..get the commands to run with Woopack.
      commands = this.getCommandsForWoopack(targetName, production, runAsPluginCommand);
    } else {
      // ...otherwise, get the target information.
      const target = this.targets.getTarget(targetName);
      // Get the commands to run on a production environment.
      commands = this.getCommandsForProduction(target);
    }
    // Push all the commands in to a single string.
    return commands.join(';');
  }
  /**
   * Get the commands to run a target production build. This needs to be called after a build is
   * made.
   * @param {String} targetName The name of the target to run.
   * @return {String}
   */
  getPluginCommandsForProduction(targetName) {
    // Get the target information.
    const target = this.targets.getTarget(targetName);
    // Get the commands to run without Woopack.
    const commands = this.getCommandsForProduction(target);
    // Push all the commands in to a single string.
    return commands.join(';');
  }
  /**
   * Get the list of comands to run a target with Woopack.
   * @param {String}  targetName         The name of the target to run.
   * @param {Boolean} production         Forces Woopack to use the production build.
   * @param {String}  runAsPluginCommand In case `production` is `true`, the plugin will first run
   *                                     a build command in order to update the runner file with
   *                                     the latest information and then it will run this command,
   *                                     to inform the plugin that the build is ready and that just
   *                                     needs to execute it.
   * @return {Array}
   */
  getCommandsForWoopack(targetName, production, runAsPluginCommand) {
    const commands = [];
    // If the target needs to use the production build...
    if (production) {
      // ...push the command to create a production build.
      commands.push(`woopack build ${targetName} --type production`);
      // Push the command to run the plugin again.
      commands.push(runAsPluginCommand);
    } else {
      // ...otherwise, get the environment variables to send.
      const variables = this.getEnvironmentVariables(this.runnerFile.read());
      // Push the command to the target with Woopack.
      commands.push(`${variables} woopack run ${targetName}`);
    }
    // Return the list of commands.
    return commands;
  }
  /**
   * Get the list of commands to run a target without Woopack present.
   * @param  {Target} target The target information.
   * @return {Array}
   */
  getCommandsForProduction(target) {
    // Get the information from the runner file.
    const runnerFileContents = this.runnerFile.read();
    // Get the environment variables.
    const variables = this.getEnvironmentVariables(runnerFileContents);
    // Get the executable it needs to use to run the target.
    const runWith = target.options.runWith || 'node';
    let execPath;
    // If Woopack is present...
    if (this.asPlugin) {
      /**
       * ...this means the user is running a production build, so set the execution file from
       * inside the project distribution directory.
       */
      execPath = this.pathUtils.join(
        runnerFileContents.directory,
        target.path
      );
    } else {
      // ...otherwise, just set the execution file that is on the target information.
      execPath = target.exec;
    }
    // Create the command.
    const command = `${variables} ${runWith} ${execPath}`;
    // Return the list of commands.
    return [command];
  }
  /**
   * Get a set of environment variables that will be sent to the executables.
   * For now is just the version of the project.
   * @param {Object} runnerFileContents The contents of the runner file.
   * @return {String}
   * @todo Refactor this. The variables should be configurable.
   */
  getEnvironmentVariables(runnerFileContents) {
    const names = {
      version: 'APP_VERSION',
    };

    return Object.keys(names)
    .map((name) => `${names[name]}=${runnerFileContents[name]}`)
    .join(' ');
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `Runner` as the `runner` service.
 * @example
 * // Register is on the container
 * container.register(runner);
 * // Getting access to the service instance
 * const runner = container.get('runner');
 * @type {Provider}
 */
const runner = provider((app) => {
  app.set('runner', () => new Runner(
    app.get('asPlugin'),
    app.get('pathUtils'),
    app.get('runnerFile'),
    app.get('targets')
  ));
});

module.exports = {
  Runner,
  runner,
};
