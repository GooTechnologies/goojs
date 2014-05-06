define([
	'goo/scripts/Scripts',
	'goo/scripts/ScriptUtils',
	'goo/scripts/OrbitCamControlScript',
	'goo/scripts/PanCamScript'
], function (
	Scripts,
	ScriptUtils,
	OrbitCamControlScript,
	PanCamScript
) {
	'use strict';

	function OrbitNPan() {
		var orbitScript = Scripts.create('OrbitCamControlScript');
		var panScript = Scripts.create('PanCamControlScript');
		function setup(parameters, environment, goo) {
			orbitScript.setup(parameters, environment, goo);
			panScript.setup(parameters, environment, goo);
		}
		function update(parameters, environment, goo) {
			panScript.update(parameters, environment, goo);
			orbitScript.update(parameters, environment, goo);
		}
		function cleanup(parameters, environment, goo) {
			panScript.cleanup(parameters, environment, goo);
			orbitScript.cleanup(parameters, environment, goo);
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
		key: 'OrbitNPanControlScript',
		name: 'OrbitNPanControlScript',
		description: 'This is a combo of orbitcamcontrolscript and pancamcontrolscript',
		parameters:	params
	};

	return OrbitNPan;
});