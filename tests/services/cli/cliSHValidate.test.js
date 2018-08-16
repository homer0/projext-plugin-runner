const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/abstracts/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHValidate');

require('jasmine-expect');
const {
  CLISHValidateCommand,
  cliSHValidateCommand,
} = require('/src/services/cli/cliSHValidate');

describe('services/cli:sh-validate', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const runnerFile = 'runnerFile';
    const targets = 'targets';
    const projextPlugin = 'projextPlugin';
    let sut = null;
    // When
    sut = new CLISHValidateCommand(runnerFile, targets, projextPlugin);
    // Then
    expect(sut).toBeInstanceOf(CLISHValidateCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.runnerFile).toBe(runnerFile);
    expect(sut.targets).toBe(targets);
    expect(sut.projextPlugin).toBe(projextPlugin);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.addOption).toHaveBeenCalledTimes(3);
    expect(sut.addOption).toHaveBeenCalledWith(
      'production',
      '-p, --production',
      expect.any(String),
      false
    );
    expect(sut.addOption).toHaveBeenCalledWith(
      'inspect',
      '-i, --inspect',
      expect.any(String),
      false
    );
    expect(sut.addOption).toHaveBeenCalledWith(
      'ready',
      '-r, --ready',
      expect.any(String),
      false
    );
    expect(sut.hidden).toBeTrue();
  });

  it('should validate a target if the runner file exists when executed', () => {
    // Given
    const runnerFileExists = true;
    const runnerFile = {
      exists: jest.fn(() => runnerFileExists),
    };
    const targets = {
      validate: jest.fn(),
    };
    const projextInstalled = true;
    const projextPlugin = {
      isInstalled: jest.fn(() => projextInstalled),
    };
    const target = 'some-target';
    let sut = null;
    // When
    sut = new CLISHValidateCommand(runnerFile, targets, projextPlugin);
    sut.handle(target);
    // Then
    expect(runnerFile.exists).toHaveBeenCalledTimes(1);
    expect(projextPlugin.isInstalled).toHaveBeenCalledTimes(1);
    expect(targets.validate).toHaveBeenCalledTimes(1);
    expect(targets.validate).toHaveBeenCalledWith(target);
  });

  it('should throw an error if projext is not present and the runner file doesn\'t exist', () => {
    // Given
    const runnerFileExists = false;
    const runnerFile = {
      exists: jest.fn(() => runnerFileExists),
    };
    const targets = {
      validate: jest.fn(),
    };
    const projextInstalled = false;
    const projextPlugin = {
      isInstalled: jest.fn(() => projextInstalled),
    };
    const target = 'some-target';
    let sut = null;
    // When
    sut = new CLISHValidateCommand(runnerFile, targets, projextPlugin);
    // Then
    expect(() => sut.handle(target))
    .toThrow(/The runner file doesn't exist and projext is not present/i);
    expect(runnerFile.exists).toHaveBeenCalledTimes(1);
    expect(projextPlugin.isInstalled).toHaveBeenCalledTimes(1);
    expect(targets.validate).toHaveBeenCalledTimes(0);
  });

  it('shouldn\'t validate a target if the runner file exists but projext is present', () => {
    // Given
    const runnerFileExists = false;
    const runnerFile = {
      exists: jest.fn(() => runnerFileExists),
    };
    const targets = {
      validate: jest.fn(),
    };
    const projextInstalled = true;
    const projextPlugin = {
      isInstalled: jest.fn(() => projextInstalled),
    };
    const target = 'some-target';
    let sut = null;
    // When
    sut = new CLISHValidateCommand(runnerFile, targets, projextPlugin);
    sut.handle(target);
    // Then
    expect(runnerFile.exists).toHaveBeenCalledTimes(1);
    expect(projextPlugin.isInstalled).toHaveBeenCalledTimes(1);
    expect(targets.validate).toHaveBeenCalledTimes(0);
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
    cliSHValidateCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHValidateCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHValidateCommand);
    expect(sut.runnerFile).toBe('runnerFile');
    expect(sut.targets).toBe('targets');
    expect(sut.projextPlugin).toBe('projextPlugin');
  });
});
