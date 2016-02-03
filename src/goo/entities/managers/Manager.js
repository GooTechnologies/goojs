define(
	[],

	function () {
	'use strict';

	/**
	 * @class
	 * @class
	 * Base class for managers.
	 */
	function Manager() {
		this.installedAPI = {};
	}

	Manager.prototype.applyAPI = function (worldBy) {
		var api = this.api;
		for (var key in api) {
			if (typeof worldBy[key] === 'undefined') {
				worldBy[key] = api[key];
				this.installedAPI[key] = true;
			} else {
				console.warn('Could not install method ' + key + ' of ' + this.type + ' as it is already taken');
			}
		}
	};

	return Manager;
});