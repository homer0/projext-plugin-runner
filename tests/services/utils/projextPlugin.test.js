const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('fs-extra');
jest.unmock('/src/services/utils/projextPlugin');

require('jasmine-expect');
const {
  ProjextPlugin,
  projextPlugin,
} = require('/src/services/utils/projextPlugin');

describe('services/utils:projextPlugin', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should be instantiated with all its dependencies', () => {
    // Given
    jest.mock('projext', () => ({}));
    const info = {
      name: 'projext-runner',
    };
    const runnerFile = 'runnerFile';
    let sut = null;
    // When
    sut = new ProjextPlugin(info, runnerFile);
    // Then
    expect(sut).toBeInstanceOf(ProjextPlugin);
    expect(sut.pluginName).toBe(info.name);
    expect(sut.runnerFile).toBe(runnerFile);
  });

  it('should be validate that projext is installed', () => {
    // Given
    jest.mock('projext', () => ({}));
    const info = {
      name: 'projext-runner',
    };
    const runnerFile = 'runnerFile';
    let sut = null;
    let result = null;
    // When
    sut = new ProjextPlugin(info, runnerFile);
    result = sut.isInstalled();
    // Then
    expect(result).toBeTrue();
  });

  it('should be validate that projext is installed', () => {
    // Given
    jest.mock('projext', () => {
      throw new Error();
    });
    const info = {
      name: 'projext-runner',
    };
    const runnerFile = 'runnerFile';
    let sut = null;
    let result = null;
    // When
    sut = new ProjextPlugin(info, runnerFile);
    result = sut.isInstalled();
    // Then
    expect(result).toBeFalse();
  });

  it('should register the necessary events for the plugin to work', () => {
    // Given
    jest.mock('projext', () => ({}));
    const info = {
      name: 'projext-runner',
    };
    const runnerFile = 'runnerFile';
    const events = {
      once: jest.fn(),
    };
    const instanceServices = {
      events,
    };
    const instance = {
      get: jest.fn((service) => instanceServices[service]),
    };
    let sut = null;
    const expectedEvents = [
      'build-target-commands-list',
      'project-files-to-copy',
      'revision-file-created',
    ];
    // When
    sut = new ProjextPlugin(info, runnerFile);
    sut.registerPlugin(instance);
    // Then
    expect(instance.get).toHaveBeenCalledTimes(1);
    expect(instance.get).toHaveBeenCalledWith('events');
    expect(events.once).toHaveBeenCalledTimes(expectedEvents.length);
    expectedEvents.forEach((eventName) => {
      expect(events.once).toHaveBeenCalledWith(eventName, expect.any(Function));
    });
  });

  it('should update a target information on the runner file when it gets built', () => {
    // Given
    jest.mock('projext', () => ({}));
    const info = {
      name: 'projext-runner',
    };
    const target = {
      name: 'charito',
      options: {},
    };
    const runnerFile = {
      update: jest.fn(() => target),
    };
    const configuration = {
      paths: {
        build: 'some/path',
      },
    };
    const projectConfiguration = {
      getConfig: jest.fn(() => configuration),
    };
    const version = 'gamma';
    const buildVersion = {
      getVersion: jest.fn(() => version),
    };
    const events = {
      once: jest.fn(),
    };
    const instanceServices = {
      events,
      projectConfiguration,
      buildVersion,
    };
    const instance = {
      get: jest.fn((service) => instanceServices[service]),
    };
    const commands = ['Charito', 'Maru'];
    const options = {};
    const unknownOptions = {};
    let sut = null;
    let listener = null;
    let result = null;
    // When
    sut = new ProjextPlugin(info, runnerFile);
    sut.registerPlugin(instance);
    [[, listener]] = events.once.mock.calls;
    result = listener(commands, target, options, unknownOptions);
    // Then
    expect(result).toEqual(commands);
    expect(projectConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(buildVersion.getVersion).toHaveBeenCalledTimes(1);
    expect(runnerFile.update).toHaveBeenCalledTimes(1);
    expect(runnerFile.update).toHaveBeenCalledWith(
      target,
      version,
      configuration.paths.build
    );
  });

  it('should inject commands for a single target that need to be built before running', () => {
    // Given
    jest.mock('projext', () => ({}));
    const info = {
      name: 'projext-runner',
    };
    const requiredTarget = 'targetOne';
    const target = {
      name: 'charito',
      options: {
        build: requiredTarget,
      },
    };
    const runnerFile = {
      update: jest.fn(() => target),
    };
    const configuration = {
      paths: {
        build: 'some/path',
      },
    };
    const projectConfiguration = {
      getConfig: jest.fn(() => configuration),
    };
    const version = 'gamma';
    const buildVersion = {
      getVersion: jest.fn(() => version),
    };
    const events = {
      once: jest.fn(),
    };
    const cli = {
      name: 'projext',
    };
    const command = 'run projext run';
    const cliBuildCommand = {
      generate: jest.fn((data) => `${command} ${data.target}`),
    };
    const instanceServices = {
      events,
      projectConfiguration,
      buildVersion,
      cli,
      cliBuildCommand,
    };
    const instance = {
      get: jest.fn((service) => instanceServices[service]),
    };
    const commands = ['Charito', 'Maru'];
    const options = {
      type: 'production',
    };
    const unknownOptions = {
      plugin: info.name,
    };
    let sut = null;
    let listener = null;
    let result = null;
    const expectedCommands = [
      `${cli.name} ${command} ${requiredTarget}`,
      ...commands,
    ];
    // When
    sut = new ProjextPlugin(info, runnerFile);
    sut.registerPlugin(instance);
    [[, listener]] = events.once.mock.calls;
    result = listener(commands, target, options, unknownOptions);
    // Then
    expect(result).toEqual(expectedCommands);
    expect(projectConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(buildVersion.getVersion).toHaveBeenCalledTimes(1);
    expect(runnerFile.update).toHaveBeenCalledTimes(1);
    expect(runnerFile.update).toHaveBeenCalledWith(
      target,
      version,
      configuration.paths.build
    );
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledWith(Object.assign(
      {
        plugin: info.name,
        target: requiredTarget,
      },
      options,
      unknownOptions
    ));
  });

  it('should inject commands for a list of targets that need to be built before running', () => {
    // Given
    jest.mock('projext', () => ({}));
    const info = {
      name: 'projext-runner',
    };
    const target = {
      name: 'charito',
      options: {
        build: ['targetOne', 'targetTwo'],
      },
    };
    const runnerFile = {
      update: jest.fn(() => target),
    };
    const configuration = {
      paths: {
        build: 'some/path',
      },
    };
    const projectConfiguration = {
      getConfig: jest.fn(() => configuration),
    };
    const version = 'gamma';
    const buildVersion = {
      getVersion: jest.fn(() => version),
    };
    const events = {
      once: jest.fn(),
    };
    const cli = {
      name: 'projext',
    };
    const command = 'run projext run';
    const cliBuildCommand = {
      generate: jest.fn((data) => `${command} ${data.target}`),
    };
    const instanceServices = {
      events,
      projectConfiguration,
      buildVersion,
      cli,
      cliBuildCommand,
    };
    const instance = {
      get: jest.fn((service) => instanceServices[service]),
    };
    const commands = ['Charito', 'Maru'];
    const options = {
      type: 'production',
    };
    const unknownOptions = {
      plugin: info.name,
    };
    let sut = null;
    let listener = null;
    let result = null;
    const expectedCommands = [
      ...target.options.build.map((name) => `${cli.name} ${command} ${name}`),
      ...commands,
    ];
    // When
    sut = new ProjextPlugin(info, runnerFile);
    sut.registerPlugin(instance);
    [[, listener]] = events.once.mock.calls;
    result = listener(commands, target, options, unknownOptions);
    // Then
    expect(result).toEqual(expectedCommands);
    expect(projectConfiguration.getConfig).toHaveBeenCalledTimes(1);
    expect(buildVersion.getVersion).toHaveBeenCalledTimes(1);
    expect(runnerFile.update).toHaveBeenCalledTimes(1);
    expect(runnerFile.update).toHaveBeenCalledWith(
      target,
      version,
      configuration.paths.build
    );
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(target.options.build.length);
    target.options.build.forEach((name) => {
      expect(cliBuildCommand.generate).toHaveBeenCalledWith(Object.assign(
        {
          plugin: info.name,
          target: name,
        },
        options,
        unknownOptions
      ));
    });
  });

  it('should add the runner file to the list of files projext copies', () => {
    // Given
    jest.mock('projext', () => ({}));
    const info = {
      name: 'projext-runner',
    };
    const runnerFilename = 'runner-file';
    const runnerFile = {
      getFilename: jest.fn(() => runnerFilename),
    };
    const events = {
      once: jest.fn(),
    };
    const instanceServices = {
      events,
    };
    const instance = {
      get: jest.fn((service) => instanceServices[service]),
    };
    const list = ['Charito', 'Maru'];
    let sut = null;
    let listener = null;
    let result = null;
    // When
    sut = new ProjextPlugin(info, runnerFile);
    sut.registerPlugin(instance);
    [, [, listener]] = events.once.mock.calls;
    result = listener(list);
    // Then
    expect(result).toEqual([
      ...list,
      runnerFilename,
    ]);
    expect(runnerFile.getFilename).toHaveBeenCalledTimes(1);
  });

  it('should update the runner file version when the revision file is created', () => {
    // Given
    jest.mock('projext', () => ({}));
    const info = {
      name: 'projext-runner',
    };
    const runnerFile = {
      updateVersion: jest.fn(),
    };
    const events = {
      once: jest.fn(),
    };
    const instanceServices = {
      events,
    };
    const instance = {
      get: jest.fn((service) => instanceServices[service]),
    };
    const version = 'gamma';
    let sut = null;
    let listener = null;
    // When
    sut = new ProjextPlugin(info, runnerFile);
    sut.registerPlugin(instance);
    [,, [, listener]] = events.once.mock.calls;
    listener(version);
    // Then
    expect(runnerFile.updateVersion).toHaveBeenCalledTimes(1);
    expect(runnerFile.updateVersion).toHaveBeenCalledWith(version);
  });

  it('should throw an error when trying to access a projext service without an instance', () => {
    // Given
    jest.mock('projext', () => ({}));
    const info = {
      name: 'projext-runner',
    };
    const runnerFile = 'runnerFile';
    let sut = null;
    // When
    sut = new ProjextPlugin(info, runnerFile);
    // Then
    expect(() => sut.registerPlugin())
    .toThrow(/You can't access projext services if the plugin is not installed/i);
  });

  it('should return the build command', () => {
    // Given
    jest.mock('projext', () => ({}));
    const info = {
      name: 'projext-runner',
    };
    const runnerFile = 'runnerFile';
    const cli = {
      name: 'projext',
    };
    const command = 'run projext run';
    const cliBuildCommand = {
      generate: jest.fn(() => command),
    };
    const instanceServices = {
      cli,
      cliBuildCommand,
    };
    const instance = {
      get: jest.fn((service) => instanceServices[service]),
    };
    jest.mock('projext/index', () => instance);
    const args = {};
    let sut = null;
    let result = null;
    const expectedServices = Object.keys(instanceServices);
    // When
    sut = new ProjextPlugin(info, runnerFile);
    result = sut.getBuildCommand(args);
    // Then
    expect(result).toBe(`${cli.name} ${command}`);
    expect(instance.get).toHaveBeenCalledTimes(expectedServices.length);
    expectedServices.forEach((serviceName) => {
      expect(instance.get).toHaveBeenCalledWith(serviceName);
    });
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledWith({
      plugin: info.name,
      target: '',
    });
  });

  it('should return the build command with environment variables', () => {
    // Given
    jest.mock('projext', () => ({}));
    const info = {
      name: 'projext-runner',
    };
    const runnerFile = 'runnerFile';
    const cli = {
      name: 'projext',
    };
    const command = 'run projext run';
    const cliBuildCommand = {
      generate: jest.fn(() => command),
    };
    const instanceServices = {
      cli,
      cliBuildCommand,
    };
    const instance = {
      get: jest.fn((service) => instanceServices[service]),
    };
    jest.mock('projext/index', () => instance);
    const args = {};
    const environmentVariables = 'NAME=CHARITO';
    let sut = null;
    let result = null;
    const expectedServices = Object.keys(instanceServices);
    // When
    sut = new ProjextPlugin(info, runnerFile);
    result = sut.getBuildCommand(args, environmentVariables);
    // Then
    expect(result).toBe(`${environmentVariables} ${cli.name} ${command}`);
    expect(instance.get).toHaveBeenCalledTimes(expectedServices.length);
    expectedServices.forEach((serviceName) => {
      expect(instance.get).toHaveBeenCalledWith(serviceName);
    });
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledWith({
      plugin: info.name,
      target: '',
    });
  });

  it('should throw an error when trying to generate a build command without projext', () => {
    // Given
    jest.mock('projext', () => ({}));
    const info = {
      name: 'projext-runner',
    };
    const runnerFile = 'runnerFile';
    jest.mock('projext/index', () => {
      throw new Error();
    });
    let sut = null;
    // When
    sut = new ProjextPlugin(info, runnerFile);
    // Then
    expect(() => sut.getBuildCommand())
    .toThrow(/You can't generate a build command if projext is not installed/i);
  });

  it('should return the build command for a target', () => {
    // Given
    jest.mock('projext', () => ({}));
    const info = {
      name: 'projext-runner',
    };
    const runnerFile = 'runnerFile';
    const cli = {
      name: 'projext',
    };
    const command = 'run projext run';
    const cliBuildCommand = {
      generate: jest.fn(() => command),
    };
    const instanceServices = {
      cli,
      cliBuildCommand,
    };
    const instance = {
      get: jest.fn((service) => instanceServices[service]),
    };
    jest.mock('projext/index', () => instance);
    const target = 'my-target';
    let sut = null;
    let result = null;
    const expectedServices = Object.keys(instanceServices);
    // When
    sut = new ProjextPlugin(info, runnerFile);
    result = sut.getBuildCommandForTarget(target);
    // Then
    expect(result).toEqual([`${cli.name} ${command}`]);
    expect(instance.get).toHaveBeenCalledTimes(expectedServices.length);
    expectedServices.forEach((serviceName) => {
      expect(instance.get).toHaveBeenCalledWith(serviceName);
    });
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(1);
    expect(cliBuildCommand.generate).toHaveBeenCalledWith({
      plugin: info.name,
      target,
    });
  });

  it('should return the build command for a list of targets', () => {
    // Given
    jest.mock('projext', () => ({}));
    const info = {
      name: 'projext-runner',
    };
    const runnerFile = 'runnerFile';
    const cli = {
      name: 'projext',
    };
    const command = 'run projext run';
    const cliBuildCommand = {
      generate: jest.fn((data) => `${command} ${data.target}`),
    };
    const instanceServices = {
      cli,
      cliBuildCommand,
    };
    const instance = {
      get: jest.fn((service) => instanceServices[service]),
    };
    jest.mock('projext/index', () => instance);
    const targets = [
      'targetOne',
      'targetTwo',
    ];
    const args = {
      type: 'development',
    };
    const environmentVariables = 'NAME=CHARITO';
    let sut = null;
    let result = null;
    // When
    sut = new ProjextPlugin(info, runnerFile);
    result = sut.getBuildCommandForTarget(targets, args, environmentVariables);
    // Then
    expect(result).toBeArrayOfSize(targets.length);
    expect(cliBuildCommand.generate).toHaveBeenCalledTimes(targets.length);
    targets.forEach((name, index) => {
      expect(result[index]).toBe(`${environmentVariables} ${cli.name} ${command} ${name}`);
      expect(cliBuildCommand.generate).toHaveBeenCalledWith(Object.assign(
        {
          plugin: info.name,
          target: name,
        },
        args
      ));
    });
  });

  it('should include a provider for the DIC', () => {
    // Given
    const info = {
      name: 'projext-runner',
    };
    const services = {
      info,
    };
    let sut = null;
    const container = {
      set: jest.fn(),
      get: jest.fn((service) => services[service] || service),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    projextPlugin(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    sut = serviceFn();
    // Then
    expect(serviceName).toBe('projextPlugin');
    expect(serviceFn).toBeFunction();
    expect(sut).toBeInstanceOf(ProjextPlugin);
    expect(sut.pluginName).toBe(info.name);
    expect(sut.runnerFile).toBe('runnerFile');
  });
});
