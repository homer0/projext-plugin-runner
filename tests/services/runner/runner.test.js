const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/services/runner/runner');

const path = require('path');
require('jasmine-expect');
const {
  Runner,
  runner,
} = require('/src/services/runner/runner');

describe('services/runner:runner', () => {
  it('should be instantiated with all its dependencies', () => {
    // Given
    const pathUtils = 'pathUtils';
    const projextPlugin = 'projextPlugin';
    const runnerFile = 'runnerFile';
    const targets = 'targets';
    let sut = null;
    // When
    sut = new Runner(pathUtils, projextPlugin, runnerFile, targets);
    // Then
    expect(sut).toBeInstanceOf(Runner);
    expect(sut.pathUtils).toBe(pathUtils);
    expect(sut.projextPlugin).toBe(projextPlugin);
    expect(sut.runnerFile).toBe(runnerFile);
    expect(sut.targets).toBe(targets);
  });

  it('should return the command to run a target on production', () => {
    // Given
    const pathUtils = 'pathUtils';
    const asPlugin = false;
    const projextPlugin = {
      isInstalled: jest.fn(() => asPlugin),
    };
    const file = {
      version: 'latest',
    };
    const runnerFile = {
      read: jest.fn(() => file),
    };
    const targetName = 'charito';
    const target = {
      name: targetName,
      options: {},
      exec: 'some-path.js',
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const production = true;
    const runAsPluginCommand = '';
    let sut = null;
    let result = null;
    const expectedVariables = `VERSION=${file.version}`;
    const expectedCommand = `${expectedVariables} node ${target.exec}`;
    // When
    sut = new Runner(pathUtils, projextPlugin, runnerFile, targets);
    result = sut.getCommands(targetName, production, runAsPluginCommand);
    // Then
    expect(result).toEqual(expectedCommand);
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(targetName);
    expect(runnerFile.read).toHaveBeenCalledTimes(1);
    expect(projextPlugin.isInstalled).toHaveBeenCalledTimes([
      'when validating whether to use projext or not',
      'to validate if the executable should be run from the distribution or the source directory',
    ].length);
  });

  it('should return the command to run the default target on production', () => {
    // Given
    const pathUtils = 'pathUtils';
    const asPlugin = false;
    const projextPlugin = {
      isInstalled: jest.fn(() => asPlugin),
    };
    const file = {
      version: 'latest',
    };
    const runnerFile = {
      read: jest.fn(() => file),
    };
    const targetName = 'charito';
    const target = {
      name: targetName,
      options: {},
      exec: 'some-path.js',
    };
    const targets = {
      getDefaultTarget: jest.fn(() => target),
    };
    const production = true;
    const runAsPluginCommand = '';
    let sut = null;
    let result = null;
    const expectedVariables = `VERSION=${file.version}`;
    const expectedCommand = `${expectedVariables} node ${target.exec}`;
    // When
    sut = new Runner(pathUtils, projextPlugin, runnerFile, targets);
    result = sut.getCommands(null, production, runAsPluginCommand);
    // Then
    expect(result).toEqual(expectedCommand);
    expect(targets.getDefaultTarget).toHaveBeenCalledTimes(1);
    expect(runnerFile.read).toHaveBeenCalledTimes(1);
    expect(projextPlugin.isInstalled).toHaveBeenCalledTimes([
      'when validating whether to use projext or not',
      'to validate if the executable should be run from the distribution or the source directory',
    ].length);
  });

  it('should return the command to run a target on production with a custom program', () => {
    // Given
    const pathUtils = 'pathUtils';
    const asPlugin = false;
    const projextPlugin = {
      isInstalled: jest.fn(() => asPlugin),
    };
    const file = {
      version: 'latest',
    };
    const runnerFile = {
      read: jest.fn(() => file),
    };
    const targetName = 'charito';
    const target = {
      name: targetName,
      options: {
        runWith: 'nodemon',
      },
      exec: 'some-path.js',
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const production = true;
    const runAsPluginCommand = '';
    let sut = null;
    let result = null;
    const expectedVariables = `VERSION=${file.version}`;
    const expectedCommand = `${expectedVariables} ${target.options.runWith} ${target.exec}`;
    // When
    sut = new Runner(pathUtils, projextPlugin, runnerFile, targets);
    result = sut.getCommands(targetName, production, runAsPluginCommand);
    // Then
    expect(result).toEqual(expectedCommand);
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(targetName);
    expect(runnerFile.read).toHaveBeenCalledTimes(1);
    expect(projextPlugin.isInstalled).toHaveBeenCalledTimes([
      'when validating whether to use projext or not',
      'to validate if the executable should be run from the distribution or the source directory',
    ].length);
  });

  it('should return the command to run a target with projext on development', () => {
    // Given
    const pathUtils = 'pathUtils';
    const asPlugin = true;
    const command = 'run projext run';
    const projextPlugin = {
      isInstalled: jest.fn(() => asPlugin),
      getBuildCommand: jest.fn(() => command),
    };
    const file = {
      version: 'latest',
    };
    const runnerFile = {
      read: jest.fn(() => file),
    };
    const targetName = 'charito';
    const target = {
      name: targetName,
      options: {},
      exec: 'some-path.js',
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const production = false;
    const runAsPluginCommand = 'run-as-plugin';
    let sut = null;
    let result = null;
    const expectedVariables = `VERSION=${file.version}`;
    // When
    sut = new Runner(pathUtils, projextPlugin, runnerFile, targets);
    result = sut.getCommands(targetName, production, runAsPluginCommand);
    // Then
    expect(result).toEqual(command);
    expect(targets.getTarget).toHaveBeenCalledTimes(0);
    expect(projextPlugin.getBuildCommand).toHaveBeenCalledTimes(1);
    expect(projextPlugin.getBuildCommand).toHaveBeenCalledWith(
      {
        target: targetName,
        type: 'development',
        run: true,
      },
      expectedVariables
    );
  });

  it('should return the command to run the default target with projext on development', () => {
    // Given
    const pathUtils = 'pathUtils';
    const asPlugin = true;
    const command = 'run projext run';
    const projextPlugin = {
      isInstalled: jest.fn(() => asPlugin),
      getBuildCommand: jest.fn(() => command),
    };
    const file = {
      version: 'latest',
    };
    const runnerFile = {
      read: jest.fn(() => file),
    };
    const targets = 'targets';
    const production = false;
    const runAsPluginCommand = 'run-as-plugin';
    let sut = null;
    let result = null;
    const expectedVariables = `VERSION=${file.version}`;
    // When
    sut = new Runner(pathUtils, projextPlugin, runnerFile, targets);
    result = sut.getCommands(null, production, runAsPluginCommand);
    // Then
    expect(result).toEqual(command);
    expect(projextPlugin.getBuildCommand).toHaveBeenCalledTimes(1);
    expect(projextPlugin.getBuildCommand).toHaveBeenCalledWith(
      {
        target: '',
        type: 'development',
        run: true,
      },
      expectedVariables
    );
  });

  it('should return the command to run a target with projext on production', () => {
    // Given
    const pathUtils = 'pathUtils';
    const asPlugin = true;
    const command = 'run projext run';
    const projextPlugin = {
      isInstalled: jest.fn(() => asPlugin),
      getBuildCommand: jest.fn(() => command),
    };
    const runnerFile = 'runnerFile';
    const targetName = 'charito';
    const target = {
      name: targetName,
      options: {},
      exec: 'some-path.js',
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    const production = true;
    const runAsPluginCommand = 'run-as-plugin';
    let sut = null;
    let result = null;
    const expectedCommand = [
      command,
      runAsPluginCommand,
    ].join(';');
    // When
    sut = new Runner(pathUtils, projextPlugin, runnerFile, targets);
    result = sut.getCommands(targetName, production, runAsPluginCommand);
    // Then
    expect(result).toEqual(expectedCommand);
    expect(targets.getTarget).toHaveBeenCalledTimes(0);
    expect(projextPlugin.getBuildCommand).toHaveBeenCalledTimes(1);
    expect(projextPlugin.getBuildCommand).toHaveBeenCalledWith({
      target: targetName,
      type: 'production',
      run: false,
    });
  });

  it('should return the command to run a builded target on production', () => {
    // Given
    const pathUtils = {
      join: jest.fn((base, rest) => path.join(base, rest)),
    };
    const asPlugin = true;
    const projextPlugin = {
      isInstalled: jest.fn(() => asPlugin),
    };
    const directory = 'dist';
    const file = {
      directory,
      version: 'latest',
    };
    const runnerFile = {
      read: jest.fn(() => file),
    };
    const targetName = 'charito';
    const target = {
      name: targetName,
      options: {},
      path: 'some-path.js',
    };
    const targets = {
      getTarget: jest.fn(() => target),
    };
    let sut = null;
    let result = null;
    const expectedVariables = `VERSION=${file.version}`;
    const expectedCommand = `${expectedVariables} node ${directory}/${target.path}`;
    // When
    sut = new Runner(pathUtils, projextPlugin, runnerFile, targets);
    result = sut.getPluginCommandsForProduction(targetName);
    // Then
    expect(result).toEqual(expectedCommand);
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(targetName);
    expect(runnerFile.read).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory, target.path);
  });

  it('should return the command to build and run the default target on production', () => {
    // Given
    const pathUtils = {
      join: jest.fn((base, rest) => path.join(base, rest)),
    };
    const asPlugin = true;
    const projextPlugin = {
      isInstalled: jest.fn(() => asPlugin),
    };
    const directory = 'dist';
    const file = {
      directory,
      version: 'latest',
    };
    const runnerFile = {
      read: jest.fn(() => file),
    };
    const target = {
      name: 'charito',
      options: {},
      path: 'some-path.js',
    };
    const targets = {
      getDefaultTarget: jest.fn(() => target),
    };
    let sut = null;
    let result = null;
    const expectedVariables = `VERSION=${file.version}`;
    const expectedCommand = `${expectedVariables} node ${directory}/${target.path}`;
    // When
    sut = new Runner(pathUtils, projextPlugin, runnerFile, targets);
    result = sut.getPluginCommandsForProduction();
    // Then
    expect(result).toEqual(expectedCommand);
    expect(targets.getDefaultTarget).toHaveBeenCalledTimes(1);
    expect(runnerFile.read).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(directory, target.path);
  });

  it('should include a provider for the DIC', () => {
    // Given
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn((service) => service),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    runner(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('runner');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(Runner);
    expect(sut.pathUtils).toBe('pathUtils');
    expect(sut.projextPlugin).toBe('projextPlugin');
    expect(sut.runnerFile).toBe('runnerFile');
    expect(sut.targets).toBe('targets');
  });
});
