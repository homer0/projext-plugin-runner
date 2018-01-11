const JimpleMock = require('/tests/mocks/jimple.mock');
const CLICommandMock = require('/tests/mocks/cliCommand.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('/src/interfaces/cliCommand', () => CLICommandMock);
jest.unmock('/src/services/cli/cliSHRun');

require('jasmine-expect');
const {
  CLISHRunCommand,
  cliSHRunCommand,
} = require('/src/services/cli/cliSHRun');

describe('services/cli:sh-run', () => {
  beforeEach(() => {
    CLICommandMock.reset();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    const runner = 'runner';
    let sut = null;
    // When
    sut = new CLISHRunCommand(runner);
    // Then
    expect(sut).toBeInstanceOf(CLISHRunCommand);
    expect(sut.constructorMock).toHaveBeenCalledTimes(1);
    expect(sut.runner).toBe(runner);
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

  it('should return the command to run a target when executed', () => {
    // Given
    const target = 'some-target';
    const runCommand = 'run';
    const runner = {
      getCommands: jest.fn(() => runCommand),
    };
    const production = false;
    const ready = false;
    let sut = null;
    // When
    sut = new CLISHRunCommand(runner);
    sut.handle(target, null, { production, ready });
    // Then
    expect(runner.getCommands).toHaveBeenCalledTimes(1);
    expect(runner.getCommands).toHaveBeenCalledWith(
      target,
      production,
      expect.any(String)
    );
    expect(sut.output).toHaveBeenCalledTimes(1);
    expect(sut.output).toHaveBeenCalledWith(runCommand);
  });

  it('should return the command to run a builded target when executed', () => {
    // Given
    const target = 'some-target';
    const runCommand = 'run';
    const runner = {
      getPluginCommandsForProduction: jest.fn(() => runCommand),
    };
    const production = false;
    const ready = true;
    let sut = null;
    // When
    sut = new CLISHRunCommand(runner);
    sut.handle(target, null, { production, ready });
    // Then
    expect(runner.getPluginCommandsForProduction).toHaveBeenCalledTimes(1);
    expect(runner.getPluginCommandsForProduction).toHaveBeenCalledWith(target);
    expect(sut.output).toHaveBeenCalledTimes(1);
    expect(sut.output).toHaveBeenCalledWith(runCommand);
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
    cliSHRunCommand(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('cliSHRunCommand');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(CLISHRunCommand);
    expect(sut.runner).toBe('runner');
  });
});
