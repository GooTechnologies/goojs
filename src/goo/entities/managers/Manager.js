/**
 * Base class for managers.
 * @param {object} [options]
 * @param {string} [options.type]
 */
function Manager(options) {
	options = options || {};
	
	this.type = options.type;
	this.installedAPI = {};
}

/**
 * Called when an entity was added to the World.
 * @param {Entity} entity
 */
Manager.prototype.added = function (/*entity*/) {};

/**
 * Called when an entity was removed from the World.
 * @param {Entity} entity
 */
Manager.prototype.removed = function (/*entity*/) {};

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