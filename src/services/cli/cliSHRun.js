const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLISHRunCommand extends CLICommand {
  constructor(runner) {
    super();

    this.runner = runner;

    this.command = 'sh-run [target]';
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
    this.hidden = true;
  }

  handle(target, command, options) {
    const { production, ready } = options;
    let commands;
    if (ready) {
      commands = this.runner.getPluginCommandsForProduction(target);
    } else {
      const runPluginProduction = `${this.cliName} ${target} --production --ready`;
      commands = this.runner.getCommands(target, production, runPluginProduction);
    }

    this.output(commands);
  }
}

const cliSHRunCommand = provider((app) => {
  app.set('cliSHRunCommand', () => new CLISHRunCommand(
    app.get('runner')
  ));
});

module.exports = {
  CLISHRunCommand,
  cliSHRunCommand,
};
