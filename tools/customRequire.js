(function () {
	'use strict';

	var _moduleBank = {};

	function define(nam, dependencies, callback) {
		var resolvedModules;
		if (callback instanceof Function) {
			dependencies.forEach(function (dependency) {
				if (!_moduleBank[dependency] && dependency !== 'exports') {
					console.warn(dependency, 'requested by', nam, 'was not declared');
				}
			});
			resolvedModules = dependencies.map(function (dependency) {
				return _moduleBank[dependency];
			});
		} else {
			resolvedModules = [];
			callback = dependencies;
		}

		if (dependencies[0] === "exports") {
			_moduleBank[nam] = {};
			callback(_moduleBank[nam]);
		} else {
			_moduleBank[nam] = callback.apply(null, resolvedModules);
		}
	}

	function require(dependencies, callback) {
		dependencies.forEach(function (dependency) {
			if (!_moduleBank[dependency]) {
				console.warn(dependency, 'was not declared');
			}
		});
		var resolvedModules = dependencies.map(function (dependency) {
			return _moduleBank[dependency];
		});

		callback.apply(null, resolvedModules);
	}

	window.goo = window.goo || {};
	goo.define = define;
	goo.require = require;
})();