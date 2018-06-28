# projext runner

[![Travis](https://img.shields.io/travis/homer0/projext-plugin-runner.svg?style=flat-square)](https://travis-ci.org/homer0/projext-plugin-runner)
[![Coveralls github](https://img.shields.io/coveralls/github/homer0/projext-plugin-runner.svg?style=flat-square)](https://coveralls.io/github/homer0/projext-plugin-runner?branch=master)
[![David](https://img.shields.io/david/homer0/projext-plugin-runner.svg?style=flat-square)](https://david-dm.org/homer0/projext-plugin-runner)
[![David](https://img.shields.io/david/dev/homer0/projext-plugin-runner.svg?style=flat-square)](https://david-dm.org/homer0/projext-plugin-runner)

A projext plugin to run Node targets with a simple command no matter the environment, even if projext is not installed.

## Introduction

This is part plugin and part stand alone tool:

- When projext present, it assumes that is on a development environment and every time a file is builded, it will write an information file.
- If projext is not present, it assumes that is on a production environment, and it will use the file generated while on development to run the targets.

The idea behind this plugin-tool is that you don't have to hard code the instruction to run a target when projext is not present; and you can install on a production environment since it doesn't depend on any of the other projext tools.

## Information

| -            | -                                                                                     |
|--------------|---------------------------------------------------------------------------------------|
| Package      | projext-plugin-runner                                                                 |
| Description  | A projext plugin to run Node targets with a simple command no matter the environment. |
| Node Version | >= v6.10.0                                                                            |

## Usage

### Runner file

The most important thing you need to remember is that this plugin-tool depends on a file with the information of the targets: The runner file.

The runner file is called `projextrunner.json` and it's created when you build your targets, on your project root directory. You should probably add it to your `.gitignore`.

If the feature to copy project files is enabled, the file will be automatically copied to the distribution directory when the files are copied; otherwise, you'll have to copy it manually before moving the distribution directory to the production environment (deploying).

### CLI

To run the targets, the runner provides you with a CLI tool:

```bash
projext-runner [target] [--production]
```

- `target`: The name of the target you intend to run.
- `--production`: This forces the runner to build the target for production and run that even if projext is present. If the option is not specified, it will check if projext is present to determine whether it is a development or production environment.

When on a development environment, this command will basically call `projext run`, unless `--production` is used; If it is on a production environment, it will use the information of the runner file to execute the file.

### Customization

On your project configuration targets settings, you can add a `runnerOptions` object setting that the runner will pick and that can be used to modify the way the target is executed.

- `build`: A list (`Array`) of targets names that need to be built before running the target on a development environment (with projext present) but with a production build (with code ready for deployment).
- `runWith`: The name (`string`) of the executable the runner will use to run the target. By default is `node`, but you can changed to something like [`nodemon`](https://yarnpkg.com/en/package/nodemon).

### Extending/overwriting the services

Like projext, the this plugin-tool is built using [Jimple](https://yarnpkg.com/en/package/jimple), a port of [Pimple Dependency Injection container](https://github.com/silexphp/Pimple/) for Node, and EVERYTHING is registered on a container. You can simple set your own version of a service with the same name in order to overwrite it.

> If you haven't tried [Jimple](https://github.com/fjorgemota/jimple), give it a try, it's excellent for organizing your app dependencies and services.

The way you get access to the container is by creating a file called `projext.runner.js` on your project root directory, there you'll create your own instance of the runner, register your custom/overwrite services and export it:

```js
// projext.runner.js

// Get the main class
const { ProjextRunner } = require('projext-plugin-runner/src/app');

// Create a new instance
const myRunner = new ProjextRunner();

// Overwrite a service
myRunner.set('targets', () => myCustomTargetsManager);

// Export your custom version
module.exports = myRunner;
```

> You have to require it from `/src/app` because projext doesn't **yet** support a named export to load a plugin, and the main export is meant to be a function used by projext to register the plugin.

## Development

Before doing anything, install the repository hooks:

```bash
# You can either use npm or yarn, it doesn't matter
yarn run hooks
```

### NPM/Yarn Tasks

| Task                    | Description                         |
|-------------------------|-------------------------------------|
| `yarn run hooks`        | Install the GIT repository hooks.   |
| `yarn test`             | Run the project unit tests.         |
| `yarn run lint`         | Lint the modified files.            |
| `yarn run lint:full`    | Lint the project code.              |
| `yarn run docs`         | Generate the project documentation. |
| `yarn run todo`         | List all the pending to-do's.       |

### Testing

I use [Jest](https://facebook.github.io/jest/) with [Jest-Ex](https://yarnpkg.com/en/package/jest-ex) to test the project. The configuration file is on `./.jestrc`, the tests and mocks are on `./tests` and the script that runs it is on `./utils/scripts/test`.

### Linting

I use [ESlint](http://eslint.org) to validate all our JS code. The configuration file for the project code is on `./.eslintrc` and for the tests on `./tests/.eslintrc` (which inherits from the one on the root), there's also an `./.eslintignore` to ignore some files on the process, and the script that runs it is on `./utils/scripts/lint`.

### Documentation

I use [ESDoc](http://esdoc.org) to generate HTML documentation for the project. The configuration file is on `./.esdocrc` and the script that runs it is on `./utils/scripts/docs`.

### To-Dos

I use `@todo` comments to write all the pending improvements and fixes, and [Leasot](https://yarnpkg.com/en/package/leasot) to generate a report. The script that runs it is on `./utils/scripts/todo`.
