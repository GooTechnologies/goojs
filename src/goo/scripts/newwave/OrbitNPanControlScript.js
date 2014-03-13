define([
	'goo/scripts/Scripts',
	'goo/util/ObjectUtil',

	'goo/scripts/newwave/OrbitCamControlScript',
	'goo/scripts/newwave/PanCamScript'
], function(
	Scripts,
	_
) {
	'use strict';
	
	var orbitParams = Scripts.getScript('OrbitCamControlScript').externals.parameters
	var panParams = Scripts.getScript('PanCamControlScript').externals.parameters

	var externals = {
		name: 'OrbitNPanControlScript',
		description: 'This is a combo of orbitcamcontrolscript and pancamcontrolscript',
		parameters:	orbitParams.concat(panParams)
	};

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
			update: update,
			externals: externals
		};
	}
	
	Scripts.register(externals, OrbitNPan)
});