const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('fs-extra');
jest.unmock('/src/services/runner/file');

require('jasmine-expect');
const fs = require('fs-extra');
const {
  RunnerFile,
  runnerFile,
} = require('/src/services/runner/file');

describe('services/runner:runnerFile', () => {
  beforeEach(() => {
    fs.pathExistsSync.mockReset();
    fs.writeJsonSync.mockReset();
    fs.readJsonSync.mockReset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const asPlugin = 'asPlugin';
    const info = {
      version: '25092015',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    let sut = null;
    const expectedFilename = 'projextrunner.json';
    const expectedFileTemplate = {
      runnerVersion: info.version,
      version: 'development',
      directory: '',
      targets: {},
    };
    // When
    sut = new RunnerFile(asPlugin, info, pathUtils);
    // Then
    expect(sut).toBeInstanceOf(RunnerFile);
    expect(sut.asPlugin).toBe(asPlugin);
    expect(sut.filename).toBe(expectedFilename);
    expect(sut.filepath).toBe(expectedFilename);
    expect(sut.fileTemplate).toEqual(expectedFileTemplate);
    expect(pathUtils.join).toHaveBeenCalledTimes(1);
    expect(pathUtils.join).toHaveBeenCalledWith(expectedFilename);
  });

  it('should return and update the name of the file', () => {
    // Given
    const asPlugin = 'asPlugin';
    const info = {
      version: '25092015',
    };
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    const newName = '.randomrunner';
    let sut = null;
    let defaultName = null;
    let nameAfterChange = null;
    const expectedDefaultFilename = 'projextrunner.json';
    // When
    sut = new RunnerFile(asPlugin, info, pathUtils);
    defaultName = sut.getFilename();
    sut.setFilename(newName);
    nameAfterChange = sut.getFilename();
    // Then
    expect(defaultName).toBe(expectedDefaultFilename);
    expect(nameAfterChange).toBe(newName);
  });

  it('should return whether the file exists or not', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => true);
    const asPlugin = 'asPlugin';
    const info = {
      version: '25092015',
    };
    const filename = '.randomrunner';
    const pathUtils = {
      join: jest.fn(() => filename),
    };
    let sut = null;
    let result = null;
    // When
    sut = new RunnerFile(asPlugin, info, pathUtils);
    result = sut.exists();
    // Then
    expect(result).toBeTrue();
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(filename);
  });

  it('should update the file with a target information', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => false);
    const writeResult = 'done!';
    fs.writeJsonSync.mockImplementationOnce(() => writeResult);
    const asPlugin = 'asPlugin';
    const info = {
      version: '25092015',
    };
    const filename = '.randomrunner';
    const pathUtils = {
      join: jest.fn(() => filename),
    };
    const target = {
      name: 'backend',
      entry: {
        production: 'start.js',
      },
      folders: {
        build: 'dist',
      },
      bundle: false,
      is: {
        node: true,
      },
    };
    const version = 'latest';
    const directory = target.folders.build;
    let sut = null;
    let result = null;
    const expectedFile = {
      runnerVersion: expect.any(String),
      version,
      directory,
      targets: {
        [target.name]: {
          name: target.name,
          path: target.entry.production,
          options: {},
        },
      },
    };
    // When
    sut = new RunnerFile(asPlugin, info, pathUtils);
    result = sut.update(target, version, directory);
    // Then
    expect(result).toBe(writeResult);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(filename);
    expect(fs.writeJsonSync).toHaveBeenCalledTimes(1);
    expect(fs.writeJsonSync).toHaveBeenCalledWith(filename, expectedFile);
  });

  it('should update the file with a bundled target information', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => false);
    const writeResult = 'done!';
    fs.writeJsonSync.mockImplementationOnce(() => writeResult);
    const asPlugin = 'asPlugin';
    const info = {
      version: '25092015',
    };
    const filename = '.randomrunner';
    const pathUtils = {
      join: jest.fn(() => filename),
    };
    const target = {
      name: 'backend',
      output: {
        production: {
          js: 'start.js',
        },
      },
      folders: {
        build: 'dist',
      },
      bundle: true,
      is: {
        node: true,
      },
    };
    const version = 'latest';
    const directory = target.folders.build;
    let sut = null;
    let result = null;
    const expectedFile = {
      runnerVersion: expect.any(String),
      version,
      directory,
      targets: {
        [target.name]: {
          name: target.name,
          path: target.output.production.js,
          options: {},
        },
      },
    };
    // When
    sut = new RunnerFile(asPlugin, info, pathUtils);
    result = sut.update(target, version, directory);
    // Then
    expect(result).toBe(writeResult);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(filename);
    expect(fs.writeJsonSync).toHaveBeenCalledTimes(1);
    expect(fs.writeJsonSync).toHaveBeenCalledWith(filename, expectedFile);
  });

  it('shouldn\'t update the file if the target type is browser', () => {
    // Given
    const asPlugin = 'asPlugin';
    const info = {
      version: '25092015',
    };
    const filename = '.randomrunner';
    const pathUtils = {
      join: jest.fn(() => filename),
    };
    const target = {
      is: {
        node: false,
      },
    };
    const version = 'latest';
    const directory = 'some-dir';
    let sut = null;
    let result = null;
    // When
    sut = new RunnerFile(asPlugin, info, pathUtils);
    result = sut.update(target, version, directory);
    // Then
    expect(result).toBeUndefined();
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(0);
    expect(fs.writeJsonSync).toHaveBeenCalledTimes(0);
  });

  it('should update the file with a target information and include custom runner options', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => false);
    const writeResult = 'done!';
    fs.writeJsonSync.mockImplementationOnce(() => writeResult);
    const asPlugin = 'asPlugin';
    const info = {
      version: '25092015',
    };
    const filename = '.randomrunner';
    const pathUtils = {
      join: jest.fn(() => filename),
    };
    const target = {
      name: 'backend',
      entry: {
        production: 'start.js',
      },
      folders: {
        build: 'dist',
      },
      bundle: false,
      is: {
        node: true,
      },
      runnerOptions: {
        a: 'b',
      },
    };
    const version = 'latest';
    const directory = target.folders.build;
    let sut = null;
    let result = null;
    const expectedFile = {
      runnerVersion: expect.any(String),
      version,
      directory,
      targets: {
        [target.name]: {
          name: target.name,
          path: target.entry.production,
          options: target.runnerOptions,
        },
      },
    };
    // When
    sut = new RunnerFile(asPlugin, info, pathUtils);
    result = sut.update(target, version, directory);
    // Then
    expect(result).toBe(writeResult);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(filename);
    expect(fs.writeJsonSync).toHaveBeenCalledTimes(1);
    expect(fs.writeJsonSync).toHaveBeenCalledWith(filename, expectedFile);
  });

  it('should update the file with a target information that has a custom sub directory', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => false);
    const writeResult = 'done!';
    fs.writeJsonSync.mockImplementationOnce(() => writeResult);
    const asPlugin = 'asPlugin';
    const info = {
      version: '25092015',
    };
    const filename = '.randomrunner';
    const pathUtils = {
      join: jest.fn(() => filename),
    };
    const directory = 'dist';
    const targetDirectory = 'backend';
    const target = {
      name: 'backend',
      entry: {
        production: 'start.js',
      },
      folders: {
        build: `${directory}/${targetDirectory}`,
      },
      bundle: false,
      is: {
        node: true,
      },
      runnerOptions: {
        a: 'b',
      },
    };
    const version = 'latest';
    let sut = null;
    let result = null;
    const expectedFile = {
      runnerVersion: expect.any(String),
      version,
      directory,
      targets: {
        [target.name]: {
          name: target.name,
          path: `${targetDirectory}/${target.entry.production}`,
          options: target.runnerOptions,
        },
      },
    };
    // When
    sut = new RunnerFile(asPlugin, info, pathUtils);
    result = sut.update(target, version, directory);
    // Then
    expect(result).toBe(writeResult);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(filename);
    expect(fs.writeJsonSync).toHaveBeenCalledTimes(1);
    expect(fs.writeJsonSync).toHaveBeenCalledWith(filename, expectedFile);
  });

  it('should read the file and return its contents', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => true);
    const filecontents = 'contents';
    fs.readJsonSync.mockImplementationOnce(() => filecontents);
    const asPlugin = 'asPlugin';
    const info = {
      version: '25092015',
    };
    const filename = '.randomrunner';
    const pathUtils = {
      join: jest.fn(() => filename),
    };
    let sut = null;
    let result = null;
    // When
    sut = new RunnerFile(asPlugin, info, pathUtils);
    result = sut.read();
    // Then
    expect(result).toBe(filecontents);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(filename);
    expect(fs.readJsonSync).toHaveBeenCalledTimes(1);
    expect(fs.readJsonSync).toHaveBeenCalledWith(filename);
  });

  it('should return the file template when trying to read the file before creating it', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => false);
    const asPlugin = 'asPlugin';
    const info = {
      version: '25092015',
    };
    const filename = '.randomrunner';
    const pathUtils = {
      join: jest.fn(() => filename),
    };
    let sut = null;
    let result = null;
    // When
    sut = new RunnerFile(asPlugin, info, pathUtils);
    result = sut.read();
    // Then
    expect(result).toEqual(sut.fileTemplate);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(filename);
    expect(fs.readJsonSync).toHaveBeenCalledTimes(0);
  });

  it('should throw an error if the file doesn\'t exists and projext is not present', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => false);
    const asPlugin = false;
    const info = {
      version: '25092015',
    };
    const filename = '.randomrunner';
    const pathUtils = {
      join: jest.fn(() => filename),
    };
    let sut = null;
    // When
    sut = new RunnerFile(asPlugin, info, pathUtils);
    // Then
    expect(() => sut.validate())
    .toThrow(/The runner file doesn't exist and projext is not present/i);
  });

  it('shouldn\'t throw an error if the file doesn\'t exists but projext is present', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => false);
    const asPlugin = true;
    const info = {
      version: '25092015',
    };
    const filename = '.randomrunner';
    const pathUtils = {
      join: jest.fn(() => filename),
    };
    let sut = null;
    // When/Then
    sut = new RunnerFile(asPlugin, info, pathUtils);
    sut.validate();
  });

  it('should update the app version on the file', () => {
    // Given
    fs.pathExistsSync.mockImplementationOnce(() => false);
    const writeResult = 'done!';
    fs.writeJsonSync.mockImplementationOnce(() => writeResult);
    const asPlugin = 'asPlugin';
    const info = {
      version: '25092015',
    };
    const filename = '.randomrunner';
    const pathUtils = {
      join: jest.fn(() => filename),
    };
    const version = 'latest';
    let sut = null;
    let result = null;
    const expectedFile = {
      runnerVersion: expect.any(String),
      version,
      directory: '',
      targets: {},
    };
    // When
    sut = new RunnerFile(asPlugin, info, pathUtils);
    result = sut.updateVersion(version);
    // Then
    expect(result).toBe(writeResult);
    expect(fs.pathExistsSync).toHaveBeenCalledTimes(1);
    expect(fs.pathExistsSync).toHaveBeenCalledWith(filename);
    expect(fs.writeJsonSync).toHaveBeenCalledTimes(1);
    expect(fs.writeJsonSync).toHaveBeenCalledWith(filename, expectedFile);
  });

  it('should include a provider for the DIC', () => {
    // Given
    const pathUtils = {
      join: jest.fn((rest) => rest),
    };
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn(
        (service) => (service === 'pathUtils' ? pathUtils : service)
      ),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    runnerFile(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('runnerFile');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(RunnerFile);
    expect(sut.asPlugin).toBe('asPlugin');
  });
});
