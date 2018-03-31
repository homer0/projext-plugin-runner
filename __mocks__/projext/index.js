/**
 * This is the only way to mock a module that is not on the `package.json`.
 * This plugin uses projext but doesn't directly depends on it: This plugin checks if it can
 * require `projext`, if it fails, it assumes the app is on a production environment, otherwise,
 * it's on a development environment and every run command can be sent to projext directly.
 *
 * The difference between this file and `projext.js` on the parent directory is that this route
 * is used to get an instance of projext outside the CLI.
 */
module.exports = {};
