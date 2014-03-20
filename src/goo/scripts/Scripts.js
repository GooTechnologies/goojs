define ([
	'goo/scripts/ScriptUtils',
	//'goo/scripts/NewWaveFPCamControlScript',
	'goo/scripts/NewWaveRotationScript'
], function (ScriptUtils) {
	'use strict';

	var _scripts = {};

	var Scripts = {};

	Scripts.register = function (external, cons) {
		//! AT: this will modify the external object but that's ok
		ScriptUtils.fillDefaultNames(external.parameters);
		_scripts[external.name] = { external: external, cons: cons };
	};

	Scripts.getScript = function (name) {
		return _scripts[name];
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

	/* //! AT: scripts register themselves
	function registerAll (args) {
		var actionsStartIndex = 0;
		for (var i = actionsStartIndex; i < args.length; i++) {
			var arg = args[i];
			Scripts.register(arg.external.name, arg);
		}
	}

	registerAll(arguments);
	*/

	return Scripts;
})