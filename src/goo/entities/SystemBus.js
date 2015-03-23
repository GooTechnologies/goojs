define([
	'goo/entities/Bus'
], function (
	Bus
) {
	'use strict';

	/**
	 * SystemBus is a global instance of the {@link Bus} class.
	 * @target-class SystemBus SystemBus constructor
	 * @require-path goo/entities/SystemBus
	 * @group entities
	 */
	return new Bus();
});
