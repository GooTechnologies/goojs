/**
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
			throw new Error('Could not install method ' + key + ' of ' + this.type + ' as it is already taken');
		}
	}
};

module.exports = Manager;