define ([
	'goo/scripts/ScriptUtils'
], function (
	ScriptUtils
) {
	'use strict';

	// the collection of scripts
	var _scripts = {};

	// the static class which just holds the following methods
	var Scripts = {};

	Scripts.register = function (externals, cons) {
		//! AT: this will modify the external object but that's ok
		ScriptUtils.fillDefaultNames(externals.parameters);
		_scripts[externals.name] = { externals: externals, cons: cons };
	};

	Scripts.getScript = function (name) {
		return _scripts[name];
	};

	Scripts.create = function (name) {
		return _scripts[name].cons();
	};

	Scripts.allScripts = function () {
		var scripts = {};
		var keys = Object.keys(_scripts);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			scripts[key] = _scripts[key];
		}
		return scripts;
	};

	return Scripts;
});