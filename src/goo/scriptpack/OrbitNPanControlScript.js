var Scripts = require('../scripts/Scripts');
var OrbitCamControlScript = require('../scripts/OrbitCamControlScript');
var PanCamControlScript = require('../scriptpack/PanCamScript');
var ObjectUtils = require('../util/ObjectUtils');

function OrbitNPan() {
	var orbitScript = Scripts.create(OrbitCamControlScript);
	var panScript = Scripts.create(PanCamControlScript);
	function setup(parameters, environment, goo) {
		parameters.touchMode = 'Double'; // should alaways be 2 touch mode for panning
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
var params = ObjectUtils.deepClone(orbitParams.concat(panParams.slice(1)));

// Remove the panSpeed and touchMode parameters
for (var i = params.length - 1; i >= 0; i--) {
	var param = params[i];
	if (param.key === 'panSpeed' || param.key === 'touchMode') {
		params.splice(i, 1);
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
		case 'touchMode':
			param.default = 'Double';
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