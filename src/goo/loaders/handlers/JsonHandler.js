var ConfigHandler = require('../../loaders/handlers/ConfigHandler');
var PromiseUtils = require('../../util/PromiseUtils');

/**
 * Handler for loading json objects.
 *
 * @param {World} world
 * @param {Function} getConfig
 * @param {Function} updateObject
 *
 * @extends ConfigHandler
 * @private
 */
function JsonHandler() {
	ConfigHandler.apply(this, arguments);
}

JsonHandler.prototype = Object.create(ConfigHandler.prototype);
JsonHandler.prototype.constructor = JsonHandler;
ConfigHandler._registerClass('json', JsonHandler);

/**
 * Adds/updates/removes a json data object.
 *
 * @param {string} ref
 * @param {Object} config
 * @returns {RSVP.Promise} Resolves with the updated shader or null if removed
 */
JsonHandler.prototype._update = function (ref, config) {
	if (!config) {
		this._remove(ref);
		return PromiseUtils.resolve();
	}

	var data;
	try {
		data = JSON.parse(config.body);
	} catch (error) {
		data = {};
	}

	return PromiseUtils.resolve(data)
};

module.exports = JsonHandler;
