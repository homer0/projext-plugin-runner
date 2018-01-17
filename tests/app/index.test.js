const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/app/index');

require('jasmine-expect');

const { WoopackRunner } = require('/src/app');
const packageInfo = require('../../package.json');

describe('app:WoopackRunner', () => {
  beforeEach(() => {
    JimpleMock.reset();
  });

  it('should add the error handler when instantiated', () => {
    // Given
    let sut = null;
    const listenErrors = jest.fn();
    const get = jest.fn(() => ({
      listen: listenErrors,
    }));
    JimpleMock.mock('get', get);
    // When
    sut = new WoopackRunner();
    // Then
    expect(sut).toBeInstanceOf(WoopackRunner);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('errorHandler');
    expect(listenErrors).toHaveBeenCalledTimes(1);
  });

  it('should register the package.json as \'info\' when instantiated', () => {
    // Given
    let sut = null;
    let infoServiceName = null;
    let infoServiceFn = null;
    const get = jest.fn(() => ({
      listen: () => {},
    }));
    JimpleMock.mock('get', get);
    const set = jest.fn();
    JimpleMock.mock('set', set);
    // When
    sut = new WoopackRunner();
    [[infoServiceName, infoServiceFn]] = set.mock.calls;
    // Then
    expect(sut).toBeInstanceOf(WoopackRunner);
    expect(infoServiceName).toBe('info');
    expect(infoServiceFn()).toEqual(packageInfo);
  });

  it('should create the runner file when a Woopack target gets build', () => {
    // Given
    const updateRunnerFile = jest.fn();
    const get = jest.fn(() => ({
      listen: () => {},
      update: updateRunnerFile,
    }));
    JimpleMock.mock('get', get);
    const woopackEvents = {
      once: jest.fn(),
    };
    const woopackProjectConfig = {
      version: {
        revision: {
          filename: 'revision',
        },
      },
      paths: {
        build: 'dist',
      },
    };
    const woopackProjectConfiguration = {
      getConfig: jest.fn(() => woopackProjectConfig),
    };
    const woopackVersion = 'latest';
    const woopackVersionUtils = {
      getVersion: jest.fn(() => woopackVersion),
    };
    const woopack = {
      events: woopackEvents,
      projectConfiguration: woopackProjectConfiguration,
      versionUtils: woopackVersionUtils,
      get: jest.fn((service) => woopack[service]),
    };
    const target = {
      name: 'some-target',
    };
    const commands = ['build', 'copy', 'something'];
    let sut = null;
    let eventListener = null;
    let result = null;
    const expectedEventName = 'build-target-commands-list';
    const expectedServices = [
      'events',
      'projectConfiguration',
      'versionUtils',
    ];
    // When
    sut = new WoopackRunner();
    sut.plugin(woopack);
    [[, eventListener]] = woopackEvents.once.mock.calls;
    result = eventListener(commands, target);
    // Then
    expect(woopack.get).toHaveBeenCalledTimes(expectedServices.length);
    expectedServices.forEach((service) => {
      expect(woopack.get).toHaveBeenCalledWith(service);
    });
    expect(woopackEvents.once).toHaveBeenCalledTimes([
      expectedEventName,
      'an-event-for-another test',
      'an-event-for-another test',
    ].length);
    expect(woopackEvents.once).toHaveBeenCalledWith(
      expectedEventName,
      expect.any(Function)
    );
    expect(woopackProjectConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(woopackVersionUtils.getVersion).toHaveBeenCalledTimes(1);
    expect(woopackVersionUtils.getVersion).toHaveBeenCalledWith(
      woopackProjectConfig.version.revision.filename
    );
    expect(updateRunnerFile).toHaveBeenCalledTimes(1);
    expect(updateRunnerFile).toHaveBeenCalledWith(
      target,
      woopackVersion,
      woopackProjectConfig.paths.build
    );
    expect(result).toEqual(commands);
  });

  it('should copy runner file when Woopack copies the project files', () => {
    // Given
    const runnerFileName = '.woopackrunner';
    const getRunnerFileName = jest.fn(() => runnerFileName);
    const get = jest.fn(() => ({
      listen: () => {},
      getFilename: getRunnerFileName,
    }));
    JimpleMock.mock('get', get);
    const woopackEvents = {
      once: jest.fn(),
    };
    const woopack = {
      events: woopackEvents,
      get: jest.fn((service) => woopack[service]),
    };
    const items = ['fileA.js', 'folderB'];
    let sut = null;
    let eventListener = null;
    let result = null;
    const expectedEventName = 'project-files-to-copy';
    const expectedServices = ['events'];
    const expectedItems = [
      ...items,
      runnerFileName,
    ];
    // When
    sut = new WoopackRunner();
    sut.plugin(woopack);
    [, [, eventListener]] = woopackEvents.once.mock.calls;
    result = eventListener(items);
    // Then
    expect(woopack.get).toHaveBeenCalledTimes(expectedServices.length);
    expectedServices.forEach((service) => {
      expect(woopack.get).toHaveBeenCalledWith(service);
    });
    expect(woopackEvents.once).toHaveBeenCalledTimes([
      'an-event-for-another test',
      expectedEventName,
      'an-event-for-another test',
    ].length);
    expect(woopackEvents.once).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function)
    );
    expect(woopackEvents.once).toHaveBeenCalledWith(
      expectedEventName,
      expect.any(Function)
    );
    expect(woopackEvents.once).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function)
    );
    expect(getRunnerFileName).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedItems);
  });

  it('should update runner file when Woopack creates a revision file', () => {
    // Given
    const updateRunnerFileVersion = jest.fn();
    const get = jest.fn(() => ({
      listen: () => {},
      updateVersion: updateRunnerFileVersion,
    }));
    JimpleMock.mock('get', get);
    const woopackEvents = {
      once: jest.fn(),
    };
    const woopack = {
      events: woopackEvents,
      get: jest.fn((service) => woopack[service]),
    };
    const version = 'latest';
    let sut = null;
    let eventListener = null;
    const expectedEventName = 'revision-file-created';
    const expectedServices = ['events'];
    // When
    sut = new WoopackRunner();
    sut.plugin(woopack);
    [,, [, eventListener]] = woopackEvents.once.mock.calls;
    eventListener(version);
    // Then
    expect(woopack.get).toHaveBeenCalledTimes(expectedServices.length);
    expectedServices.forEach((service) => {
      expect(woopack.get).toHaveBeenCalledWith(service);
    });
    expect(woopackEvents.once).toHaveBeenCalledTimes([
      'an-event-for-another test',
      'an-event-for-another test',
      expectedEventName,
    ].length);
    expect(woopackEvents.once).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function)
    );
    expect(woopackEvents.once).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function)
    );
    expect(woopackEvents.once).toHaveBeenCalledWith(
      expectedEventName,
      expect.any(Function)
    );
    expect(updateRunnerFileVersion).toHaveBeenCalledTimes(1);
    expect(updateRunnerFileVersion).toHaveBeenCalledWith(version);
  });

  it('should start the CLI the interface', () => {
    // Given
    let sut = null;
    const startCLI = jest.fn();
    const get = jest.fn(() => ({
      listen: () => {},
      start: startCLI,
    }));
    JimpleMock.mock('get', get);
    // When
    sut = new WoopackRunner();
    sut.cli();
    // Then
    expect(sut).toBeInstanceOf(WoopackRunner);
    expect(startCLI).toHaveBeenCalledTimes(1);
    expect(startCLI).toHaveBeenCalledWith(expect.any(Array));
  });
});
