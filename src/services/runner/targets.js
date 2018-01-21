const fs = require('fs-extra');
const { provider } = require('jimple');
/**
 * This service is in charge of providing and validating the targets stored on the runner file.
 */
class Targets {
  /**
   * Class constructor.
   * @param {Boolean}    asPlugin   To check if Woopack is present or not
   * @param {PathUtils}  pathUtils  To create the targets exeuction paths.
   * @param {RunnerFile} runnerFile To get the targets information.
   */
  constructor(asPlugin, pathUtils, runnerFile) {
    /**
     * Whether Woopack is present or not.
     * @type {Boolean}
     */
    this.asPlugin = asPlugin;
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
   * @param  {String} name The target name.
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

    return Object.assign({
      exec: this.pathUtils.join(target.path),
    }, target);
  }
  /**
   * Validate a target information.
   * @param  {String} name The target name.
   * @return {Boolean}
   * @throws {Error} If the runner file doesn't exist.
   * @throws {Error} If the target type is not Node.
   * @throws {Error} If the target executable doesn't exist.
   */
  validate(name) {
    // Only validate the target if the plugin is on a production environment.
    if (!this.asPlugin) {
      // Check if the runner file exists.
      if (!this.runnerFile.exists()) {
        throw new Error('The runner file doesn\'t exist, you first need to build a target');
      }

      const target = this.getTarget(name);
      // Check if the target type is Node.
      if (!target.node) {
        throw new Error(`${name} is not a Node target, it can't be used with the runner`);
      }

      // Check if the target executable exists.
      if (!fs.pathExistsSync(target.exec)) {
        throw new Error(`The target executable doesn't exist: ${target.exec}`);
      }
    }

    return true;
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
    app.get('pathUtils'),
    app.get('runnerFile')
  ));
});

module.exports = {
  Targets,
  targets,
};
