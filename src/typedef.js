/**
 * @external {Jimple}
 * https://yarnpkg.com/en/package/jimple
 */

/**
 * @external {Projext}
 * https://homer0.github.io/projext/class/src/app/index.js~Projext.html
 */

/**
 * @external {Command}
 * https://tj.github.io/commander.js/#Command
 */

/**
 * @external {PathUtils}
 * https://homer0.github.io/wootils/class/wootils/node/pathUtils.js~PathUtils.html
 */

/**
 * @typedef {Object} Target
 * @property {string} name
 * The target name.
 * @property {string} path
 * The path to the target execution file.
 * @property {boolean} node
 * Whether the target type is `node` or not.
 * @property {Object} options
 * The options to customize the target that will be taken from the projext target `runnerOptions`
 * setting.
 * @property {?string} exec
 * The absolute path to the executable file. This is generated on runtime when the file is loaded,
 * not before.
 */

/**
 * @typedef {Object} RunnerFileContents
 * @property {string} runnerVersion
 * The version of the plugin that generated the file.
 * @property {string} version
 * The project version.
 * @property {string} diretory
 * The project distribution directory.
 * @property {Object} targets
 * A dictionary with the {@link Target}s information.
 */

/**
 * @typedef {function} ProviderRegisterMethod
 * @param {Jimple} app
 * A reference to the dependency injection container.
 */

/**
 * @typedef {Object} Provider
 * @property {ProviderRegisterMethod} register
 * The method that gets called when registering the provider.
 */
