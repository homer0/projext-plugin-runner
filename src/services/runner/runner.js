const { provider } = require('jimple');

class Runner {
  constructor(asPlugin, pathUtils, runnerFile, targets) {
    this.asPlugin = asPlugin;
    this.pathUtils = pathUtils;
    this.runnerFile = runnerFile;
    this.targets = targets;
  }

  getCommands(targetName, production, runAsPluginCommand) {
    const target = this.targets.getTarget(targetName);
    const commands = this.asPlugin ?
      this.getCommandsForWoopack(target, production, runAsPluginCommand) :
      this.getCommandsForProduction(target);

    return commands.join(';');
  }

  getPluginCommandsForProduction(targetName) {
    const target = this.targets.getTarget(targetName);
    const commands = this.getCommandsForProduction(target, true);

    return commands.join(';');
  }

  getCommandsForWoopack(target, production, runAsPluginCommand) {
    const commands = [];
    if (production) {
      commands.push(`woopack build ${target.name} --type production`);
      commands.push(runAsPluginCommand);
    } else {
      commands.push(`woopack run ${target.name}`);
    }

    return commands;
  }

  getCommandsForProduction(target) {
    const runWith = target.options.runWith || 'node';
    let execPath;
    if (this.asPlugin) {
      execPath = this.pathUtils.join(
        this.runnerFile.read().directory,
        target.path
      );
    } else {
      execPath = target.exec;
    }

    const command = `${runWith} ${execPath}`;
    return [command];
  }
}

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
