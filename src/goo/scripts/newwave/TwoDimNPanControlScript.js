define([
	'goo/scripts/Scripts',
	'goo/scripts/ScriptUtils',
	'goo/scripts/newwave/TwoDimCamControlScript',
	'goo/scripts/newwave/PanCamScript',
	'goo/util/ObjectUtil'
], function(
	Scripts,
	ScriptUtils,
	TwoDimCamControlScript,
	PanCamScript,
	_
) {
	'use strict';

	/**
	 * @class Enables pan and zoom for parallel projection cameras. This is a combo of TwoDimCamControlScript and PanCamControlScript
	 */
	function TwoDimNPanControlScript() {
		var twoDimScript = Scripts.create('TwoDimCamControlScript');
		var panScript = Scripts.create('PanCamControlScript');
		function setup(parameters, environment, goo) {
			twoDimScript.setup(parameters, environment, goo);
			panScript.setup(parameters, environment, goo);
		}
		function update(parameters, environment, goo) {
			twoDimScript.update(parameters, environment, goo);
			panScript.update(parameters, environment, goo);
		}
		function cleanup(parameters, environment, goo) {
			panScript.cleanup(parameters, environment, goo);
			twoDimScript.cleanup(parameters, environment, goo);
		}

		return {
			setup: setup,
			cleanup: cleanup,
			update: update
		};
	}

	var twoDimParams = TwoDimCamControlScript.externals.parameters;
	var panParams = PanCamScript.externals.parameters;

	// Remove one of the "whenUsed" params
	var params = _.deepClone(twoDimParams.concat(panParams.slice(1)));

	// Change defaults for this script
	for (var i = 0; i < params.length; i++) {
		var param = params[i];
		switch (param.key) {
			case 'dragButton':
				param['default'] = 'Left';
				break;
			case 'panButton':
				param['default'] = 'Right';
				break;
			case 'panSpeed':
				param['default'] = 1; // PanSpeed should be 1 in the parallel cam / 2D case
				break;
			case 'screenMove':
				param['default'] = true; // Should use screen movement
				break;
		}
	}

	TwoDimNPanControlScript.externals = {
		name: 'TwoDimNPanControlScript',
		description: 'This is a combo of twodimcamcontrolscript and pancamcontrolscript',
		parameters:	params
	};

	return TwoDimNPanControlScript;
});