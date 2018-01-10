jest.mock('../index', () => ({ plugin: jest.fn() }));
jest.unmock('/src/index');

require('jasmine-expect');

const runner = require('../index');
const plugin = require('/src/index');

describe('plugin:woopackRunner', () => {
  it('should register all the services', () => {
    // Given
    const app = 'woopackApp';
    // When
    plugin(app);
    // Then
    expect(runner.plugin).toHaveBeenCalledTimes(1);
    expect(runner.plugin).toHaveBeenCalledWith(app);
  });
});
