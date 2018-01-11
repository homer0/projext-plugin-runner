const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLISHValidateCommand extends CLICommand {
  constructor(runnerFile, targets) {
    super();
    this.runnerFile = runnerFile;
    this.targets = targets;

    this.command = 'sh-validate [target]';
    this.description = 'Validate the arguments before the shelll executes the task';
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

  handle(target) {
    this.runnerFile.validate();
    return !this.runnerFile.exists() || this.targets.validate(target);
  }
}

const cliSHValidateCommand = provider((app) => {
  app.set('cliSHValidateCommand', () => new CLISHValidateCommand(
    app.get('runnerFile'),
    app.get('targets')
  ));
});

module.exports = {
  CLISHValidateCommand,
  cliSHValidateCommand,
};
