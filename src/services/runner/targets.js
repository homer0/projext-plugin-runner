const fs = require('fs-extra');
const { provider } = require('jimple');
/**
 * This service is in charge of providing and validating the targets stored on the runner file.
 */
class Targets {
  /**
   * Class constructor.
   * @param {boolean}    asPlugin    To check if projext is present or not
   * @param {Object}     packageInfo The project's `package.json`, necessary to get the project's
   *                                 name and use it as the name of the default target.
   * @param {PathUtils}  pathUtils   To create the targets exeuction paths.
   * @param {RunnerFile} runnerFile  To get the targets information.
   */
  constructor(asPlugin, packageInfo, pathUtils, runnerFile) {
    /**
     * Whether projext is present or not.
     * @type {boolean}
     */
    this.asPlugin = asPlugin;
    /**
     * The information of the project's `package.json`.
     * @type {Object}
     */
    this.packageInfo = packageInfo;
    /**
     * A local reference for the `pathUtils` service.
     * @type {PathUtils}
     */
    this.pathUtils = pathUtils;
    /**
     * A local reference for the `runnerFile` service.
     * @type {RunnerFile}
     */
    this.runnerFile = runnerFile;
  }
  /**
   * Get a target information by its name.
   * @param {string} name The target name.
   * @return {Target}
   * @throws {Error} If the target information is not on the runner file.
   */
  getTarget(name) {
    const target = this.runnerFile.read().targets[name];
    if (!target) {
      throw new Error(
        'The target information is not on the runner file, you first ned to build it'
      );
    }

    return this._normalizeTarget(target);
  }
  /**
   * Returns the target with the name of project (specified on the `package.json`) and if there's
   * no target with that name, then the first one, using a list of the targets name on alphabetical
   * order.
   * @return {Target}
   * @throws {Error} If the project has no targets
   */
  getDefaultTarget() {
    const { targets } = this.runnerFile.read();
    const names = Object.keys(targets).sort();
    let target;
    if (names.length) {
      const { name: projectName } = this.packageInfo;
      target = targets[projectName] || targets[names[0]];
    } else {
      throw new Error('The project doesn\'t have any targets or none has been built yet');
    }

    return this._normalizeTarget(target);
  }
  /**
   * Validate a target information.
   * @param  {?string} name The target name.
   * @return {boolean}
   * @throws {Error} If the runner file doesn't exist.
   * @throws {Error} If the target executable doesn't exist.
   */
  validate(name) {
    // Only validate the target if the plugin is on a production environment.
    if (!this.asPlugin) {
      // Check if the runner file exists.
      if (!this.runnerFile.exists()) {
        throw new Error('The runner file doesn\'t exist, you first need to build a target');
      }

      const target = name ? this.getTarget(name) : this.getDefaultTarget();
      // Check if the target executable exists.
      if (!fs.pathExistsSync(target.exec)) {
        throw new Error(`The target executable doesn't exist: ${target.exec}`);
      }
    }

    return true;
  }
  /**
   * Add the execution path (`exec`) to a {@link Target}.
   * @param {Target} target The target for which the execution path will be generated for.
   * @return {Target}
   */
  _normalizeTarget(target) {
    return Object.assign({
      exec: this.pathUtils.join(target.path),
    }, target);
  }
}
/**
 * The service provider that once registered on the app container will set an instance of
 * `Targets` as the `targets` service.
 * @example
 * // Register it on the container
 * container.register(targets);
 * // Getting access to the service instance
 * const targets = container.get('targets');
 * @type {Provider}
 */
const targets = provider((app) => {
  app.set('targets', () => new Targets(
    app.get('asPlugin'),
    app.get('packageInfo'),
    app.get('pathUtils'),
    app.get('runnerFile')
  ));
});

module.exports = {
  Targets,
  targets,
};
