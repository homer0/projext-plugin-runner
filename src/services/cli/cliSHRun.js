const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLISHRunCommand extends CLICommand {
  constructor(appLogger, runner) {
    super();
    this.appLogger = appLogger;
    this.runner = runner;

    this.command = 'sh-run [target]';
    this.description = 'Get the commands for the shell program to execute';
    this.addOption(
      'production',
      '-p, --production',
      'Force the runner to use a production build even if Woopack is present',
      false
    );
    this.hidden = true;
  }

  handle(target, command, options) {
    const { production } = options;
    const commands = this.runner.getCommands(target, production);
    this.output(commands);
  }
}

const cliSHRunCommand = provider((app) => {
  app.set('cliSHRun', () => new CLISHRunCommand(
    app.get('appLogger'),
    app.get('runner')
  ));
});

module.exports = {
  CLISHRunCommand,
  cliSHRunCommand,
};
