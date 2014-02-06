(function () {
	'use strict';
	var _moduleBank = {};

	window.define = function (nam, dependencies, callback) {
		//! AT: might want to turn these off
		console.log('define', nam);
		dependencies.forEach(function (dependency) {
			if (!_moduleBank[dependency]) {
				console.warn(dependency, 'requested by', nam, 'not declared');
			}
		});
		var resolvedModules = dependencies.map(function (dependency) { return _moduleBank[dependency]; });

		//! AT: weird adaptation for "exports" module required by rsvp
		if (dependencies[0] === "exports") {
			_moduleBank[nam] = {};
			callback(_moduleBank[nam]);
		} else {
			_moduleBank[nam] = callback.apply(null, resolvedModules);
		}
	};

	window.require = function (dependencies) {
		console.log('require');
		dependencies.forEach(function (dependency) {
			if (!_moduleBank[dependency]) {
				console.warn(dependency, 'not declared');
			}
		});
	};
})();