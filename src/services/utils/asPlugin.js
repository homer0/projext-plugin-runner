const { provider } = require('jimple');
/**
 * Checks whether or not projext is present on the environment.
 * @return {boolean}
 */
const asPlugin = () => {
  let projextExists = true;
  try {
    // eslint-disable-next-line global-require
    require('projext');
  } catch (ignore) {
    projextExists = false;
  }

  return projextExists;
};
/**
 * The service provider that once registered on the app container will set the result of
 * `asPlugin()` as the `asPlugin` service.
 * @example
 * // Register it on the container
 * container.register(asPluginProvider);
 * // Getting access to the service value
 * const asPlugin = container.get('asPlugin');
 * @type {Provider}
 */
const asPluginProvider = provider((app) => {
  app.set('asPlugin', () => asPlugin());
});

module.exports = {
  asPlugin,
  asPluginProvider,
};
