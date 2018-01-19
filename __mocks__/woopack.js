/**
 * This is the only way to mock a module that is not on the `package.json`.
 * This plugin uses Woopack but doesn't directly depends on it: This plugin checks if it can
 * require `woopack`, if it fails, it assumes the app is on a production environment, otherwise,
 * it's on a development environment and every run command can be sent to Woopack directly.
 */
module.exports = {};
