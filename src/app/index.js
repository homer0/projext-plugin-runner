const Jimple = require('jimple');
const appPackage = require('../../package.json');

const {
  environmentUtils,
  errorHandler,
  appLogger,
  packageInfo,
  pathUtils,
} = require('wootils/node/providers');

class WoopackRunner extends Jimple {
  constructor() {
    super();

    this.set('info', () => appPackage);

    this.register(environmentUtils);
    this.register(errorHandler);
    this.register(appLogger);
    this.register(packageInfo);
    this.register(pathUtils);
  }

  plugin(woopack) {
    const events = woopack.get('events');
    events.once('build-target-commands-list', (commands, target) => {
      const projectConfiguration = woopack.get('projectConfiguration');
      const versionUtils = woopack.get('versionUtils');

      const {
        version: {
          revisionFilename,
        },
        paths: {
          build,
        },
      } = projectConfiguration;
      const version = versionUtils.getVersion(revisionFilename);

      this.get('runnerFile').update(target, version, build);
      return commands;
    });
  }
}

module.exports = WoopackRunner;
