const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('fs-extra');
jest.unmock('/src/services/runner/targets');

require('jasmine-expect');
const fs = require('fs-extra');
const {
  Targets,
  targets,
} = require('/src/services/runner/targets');

describe('services/runner:targets', () => {
  beforeEach(() => {
    fs.pathExistsSync.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const asPlugin = 'asPlugin';
    const packageInfo = 'packageInfo';
    const pathUtils = 'pathUtils';
    const runnerFile = 'runnerFile';
    let sut = null;
    // When
    sut = new Targets(asPlugin, packageInfo, pathUtils, runnerFile);
    // Then
    expect(sut).toBeInstanceOf(Targets);
    expect(sut.asPlugin).toBe(asPlugin);
    expect(sut.packageInfo).toBe(packageInfo);
    expect(sut.pathUtils).toBe(pathUtils);
    expect(sut.runnerFile).toBe(runnerFile);
  });

  it('should throw an error when trying to access a target that doesn\'t exist', () => {
    // Given
    const asPlugin = 'asPlugin';
    const packageInfo = 'packageInfo';
    const pathUtils = 'pathUtils';
    const file = {
      targets: {},
    };
    const runnerFile = {
      read: jest.fn(() => file),
    };
    let sut = null;
    // When
    sut = new Targets(asPlugin, packageInfo, pathUtils, runnerFile);
    // Then
    expect(() => sut.getTarget('random'))
    .toThrow(/The target information is not on the runner file/i);
    expect(runnerFile.read).toHaveBeenCalledTimes(1);
  });

  it('should include the executable path on a returned target information', () => {
    // Given
    const asPlugin = 'asPlugin';
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const targetName = 'some-target';
    const target = {
      name: targetName,
      path: 'path-to-the-file',
    };
    const file = {
      targets: {
        [targetName]: target,
      },
    };
    const runnerFile = {
      read: jest.fn(() => file),
    };
    let sut = null;
    let result = null;
    const expectedTarget = Object.assign({}, target, {
      exec: target.path,
    });
    // When
    sut = new Targets(asPlugin, packageInfo, pathUtils, runnerFile);
    result = sut.getTarget(targetName);
    // Then
    expect(runnerFile.read).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(target.path);
    expect(result).toEqual(expectedTarget);
  });

  it('should get a target with the project\'s name as the default target', () => {
    // Given
    const asPlugin = 'asPlugin';
    const projectName = 'myAppForCharito';
    const packageInfo = {
      name: projectName,
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const target = {
      name: projectName,
      path: 'path-to-the-file',
    };
    const file = {
      targets: {
        [projectName]: target,
        abc: {},
        someOtherTarget: {},
      },
    };
    const runnerFile = {
      read: jest.fn(() => file),
    };
    let sut = null;
    let result = null;
    const expectedTarget = Object.assign({}, target, {
      exec: target.path,
    });
    // When
    sut = new Targets(asPlugin, packageInfo, pathUtils, runnerFile);
    result = sut.getDefaultTarget();
    // Then
    expect(runnerFile.read).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(target.path);
    expect(result).toEqual(expectedTarget);
  });

  it('should get the first target (by alphabetical order) as the default target', () => {
    // Given
    const asPlugin = 'asPlugin';
    const packageInfo = {
      name: 'myAppForCharito',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const targetName = 'aaa';
    const target = {
      name: targetName,
      path: 'path-to-the-file',
    };
    const file = {
      targets: {
        abc: {},
        someOtherTarget: {},
        [targetName]: target,
      },
    };
    const runnerFile = {
      read: jest.fn(() => file),
    };
    let sut = null;
    let result = null;
    const expectedTarget = Object.assign({}, target, {
      exec: target.path,
    });
    // When
    sut = new Targets(asPlugin, packageInfo, pathUtils, runnerFile);
    result = sut.getDefaultTarget();
    // Then
    expect(runnerFile.read).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(target.path);
    expect(result).toEqual(expectedTarget);
  });

  it('should throw an error while trying to get the default target without having targets', () => {
    // Given
    const asPlugin = 'asPlugin';
    const packageInfo = 'packageInfo';
    const pathUtils = 'pathUtils';
    const file = {
      targets: {},
    };
    const runnerFile = {
      read: jest.fn(() => file),
    };
    let sut = null;
    // When
    sut = new Targets(asPlugin, packageInfo, pathUtils, runnerFile);
    // Then
    expect(() => sut.getDefaultTarget()).toThrow(/the project doesn't have any targets/i);
  });

  it('shouldn\'t throw anything while validating a target and running as plugin', () => {
    // Given
    const asPlugin = true;
    const packageInfo = 'packageInfo';
    const pathUtils = 'pathUtils';
    const runnerFile = 'runnerFile';
    let sut = null;
    let result = null;
    // When
    sut = new Targets(asPlugin, packageInfo, pathUtils, runnerFile);
    result = sut.validate('some-target');
    // Then
    expect(result).toBeTrue();
  });

  it('should throw an error if the runner file doesn\'t exist', () => {
    // Given
    const asPlugin = false;
    const packageInfo = 'packageInfo';
    const pathUtils = 'pathUtils';
    const runnerFileExists = false;
    const runnerFile = {
      exists: jest.fn(() => runnerFileExists),
    };
    let sut = null;
    // When
    sut = new Targets(asPlugin, packageInfo, pathUtils, runnerFile);
    // Then
    expect(() => sut.validate('some-target'))
    .toThrow(/The runner file doesn't exist/i);
  });

  it('should throw an error if a target executable doesn\'t exist', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => false);
    const asPlugin = false;
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const targetName = 'some-target';
    const target = {
      name: targetName,
      path: 'path-to-the-file',
    };
    const file = {
      targets: {
        [targetName]: target,
      },
    };
    const runnerFileExists = true;
    const runnerFile = {
      exists: jest.fn(() => runnerFileExists),
      read: jest.fn(() => file),
    };
    let sut = null;
    // When
    sut = new Targets(asPlugin, packageInfo, pathUtils, runnerFile);
    // Then
    expect(() => sut.validate(targetName))
    .toThrow(/The target executable doesn't exist/i);
    expect(runnerFile.read).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(target.path);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(target.path);
  });

  it('shouldn\'t throw anything if the validation passes for a target', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => true);
    const asPlugin = false;
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const targetName = 'some-target';
    const target = {
      name: targetName,
      path: 'path-to-the-file',
    };
    const file = {
      targets: {
        [targetName]: target,
      },
    };
    const runnerFileExists = true;
    const runnerFile = {
      exists: jest.fn(() => runnerFileExists),
      read: jest.fn(() => file),
    };
    let sut = null;
    let result = null;
    // When
    sut = new Targets(asPlugin, packageInfo, pathUtils, runnerFile);
    result = sut.validate(targetName);
    // Then
    expect(result).toBeTrue();
    expect(runnerFile.read).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(target.path);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(target.path);
  });

  it('shouldn\'t throw anything if the validation passes for the default target', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => true);
    const asPlugin = false;
    const packageInfo = 'packageInfo';
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const target = {
      name: 'some-target',
      path: 'path-to-the-file',
    };
    const file = {
      targets: {
        [target.targetName]: target,
      },
    };
    const runnerFileExists = true;
    const runnerFile = {
      exists: jest.fn(() => runnerFileExists),
      read: jest.fn(() => file),
    };
    let sut = null;
    let result = null;
    // When
    sut = new Targets(asPlugin, packageInfo, pathUtils, runnerFile);
    result = sut.validate();
    // Then
    expect(result).toBeTrue();
    expect(runnerFile.read).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(target.path);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(target.path);
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
    targets(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('targets');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(Targets);
    expect(sut.asPlugin).toBe('asPlugin');
    expect(sut.packageInfo).toBe('packageInfo');
    expect(sut.pathUtils).toBe('pathUtils');
    expect(sut.runnerFile).toBe('runnerFile');
  });
});
