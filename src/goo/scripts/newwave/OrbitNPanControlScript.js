define([
	'goo/scripts/Scripts',
	'goo/scripts/ScriptUtils',
	'goo/scripts/newwave/OrbitCamControlScript',
	'goo/scripts/newwave/PanCamScript'
], function(
	Scripts,
	ScriptUtils,
	OrbitCamControlScript,
	PanCamScript
) {
	'use strict';

	function OrbitNPan() {
		var orbitScript = Scripts.create('OrbitCamControlScript');
		var panScript = Scripts.create('PanCamControlScript');
		function setup(parameters, environment) {
			orbitScript.setup(parameters, environment);
			panScript.setup(parameters, environment);
		}
		function update(parameters, environment) {
			panScript.update(parameters, environment);
			orbitScript.update(parameters, environment);
		}
		function cleanup(parameters, environment) {
			panScript.cleanup(parameters, environment);
			orbitScript.cleanup(parameters, environment);
		}

		return {
			setup: setup,
			cleanup: cleanup,
			update: update
		};
	}

	var orbitParams = OrbitCamControlScript.externals.parameters;
	var panParams = PanCamScript.externals.parameters;

	var params = orbitParams.concat(panParams.slice(1));
	for (var i = 0; i < params.length; i++) {
		var param = params[i];
		switch (param.key) {
			case 'dragButton':
				param['default'] = 'Left';
				break;
			case 'panButton':
				param['default'] = 'Right';
				break;
		}
	}

	OrbitNPan.externals = {
		name: 'OrbitNPanControlScript',
		description: 'This is a combo of orbitcamcontrolscript and pancamcontrolscript',
		parameters:	params
	};

	return OrbitNPan;
});