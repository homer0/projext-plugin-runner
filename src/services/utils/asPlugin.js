const { provider } = require('jimple');
/**
 * Checks whether or not Woopack is preent on the environment.
 * @return {boolean}
 */
const asPlugin = () => {
  let woopackExists = true;
  try {
    // eslint-disable-next-line global-require
    require('woopack');
  } catch (ignore) {
    woopackExists = false;
  }

  return woopackExists;
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
