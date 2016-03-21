var Bus = require('./Bus');

/**
 * SystemBus is a global instance of the {@link Bus} class.
 * @target-class SystemBus SystemBus constructor
 * @require-pathvar SystemBus = require('../../entities/SystemBus');
 * @group entities
 */
module.exports = new Bus();
