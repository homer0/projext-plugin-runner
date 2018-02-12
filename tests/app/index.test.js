const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.unmock('/src/app/index');

require('jasmine-expect');

const { ProjextRunner } = require('/src/app');
const packageInfo = require('../../package.json');

describe('app:ProjextRunner', () => {
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
    sut = new ProjextRunner();
    // Then
    expect(sut).toBeInstanceOf(ProjextRunner);
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
    sut = new ProjextRunner();
    [[infoServiceName, infoServiceFn]] = set.mock.calls;
    // Then
    expect(sut).toBeInstanceOf(ProjextRunner);
    expect(infoServiceName).toBe('info');
    expect(infoServiceFn()).toEqual(packageInfo);
  });

  it('should create the runner file when a projext target gets build', () => {
    // Given
    const updateRunnerFile = jest.fn();
    const get = jest.fn(() => ({
      listen: () => {},
      update: updateRunnerFile,
    }));
    JimpleMock.mock('get', get);
    const projextEvents = {
      once: jest.fn(),
    };
    const projextProjectConfig = {
      paths: {
        build: 'dist',
      },
    };
    const projextProjectConfiguration = {
      getConfig: jest.fn(() => projextProjectConfig),
    };
    const projextVersion = 'latest';
    const projextBuildVersion = {
      getVersion: jest.fn(() => projextVersion),
    };
    const projext = {
      events: projextEvents,
      projectConfiguration: projextProjectConfiguration,
      buildVersion: projextBuildVersion,
      get: jest.fn((service) => projext[service]),
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
      'buildVersion',
    ];
    // When
    sut = new ProjextRunner();
    sut.plugin(projext);
    [[, eventListener]] = projextEvents.once.mock.calls;
    result = eventListener(commands, target);
    // Then
    expect(projext.get).toHaveBeenCalledTimes(expectedServices.length);
    expectedServices.forEach((service) => {
      expect(projext.get).toHaveBeenCalledWith(service);
    });
    expect(projextEvents.once).toHaveBeenCalledTimes([
      expectedEventName,
      'an-event-for-another test',
      'an-event-for-another test',
    ].length);
    expect(projextEvents.once).toHaveBeenCalledWith(
      expectedEventName,
      expect.any(Function)
    );
    expect(projextProjectConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(projextBuildVersion.getVersion).toHaveBeenCalledTimes(1);
    expect(updateRunnerFile).toHaveBeenCalledTimes(1);
    expect(updateRunnerFile).toHaveBeenCalledWith(
      target,
      projextVersion,
      projextProjectConfig.paths.build
    );
    expect(result).toEqual(commands);
  });

  it('should copy runner file when projext copies the project files', () => {
    // Given
    const runnerFileName = 'projextrunner.json';
    const getRunnerFileName = jest.fn(() => runnerFileName);
    const get = jest.fn(() => ({
      listen: () => {},
      getFilename: getRunnerFileName,
    }));
    JimpleMock.mock('get', get);
    const projextEvents = {
      once: jest.fn(),
    };
    const projext = {
      events: projextEvents,
      get: jest.fn((service) => projext[service]),
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
    sut = new ProjextRunner();
    sut.plugin(projext);
    [, [, eventListener]] = projextEvents.once.mock.calls;
    result = eventListener(items);
    // Then
    expect(projext.get).toHaveBeenCalledTimes(expectedServices.length);
    expectedServices.forEach((service) => {
      expect(projext.get).toHaveBeenCalledWith(service);
    });
    expect(projextEvents.once).toHaveBeenCalledTimes([
      'an-event-for-another test',
      expectedEventName,
      'an-event-for-another test',
    ].length);
    expect(projextEvents.once).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function)
    );
    expect(projextEvents.once).toHaveBeenCalledWith(
      expectedEventName,
      expect.any(Function)
    );
    expect(projextEvents.once).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function)
    );
    expect(getRunnerFileName).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedItems);
  });

  it('should update runner file when projext creates a revision file', () => {
    // Given
    const updateRunnerFileVersion = jest.fn();
    const get = jest.fn(() => ({
      listen: () => {},
      updateVersion: updateRunnerFileVersion,
    }));
    JimpleMock.mock('get', get);
    const projextEvents = {
      once: jest.fn(),
    };
    const projext = {
      events: projextEvents,
      get: jest.fn((service) => projext[service]),
    };
    const version = 'latest';
    let sut = null;
    let eventListener = null;
    const expectedEventName = 'revision-file-created';
    const expectedServices = ['events'];
    // When
    sut = new ProjextRunner();
    sut.plugin(projext);
    [,, [, eventListener]] = projextEvents.once.mock.calls;
    eventListener(version);
    // Then
    expect(projext.get).toHaveBeenCalledTimes(expectedServices.length);
    expectedServices.forEach((service) => {
      expect(projext.get).toHaveBeenCalledWith(service);
    });
    expect(projextEvents.once).toHaveBeenCalledTimes([
      'an-event-for-another test',
      'an-event-for-another test',
      expectedEventName,
    ].length);
    expect(projextEvents.once).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function)
    );
    expect(projextEvents.once).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Function)
    );
    expect(projextEvents.once).toHaveBeenCalledWith(
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
    sut = new ProjextRunner();
    sut.cli();
    // Then
    expect(sut).toBeInstanceOf(ProjextRunner);
    expect(startCLI).toHaveBeenCalledTimes(1);
    expect(startCLI).toHaveBeenCalledWith(expect.any(Array));
  });
});
