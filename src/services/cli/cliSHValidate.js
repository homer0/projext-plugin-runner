const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is a private command the shell script executes before running the run command in order to
 * validate the arguments and throw any necessary error. The reason we do this in two separated
 * commands is that the shell script takes all the output of the run command and tries to execute
 * it, so we can't include execptions in there.
 * @extends {CLICommand}
 */
class CLISHValidateCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {RunnerFile}    runnerFile    To validate if the file exists or not.
   * @param {Targets}       targets       To validate if a target exists or not.
   * @param {ProjextPlugin} projextPlugin To check if projext is present or not.
   */
  constructor(runnerFile, targets, projextPlugin) {
    super();
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
    /**
     * A local reference for the `projextPlugin` service.
     * @type {ProjextPlugin}
     */
    this.projextPlugin = projextPlugin;
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'sh-validate [target]';
    /**
     * A description of the command, just to follow the interface as the command won't show up on
     * the help interface.
     * @type {string}
     */
    this.description = 'Validate the arguments before the shelll executes the task';
    this.addOption(
      'production',
      '-p, --production',
      'Force the runner to use a production build even if projext is present',
      false
    );
    this.addOption(
      'ready',
      '-r, --ready',
      'Private flag to indicate that a production build was made',
      false
    );
    /**
     * Hide the command from the help interface.
     * @type {Boolean}
     */
    this.hidden = true;
  }
  /**
   * Handle the execution of the command and validate all the arguments.
   * @param {?string} target The name of the target.
   */
  handle(target) {
    // First, let's detect if the runner file exists.
    const exists = this.runnerFile.exists();
    // If projext is not present and the file doesn't exist, there's nothing the plugin can do.
    if (!this.projextPlugin.isInstalled() && !exists) {
      throw new Error('The runner file doesn\'t exist and projext is not present');
    }
    /**
     * Then, if the runner file exists, validate the target, otherwise, we'll assume this is
     * running with projext present and the file is going to be generated on build.
     */
    return !exists || this.targets.validate(target);
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLISHValidateCommand` as the `cliSHValidateCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliSHValidateCommand);
 * // Getting access to the service instance
 * const cliSHValidateCommand = container.get('cliSHValidateCommand');
 * @type {Provider}
 */
const cliSHValidateCommand = provider((app) => {
  app.set('cliSHValidateCommand', () => new CLISHValidateCommand(
    app.get('runnerFile'),
    app.get('targets'),
    app.get('projextPlugin')
  ));
});

module.exports = {
  CLISHValidateCommand,
  cliSHValidateCommand,
};
