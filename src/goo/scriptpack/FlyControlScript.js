var Scripts = require('../scripts/Scripts');
var WasdControlScript = require('../scriptpack/WasdControlScript');
var MouseLookControlScript = require('../scriptpack/MouseLookControlScript');



	function FlyControlScript() {
		var wasdScript = Scripts.create(WasdControlScript);
		var lookScript = Scripts.create(MouseLookControlScript);

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

	var wasdParams = WasdControlScript.externals.parameters;
	var mouseLookParams = MouseLookControlScript.externals.parameters;
	var params = wasdParams.concat(mouseLookParams.slice(1));

	FlyControlScript.externals = {
		key: 'FlyControlScript',
		name: 'Fly Control',
		description: 'This is a combo of the Wasd script and the MouseLook script',
		parameters: params
	};

	module.exports = FlyControlScript;