(function () {
	'use strict';
	if (!window.define) {
		var _moduleBank = {};

		window.define = function (nam, dependencies, callback) {
			//! AT: might want to turn these off
			console.log('define', nam);
			var resolvedModules;
			if (callback instanceof Function) {
				dependencies.forEach(function (dependency) {
					if (!_moduleBank[dependency]) {
						console.warn(dependency, 'requested by', nam, 'not declared');
					}
				});
				resolvedModules = dependencies.map(function (dependency) { return _moduleBank[dependency]; });
			} else {
				resolvedModules = [];
				callback = dependencies;
			}

			//! AT: weird adaptation for "exports" module required by rsvp
			if (dependencies[0] === "exports") {
				_moduleBank[nam] = {};
				callback(_moduleBank[nam]);
			} else {
				_moduleBank[nam] = callback.apply(null, resolvedModules);
			}
		};

		window.require = function (dependencies, callback) {
			console.log('require');
			var resolvedModules = dependencies.forEach(function (dependency) {
				if (!_moduleBank[dependency]) {
					console.warn(dependency, 'not declared');
				}
			});
			callback.apply(null, resolvedModules);
		};
	}
})();