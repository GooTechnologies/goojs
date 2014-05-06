define([
	'goo/scripts/Scripts',
	'goo/scripts/WASDControlScript',
	'goo/scripts/MouseLookControlScript'
], function (
	Scripts,
	WASDScript,
	MouseLookControlScript
) {
	'use strict';


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
			update: update
		};
	}

	var wasdParams = WASDScript.externals.parameters;
	var mouseLookParams = MouseLookControlScript.externals.parameters;
	var params = wasdParams.concat(mouseLookParams.slice(1));

	FlyControlScript.externals = {
		key: 'FlyControlScript',
		name: 'FlyControlScript',
		description: 'This is a combo of WASDscript and mouselookscript',
		parameters: params
	};

	return FlyControlScript;
});