const fs = require('fs-extra');
const { provider } = require('jimple');

class Targets {
  constructor(asPlugin, pathUtils, runnerFile) {
    this.asPlugin = asPlugin;
    this.pathUtils = pathUtils;
    this.runnerFile = runnerFile;
  }

  getTarget(name) {
    const target = this.runnerFile.read().targets[name];
    if (!target) {
      throw new Error(
        'The target information is not on the runner file, you first ned to build it'
      );
    }

    return Object.assign({
      exec: this.pathUtils.join(target.path),
    }, target);
  }

  validate(name) {
    if (!this.asPlugin) {
      if (!this.runnerFile.exists()) {
        throw new Error('The runner file doesn\'t exist, you first need to build a target');
      }

      const target = this.getTarget(name);

      if (!target.node) {
        throw new Error(`${name} is not a Node target, it can't be used with the runner`);
      }

      if (!fs.pathExistsSync(target.exec)) {
        throw new Error(`The target executable doesn't exist: ${target.exec}`);
      }
    }

    return true;
  }
}

const targets = provider((app) => {
  app.set('targets', () => new Targets(
    app.get('asPlugin'),
    app.get('pathUtils'),
    app.get('runnerFile')
  ));
});

module.exports = {
  Targets,
  targets,
};
