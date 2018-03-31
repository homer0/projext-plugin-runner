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

  it('call the method that registers the plugin when projext invokes it', () => {
    // Given
    const registerPlugin = jest.fn();
    const get = jest.fn(() => ({
      registerPlugin,
      listen: () => {},
    }));
    JimpleMock.mock('get', get);
    const projext = 'projext';
    let sut = null;
    // When
    sut = new ProjextRunner();
    sut.plugin(projext);
    expect(registerPlugin).toHaveBeenCalledTimes(1);
    expect(registerPlugin).toHaveBeenCalledWith(projext);
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
