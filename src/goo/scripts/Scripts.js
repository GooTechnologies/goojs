var ScriptUtils = require('../scripts/ScriptUtils');
var ObjectUtils = require('../util/ObjectUtils');

// the collection of scripts
var _scripts = {};

// the static class which just holds the following methods
var Scripts = {};

Scripts.register = function (factoryFunction) {
	var key = factoryFunction.externals.key || factoryFunction.externals.name;
	if (_scripts[key]) {
		console.warn('Script already registered for key ' + key);
		return;
	}
	//! AT: this will modify the external object but that's ok
	ScriptUtils.fillDefaultNames(factoryFunction.externals.parameters);
	_scripts[key] = factoryFunction;
};

Scripts.addClass = ObjectUtils.warnOnce(
	'Scripts.addClass is deprecated; please consider using the global goo object instead',
	function (name, klass) {
		// deprecated as of v0.15.3 and scheduled for removal in version 0.17.0
	}
);

Scripts.getClasses = ObjectUtils.warnOnce(
	'Scripts.getClasses is deprecated; please consider using the global goo object instead',
	function () {
		return window.goo;
	}
);

Scripts.getScript = function (key) {
	return _scripts[key];
};

Scripts.create = function (key, options) {
	var factoryFunction;
	if (typeof key === 'string') {
		factoryFunction = _scripts[key];
		if (!factoryFunction) {
			throw new Error('Script "' + key + '" is not registered');
		}
	} else if (typeof key === 'function') {
		factoryFunction = key;
	}

	var script = factoryFunction();
	script.parameters = {};
	script.environment = null;
	script.externals = factoryFunction.externals;

	if (factoryFunction.externals) {
		ScriptUtils.fillDefaultNames(script.externals.parameters);
		ScriptUtils.fillDefaultValues(script.parameters, factoryFunction.externals.parameters);
	}

	if (options) {
		ObjectUtils.extend(script.parameters, options);
	}

	return script;
};

Scripts.allScripts = function () {
	// REVIEW: Why not return _scripts? Document this function.
	var scripts = {};
	var keys = Object.keys(_scripts);
	for (var i = 0; i < keys.length; i++) {
		var key = keys[i];
		scripts[key] = _scripts[key];
	}
	return scripts;
};

module.exports = Scripts;
