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
    const asPlugin = 'asPlugin';
    const pathUtils = 'pathUtils';
    const runnerFile = 'runnerFile';
    const targets = 'targets';
    let sut = null;
    // When
    sut = new Runner(asPlugin, pathUtils, runnerFile, targets);
    // Then
    expect(sut).toBeInstanceOf(Runner);
    expect(sut.asPlugin).toBe(asPlugin);
    expect(sut.pathUtils).toBe(pathUtils);
    expect(sut.runnerFile).toBe(runnerFile);
    expect(sut.targets).toBe(targets);
  });

  it('should return the command to run a target on production', () => {
    // Given
    const asPlugin = false;
    const pathUtils = 'pathUtils';
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
    const runAsPluginCommand = '';
    let sut = null;
    let result = null;
    const expectedCommand = `node ${target.exec}`;
    // When
    sut = new Runner(asPlugin, pathUtils, runnerFile, targets);
    result = sut.getCommands(targetName, production, runAsPluginCommand);
    // Then
    expect(result).toEqual(expectedCommand);
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(targetName);
  });

  it('should return the command to run a target on production with a custom program', () => {
    // Given
    const asPlugin = false;
    const pathUtils = 'pathUtils';
    const runnerFile = 'runnerFile';
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
    const expectedCommand = `${target.options.runWith} ${target.exec}`;
    // When
    sut = new Runner(asPlugin, pathUtils, runnerFile, targets);
    result = sut.getCommands(targetName, production, runAsPluginCommand);
    // Then
    expect(result).toEqual(expectedCommand);
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(targetName);
  });

  it('should return the command to run a target with Woopack on development', () => {
    // Given
    const asPlugin = true;
    const pathUtils = 'pathUtils';
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
    const production = false;
    const runAsPluginCommand = 'run-as-plugin';
    let sut = null;
    let result = null;
    const expectedCommand = `woopack run ${targetName}`;
    // When
    sut = new Runner(asPlugin, pathUtils, runnerFile, targets);
    result = sut.getCommands(targetName, production, runAsPluginCommand);
    // Then
    expect(result).toEqual(expectedCommand);
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(targetName);
  });

  it('should return the command to run a target with Woopack on production', () => {
    // Given
    const asPlugin = true;
    const pathUtils = 'pathUtils';
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
      `woopack build ${targetName} --type production`,
      runAsPluginCommand,
    ].join(';');
    // When
    sut = new Runner(asPlugin, pathUtils, runnerFile, targets);
    result = sut.getCommands(targetName, production, runAsPluginCommand);
    // Then
    expect(result).toEqual(expectedCommand);
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(targetName);
  });

  it('should return the command to run a builded target on production', () => {
    // Given
    const asPlugin = true;
    const pathUtils = {
      join: jest.fn((base, rest) => path.join(base, rest)),
    };
    const directory = 'dist';
    const runnerFile = {
      read: jest.fn(() => ({ directory })),
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
    const expectedCommand = `node ${directory}/${target.path}`;
    // When
    sut = new Runner(asPlugin, pathUtils, runnerFile, targets);
    result = sut.getPluginCommandsForProduction(targetName);
    // Then
    expect(result).toEqual(expectedCommand);
    expect(targets.getTarget).toHaveBeenCalledTimes(1);
    expect(targets.getTarget).toHaveBeenCalledWith(targetName);
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
    expect(sut.asPlugin).toBe('asPlugin');
    expect(sut.pathUtils).toBe('pathUtils');
    expect(sut.runnerFile).toBe('runnerFile');
    expect(sut.targets).toBe('targets');
  });
});
