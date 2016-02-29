define([], function () {
	'use strict';

	/**
	 * Variable instance for the state machine and system
	 * @param {object} [options]
	 * @param {string} [options.id]
	 * @param {string} [options.type]
	 * @param {*} [options.value]
	 */
	function Variable(options) {
		options = options || {};
		this.id = options.id !== undefined ? options.id : null;
		this.type = options.type !== undefined ? options.type : 'float';
		this.value = options.value !== undefined ? options.value : 0;
	}

	return Variable;
});