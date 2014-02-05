define([], function () {
	'use script';

	var ScriptUtils = {};

	/**
	 * Fill a passed parameters object with defaults from spec
	 * @private
	 * @param parameters {object} The type of object passed as parameters to a script
	 * @param spec {{key, name, default, description}[]}
	 */
	ScriptUtils.fillDefaultValues = function (parameters, specs) {
		specs.forEach(function (spec) {
			if (typeof parameters[spec.key] === 'undefined') {
				parameters[spec.key] = spec['default'];
			}
		});
	};

	/**
	 * Fills specs' names with their prettyprinted keys (x -> x, maxX -> Max X, myBluePanda -> My Blue Panda)
	 * @private
	 * @param specs {{key, name, default, description}[]}
	 */
	ScriptUtils.fillDefaultNames = function (specs) {
		function getNameFromKey(key) {
			var capitalisedKey = key.toUpperCase(0) + key.substr(1);
			return capitalisedKey.replace(/([A-Z])/g, ' $1');
		}

		specs.forEach(function (spec) {
			if (typeof spec.name === 'undefined') {
				spec.name = getNameFromKey(spec.key);
			}
		});
	};

	return ScriptUtils;
});