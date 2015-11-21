var Scripts = require('goo/scripts/Scripts');
var OrbitCamControlScript = require('goo/scripts/OrbitCamControlScript');
var PanCamScript = require('goo/scriptpack/PanCamScript');
var ObjectUtils = require('goo/util/ObjectUtils');

	'use strict';

	function OrbitNPan() {
		var orbitScript = Scripts.create(OrbitCamControlScript);
		var panScript = Scripts.create(PanCamControlScript);
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
	var panParams = PanCamControlScript.externals.parameters;

	// Make sure we don't change parameters for the other scripts
	var params = _.deepClone(orbitParams.concat(panParams.slice(1)));

	// Remove the panSpeed parameter
	for (var i = 0; i < params.length; i++) {
		var param = params[i];
		if (param.key === 'panSpeed') {
			params.splice(i, 1);
			break;
		}
	}

	for (var i = 0; i < params.length; i++) {
		var param = params[i];
		switch (param.key) {
			case 'dragButton':
				param.default = 'Left';
				break;
			case 'panButton':
				param.default = 'Right';
				break;
			case 'panSpeed':
				param.default = 1;
				break;
		}
	}

	OrbitNPan.externals = {
		key: 'OrbitNPanControlScript',
		name: 'Orbit and Pan Control',
		description: 'This is a combo of orbitcamcontrolscript and pancamcontrolscript',
		parameters:	params
	};

	module.exports = OrbitNPan;