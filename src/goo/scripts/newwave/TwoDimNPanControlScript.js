define([
	'goo/scripts/Scripts',
	'goo/scripts/ScriptUtils',
	'goo/scripts/newwave/TwoDimCamControlScript',
	'goo/scripts/newwave/PanCamScript',
	'goo/scripts/newwave/AxisAlignedCamControlScript',
	'goo/util/ObjectUtil',
	'goo/entities/SystemBus'
], function(
	Scripts,
	ScriptUtils,
	TwoDimCamControlScript,
	PanCamScript,
	AxisAlignedCamControlScript,
	_,
	SystemBus
) {
	'use strict';

	/**
	 * @class Enables pan and zoom for parallel projection cameras. This is a combo of TwoDimCamControlScript and PanCamControlScript
	 */
	function TwoDimNPanControlScript() {
		var twoDimScript =	Scripts.create('TwoDimCamControlScript');
		var panScript =		Scripts.create('PanCamControlScript');
		var axisScript =	Scripts.create('AxisAlignedCamControlScript');
		function setup(parameters, environment, goo) {
			twoDimScript.setup(parameters, environment, goo);
			panScript.setup(parameters, environment, goo);
			axisScript.setup(parameters, environment, goo);
		}
		function update(parameters, environment, goo) {
			twoDimScript.update(parameters, environment, goo);
			panScript.update(parameters, environment, goo);
			axisScript.update(parameters, environment, goo);
		}
		function cleanup(parameters, environment, goo) {
			panScript.cleanup(parameters, environment, goo);
			twoDimScript.cleanup(parameters, environment, goo);
			axisScript.cleanup(parameters, environment, goo);
		}

		return {
			setup: setup,
			cleanup: cleanup,
			update: update
		};
	}

	var twoDimParams = TwoDimCamControlScript.externals.parameters;
	var panParams = PanCamScript.externals.parameters;
	var axisParams = AxisAlignedCamControlScript.externals.parameters;

	// Remove one of the "whenUsed" params
	var params = _.deepClone(twoDimParams.concat(panParams.slice(1)).concat(axisParams.slice(1)));

	// Change defaults for this script
	for (var i = 0; i < params.length; i++) {
		var param = params[i];
		switch (param.key) {
			// REVIEW Default should probably be left, then override in create
			// ----> Whyyyy
			case 'panButton':
				param['default'] = 'Middle';
				break;
			case 'panSpeed':
				param['default'] = 1; // PanSpeed should be 1 in the parallel cam / 2D case
				break;
			case 'screenMove':
				// REVIEW Remove? No..
				param['default'] = true; // Should use screen movement - map mouse movement in the near plane 1-1 to the camera position
				break;
		}
	}

	TwoDimNPanControlScript.externals = {
		name: 'TwoDimNPanControlScript',
		description: 'This is a combo of TwoDimCamControlScript, PanCamControlScript and AxisAlignedCamControlScript',
		parameters:	params
	};

	return TwoDimNPanControlScript;
});