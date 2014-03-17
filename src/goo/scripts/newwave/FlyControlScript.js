define([
	'goo/scripts/Scripts',

	'goo/scripts/newwave/WASDScript',
	'goo/scripts/newwave/MouseLookScript'
], function(
	Scripts
) {
	'use strict';

	var wasdParams = Scripts.getScript('WASD').externals.parameters;
	var mouseLookParams = Scripts.getScript('MouseLookScript').externals.parameters;
	
	var externals = {
		name: 'FlyControlScript',
		description: 'This is a combo of WASDscript and mouselookscript',
		parameters: wasdParams.concat(mouseLookParams)
	};

	function FlyControlScript() {
		var wasdScript = Scripts.create('WASD');
		var lookScript = Scripts.create('MouseLookScript');
		function setup(parameters, environment) {
			lookScript.setup(parameters, environment);
			wasdScript.setup(parameters, environment);
		}
		function update(parameters, environment) {
			lookScript.update(parameters, environment);
			wasdScript.update(parameters, environment);
		}
		function cleanup(parameters, environment) {
			lookScript.cleanup(parameters, environment);
			wasdScript.cleanup(parameters, environment);
		}

		return {
			setup: setup,
			cleanup: cleanup,
			update: update,
			externals: externals
		};
	}

	Scripts.register(externals, FlyControlScript);

	return FlyControlScript;
});