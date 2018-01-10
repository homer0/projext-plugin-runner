const path = require('path');
const extend = require('extend');
const fs = require('fs-extra');
const { provider } = require('jimple');

class RunnerFile {
  constructor(asPlugin, info, pathUtils) {
    this.asPlugin = asPlugin;
    this.pathUtils = pathUtils;
    this.filename = '.woopackrunner';
    this.filepath = this.pathUtils.join(this.filename);
    this.fileTemplate = {
      runnerVersion: info.version,
      version: 'unknown',
      directory: '',
      targets: {},
    };
  }

  setFilename(newName) {
    this.filename = newName;
  }

  getFilename() {
    return this.filename;
  }

  exists() {
    return fs.pathExistsSync(this.filepath);
  }

  update(target, version, directory) {
    const file = this.read();
    file.version = version;
    file.directory = directory;

    let targetPath = '';
    const { build } = target.folders;
    if (build === directory) {
      targetPath = './';
    } else {
      targetPath = build.substr(directory.length);
      if (targetPath.startsWith('/')) {
        targetPath = targetPath.substr(1);
      }
    }

    const targetExec = target.bundle ? `${target.name}.js` : target.entry.production;
    const targetExecPath = path.join(targetPath, targetExec);

    file.targets[target.name] = {
      name: target.name,
      path: targetExecPath,
      node: target.is.node,
      options: target.runnerOptions || {},
    };

    return fs.writeJson(this.filepath, file);
  }

  read() {
    let result;
    if (this.exists()) {
      result = fs.readJsonSync(this.filepath);
    } else {
      fs.writeJsonSync(this.filepath, this.fileTemplate);
      result = extend(true, {}, this.fileTemplate);
    }

    return result;
  }

  validate() {
    if (!this.asPlugin && !this.exists()) {
      throw new Error('The runner file doesnt exist and Woopack is not present');
    }
  }
}

const runnerFile = provider((app) => {
  app.set('runnerFile', () => new RunnerFile(
    app.get('asPlugin'),
    app.get('info'),
    app.get('pathUtils')
  ));
});

module.exports = {
  RunnerFile,
  runnerFile,
};
