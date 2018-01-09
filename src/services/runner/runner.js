const { provider } = require('jimple');

class Runner {
  constructor(asPlugin, runnerFile, targets) {
    this.asPlugin = asPlugin;
    this.runnerFile = runnerFile;
    this.targets = targets;
  }

  getCommands(targetName, production) {
    const target = this.targets.getTarget(targetName);
    const commands = this.asPlugin ?
      this.getCommandsForWoopack(target, production) :
      this.getCommandsForProduction(target);

    return commands.join(';');
  }

  getCommandsForWoopack(target, production) {
    const type = production ? 'production' : 'development';
    const command = `woopack run ${target.name} --type ${type}`;
    return [command];
  }

  getCommandsForProduction(target) {
    const runWith = target.options.runWith || 'node';
    const command = `${runWith} ${target.exec}`;
    return [command];
  }
}

const runner = provider((app) => {
  app.set('runner', () => new Runner(
    app.get('asPlugin'),
    app.get('runnerFile'),
    app.get('targets')
  ));
});

module.exports = {
  Runner,
  runner,
};
