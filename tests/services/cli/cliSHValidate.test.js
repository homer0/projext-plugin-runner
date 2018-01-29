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
    let sut = null;
    // When
    sut = new CLISHValidateCommand(runnerFile, targets);
    // Then
    expect(sut).toBeInstanceOf(CLISHValidateCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.runnerFile).toBe(runnerFile);
    expect(sut.targets).toBe(targets);
    expect(sut.command).not.toBeEmptyString();
    expect(sut.description).not.toBeEmptyString();
    expect(sut.addOption).toHaveBeenCalledTimes(2);
    expect(sut.addOption).toHaveBeenCalledWith(
      'production',
      '-p, --production',
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
      validate: jest.fn(),
      exists: jest.fn(() => runnerFileExists),
    };
    const targets = {
      validate: jest.fn(),
    };
    const target = 'some-target';
    let sut = null;
    // When
    sut = new CLISHValidateCommand(runnerFile, targets);
    sut.handle(target);
    // Then
    expect(runnerFile.validate).toHaveBeenCalledTimes(1);
    expect(runnerFile.exists).toHaveBeenCalledTimes(1);
    expect(targets.validate).toHaveBeenCalledTimes(1);
    expect(targets.validate).toHaveBeenCalledWith(target);
  });

  it('shouldn\'t validate a target if the runner file exists when executed', () => {
    // Given
    const runnerFileExists = false;
    const runnerFile = {
      validate: jest.fn(),
      exists: jest.fn(() => runnerFileExists),
    };
    const targets = {
      validate: jest.fn(),
    };
    const target = 'some-target';
    let sut = null;
    // When
    sut = new CLISHValidateCommand(runnerFile, targets);
    sut.handle(target);
    // Then
    expect(runnerFile.validate).toHaveBeenCalledTimes(1);
    expect(runnerFile.exists).toHaveBeenCalledTimes(1);
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
  });
});
