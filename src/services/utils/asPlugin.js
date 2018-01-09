const { provider } = require('jimple');

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

const asPluginProvider = provider((app) => {
  app.set('asPlugin', () => asPlugin());
});

module.exports = {
  asPlugin,
  asPluginProvider,
};
