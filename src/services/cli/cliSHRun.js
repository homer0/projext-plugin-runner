const { provider } = require('jimple');
const CLICommand = require('../../abstracts/cliCommand');
/**
 * This is private command the shell script executes in order to get a list of commands to run.
 * @extends {CLICommand}
 */
class CLISHRunCommand extends CLICommand {
  /**
   * Class constructor.
   * @param {Runner} runner The service tha provides the commands to run.
   */
  constructor(runner) {
    super();
    /**
     * A local reference for the `runner` service.
     * @type {Runner}
     */
    this.runner = runner;
    /**
     * The instruction needed to trigger the command.
     * @type {string}
     */
    this.command = 'sh-run [target]';
    /**
     * A description of the command, just to follow the interface as the command won't show up on
     * the help interface.
     * @type {string}
     */
    this.description = 'Get the commands for the shell program to execute';
    this.addOption(
      'production',
      '-p, --production',
      'Force the runner to use a production build even if Woopack is present',
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
     * @type {boolean}
     */
    this.hidden = true;
  }
  /**
   * Handle the execution of the command and outputs the list of commands to run.
   * @param {string}  target             The name of the target to run.
   * @param {Command} command            The executed command (sent by `commander`).
   * @param {Object}  options            The command options.
   * @param {string}  options.production If the user wants to run a production build, even with
   *                                     Woopack preset.
   * @param {boolean} options.ready      If the user used the `production` option, then the list
   *                                     of commands will be: one to build the target for
   *                                     production and one to run this command again, because if
   *                                     a build is going to happen, there's no way to be sure
   *                                     the runner file is up to date.
   *                                     This option basically says 'The production build is ready
   *                                     and the runner file is updated, now is ok to execute it'.
   */
  handle(target, command, options) {
    // Get the optins.
    const { production, ready } = options;
    // Define the commands variable that the method will output.
    let commands;
    /**
     * If this is the second time the command is executed, with the intention of running a
     * production build...
     */
    if (ready) {
      // ...get the commands to execute the production build.
      commands = this.runner.getPluginCommandsForProduction(target);
    } else {
      // ...otherwise, generate the command to run this for a second time.
      const runPluginProduction = `${this.cliName} ${target} --production --ready`;
      // Get the list of commands from the runner service.
      commands = this.runner.getCommands(target, production, runPluginProduction);
    }
    // Output the list of commands
    this.output(commands);
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `CLISHRunCommand` as the `cliSHRunCommand` service.
 * @example
 * // Register it on the container
 * container.register(cliSHRunCommand);
 * // Getting access to the service instance
 * const cliSHRunCommand = container.get('cliSHRunCommand');
 * @type {Provider}
 */
const cliSHRunCommand = provider((app) => {
  app.set('cliSHRunCommand', () => new CLISHRunCommand(
    app.get('runner')
  ));
});

module.exports = {
  CLISHRunCommand,
  cliSHRunCommand,
};
