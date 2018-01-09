const { provider } = require('jimple');
const CLICommand = require('../../interfaces/cliCommand');

class CLISHValidateCommand extends CLICommand {
  constructor(appLogger, runnerFile, targets) {
    super();
    this.appLogger = appLogger;
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
    this.hidden = true;
  }

  handle(target) {
    this.runnerFile.validate();
    return !this.runnerFile.exists() || this.targets.validate(target);
  }
}

const cliSHValidateCommand = provider((app) => {
  app.set('cliSHValidate', () => new CLISHValidateCommand(
    app.get('appLogger'),
    app.get('runnerFile'),
    app.get('targets')
  ));
});

module.exports = {
  CLISHValidateCommand,
  cliSHValidateCommand,
};
